import { NAV_ITEMS } from '../data/navigation';

const LogoIcon = NAV_ITEMS[0].Icon;

export default function Sidebar({ isOpen, onClose, activeView, onNavigate }) {
  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar app-sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__logo-area">
          <LogoIcon size={18} className="sidebar__logo-mark" />
          <div className="sidebar__logo-text">
            <span className="sidebar__title">RoadVision</span>
            <div className="sidebar__version-dots" aria-hidden="true">
              <span /><span /><span />
            </div>
          </div>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`sidebar__nav-item ${activeView === id ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => {
                onNavigate(id);
                onClose();
              }}
            >
              <Icon className="sidebar__nav-icon" />
              {label}
            </button>
          ))}
        </nav>

        <footer className="sidebar__footer">
          <div className="sidebar__footer-divider" />
          <p className="sidebar__footer-tagline">
            <span>Computer Vision</span>
            <span>for Safer Roads</span>
          </p>
        </footer>
      </aside>
    </>
  );
}
