export function InfoTagList({ tags = [] }) {
  return (
    <div className="info-tag-list">
      {tags.map((tag) => (
        <span key={tag} className="info-tag-list__item">
          {tag}
        </span>
      ))}
    </div>
  );
}

export function InfoChecklist({ items = [] }) {
  return (
    <ul className="info-checklist">
      {items.map((item) => (
        <li key={item} className="info-checklist__item">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function InfoVariantTable({
  rows = [],
  headers = ['Variant', 'Params', 'Speed', 'Use case'],
}) {
  return (
    <div className="info-variant-table">
      <div className="info-variant-table__head">
        {headers.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row.name} className="info-variant-table__row">
          <span className="info-variant-table__name">{row.name}</span>
          <span>{row.params}</span>
          <span>{row.speed}</span>
          <span className="info-variant-table__use">{row.use}</span>
        </div>
      ))}
    </div>
  );
}

export function InfoDistBars({ items = [] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="info-dist-bars">
      {items.map(({ label, value, color, sublabel }) => (
        <div key={label} className="info-dist-bars__row">
          <div className="info-dist-bars__meta">
            <span className="info-dist-bars__label">{label}</span>
            {sublabel && <span className="info-dist-bars__sub">{sublabel}</span>}
          </div>
          <div className="info-dist-bars__track">
            <div
              className="info-dist-bars__fill"
              style={{ width: `${(value / max) * 100}%`, background: color }}
            />
          </div>
          <span className="info-dist-bars__val">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function InfoCitation({ text }) {
  return (
    <blockquote className="info-citation">
      <span className="info-citation__mark">"</span>
      {text}
    </blockquote>
  );
}
