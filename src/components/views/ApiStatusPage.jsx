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

const MODEL_URL = ENV.modelUrl;

const STATUS_COPY = {
  online: 'Sessão ONNX ativa no browser — inferência local, sem rede.',
  offline: 'Modelo não carregou — nenhuma detecção será exibida até o recarregamento.',
  checking: 'Baixando os pesos e compilando o grafo de inferência…',
  waking: 'Warmup em andamento — a primeira inferência é a mais lenta.',
};

const ARCHITECTURE_STEPS = [
  'Vercel serve /models/road-signs-yolo.onnx como asset estático',
  'ONNX Runtime Web compila o grafo em WASM SIMD (uma vez por visita)',
  'Canvas letterbox 416×416 → tensor float32 NCHW',
  'InferenceSession.run() → decode anchor-free + NMS por classe',
  'Detecções em pixels → overlay no canvas',
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
                <dt>Pesos</dt>
                <dd className="info-dl__mono info-dl__break">{MODEL_URL}</dd>
              </div>
              <div className="info-dl__row">
                <dt>Estado poll</dt>
                <dd>A cada {API_CONFIG.pollInterval}</dd>
              </div>
              <div className="info-dl__row">
                <dt>Rede</dt>
                <dd>{API_CONFIG.network}</dd>
              </div>
              <div className="info-dl__row">
                <dt>Deploy</dt>
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
              <dt>Runtime</dt>
              <dd>{metadata?.backend ?? YOLO_MODEL.runtime}</dd>
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
              <dt>Origem</dt>
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
            <br />
            Todas são opcionais — o app funciona sem nenhuma variável definida.
          </p>
        </InfoPageShell>

        <InfoPageShell title="Ciclo de carregamento">
          <dl className="info-dl">
            <div className="info-dl__row">
              <dt>Download dos pesos</dt>
              <dd>{API_CONFIG.weightsFetch}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Init da sessão</dt>
              <dd>{API_CONFIG.sessionInit}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Retries no boot</dt>
              <dd>{API_CONFIG.bootRetries}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Threads WASM</dt>
              <dd className="info-dl__mono">{ENV.threads}</dd>
            </div>
          </dl>
        </InfoPageShell>
      </div>

      <InfoPageShell title="Pipeline de inferência">
        <InfoChecklist items={ARCHITECTURE_STEPS} />
      </InfoPageShell>

      <InfoPageShell title="Assets e chamadas">
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
