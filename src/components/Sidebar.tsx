import React from 'react';
import {
  LayoutDashboard,
  Layers,
  SearchCode,
  ShieldCheck,
  GitBranch,
  Cloud,
  FileText,
  HardDrive,
  FileKey,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export type NavigationPage =
  | 'dashboard'
  | 'explorer'
  | 'scanner'
  | 'gates'
  | 'pipelines'
  | 'deployments'
  | 'reports'
  | 'storage'
  | 'audit'
  | 'settings';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse
}) => {
  const navItems = [
    { id: 'dashboard' as NavigationPage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explorer' as NavigationPage, label: 'Artifact Registry', icon: Layers },
    { id: 'scanner' as NavigationPage, label: 'Vulnerability Scanner', icon: SearchCode },
    { id: 'gates' as NavigationPage, label: 'Security Gate Center', icon: ShieldCheck },
    { id: 'pipelines' as NavigationPage, label: 'CI/CD Pipelines', icon: GitBranch },
    { id: 'deployments' as NavigationPage, label: 'Cloud Run Deployments', icon: Cloud },
    { id: 'reports' as NavigationPage, label: 'Scan Reports & History', icon: FileText },
    { id: 'storage' as NavigationPage, label: 'Storage & Cost Insights', icon: HardDrive },
    { id: 'audit' as NavigationPage, label: 'Audit Logs', icon: FileKey },
    { id: 'settings' as NavigationPage, label: 'Settings & Cloud APIs', icon: Settings }
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between bg-slate-950 border-r border-slate-800/80 transition-all duration-200 shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col py-4">
        {/* Toggle Collapse Button */}
        <div className="flex items-center justify-between px-3.5 mb-3">
          {!collapsed && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Security Gate Console
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-md transition-colors ml-auto"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Gate Policy Status Card */}
      {!collapsed ? (
        <div className="p-3 m-3 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200">Default Policy</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Strict Gate: 0 Critical Allowed. Fail closed on unverified images.
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-cyan-400 flex items-center justify-between">
            <span>Enforcement Engine</span>
            <span>ACTIVE</span>
          </div>
        </div>
      ) : (
        <div className="p-2 mb-3 mx-auto text-cyan-400" title="Security Gate Active">
          <ShieldAlert className="w-5 h-5" />
        </div>
      )}
    </aside>
  );
};
