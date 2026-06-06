import {
  IconCpuChip,
  IconCube,
  IconExternalLink,
} from './icons/PremiumIcons';
import { KAGGLE_DATASET, SIGN_CLASSES, YOLO_MODEL } from '../data/roadSignProject';

export default function ModelInfoCard({ metadata }) {
  return (
    <div id="model" className="lower-card info-card bottom-card animate-panel-bottom">
      <div className="lower-card__header info-card-header bottom-card-header">
        <h3 className="lower-card__title">Model Overview</h3>
      </div>

      <div className="model-overview__body info-card-body bottom-card-body">
        <div className="model-overview__cols">
          <div className="model-overview__col">
            <p className="model-overview__section-label section-label">Architecture</p>
            <div className="model-overview__arch-row">
              <span className="model-overview__badge model-overview__badge--arch">
                <IconCube size={10} />
                {YOLO_MODEL.name}
              </span>
              <span className="model-overview__badge model-overview__badge--task">
                {YOLO_MODEL.task}
              </span>
            </div>
            <div className="model-overview__stats">
              <div className="model-overview__stat">
                <span className="model-overview__stat-val">{YOLO_MODEL.inputSize}</span>
                <span className="model-overview__stat-key">px input</span>
              </div>
              <div className="model-overview__stat">
                <span className="model-overview__stat-val">{YOLO_MODEL.classes}</span>
                <span className="model-overview__stat-key">classes</span>
              </div>
              <div className="model-overview__stat">
                <span className="model-overview__stat-val model-overview__stat-val--device">
                  <IconCpuChip size={10} />
                  {metadata?.device?.toUpperCase() ?? 'CPU'}
                </span>
                <span className="model-overview__stat-key">device</span>
              </div>
            </div>
          </div>

          <div className="model-overview__divider" />

          <div className="model-overview__col">
            <p className="model-overview__section-label section-label">Dataset</p>
            <a
              href={KAGGLE_DATASET.url}
              target="_blank"
              rel="noopener noreferrer"
              className="model-overview__dataset-link"
            >
              Kaggle · {KAGGLE_DATASET.name}
              <IconExternalLink size={10} />
            </a>
            <p className="model-overview__dataset-meta">
              {KAGGLE_DATASET.images} imagens · {KAGGLE_DATASET.format}
            </p>

            <div className="model-overview__classes">
              {SIGN_CLASSES.map(({ name, Icon }) => (
                <span key={name} className="model-overview__class-pill">
                  <Icon size={10} />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
