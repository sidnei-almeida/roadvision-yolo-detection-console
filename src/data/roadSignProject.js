import {
  IconCrosswalk,
  IconSpeedLimit,
  IconStop,
  IconTrafficLight,
} from '../components/icons/PremiumIcons';

export const KAGGLE_DATASET = {
  name: 'Road Sign Detection',
  slug: 'andrewmvd/road-sign-detection',
  url: 'https://www.kaggle.com/datasets/andrewmvd/road-sign-detection',
  author: 'Andrew Maranhão',
  year: 2020,
  images: 877,
  annotations: 1244,
  avgObjectsPerImage: 1.42,
  format: 'PASCAL VOC (XML)',
  imageFormat: 'PNG',
  language: 'English',
  license: 'CC0 / Public Domain (Kaggle)',
  splits: 'Sem split train/val pré-definido',
  structure: ['images/', 'annotations/'],
  downloadCmd: 'kaggle datasets download -d andrewmvd/road-sign-detection',
  citation:
    'Andrew Maranhão — Road Sign Detection (2020). Kaggle. andrewmvd/road-sign-detection',
};

export const YOLO_MODEL = {
  name: 'YOLOv8',
  vendor: 'Ultralytics',
  vendorUrl: 'https://docs.ultralytics.com/models/yolov8/',
  task: 'Object Detection',
  variant: 'YOLOv8n (nano) — fine-tuned',
  inputSize: 640,
  classes: 4,
  backbone: 'CSPDarknet + C2f',
  neck: 'PAN-FPN multi-scale fusion',
  head: 'Decoupled anchor-free head',
  framework: 'PyTorch',
  augmentations: ['Mosaic', 'MixUp', 'HSV jitter', 'Random flip', 'Scale jitter'],
  postProcess: 'Non-Max Suppression (NMS)',
  confThreshold: 0.25,
  iouThreshold: 0.45,
  deployment: 'Hugging Face Space',
  frontendDeploy: 'Vercel (Vite + React)',
};

export const YOLO_VARIANTS = [
  { name: 'YOLOv8n', params: '3.2M', speed: 'Fastest', use: 'Edge / demo' },
  { name: 'YOLOv8s', params: '11.2M', speed: 'Fast', use: 'Balanced' },
  { name: 'YOLOv8m', params: '25.9M', speed: 'Medium', use: 'Production' },
  { name: 'YOLOv8l', params: '43.7M', speed: 'Slower', use: 'High accuracy' },
];

export const TRAINING_CONFIG = {
  epochs: '100–300 (fine-tuning)',
  batchSize: '8–16',
  optimizer: 'AdamW + cosine LR',
  imgsz: 640,
  split: '80% train · 20% val (manual)',
  pretrained: 'yolov8n.pt (COCO weights)',
  export: 'best.pt → ONNX / TorchScript',
};

export const MODEL_USE_CASES = [
  'ADAS / assistência ao motorista',
  'Monitoramento de vias urbanas',
  'Validação de datasets de trânsito',
  'Demos de computer vision',
  'Pesquisa em mobilidade inteligente',
];

export const SIGN_CLASSES = [
  {
    id: 'speedlimit',
    name: 'Speed Limit',
    apiName: 'Speedlimit',
    vocLabel: 'speedlimit',
    yoloId: 2,
    type: 'Regulatory',
    color: '#00d4ff',
    Icon: IconSpeedLimit,
    description:
      'Placas circulares de limite de velocidade — sinalização regulatória obrigatória em vias.',
    examples: '30, 50, 60 mph/kmh em zonas urbanas e rodovias.',
  },
  {
    id: 'stop',
    name: 'Stop',
    apiName: 'Stop',
    vocLabel: 'stop',
    yoloId: 1,
    type: 'Regulatory',
    color: '#ff4444',
    Icon: IconStop,
    description:
      'Placas octogonais de parada obrigatória (STOP) em cruzamentos e entradas de via.',
    examples: 'Interseções sem semáforo, saídas de estacionamentos.',
  },
  {
    id: 'crosswalk',
    name: 'Crosswalk',
    apiName: 'Crosswalk',
    vocLabel: 'crosswalk',
    yoloId: 3,
    type: 'Warning',
    color: '#00ff87',
    Icon: IconCrosswalk,
    description:
      'Sinalização de faixa de pedestres e travessia — alerta motoristas sobre zonas de pedestres.',
    examples: 'Faixas zebradas, placas amarelas de pedestre.',
  },
  {
    id: 'trafficlight',
    name: 'Traffic Light',
    apiName: 'Trafficlight',
    vocLabel: 'trafficlight',
    yoloId: 0,
    type: 'Informational',
    color: '#ffb800',
    Icon: IconTrafficLight,
    description:
      'Semáforos e sinais luminosos de controle de tráfego em cruzamentos.',
    examples: 'Vermelho, amarelo, verde — estado inferido pela cor ativa.',
  },
];

export const DATASET_WORKFLOW = [
  { step: '1', title: 'Download Kaggle', detail: 'Extrair ZIP → pastas images/ e annotations/' },
  { step: '2', title: 'VOC → YOLO', detail: 'Converter XML para .txt normalizado (cls cx cy w h)' },
  { step: '3', title: 'Split 80/20', detail: 'Separar train/val manualmente — dataset não inclui split' },
  { step: '4', title: 'data.yaml', detail: 'Definir paths, nc: 4 e names das classes' },
  { step: '5', title: 'Fine-tune', detail: 'yolo train model=yolov8n.pt data=roadsign.yaml imgsz=640' },
];

export const YOLO_DATA_YAML = `train: datasets/roadsign/images/train
val: datasets/roadsign/images/val

nc: 4
names: ['trafficlight', 'stop', 'speedlimit', 'crosswalk']`;

export const MODEL_HIGHLIGHTS = [
  { label: 'Backbone', value: 'CSPDarknet + C2f (YOLOv8)' },
  { label: 'Head', value: 'Decoupled detection' },
  { label: 'Training data', value: 'Kaggle · 877 imagens' },
  { label: 'Augment', value: 'Mosaic · MixUp · HSV' },
];

export const MODEL_TAGS = [
  { label: 'YOLOv8', accent: true },
  { label: 'Ultralytics' },
  { label: 'Computer Vision' },
  { label: 'Traffic Safety' },
];

export const CONFIDENCE_TIERS = [
  { key: 'high', label: 'High', range: '0.80 – 1.00', color: 'var(--accent)', desc: 'Detecção confiável' },
  { key: 'medium', label: 'Medium', range: '0.50 – 0.79', color: 'var(--color-warning)', desc: 'Revisar manualmente' },
  { key: 'low', label: 'Low', range: '0.00 – 0.49', color: 'var(--color-danger)', desc: 'Provável falso positivo' },
];

export const LATENCY_BENCHMARKS = [
  { device: 'CPU (HF Free)', latency: '2–5 s', note: 'Cold start + inferência' },
  { device: 'GPU T4', latency: '80–300 ms', note: 'Após warm-up do Space' },
  { device: 'Local GPU', latency: '< 50 ms', note: 'YOLOv8n, batch=1' },
];

export const API_CONFIG = {
  baseUrlEnv: 'VITE_API_BASE_URL',
  imageSizeEnv: 'VITE_API_IMAGE_SIZE',
  healthTimeout: '12 s',
  healthRetries: 2,
  metadataTimeout: '15 s',
  predictTimeout: '120 s',
  pollInterval: '60 s',
  cors: 'Direto do browser — inclua https://<projeto>.vercel.app em CORS_ORIGINS no HF Space',
};

export const API_ENDPOINTS = [
  {
    path: '/health',
    method: 'GET',
    description: 'Health check — retorna status ready/offline',
    response: '{ "status": "ready" }',
  },
  {
    path: '/model/info',
    method: 'GET',
    description: 'Metadados: device, classes, versões PyTorch/Ultralytics',
    response: '{ "device": "cpu", "class_names": [...] }',
  },
  {
    path: '/classes',
    method: 'GET',
    description: 'Lista de classes detectáveis pelo modelo',
    response: '["Speedlimit", "Stop", "Crosswalk", "Trafficlight"]',
  },
  {
    path: '/predict',
    method: 'POST',
    description: 'Inferência multipart — campo file com imagem',
    response: '{ "detections": [...], "image_width", "image_height" }',
  },
];

export const API_TROUBLESHOOTING = [
  {
    issue: 'API offline / failed to fetch',
    fix: 'Verifique se o HF Space está ativo. Cold start pode levar 30–60 s.',
  },
  {
    issue: 'Erro CORS no browser',
    fix: 'Adicione a URL da Vercel (ex.: https://seu-app.vercel.app) em CORS_ORIGINS no HF Space.',
  },
  {
    issue: 'Timeout na inferência',
    fix: 'CPU no HF é lento. Aumente paciência ou habilite GPU no Space.',
  },
  {
    issue: 'Nenhuma detecção retornada',
    fix: 'Confirme imagem com placas visíveis. Threshold padrão: 0.25.',
  },
];

export const LOG_EVENT_TYPES = [
  { event: 'predict_start', desc: 'Requisição enviada ao endpoint /predict' },
  { event: 'predict_ok', desc: 'Resposta recebida — detecções mapeadas para o canvas' },
  { event: 'predict_error', desc: 'Falha de rede, timeout ou API offline' },
  { event: 'health_poll', desc: 'Verificação automática a cada 60 s' },
];
