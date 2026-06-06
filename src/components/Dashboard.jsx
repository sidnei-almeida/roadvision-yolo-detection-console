import { useState } from 'react';
import ImagePanel from './ImagePanel';
import DetectionPanel from './DetectionPanel';
import DetectionSummary from './DetectionSummary';
import ModelInfoCard from './ModelInfoCard';
import AboutModelCard from './AboutModelCard';
import InferenceLogs from './InferenceLogs';

export default function Dashboard({
  imageUrl,
  detections,
  summary,
  processingTime,
  selectedSampleId,
  isProcessing,
  predictionError,
  apiStatus,
  metadata,
  logs,
  onSampleSelect,
  onUpload,
  onNavigateToLogs,
}) {
  const [hoveredDetectionId, setHoveredDetectionId] = useState(null);

  return (
    <div className="dashboard-body">
      <section id="live" className="detection-grid">
        <ImagePanel
          imageUrl={imageUrl}
          selectedSampleId={selectedSampleId}
          isProcessing={isProcessing}
          apiStatus={apiStatus}
          onSampleSelect={onSampleSelect}
          onUpload={onUpload}
          resolution={metadata?.inputSize || '640 × 640'}
        />
        <DetectionPanel
          imageUrl={imageUrl}
          detections={detections}
          processingTime={processingTime}
          isProcessing={isProcessing}
          predictionError={predictionError}
          apiStatus={apiStatus}
          hoveredDetectionId={hoveredDetectionId}
        />
        <DetectionSummary
          key={`${summary.processingTime}-${detections.length}-${detections[0]?.id ?? 0}`}
          summary={summary}
          detections={detections}
          hoveredDetectionId={hoveredDetectionId}
          onHoverDetection={setHoveredDetectionId}
          isProcessing={isProcessing}
        />
      </section>

      <section className="bottom-cards-grid">
        <ModelInfoCard metadata={metadata} />
        <AboutModelCard />
        <InferenceLogs logs={logs} onViewAll={onNavigateToLogs} />
      </section>
    </div>
  );
}
