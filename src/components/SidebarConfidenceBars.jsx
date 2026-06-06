import { computeConfidenceDistribution } from '../utils/confidenceDistribution';

const BARS = [
  { key: 'high', label: 'High', color: 'var(--accent)' },
  { key: 'medium', label: 'Medium', color: 'var(--color-warning)' },
  { key: 'low', label: 'Low', color: 'var(--color-danger)' },
];

export default function SidebarConfidenceBars({ detections = [], embedded = false }) {
  const distribution = computeConfidenceDistribution(detections);

  return (
    <section
      className={`sidebar-confidence ${embedded ? 'sidebar-confidence--embedded' : ''}`.trim()}
      aria-label="Confidence distribution"
    >
      {!embedded && <h4 className="sidebar-confidence__title">Confidence distribution</h4>}
      {BARS.map(({ key, label, color }) => (
        <div key={key} className="sidebar-confidence__row">
          <span className="sidebar-confidence__label">{label}</span>
          <div className="sidebar-confidence__track">
            <div
              className="sidebar-confidence__fill"
              style={{ width: `${distribution[key]}%`, background: color }}
            />
          </div>
          <span className="sidebar-confidence__pct">{distribution[key]}%</span>
        </div>
      ))}
    </section>
  );
}
