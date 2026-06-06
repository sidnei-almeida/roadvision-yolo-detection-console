export function formatConfidence(value) {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatProcessingTime(ms) {
  return `${Math.round(ms)} ms`;
}

export function formatTimestamp(date = new Date()) {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatClassName(className) {
  return className.replace(/_/g, ' ');
}
