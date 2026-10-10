import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Layers,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export const StorageInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStorageInsights().then((data) => {
      setInsights(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) {
    return <div className="p-8 text-xs text-slate-500">Loading storage analytics...</div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>Google Artifact Registry Storage Optimization</span>
            <span aria-hidden="true">·</span>
            <span>FinOps & Layer Deduplication</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
            Storage & Cost Insights
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Standard Tier Rate: $0.10 / GB-month</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Total Registry Storage</div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100 tabular-nums">
            {insights?.totalSizeGB} GB
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Across {insights?.totalRepositories} repositories
          </div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Estimated Monthly Cost</div>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            ${insights?.estimatedMonthlyCostUSD} <span className="text-xs font-sans text-slate-400">/ mo</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Based on active GCP standard rate
          </div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Active Deployed Protection</div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {insights?.activeDeployedProtectedCount} Images
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Protected from GC deletion
          </div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Quarantine Staging Usage</div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {insights?.quarantineCount} Images
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Isolated unverified images
          </div>
        </div>
      </div>

      {/* Transparency Note */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-slate-100">Cost Transparency Notice</div>
          <p className="mt-1 leading-relaxed text-slate-400">
            Estimated storage costs are calculated using Google Cloud standard Artifact Registry pricing ($0.10/GB/month for data at rest). Actual GCP billing may vary depending on multi-region replication, egress, and active credits.
          </p>
        </div>
      </div>

      {/* Cleanup candidates */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Untagged & Stale Container Recommendations
            </h2>
            <p className="text-xs text-slate-400">
              Safe cleanup candidates that are not attached to any active Cloud Run revision
            </p>
          </div>

          <span className="text-xs font-mono text-emerald-400">
            Potential Monthly Savings: ~${insights?.cleanupPotentialSavingUSD}/mo ({insights?.cleanupPotentialSavingGB} GB)
          </span>
        </div>

        <div className="space-y-3">
          {insights?.untaggedOrStaleImages?.map((stale: any, i: number) => (
            <div
              key={i}
              className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{stale.name}</span>
                  <span className="font-mono text-slate-400 text-[11px]">{stale.tag}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{stale.reason}</div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 shrink-0">
                <span>{stale.sizeMB} MB</span>
                <span>Age: {stale.ageDays} days</span>
                <span className="text-amber-400">Pending Review</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
