import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle,
  XCircle,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  Server,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import { DeploymentRecord, ContainerImageRecord } from '../types';

export const DeploymentCenterPage: React.FC = () => {
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [images, setImages] = useState<ContainerImageRecord[]>([]);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedDigest, setSelectedDigest] = useState('');
  const [serviceName, setServiceName] = useState('securegate-api-service');
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'development'>('production');

  const [deploying, setDeploying] = useState(false);
  const [gateRejection, setGateRejection] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [deps, imgs] = await Promise.all([
        api.getDeployments(),
        api.getImages()
      ]);
      setDeployments(deps);
      setImages(imgs);
      if (imgs.length > 0 && !selectedDigest) {
        setSelectedDigest(imgs[0].digest);
      }
    } catch (err) {
      console.error('Failed to load deployments:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeploy = async () => {
    setDeploying(true);
    setGateRejection(null);

    try {
      const newDep = await api.deployService({
        serviceName,
        imageDigest: selectedDigest,
        environment
      });
      setToastMessage(`Deployed revision ${newDep.revision} successfully to Cloud Run!`);
      setTimeout(() => setToastMessage(null), 4000);
      setShowDeployModal(false);
      loadData();
    } catch (err: any) {
      // Security Gate Violation caught!
      setGateRejection(err.message);
    } finally {
      setDeploying(false);
    }
  };

  const handleRollback = async (dep: DeploymentRecord) => {
    if (!confirm(`Rollback service ${dep.serviceName} to revision ${dep.previousRevision || 'previous verified revision'}?`)) {
      return;
    }

    try {
      const res = await api.rollbackDeployment(dep.id);
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 4000);
      loadData();
    } catch (err: any) {
      alert('Rollback failed: ' + err.message);
    }
  };

  const selectedImageRecord = images.find((i) => i.digest === selectedDigest);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-emerald-950 border border-emerald-700 rounded-xl shadow-xl flex items-center gap-3 text-emerald-200 text-xs animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>Google Cloud Run Deployment Gate</span>
            <span aria-hidden="true">·</span>
            <span>Immutable Digest Enforcement</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
            Cloud Run Deployment Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setGateRejection(null);
              setShowDeployModal(true);
            }}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Deploy Verified Digest</span>
          </button>
        </div>
      </div>

      {/* Cloud Run Services Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Configured Cloud Run Deployments</h2>
          <span className="text-xs font-mono text-slate-400">Region: us-central1 (Managed)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Cloud Run Service</th>
                <th className="py-3 px-4">Active Revision</th>
                <th className="py-3 px-4">Pinned Immutable Digest</th>
                <th className="py-3 px-4">Gate Pre-Check</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deployments.map((dep) => (
                <tr key={dep.id} className="hover:bg-slate-850/40 transition-colors">
                  {/* Service Name & Env */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200 flex items-center gap-2">
                      <span>{dep.serviceName}</span>
                      <span className="font-mono text-[10px] text-cyan-400 uppercase px-1.5 py-0.2 rounded-xs bg-cyan-950 border border-cyan-800">
                        {dep.environment}
                      </span>
                    </div>
                    <a
                      href={dep.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-cyan-300 font-mono flex items-center gap-1 mt-0.5"
                    >
                      <span className="truncate max-w-[180px]">{dep.url}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>

                  {/* Revision */}
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {dep.revision}
                  </td>

                  {/* Digest */}
                  <td className="py-3 px-4 font-mono text-slate-400" title={dep.imageDigest}>
                    {dep.imageDigest.substring(0, 19)}...
                  </td>

                  {/* Gate Check */}
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-semibold ${
                        dep.gateDecision === 'PASSED'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {dep.gateDecision === 'PASSED' ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <ShieldAlert className="w-3 h-3" />
                      )}
                      <span>{dep.gateDecision}</span>
                    </span>
                  </td>

                  {/* Health */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-mono ${
                        dep.healthStatus === 'HEALTHY'
                          ? 'text-emerald-400'
                          : dep.status === 'REJECTED_BY_GATE'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          dep.healthStatus === 'HEALTHY'
                            ? 'bg-emerald-400'
                            : dep.status === 'REJECTED_BY_GATE'
                            ? 'bg-rose-400'
                            : 'bg-amber-400'
                        }`}
                      />
                      <span>{dep.status === 'REJECTED_BY_GATE' ? 'REJECTED' : dep.healthStatus}</span>
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {new Date(dep.deployedAt).toLocaleString([], {
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>

                  {/* Rollback */}
                  <td className="py-3 px-4 text-right">
                    {dep.status === 'READY' && (
                      <button
                        onClick={() => handleRollback(dep)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-cyan-300 bg-slate-950 border border-slate-800 rounded-md ml-auto transition-colors"
                        title="Rollback to previous approved revision"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Rollback</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deploy Verified Image Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">Deploy Container to Google Cloud Run</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Pre-flight Gate Enforcement</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cloud Run Service Name
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Environment Target
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                >
                  <option value="production">Production (Zero-Tolerance Strict Gate)</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select Container Image & Digest
                </label>
                <select
                  value={selectedDigest}
                  onChange={(e) => setSelectedDigest(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                >
                  {images.map((img) => (
                    <option key={img.id} value={img.digest}>
                      {img.name}:{img.tag} ({img.gateStatus}) — {img.digest.substring(0, 15)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Image Status Preview */}
              {selectedImageRecord && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                    selectedImageRecord.gateStatus === 'PASSED'
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold">
                      Security Gate Status: {selectedImageRecord.gateStatus}
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      {selectedImageRecord.gateStatus === 'PASSED'
                        ? 'Image has passed Trivy scan policy and is cleared for production.'
                        : 'WARNING: Image has NOT passed security gate policy! Deployment will be blocked.'}
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-sm bg-slate-950">
                    {selectedImageRecord.gateStatus}
                  </span>
                </div>
              )}

              {/* Gate Rejection Error Banner */}
              {gateRejection && (
                <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-300">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>SECURITY GATE POLICY VIOLATION</span>
                  </div>
                  <p className="leading-relaxed font-mono">{gateRejection}</p>
                  <p className="text-[11px] text-rose-300/80 pt-1">
                    Rule Enforced: "No image may pass the security gate unless it satisfies the configured security policy."
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowDeployModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors"
              >
                {deploying ? 'Revalidating Gate...' : 'Deploy to Cloud Run'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
