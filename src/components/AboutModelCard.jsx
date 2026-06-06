import { MODEL_HIGHLIGHTS, MODEL_TAGS } from '../data/roadSignProject';

export default function AboutModelCard() {
  return (
    <div id="dataset" className="lower-card info-card bottom-card">
      <div className="lower-card__header info-card-header bottom-card-header">
        <h3 className="lower-card__title">About this Model</h3>
      </div>

      <div className="about-card__body info-card-body bottom-card-body">
        <div className="about-card__highlights">
          {MODEL_HIGHLIGHTS.map(({ label, value }) => (
            <div key={label} className="about-card__row">
              <span className="about-card__row-label">{label}</span>
              <span className="about-card__row-value">{value}</span>
            </div>
          ))}
        </div>

        <div className="about-card__tags">
          {MODEL_TAGS.map(({ label, accent }) => (
            <span
              key={label}
              className={`about-card__tag ${accent ? 'about-card__tag--accent' : ''}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
