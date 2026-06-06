import { IconLegendBar } from './icons/PremiumIcons';
import { computeConfidenceDistribution } from '../utils/confidenceDistribution';

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const LEGEND_ITEMS = [
  { label: 'High (0.8–1.0)', key: 'high', color: 'var(--accent)', barH: 12 },
  { label: 'Medium (0.5–0.8)', key: 'medium', color: 'var(--color-warning)', barH: 8 },
  { label: 'Low (0.0–0.5)', key: 'low', color: 'var(--color-danger)', barH: 5 },
];

export default function ConfidenceDistribution({ detections = [] }) {
  const distribution = computeConfidenceDistribution(detections);
  const highPct = distribution.high;

  const segments = [
    { pct: distribution.high, color: 'var(--accent)', offset: 0, key: 'high' },
    { pct: distribution.medium, color: 'var(--color-warning)', offset: distribution.high, key: 'medium' },
    { pct: distribution.low, color: 'var(--color-danger)', offset: distribution.high + distribution.medium, key: 'low' },
  ];

  return (
    <div id="performance" className="lower-card info-card bottom-card animate-panel-bottom">
      <div className="lower-card__header info-card-header bottom-card-header">
        <h3 className="lower-card__title">Confidence Distribution</h3>
      </div>

      <div className="lower-confidence__body info-card-body bottom-card-body confidence-card-body">
        <div className="lower-confidence__ring">
          <svg className="lower-confidence__svg" viewBox="0 0 100 100">
            <defs>
              <filter id="gauge-glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="3"
            />
            {segments.map((seg) => {
              const dash = (seg.pct / 100) * CIRCUMFERENCE;
              const offset = -((seg.offset / 100) * CIRCUMFERENCE);
              const el = (
                <circle
                  key={seg.key}
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="3"
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  filter={seg.pct > 0 && seg.key === 'high' ? 'url(#gauge-glow)' : undefined}
                />
              );
              return el;
            })}
          </svg>
          <div className="lower-confidence__center">
            <span className="lower-confidence__center-value">{highPct}%</span>
          </div>
        </div>

        <div className="lower-confidence__legend">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.key} className={`lower-confidence__legend-item lower-confidence__legend-item--${item.key}`}>
              <span className="lower-confidence__legend-left">
                <IconLegendBar height={item.barH} color={item.color} />
                <span className="lower-confidence__legend-label">{item.label}</span>
              </span>
              <span className="lower-confidence__legend-pct">{distribution[item.key]}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
