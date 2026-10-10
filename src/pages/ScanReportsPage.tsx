import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Search,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Layers,
  CheckCircle2,
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { ScanRecord } from '../types';

interface ScanReportsPageProps {
  initialReportScanId?: string;
}

export const ScanReportsPage: React.FC<ScanReportsPageProps> = ({ initialReportScanId }) => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const [compareScanA, setCompareScanA] = useState<ScanRecord | null>(null);
  const [compareScanB, setCompareScanB] = useState<ScanRecord | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getScans().then((data) => {
      setScans(data);
      if (initialReportScanId) {
        const found = data.find((s) => s.id === initialReportScanId);
        if (found) setSelectedScan(found);
      } else if (data.length > 0) {
        setSelectedScan(data[0]);
      }
    }).catch(console.error);
  }, [initialReportScanId]);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenCompare = () => {
    if (scans.length >= 2) {
      setCompareScanA(scans[0]);
      setCompareScanB(scans[1]);
      setShowCompareModal(true);
    }
  };

  const filteredScans = scans.filter((s) =>
    s.imageName.toLowerCase().includes(search.toLowerCase()) ||
    s.imageTag.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>Enterprise Compliance & Audit Reports</span>
            <span aria-hidden="true">·</span>
            <span>Immutable Historical Records</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
            Scan History & Executive Reports
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCompare}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Compare Scans</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scans List (1 col) */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scan records..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
            />
          </div>

          <div className="space-y-2">
            {filteredScans.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedScan(s)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedScan?.id === s.id
                    ? 'bg-slate-850 border-cyan-500/60 ring-1 ring-cyan-500/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-200">
                    {s.imageName}:{s.imageTag}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-sm font-mono text-[10px] font-semibold ${
                      s.gateDecision === 'PASSED'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {s.gateDecision}
                  </span>
                </div>
                <div className="mt-1 text-[11px] font-mono text-slate-400 truncate">
                  ID: {s.id}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                  <span>
                    {s.criticalCount} Crit · {s.highCount} High · {s.mediumCount} Med
                  </span>
                  <span>{new Date(s.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Report View (2 cols) */}
        <div className="lg:col-span-2">
          {selectedScan ? (
            <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-6 print:bg-white print:text-black">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-semibold">
                    EXECUTIVE SECURITY GATE AUDIT REPORT
                  </span>
                  <h2 className="text-xl font-bold text-slate-100 mt-1">
                    {selectedScan.imageName}:{selectedScan.imageTag}
                  </h2>
                  <div className="text-xs font-mono text-slate-400 mt-1">
                    Scan ID: {selectedScan.id} · Digest: {selectedScan.imageDigest.substring(0, 19)}...
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-md font-mono text-xs font-bold ${
                      selectedScan.gateDecision === 'PASSED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    STATUS: {selectedScan.gateDecision}
                  </span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Executive Findings & Gate Assessment
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {selectedScan.gateReason}
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-400 border-t border-slate-850">
                  <span>Critical Vulnerabilities: <strong className="text-rose-400">{selectedScan.criticalCount}</strong></span>
                  <span>High Vulnerabilities: <strong className="text-orange-400">{selectedScan.highCount}</strong></span>
                  <span>Medium Vulnerabilities: <strong className="text-amber-400">{selectedScan.mediumCount}</strong></span>
                  <span>Low Vulnerabilities: <strong className="text-cyan-400">{selectedScan.lowCount}</strong></span>
                </div>
              </div>

              {/* Metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                <div>
                  <div className="text-slate-500 font-mono text-[10px]">SCANNER ENGINE</div>
                  <div className="font-mono text-slate-200 mt-0.5">{selectedScan.scannerEngine}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-mono text-[10px]">EVALUATED POLICY</div>
                  <div className="font-mono text-slate-200 mt-0.5">{selectedScan.policyName}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-mono text-[10px]">SCAN TIMESTAMP</div>
                  <div className="font-mono text-slate-200 mt-0.5">
                    {new Date(selectedScan.startedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-mono text-[10px]">TRIGGER SOURCE</div>
                  <div className="font-mono text-slate-200 mt-0.5">{selectedScan.triggeredBy}</div>
                </div>
              </div>

              {/* Remediation Action Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Prioritized Remediation Roadmap
                </h3>

                <div className="space-y-2">
                  {selectedScan.vulnerabilities.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.2 rounded-xs font-mono text-[10px] font-bold ${
                              v.severity === 'CRITICAL'
                                ? 'bg-rose-950 text-rose-400'
                                : v.severity === 'HIGH'
                                ? 'bg-orange-950 text-orange-400'
                                : 'bg-amber-950 text-amber-400'
                            }`}
                          >
                            {v.severity}
                          </span>
                          <span className="font-mono font-semibold text-slate-200">{v.cveId}</span>
                          <span className="text-slate-400">in package</span>
                          <span className="font-mono text-cyan-400 font-medium">{v.pkgName}</span>
                        </div>
                        <span className="font-mono text-slate-400 text-[11px]">CVSS {v.cvssScore}</span>
                      </div>

                      <div className="text-[11px] text-slate-300 leading-normal">{v.title}</div>

                      <div className="pt-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-850">
                        <span>Installed: {v.installedVersion}</span>
                        <span>
                          Recommended Fix:{' '}
                          {v.fixedVersion ? (
                            <strong className="text-emerald-400">Upgrade to {v.fixedVersion}</strong>
                          ) : (
                            <span className="text-slate-500">Apply compensating firewall rule</span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
              Select a scan report to view details.
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison Modal */}
      {showCompareModal && compareScanA && compareScanB && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Side-by-Side Scan Comparison</h3>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Scan A */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="font-bold text-slate-200">{compareScanA.imageName}:{compareScanA.imageTag}</div>
                <div className="text-xs font-mono text-slate-400">ID: {compareScanA.id}</div>
                <div className={`text-xs font-mono font-bold ${compareScanA.gateDecision === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Gate: {compareScanA.gateDecision}
                </div>
                <div className="pt-2 border-t border-slate-800 text-xs font-mono space-y-1">
                  <div>Critical: {compareScanA.criticalCount}</div>
                  <div>High: {compareScanA.highCount}</div>
                  <div>Medium: {compareScanA.mediumCount}</div>
                  <div>Total CVEs: {compareScanA.vulnerabilities.length}</div>
                </div>
              </div>

              {/* Scan B */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="font-bold text-slate-200">{compareScanB.imageName}:{compareScanB.imageTag}</div>
                <div className="text-xs font-mono text-slate-400">ID: {compareScanB.id}</div>
                <div className={`text-xs font-mono font-bold ${compareScanB.gateDecision === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Gate: {compareScanB.gateDecision}
                </div>
                <div className="pt-2 border-t border-slate-800 text-xs font-mono space-y-1">
                  <div>Critical: {compareScanB.criticalCount}</div>
                  <div>High: {compareScanB.highCount}</div>
                  <div>Medium: {compareScanB.mediumCount}</div>
                  <div>Total CVEs: {compareScanB.vulnerabilities.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
