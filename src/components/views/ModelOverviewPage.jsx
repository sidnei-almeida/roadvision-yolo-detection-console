import {
  IconCpuChip,
  IconCube,
  IconExternalLink,
} from '../icons/PremiumIcons';
import {
  KAGGLE_DATASET,
  MODEL_USE_CASES,
  TRAINING_CONFIG,
  YOLO_MODEL,
  YOLO_VARIANTS,
} from '../../data/roadSignProject';
import { InfoChecklist, InfoTagList, InfoVariantTable } from './shared/InfoBlocks';
import InfoPageShell from './InfoPageShell';

const PIPELINE_STEPS = [
  { step: '01', label: 'Input', detail: 'Imagem RGB redimensionada para 640×640 px (letterbox)' },
  { step: '02', label: 'Backbone', detail: 'CSPDarknet + C2f extrai features em 3 escalas' },
  { step: '03', label: 'Neck', detail: 'PAN-FPN funde mapas P3/P4/P5 para multi-escala' },
  { step: '04', label: 'Head', detail: 'Cabeça desacoplada: branch de classe + branch de bbox' },
  { step: '05', label: 'NMS', detail: `Conf ≥ ${YOLO_MODEL.confThreshold} · IoU ≤ ${YOLO_MODEL.iouThreshold}` },
  { step: '06', label: 'Output', detail: 'Bounding boxes + classe + score de confiança' },
];

const WHY_YOLO = [
  'Arquitetura anchor-free — menos hiperparâmetros que YOLOv5',
  'C2f modules — melhor fluxo de gradiente que C3',
  'Transfer learning de pesos COCO pré-treinados',
  'API Ultralytics unificada: train · val · predict · export',
];

export default function ModelOverviewPage({ metadata }) {
  const device = metadata?.device?.toUpperCase() ?? 'CPU';

  return (
    <div className="info-page-layout animate-in">
      <div className="info-page-grid info-page-grid--2">
        <InfoPageShell title="Arquitetura YOLOv8">
          <div className="info-hero-card">
            <div className="info-hero-card__badges">
              <span className="info-badge info-badge--accent">
                <IconCube size={12} />
                {YOLO_MODEL.name}
              </span>
              <span className="info-badge">{YOLO_MODEL.vendor}</span>
              <span className="info-badge">{YOLO_MODEL.variant}</span>
            </div>
            <p className="info-hero-card__desc">
              Detector single-stage otimizado para tempo real. Fine-tuned em{' '}
              {KAGGLE_DATASET.images} imagens do dataset{' '}
              <a
                href={KAGGLE_DATASET.url}
                target="_blank"
                rel="noopener noreferrer"
                className="info-link"
              >
                {KAGGLE_DATASET.name}
                <IconExternalLink size={10} />
              </a>{' '}
              com {KAGGLE_DATASET.annotations} anotações PASCAL VOC.
            </p>
            <div className="info-stat-row">
              <div className="info-stat">
                <span className="info-stat__val">{YOLO_MODEL.inputSize}</span>
                <span className="info-stat__key">px input</span>
              </div>
              <div className="info-stat">
                <span className="info-stat__val">{YOLO_MODEL.classes}</span>
                <span className="info-stat__key">classes</span>
              </div>
              <div className="info-stat">
                <span className="info-stat__val info-stat__val--device">
                  <IconCpuChip size={11} />
                  {device}
                </span>
                <span className="info-stat__key">runtime</span>
              </div>
              <div className="info-stat">
                <span className="info-stat__val">{YOLO_MODEL.confThreshold}</span>
                <span className="info-stat__key">conf min</span>
              </div>
            </div>
          </div>
          <p className="info-note">
            Documentação oficial:{' '}
            <a href={YOLO_MODEL.vendorUrl} target="_blank" rel="noopener noreferrer" className="info-link">
              Ultralytics YOLOv8
              <IconExternalLink size={10} />
            </a>
          </p>
        </InfoPageShell>

        <InfoPageShell title="Pipeline de inferência">
          <ol className="info-pipeline">
            {PIPELINE_STEPS.map(({ step, label, detail }) => (
              <li key={step} className="info-pipeline__item">
                <span className="info-pipeline__step">{step}</span>
                <div className="info-pipeline__content">
                  <span className="info-pipeline__label">{label}</span>
                  <span className="info-pipeline__detail">{detail}</span>
                </div>
              </li>
            ))}
          </ol>
        </InfoPageShell>
      </div>

      <div className="info-page-grid info-page-grid--3">
        <InfoPageShell title="Backbone · Neck · Head">
          <dl className="info-dl">
            <div className="info-dl__row">
              <dt>Backbone</dt>
              <dd>{YOLO_MODEL.backbone}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Neck</dt>
              <dd>{YOLO_MODEL.neck}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Detection head</dt>
              <dd>{YOLO_MODEL.head}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Framework</dt>
              <dd>{YOLO_MODEL.framework}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Pós-processamento</dt>
              <dd>{YOLO_MODEL.postProcess}</dd>
            </div>
          </dl>
        </InfoPageShell>

        <InfoPageShell title="Hiperparâmetros de treino">
          <dl className="info-dl">
            <div className="info-dl__row"><dt>Epochs</dt><dd>{TRAINING_CONFIG.epochs}</dd></div>
            <div className="info-dl__row"><dt>Batch size</dt><dd>{TRAINING_CONFIG.batchSize}</dd></div>
            <div className="info-dl__row"><dt>Optimizer</dt><dd>{TRAINING_CONFIG.optimizer}</dd></div>
            <div className="info-dl__row"><dt>Image size</dt><dd>{TRAINING_CONFIG.imgsz}px</dd></div>
            <div className="info-dl__row"><dt>Split</dt><dd>{TRAINING_CONFIG.split}</dd></div>
            <div className="info-dl__row"><dt>Pretrained</dt><dd>{TRAINING_CONFIG.pretrained}</dd></div>
            <div className="info-dl__row"><dt>Export</dt><dd>{TRAINING_CONFIG.export}</dd></div>
          </dl>
          <p className="info-note">
            Augmentations: {YOLO_MODEL.augmentations.join(' · ')}
          </p>
        </InfoPageShell>

        <InfoPageShell title="Runtime (API ao vivo)">
          <dl className="info-dl">
            <div className="info-dl__row">
              <dt>Modelo servido</dt>
              <dd>{metadata?.model ?? 'YOLOv8 Custom'}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Backend</dt>
              <dd>{metadata?.backend ?? 'PyTorch + Ultralytics'}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Input size</dt>
              <dd>{metadata?.inputSize ?? '640 × 640'}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Weights</dt>
              <dd className="info-dl__mono">{metadata?.weightsPath ?? '—'}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Deploy</dt>
              <dd>{YOLO_MODEL.deployment}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Frontend</dt>
              <dd>{YOLO_MODEL.frontendDeploy}</dd>
            </div>
          </dl>
        </InfoPageShell>
      </div>

      <div className="info-page-grid info-page-grid--2">
        <InfoPageShell title="Por que YOLOv8?">
          <InfoChecklist items={WHY_YOLO} />
        </InfoPageShell>

        <InfoPageShell title="Casos de uso">
          <InfoTagList tags={MODEL_USE_CASES} />
        </InfoPageShell>
      </div>

      <InfoPageShell title="Variantes YOLOv8 (Ultralytics)">
        <InfoVariantTable rows={YOLO_VARIANTS} />
        <p className="info-note">
          Este projeto usa <strong>{YOLO_MODEL.variant}</strong> — ideal para demo web e inferência
          em CPU no Hugging Face Space.
        </p>
      </InfoPageShell>
    </div>
  );
}
