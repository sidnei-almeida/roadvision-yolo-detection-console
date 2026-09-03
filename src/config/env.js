/**
 * Configuração da inferência local (ONNX Runtime Web).
 *
 * Não há mais backend remoto: o modelo é um asset estático servido pela própria
 * Vercel e a inferência roda no browser. As variáveis abaixo só ajustam
 * thresholds e paralelismo — nenhuma delas é obrigatória.
 */
const DEFAULT_MODEL_URL = '/models/road-signs-yolo.onnx';
const DEFAULT_MODEL_META_URL = '/models/road-signs-yolo.json';
const DEFAULT_IMAGE_SIZE = 416;
const DEFAULT_CONF_THRESHOLD = 0.25;
const DEFAULT_IOU_THRESHOLD = 0.45;

function readNumber(raw, fallback) {
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveThreads() {
  const requested = Number(import.meta.env.VITE_ORT_THREADS);
  const hardware =
    typeof navigator !== 'undefined' && navigator.hardwareConcurrency
      ? navigator.hardwareConcurrency
      : 1;

  // SharedArrayBuffer só existe sob cross-origin isolation (COOP + COEP).
  // Sem isolamento o ORT precisa rodar single-thread ou o worker falha.
  const isolated = typeof globalThis !== 'undefined' && globalThis.crossOriginIsolated === true;
  if (!isolated) return 1;

  const ceiling = Math.max(1, Math.min(4, hardware));
  if (Number.isFinite(requested) && requested >= 1) {
    return Math.min(Math.floor(requested), ceiling);
  }
  return ceiling;
}

export const ENV = {
  modelUrl: import.meta.env.VITE_MODEL_URL || DEFAULT_MODEL_URL,
  modelMetaUrl: import.meta.env.VITE_MODEL_META_URL || DEFAULT_MODEL_META_URL,
  // Vazio = o bundler resolve o .wasm via import.meta.url e o Vite o emite em
  // /assets. Só preencha para servir os binários de outro caminho/CDN.
  ortWasmPath: import.meta.env.VITE_ORT_WASM_PATH || '',
  imageSize: readNumber(import.meta.env.VITE_IMAGE_SIZE, DEFAULT_IMAGE_SIZE),
  confThreshold: readNumber(import.meta.env.VITE_CONF_THRESHOLD, DEFAULT_CONF_THRESHOLD),
  iouThreshold: readNumber(import.meta.env.VITE_IOU_THRESHOLD, DEFAULT_IOU_THRESHOLD),
  get threads() {
    return resolveThreads();
  },
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
};

export const ENV_VAR_DOCS = [
  {
    key: 'VITE_MODEL_URL',
    required: false,
    default: DEFAULT_MODEL_URL,
    description: 'Caminho do .onnx servido estaticamente pela Vercel',
    vercel: true,
  },
  {
    key: 'VITE_ORT_WASM_PATH',
    required: false,
    default: 'resolvido pelo bundler',
    description: 'Diretório alternativo para os binários WASM do ONNX Runtime Web',
    vercel: true,
  },
  {
    key: 'VITE_CONF_THRESHOLD',
    required: false,
    default: String(DEFAULT_CONF_THRESHOLD),
    description: 'Confiança mínima para manter uma detecção',
    vercel: true,
  },
  {
    key: 'VITE_IOU_THRESHOLD',
    required: false,
    default: String(DEFAULT_IOU_THRESHOLD),
    description: 'IoU do Non-Max Suppression aplicado no browser',
    vercel: true,
  },
  {
    key: 'VITE_ORT_THREADS',
    required: false,
    default: 'auto',
    description: 'Threads do WASM — só tem efeito sob cross-origin isolation',
    vercel: true,
  },
];

const ENV_KEY_TO_VALUE = {
  VITE_MODEL_URL: () => ENV.modelUrl,
  VITE_ORT_WASM_PATH: () => ENV.ortWasmPath || 'bundler (/assets)',
  VITE_CONF_THRESHOLD: () => String(ENV.confThreshold),
  VITE_IOU_THRESHOLD: () => String(ENV.iouThreshold),
  VITE_ORT_THREADS: () => String(ENV.threads),
};

export function getEnvValue(key) {
  const resolver = ENV_KEY_TO_VALUE[key];
  return resolver ? resolver() : import.meta.env[key];
}

export function isEnvOverridden(key) {
  return import.meta.env[key] !== undefined && import.meta.env[key] !== '';
}
