import { animateCount } from './animateCount';

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

function replayAnimation(el, animation) {
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = animation;
}

function animateCountUp(elementId, from, to, duration, decimals = 0, suffix = '') {
  const el = document.getElementById(elementId);
  if (!el) return;

  animateCount(from, to, duration, (current) => {
    el.textContent = decimals
      ? `${current.toFixed(decimals)}${suffix}`
      : String(Math.round(current));
  });
}

export function triggerDetectionAnimations({ signsDetected, avgConfidence } = {}) {
  requestAnimationFrame(() => {
    const canvas = document.getElementById('detectionCanvas');
    if (canvas) {
      replayAnimation(canvas, `fadeIn 300ms ${EASE} both`);
    }

    document.querySelectorAll('.det-row').forEach((el, i) => {
      replayAnimation(el, `fadeUp 300ms ${EASE} ${i * 60}ms both`);
    });

    document.querySelectorAll('.det-row .bar-fill').forEach((el, i) => {
      const targetWidth = el.dataset.width || el.style.width;
      if (!targetWidth) return;

      el.classList.add('bar-animating');
      el.style.width = '0%';
      el.style.opacity = '0';

      setTimeout(() => {
        el.style.width = targetWidth;
        el.style.opacity = '1';
      }, 100 + i * 60);
    });

    document.querySelectorAll('.sidebar-confidence__fill').forEach((el, i) => {
      const targetWidth = el.dataset.width || el.style.width;
      if (!targetWidth) return;

      el.style.transition = `width 500ms ${EASE}, opacity 200ms ease`;
      el.style.width = '0%';
      el.style.opacity = '0';

      setTimeout(() => {
        el.style.width = targetWidth;
        el.style.opacity = '1';
      }, 180 + i * 50);
    });

    if (signsDetected != null) {
      animateCountUp('statSignsDetected', 0, signsDetected, 600);
    }

    if (avgConfidence != null) {
      animateCountUp('statConfidence', 0, avgConfidence * 100, 700, 1, '%');
    }
  });
}
