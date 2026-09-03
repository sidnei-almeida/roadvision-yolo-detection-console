/**
 * Sessão ONNX Runtime Web — carrega os pesos uma vez e mantém a InferenceSession
 * viva pelo tempo de vida da página. Todo o trabalho acontece no browser; não há
 * backend de inferência.
 */
import * as ort from 'onnxruntime-web/wasm';
import { ENV } from '../../config/env';

const LOG_PREFIX = '[RoadVision Engine]';

export const EngineState = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  FAILED: 'failed',
};

let state = EngineState.IDLE;
let loadPromise = null;
let engine = null;
let lastError = null;

function log(level, message, details) {
  const fn = console[level] || console.log;
  if (details !== undefined) fn(`${LOG_PREFIX} ${message}`, details);
  else fn(`${LOG_PREFIX} ${message}`);
}

function configureRuntime() {
  // Sem override, o próprio bundle do ORT localiza o .wasm por import.meta.url —
  // o Vite o emite em /assets com hash e cache imutável.
  if (ENV.ortWasmPath) {
    ort.env.wasm.wasmPaths = ENV.ortWasmPath;
  }
  ort.env.wasm.numThreads = ENV.threads;
  ort.env.wasm.simd = true;
  ort.env.logLevel = ENV.isDev ? 'warning' : 'error';
}

/** Faz o download em stream para reportar progresso real na tela de boot. */
async function fetchWithProgress(url, onProgress) {
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`Falha ao baixar ${url} (HTTP ${response.status})`);
  }

  const declared = Number(response.headers.get('content-length'));
  const total = Number.isFinite(declared) && declared > 0 ? declared : 0;

  if (!response.body || !total) {
    const buffer = await response.arrayBuffer();
    onProgress?.({ loaded: buffer.byteLength, total: buffer.byteLength, ratio: 1 });
    return new Uint8Array(buffer);
  }

  const reader = response.body.getReader();
  const chunks = [];
  let loaded = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    onProgress?.({ loaded, total, ratio: Math.min(1, loaded / total) });
  }

  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function loadManifest() {
  const response = await fetch(ENV.modelMetaUrl, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`Manifesto do modelo indisponível (HTTP ${response.status})`);
  }
  return response.json();
}

async function warmup(session, inputName, size) {
  const zeros = new Float32Array(3 * size * size);
  const tensor = new ort.Tensor('float32', zeros, [1, 3, size, size]);
  const started = performance.now();
  const outputs = await session.run({ [inputName]: tensor });
  const outputName = session.outputNames[0];
  const dims = outputs[outputName].dims;
  log('info', `Warmup concluído em ${Math.round(performance.now() - started)}ms`, { outputDims: dims });
  return dims;
}

async function initialize(onProgress) {
  state = EngineState.LOADING;
  lastError = null;
  configureRuntime();

  log('info', 'Inicializando inferência local', {
    modelUrl: ENV.modelUrl,
    wasmPaths: ENV.ortWasmPath || 'bundler',
    threads: ENV.threads,
    crossOriginIsolated: globalThis.crossOriginIsolated === true,
  });

  const manifest = await loadManifest();
  const inputSize = manifest.inputSize || ENV.imageSize;

  onProgress?.({ phase: 'download', ratio: 0 });
  const weights = await fetchWithProgress(ENV.modelUrl, ({ ratio, loaded, total }) =>
    onProgress?.({ phase: 'download', ratio, loaded, total })
  );

  onProgress?.({ phase: 'compile', ratio: 1 });
  const startedAt = performance.now();
  const session = await ort.InferenceSession.create(weights, {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all',
  });
  log('info', `Sessão criada em ${Math.round(performance.now() - startedAt)}ms`, {
    inputNames: session.inputNames,
    outputNames: session.outputNames,
  });

  const inputName = manifest.inputName || session.inputNames[0];

  onProgress?.({ phase: 'warmup', ratio: 1 });
  const outputDims = await warmup(session, inputName, inputSize);

  engine = {
    session,
    inputName,
    outputName: manifest.outputName || session.outputNames[0],
    inputSize,
    outputDims,
    classNames: manifest.classNames || [],
    manifest,
    ortVersion: ort.env.versions?.web || 'web',
    threads: ENV.threads,
    executionProvider: 'wasm',
  };

  state = EngineState.READY;
  onProgress?.({ phase: 'ready', ratio: 1 });
  log('info', 'Engine pronta', {
    classes: engine.classNames,
    inputSize,
    threads: engine.threads,
  });

  return engine;
}

/** Idempotente: chamadas concorrentes compartilham a mesma promise. */
export function loadEngine({ onProgress } = {}) {
  if (state === EngineState.READY) return Promise.resolve(engine);
  if (loadPromise) return loadPromise;

  loadPromise = initialize(onProgress).catch((error) => {
    state = EngineState.FAILED;
    lastError = error;
    loadPromise = null;
    log('error', 'Falha ao inicializar a engine', error);
    throw error;
  });

  return loadPromise;
}

export function getEngineState() {
  return { state, error: lastError, engine };
}

export function getEngine() {
  return engine;
}

export async function runSession(tensorData, size) {
  if (!engine) throw new Error('Engine não inicializada.');

  const tensor = new ort.Tensor('float32', tensorData, [1, 3, size, size]);
  const outputs = await engine.session.run({ [engine.inputName]: tensor });
  const output = outputs[engine.outputName] ?? outputs[engine.session.outputNames[0]];

  return { data: output.data, dims: output.dims };
}
