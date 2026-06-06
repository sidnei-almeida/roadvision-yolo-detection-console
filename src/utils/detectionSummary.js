export function getDetectionSummary(detections, processingTime) {
  const count = detections.length;
  const avgConfidence =
    count > 0
      ? detections.reduce((sum, d) => sum + d.confidence, 0) / count
      : 0;
  const topClass =
    count > 0
      ? detections.reduce((top, d) => (d.confidence > top.confidence ? d : top), detections[0])
          .className
      : '—';

  return {
    signsDetected: count,
    avgConfidence,
    topClass,
    processingTime,
  };
}
