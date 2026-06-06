const EMPTY_DISTRIBUTION = { high: 0, medium: 0, low: 0 };

export function computeConfidenceDistribution(detections = []) {
  if (!detections.length) return EMPTY_DISTRIBUTION;

  let high = 0;
  let medium = 0;
  let low = 0;

  for (const d of detections) {
    if (d.confidence >= 0.8) high++;
    else if (d.confidence >= 0.5) medium++;
    else low++;
  }

  const total = detections.length;
  return {
    high: Math.round((high / total) * 100),
    medium: Math.round((medium / total) * 100),
    low: Math.round((low / total) * 100),
  };
}
