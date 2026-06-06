import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ModelOverviewPage from './components/views/ModelOverviewPage';
import DatasetClassesPage from './components/views/DatasetClassesPage';
import PerformancePage from './components/views/PerformancePage';
import InferenceLogsPage from './components/views/InferenceLogsPage';
import ApiStatusPage from './components/views/ApiStatusPage';
import { ApiError, getHealth, getMetadata, predictImage, predictSample } from './services/api';
import { SAMPLE_IMAGES, DEFAULT_SAMPLE_ID } from './data/sampleImages';
import { getDetectionSummary } from './utils/detectionSummary';
import { formatTimestamp } from './utils/formatters';

const DEFAULT_SAMPLE = SAMPLE_IMAGES.find((s) => s.id === DEFAULT_SAMPLE_ID) || SAMPLE_IMAGES[0];

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('live');
  const [apiStatus, setApiStatus] = useState('checking');
  const [metadata, setMetadata] = useState(null);
  const [selectedSampleId, setSelectedSampleId] = useState(DEFAULT_SAMPLE.id);
  const [imageUrl, setImageUrl] = useState(DEFAULT_SAMPLE.src);
  const [detections, setDetections] = useState([]);
  const [summary, setSummary] = useState(getDetectionSummary([], 0));
  const [processingTime, setProcessingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const predictSeqRef = useRef(0);
  const initialPredictStartedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function checkApi(isInitial = false) {
      if (isInitial) setApiStatus('checking');

      const health = await getHealth(isInitial ? undefined : { retries: 1, timeout: 8000 });
      if (cancelled) return;

      console.info('[RoadVision API] Status atualizado:', health.status, health);

      setApiStatus(health.status);

      if (health.status === 'online') {
        // Metadata em paralelo — não bloqueia o predict inicial
        getMetadata()
          .then((meta) => {
            if (!cancelled) {
              setMetadata(meta);
              if (meta.device === 'cpu') {
                console.warn(
                  '[RoadVision API] Backend em CPU — inferência ~2–5s/imagem. ' +
                    'Na conta anterior provavelmente havia GPU no HF Space (Settings → Hardware → GPU).'
                );
              }
            }
          })
          .catch((err) => {
            console.warn('[RoadVision API] Metadata indisponível após health online:', err);
            if (!cancelled) setMetadata(null);
          });
      } else if (!cancelled) {
        setMetadata(null);
      }
    }

    checkApi(true);
    const interval = setInterval(() => checkApi(false), 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const addLog = useCallback((count) => {
    const newLog = {
      id: Date.now(),
      time: formatTimestamp(),
      message: `Image processed — ${count} sign${count !== 1 ? 's' : ''} detected`,
      count,
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 8));
  }, []);

  const clearResults = useCallback(() => {
    setDetections([]);
    setSummary(getDetectionSummary([], 0));
    setProcessingTime(0);
  }, []);

  const applyResult = useCallback(
    (result) => {
      setImageUrl(result.imageUrl);
      setDetections(result.detections);
      setSummary(result.summary);
      setProcessingTime(result.processingTime);
      setPredictionError(null);
      addLog(result.detections.length);
    },
    [addLog]
  );

  const runPrediction = useCallback(
    async (fn) => {
      if (apiStatus !== 'online') {
        setPredictionError('API indisponível. Aguarde o backend ficar online.');
        clearResults();
        return;
      }

      const seq = ++predictSeqRef.current;
      setIsProcessing(true);
      setPredictionError(null);

      try {
        const result = await fn();
        if (seq !== predictSeqRef.current) return;
        applyResult(result);
      } catch (error) {
        if (seq !== predictSeqRef.current) return;
        if (error?.name === 'PredictCancelledError') return;
        const message =
          error instanceof ApiError
            ? error.message
            : 'Falha na inferência. Verifique se a API está online.';
        setPredictionError(message);
        clearResults();
      } finally {
        if (seq === predictSeqRef.current) {
          setIsProcessing(false);
        }
      }
    },
    [apiStatus, applyResult, clearResults]
  );

  useEffect(() => {
    if (initialLoadDone || apiStatus === 'checking') return;

    setInitialLoadDone(true);

    if (apiStatus === 'online' && !initialPredictStartedRef.current) {
      initialPredictStartedRef.current = true;
      console.info('[RoadVision API] Health online — disparando predict inicial agora');
      runPrediction(() => predictSample(DEFAULT_SAMPLE.id));
    } else {
      setPredictionError('API indisponível. Nenhuma detecção será exibida até o backend responder.');
      clearResults();
    }
  }, [apiStatus, initialLoadDone, runPrediction, clearResults]);

  useEffect(() => {
    if (apiStatus === 'online' && predictionError?.includes('indisponível')) {
      setPredictionError(null);
    }
  }, [apiStatus, predictionError]);

  const handleSampleSelect = useCallback(
    (sampleId) => {
      if (isProcessing) return;
      setSelectedSampleId(sampleId);
      setImageUrl(
        SAMPLE_IMAGES.find((s) => s.id === sampleId)?.src || DEFAULT_SAMPLE.src
      );
      runPrediction(() => predictSample(sampleId));
    },
    [isProcessing, runPrediction]
  );

  const handleUpload = useCallback(
    (file) => {
      if (isProcessing) return;
      runPrediction(() => predictImage(file));
    },
    [isProcessing, runPrediction]
  );

  return (
    <div className="app-layout">
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onNavigate={setActiveView}
      />

      <div className="app-main">
        <Header apiStatus={apiStatus} activeView={activeView} />
        {activeView === 'live' ? (
          <Dashboard
            imageUrl={imageUrl}
            detections={detections}
            summary={summary}
            processingTime={processingTime}
            selectedSampleId={selectedSampleId}
            isProcessing={isProcessing}
            predictionError={predictionError}
            apiStatus={apiStatus}
            metadata={metadata}
            logs={logs}
            onSampleSelect={handleSampleSelect}
            onUpload={handleUpload}
            onNavigateToLogs={() => setActiveView('logs')}
          />
        ) : (
          <div className="info-view-body">
            {activeView === 'model' && <ModelOverviewPage metadata={metadata} />}
            {activeView === 'dataset' && <DatasetClassesPage />}
            {activeView === 'performance' && (
              <PerformancePage
                detections={detections}
                summary={summary}
                processingTime={processingTime}
                metadata={metadata}
                apiStatus={apiStatus}
                logs={logs}
              />
            )}
            {activeView === 'logs' && <InferenceLogsPage logs={logs} />}
            {activeView === 'api' && (
              <ApiStatusPage apiStatus={apiStatus} metadata={metadata} />
            )}
          </div>
        )}
        <footer className="app-footer">
          RoadVision AI • YOLO Traffic Sign Detection • Built for safer roads
        </footer>
      </div>
    </div>
  );
}

export default App;
