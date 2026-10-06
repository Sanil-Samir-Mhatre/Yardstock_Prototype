import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Play, CheckCircle2, Terminal } from 'lucide-react';
import { Translations } from '../data/i18n';

export interface DashboardMetricsData {
  testSetSize: number;
  totalListingsSeeded: number;
  totalSellersSeeded: number;
  visionCategoryAccuracyPct: number;
  quantityMae: number;
  priceMapePct: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  matchPrecisionAt5Pct: number;
  fraudMetrics: {
    precisionPct: number;
    recallPct: number;
    f1ScorePct: number;
    confusionMatrix: {
      tp: number;
      fp: number;
      tn: number;
      fn: number;
    };
  };
  securityEventsBlocked: {
    promptInjectionsBlocked: number;
    duplicatePhotosBlocked: number;
    flaggedListingsCount: number;
    piiRedactionsCount: number;
    rateLimitBlocksCount: number;
  };
  listingTimeComparison: {
    aiSnapSeconds: number;
    manualBaselineSeconds: number;
    speedupFactor: number;
  };
  sustainability: {
    wasteDivertedKg: number;
    wasteDivertedTons: number;
    co2SavedKg: number;
    co2SavedTons: number;
  };
  economics: {
    totalCatalogGmvInr: number;
    settledAndEscrowGmvInr: number;
    commissionRatePct: number;
    projectedCommissionInr: number;
  };
  categoryBreakdown: Array<{
    category: string;
    cpwdCode: string;
    accuracyPct: number;
    priceMapePct: number;
    wasteDivertedTons: number;
    co2SavedTons: number;
    listingsCount: number;
  }>;
}

interface PerformanceDashboardViewProps {
  t: Translations;
  metrics: DashboardMetricsData;
  onRefreshMetrics: (newMetrics: DashboardMetricsData) => void;
}

export const PerformanceDashboardView: React.FC<PerformanceDashboardViewProps> = ({
  t,
  metrics,
  onRefreshMetrics,
}) => {
  const [isRunningEval, setIsRunningEval] = useState<boolean>(false);
  const [lastEvalTimestamp, setLastEvalTimestamp] = useState<string | null>(null);

  const handleRunEvaluation = async () => {
    setIsRunningEval(true);
    try {
      const res = await fetch('/api/eval/run', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.metrics) {
        onRefreshMetrics(data.metrics);
        setLastEvalTimestamp(data.timestamp);
      }
    } finally {
      setIsRunningEval(false);
    }
  };

  const cm = metrics.fraudMetrics.confusionMatrix;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-amber-700">
            05. Held-Out Test Set (n={metrics.testSetSize}) & Live Telemetry Evaluation Pipeline
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {t.metricsHeader}
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-3xl">
            {t.metricsSubheader}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastEvalTimestamp && (
            <span className="text-xs text-emerald-700 font-mono tabular-nums flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Recomputed at {new Date(lastEvalTimestamp).toLocaleTimeString()}</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleRunEvaluation}
            disabled={isRunningEval}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors min-h-[40px]"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isRunningEval
                ? 'Evaluating Test Split...'
                : 'Re-Run Evaluation Pipeline (n=100)'}
            </span>
          </button>
        </div>
      </div>

      {/* Primary Quantitative KPI Grid (Computed from held-out test split & live logs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
          <div className="text-xs text-slate-500">
            Vision Category Accuracy & Quantity MAE
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.visionCategoryAccuracyPct}%{' '}
            <span className="text-sm font-normal text-slate-500">
              · MAE {metrics.quantityMae} u
            </span>
          </div>
          <div className="text-xs text-slate-600 font-mono tabular-nums pt-1">
            Evaluated on {metrics.testSetSize} held-out Mumbai/Navi Mumbai lots
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
          <div className="text-xs text-slate-500">
            LightGBM Price MAPE & Match Precision@5
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.priceMapePct}% MAPE{' '}
            <span className="text-sm font-normal text-emerald-700">
              · P@5 {metrics.matchPrecisionAt5Pct}%
            </span>
          </div>
          <div className="text-xs text-slate-600 font-mono tabular-nums pt-1">
            Benchmarked against CPWD Delhi Schedule of Rates
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
          <div className="text-xs text-slate-500">
            API Latency (P50 / P95) & Listing Speedup
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.p50LatencyMs}ms / {metrics.p95LatencyMs}ms
          </div>
          <div className="text-xs text-emerald-700 font-mono tabular-nums pt-1">
            {metrics.listingTimeComparison.aiSnapSeconds}s AI Snap vs{' '}
            {metrics.listingTimeComparison.manualBaselineSeconds}s manual (
            {metrics.listingTimeComparison.speedupFactor}x faster)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
          <div className="text-xs text-slate-500">
            Waste Diverted & Embodied CO₂ Saved
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {metrics.sustainability.wasteDivertedTons.toLocaleString('en-IN')} T{' '}
            <span className="text-sm font-normal text-slate-700">
              · {metrics.sustainability.co2SavedTons.toLocaleString('en-IN')} T CO₂e
            </span>
          </div>
          <div className="text-xs text-slate-600 font-mono tabular-nums pt-1">
            {metrics.sustainability.wasteDivertedKg.toLocaleString('en-IN')} kg waste ·{' '}
            {metrics.sustainability.co2SavedKg.toLocaleString('en-IN')} kg CO₂e
          </div>
        </div>
      </div>

      {/* Middle Row: Recharts Category Accuracy/MAPE + Sustainability Impact by Material */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Vision Classification Accuracy (%) & Price MAPE (%) by Material
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Computed per CPWD DSR category across the held-out evaluation split
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.categoryBreakdown}
                margin={{ top: 10, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="accuracyPct"
                  name="Vision Accuracy (%)"
                  fill="#0f172a"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="priceMapePct"
                  name="Price MAPE (%)"
                  fill="#d97706"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Waste Diverted (Metric Tons) & Embodied CO₂ Saved (Tons)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated across {metrics.totalListingsSeeded} Mumbai / Navi Mumbai surplus lots
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.categoryBreakdown}
                margin={{ top: 10, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="wasteDivertedTons"
                  name="Waste Diverted (Tons)"
                  fill="#334155"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="co2SavedTons"
                  name="CO₂ Avoided (Tons)"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fraud Detection Confusion Matrix + GMV & Commission Simulation + Security Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Fraud Precision / Recall / F1 + 2x2 Confusion Matrix */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Fraud & Trust Model Evaluation (SHAP + pHash + EXIF)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated across all {metrics.totalListingsSeeded} synthetic listings with ground-truth labels
              </p>
            </div>
            <div className="text-xs font-mono tabular-nums font-semibold text-emerald-700">
              F1 Score: {metrics.fraudMetrics.f1ScorePct}%
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center font-mono tabular-nums">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <div className="text-xs text-slate-500 font-sans">Precision</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {metrics.fraudMetrics.precisionPct}%
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <div className="text-xs text-slate-500 font-sans">Recall</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {metrics.fraudMetrics.recallPct}%
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <div className="text-xs text-slate-500 font-sans">F1 Score</div>
              <div className="text-lg font-bold text-emerald-700 mt-0.5">
                {metrics.fraudMetrics.f1ScorePct}%
              </div>
            </div>
          </div>

          {/* 2x2 Confusion Matrix */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-800">
              2×2 Confusion Matrix (n = {metrics.totalListingsSeeded} Listings):
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono tabular-nums text-xs">
              <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-3.5">
                <div className="text-emerald-900 font-semibold">
                  True Positives (TP): {cm.tp}
                </div>
                <div className="text-[11px] text-emerald-700 font-sans mt-0.5">
                  Fraudulent / duplicate listings correctly flagged or blocked
                </div>
              </div>
              <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-3.5">
                <div className="text-amber-900 font-semibold">
                  False Positives (FP): {cm.fp}
                </div>
                <div className="text-[11px] text-amber-800 font-sans mt-0.5">
                  Legitimate listings held for secondary EXIF review
                </div>
              </div>
              <div className="rounded-lg bg-red-50/70 border border-red-200 p-3.5">
                <div className="text-red-900 font-semibold">
                  False Negatives (FN): {cm.fn}
                </div>
                <div className="text-[11px] text-red-700 font-sans mt-0.5">
                  Subtle price anomaly caught at OTP escrow stage
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5">
                <div className="text-slate-900 font-semibold">
                  True Negatives (TN): {cm.tn}
                </div>
                <div className="text-[11px] text-slate-600 font-sans mt-0.5">
                  Authentic contractor surplus lots verified clean
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: GMV & Commission Simulation + Security Telemetry Counters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">
              GMV & Anti-Leakage Escrow Commission Simulation (6.5% Take Rate)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono tabular-nums">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5">
                <div className="text-xs text-slate-500 font-sans">Active Catalog GMV</div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  ₹{metrics.economics.totalCatalogGmvInr.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5">
                <div className="text-xs text-slate-500 font-sans">Escrow & Settled GMV</div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  ₹{metrics.economics.settledAndEscrowGmvInr.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-3.5">
                <div className="text-xs text-emerald-800 font-sans">
                  Protected Commission (6.5%)
                </div>
                <div className="text-base font-bold text-emerald-800 mt-1">
                  ₹{metrics.economics.projectedCommissionInr.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="font-semibold text-slate-800">
                Live Security Events Blocked:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono tabular-nums">
                <div className="rounded bg-slate-50 border border-slate-200 p-2">
                  <div className="text-[11px] text-slate-500 font-sans">Prompt Injections</div>
                  <div className="font-bold text-red-600">
                    {metrics.securityEventsBlocked.promptInjectionsBlocked} blocked
                  </div>
                </div>
                <div className="rounded bg-slate-50 border border-slate-200 p-2">
                  <div className="text-[11px] text-slate-500 font-sans">Duplicate pHash</div>
                  <div className="font-bold text-red-600">
                    {metrics.securityEventsBlocked.duplicatePhotosBlocked} blocked
                  </div>
                </div>
                <div className="rounded bg-slate-50 border border-slate-200 p-2">
                  <div className="text-[11px] text-slate-500 font-sans">PII Redactions</div>
                  <div className="font-bold text-amber-700">
                    {metrics.securityEventsBlocked.piiRedactionsCount} sanitized
                  </div>
                </div>
                <div className="rounded bg-slate-50 border border-slate-200 p-2">
                  <div className="text-[11px] text-slate-500 font-sans">Rate Limits</div>
                  <div className="font-bold text-slate-900">
                    {metrics.securityEventsBlocked.rateLimitBlocksCount} throttled
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-5 space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <Terminal className="w-4 h-4" />
              <span>Automated CLI Evaluation Pipeline Ready</span>
            </div>
            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
              Run <code className="text-amber-300 font-mono">bash scripts/evaluate_pipeline.sh</code> or{' '}
              <code className="text-amber-300 font-mono">npm run eval</code> to execute the full automated evaluation suite against the 300-listing dataset, security guards, and confusion matrix.
            </p>
          </div>
        </div>
      </div>

      {/* Market Comparison Table from Spec */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-900">
          Platform Architecture Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 pr-4">Capability</th>
                <th className="py-2.5 px-3">OLX / Quikr</th>
                <th className="py-2.5 px-3">IndiaMART / Moglix</th>
                <th className="py-2.5 px-3">WhatsApp Groups</th>
                <th className="py-2.5 pl-3 text-slate-900 font-semibold">
                  YardStock PWA
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 pr-4 font-medium text-slate-900">
                  Surplus / leftover site stock focus
                </td>
                <td className="py-2.5 px-3 text-slate-600">Partial</td>
                <td className="py-2.5 px-3 text-slate-600">No (new stock)</td>
                <td className="py-2.5 px-3 text-slate-600">Informal</td>
                <td className="py-2.5 pl-3 font-semibold text-emerald-700">
                  Yes — Purpose-built with CPWD DSR depreciation
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium text-slate-900">
                  2-Second Vision AI + Voice Auto-Listing
                </td>
                <td className="py-2.5 px-3 text-slate-600">No</td>
                <td className="py-2.5 px-3 text-slate-600">No</td>
                <td className="py-2.5 px-3 text-slate-600">No</td>
                <td className="py-2.5 pl-3 font-semibold text-emerald-700">
                  Yes — Gemini Flash + YOLOv8n + EN/HI/MR Speech
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium text-slate-900">
                  PostGIS Micro-Radius Project Matching
                </td>
                <td className="py-2.5 px-3 text-slate-600">Weak</td>
                <td className="py-2.5 px-3 text-slate-600">No</td>
                <td className="py-2.5 px-3 text-slate-600">Local but manual</td>
                <td className="py-2.5 pl-3 font-semibold text-emerald-700">
                  Yes — ST_DWithin + Explainable "Why Matched"
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium text-slate-900">
                  Fraud Shield & Seller Trust Scoring
                </td>
                <td className="py-2.5 px-3 text-slate-600">Basic</td>
                <td className="py-2.5 px-3 text-slate-600">Basic</td>
                <td className="py-2.5 px-3 text-slate-600">None</td>
                <td className="py-2.5 pl-3 font-semibold text-emerald-700">
                  Explainable SHAP + pHash + EXIF + Prompt Guard
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium text-slate-900">
                  Anti-Leakage Escrow + Mini-Truck OTP
                </td>
                <td className="py-2.5 px-3 text-slate-600">No</td>
                <td className="py-2.5 px-3 text-slate-600">Partial</td>
                <td className="py-2.5 px-3 text-slate-600">No</td>
                <td className="py-2.5 pl-3 font-semibold text-emerald-700">
                  Yes — 6-Digit Delivery OTP & 6.5% Commission Lock
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
