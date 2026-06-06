export default function InfoPageShell({ title, children, className = '' }) {
  return (
    <section className={`info-page ${className}`.trim()}>
      {title && <h2 className="info-page__section-title">{title}</h2>}
      {children}
    </section>
  );
}
