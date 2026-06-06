import ApiStatusPill from '../ApiStatusPill';
import { ENV, ENV_VAR_DOCS, getEnvValue, isEnvOverridden } from '../../config/env';
import {
  API_CONFIG,
  API_ENDPOINTS,
  API_TROUBLESHOOTING,
  KAGGLE_DATASET,
  SIGN_CLASSES,
  YOLO_MODEL,
} from '../../data/roadSignProject';
import { InfoChecklist } from './shared/InfoBlocks';
import InfoPageShell from './InfoPageShell';

const API_BASE_URL = ENV.apiBaseUrl;

const STATUS_COPY = {
  online: 'Backend respondendo — inferência disponível via CORS.',
  offline: 'Backend indisponível — nenhuma detecção será exibida até o Space voltar.',
  checking: 'Verificando conectividade com o Hugging Face Space…',
  waking: 'Space em cold start — container acordando, aguarde ~30–60s.',
};

const ARCHITECTURE_STEPS = [
  'Browser (Vercel) → fetch direto',
  'Hugging Face Space → FastAPI/Gradio',
  'YOLOv8 weights → PyTorch inference',
  'JSON detections → canvas overlay',
];

export default function ApiStatusPage({ apiStatus, metadata }) {
  return (
    <div className="info-page-layout animate-in">
      <div className="info-page-grid info-page-grid--2">
        <InfoPageShell title="Status em tempo real">
          <div className="info-api-status-card">
            <ApiStatusPill status={apiStatus} />
            <p className="info-api-status-card__msg">
              {STATUS_COPY[apiStatus] ?? STATUS_COPY.checking}
            </p>
            <dl className="info-dl info-dl--compact">
              <div className="info-dl__row">
                <dt>Base URL</dt>
                <dd className="info-dl__mono info-dl__break">{API_BASE_URL}</dd>
              </div>
              <div className="info-dl__row">
                <dt>Health poll</dt>
                <dd>A cada {API_CONFIG.pollInterval}</dd>
              </div>
              <div className="info-dl__row">
                <dt>CORS</dt>
                <dd>{API_CONFIG.cors}</dd>
              </div>
              <div className="info-dl__row">
                <dt>Frontend</dt>
                <dd>{YOLO_MODEL.frontendDeploy}</dd>
              </div>
            </dl>
          </div>
        </InfoPageShell>

        <InfoPageShell title="Modelo servido">
          <dl className="info-dl">
            <div className="info-dl__row">
              <dt>Arquitetura</dt>
              <dd>{YOLO_MODEL.name} · {YOLO_MODEL.vendor}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Variante</dt>
              <dd>{YOLO_MODEL.variant}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Classes ({YOLO_MODEL.classes})</dt>
              <dd className="info-dl__mono">
                {metadata?.classes ?? SIGN_CLASSES.map((c) => c.apiName).join(', ')}
              </dd>
            </div>
            <div className="info-dl__row">
              <dt>Device</dt>
              <dd>{metadata?.device?.toUpperCase() ?? '—'}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Backend</dt>
              <dd>{metadata?.backend ?? 'PyTorch + Ultralytics'}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Conf / IoU</dt>
              <dd>{YOLO_MODEL.confThreshold} / {YOLO_MODEL.iouThreshold}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Dataset treino</dt>
              <dd>
                <a
                  href={KAGGLE_DATASET.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  Kaggle · {KAGGLE_DATASET.name}
                </a>
              </dd>
            </div>
          </dl>
        </InfoPageShell>
      </div>

      <div className="info-page-grid info-page-grid--2">
        <InfoPageShell title="Variáveis de ambiente">
          <div className="info-env-table">
            {ENV_VAR_DOCS.map(({ key, required, default: defaultValue, description, vercel }) => (
              <div key={key} className="info-env-table__row">
                <div className="info-env-table__head">
                  <code className="info-env-table__key">{key}</code>
                  <span className={`info-env-table__badge ${required ? 'info-env-table__badge--req' : 'info-env-table__badge--opt'}`}>
                    {required ? 'obrigatória' : 'opcional'}
                  </span>
                  {vercel && <span className="info-env-table__badge info-env-table__badge--vercel">Vercel</span>}
                </div>
                <p className="info-env-table__desc">{description}</p>
                <div className="info-env-table__values">
                  <span className="info-env-table__label">Atual</span>
                  <code className="info-env-table__val">{getEnvValue(key)}</code>
                  {!isEnvOverridden(key) && (
                    <span className="info-env-table__hint">(default embutido)</span>
                  )}
                </div>
                <div className="info-env-table__values">
                  <span className="info-env-table__label">Default</span>
                  <code className="info-env-table__val info-env-table__val--muted">{defaultValue}</code>
                </div>
              </div>
            ))}
          </div>
          <dl className="info-dl info-dl--compact info-env-meta">
            <div className="info-dl__row">
              <dt>Build mode</dt>
              <dd className="info-dl__mono">{ENV.mode}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Origem (CORS)</dt>
              <dd className="info-dl__mono info-dl__break">
                {typeof window !== 'undefined' ? window.location.origin : '—'}
              </dd>
            </div>
          </dl>
          <p className="info-note">
            <strong>Local:</strong> copie <code className="info-inline-code">.env.example</code> →{' '}
            <code className="info-inline-code">.env</code>
            <br />
            <strong>Vercel:</strong> Project Settings → Environment Variables → Production + Preview → redeploy após salvar.
          </p>
        </InfoPageShell>

        <InfoPageShell title="Timeouts & retries">
          <dl className="info-dl">
            <div className="info-dl__row">
              <dt>/health timeout</dt>
              <dd>{API_CONFIG.healthTimeout}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Health retries</dt>
              <dd>{API_CONFIG.healthRetries}</dd>
            </div>
            <div className="info-dl__row">
              <dt>/model/info timeout</dt>
              <dd>{API_CONFIG.metadataTimeout}</dd>
            </div>
            <div className="info-dl__row">
              <dt>/predict timeout</dt>
              <dd>{API_CONFIG.predictTimeout}</dd>
            </div>
          </dl>
        </InfoPageShell>
      </div>

      <InfoPageShell title="Arquitetura da requisição">
        <InfoChecklist items={ARCHITECTURE_STEPS} />
      </InfoPageShell>

      <InfoPageShell title="Endpoints da API">
        <div className="info-endpoints-table info-endpoints-table--rich">
          {API_ENDPOINTS.map(({ path, method, description, response }) => (
            <div key={path} className="info-endpoints-table__row info-endpoints-table__row--rich">
              <span className="info-endpoints-table__method">{method}</span>
              <code className="info-endpoints-table__path">{path}</code>
              <div className="info-endpoints-table__body">
                <span className="info-endpoints-table__desc">{description}</span>
                {response && (
                  <code className="info-endpoints-table__response">{response}</code>
                )}
              </div>
            </div>
          ))}
        </div>
      </InfoPageShell>

      <InfoPageShell title="Troubleshooting">
        <div className="info-trouble-list">
          {API_TROUBLESHOOTING.map(({ issue, fix }) => (
            <div key={issue} className="info-trouble-list__item">
              <span className="info-trouble-list__issue">{issue}</span>
              <span className="info-trouble-list__fix">{fix}</span>
            </div>
          ))}
        </div>
      </InfoPageShell>
    </div>
  );
}
