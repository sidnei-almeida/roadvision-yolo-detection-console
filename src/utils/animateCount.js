export function animateCount(from, to, duration, setter) {
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - (1 - progress) ** 3;
    const current = from + (to - from) * ease;

    if (progress < 1) {
      setter(current);
      requestAnimationFrame(step);
    } else {
      setter(to);
    }
  }

  requestAnimationFrame(step);
}
