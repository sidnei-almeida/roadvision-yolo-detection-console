import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/animations.css';
import './styles/globals.css';
import './styles/premium.css';
import './styles/theme.css';
import { initTheme } from './utils/theme';
import App from './App.jsx';

initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
