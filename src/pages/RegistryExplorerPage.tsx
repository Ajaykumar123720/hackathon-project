import React, { useEffect, useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  Copy,
  Check,
  CheckCircle,
  AlertTriangle,
  Play,
  ExternalLink,
  Lock,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { ContainerImageRecord, RegistryRecord } from '../types';

interface RegistryExplorerPageProps {
  onScanImage: (imageName: string, imageTag: string) => void;
  onViewScan: (scanId: string) => void;
}

export const RegistryExplorerPage: React.FC<RegistryExplorerPageProps> = ({
  onScanImage,
  onViewScan
}) => {
  const [registries, setRegistries] = useState<RegistryRecord[]>([]);
  const [images, setImages] = useState<ContainerImageRecord[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('ALL');
  const [gateFilter, setGateFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copiedDigest, setCopiedDigest] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ContainerImageRecord | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [regs, imgs] = await Promise.all([
        api.getRegistries(),
        api.getImages({ gateStatus: gateFilter, search })
      ]);
      setRegistries(regs);
      setImages(imgs);
    } catch (err) {
      console.error('Failed to load registry images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [gateFilter, search]);

  const handleCopy = (digest: string) => {
    navigator.clipboard.writeText(digest);
    setCopiedDigest(digest);
    setTimeout(() => setCopiedDigest(null), 2000);
  };

  const handlePromote = async (img: ContainerImageRecord) => {
    if (img.gateStatus !== 'PASSED') {
      alert(`Cannot promote image: Security Gate status is ${img.gateStatus}. Only policy-approved images with 0 Critical vulnerabilities can be published to the release repository.`);
      return;
    }

    setPromotingId(img.id);
    try {
      const res = await api.promoteImage(img.id);
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPromotingId(null);
    }
  };

  const filteredImages = images.filter((img) => {
    if (selectedRepo !== 'ALL') {
      const reg = registries.find((r) => r.id === selectedRepo);
      if (reg && !img.registryUrl.includes(reg.name) && img.registryId !== reg.id) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Alert */}
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
            <span>Google Cloud Artifact Registry Integration</span>
            <span aria-hidden="true">·</span>
            <span>Immutable Digest Architecture</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
            Image Registry Explorer
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Registry</span>
          </button>
        </div>
      </div>

      {/* Configured Google Artifact Registry Repositories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {registries.map((reg) => (
          <div
            key={reg.id}
            onClick={() => setSelectedRepo(selectedRepo === reg.id ? 'ALL' : reg.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedRepo === reg.id
                ? 'bg-slate-900 border-cyan-500/50 ring-1 ring-cyan-500/30'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">{reg.name}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-sm ${
                  reg.isDefaultRelease
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                    : reg.type === 'QUARANTINE'
                    ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {reg.type === 'QUARANTINE' ? 'QUARANTINE' : reg.isDefaultRelease ? 'RELEASE' : 'MIRROR'}
              </span>
            </div>
            <p className="mt-2 text-[11px] font-mono text-slate-400 truncate" title={reg.url}>
              {reg.url}
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
              <span>{reg.imageCount} Container Images</span>
              <span>{(reg.storageBytes / 1000000000).toFixed(1)} GB Storage</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by container name, tag, or sha256 digest..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        {/* Gate Filter Segment */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
          {(['ALL', 'PASSED', 'BLOCKED', 'SCANNING'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setGateFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                gateFilter === st
                  ? 'bg-slate-800 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Images Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Container Image & Tag</th>
                <th className="py-3 px-4">Immutable Digest</th>
                <th className="py-3 px-4">Target Repository</th>
                <th className="py-3 px-4">Gate Status</th>
                <th className="py-3 px-4">Last Scanned</th>
                <th className="py-3 px-4 text-right">Gate Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredImages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                    No container images found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredImages.map((img) => (
                  <tr key={img.id} className="hover:bg-slate-850/40 transition-colors">
                    {/* Name & Tag */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <span>{img.name}</span>
                        <span className="font-mono text-[11px] text-cyan-400 px-1.5 py-0.5 bg-cyan-950/40 border border-cyan-800/40 rounded-xs">
                          {img.tag}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{img.os}</div>
                    </td>

                    {/* Digest */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                        <span className="truncate max-w-[140px]" title={img.digest}>
                          {img.digest.substring(0, 19)}...
                        </span>
                        <button
                          onClick={() => handleCopy(img.digest)}
                          className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Copy full SHA256 digest"
                        >
                          {copiedDigest === img.digest ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Repository */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            img.quarantine ? 'bg-rose-400' : 'bg-emerald-400'
                          }`}
                        />
                        <span className="font-mono text-[11px] text-slate-300">
                          {img.quarantine ? 'quarantine-staging' : 'release-images'}
                        </span>
                      </div>
                    </td>

                    {/* Gate Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm font-mono text-[10px] font-semibold ${
                          img.gateStatus === 'PASSED'
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/60'
                            : img.gateStatus === 'BLOCKED'
                            ? 'bg-rose-950/50 text-rose-400 border border-rose-800/60'
                            : 'bg-amber-950/50 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {img.gateStatus === 'PASSED' && <ShieldCheck className="w-3 h-3" />}
                        {img.gateStatus === 'BLOCKED' && <ShieldAlert className="w-3 h-3" />}
                        {img.gateStatus}
                      </span>
                    </td>

                    {/* Last Scanned */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {img.lastScannedAt ? (
                        new Date(img.lastScannedAt).toLocaleString([], {
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      ) : (
                        <span className="text-slate-600">Never Scanned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Scan Button */}
                        <button
                          onClick={() => onScanImage(img.name, img.tag)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-cyan-300 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-md transition-colors"
                          title="Trigger Trivy Scan"
                        >
                          <Play className="w-3 h-3" />
                          <span>Scan</span>
                        </button>

                        {/* Promote to Release Repository */}
                        {img.quarantine && (
                          <button
                            onClick={() => handlePromote(img)}
                            disabled={promotingId === img.id || img.gateStatus !== 'PASSED'}
                            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                              img.gateStatus === 'PASSED'
                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                                : 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
                            }`}
                            title={
                              img.gateStatus === 'PASSED'
                                ? 'Promote approved image to production release repository'
                                : 'Image is blocked by Security Gate. Cannot promote.'
                            }
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Promote</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
