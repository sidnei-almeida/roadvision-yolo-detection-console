function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function sampleBorderColors(data, width, height) {
  const samples = [];

  for (let x = 0; x < width; x++) {
    for (const y of [0, height - 1]) {
      const i = (y * width + x) * 4;
      samples.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  for (let y = 1; y < height - 1; y++) {
    for (const x of [0, width - 1]) {
      const i = (y * width + x) * 4;
      samples.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  return samples;
}

function removeBackground(ctx, width, height, tolerance = 48) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;
  const borderColors = sampleBorderColors(data, width, height);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const isBackground = borderColors.some(
      ([br, bg, bb]) => colorDistance(r, g, b, br, bg, bb) < tolerance
    );

    if (isBackground) {
      data[i + 3] = Math.min(data[i + 3], 40);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function cropDetectionFromImage(imageSrc, pixelBbox, padding = 4) {
  const img = await loadImage(imageSrc);
  const { x1, y1, x2, y2 } = pixelBbox;

  const sx = Math.max(0, Math.floor(x1) - padding);
  const sy = Math.max(0, Math.floor(y1) - padding);
  const sw = Math.min(img.naturalWidth - sx, Math.ceil(x2 - x1) + padding * 2);
  const sh = Math.min(img.naturalHeight - sy, Math.ceil(y2 - y1) + padding * 2);

  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  removeBackground(ctx, sw, sh);

  return canvas.toDataURL('image/png');
}

/**
 * Reduz dimensão e comprime antes do upload — menos bytes na rede e decode mais rápido no servidor.
 */
export async function prepareImageForPredict(file, maxDimension = 640) {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const longestSide = Math.max(width, height);
  const scale = Math.min(1, maxDimension / longestSide);
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const alreadySmall =
    scale === 1 && file.type === 'image/jpeg' && file.size < 280_000;

  if (alreadySmall) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Falha ao comprimir imagem.'))),
      'image/jpeg',
      0.88
    );
  });

  const baseName = (file.name || 'image').replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}

export async function enrichDetectionsWithCrops(imageSrc, detections) {
  const enriched = await Promise.all(
    detections.map(async (det) => {
      if (!det.pixelBbox) return det;

      try {
        const cropUrl = await cropDetectionFromImage(imageSrc, det.pixelBbox);
        return { ...det, cropUrl };
      } catch {
        return det;
      }
    })
  );

  return enriched;
}
