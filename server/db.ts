import {
  ContainerImageRecord,
  RegistryRecord,
  SecurityPolicyRecord,
  ScanRecord,
  PipelineRunRecord,
  DeploymentRecord,
  AuditLogRecord,
  NotificationRecord,
  VulnerabilityRecord,
  CVE_DATABASE,
  INITIAL_REGISTRIES,
  INITIAL_POLICIES,
  INITIAL_IMAGES,
  INITIAL_SCANS,
  INITIAL_DEPLOYMENTS,
  INITIAL_PIPELINES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from './data/seed';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SECURITY_ANALYST' | 'DEVELOPER' | 'VIEWER';
  createdAt: string;
}

export interface IntegrationConfig {
  gcpProjectId: string;
  artifactRegistryRegion: string;
  releaseRepositoryName: string;
  quarantineRepositoryName: string;
  cloudRunRegion: string;
  trivyScannerPath: string;
  scannerVersion: string;
  gcpScanEnabled: boolean;
  trivyInstalled: boolean;
  webhookUrl: string;
  emergencyOverrideActive: boolean;
  emergencyOverrideExpiresAt?: string;
  emergencyOverrideReason?: string;
}

class DatabaseStore {
  users: UserAccount[] = [
    {
      id: "usr-01",
      email: "gvajaykumar125@gmail.com",
      name: "Ajay Kumar (Hackathon Lead)",
      role: "ADMIN",
      createdAt: "2026-10-01T00:00:00Z"
    },
    {
      id: "usr-02",
      email: "sec-analyst@securegate.dev",
      name: "Sarah Chen",
      role: "SECURITY_ANALYST",
      createdAt: "2026-10-02T00:00:00Z"
    },
    {
      id: "usr-03",
      email: "dev-lead@securegate.dev",
      name: "Marcus Vance",
      role: "DEVELOPER",
      createdAt: "2026-10-03T00:00:00Z"
    },
    {
      id: "usr-04",
      email: "auditor@securegate.dev",
      name: "Elena Rostova",
      role: "VIEWER",
      createdAt: "2026-10-04T00:00:00Z"
    }
  ];

  registries: RegistryRecord[] = [...INITIAL_REGISTRIES];
  policies: SecurityPolicyRecord[] = [...INITIAL_POLICIES];
  images: ContainerImageRecord[] = [...INITIAL_IMAGES];
  scans: ScanRecord[] = [...INITIAL_SCANS];
  deployments: DeploymentRecord[] = [...INITIAL_DEPLOYMENTS];
  pipelines: PipelineRunRecord[] = [...INITIAL_PIPELINES];
  auditLogs: AuditLogRecord[] = [...INITIAL_AUDIT_LOGS];
  notifications: NotificationRecord[] = [...INITIAL_NOTIFICATIONS];
  vulnerabilityCatalog: VulnerabilityRecord[] = [...CVE_DATABASE];

  integrations: IntegrationConfig = {
    gcpProjectId: "securegate-cloud",
    artifactRegistryRegion: "us-central1",
    releaseRepositoryName: "release-images",
    quarantineRepositoryName: "quarantine-staging",
    cloudRunRegion: "us-central1",
    trivyScannerPath: "trivy",
    scannerVersion: "0.58.1",
    gcpScanEnabled: true,
    trivyInstalled: false, // Honestly report whether binary was found in container
    webhookUrl: "https://events.securegate.dev/webhooks/security-gate",
    emergencyOverrideActive: false
  };

  logAudit(actorEmail: string, actorRole: string, action: string, resourceType: string, resourceId: string, outcome: 'SUCCESS' | 'BLOCKED' | 'FAILURE' | 'WARNING', details: string, ipAddress = "127.0.0.1") {
    const record: AuditLogRecord = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorEmail,
      actorRole,
      action,
      resourceType,
      resourceId,
      outcome,
      details,
      ipAddress
    };
    this.auditLogs.unshift(record);
    return record;
  }

  addNotification(title: string, message: string, severity: 'CRITICAL' | 'HIGH' | 'INFO' | 'WARNING', category: 'GATE' | 'SCAN' | 'DEPLOYMENT' | 'PIPELINE' | 'POLICY', link?: string) {
    const notif: NotificationRecord = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title,
      message,
      severity,
      isRead: false,
      category,
      link
    };
    this.notifications.unshift(notif);
    return notif;
  }
}

export const db = new DatabaseStore();
