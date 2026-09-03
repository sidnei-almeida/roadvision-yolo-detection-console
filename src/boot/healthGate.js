/**
 * Tela de boot: em vez de pingar um backend, agora acompanha o download dos
 * pesos ONNX, a compilação da sessão e o warmup — com progresso real.
 */
import { loadEngine } from '../services/inference/session';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Faixas da barra por fase. O download domina o tempo total (~12 MB).
const PHASE_RANGE = {
  download: [8, 80],
  compile: [80, 92],
  warmup: [92, 98],
  ready: [98, 100],
};

const PHASE_LABEL = {
  download: 'Downloading model weights',
  compile: 'Compiling inference graph',
  warmup: 'Warming up detector',
  ready: 'Inference engine online',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatMb(bytes) {
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

export function runHealthGate() {
  const screen = document.getElementById('loadingScreen');
  const statusText = document.getElementById('loadingStatusText');
  const subText = document.getElementById('loadingSubText');
  const bar = document.getElementById('loadingBarFill');
  const dot = document.querySelector('.loading-dot');

  if (!screen || !statusText || !subText || !bar || !dot) {
    document.body.classList.add('app-ready');
    return Promise.resolve();
  }

  document.body.classList.add('boot-loading');

  screen.addEventListener('click', (e) => e.stopPropagation());

  const setStatus = (text, barPct) => {
    statusText.textContent = text;
    bar.style.width = `${barPct}%`;
  };

  const setError = (text) => {
    dot.className = 'loading-dot error';
    statusText.style.color = '#FF4D4D';
    statusText.textContent = text;
    subText.textContent = 'Retrying in 2s...';
  };

  const dismiss = () =>
    new Promise((resolve) => {
      dot.className = 'loading-dot ready';
      statusText.style.color = '#7A8899';
      setStatus('Inference engine online', 100);
      subText.textContent = 'Ready — running locally in your browser';

      setTimeout(() => {
        screen.classList.add('fade-out');
        setTimeout(() => {
          screen.classList.add('hidden');
          document.body.classList.remove('boot-loading');
          setTimeout(() => {
            document.body.classList.add('app-ready');
          }, 50);
          resolve();
        }, 650);
      }, 600);
    });

  const onProgress = ({ phase, ratio = 0, loaded, total }) => {
    const [start, end] = PHASE_RANGE[phase] || PHASE_RANGE.download;
    const pct = start + (end - start) * Math.max(0, Math.min(1, ratio));

    dot.className = 'loading-dot';
    statusText.style.color = '#7A8899';
    bar.classList.remove('error');

    setStatus(PHASE_LABEL[phase] || 'Loading…', pct);

    if (phase === 'download' && total) {
      subText.textContent = `${formatMb(loaded)} / ${formatMb(total)} · YOLOv8 ONNX`;
    } else if (phase === 'compile') {
      subText.textContent = 'ONNX Runtime Web · WASM SIMD';
    } else if (phase === 'warmup') {
      subText.textContent = 'First inference pass';
    }
  };

  return (async () => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      if (attempt > 1) {
        setStatus(`Retrying… (${attempt}/${MAX_RETRIES})`, 8);
      } else {
        setStatus('Loading inference engine…', 4);
        subText.textContent = 'YOLOv8 · Traffic Sign Detection';
      }

      try {
        await loadEngine({ onProgress });
        window.__ROADVISION_API_READY__ = true;
        await dismiss();
        return;
      } catch (error) {
        console.error('[RoadVision Boot] Falha ao carregar a engine local:', error);
        setError('Cannot load detection model');
      }

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
      }
    }

    dot.className = 'loading-dot error';
    statusText.style.color = '#FF4D4D';
    statusText.textContent = 'Detection model unavailable';
    subText.innerHTML =
      'Model weights or WASM runtime failed to load —&nbsp;' +
      '<a href="" onclick="location.reload(); return false;">reload</a>';
    bar.style.width = '100%';
    bar.classList.add('error');
  })();
}
