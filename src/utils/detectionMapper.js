export const API_CLASS_CONFIG = {
  Speedlimit:   { type: 'Regulatory',    color: '#00d4ff' },
  Stop:         { type: 'Regulatory',    color: '#ff4444' },
  Crosswalk:    { type: 'Warning',       color: '#00ff87' },
  Trafficlight: { type: 'Informational', color: '#ffb800' },
};

export function normalizeClassName(className) {
  if (!className) return 'unknown';
  return className.replace(/\s+/g, '');
}

export function getClassConfig(className) {
  const key = normalizeClassName(className);
  return (
    API_CLASS_CONFIG[key] || {
      type: 'Regulatory',
      color: '#C8F230',
    }
  );
}

export function getPixelBboxCoords(pixelBbox) {
  if (!pixelBbox) return null;

  const x1 = Math.round(pixelBbox.x1 ?? pixelBbox.x ?? 0);
  const y1 = Math.round(pixelBbox.y1 ?? pixelBbox.y ?? 0);
  const x2 = Math.round(pixelBbox.x2 ?? x1 + (pixelBbox.width ?? 0));
  const y2 = Math.round(pixelBbox.y2 ?? y1 + (pixelBbox.height ?? 0));

  return {
    x1,
    y1,
    x2,
    y2,
    area: (x2 - x1) * (y2 - y1),
  };
}

export function pixelBboxToPercent(bbox, imageWidth, imageHeight) {
  const { x1, y1, x2, y2 } = bbox;
  return {
    x: (x1 / imageWidth) * 100,
    y: (y1 / imageHeight) * 100,
    width: ((x2 - x1) / imageWidth) * 100,
    height: ((y2 - y1) / imageHeight) * 100,
  };
}

export function mapApiDetections(apiDetections, imageWidth, imageHeight) {
  return (apiDetections || []).map((d, i) => {
    const className = d.class_name || d.className || 'unknown';
    const config = getClassConfig(className);
    const pixelBbox = d.bounding_box || d.bbox;

    return {
      id: i + 1,
      className,
      confidence: d.confidence,
      type: config.type,
      color: config.color,
      bbox: pixelBboxToPercent(pixelBbox, imageWidth, imageHeight),
      pixelBbox,
    };
  });
}

export function mapApiMetadata(apiData) {
  const classes = apiData.class_names || apiData.classes || [];
  return {
    model: 'YOLOv8 Custom',
    task: 'Object Detection',
    inputSize: '640 × 640',
    classes: `${classes.length} Traffic Signs (${classes.join(', ')})`,
    backend: `PyTorch ${apiData.torch_version || ''} + Ultralytics ${apiData.ultralytics_version || ''}`.trim(),
    deployment: 'Hugging Face Space + Vercel Frontend',
    device: apiData.device || 'cpu',
    weightsPath: apiData.weights_path || '—',
  };
}
