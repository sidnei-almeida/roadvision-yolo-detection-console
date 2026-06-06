import {
  IconBarChart,
  IconGrid,
  IconNeuralNet,
  IconRadar,
  IconSignal,
  IconTerminal,
} from '../components/icons/PremiumIcons';

export const NAV_ITEMS = [
  { id: 'live', label: 'Live Detection', Icon: IconRadar },
  { id: 'model', label: 'Model Overview', Icon: IconNeuralNet },
  { id: 'dataset', label: 'Dataset & Classes', Icon: IconGrid },
  { id: 'performance', label: 'Performance', Icon: IconBarChart },
  { id: 'logs', label: 'Inference Logs', Icon: IconTerminal },
  { id: 'api', label: 'API Status', Icon: IconSignal },
];

export const VIEW_META = {
  live: {
    title: 'Real-time Traffic Sign Detection',
    subtitle: 'Upload an image or use a sample to detect and classify traffic signs using YOLOv8.',
    showLivePulse: true,
  },
  model: {
    title: 'Model Overview',
    subtitle: 'YOLOv8n fine-tuned · CSPDarknet + C2f · pipeline completo de inferência e deploy.',
    showLivePulse: false,
  },
  dataset: {
    title: 'Dataset & Classes',
    subtitle: 'Kaggle · 877 PNG · 1.244 VOC annotations · 4 classes · workflow VOC→YOLO.',
    showLivePulse: false,
  },
  performance: {
    title: 'Performance',
    subtitle: 'Latência, confiança, breakdown por classe e benchmarks CPU/GPU.',
    showLivePulse: false,
  },
  logs: {
    title: 'Inference Logs',
    subtitle: 'Histórico completo da sessão · média de placas por run · ciclo de inferência.',
    showLivePulse: false,
  },
  api: {
    title: 'API Status',
    subtitle: 'HF Space health · endpoints · timeouts · env vars · troubleshooting.',
    showLivePulse: false,
  },
};
