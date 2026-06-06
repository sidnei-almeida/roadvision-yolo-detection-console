import { useCallback, useEffect, useState } from 'react';
import DetectedSignsTable from './DetectedSignsTable';
import SidebarConfidenceBars from './SidebarConfidenceBars';
import { DetectionClassIcon } from './icons/DetectionIcons';
import { IconArrowRight } from './icons/PremiumIcons';
import { formatClassLabel } from '../utils/classColors';
import { animateCount } from '../utils/animateCount';

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

  const [animatedSigns, setAnimatedSigns] = useState(0);
  const [animatedConfidencePct, setAnimatedConfidencePct] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    animateCount(0, signsDetected, 800, (value) => {
      setAnimatedSigns(Math.round(value));
    });
  }, [signsDetected]);

  useEffect(() => {
    const targetPct = avgConfidence * 100;
    animateCount(0, targetPct, 800, (value) => {
      setAnimatedConfidencePct(value);
    });
  }, [avgConfidence]);

  const toggleDetections = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <div className="detection-sidebar detection-summary summary-panel animate-panel-right">
      <div className="detection-summary__header summary-header">
        <h3 className="detection-summary__title">Detection Summary</h3>
      </div>

      <div className="detection-sidebar__stats-grid">
        <div className="detection-sidebar__stat-cell">
          <div className="stat-label">Signs detected</div>
          <div className="stat-value">{animatedSigns}</div>
        </div>
        <div className="detection-sidebar__stat-cell">
          <div className="stat-label">Avg confidence</div>
          <div className="stat-value stat-value--accent">
            {animatedConfidencePct.toFixed(1)}%
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
