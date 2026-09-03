/**
 * Decodifica a saída do head anchor-free do YOLOv8 e aplica NMS por classe.
 *
 * Saída ONNX: [1, 4 + nc, N] em layout channel-major — o valor do canal c na
 * âncora i está em data[c * N + i]. Os 4 primeiros canais são cx, cy, w, h em
 * pixels do frame letterboxed; os nc restantes são scores por classe (já sigmoid).
 */

const CANONICAL_NAMES = {
  speedlimit: 'Speedlimit',
  'speed limit': 'Speedlimit',
  'speed-limit': 'Speedlimit',
  crosswalk: 'Crosswalk',
  'pedestrian crossing': 'Crosswalk',
  trafficlight: 'Trafficlight',
  'traffic light': 'Trafficlight',
  'traffic-light': 'Trafficlight',
  stop: 'Stop',
  'stop sign': 'Stop',
};

export function toCanonicalClassName(name) {
  const key = String(name ?? '').trim().toLowerCase();
  if (CANONICAL_NAMES[key]) return CANONICAL_NAMES[key];
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Unknown';
}

function iou(a, b) {
  const interX1 = Math.max(a.x1, b.x1);
  const interY1 = Math.max(a.y1, b.y1);
  const interX2 = Math.min(a.x2, b.x2);
  const interY2 = Math.min(a.y2, b.y2);

  const interW = interX2 - interX1;
  const interH = interY2 - interY1;
  if (interW <= 0 || interH <= 0) return 0;

  const intersection = interW * interH;
  const areaA = (a.x2 - a.x1) * (a.y2 - a.y1);
  const areaB = (b.x2 - b.x1) * (b.y2 - b.y1);
  const union = areaA + areaB - intersection;

  return union > 0 ? intersection / union : 0;
}

/** NMS por classe (agnostic=False, igual ao default do Ultralytics). */
function nonMaxSuppression(candidates, iouThreshold) {
  const byClass = new Map();
  for (const candidate of candidates) {
    const bucket = byClass.get(candidate.classId);
    if (bucket) bucket.push(candidate);
    else byClass.set(candidate.classId, [candidate]);
  }

  const kept = [];
  for (const bucket of byClass.values()) {
    bucket.sort((a, b) => b.confidence - a.confidence);
    const survivors = [];

    for (const candidate of bucket) {
      let suppressed = false;
      for (const survivor of survivors) {
        if (iou(candidate, survivor) > iouThreshold) {
          suppressed = true;
          break;
        }
      }
      if (!suppressed) survivors.push(candidate);
    }

    kept.push(...survivors);
  }

  return kept.sort((a, b) => b.confidence - a.confidence);
}

/**
 * @param {Float32Array} data saída bruta do modelo
 * @param {number[]} dims dimensões [1, 4 + nc, N]
 * @param {object} geometry resultado do letterbox
 * @returns detecções no formato consumido pelo restante do app
 */
export function decodeDetections(data, dims, geometry, options) {
  const { confThreshold, iouThreshold, classNames, maxDetections = 300 } = options;
  const [, channels, anchors] = dims;
  const numClasses = channels - 4;

  if (numClasses <= 0) {
    throw new Error(`Saída ONNX inesperada: dims=[${dims.join(', ')}]`);
  }

  const { ratio, padX, padY, srcWidth, srcHeight } = geometry;
  const candidates = [];

  for (let i = 0; i < anchors; i += 1) {
    let bestScore = 0;
    let bestClass = -1;

    for (let c = 0; c < numClasses; c += 1) {
      const score = data[(4 + c) * anchors + i];
      if (score > bestScore) {
        bestScore = score;
        bestClass = c;
      }
    }

    if (bestClass < 0 || bestScore < confThreshold) continue;

    const cx = data[i];
    const cy = data[anchors + i];
    const w = data[anchors * 2 + i];
    const h = data[anchors * 3 + i];

    // Desfaz o letterbox: remove o padding e volta para a escala original.
    const x1 = (cx - w / 2 - padX) / ratio;
    const y1 = (cy - h / 2 - padY) / ratio;
    const x2 = (cx + w / 2 - padX) / ratio;
    const y2 = (cy + h / 2 - padY) / ratio;

    candidates.push({
      classId: bestClass,
      confidence: bestScore,
      x1: Math.max(0, Math.min(srcWidth, x1)),
      y1: Math.max(0, Math.min(srcHeight, y1)),
      x2: Math.max(0, Math.min(srcWidth, x2)),
      y2: Math.max(0, Math.min(srcHeight, y2)),
    });
  }

  return nonMaxSuppression(candidates, iouThreshold)
    .slice(0, maxDetections)
    .map((det) => ({
      class_name: toCanonicalClassName(classNames[det.classId] ?? det.classId),
      confidence: det.confidence,
      bounding_box: {
        x1: Math.round(det.x1),
        y1: Math.round(det.y1),
        x2: Math.round(det.x2),
        y2: Math.round(det.y2),
      },
    }));
}
