export function IconRadar({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="2" fill="currentColor" />
      <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="8" cy="8" r="7.5" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
    </svg>
  );
}

export function IconNeuralNet({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="3" cy="5" r="1.5" fill="currentColor" />
      <circle cx="3" cy="11" r="1.5" fill="currentColor" />
      <circle cx="8" cy="3" r="1.5" fill="currentColor" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8" cy="13" r="1.5" fill="currentColor" />
      <circle cx="13" cy="6" r="1.5" fill="currentColor" />
      <circle cx="13" cy="10" r="1.5" fill="currentColor" />
      <line x1="3" y1="5" x2="8" y2="3" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="3" y1="5" x2="8" y2="8" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="3" y1="11" x2="8" y2="8" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="3" y1="11" x2="8" y2="13" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="8" y1="3" x2="13" y2="6" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="8" y1="8" x2="13" y2="6" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="8" y1="8" x2="13" y2="10" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="8" y1="13" x2="13" y2="10" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
    </svg>
  );
}

export function IconGrid({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function IconBarChart({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
      <rect x="1" y="9" width="3" height="6" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="6" y="5" width="3" height="10" rx="0.5" fill="currentColor" opacity="0.75" />
      <rect x="11" y="2" width="3" height="13" rx="0.5" fill="currentColor" />
    </svg>
  );
}

export function IconTerminal({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
      <rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
      <polyline points="4,6 7,8 4,10" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="8" y1="10" x2="12" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function IconSignal({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="M3 13 C3 13 5 11 8 11 C11 11 13 13 13 13" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M5 10 C5 10 6 8.5 8 8.5 C10 8.5 11 10 11 10" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="8" cy="6.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function IconLivePulse({ className = '' }) {
  return (
    <span className={`live-pulse ${className}`.trim()} aria-hidden="true">
      <span className="live-pulse__core" />
      <span className="live-pulse__ring live-pulse__ring--1" />
      <span className="live-pulse__ring live-pulse__ring--2" />
    </span>
  );
}

export function IconClock({ size = 12, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
      <polyline points="6,3 6,6 8,7.5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function IconDownload({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" className={className} aria-hidden="true">
      <line x1="7" y1="1" x2="7" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <polyline points="3,6 7,10 11,6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconFullscreen({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" className={className} aria-hidden="true">
      <polyline points="1,5 1,1 5,1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="9,1 13,1 13,5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="1,9 1,13 5,13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="9,13 13,13 13,9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconArrowRight({ size = 12, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className} aria-hidden="true">
      <line x1="1" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <polyline points="6,2 10,6 6,10" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTrafficLight({ size = 10, className = '', activeColor = '#00FF87' }) {
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 10 16" className={className} aria-hidden="true">
      <rect x="1" y="1" width="8" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <circle cx="5" cy="4.5" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="5" cy="8" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="5" cy="11.5" r="1.5" fill={activeColor} />
    </svg>
  );
}

export function IconTypeInfo({ size = 12, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="6" y1="5" x2="6" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="6" cy="3.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function IconTypeRegulatory({ size = 12, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className} aria-hidden="true">
      <polygon points="6,1 11,4 11,8 6,11 1,8 1,4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

export function IconTypeWarning({ size = 12, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className} aria-hidden="true">
      <polygon points="6,1 11,10 1,10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="6" y1="4.5" x2="6" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="6" cy="8.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function IconCube({ size = 10, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" className={className} aria-hidden="true">
      <polygon points="5,1 9,3 9,7 5,9 1,7 1,3" fill="none" stroke="currentColor" strokeWidth="0.75" />
      <line x1="5" y1="1" x2="5" y2="5" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="1" y1="3" x2="5" y2="5" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="9" y1="3" x2="5" y2="5" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
    </svg>
  );
}

export function IconCpuChip({ size = 10, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" className={className} aria-hidden="true">
      <rect x="2" y="2" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="0.75" />
      <rect x="3.5" y="3.5" width="3" height="3" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="4" y1="2" x2="4" y2="0.5" stroke="currentColor" strokeWidth="0.75" />
      <line x1="6" y1="2" x2="6" y2="0.5" stroke="currentColor" strokeWidth="0.75" />
      <line x1="4" y1="8" x2="4" y2="9.5" stroke="currentColor" strokeWidth="0.75" />
      <line x1="6" y1="8" x2="6" y2="9.5" stroke="currentColor" strokeWidth="0.75" />
      <line x1="2" y1="4" x2="0.5" y2="4" stroke="currentColor" strokeWidth="0.75" />
      <line x1="2" y1="6" x2="0.5" y2="6" stroke="currentColor" strokeWidth="0.75" />
      <line x1="8" y1="4" x2="9.5" y2="4" stroke="currentColor" strokeWidth="0.75" />
      <line x1="8" y1="6" x2="9.5" y2="6" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

export function IconExternalLink({ size = 10, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" className={className} aria-hidden="true">
      <path d="M4,2 H2 A1,1 0 0,0 1,3 V8 A1,1 0 0,0 2,9 H7 A1,1 0 0,0 8,8 V6" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <polyline points="6,1 9,1 9,4" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9" y1="1" x2="5" y2="5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconSpeedLimit({ size = 10, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" className={className} aria-hidden="true">
      <circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" strokeWidth="0.75" />
      <text x="5" y="7" textAnchor="middle" fontSize="5" fill="currentColor">50</text>
    </svg>
  );
}

export function IconCrosswalk({ size = 10, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" className={className} aria-hidden="true">
      <rect x="1" y="3" width="8" height="1.5" fill="currentColor" opacity="0.8" />
      <rect x="1" y="5.5" width="8" height="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function IconStop({ size = 10, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" className={className} aria-hidden="true">
      <polygon points="3.5,1 6.5,1 9,3.5 9,6.5 6.5,9 3.5,9 1,6.5 1,3.5" fill="none" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

export function IconLogInfo({ size = 10, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" className={className} aria-hidden="true">
      <circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
      <circle cx="5" cy="5" r="1.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function IconSettings({ size = 15, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconLegendBar({ height = 12, color = '#00FF87', className = '' }) {
  return (
    <svg width="3" height={height} viewBox={`0 0 3 ${height}`} className={className} aria-hidden="true">
      <rect width="3" height={height} rx="1.5" fill={color} />
    </svg>
  );
}
