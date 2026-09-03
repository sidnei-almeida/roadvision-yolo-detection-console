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
  inputSize: 416,
  trainImgsz: 640,
  classes: 4,
  backbone: 'CSPDarknet + C2f',
  neck: 'PAN-FPN multi-scale fusion',
  head: 'Decoupled anchor-free head',
  framework: 'PyTorch (treino) → ONNX (inferência)',
  augmentations: ['Mosaic', 'MixUp', 'HSV jitter', 'Random flip', 'Scale jitter'],
  postProcess: 'Non-Max Suppression (NMS)',
  confThreshold: 0.25,
  iouThreshold: 0.45,
  deployment: 'Vercel — ONNX Runtime Web (inferência no browser)',
  frontendDeploy: 'Vercel (Vite + React)',
  runtime: 'ONNX Runtime Web · WASM SIMD',
  exportFormat: 'best.pt → ONNX opset 12 (416×416 estático)',
  weightsSize: '11.6 MB',
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
  export: 'best.pt → ONNX opset 12 (imgsz=416, simplify)',
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
  { device: 'Browser WASM SIMD', latency: '150–600 ms', note: 'Desktop, single-thread' },
  { device: 'Browser WASM ×4 threads', latency: '80–250 ms', note: 'Requer cross-origin isolation' },
  { device: 'Mobile WASM', latency: '400 ms–1,5 s', note: 'Depende do SoC' },
];

export const API_CONFIG = {
  modelUrlEnv: 'VITE_MODEL_URL',
  confThresholdEnv: 'VITE_CONF_THRESHOLD',
  weightsFetch: 'Uma vez por visita — cache imutável de 1 ano',
  sessionInit: 'Compilação do grafo + warmup no boot',
  bootRetries: 3,
  pollInterval: '60 s',
  network: 'Nenhuma requisição de inferência sai do browser',
};

export const API_ENDPOINTS = [
  {
    path: '/models/road-signs-yolo.json',
    method: 'GET',
    description: 'Manifesto: nomes das classes, tensor de entrada e saída',
    response: '{ "inputSize": 416, "classNames": [...] }',
  },
  {
    path: '/models/road-signs-yolo.onnx',
    method: 'GET',
    description: 'Pesos YOLOv8n exportados — baixados uma vez e cacheados',
    response: '11.6 MB · application/octet-stream',
  },
  {
    path: '/assets/ort-wasm-simd-threaded.wasm',
    method: 'GET',
    description: 'Runtime WASM do ONNX Runtime Web emitido pelo Vite',
    response: '13.3 MB · ~3.5 MB comprimido',
  },
  {
    path: 'InferenceSession.run()',
    method: 'LOCAL',
    description: 'Chamada in-process — letterbox 416, forward, NMS por classe',
    response: '{ detections, inference_time_ms, image_width, image_height }',
  },
];

export const API_TROUBLESHOOTING = [
  {
    issue: 'Cannot load detection model',
    fix: 'Confirme que /models/road-signs-yolo.onnx foi publicado no deploy e retorna 200.',
  },
  {
    issue: 'Boot lento na primeira visita',
    fix: 'São ~15 MB entre pesos e runtime WASM. Visitas seguintes usam o cache imutável.',
  },
  {
    issue: 'Inferência lenta (>1 s)',
    fix: 'Sem cross-origin isolation o WASM roda single-thread. Confira COOP/COEP no vercel.json.',
  },
  {
    issue: 'Nenhuma detecção retornada',
    fix: 'Confirme imagem com placas visíveis. Threshold padrão: 0.25.',
  },
];

export const LOG_EVENT_TYPES = [
  { event: 'engine_load', desc: 'Download dos pesos, compilação do grafo e warmup' },
  { event: 'predict_ok', desc: 'Inferência local concluída — detecções mapeadas para o canvas' },
  { event: 'predict_error', desc: 'Falha ao decodificar a imagem ou executar a sessão ONNX' },
  { event: 'health_poll', desc: 'Verificação do estado da engine a cada 60 s' },
];
