import React, { useState, useEffect } from 'react';
import {
  FileKey,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  User
} from 'lucide-react';
import { api } from '../services/api';
import { AuditLogRecord } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');

  const loadLogs = async () => {
    try {
      const data = await api.getAuditLogs({ outcome: outcomeFilter, search });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [outcomeFilter, search]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>Tamper-Evident Security Log Stream</span>
            <span aria-hidden="true">·</span>
            <span>Append-Only Compliance Trail</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
            System Security Audit Logs
          </h1>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Total Logged Operations: {logs.length}
        </span>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actor email, action, resource ID, or details..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
          {(['ALL', 'SUCCESS', 'BLOCKED', 'WARNING'] as const).map((out) => (
            <button
              key={out}
              onClick={() => setOutcomeFilter(out)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                outcomeFilter === out
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {out}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="text-slate-200">{log.actorEmail}</div>
                    <div className="text-[10px] text-cyan-400">{log.actorRole}</div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-300 whitespace-nowrap">
                    {log.action}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-sm font-bold text-[10px] ${
                        log.outcome === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : log.outcome === 'BLOCKED'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {log.outcome}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-cyan-400 whitespace-nowrap">
                    {log.resourceType}: {log.resourceId}
                  </td>

                  <td className="py-3 px-4 text-slate-300 font-sans text-xs max-w-md">
                    <span className="line-clamp-2" title={log.details}>
                      {log.details}
                    </span>
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
