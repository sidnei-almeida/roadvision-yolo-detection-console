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

/** Recebe o objeto `engine` da sessão ONNX local (src/services/inference/session.js). */
export function mapApiMetadata(engine) {
  const classes = (engine.classNames || []).map(normalizeCanonical);
  const size = engine.inputSize || 416;
  const threads = engine.threads || 1;
  const exportedBy = engine.manifest?.ultralytics?.version;

  return {
    model: 'YOLOv8n Custom (ONNX)',
    task: 'Object Detection',
    inputSize: `${size} × ${size}`,
    classes: `${classes.length} Traffic Signs (${classes.join(', ')})`,
    backend: `ONNX Runtime Web · WASM SIMD${threads > 1 ? ` ×${threads} threads` : ' single-thread'}${
      exportedBy ? ` · exportado com Ultralytics ${exportedBy}` : ''
    }`,
    deployment: 'Vercel — inferência 100% no browser',
    device: `browser-wasm${threads > 1 ? `-x${threads}` : ''}`,
    weightsPath: engine.manifest?.file ? `/models/${engine.manifest.file}` : '—',
  };
}

function normalizeCanonical(name) {
  const key = String(name ?? '').trim();
  return key ? key.charAt(0).toUpperCase() + key.slice(1).toLowerCase() : 'Unknown';
}
