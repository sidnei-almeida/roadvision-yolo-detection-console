import { SAMPLE_IMAGES } from '../data/sampleImages';
import { getDetectionSummary } from '../utils/detectionSummary';
import { mapApiDetections, mapApiMetadata } from '../utils/detectionMapper';
import { prepareImageForPredict } from '../utils/imageProcessing';

const DEFAULT_API_URL = 'https://inelialmeida-roadsign-detection-yl.hf.space';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL;
const LOG_PREFIX = '[RoadVision API]';

const HEALTH_TIMEOUT = 12000;
const HEALTH_RETRIES = 2;
const HEALTH_RETRY_DELAY_MS = 1000;
const METADATA_TIMEOUT = 15000;
const PREDICT_TIMEOUT = 120000;

function apiLog(level, message, details) {
  const fn = console[level] || console.log;
  if (details !== undefined) {
    fn(`${LOG_PREFIX} ${message}`, details);
  } else {
    fn(`${LOG_PREFIX} ${message}`);
  }
}

function getRequestOrigin(url) {
  try {
    return new URL(url, window.location.origin).origin;
  } catch {
    return 'unknown';
  }
}

function isCrossOriginRequest(url) {
  return getRequestOrigin(url) !== window.location.origin;
}

function describeFetchError(error, url, method) {
  const crossOrigin = isCrossOriginRequest(url);
  const base = {
    method,
    url,
    crossOrigin,
    pageOrigin: window.location.origin,
    errorName: error?.name,
    errorMessage: error?.message,
  };

  if (error?.name === 'AbortError') {
    return {
      ...base,
      likelyCause: 'timeout',
      hint: 'A requisição excedeu o tempo limite. No HF Space / Render, cold start ou inferência CPU podem levar dezenas de segundos.',
    };
  }

  if (error instanceof TypeError) {
    const msg = (error.message || '').toLowerCase();
    const looksLikeCors =
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('load failed') ||
      msg.includes('network request failed');

    if (looksLikeCors && crossOrigin) {
      return {
        ...base,
        likelyCause: 'cors',
        hint:
          'Bloqueio CORS: o HF Space precisa permitir a origem do frontend. ' +
          'Verifique CORS_ORIGINS no backend ou se o Space está online.',
      };
    }

    if (looksLikeCors) {
      return {
        ...base,
        likelyCause: 'network',
        hint:
          'Falha de rede ou HF Space inacessível/offline. Teste a URL em VITE_API_BASE_URL no browser.',
      };
    }
  }

  return {
    ...base,
    likelyCause: 'unknown',
    hint: 'Erro inesperado na requisição. Veja o stack trace abaixo.',
  };
}

apiLog('info', 'Configuração inicial (direto, sem proxy)', {
  baseUrl: API_BASE_URL,
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  pageOrigin: typeof window !== 'undefined' ? window.location.origin : 'ssr',
  crossOrigin: typeof window !== 'undefined' ? isCrossOriginRequest(API_BASE_URL) : false,
});

export class ApiError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'ApiError';
    this.cause = cause;
  }
}

class PredictCancelledError extends Error {
  constructor() {
    super('Predict superseded by a newer request');
    this.name = 'PredictCancelledError';
  }
}

let activePredictAbort = null;

async function fetchWithTimeout(url, options = {}, timeout = 10000, externalSignal = null) {
  const safeOptions = options && typeof options === 'object' ? options : {};
  const safeTimeout = Number.isFinite(timeout) && timeout > 0 ? timeout : 10000;
  const method = safeOptions.method || 'GET';
  const controller = new AbortController();
  const onExternalAbort = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }

  const timer = setTimeout(() => controller.abort(), safeTimeout);
  const startedAt = performance.now();

  apiLog('debug', `→ ${method} ${url}`, {
    timeoutMs: safeTimeout,
    crossOrigin: isCrossOriginRequest(url),
  });

  try {
    const response = await fetch(url, { ...safeOptions, signal: controller.signal });
    const elapsedMs = Math.round(performance.now() - startedAt);

    apiLog(response.ok ? 'debug' : 'warn', `← ${method} ${url} [${response.status}] (${elapsedMs}ms)`, {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
    });

    return response;
  } catch (error) {
    const elapsedMs = Math.round(performance.now() - startedAt);
    const diagnosis = describeFetchError(error, url, method);

    apiLog('error', `✗ ${method} ${url} falhou (${elapsedMs}ms)`, diagnosis);
    console.error(`${LOG_PREFIX} Stack:`, error);

    throw error;
  } finally {
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
  }
}

function resolveProcessingTime(serverInferenceMs, roundTripMs) {
  const server = Math.round(serverInferenceMs || 0);
  const roundTrip = Math.round(roundTripMs || 0);

  // Servidor antigo incluía tempo de fila no inference_time_ms — não exibir 60s+ inflados
  if (server > 15000 || (roundTrip > 0 && server > roundTrip * 1.5)) {
    return roundTrip || server;
  }

  return server || roundTrip;
}

function parsePredictResponse(data, imageUrl, timing = {}) {
  const imageWidth = data.image_width || 1;
  const imageHeight = data.image_height || 1;
  const detections = mapApiDetections(data.detections, imageWidth, imageHeight);
  const serverInferenceMs = Math.round(data.inference_time_ms || data.processing_time_ms || 0);
  const processingTime = resolveProcessingTime(serverInferenceMs, timing.roundTripMs);

  return {
    imageUrl,
    detections,
    summary: getDetectionSummary(detections, processingTime),
    processingTime,
    serverInferenceMs,
    roundTripMs: timing.roundTripMs,
    imageWidth,
    imageHeight,
    annotatedImage: data.annotated_image_base64
      ? `data:image/jpeg;base64,${data.annotated_image_base64}`
      : null,
  };
}

const PREDICT_IMAGE_SIZE = Number(import.meta.env.VITE_API_IMAGE_SIZE) || 416;

async function callPredictApi(file) {
  activePredictAbort?.abort();
  const requestAbort = new AbortController();
  activePredictAbort = requestAbort;

  const prepStartedAt = performance.now();
  const preparedFile = await prepareImageForPredict(file, PREDICT_IMAGE_SIZE);
  const prepMs = Math.round(performance.now() - prepStartedAt);

  const formData = new FormData();
  formData.append('file', preparedFile);
  const params = new URLSearchParams({
    image_size: String(PREDICT_IMAGE_SIZE),
    conf_threshold: '0.25',
  });
  const predictUrl = `${API_BASE_URL}/predict?${params.toString()}`;

  apiLog('info', 'Enviando POST /predict agora', {
    fileName: preparedFile.name,
    originalSizeKb: Math.round(file.size / 1024),
    uploadSizeKb: Math.round(preparedFile.size / 1024),
    prepMs,
    imageSize: PREDICT_IMAGE_SIZE,
    url: predictUrl,
  });

  const requestStartedAt = performance.now();
  let response;
  try {
    response = await fetchWithTimeout(
      predictUrl,
      { method: 'POST', body: formData },
      PREDICT_TIMEOUT,
      requestAbort.signal
    );
  } catch (error) {
    if (error.name === 'AbortError' && activePredictAbort !== requestAbort) {
      apiLog('debug', 'Predict anterior cancelado (nova requisição em andamento)');
      throw new PredictCancelledError();
    }
    if (error.name === 'AbortError') {
      apiLog('error', 'Predict abortado por timeout', { timeoutMs: PREDICT_TIMEOUT });
      throw new ApiError('Tempo esgotado aguardando resposta da API de inferência.');
    }
    const diagnosis = describeFetchError(error, `${API_BASE_URL}/predict`, 'POST');
    apiLog('error', 'Predict falhou na conexão', diagnosis);
    throw new ApiError('Não foi possível conectar à API de inferência.', error);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    apiLog('error', `Predict retornou HTTP ${response.status}`, { body: errText.slice(0, 500) });
    throw new ApiError(errText || `Erro na API (${response.status})`);
  }

  const data = await response.json();
  const roundTripMs = Math.round(performance.now() - requestStartedAt);
  const serverInferenceMs = Math.round(data.inference_time_ms ?? data.processing_time_ms ?? 0);

  apiLog('info', 'Predict OK', {
    detections: data.detections?.length ?? 0,
    serverInferenceMs,
    roundTripMs,
    networkOverheadMs: Math.max(0, roundTripMs - serverInferenceMs),
    prepMs,
    imageSize: `${data.image_width}×${data.image_height}`,
  });

  if (serverInferenceMs > 15000) {
    apiLog(
      'warn',
      'inference_time_ms inflado (fila no servidor) — múltiplos POST /predict enfileirados. Requisições duplicadas agora são canceladas no frontend.',
      { serverInferenceMs, roundTripMs, displayMs: resolveProcessingTime(serverInferenceMs, roundTripMs) }
    );
  } else if (serverInferenceMs > 3000) {
    apiLog(
      'warn',
      'Inferência lenta — HF Space em CPU (~2–5s). Ative GPU em Settings → Hardware para ~100–300ms.',
      { serverInferenceMs, deviceHint: 'GET /model/info → device' }
    );
  }

  if (activePredictAbort === requestAbort) {
    activePredictAbort = null;
  }

  const imageUrl = URL.createObjectURL(file);
  return parsePredictResponse(data, imageUrl, { roundTripMs });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableHealthError(error) {
  if (error?.name === 'AbortError') return true;
  if (error instanceof TypeError) {
    const msg = (error.message || '').toLowerCase();
    return (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('load failed') ||
      msg.includes('network request failed')
    );
  }
  return false;
}

let healthRequestInFlight = null;

export async function getHealth({ retries = HEALTH_RETRIES, timeout = HEALTH_TIMEOUT } = {}) {
  if (healthRequestInFlight) {
    apiLog('debug', 'Health check já em andamento — reutilizando promise');
    return healthRequestInFlight;
  }

  const url = `${API_BASE_URL}/health`;
  let lastError = null;

  healthRequestInFlight = (async () => {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, {}, timeout);
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        apiLog('warn', `Health check HTTP ${response.status}`, { body: errText.slice(0, 300) });
        throw new Error(`Health check failed (${response.status})`);
      }

      const data = await response.json();
      const isReady = data.status === 'ready' || data.status === 'ok' || data.status === 'healthy';
      const status = isReady ? 'online' : 'waking';

      apiLog('info', `Health: ${status}`, { apiStatus: data.status, raw: data, attempt });

      return { status, data };
    } catch (error) {
      lastError = error;

      if (isRetryableHealthError(error) && attempt < retries) {
        apiLog('warn', `Health tentativa ${attempt}/${retries} falhou — retry`, {
          errorName: error?.name,
          errorMessage: error?.message,
          retryInMs: HEALTH_RETRY_DELAY_MS,
        });
        await sleep(HEALTH_RETRY_DELAY_MS);
        continue;
      }

      if (error.name === 'AbortError') {
        apiLog('warn', 'Health check timeout — API pode estar em cold start', {
          timeoutMs: timeout,
          url,
          attempts: attempt,
        });
        return { status: 'waking', error: 'Request timed out — API may be cold starting' };
      }

      break;
    }
  }

  const diagnosis = describeFetchError(lastError, url, 'GET');
  apiLog('error', 'Health check offline', diagnosis);

  return { status: 'offline', error: lastError?.message, diagnosis };
  })();

  try {
    return await healthRequestInFlight;
  } finally {
    healthRequestInFlight = null;
  }
}

export async function getMetadata() {
  const url = `${API_BASE_URL}/model/info`;

  try {
    const response = await fetchWithTimeout(url, {}, METADATA_TIMEOUT);
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      apiLog('error', `Metadata HTTP ${response.status}`, { body: errText.slice(0, 300) });
      throw new ApiError('Falha ao obter metadados do modelo.');
    }

    const data = await response.json();
    const metadata = mapApiMetadata(data);
    apiLog('info', 'Metadata OK', metadata);
    return metadata;
  } catch (error) {
    if (!(error instanceof ApiError)) {
      apiLog('error', 'Metadata falhou', describeFetchError(error, url, 'GET'));
    }
    throw error;
  }
}

export async function getClasses() {
  const url = `${API_BASE_URL}/classes`;

  try {
    const response = await fetchWithTimeout(url, {}, METADATA_TIMEOUT);
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      apiLog('error', `Classes HTTP ${response.status}`, { body: errText.slice(0, 300) });
      throw new ApiError('Falha ao obter classes do modelo.');
    }

    const data = await response.json();
    const classes = data.classes || data;
    apiLog('info', 'Classes OK', { count: Array.isArray(classes) ? classes.length : '?', classes });
    return classes;
  } catch (error) {
    if (!(error instanceof ApiError)) {
      apiLog('error', 'Classes falhou', describeFetchError(error, url, 'GET'));
    }
    throw error;
  }
}

export async function predictImage(file) {
  return callPredictApi(file);
}

export async function predictSample(sampleId) {
  const sample = SAMPLE_IMAGES.find((s) => s.id === sampleId) || SAMPLE_IMAGES[0];
  const loadStartedAt = performance.now();
  apiLog('info', `Carregando sample #${sampleId} localmente`, { file: sample.file, src: sample.src });

  const response = await fetch(sample.src);
  const blob = await response.blob();
  const file = new File([blob], sample.file, { type: blob.type || 'image/png' });

  apiLog('info', `Sample pronto em ${Math.round(performance.now() - loadStartedAt)}ms — disparando predict`, {
    fileSizeKb: Math.round(file.size / 1024),
  });

  const result = await callPredictApi(file);

  if (result.imageUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(result.imageUrl);
  }

  return {
    ...result,
    imageUrl: sample.src,
  };
}

export { API_BASE_URL };
