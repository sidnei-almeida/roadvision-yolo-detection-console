/**
 * Pipeline completo de detecção no browser: prepara a imagem, roda a sessão ONNX
 * e devolve um payload no mesmo formato que a API FastAPI retornava, para que os
 * mappers e componentes existentes continuem valendo.
 */
import { ENV } from '../../config/env';
import { prepareInput } from './preprocess';
import { decodeDetections } from './postprocess';
import { getEngine, loadEngine, runSession } from './session';

const LOG_PREFIX = '[RoadVision Engine]';

// Uma inferência por vez: o WASM é single-session e chamadas paralelas apenas
// enfileiram trabalho, inflando a latência percebida.
let inferenceChain = Promise.resolve();

export class InferenceCancelledError extends Error {
  constructor() {
    super('Inferência substituída por uma requisição mais recente');
    this.name = 'PredictCancelledError';
  }
}

let activeToken = 0;

function queue(task) {
  const result = inferenceChain.then(task, task);
  inferenceChain = result.catch(() => {});
  return result;
}

export async function detect(source, { signalToken } = {}) {
  await loadEngine();
  const engine = getEngine();

  return queue(async () => {
    if (signalToken !== undefined && signalToken !== activeToken) {
      throw new InferenceCancelledError();
    }

    const preprocessStartedAt = performance.now();
    const geometry = await prepareInput(source, engine.inputSize);
    const preprocessMs = performance.now() - preprocessStartedAt;

    const inferenceStartedAt = performance.now();
    const { data, dims } = await runSession(geometry.tensor, engine.inputSize);
    const inferenceMs = performance.now() - inferenceStartedAt;

    const postprocessStartedAt = performance.now();
    const detections = decodeDetections(data, dims, geometry, {
      confThreshold: ENV.confThreshold,
      iouThreshold: ENV.iouThreshold,
      classNames: engine.classNames,
    });
    const postprocessMs = performance.now() - postprocessStartedAt;

    console.info(`${LOG_PREFIX} Inferência concluída`, {
      detections: detections.length,
      preprocessMs: Math.round(preprocessMs),
      inferenceMs: Math.round(inferenceMs),
      postprocessMs: Math.round(postprocessMs),
      imageSize: `${geometry.srcWidth}×${geometry.srcHeight}`,
    });

    return {
      detections,
      inference_time_ms: inferenceMs,
      total_time_ms: preprocessMs + inferenceMs + postprocessMs,
      preprocess_time_ms: preprocessMs,
      postprocess_time_ms: postprocessMs,
      image_width: geometry.srcWidth,
      image_height: geometry.srcHeight,
    };
  });
}

/** Invalida inferências em voo — usado quando o usuário troca de imagem. */
export function supersedePending() {
  activeToken += 1;
  return activeToken;
}

export function currentToken() {
  return activeToken;
}
