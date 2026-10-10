export type Role = 'ADMIN' | 'SECURITY_ANALYST' | 'DEVELOPER' | 'VIEWER';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface VulnerabilityRecord {
  id: string;
  cveId: string;
  pkgName: string;
  installedVersion: string;
  fixedVersion: string | null;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssScore: number;
  cvssVector?: string;
  title: string;
  description: string;
  primaryUrl: string;
  publishedDate: string;
  pkgType: 'os' | 'npm' | 'maven' | 'pip' | 'golang';
}

export interface ContainerImageRecord {
  id: string;
  name: string;
  tag: string;
  registryId: string;
  registryUrl: string;
  digest: string;
  sizeBytes: number;
  os: string;
  architecture: string;
  pushedAt: string;
  lastScannedAt: string | null;
  gateStatus: 'PASSED' | 'BLOCKED' | 'SCANNING' | 'UNSCANNED';
  isPromotedToRelease: boolean;
  quarantine: boolean;
  activeDeployments: string[];
}

export interface SecurityPolicyRecord {
  id: string;
  name: string;
  version: string;
  description: string;
  criticalThreshold: number;
  highThreshold: number;
  mediumThreshold: number;
  blockOnIncompleteScan: boolean;
  requireFixedVersionRemediation: boolean;
  allowEmergencyOverride: boolean;
  isDefault: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface ScanRecord {
  id: string;
  imageId: string;
  imageName: string;
  imageTag: string;
  imageDigest: string;
  scannerEngine: string;
  scannerVersion: string;
  status: 'PENDING' | 'SCANNING' | 'COMPLETED' | 'FAILED';
  currentStage: string;
  progressPercent: number;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  gateDecision: 'PASSED' | 'BLOCKED' | 'EVALUATING' | 'FAILED_SCAN';
  gateReason: string;
  policyId: string;
  policyName: string;
  vulnerabilities: VulnerabilityRecord[];
  triggeredBy: string;
}

export interface RegistryRecord {
  id: string;
  name: string;
  url: string;
  type: 'GOOGLE_ARTIFACT_REGISTRY' | 'DOCKER_HUB' | 'QUARANTINE';
  region: string;
  projectId: string;
  imageCount: number;
  storageBytes: number;
  isDefaultRelease: boolean;
}

export interface PipelineRunRecord {
  id: string;
  pipelineName: string;
  repo: string;
  branch: string;
  commitSha: string;
  commitMessage: string;
  imageName: string;
  imageTag: string;
  imageDigest: string;
  status: 'RUNNING' | 'PASSED' | 'BLOCKED' | 'FAILED';
  currentStage: string;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number;
  triggeredBy: string;
  stages: {
    name: string;
    status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'SKIPPED' | 'BLOCKED';
    durationSeconds: number;
    logs: string[];
  }[];
}

export interface DeploymentRecord {
  id: string;
  serviceName: string;
  environment: 'production' | 'staging' | 'development';
  region: string;
  imageDigest: string;
  imageTag: string;
  revision: string;
  status: 'READY' | 'DEPLOYING' | 'REJECTED_BY_GATE' | 'FAILED' | 'ROLLED_BACK';
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'UNAVAILABLE';
  deployedAt: string;
  deployedBy: string;
  trafficPercent: number;
  url: string;
  gateVerifiedAt: string;
  gateDecision: 'PASSED' | 'BLOCKED';
  previousRevision?: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  outcome: 'SUCCESS' | 'BLOCKED' | 'FAILURE' | 'WARNING';
  details: string;
  ipAddress: string;
}

export interface NotificationRecord {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'INFO' | 'WARNING';
  isRead: boolean;
  category: 'GATE' | 'SCAN' | 'DEPLOYMENT' | 'PIPELINE' | 'POLICY';
  link?: string;
}

export interface DashboardSummary {
  totalImages: number;
  totalScans: number;
  passedScans: number;
  blockedScans: number;
  passRatePercent: number;
  totalCritical: number;
  totalHigh: number;
  totalMedium: number;
  totalLow: number;
  activeDeploymentsCount: number;
  blockedDeploymentsCount: number;
  defaultPolicy: SecurityPolicyRecord;
}
