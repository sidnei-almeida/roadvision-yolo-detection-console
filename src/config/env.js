/** Fallback só para documentação na UI — configure .env ou Vercel com a URL real */
const DEFAULT_API_URL = 'https://your-space.hf.space';
const DEFAULT_IMAGE_SIZE = 416;

export const ENV = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL,
  apiImageSize: Number(import.meta.env.VITE_API_IMAGE_SIZE) || DEFAULT_IMAGE_SIZE,
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
};

export const ENV_VAR_DOCS = [
  {
    key: 'VITE_API_BASE_URL',
    required: true,
    default: DEFAULT_API_URL,
    description: 'URL base do Hugging Face Space (sem barra final, sem /predict)',
    vercel: true,
  },
  {
    key: 'VITE_API_IMAGE_SIZE',
    required: false,
    default: String(DEFAULT_IMAGE_SIZE),
    description: 'Tamanho de inferência YOLO — 416 para CPU, 640 para GPU',
    vercel: true,
  },
];

export function getEnvValue(key) {
  const doc = ENV_VAR_DOCS.find((v) => v.key === key);
  if (!doc) return undefined;

  if (key === 'VITE_API_BASE_URL') {
    return import.meta.env.VITE_API_BASE_URL || doc.default;
  }
  if (key === 'VITE_API_IMAGE_SIZE') {
    return import.meta.env.VITE_API_IMAGE_SIZE ?? doc.default;
  }
  return import.meta.env[key];
}

export function isEnvOverridden(key) {
  return import.meta.env[key] !== undefined && import.meta.env[key] !== '';
}
