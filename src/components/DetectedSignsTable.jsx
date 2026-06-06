import { formatClassLabel } from '../utils/classColors';
import { getPixelBboxCoords } from '../utils/detectionMapper';
import { DetectionClassIcon, DetectionTypeIcon } from './icons/DetectionIcons';

export default function DetectedSignsTable({
  detections = [],
  hoveredDetectionId,
  onHoverDetection,
  expanded = false,
}) {
  const count = detections.length;
  const showMask = count > 5 && !expanded;

  return (
    <section className="detected-signs">
      <div className="detected-signs__header detected-signs-header">
        <h3 className="detected-signs__title">Detected Signs</h3>
        <span className="detected-signs__count">{count}</span>
      </div>

      <div className="detected-signs__col-headers" role="row">
        <span>#</span>
        <span>Class</span>
        <span>Conf</span>
        <span>Type</span>
      </div>

      <div
        id="detectionsList"
        className={[
          'detections-list',
          'detected-signs__body',
          expanded ? 'expanded' : '',
          showMask ? 'detections-list--masked' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {count === 0 ? (
          <p className="detected-signs__empty">No signs detected in this image.</p>
        ) : (
          detections.map((det, index) => {
            const bbox = getPixelBboxCoords(det.pixelBbox);

            return (
              <div
                key={det.id}
                className={`det-row detected-signs__row ${hoveredDetectionId === det.id ? 'detected-signs__row--hovered' : ''}`}
                role="row"
                onMouseEnter={() => onHoverDetection?.(det.id)}
                onMouseLeave={() => onHoverDetection?.(null)}
              >
                <span className="detected-signs__index">{index + 1}</span>
                <span className="detected-signs__class">
                  <span className="detected-signs__class-line">
                    <DetectionClassIcon detectionClass={det.className} />
                    {formatClassLabel(det.className)}
                  </span>
                  {bbox && (
                    <div className="det-detail">
                      Bounding box: {bbox.x1}, {bbox.y1} → {bbox.x2}, {bbox.y2}
                      {' · '}
                      Area: {bbox.area}px²
                    </div>
                  )}
                </span>
                <span className="detected-signs__conf-cell">
                  <span className="conf-bar" aria-hidden="true">
                    <span
                      className="conf-bar__fill bar-fill"
                      data-width={`${det.confidence * 100}%`}
                      style={{ width: `${det.confidence * 100}%` }}
                    />
                  </span>
                  <span className="detected-signs__conf-val">{det.confidence.toFixed(2)}</span>
                </span>
                <DetectionTypeIcon type={det.type} />
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
