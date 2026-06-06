import { IconLogInfo } from '../icons/PremiumIcons';
import { LOG_EVENT_TYPES } from '../../data/roadSignProject';
import InfoPageShell from './InfoPageShell';

function LogMessage({ message, count }) {
  const match = message.match(/^(Image processed)\s*[—–-]\s*(\d+)\s*(signs detected)/i);

  if (match) {
    const signCount = match[2] ?? count;
    return (
      <span>
        {match[1]} — <span className="info-logs__count">{signCount}</span> sign
        {signCount !== '1' ? 's' : ''} detected
      </span>
    );
  }

  return <span>{message}</span>;
}

function computeLogStats(logs) {
  if (!logs.length) {
    return { totalSigns: 0, avgSigns: 0, maxSigns: 0, minSigns: 0 };
  }
  const counts = logs.map((l) => l.count ?? 0);
  const totalSigns = counts.reduce((a, b) => a + b, 0);
  return {
    totalSigns,
    avgSigns: (totalSigns / logs.length).toFixed(1),
    maxSigns: Math.max(...counts),
    minSigns: Math.min(...counts),
  };
}

export default function InferenceLogsPage({ logs = [] }) {
  const { totalSigns, avgSigns, maxSigns, minSigns } = computeLogStats(logs);
  const zeroDetectionRuns = logs.filter((l) => (l.count ?? 0) === 0).length;

  return (
    <div className="info-page-layout animate-in">
      <div className="info-page-grid info-page-grid--2">
        <InfoPageShell title="Resumo da sessão">
          <div className="info-metric-grid">
            <div className="info-metric-card">
              <span className="info-metric-card__val">{logs.length}</span>
              <span className="info-metric-card__label">Predições</span>
            </div>
            <div className="info-metric-card info-metric-card--accent">
              <span className="info-metric-card__val">{totalSigns}</span>
              <span className="info-metric-card__label">Placas total</span>
            </div>
            <div className="info-metric-card">
              <span className="info-metric-card__val">{avgSigns}</span>
              <span className="info-metric-card__label">Média/run</span>
            </div>
            <div className="info-metric-card">
              <span className="info-metric-card__val">{maxSigns}</span>
              <span className="info-metric-card__label">Máx/run</span>
            </div>
          </div>
          <dl className="info-dl info-dl--compact">
            <div className="info-dl__row">
              <dt>Mín. detecções/run</dt>
              <dd>{logs.length ? minSigns : '—'}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Runs sem detecção</dt>
              <dd>{zeroDetectionRuns}</dd>
            </div>
          </dl>
          <p className="info-note">
            Logs gerados no browser após cada inferência bem-sucedida. O card do dashboard
            mantém as últimas 8 entradas; esta página mostra o histórico completo da sessão.
          </p>
        </InfoPageShell>

        <InfoPageShell title="Ciclo de inferência">
          <ol className="info-pipeline">
            <li className="info-pipeline__item">
              <span className="info-pipeline__step">1</span>
              <div className="info-pipeline__content">
                <span className="info-pipeline__label">Upload / Sample</span>
                <span className="info-pipeline__detail">Imagem enviada via POST /predict</span>
              </div>
            </li>
            <li className="info-pipeline__item">
              <span className="info-pipeline__step">2</span>
              <div className="info-pipeline__content">
                <span className="info-pipeline__label">YOLOv8 inferência</span>
                <span className="info-pipeline__detail">Backend retorna bboxes + classes + scores</span>
              </div>
            </li>
            <li className="info-pipeline__item">
              <span className="info-pipeline__step">3</span>
              <div className="info-pipeline__content">
                <span className="info-pipeline__label">UI update</span>
                <span className="info-pipeline__detail">Canvas, summary e log local atualizados</span>
              </div>
            </li>
          </ol>
          <dl className="info-dl info-dl--compact">
            <div className="info-dl__row">
              <dt>Formato</dt>
              <dd>[HH:MM:SS] Image processed — N signs detected</dd>
            </div>
            <div className="info-dl__row">
              <dt>Timezone</dt>
              <dd>Local do browser</dd>
            </div>
          </dl>
        </InfoPageShell>
      </div>

      <InfoPageShell title="Tipos de evento (sistema)">
        <div className="info-endpoints-table">
          {LOG_EVENT_TYPES.map(({ event, desc }) => (
            <div key={event} className="info-endpoints-table__row">
              <span className="info-endpoints-table__method">LOG</span>
              <code className="info-endpoints-table__path">{event}</code>
              <span className="info-endpoints-table__desc">{desc}</span>
            </div>
          ))}
        </div>
      </InfoPageShell>

      <InfoPageShell title={`Histórico completo [${logs.length}]`}>
        <div className="info-logs-terminal info-logs-terminal--tall">
          {logs.length === 0 ? (
            <p className="info-logs__empty">
              Nenhuma inferência registrada. Vá em Live Detection, selecione uma amostra ou
              faça upload de uma imagem com placas de trânsito.
            </p>
          ) : (
            logs.map((log, index) => (
              <div key={log.id} className="info-logs__entry">
                <span className="info-logs__prompt" aria-hidden="true">
                  ›
                </span>
                <span className="info-logs__index">#{logs.length - index}</span>
                <span className="info-logs__time">[{log.time}]</span>
                <IconLogInfo size={11} className="info-logs__icon" />
                <LogMessage message={log.message} count={log.count} />
                {index === 0 && <span className="log-cursor" aria-hidden="true" />}
              </div>
            ))
          )}
        </div>
      </InfoPageShell>
    </div>
  );
}
