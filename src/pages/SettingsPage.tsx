import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cloud,
  Terminal,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  Save,
  Server,
  Lock,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { UserAccount } from '../types';

interface SettingsPageProps {
  currentUser: UserAccount;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser }) => {
  const [health, setHealth] = useState<any>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [gcpProjectId, setGcpProjectId] = useState('securegate-cloud');
  const [arRegion, setArRegion] = useState('us-central1');
  const [cloudRunRegion, setCloudRunRegion] = useState('us-central1');
  const [webhookUrl, setWebhookUrl] = useState('https://events.securegate.dev/webhooks/security-gate');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'ADMIN';

  const loadData = async () => {
    try {
      const [h, u] = await Promise.all([
        api.getIntegrationsHealth(),
        api.getUsers()
      ]);
      setHealth(h);
      setUsers(u);
    } catch (err) {
      console.error('Failed to load settings data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveConfig = async () => {
    if (!isAdmin) {
      alert('Permission Denied: Only administrators can modify cloud integration settings.');
      return;
    }

    setSaving(true);
    try {
      await api.updateIntegrationsConfig({
        gcpProjectId,
        artifactRegistryRegion: arRegion,
        cloudRunRegion,
        webhookUrl
      });
      setNotification('Cloud integrations configuration updated.');
      setTimeout(() => setNotification(null), 3000);
      loadData();
    } catch (err: any) {
      alert('Error updating config: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!isAdmin) {
      alert('Permission Denied: Only administrators can modify RBAC user roles.');
      return;
    }

    try {
      await api.updateUserRole(userId, newRole);
      setNotification(`User role successfully changed to ${newRole}`);
      setTimeout(() => setNotification(null), 3000);
      loadData();
    } catch (err: any) {
      alert('Failed to update role: ' + err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-emerald-950 border border-emerald-700 rounded-xl shadow-xl flex items-center gap-3 text-emerald-200 text-xs animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>Enterprise Configuration & Cloud Health</span>
            <span aria-hidden="true">·</span>
            <span>Google Cloud Platform (GCP) & Trivy Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
            Settings & Integration Diagnostics
          </h1>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Probe Status</span>
        </button>
      </div>

      {/* Live Integration Diagnostics Probe */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100">Live Integration Diagnostics</h2>
          <p className="text-xs text-slate-400">Real-time verification of container scanner and GCP services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Trivy Engine */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Trivy Scanner Engine</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-sm">
                ONLINE
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300">
              Version: {health?.trivyEngine?.version || '0.58.1'}
            </div>
            <div className="text-[11px] text-slate-400">
              Adapter: {health?.trivyEngine?.adapter}
            </div>
            <div className="text-[10px] font-mono text-cyan-400 pt-1 border-t border-slate-850">
              Host Binary: {health?.trivyEngine?.hostBinaryDetected ? 'Detected' : 'Native Emulation Engine'}
            </div>
          </div>

          {/* Artifact Registry */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Google Artifact Registry</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-sm">
                CONFIGURED
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300">
              Project: {health?.googleArtifactRegistry?.projectId}
            </div>
            <div className="text-[11px] text-slate-400">
              Region: {health?.googleArtifactRegistry?.region}
            </div>
            <div className="text-[10px] font-mono text-cyan-400 pt-1 border-t border-slate-850 truncate">
              Release: {health?.googleArtifactRegistry?.releaseRepo}
            </div>
          </div>

          {/* Cloud Run */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Google Cloud Run</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-sm">
                ACTIVE
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300">
              Region: {health?.googleCloudRun?.region}
            </div>
            <div className="text-[11px] text-slate-400">
              Active Protected Services: {health?.googleCloudRun?.activeServicesCount}
            </div>
            <div className="text-[10px] font-mono text-cyan-400 pt-1 border-t border-slate-850">
              Enforcement: Immutable SHA256 Digest
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Configuration Form */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Google Cloud Platform Configuration</h2>
            <p className="text-xs text-slate-400">Target project and regional endpoints for deployment</p>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={saving || !isAdmin}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              isAdmin
                ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Google Cloud Project ID
            </label>
            <input
              type="text"
              value={gcpProjectId}
              onChange={(e) => setGcpProjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Artifact Registry Region
            </label>
            <input
              type="text"
              value={arRegion}
              onChange={(e) => setArRegion(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Cloud Run Deployment Region
            </label>
            <input
              type="text"
              value={cloudRunRegion}
              onChange={(e) => setCloudRunRegion(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Security Gate Alert Webhook URL
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
            />
          </div>
        </div>
      </div>

      {/* User Management & RBAC */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100">Role-Based Access Control (RBAC)</h2>
          <p className="text-xs text-slate-400">Manage user roles and enforcement permissions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Current Role</th>
                <th className="py-2.5 px-4 text-right">Modify Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-850/40">
                  <td className="py-3 px-4 font-semibold text-slate-200 font-sans">{u.name}</td>
                  <td className="py-3 px-4 text-slate-300">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-sm bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={u.role}
                      disabled={!isAdmin}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-xs"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="SECURITY_ANALYST">SECURITY_ANALYST</option>
                      <option value="DEVELOPER">DEVELOPER</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
