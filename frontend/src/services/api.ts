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
  UserAccount,
  VulnerabilityRecord
} from '../types';

const BASE_URL = '/api';

// Fallback seed data in case frontend is run without backend running
const FALLBACK_POLICIES: SecurityPolicyRecord[] = [
  {
    id: "policy-prod-strict",
    name: "Production Zero-Tolerance Strict Gate",
    version: "v2.4.0",
    description: "Default Google Cloud Hackathon policy: 0 Critical vulnerabilities, max 2 High vulnerabilities with fix, fail-closed on unverified scans.",
    criticalThreshold: 0,
    highThreshold: 2,
    mediumThreshold: 25,
    blockOnIncompleteScan: true,
    requireFixedVersionRemediation: true,
    allowEmergencyOverride: true,
    isDefault: true,
    updatedAt: "2026-10-09T18:30:00Z",
    updatedBy: "admin"
  }
];

const FALLBACK_VULNS: VulnerabilityRecord[] = [
  {
    id: "vuln-01",
    cveId: "CVE-2023-44487",
    pkgName: "nghttp2",
    installedVersion: "1.43.0-1ubuntu0.1",
    fixedVersion: "1.43.0-1ubuntu0.2",
    severity: "CRITICAL",
    cvssScore: 9.8,
    title: "HTTP/2 Rapid Reset Denial of Service Vulnerability",
    description: "The HTTP/2 protocol allows a client to request cancellation of streams via RST_STREAM frames.",
    primaryUrl: "https://nvd.nist.gov/vuln/detail/CVE-2023-44487",
    publishedDate: "2023-10-10",
    pkgType: "os"
  },
  {
    id: "vuln-02",
    cveId: "CVE-2024-21626",
    pkgName: "runc",
    installedVersion: "1.1.11-0ubuntu1",
    fixedVersion: "1.1.12-0ubuntu1",
    severity: "CRITICAL",
    cvssScore: 9.9,
    title: "runc Leaked File Descriptor Container Breakout (Leaky Vessels)",
    description: "Internal file descriptors remain open inside container namespaces enabling host escape.",
    primaryUrl: "https://nvd.nist.gov/vuln/detail/CVE-2024-21626",
    publishedDate: "2024-01-31",
    pkgType: "os"
  },
  {
    id: "vuln-04",
    cveId: "CVE-2023-38545",
    pkgName: "libcurl4",
    installedVersion: "7.81.0-1ubuntu1.13",
    fixedVersion: "7.81.0-1ubuntu1.14",
    severity: "HIGH",
    cvssScore: 8.8,
    title: "curl SOCKS5 Heap Buffer Overflow",
    description: "Heap-based buffer overflow flaw in SOCKS5 proxy handshake protocol in libcurl.",
    primaryUrl: "https://nvd.nist.gov/vuln/detail/CVE-2023-38545",
    publishedDate: "2023-10-11",
    pkgType: "os"
  }
];

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
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

    return await res.json();
  } catch (err: any) {
    // If backend server is offline, provide graceful fallback in standalone mode
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      console.warn(`[SecureGate Frontend] Backend server unavailable at ${BASE_URL}${url}. Falling back to client-side simulated data.`);
      return handleOfflineFallback<T>(url, options);
    }
    throw err;
  }
}

function handleOfflineFallback<T>(url: string, options?: RequestInit): T {
  if (url === '/auth/me') {
    return {
      user: {
        id: 'usr-01',
        email: 'gvajaykumar125@gmail.com',
        name: 'Ajay Kumar (Hackathon Lead)',
        role: 'ADMIN',
        createdAt: '2026-10-01T00:00:00Z'
      }
    } as any;
  }
  if (url === '/dashboard/summary') {
    return {
      totalImages: 5,
      totalScans: 4,
      passedScans: 2,
      blockedScans: 2,
      passRatePercent: 50,
      totalCritical: 3,
      totalHigh: 8,
      totalMedium: 9,
      totalLow: 4,
      activeDeploymentsCount: 3,
      blockedDeploymentsCount: 1,
      defaultPolicy: FALLBACK_POLICIES[0]
    } as any;
  }
  if (url === '/dashboard/trends') {
    return {
      trendData: [
        { date: 'Oct 04', critical: 3, high: 6, medium: 12, low: 8 },
        { date: 'Oct 06', critical: 4, high: 7, medium: 14, low: 11 },
        { date: 'Oct 08', critical: 2, high: 5, medium: 9, low: 6 },
        { date: 'Oct 10', critical: 0, high: 2, medium: 7, low: 5 }
      ],
      severityDistribution: [
        { name: 'Critical', count: 3, color: '#ef4444' },
        { name: 'High', count: 8, color: '#f97316' },
        { name: 'Medium', count: 18, color: '#f59e0b' },
        { name: 'Low', count: 12, color: '#06b6d4' }
      ],
      riskByRepository: [
        { name: 'release-images', cleanCount: 8, vulnerableCount: 0, criticalCount: 0 },
        { name: 'quarantine-staging', cleanCount: 1, vulnerableCount: 6, criticalCount: 3 }
      ]
    } as any;
  }
  if (url === '/dashboard/activity') {
    return { recentScans: [], recentAudits: [], recentDeployments: [] } as any;
  }
  if (url.startsWith('/registries')) {
    return [
      {
        id: 'reg-01',
        name: 'gcp-artifact-registry-release',
        url: 'us-central1-docker.pkg.dev/securegate-cloud/release-images',
        type: 'GOOGLE_ARTIFACT_REGISTRY',
        region: 'us-central1',
        projectId: 'securegate-cloud',
        imageCount: 14,
        storageBytes: 4210000000,
        isDefaultRelease: true
      },
      {
        id: 'reg-02',
        name: 'gcp-artifact-registry-quarantine',
        url: 'us-central1-docker.pkg.dev/securegate-cloud/quarantine-staging',
        type: 'QUARANTINE',
        region: 'us-central1',
        projectId: 'securegate-cloud',
        imageCount: 8,
        storageBytes: 2150000000,
        isDefaultRelease: false
      }
    ] as any;
  }
  if (url.startsWith('/images')) {
    return [
      {
        id: 'img-01',
        name: 'securegate-api-service',
        tag: 'v1.4.2',
        registryId: 'reg-01',
        registryUrl: 'us-central1-docker.pkg.dev/securegate-cloud/release-images/securegate-api-service:v1.4.2',
        digest: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        sizeBytes: 142000000,
        os: 'linux/amd64 (Debian 12 distroless)',
        architecture: 'amd64',
        pushedAt: '2026-10-10T04:15:00Z',
        lastScannedAt: '2026-10-10T04:17:32Z',
        gateStatus: 'PASSED',
        isPromotedToRelease: true,
        quarantine: false,
        activeDeployments: ['dep-01']
      },
      {
        id: 'img-02',
        name: 'legacy-payment-worker',
        tag: 'v0.9.8',
        registryId: 'reg-02',
        registryUrl: 'us-central1-docker.pkg.dev/securegate-cloud/quarantine-staging/legacy-payment-worker:v0.9.8',
        digest: 'sha256:4c23a78912ef369a8b123654f9871023cdaefb1982736450192837465abcde99',
        sizeBytes: 385000000,
        os: 'linux/amd64 (Ubuntu 20.04 LTS)',
        architecture: 'amd64',
        pushedAt: '2026-10-09T22:04:00Z',
        lastScannedAt: '2026-10-09T22:06:45Z',
        gateStatus: 'BLOCKED',
        isPromotedToRelease: false,
        quarantine: true,
        activeDeployments: []
      }
    ] as any;
  }
  if (url === '/policies') {
    return FALLBACK_POLICIES as any;
  }
  if (url.includes('/evaluate')) {
    const body = options?.body ? JSON.parse(options.body as string) : {};
    const critical = body.criticalCount || 0;
    const high = body.highCount || 0;
    const pass = critical === 0 && high <= 2;
    return {
      decision: pass ? 'PASSED' : 'BLOCKED',
      reason: pass
        ? 'PASSED: 0 Critical, high within limits.'
        : `BLOCKED: Violates policy thresholds (Critical: ${critical}/0, High: ${high}/2).`,
      rulesEvaluated: [
        { rule: 'Critical Vulnerabilities Threshold', passed: critical === 0 },
        { rule: 'High Vulnerabilities Threshold', passed: high <= 2 }
      ]
    } as any;
  }
  if (url.startsWith('/scans')) {
    return [
      {
        id: 'scan-901',
        imageId: 'img-01',
        imageName: 'securegate-api-service',
        imageTag: 'v1.4.2',
        imageDigest: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        scannerEngine: 'Trivy Scanner Adapter v0.58.1',
        scannerVersion: '0.58.1',
        status: 'COMPLETED',
        currentStage: 'Gate Evaluation Complete',
        progressPercent: 100,
        startedAt: '2026-10-10T04:16:00Z',
        completedAt: '2026-10-10T04:17:32Z',
        durationMs: 92000,
        criticalCount: 0,
        highCount: 1,
        mediumCount: 2,
        lowCount: 1,
        gateDecision: 'PASSED',
        gateReason: 'Complies with policy: 0 Critical (limit 0), 1 High (limit 2). Approved for release.',
        policyId: 'policy-prod-strict',
        policyName: 'Production Zero-Tolerance Strict Gate',
        triggeredBy: 'Cloud Build Trigger #8912',
        vulnerabilities: [FALLBACK_VULNS[2]]
      }
    ] as any;
  }
  return [] as any;
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
