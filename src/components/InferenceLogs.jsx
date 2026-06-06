import { IconArrowRight, IconLogInfo } from './icons/PremiumIcons';

function LogMessage({ message, count }) {
  const match = message.match(/^(Image processed)\s*[—–-]\s*(\d+)\s*(signs detected)/i);

  if (match) {
    const signCount = match[2] ?? count;
    return (
      <span className="lower-logs__message">
        {match[1]} — <span className="lower-logs__msg-count">{signCount}</span> signs detected
      </span>
    );
  }

  return <span className="lower-logs__message">{message}</span>;
}

export default function InferenceLogs({ logs = [], onViewAll }) {
  const total = logs.length;

  return (
    <div id="logs" className="lower-card info-card bottom-card animate-panel-bottom">
      <div className="lower-card__header lower-card__header--split info-card-header bottom-card-header">
        <div className="lower-card__header-left">
          <h3 className="lower-card__title">Inference Logs</h3>
        </div>
        <span className="lower-card__count-bracket">[{total}]</span>
      </div>

      <div className="lower-logs__body info-card-body bottom-card-body logs-card-body">
        {logs.map((log, index) => (
          <div
            key={log.id}
            className={`lower-logs__entry ${index === logs.length - 1 ? 'lower-logs__entry--last' : ''}`}
          >
            <div className="lower-logs__entry-left">
              <span className="lower-logs__time">{log.time}</span>
              <span className="lower-logs__sep" aria-hidden="true" />
              <IconLogInfo size={10} />
              <LogMessage message={log.message} count={log.count} />
              {index === logs.length - 1 && <span className="log-cursor" aria-hidden="true" />}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="lower-card__footer-btn view-all-btn"
        onClick={onViewAll}
        disabled={!onViewAll}
      >
        View all {total} log{total !== 1 ? 's' : ''}
        <IconArrowRight size={12} />
      </button>
    </div>
  );
}
