import { formatClassLabel } from '../../utils/classColors';

export function IconClassStop({ className = '' }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" className={className} aria-hidden="true">
      <polygon
        points="3.5,1 6.5,1 9,3.5 9,6.5 6.5,9 3.5,9 1,6.5 1,3.5"
        fill="none"
        stroke="#FF4D4D"
        strokeWidth="0.75"
      />
    </svg>
  );
}

export function IconClassTrafficLight({ className = '' }) {
  return (
    <svg width="8" height="13" viewBox="0 0 8 13" className={className} aria-hidden="true">
      <rect
        x="0.5"
        y="0.5"
        width="7"
        height="12"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.4"
      />
      <circle cx="4" cy="3" r="1.2" fill="currentColor" opacity="0.2" />
      <circle cx="4" cy="6.5" r="1.2" fill="currentColor" opacity="0.2" />
      <circle cx="4" cy="10" r="1.2" fill="#00FF87" />
    </svg>
  );
}

export function IconClassCrosswalk({ className = '' }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" className={className} aria-hidden="true">
      <rect x="1" y="2" width="8" height="1.2" fill="currentColor" opacity="0.85" />
      <rect x="1" y="4" width="8" height="1.2" fill="currentColor" opacity="0.55" />
      <rect x="1" y="6" width="8" height="1.2" fill="currentColor" opacity="0.85" />
      <rect x="1" y="8" width="8" height="1.2" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

export function IconClassSpeedLimit({ className = '' }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" className={className} aria-hidden="true">
      <circle cx="5" cy="5" r="4" fill="none" stroke="#4DA6FF" strokeWidth="0.75" />
      <text x="5" y="6.5" textAnchor="middle" fontSize="4" fill="#4DA6FF" fontFamily="monospace">
        50
      </text>
    </svg>
  );
}

export function DetectionClassIcon({ detectionClass }) {
  const key = formatClassLabel(detectionClass).toLowerCase();

  if (key.includes('stop')) {
    return <IconClassStop className="detection-class-icon" />;
  }
  if (key.includes('traffic')) {
    return <IconClassTrafficLight className="detection-class-icon detection-class-icon--traffic" />;
  }
  if (key.includes('cross')) {
    return <IconClassCrosswalk className="detection-class-icon detection-class-icon--crosswalk" />;
  }
  if (key.includes('speed')) {
    return <IconClassSpeedLimit className="detection-class-icon" />;
  }

  return <IconClassSpeedLimit className="detection-class-icon" />;
}

export function IconTypeRegulatory({ className = '' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className={className} aria-hidden="true">
      <polygon
        points="4.5,1 7.5,1 11,4.5 11,7.5 7.5,11 4.5,11 1,7.5 1,4.5"
        fill="none"
        stroke="#FF4D4D"
        strokeWidth="0.75"
      />
    </svg>
  );
}

export function IconTypeInformational({ className = '' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="5" fill="none" stroke="#4DA6FF" strokeWidth="0.75" />
      <line x1="6" y1="5" x2="6" y2="8.5" stroke="#4DA6FF" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="6" cy="3.5" r="0.8" fill="#4DA6FF" />
    </svg>
  );
}

export function IconTypeWarning({ className = '' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className={className} aria-hidden="true">
      <polygon points="6,1.5 11,10.5 1,10.5" fill="none" stroke="#FFB800" strokeWidth="0.75" />
      <line x1="6" y1="5" x2="6" y2="8" stroke="#FFB800" strokeWidth="1" strokeLinecap="round" />
      <circle cx="6" cy="9.5" r="0.6" fill="#FFB800" />
    </svg>
  );
}

export function DetectionTypeIcon({ type }) {
  const normalized = (type || '').toLowerCase();
  const title =
    normalized === 'regulatory'
      ? 'Regulatory sign'
      : normalized === 'warning'
        ? 'Warning sign'
        : 'Informational sign';

  const Icon =
    normalized === 'regulatory'
      ? IconTypeRegulatory
      : normalized === 'warning'
        ? IconTypeWarning
        : IconTypeInformational;

  return (
    <span className="detected-signs__type-icon" title={title}>
      <Icon className="detected-signs__type-svg" />
    </span>
  );
}
