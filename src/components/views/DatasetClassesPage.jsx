import { IconExternalLink } from '../icons/PremiumIcons';
import { DetectionClassIcon } from '../icons/DetectionIcons';
import {
  DATASET_WORKFLOW,
  KAGGLE_DATASET,
  SIGN_CLASSES,
  YOLO_DATA_YAML,
} from '../../data/roadSignProject';
import { InfoCitation, InfoDistBars } from './shared/InfoBlocks';
import InfoPageShell from './InfoPageShell';

const DATASET_FACTS = [
  { label: 'Autor', value: KAGGLE_DATASET.author },
  { label: 'Ano', value: String(KAGGLE_DATASET.year) },
  { label: 'Imagens', value: `${KAGGLE_DATASET.images} ${KAGGLE_DATASET.imageFormat}` },
  { label: 'Anotações', value: `${KAGGLE_DATASET.annotations} bounding boxes` },
  { label: 'Média/img', value: `~${KAGGLE_DATASET.avgObjectsPerImage} objetos` },
  { label: 'Formato', value: KAGGLE_DATASET.format },
  { label: 'Idioma', value: KAGGLE_DATASET.language },
  { label: 'Licença', value: KAGGLE_DATASET.license },
  { label: 'Splits', value: KAGGLE_DATASET.splits },
];

const CLASS_SHARE = SIGN_CLASSES.map((cls) => ({
  label: cls.name,
  sublabel: `YOLO id ${cls.yoloId}`,
  value: Math.round(KAGGLE_DATASET.annotations / SIGN_CLASSES.length),
  color: cls.color,
}));

export default function DatasetClassesPage() {
  return (
    <div className="info-page-layout animate-in">
      <div className="info-page-grid info-page-grid--2">
        <InfoPageShell title="Fonte — Kaggle">
          <div className="info-hero-card">
            <a
              href={KAGGLE_DATASET.url}
              target="_blank"
              rel="noopener noreferrer"
              className="info-hero-card__link"
            >
              {KAGGLE_DATASET.name}
              <IconExternalLink size={12} />
            </a>
            <p className="info-hero-card__desc">
              Dataset público de detecção de placas de trânsito em cenários reais de rua —
              iluminação variada, ângulos diversos e condições climáticas mistas. Cada imagem
              possui um arquivo XML PASCAL VOC com coordenadas absolutas (xmin, ymin, xmax, ymax)
              e rótulo de classe.
            </p>
            <div className="info-code-block">
              <code>{KAGGLE_DATASET.downloadCmd}</code>
            </div>
            <div className="info-folder-tree">
              {KAGGLE_DATASET.structure.map((folder) => (
                <span key={folder} className="info-folder-tree__item">
                  {folder}
                </span>
              ))}
            </div>
          </div>
          <InfoCitation text={KAGGLE_DATASET.citation} />
        </InfoPageShell>

        <InfoPageShell title="Estatísticas do dataset">
          <dl className="info-dl info-dl--compact">
            {DATASET_FACTS.map(({ label, value }) => (
              <div key={label} className="info-dl__row">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="info-note">
            {KAGGLE_DATASET.annotations} objetos em {KAGGLE_DATASET.images} imagens — distribuição
            desbalanceada entre classes. Recomenda-se split manual 80/20 antes do fine-tuning.
          </p>
        </InfoPageShell>
      </div>

      <div className="info-page-grid info-page-grid--2">
        <InfoPageShell title="Pipeline de preparação">
          <ol className="info-pipeline">
            {DATASET_WORKFLOW.map(({ step, title, detail }) => (
              <li key={step} className="info-pipeline__item">
                <span className="info-pipeline__step">{step}</span>
                <div className="info-pipeline__content">
                  <span className="info-pipeline__label">{title}</span>
                  <span className="info-pipeline__detail">{detail}</span>
                </div>
              </li>
            ))}
          </ol>
        </InfoPageShell>

        <InfoPageShell title="data.yaml (YOLO)">
          <div className="info-code-block info-code-block--multiline">
            <pre><code>{YOLO_DATA_YAML}</code></pre>
          </div>
          <p className="info-note">
            Ordem das classes no YAML deve coincidir com os IDs usados nas labels .txt e com a
            saída da API ({SIGN_CLASSES.map((c) => c.apiName).join(', ')}).
          </p>
        </InfoPageShell>
      </div>

      <InfoPageShell title="Distribuição de anotações (estimativa por classe)">
        <InfoDistBars items={CLASS_SHARE} />
        <p className="info-note">
          Valores aproximados (~{Math.round(KAGGLE_DATASET.annotations / 4)} por classe se
          balanceado). Consulte as estatísticas no Kaggle para contagens exatas.
        </p>
      </InfoPageShell>

      <InfoPageShell title="Classes de sinalização — detalhe completo">
        <div className="info-class-grid">
          {SIGN_CLASSES.map(
            ({ id, name, apiName, vocLabel, yoloId, type, color, description, examples }) => (
              <article key={id} className="info-class-card info-class-card--rich">
                <div className="info-class-card__header">
                  <span className="info-class-card__icon" style={{ color }}>
                    <DetectionClassIcon detectionClass={apiName} />
                  </span>
                  <div>
                    <h3 className="info-class-card__name">{name}</h3>
                    <span className="info-class-card__api">
                      API: {apiName} · VOC: {vocLabel} · YOLO: {yoloId}
                    </span>
                  </div>
                  <span className="info-class-card__type">{type}</span>
                </div>
                <p className="info-class-card__desc">{description}</p>
                <p className="info-class-card__examples">
                  <span className="info-class-card__examples-label">Exemplos:</span> {examples}
                </p>
              </article>
            )
          )}
        </div>
      </InfoPageShell>
    </div>
  );
}
