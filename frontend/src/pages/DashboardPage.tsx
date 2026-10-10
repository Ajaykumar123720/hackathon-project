import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Ban,
  Layers,
  Search,
  Activity,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { api } from '../services/api';
import { DashboardSummary, ScanRecord, DeploymentRecord, AuditLogRecord } from '../types';

interface DashboardPageProps {
  onNavigate: (page: any) => void;
  onSelectScan: (scanId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onSelectScan }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<any>(null);
  const [activity, setActivity] = useState<{
    recentScans: ScanRecord[];
    recentAudits: AuditLogRecord[];
    recentDeployments: DeploymentRecord[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [sum, tr, act] = await Promise.all([
        api.getDashboardSummary(),
        api.getDashboardTrends(),
        api.getDashboardActivity()
      ]);
      setSummary(sum);
      setTrends(tr);
      setActivity(act);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-slate-900 animate-pulse rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-900 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-72 bg-slate-900 animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>Google Cloud Run & Artifact Registry Security Gate</span>
            <span aria-hidden="true">·</span>
            <span>Policy: {summary?.defaultPolicy?.name || 'Production Strict'}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
            Executive Security Gate Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>

          <button
            onClick={() => onNavigate('scanner')}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Trigger Image Scan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Images */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Container Images Monitored</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100 tabular-nums">
            {summary?.totalImages ?? 0}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span>Tracked across release & quarantine</span>
          </div>
        </div>

        {/* Security Gate Pass Rate */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Security Gate Pass Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {summary?.passRatePercent ?? 100}%
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="text-emerald-400 font-mono font-medium">{summary?.passedScans} Passed</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-400 font-mono font-medium">{summary?.blockedScans} Blocked</span>
          </div>
        </div>

        {/* Critical Vulnerabilities */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Critical CVEs Detected</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {summary?.totalCritical ?? 0}
          </div>
          <div className="mt-2 text-[11px] text-rose-400/90">
            <span>Zero-tolerance gate enforced</span>
          </div>
        </div>

        {/* Blocked Deployments */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Prevented Cloud Run Deploys</span>
            <Ban className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {summary?.blockedDeploymentsCount ?? 0}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Vulnerable digests stopped at gate</span>
          </div>
        </div>
      </div>

      {/* Main Charts Section: Trend & Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Vulnerability Detection Trend</h2>
              <p className="text-xs text-slate-400">Trivy scan results tracked over time by severity</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span> Critical
              </span>
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-orange-500"></span> High
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span> Medium
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {trends?.trendData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCrit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorMed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="critical" stroke="#ef4444" fillOpacity={1} fill="url(#colorCrit)" strokeWidth={2} />
                  <Area type="monotone" dataKey="high" stroke="#f97316" fillOpacity={1} fill="url(#colorHigh)" strokeWidth={2} />
                  <Area type="monotone" dataKey="medium" stroke="#f59e0b" fillOpacity={1} fill="url(#colorMed)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No trend metrics available
              </div>
            )}
          </div>
        </div>

        {/* Severity Distribution (1 col) */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Vulnerabilities by Severity</h2>
            <p className="text-xs text-slate-400">Current active catalog across repositories</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            {trends?.severityDistribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.severityDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {trends.severityDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-rose-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical (Blocks Gate)
              </span>
              <span className="font-mono tabular-nums font-semibold text-slate-200">{summary?.totalCritical ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-orange-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span> High (Threshold: 2)
              </span>
              <span className="font-mono tabular-nums font-semibold text-slate-200">{summary?.totalHigh ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium (Tracked)
              </span>
              <span className="font-mono tabular-nums font-semibold text-slate-200">{summary?.totalMedium ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution by Repository & Recent Gate Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk by Repository */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Repository Isolation & Risk</h2>
              <p className="text-xs text-slate-400">Images segmented by Google Artifact Registry repository</p>
            </div>
            <button
              onClick={() => onNavigate('explorer')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {trends?.riskByRepository?.map((repo: any) => (
              <div key={repo.name} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-medium text-slate-200">{repo.name}</span>
                  <div className="flex items-center gap-2">
                    {repo.criticalCount > 0 ? (
                      <span className="text-[11px] text-rose-400 font-medium">
                        {repo.criticalCount} Critical (Quarantined)
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        0 Critical (Production Ready)
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(repo.cleanCount / (repo.cleanCount + repo.vulnerableCount || 1)) * 100}%` }}
                    className="bg-emerald-500 h-full"
                  />
                  <div
                    style={{ width: `${(repo.vulnerableCount / (repo.cleanCount + repo.vulnerableCount || 1)) * 100}%` }}
                    className="bg-rose-500 h-full"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Approved: {repo.cleanCount} images</span>
                  <span>Blocked: {repo.vulnerableCount} images</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Scan Activity */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Latest Security Gate Scans</h2>
              <p className="text-xs text-slate-400">Real-time decisions enforced by Trivy scanner</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {activity?.recentScans.slice(0, 4).map((scan) => (
              <div
                key={scan.id}
                onClick={() => onSelectScan(scan.id)}
                className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {scan.imageName}:{scan.imageTag}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-medium ${
                        scan.gateDecision === 'PASSED'
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50'
                          : 'bg-rose-950/50 text-rose-400 border border-rose-800/50'
                      }`}
                    >
                      {scan.gateDecision}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 font-mono truncate">
                    {scan.criticalCount} Critical · {scan.highCount} High · {scan.mediumCount} Medium
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono text-slate-400">
                    {new Date(scan.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-[10px] text-cyan-400 mt-0.5 flex items-center gap-1 justify-end">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
