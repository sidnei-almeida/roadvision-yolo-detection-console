import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { runHealthGate } from './boot/healthGate';
import './styles/loading.css';
import './styles/tokens.css';
import './styles/animations.css';
import './styles/globals.css';
import './styles/premium.css';
import './styles/theme.css';
import { initTheme } from './utils/theme';
import App from './App.jsx';

initTheme();

await runHealthGate();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
