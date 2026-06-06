import SidebarConfidenceBars from '../SidebarConfidenceBars';
import { DetectionClassIcon } from '../icons/DetectionIcons';
import {
  CONFIDENCE_TIERS,
  LATENCY_BENCHMARKS,
  YOLO_MODEL,
} from '../../data/roadSignProject';
import { computeConfidenceDistribution } from '../../utils/confidenceDistribution';
import { formatClassLabel } from '../../utils/classColors';
import { getDetectionSummary } from '../../utils/detectionSummary';
import { InfoVariantTable } from './shared/InfoBlocks';
import InfoPageShell from './InfoPageShell';

function formatMs(ms) {
  if (!ms) return '—';
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

function buildClassBreakdown(detections) {
  const counts = {};
  for (const d of detections) {
    const key = formatClassLabel(d.className);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export default function PerformancePage({
  detections = [],
  summary,
  processingTime = 0,
  metadata,
  apiStatus,
  logs = [],
}) {
  const stats = summary ?? getDetectionSummary(detections, processingTime);
  const distribution = computeConfidenceDistribution(detections);
  const uniqueClasses = new Set(detections.map((d) => d.className)).size;
  const maxConfidence =
    detections.length > 0 ? Math.max(...detections.map((d) => d.confidence)) : null;
  const minConfidence =
    detections.length > 0 ? Math.min(...detections.map((d) => d.confidence)) : null;
  const device = metadata?.device ?? 'cpu';
  const classBreakdown = buildClassBreakdown(detections);
  const sessionPredictions = logs.length;
  const avgSignsPerRun =
    sessionPredictions > 0
      ? (logs.reduce((s, l) => s + (l.count ?? 0), 0) / sessionPredictions).toFixed(1)
      : '—';

  const latencyHint =
    device === 'cpu'
      ? 'CPU no HF Space: ~2–5s por imagem. Cold start do Space pode adicionar 30–60s.'
      : 'GPU: inferência tipicamente sub-segundo após warm-up do container.';

  const benchmarkRows = LATENCY_BENCHMARKS.map((b) => ({
    name: b.device,
    params: b.latency,
    speed: b.note,
    use: device === 'cpu' && b.device.includes('CPU') ? '● ativo' : '—',
  }));

  return (
    <div className="info-page-layout animate-in">
      <div className="info-page-grid info-page-grid--2">
        <InfoPageShell title="Última inferência">
          <div className="info-metric-grid">
            <div className="info-metric-card info-metric-card--accent">
              <span className="info-metric-card__val">{formatMs(processingTime)}</span>
              <span className="info-metric-card__label">Latência</span>
            </div>
            <div className="info-metric-card">
              <span className="info-metric-card__val">{stats.signsDetected ?? detections.length}</span>
              <span className="info-metric-card__label">Detecções</span>
            </div>
            <div className="info-metric-card">
              <span className="info-metric-card__val">
                {stats.avgConfidence != null ? `${(stats.avgConfidence * 100).toFixed(1)}%` : '—'}
              </span>
              <span className="info-metric-card__label">Conf. média</span>
            </div>
            <div className="info-metric-card">
              <span className="info-metric-card__val">{device.toUpperCase()}</span>
              <span className="info-metric-card__label">Device</span>
            </div>
          </div>
          <p className="info-note">{latencyHint}</p>
        </InfoPageShell>

        <InfoPageShell title="Métricas da imagem atual">
          <dl className="info-dl">
            <div className="info-dl__row">
              <dt>Classes únicas</dt>
              <dd>{uniqueClasses}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Confiança máx.</dt>
              <dd>{maxConfidence != null ? `${(maxConfidence * 100).toFixed(1)}%` : '—'}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Confiança mín.</dt>
              <dd>{minConfidence != null ? `${(minConfidence * 100).toFixed(1)}%` : '—'}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Top class</dt>
              <dd className="info-dl__mono">{stats.topClass ?? '—'}</dd>
            </div>
            <div className="info-dl__row">
              <dt>Input size</dt>
              <dd>{metadata?.inputSize ?? `${YOLO_MODEL.inputSize} × ${YOLO_MODEL.inputSize}`}</dd>
            </div>
            <div className="info-dl__row">
              <dt>API status</dt>
              <dd className={`info-dl__status info-dl__status--${apiStatus}`}>{apiStatus}</dd>
            </div>
          </dl>
        </InfoPageShell>
      </div>

      <div className="info-page-grid info-page-grid--2">
        <InfoPageShell title="Sessão (logs)">
          <div className="info-metric-grid info-metric-grid--2">
            <div className="info-metric-card">
              <span className="info-metric-card__val">{sessionPredictions}</span>
              <span className="info-metric-card__label">Predições</span>
            </div>
            <div className="info-metric-card info-metric-card--accent">
              <span className="info-metric-card__val">{avgSignsPerRun}</span>
              <span className="info-metric-card__label">Média placas/run</span>
            </div>
          </div>
        </InfoPageShell>

        <InfoPageShell title="Faixas de confiança">
          <dl className="info-dl">
            {CONFIDENCE_TIERS.map(({ label, range, desc, key }) => (
              <div key={key} className="info-dl__row">
                <dt>{label} ({range})</dt>
                <dd>{distribution[key]}% · {desc}</dd>
              </div>
            ))}
          </dl>
        </InfoPageShell>
      </div>

      {classBreakdown.length > 0 && (
        <InfoPageShell title="Breakdown por classe (imagem atual)">
          <div className="info-class-breakdown">
            {classBreakdown.map(({ label, count }) => (
              <div key={label} className="info-class-breakdown__row">
                <DetectionClassIcon detectionClass={label} />
                <span className="info-class-breakdown__name">{label}</span>
                <span className="info-class-breakdown__count">{count}</span>
              </div>
            ))}
          </div>
        </InfoPageShell>
      )}

      <InfoPageShell title="Distribuição de confiança">
        <SidebarConfidenceBars detections={detections} embedded />
      </InfoPageShell>

      <InfoPageShell title="Benchmarks de latência (referência)">
        <InfoVariantTable
          rows={benchmarkRows}
          headers={['Device', 'Latência', 'Notas', 'Status']}
        />
      </InfoPageShell>
    </div>
  );
}
