import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { IconClock, IconDownload, IconFullscreen } from './icons/PremiumIcons';
import { formatClassLabel, getClassColor } from '../utils/classColors';

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundRect(ctx, x, y, w, h, radii) {
  const r = typeof radii === 'number'
    ? [radii, radii, radii, radii]
    : radii;
  ctx.beginPath();
  ctx.moveTo(x + r[0], y);
  ctx.lineTo(x + w - r[1], y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r[1]);
  ctx.lineTo(x + w, y + h - r[2]);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
  ctx.lineTo(x + r[3], y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r[3]);
  ctx.lineTo(x, y + r[0]);
  ctx.quadraticCurveTo(x, y, x + r[0], y);
  ctx.closePath();
}

function getContainScale(containerW, containerH, originalImageWidth, originalImageHeight) {
  const scale = Math.min(
    containerW / originalImageWidth,
    containerH / originalImageHeight,
  );
  return {
    scaleX: scale,
    scaleY: scale,
    offsetX: (containerW - originalImageWidth * scale) / 2,
    offsetY: (containerH - originalImageHeight * scale) / 2,
  };
}

export default function DetectionPanel({
  imageUrl,
  detections,
  processingTime,
  isProcessing,
  predictionError,
  apiStatus,
  hoveredDetectionId,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageSizeRef = useRef({ width: 0, height: 0 });
  const [imageDimensions, setImageDimensions] = useState(null);

  const hasDetections = detections.length > 0;
  const showFrame = Boolean(imageUrl);

  const drawDetections = useCallback(
    (width, height) => {
      const canvas = canvasRef.current;
      if (!canvas || width <= 0 || height <= 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);

      const { width: originalImageWidth, height: originalImageHeight } = imageSizeRef.current;
      if (!originalImageWidth || !originalImageHeight || !detections.length) return;

      const { scaleX, scaleY, offsetX, offsetY } = getContainScale(
        width,
        height,
        originalImageWidth,
        originalImageHeight,
      );

      detections.forEach((detection) => {
        const pixelBbox = detection.pixelBbox;
        if (!pixelBbox) return;

        const x1 = pixelBbox.x1 ?? pixelBbox.x ?? 0;
        const y1 = pixelBbox.y1 ?? pixelBbox.y ?? 0;
        const x2 = pixelBbox.x2 ?? x1 + (pixelBbox.width ?? 0);
        const y2 = pixelBbox.y2 ?? y1 + (pixelBbox.height ?? 0);

        const boxX = offsetX + x1 * scaleX;
        const boxY = offsetY + y1 * scaleY;
        const boxW = (x2 - x1) * scaleX;
        const boxH = (y2 - y1) * scaleY;

        const color = getClassColor(detection.className);
        const isHighlighted = hoveredDetectionId === detection.id;
        const label = formatClassLabel(detection.className);
        const confText = `${(detection.confidence * 100).toFixed(0)}%`;

        // ── Corner bracket style ──────────────────────────────────
        const lineW = isHighlighted ? 2.5 : 2;
        const cornerLen = Math.min(boxW, boxH) * 0.22;
        const cr = 3; // corner radius

        // Glow halo (only when highlighted)
        if (isHighlighted) {
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = 8;
          ctx.globalAlpha = 0.18;
          ctx.strokeRect(boxX, boxY, boxW, boxH);
          ctx.globalAlpha = 1;
          ctx.restore();
        }

        // Inner fill — very subtle tint
        ctx.fillStyle = isHighlighted
          ? hexToRgba(color, 0.12)
          : hexToRgba(color, 0.05);
        ctx.fillRect(boxX, boxY, boxW, boxH);

        // Corner brackets
        ctx.strokeStyle = color;
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const corners = [
          // top-left
          [[boxX, boxY + cornerLen], [boxX, boxY], [boxX + cornerLen, boxY]],
          // top-right
          [[boxX + boxW - cornerLen, boxY], [boxX + boxW, boxY], [boxX + boxW, boxY + cornerLen]],
          // bottom-right
          [[boxX + boxW, boxY + boxH - cornerLen], [boxX + boxW, boxY + boxH], [boxX + boxW - cornerLen, boxY + boxH]],
          // bottom-left
          [[boxX + cornerLen, boxY + boxH], [boxX, boxY + boxH], [boxX, boxY + boxH - cornerLen]],
        ];

        corners.forEach(([a, b, c]) => {
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.lineTo(c[0], c[1]);
          ctx.stroke();
        });

        // ── Label chip ────────────────────────────────────────────
        const swatch = 4;
        const gap = 5;
        ctx.font = '500 11px "JetBrains Mono", monospace';
        const classW = ctx.measureText(label).width;
        const confW = ctx.measureText(confText).width;

        const chipPadX = 6;
        const chipH = 18;
        const chipW = chipPadX + swatch + gap + classW + gap + confW + chipPadX;

        const chipX = Math.min(Math.max(boxX, 0), width - chipW - 2);
        const chipY = boxY >= chipH + 4 ? boxY - chipH - 3 : boxY + 3;

        ctx.save();
        roundRect(ctx, chipX, chipY, chipW, chipH, 4);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fill();
        roundRect(ctx, chipX, chipY, chipW, chipH, 4);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();

        const midY = chipY + chipH / 2;
        ctx.fillStyle = color;
        ctx.fillRect(chipX + chipPadX, midY - swatch / 2, swatch, swatch);

        ctx.font = '500 11px "JetBrains Mono", monospace';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        const textX = chipX + chipPadX + swatch + gap;
        ctx.fillText(label, textX, midY);

        ctx.fillStyle = '#00FF87';
        ctx.fillText(confText, textX + classW + gap, midY);
      });
    },
    [detections, hoveredDetectionId],
  );

  const redrawFromContainer = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    drawDetections(width, height);
  }, [drawDetections]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isProcessing || !hasDetections) return undefined;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        drawDetections(width, height);
      }
    });

    observer.observe(container);

    const frame = requestAnimationFrame(() => {
      const { width, height } = container.getBoundingClientRect();
      drawDetections(width, height);
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [detections, drawDetections, isProcessing, hasDetections]);

  useEffect(() => {
    if (isProcessing || !hasDetections) return;
    redrawFromContainer();
  }, [isProcessing, hasDetections, detections, hoveredDetectionId, redrawFromContainer]);

  const handleImageLoad = (event) => {
    const img = event.currentTarget;
    imageSizeRef.current = {
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
    setImageDimensions(`${img.naturalWidth} × ${img.naturalHeight}`);
    redrawFromContainer();
  };

  useEffect(() => {
    if (!imageUrl) {
      setImageDimensions(null);
      imageSizeRef.current = { width: 0, height: 0 };
    }
  }, [imageUrl]);

  const showError = !isProcessing && (predictionError || apiStatus !== 'online');

  return (
    <div className="detection-result-panel image-panel animate-panel-center">
      <div className="detection-result-panel__header image-panel-header">
        <h2 className="detection-result-panel__title">Detection Result</h2>

        <div className="detection-result-panel__header-meta">
          {imageDimensions && (
            <span className="detection-result-panel__resolution original-panel__resolution">
              {imageDimensions}
            </span>
          )}
        <div className="detection-result-panel__timing">
          {isProcessing ? (
            <span className="detection-result-panel__timing-inline detection-result-panel__timing-inline--pending">
              <IconClock size={12} />
              Inferindo…
            </span>
          ) : hasDetections ? (
            <span className="detection-result-panel__timing-inline">
              <IconClock size={12} />
              {processingTime}ms
            </span>
          ) : null}
        </div>
        </div>
      </div>

      <div ref={containerRef} className="detection-result-panel__viewport image-area">
        {showFrame ? (
          <div className="detection-result-panel__frame">
            <img
              src={imageUrl}
              alt="Detection result with bounding boxes"
              className="detection-result-panel__img"
              onLoad={handleImageLoad}
            />
            {!isProcessing && hasDetections && (
              <canvas
                ref={canvasRef}
                className="detection-result-panel__canvas"
                aria-hidden="true"
              />
            )}
            {isProcessing && (
              <div className="detection-result-panel__scanning">
                <div className="detection-result-panel__scan-line" />
                <span className="detection-result-panel__scanning-text image-placeholder-text">
                  Running YOLO inference… (CPU ~2–5s · GPU ~0,2s)
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="detection-result-panel__empty">
            <span className="image-placeholder-text">Aguardando inferência da API</span>
          </div>
        )}
      </div>

      <div className="image-panel-footer detection-result-panel__actions">
        <button
          type="button"
          className="detection-result-panel__btn detection-result-panel__btn--download"
          disabled={isProcessing || !hasDetections}
        >
          <IconDownload size={14} />
          Download Result
        </button>
        <button
          type="button"
          className="detection-result-panel__btn detection-result-panel__btn--fullscreen"
          disabled={isProcessing || !hasDetections}
        >
          <IconFullscreen size={14} />
          Fullscreen
        </button>
      </div>

      {showError && (
        <div className="detection-result-panel__footer">
          <div className="detection-result-panel__error-banner">
            <AlertTriangle size={14} aria-hidden="true" />
            {predictionError ||
              (apiStatus === 'waking'
                ? 'API acordando no HF Space. A primeira inferência pode levar alguns segundos.'
                : 'API offline. Nenhum resultado de detecção disponível.')}
          </div>
        </div>
      )}
    </div>
  );
}
