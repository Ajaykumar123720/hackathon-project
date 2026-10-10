import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Sliders,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  History,
  Save,
  Play,
  RotateCcw,
  Zap,
  Lock,
  Edit2
} from 'lucide-react';
import { api } from '../services/api';
import { SecurityPolicyRecord, UserAccount } from '../types';

interface SecurityGateCenterPageProps {
  currentUser: UserAccount;
}

export const SecurityGateCenterPage: React.FC<SecurityGateCenterPageProps> = ({ currentUser }) => {
  const [policies, setPolicies] = useState<SecurityPolicyRecord[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicyRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Policy Form State
  const [criticalLimit, setCriticalLimit] = useState(0);
  const [highLimit, setHighLimit] = useState(2);
  const [mediumLimit, setMediumLimit] = useState(25);
  const [blockIncomplete, setBlockIncomplete] = useState(true);
  const [requireFix, setRequireFix] = useState(true);

  // Policy Simulator State
  const [simCritical, setSimCritical] = useState(1);
  const [simHigh, setSimHigh] = useState(3);
  const [simMedium, setSimMedium] = useState(12);
  const [simIncomplete, setSimIncomplete] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Emergency Override State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideMinutes, setOverrideMinutes] = useState(30);
  const [overrideStatus, setOverrideStatus] = useState<any>(null);

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'ADMIN';

  const loadPolicies = async () => {
    try {
      const data = await api.getPolicies();
      setPolicies(data);
      if (data.length > 0) {
        const defaultPol = data.find((p) => p.isDefault) || data[0];
        setSelectedPolicy(defaultPol);
        setCriticalLimit(defaultPol.criticalThreshold);
        setHighLimit(defaultPol.highThreshold);
        setMediumLimit(defaultPol.mediumThreshold);
        setBlockIncomplete(defaultPol.blockOnIncompleteScan);
        setRequireFix(defaultPol.requireFixedVersionRemediation);
      }
    } catch (err) {
      console.error('Failed to load policies:', err);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  // Run simulator on mount and when sim params change
  useEffect(() => {
    if (selectedPolicy) {
      api.simulatePolicy(selectedPolicy.id, {
        criticalCount: simCritical,
        highCount: simHigh,
        mediumCount: simMedium,
        isScanIncomplete: simIncomplete
      }).then(setSimResult).catch(console.error);
    }
  }, [selectedPolicy, simCritical, simHigh, simMedium, simIncomplete]);

  const handleSavePolicy = async () => {
    if (!isAdmin) {
      alert('Permission Denied: Only administrators can modify production security gate policies.');
      return;
    }

    if (!selectedPolicy) return;
    setSaving(true);
    try {
      const updated = await api.updatePolicy(selectedPolicy.id, {
        criticalThreshold: criticalLimit,
        highThreshold: highLimit,
        mediumThreshold: mediumLimit,
        blockOnIncompleteScan: blockIncomplete,
        requireFixedVersionRemediation: requireFix
      });
      setSelectedPolicy(updated);
      setIsEditing(false);
      setNotification(`Security Gate Policy updated to version ${updated.version} and logged to audit trail.`);
      setTimeout(() => setNotification(null), 4000);
      loadPolicies();
    } catch (err: any) {
      alert('Failed to save policy: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerOverride = async () => {
    if (!overrideReason.trim()) {
      alert('Justification reason is required for emergency override.');
      return;
    }

    try {
      const res = await api.enableEmergencyOverride({
        durationMinutes: overrideMinutes,
        reason: overrideReason
      });
      setOverrideStatus(res);
      setShowOverrideModal(false);
      setNotification(`Emergency override activated. All operations audit-logged.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert('Failed to trigger override: ' + err.message);
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
            <span>Security Policy Enforcement Center</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Bypass Architecture</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
            Security Gate Management
          </h1>
        </div>

        {/* Emergency Override Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOverrideModal(true)}
            disabled={!isAdmin}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isAdmin
                ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border-rose-800/80'
                : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
            title={!isAdmin ? 'Admin privileges required' : 'Trigger audited emergency override'}
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>Emergency Override</span>
          </button>
        </div>
      </div>

      {/* Active Policy Card & Editor */}
      {selectedPolicy && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-slate-100">{selectedPolicy.name}</h2>
                <span className="px-2 py-0.5 rounded-sm font-mono text-xs bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {selectedPolicy.version}
                </span>
                {selectedPolicy.isDefault && (
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    (DEFAULT PRODUCTION GATE)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedPolicy.description}</p>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={!isAdmin}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    isAdmin
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Configure Thresholds</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePolicy}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Deploy Policy</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Threshold Configurations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Critical Threshold */}
            <div className="p-4 bg-slate-950/80 border border-rose-900/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-rose-400">Critical Vulnerabilities Threshold</span>
                <span className="text-[10px] font-mono text-rose-400">STRICT BLOCK</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
                {isEditing ? (
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={criticalLimit}
                    onChange={(e) => setCriticalLimit(Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-slate-100 text-lg"
                  />
                ) : (
                  <span>&le; {selectedPolicy.criticalThreshold}</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Default: 0. Any image with &gt; 0 Critical CVEs is unconditionally blocked from release.
              </p>
            </div>

            {/* High Threshold */}
            <div className="p-4 bg-slate-950/80 border border-orange-900/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-orange-400">High Vulnerabilities Threshold</span>
                <span className="text-[10px] font-mono text-orange-400">CONFIGURABLE</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
                {isEditing ? (
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={highLimit}
                    onChange={(e) => setHighLimit(Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-slate-100 text-lg"
                  />
                ) : (
                  <span>&le; {selectedPolicy.highThreshold}</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Images exceeding this number of High vulnerabilities will be blocked.
              </p>
            </div>

            {/* Medium Threshold */}
            <div className="p-4 bg-slate-950/80 border border-amber-900/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-amber-400">Medium Vulnerabilities Threshold</span>
                <span className="text-[10px] font-mono text-amber-400">REPORT & TRACK</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
                {isEditing ? (
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={mediumLimit}
                    onChange={(e) => setMediumLimit(Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-slate-100 text-lg"
                  />
                ) : (
                  <span>&le; {selectedPolicy.mediumThreshold}</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Tracked for quality audits. Images above limit trigger security warnings.
              </p>
            </div>
          </div>

          {/* Special Gate Invariants */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div>
                <div className="text-xs font-semibold text-slate-200">Fail-Closed Invariant</div>
                <div className="text-[11px] text-slate-400">Block image on failed, incomplete, or unverifiable security scan</div>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-400 px-2 py-1 bg-emerald-950/50 rounded-sm">
                ENFORCED (YES)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div>
                <div className="text-xs font-semibold text-slate-200">Patch Availability Rule</div>
                <div className="text-[11px] text-slate-400">Block images if vendor patch (fixed version) is available but unapplied</div>
              </div>
              <span className="text-xs font-mono font-semibold text-cyan-400 px-2 py-1 bg-cyan-950/50 rounded-sm">
                ENABLED
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Policy Simulator */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Interactive Security Gate Simulator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate container image vulnerability scenarios against the current gate policy to verify pass/block decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulator Inputs */}
          <div className="space-y-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Simulated Vulnerability Counts
            </h3>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Critical Vulnerabilities:</span>
                <span className="font-mono font-bold text-rose-400">{simCritical}</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                value={simCritical}
                onChange={(e) => setSimCritical(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>High Vulnerabilities:</span>
                <span className="font-mono font-bold text-orange-400">{simHigh}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={simHigh}
                onChange={(e) => setSimHigh(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Medium Vulnerabilities:</span>
                <span className="font-mono font-bold text-amber-400">{simMedium}</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={simMedium}
                onChange={(e) => setSimMedium(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Simulate Scan Interruption / Incomplete:</span>
              <button
                onClick={() => setSimIncomplete(!simIncomplete)}
                className={`px-3 py-1 text-xs font-mono rounded-md border transition-colors ${
                  simIncomplete
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {simIncomplete ? 'INCOMPLETE (FAIL)' : 'COMPLETE (OK)'}
              </button>
            </div>
          </div>

          {/* Simulator Outcome Display */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-3">
                Security Gate Evaluation Result
              </h3>

              {simResult && (
                <div className="space-y-3">
                  <div
                    className={`p-4 rounded-xl border text-sm font-mono flex items-center gap-3 ${
                      simResult.decision === 'PASSED'
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                    }`}
                  >
                    {simResult.decision === 'PASSED' ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-base">FINAL DECISION: {simResult.decision}</div>
                      <div className="text-xs opacity-90 mt-0.5">{simResult.reason}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 text-xs font-mono">
                    {simResult.rulesEvaluated?.map((r: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-slate-900/60 rounded-md border border-slate-800/60"
                      >
                        <span className="text-slate-300">{r.rule}</span>
                        <span
                          className={`font-semibold ${
                            r.passed ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {r.passed ? 'PASS' : 'BLOCK'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800/80">
              *Evaluated by backend PolicyEvaluatorService using exact production gate invariants.
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <Zap className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Activate Emergency Security Override</h3>
                <p className="text-xs text-slate-400">Strictly audited time-limited bypass for high-priority incidents</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Justification Reason & Incident Reference (Mandatory)
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Production hotfix for outage INC-8912. Verified by CISO Ajay Kumar."
                  rows={3}
                  className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Override Duration (Minutes)
                </label>
                <select
                  value={overrideMinutes}
                  onChange={(e) => setOverrideMinutes(Number(e.target.value))}
                  className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-xs text-rose-300 leading-relaxed">
              <strong>Notice:</strong> Emergency overrides do not disable scanning. Every bypassed container image is permanently tagged with an incident override flag in the tamper-evident audit log.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 text-xs text-slate-300 hover:text-slate-100 bg-slate-950 border border-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerOverride}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
              >
                Sign & Activate Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
