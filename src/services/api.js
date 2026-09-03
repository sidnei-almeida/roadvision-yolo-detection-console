/**
 * Fachada de inferência.
 *
 * Mantém a mesma superfície que existia quando o backend era um HF Space
 * (getHealth / getMetadata / getClasses / predictImage / predictSample), mas todo
 * o trabalho acontece localmente via ONNX Runtime Web. Nenhuma requisição sai do
 * browser além do download estático dos pesos servidos pela própria Vercel.
 */
import { ENV } from '../config/env';
import { SAMPLE_IMAGES } from '../data/sampleImages';
import { getDetectionSummary } from '../utils/detectionSummary';
import { mapApiDetections, mapApiMetadata } from '../utils/detectionMapper';
import { detect, supersedePending, currentToken } from './inference/engine';
import { EngineState, getEngineState, loadEngine } from './inference/session';

const LOG_PREFIX = '[RoadVision API]';

function apiLog(level, message, details) {
  const fn = console[level] || console.log;
  if (details !== undefined) fn(`${LOG_PREFIX} ${message}`, details);
  else fn(`${LOG_PREFIX} ${message}`);
}

apiLog('info', 'Inferência local — sem backend remoto', {
  modelUrl: ENV.modelUrl,
  mode: ENV.mode,
  dev: ENV.isDev,
});

export class ApiError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'ApiError';
    this.cause = cause;
  }
}

function parseResult(data, imageUrl) {
  const imageWidth = data.image_width || 1;
  const imageHeight = data.image_height || 1;
  const detections = mapApiDetections(data.detections, imageWidth, imageHeight);
  const inferenceMs = Math.round(data.inference_time_ms || 0);
  const totalMs = Math.round(data.total_time_ms || inferenceMs);

  return {
    imageUrl,
    detections,
    summary: getDetectionSummary(detections, inferenceMs),
    processingTime: inferenceMs,
    serverInferenceMs: inferenceMs,
    roundTripMs: totalMs,
    imageWidth,
    imageHeight,
    annotatedImage: null,
  };
}

/**
 * Estado da engine local. Mantém os mesmos valores de status que a UI já trata:
 * `checking` durante o carregamento, `online` quando a sessão está pronta.
 */
export async function getHealth() {
  const { state } = getEngineState();

  if (state === EngineState.READY) {
    return { status: 'online', data: { status: 'ready' } };
  }

  try {
    await loadEngine();
    apiLog('info', 'Health: online (engine local pronta)');
    return { status: 'online', data: { status: 'ready' } };
  } catch (error) {
    apiLog('error', 'Health: offline — engine local falhou', error);
    return {
      status: 'offline',
      error: error?.message,
      diagnosis: {
        likelyCause: 'model_load',
        hint:
          'Não foi possível carregar o modelo ONNX ou os binários WASM. ' +
          'Confirme que /models e /ort estão publicados no deploy.',
      },
    };
  }
}

export async function getMetadata() {
  try {
    const engine = await loadEngine();
    const metadata = mapApiMetadata(engine);
    apiLog('info', 'Metadata OK', metadata);
    return metadata;
  } catch (error) {
    apiLog('error', 'Metadata falhou', error);
    throw new ApiError('Falha ao obter metadados do modelo local.', error);
  }
}

export async function getClasses() {
  try {
    const engine = await loadEngine();
    return engine.classNames;
  } catch (error) {
    throw new ApiError('Falha ao obter classes do modelo local.', error);
  }
}

async function runDetection(source, imageUrl) {
  const token = supersedePending();

  try {
    const data = await detect(source, { signalToken: token });
    if (token !== currentToken()) {
      apiLog('debug', 'Resultado descartado — nova inferência iniciada');
    }
    return parseResult(data, imageUrl);
  } catch (error) {
    if (error?.name === 'PredictCancelledError') throw error;
    apiLog('error', 'Inferência falhou', error);
    throw new ApiError('Falha ao executar a inferência no browser.', error);
  }
}

export async function predictImage(file) {
  apiLog('info', 'Rodando inferência local sobre upload', {
    fileName: file?.name,
    sizeKb: file ? Math.round(file.size / 1024) : 0,
  });

  const imageUrl = URL.createObjectURL(file);

  try {
    return await runDetection(file, imageUrl);
  } catch (error) {
    URL.revokeObjectURL(imageUrl);
    throw error;
  }
}

export async function predictSample(sampleId) {
  const sample = SAMPLE_IMAGES.find((s) => s.id === sampleId) || SAMPLE_IMAGES[0];
  apiLog('info', `Rodando inferência local sobre sample #${sample.id}`, { src: sample.src });

  return runDetection(sample.src, sample.src);
}

// Mantido por compatibilidade com a UI, que exibe a origem do modelo.
export const API_BASE_URL = ENV.modelUrl;
