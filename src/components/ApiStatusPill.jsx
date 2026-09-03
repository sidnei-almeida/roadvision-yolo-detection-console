const STATUS_CONFIG = {
  checking: { label: 'LOCAL', modifier: 'header-api-status--checking' },
  online: { label: 'LOCAL', modifier: 'header-api-status--online' },
  offline: { label: 'LOCAL', modifier: 'header-api-status--offline' },
  waking: { label: 'LOCAL', modifier: 'header-api-status--waking' },
};

export default function ApiStatusPill({ status = 'checking' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.checking;

  return (
    <span className={`header-api-status ${config.modifier}`}>
      <span className="header-api-status__dot" aria-hidden="true" />
      {config.label}
    </span>
  );
}
