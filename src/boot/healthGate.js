import { ENV } from '../config/env';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;
const ATTEMPT_TIMEOUT_MS = 4000;

function getHealthUrl() {
  return `${ENV.apiBaseUrl.replace(/\/$/, '')}/health`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
      subText.textContent = 'Ready';

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

  return (async () => {
    const healthUrl = getHealthUrl();
    const fakeProgress = [10, 25, 40];
    let fakeIdx = 0;

    const fakeTimer = setInterval(() => {
      if (fakeIdx < fakeProgress.length) {
        bar.style.width = `${fakeProgress[fakeIdx++]}%`;
      }
    }, 600);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      setStatus(
        attempt === 1
          ? 'Connecting to inference engine...'
          : `Retrying... (${attempt}/${MAX_RETRIES})`,
        Math.min(10 + attempt * 8, 85)
      );

      dot.className = 'loading-dot';
      statusText.style.color = '#7A8899';
      bar.classList.remove('error');

      try {
        const res = await fetch(healthUrl, {
          method: 'GET',
          cache: 'no-store',
          signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
        });

        if (res.ok) {
          clearInterval(fakeTimer);
          window.__ROADVISION_API_READY__ = true;
          await dismiss();
          return;
        }

        setError(`Engine not ready (${res.status})`);
      } catch {
        setError('Cannot reach inference engine');
      }

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
      }
    }

    clearInterval(fakeTimer);
    dot.className = 'loading-dot error';
    statusText.style.color = '#FF4D4D';
    statusText.textContent = 'Inference engine unavailable';
    subText.innerHTML =
      'Check that the API is running, then&nbsp;' +
      '<a href="" onclick="location.reload(); return false;">reload</a>';
    bar.style.width = '100%';
    bar.classList.add('error');
  })();
}
