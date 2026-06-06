import { useCallback, useState } from 'react';
import DetectedSignsTable from './DetectedSignsTable';
import SidebarConfidenceBars from './SidebarConfidenceBars';
import { DetectionClassIcon } from './icons/DetectionIcons';
import { IconArrowRight } from './icons/PremiumIcons';
import { formatClassLabel } from '../utils/classColors';

export default function DetectionSummary({
  summary,
  detections = [],
  hoveredDetectionId,
  onHoverDetection,
  isProcessing = false,
}) {
  const { signsDetected, avgConfidence, topClass, processingTime } = summary;
  const formattedTopClass = topClass === '—' ? '—' : formatClassLabel(topClass);
  const count = detections.length;

  const [expanded, setExpanded] = useState(false);

  const toggleDetections = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <div className="detection-sidebar detection-summary summary-panel">
      <div className="detection-summary__header summary-header">
        <h3 className="detection-summary__title">Detection Summary</h3>
      </div>

      <div className="detection-sidebar__stats-grid">
        <div className="detection-sidebar__stat-cell">
          <div className="stat-label">Signs detected</div>
          <div className="stat-value" id="statSignsDetected">
            {signsDetected}
          </div>
        </div>
        <div className="detection-sidebar__stat-cell">
          <div className="stat-label">Avg confidence</div>
          <div className="stat-value stat-value--accent" id="statConfidence">
            {(avgConfidence * 100).toFixed(1)}%
          </div>
        </div>
        <div className="detection-sidebar__stat-cell detection-sidebar__stat-cell--compact">
          <div className="stat-label">Top class</div>
          <div className="stat-top-class">
            {formattedTopClass !== '—' && <DetectionClassIcon detectionClass={topClass} />}
            <span>{formattedTopClass}</span>
          </div>
        </div>
        <div className="detection-sidebar__stat-cell detection-sidebar__stat-cell--compact">
          <div className="stat-label">Processing</div>
          <div className="stat-value stat-value--mono">
            {isProcessing ? (
              <span className="stat-value--pending">…</span>
            ) : (
              <>
                {processingTime}
                <span className="stat-value__unit">ms</span>
              </>
            )}
          </div>
        </div>
      </div>

      <DetectedSignsTable
        detections={detections}
        hoveredDetectionId={hoveredDetectionId}
        onHoverDetection={onHoverDetection}
        expanded={expanded}
      />

      <SidebarConfidenceBars detections={detections} />

      <div className="detection-sidebar__spacer" aria-hidden="true" />

      {count > 0 && (
        <div className="detections-footer">
          <button
            type="button"
            id="viewAllBtn"
            className={`view-all-btn detection-sidebar__footer ${expanded ? 'expanded' : ''}`}
            onClick={toggleDetections}
            aria-expanded={expanded}
          >
            {expanded ? (
              '← Collapse'
            ) : (
              <>
                View all <span id="detCount">{count}</span> detection{count !== 1 ? 's' : ''}
              </>
            )}
            <IconArrowRight size={12} className="btn-arrow" />
          </button>
        </div>
      )}
    </div>
  );
}
