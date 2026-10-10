import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Bell,
  CheckCircle,
  AlertTriangle,
  User,
  ExternalLink,
  X,
  Server
} from 'lucide-react';
import { UserAccount, NotificationRecord } from '../types';

interface TopNavProps {
  currentUser: UserAccount;
  onSwitchUser: (role: string) => void;
  notifications: NotificationRecord[];
  onMarkRead: (id: string) => void;
  onSearchSelect?: (term: string) => void;
  activeEnv: string;
  onEnvChange: (env: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentUser,
  onSwitchUser,
  notifications,
  onMarkRead,
  activeEnv,
  onEnvChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Brand Wordmark (Single text element wordmark as per Top Bar Contract) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <span className="text-base font-semibold tracking-tight text-slate-100 whitespace-nowrap">
          SecureGate AI
        </span>
      </div>

      {/* Zone 2: Navigation Search & Environment Context */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images, digests (sha256:...), CVEs, or policies..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
          />
        </div>

        {/* Environment Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
          {(['production', 'staging', 'development'] as const).map((env) => (
            <button
              key={env}
              onClick={() => onEnvChange(env)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                activeEnv === env
                  ? 'bg-slate-800 text-cyan-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>

      {/* Zone 3: Actions & Profile Menu */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Cloud Status indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-mono">GCP Artifact Registry (us-central1)</span>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden lg:block" />

        {/* Notifications Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View security notifications"
            className="relative p-2 text-slate-300 hover:text-slate-100 hover:bg-slate-900 rounded-lg border border-transparent hover:border-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-slate-950 bg-cyan-400 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-semibold text-slate-200">Security Gate Alerts</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No notifications at this time.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkRead(n.id)}
                      className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                        n.isRead
                          ? 'bg-slate-950/40 border-slate-800/50 text-slate-400'
                          : n.severity === 'CRITICAL'
                          ? 'bg-rose-950/20 border-rose-800/40 text-slate-200'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-200 line-clamp-1">{n.title}</span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User / RBAC Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors text-left"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-semibold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-medium text-slate-200 leading-none">{currentUser.name}</div>
              <div className="text-[10px] font-mono text-cyan-400 leading-tight mt-0.5">{currentUser.role}</div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50">
              <div className="pb-2 mb-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser.email}</p>
              </div>

              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1.5">
                Switch Role (Live RBAC Demo):
              </p>
              {(['ADMIN', 'SECURITY_ANALYST', 'DEVELOPER', 'VIEWER'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onSwitchUser(role);
                    setShowUserMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    currentUser.role === role
                      ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {role}
                  {role === 'ADMIN' && ' (Full Security Policy Control)'}
                  {role === 'SECURITY_ANALYST' && ' (Trivy Scan Reviewer)'}
                  {role === 'DEVELOPER' && ' (Build & Scan Requester)'}
                  {role === 'VIEWER' && ' (Read Only)'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
