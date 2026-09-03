/**
 * Letterbox + tensorização, espelhando o pré-processamento do Ultralytics:
 * redimensiona mantendo aspect ratio, preenche as bordas com cinza 114 e
 * converte para float32 NCHW normalizado em [0, 1].
 */
const PAD_VALUE = 114;

export async function toBitmap(source) {
  if (typeof createImageBitmap !== 'function') {
    throw new Error('createImageBitmap indisponível neste browser.');
  }

  if (source instanceof Blob) {
    return createImageBitmap(source);
  }

  if (typeof source === 'string') {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Falha ao carregar imagem (${response.status}): ${source}`);
    }
    return createImageBitmap(await response.blob());
  }

  return createImageBitmap(source);
}

function createCanvas(width, height) {
  if (typeof OffscreenCanvas === 'function') {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * @returns {{ tensor: Float32Array, ratio: number, padX: number, padY: number,
 *             srcWidth: number, srcHeight: number, size: number }}
 */
export function letterbox(bitmap, size) {
  const srcWidth = bitmap.width;
  const srcHeight = bitmap.height;
  const ratio = Math.min(size / srcWidth, size / srcHeight);
  const drawWidth = Math.round(srcWidth * ratio);
  const drawHeight = Math.round(srcHeight * ratio);
  const padX = (size - drawWidth) / 2;
  const padY = (size - drawHeight) / 2;

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = `rgb(${PAD_VALUE},${PAD_VALUE},${PAD_VALUE})`;
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(bitmap, 0, 0, srcWidth, srcHeight, padX, padY, drawWidth, drawHeight);

  const { data } = ctx.getImageData(0, 0, size, size);
  const pixels = size * size;
  const tensor = new Float32Array(pixels * 3);

  // RGBA intercalado -> três planos contíguos (R, G, B), escala 1/255.
  for (let i = 0; i < pixels; i += 1) {
    const offset = i * 4;
    tensor[i] = data[offset] / 255;
    tensor[pixels + i] = data[offset + 1] / 255;
    tensor[pixels * 2 + i] = data[offset + 2] / 255;
  }

  return { tensor, ratio, padX, padY, srcWidth, srcHeight, size };
}

export async function prepareInput(source, size) {
  const bitmap = await toBitmap(source);
  try {
    return letterbox(bitmap, size);
  } finally {
    bitmap.close?.();
  }
}
