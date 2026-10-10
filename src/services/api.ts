import {
  DashboardSummary,
  ContainerImageRecord,
  RegistryRecord,
  ScanRecord,
  SecurityPolicyRecord,
  PipelineRunRecord,
  DeploymentRecord,
  AuditLogRecord,
  NotificationRecord,
  UserAccount
} from '../types';

const BASE_URL = '/api';

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!res.ok) {
    let errorMsg = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error || data.message || data.reason) {
        errorMsg = data.error || data.message || data.reason;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  getMe: () => fetchJson<{ user: UserAccount }>('/auth/me'),
  login: (email: string) => fetchJson<{ token: string; user: UserAccount }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  logout: () => fetchJson<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  // Dashboard
  getDashboardSummary: () => fetchJson<DashboardSummary>('/dashboard/summary'),
  getDashboardTrends: () => fetchJson<{
    trendData: any[];
    severityDistribution: { name: string; count: number; color: string }[];
    riskByRepository: { name: string; cleanCount: number; vulnerableCount: number; criticalCount: number }[];
  }>('/dashboard/trends'),
  getDashboardActivity: () => fetchJson<{
    recentScans: ScanRecord[];
    recentAudits: AuditLogRecord[];
    recentDeployments: DeploymentRecord[];
  }>('/dashboard/activity'),

  // Registries & Images
  getRegistries: () => fetchJson<RegistryRecord[]>('/registries'),
  getImages: (params?: { search?: string; gateStatus?: string; quarantine?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchJson<ContainerImageRecord[]>(`/images${q ? `?${q}` : ''}`);
  },
  getImageDetails: (id: string) => fetchJson<{
    image: ContainerImageRecord;
    scans: ScanRecord[];
    deployments: DeploymentRecord[];
  }>(`/images/${id}`),
  promoteImage: (id: string) => fetchJson<{ success: boolean; message: string; image: ContainerImageRecord }>(`/images/${id}/promote`, {
    method: 'POST'
  }),

  // Scans
  getScans: (params?: { status?: string; decision?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchJson<ScanRecord[]>(`/scans${q ? `?${q}` : ''}`);
  },
  getScanById: (id: string) => fetchJson<ScanRecord>(`/scans/${id}`),
  startScan: (imageName: string, imageTag: string, policyId?: string) => fetchJson<ScanRecord>('/scans', {
    method: 'POST',
    body: JSON.stringify({ imageName, imageTag, policyId })
  }),
  getScanReport: (id: string) => fetchJson<any>(`/scans/${id}/report`),

  // Policies
  getPolicies: () => fetchJson<SecurityPolicyRecord[]>('/policies'),
  updatePolicy: (id: string, updates: Partial<SecurityPolicyRecord>) => fetchJson<SecurityPolicyRecord>(`/policies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  simulatePolicy: (policyId: string, payload: { criticalCount: number; highCount: number; mediumCount: number; isScanIncomplete?: boolean }) => fetchJson<{
    decision: 'PASSED' | 'BLOCKED';
    reason: string;
    rulesEvaluated: any[];
  }>(`/policies/${policyId}/evaluate`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  enableEmergencyOverride: (payload: { durationMinutes: number; reason: string }) => fetchJson<any>('/policies/override', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // CI/CD Pipelines
  getPipelines: () => fetchJson<PipelineRunRecord[]>('/pipelines'),
  getPipelineById: (id: string) => fetchJson<PipelineRunRecord>(`/pipelines/${id}`),
  triggerPipeline: (payload: { pipelineName?: string; repo?: string; branch?: string; imageName?: string; imageTag?: string }) => fetchJson<PipelineRunRecord>('/pipelines/trigger', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getPipelineLogs: (id: string) => fetchJson<{ logs: string[] }>(`/pipelines/${id}/logs`),

  // Deployments (Cloud Run)
  getDeployments: () => fetchJson<DeploymentRecord[]>('/deployments'),
  deployService: (payload: { serviceName: string; imageDigest: string; environment?: string; region?: string }) => fetchJson<DeploymentRecord>('/deployments', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  rollbackDeployment: (id: string) => fetchJson<{ success: boolean; message: string; activeDeployment: DeploymentRecord }>(`/deployments/${id}/rollback`, {
    method: 'POST'
  }),

  // Users & RBAC
  getUsers: () => fetchJson<UserAccount[]>('/users'),
  updateUserRole: (id: string, role: string) => fetchJson<UserAccount>(`/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  }),

  // Audit Logs
  getAuditLogs: (params?: { outcome?: string; action?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchJson<AuditLogRecord[]>(`/audit-logs${q ? `?${q}` : ''}`);
  },

  // Notifications
  getNotifications: () => fetchJson<NotificationRecord[]>('/notifications'),
  markNotificationRead: (id: string) => fetchJson<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),

  // Integrations & Health
  getIntegrationsHealth: () => fetchJson<any>('/integrations/health'),
  updateIntegrationsConfig: (config: any) => fetchJson<any>('/integrations/config', {
    method: 'PUT',
    body: JSON.stringify(config)
  }),

  // Storage Insights
  getStorageInsights: () => fetchJson<any>('/storage-insights')
};
