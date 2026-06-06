import ApiStatusPill from './ApiStatusPill';
import ThemeToggle from './ThemeToggle';
import { IconLivePulse } from './icons/PremiumIcons';
import { VIEW_META } from '../data/navigation';

export default function Header({ apiStatus, activeView = 'live' }) {
  const meta = VIEW_META[activeView] ?? VIEW_META.live;

  return (
    <header className="header page-header">
      <div className="header__content">
        <div className="header__title-row">
          {meta.showLivePulse && <IconLivePulse />}
          <h1 className="header__title">{meta.title}</h1>
        </div>
        <p className="header__subtitle">{meta.subtitle}</p>
      </div>
      <div className="header__actions header__status-row">
        <ApiStatusPill status={apiStatus} />
        <span className="header__model-tag">
          <span className="header__model-tag-slash">/</span>
          YOLOv8
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
