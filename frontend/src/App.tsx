import React, { useState, useEffect } from 'react';
import { Sidebar, NavigationPage } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardPage } from './pages/DashboardPage';
import { RegistryExplorerPage } from './pages/RegistryExplorerPage';
import { VulnerabilityScannerPage } from './pages/VulnerabilityScannerPage';
import { SecurityGateCenterPage } from './pages/SecurityGateCenterPage';
import { PipelineCenterPage } from './pages/PipelineCenterPage';
import { DeploymentCenterPage } from './pages/DeploymentCenterPage';
import { ScanReportsPage } from './pages/ScanReportsPage';
import { StorageInsightsPage } from './pages/StorageInsightsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';
import { UserAccount, NotificationRecord } from './types';

export function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeEnv, setActiveEnv] = useState('production');
  const [selectedScanId, setSelectedScanId] = useState<string | undefined>(undefined);

  const [currentUser, setCurrentUser] = useState<UserAccount>({
    id: 'usr-01',
    email: 'gvajaykumar125@gmail.com',
    name: 'Ajay Kumar (Hackathon Lead)',
    role: 'ADMIN',
    createdAt: '2026-10-01T00:00:00Z'
  });

  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  useEffect(() => {
    api.getMe().then((res) => {
      if (res?.user) setCurrentUser(res.user);
    }).catch(console.error);

    api.getNotifications().then(setNotifications).catch(console.error);
  }, []);

  const handleSwitchUser = (role: string) => {
    const roleProfiles: Record<string, UserAccount> = {
      ADMIN: {
        id: 'usr-01',
        email: 'gvajaykumar125@gmail.com',
        name: 'Ajay Kumar (Hackathon Lead)',
        role: 'ADMIN',
        createdAt: '2026-10-01T00:00:00Z'
      },
      SECURITY_ANALYST: {
        id: 'usr-02',
        email: 'sec-analyst@securegate.dev',
        name: 'Sarah Chen (Security Analyst)',
        role: 'SECURITY_ANALYST',
        createdAt: '2026-10-02T00:00:00Z'
      },
      DEVELOPER: {
        id: 'usr-03',
        email: 'dev-lead@securegate.dev',
        name: 'Marcus Vance (DevSecOps Lead)',
        role: 'DEVELOPER',
        createdAt: '2026-10-03T00:00:00Z'
      },
      VIEWER: {
        id: 'usr-04',
        email: 'auditor@securegate.dev',
        name: 'Elena Rostova (Compliance Auditor)',
        role: 'VIEWER',
        createdAt: '2026-10-04T00:00:00Z'
      }
    };

    if (roleProfiles[role]) {
      setCurrentUser(roleProfiles[role]);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleSelectScan = (scanId: string) => {
    setSelectedScanId(scanId);
    setCurrentPage('scanner');
  };

  const handleScanImageFromExplorer = (imageName: string, imageTag: string) => {
    setCurrentPage('scanner');
  };

  const handleOpenReport = (scanId: string) => {
    setSelectedScanId(scanId);
    setCurrentPage('reports');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <TopNav
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          notifications={notifications}
          onMarkRead={handleMarkNotificationRead}
          activeEnv={activeEnv}
          onEnvChange={setActiveEnv}
        />

        {/* Viewport content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={setCurrentPage}
              onSelectScan={handleSelectScan}
            />
          )}

          {currentPage === 'explorer' && (
            <RegistryExplorerPage
              onScanImage={handleScanImageFromExplorer}
              onViewScan={handleSelectScan}
            />
          )}

          {currentPage === 'scanner' && (
            <VulnerabilityScannerPage
              initialScanId={selectedScanId}
              onOpenReport={handleOpenReport}
            />
          )}

          {currentPage === 'gates' && (
            <SecurityGateCenterPage currentUser={currentUser} />
          )}

          {currentPage === 'pipelines' && <PipelineCenterPage />}

          {currentPage === 'deployments' && <DeploymentCenterPage />}

          {currentPage === 'reports' && (
            <ScanReportsPage initialReportScanId={selectedScanId} />
          )}

          {currentPage === 'storage' && <StorageInsightsPage />}

          {currentPage === 'audit' && <AuditLogsPage />}

          {currentPage === 'settings' && <SettingsPage currentUser={currentUser} />}
        </main>
      </div>
    </div>
  );
}
export default App;
