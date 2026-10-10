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
  scannerEngine: 'Trivy Scanner Adapter v0.58.1' | 'Google Artifact Registry Vulnerability Scanner';
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

// Curated authentic CVE Vulnerability Library
export const CVE_DATABASE: VulnerabilityRecord[] = [
  {
    id: "vuln-01",
    cveId: "CVE-2023-44487",
    pkgName: "nghttp2",
    installedVersion: "1.43.0-1ubuntu0.1",
    fixedVersion: "1.43.0-1ubuntu0.2",
    severity: "CRITICAL",
    cvssScore: 9.8,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
    title: "HTTP/2 Rapid Reset Denial of Service Vulnerability",
    description: "The HTTP/2 protocol allows a client to request cancellation of streams via RST_STREAM frames. Attackers exploit this to initiate request flood with minimal cost, consuming server CPU resources.",
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
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
    title: "runc Leaked File Descriptor Container Breakout (Leaky Vessels)",
    description: "In runc 1.1.11 and earlier, internal file descriptors remain open inside container namespaces, enabling malicious containers to overwrite the host binary /proc/self/cwd and achieve host root escape.",
    primaryUrl: "https://nvd.nist.gov/vuln/detail/CVE-2024-21626",
    publishedDate: "2024-01-31",
    pkgType: "os"
  },
  {
    id: "vuln-03",
    cveId: "CVE-2024-6387",
    pkgName: "openssh-server",
    installedVersion: "1:8.9p1-3ubuntu0.7",
    fixedVersion: "1:8.9p1-3ubuntu0.10",
    severity: "CRITICAL",
    cvssScore: 9.8,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    title: "regreSSHion: Remote Code Execution in OpenSSH's server",
    description: "Signal handler race condition in OpenSSH server (sshd) allows unauthenticated remote attackers to execute arbitrary code as root on glibc-based Linux container images.",
    primaryUrl: "https://nvd.nist.gov/vuln/detail/CVE-2024-6387",
    publishedDate: "2024-07-01",
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
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H",
    title: "curl SOCKS5 Heap Buffer Overflow",
    description: "A heap-based buffer overflow flaw was found in the SOCKS5 proxy handshake protocol in libcurl when resolving hostnames longer than 255 bytes.",
    primaryUrl: "https://nvd.nist.gov/vuln/detail/CVE-2023-38545",
    publishedDate: "2023-10-11",
    pkgType: "os"
  },
  {
    id: "vuln-05",
    cveId: "CVE-2023-48795",
    pkgName: "libssh-4",
    installedVersion: "0.9.6-2ubuntu0.22.04.1",
    fixedVersion: "0.9.6-2ubuntu0.22.04.2",
    severity: "HIGH",
    cvssScore: 7.5,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:H/A:N",
    title: "Terrapin Attack: SSH Transport Protocol Sequence Manipulation",
    description: "Vulnerability in SSH transport protocol enables man-in-the-middle attackers to truncate messages, disable extension negotiation, and downgrade authentication algorithms.",
    primaryUrl: "https://nvd.nist.gov/vuln/detail/CVE-2023-48795",
    publishedDate: "2023-12-18",
    pkgType: "os"
  },
  {
    id: "vuln-06",
    cveId: "CVE-2024-29025",
    pkgName: "io.netty:netty-codec-http",
    installedVersion: "4.1.100.Final",
    fixedVersion: "4.1.108.Final",
    severity: "HIGH",
    cvssScore: 7.5,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
    title: "Netty HTTP Post-Body Incomplete Chunk Allocation DoS",
    description: "Netty HTTP post request decoder can allocate excessive memory when processing crafted multipart forms, resulting in an OutOfMemoryError and service disruption.",
    primaryUrl: "https://nvd.nist.gov/vuln/detail/CVE-2024-29025",
    publishedDate: "2024-03-25",
    pkgType: "maven"
  },
  {
    id: "vuln-07",
    cveId: "CVE-2024-24576",
    pkgName: "std::process::Command (rust)",
    installedVersion: "1.77.1",
    fixedVersion: "1.77.2",
    severity: "HIGH",
    cvssScore: 8.6,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N",
    title: "Rust Command Injection on Batch File Invocation",
    description: "The Rust standard library did not properly escape arguments when invoking batch files (.bat and .cmd) on Windows runtimes.",
    primaryUrl: "https://nvd.nist.gov/vuln/detail/CVE-2024-24576",
    publishedDate: "2024-04-09",
    pkgType: "os"
  },
  {
    id: "vuln-08",
    cveId: "CVE-2023-34462",
    pkgName: "io.netty:netty-handler",
    installedVersion: "4.1.92.Final",
    fixedVersion: "4.1.94.Final",
    severity: "MEDIUM",
    cvssScore: 6.5,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L",
    title: "Netty SniHandler Infinite Certificate Loop",
    description: "Improper SSL/TLS handling when processing SNI extensions may cause excessive thread consumption on unencrypted handshake loops.",
    primaryUrl: "https://nvd.nist.gov/vuln/detail/CVE-2023-34462",
    publishedDate: "2023-06-22",
    pkgType: "maven"
  },
  {
    id: "vuln-09",
    cveId: "CVE-2023-45853",
    pkgName: "zlib1g",
    installedVersion: "1:1.2.11.dfsg-2ubuntu9.2",
    fixedVersion: null,
    severity: "MEDIUM",
    cvssScore: 5.3,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L",
    title: "zlib MiniZip Integer Overflow in zipOpenNewFileInZip4_64",
    description: "MiniZip in zlib contains an integer overflow in zipOpenNewFileInZip4_64 when handling long comments or filenames.",
    primaryUrl: "https://nvd.nist.gov/vuln/detail/CVE-2023-45853",
    publishedDate: "2023-10-14",
    pkgType: "os"
  },
  {
    id: "vuln-10",
    cveId: "CVE-2023-2650",
    pkgName: "openssl",
    installedVersion: "3.0.2-0ubuntu1.10",
    fixedVersion: "3.0.2-0ubuntu1.12",
    severity: "LOW",
    cvssScore: 3.7,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:L",
    title: "OpenSSL Issue processing ASN.1 object identifier",
    description: "Processing malformed ASN.1 object identifiers may lead to mild timing delays during parsing operations.",
    primaryUrl: "https://nvd.nist.gov/vuln/detail/CVE-2023-2650",
    publishedDate: "2023-05-30",
    pkgType: "os"
  }
];

export const INITIAL_REGISTRIES: RegistryRecord[] = [
  {
    id: "reg-01",
    name: "gcp-artifact-registry-release",
    url: "us-central1-docker.pkg.dev/securegate-cloud/release-images",
    type: "GOOGLE_ARTIFACT_REGISTRY",
    region: "us-central1",
    projectId: "securegate-cloud",
    imageCount: 14,
    storageBytes: 4210000000, // ~4.2 GB
    isDefaultRelease: true
  },
  {
    id: "reg-02",
    name: "gcp-artifact-registry-quarantine",
    url: "us-central1-docker.pkg.dev/securegate-cloud/quarantine-staging",
    type: "QUARANTINE",
    region: "us-central1",
    projectId: "securegate-cloud",
    imageCount: 8,
    storageBytes: 2150000000, // ~2.15 GB
    isDefaultRelease: false
  },
  {
    id: "reg-03",
    name: "dockerhub-mirror-upstream",
    url: "docker.io/securegate",
    type: "DOCKER_HUB",
    region: "global",
    projectId: "dockerhub-integration",
    imageCount: 5,
    storageBytes: 1300000000,
    isDefaultRelease: false
  }
];

export const INITIAL_POLICIES: SecurityPolicyRecord[] = [
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
    updatedBy: "gvajaykumar125@gmail.com"
  },
  {
    id: "policy-staging-balanced",
    name: "Staging Standard DevSecOps Gate",
    version: "v1.8.0",
    description: "Staging policy allowing up to 0 Critical, 5 High vulnerabilities for testing before release staging.",
    criticalThreshold: 0,
    highThreshold: 5,
    mediumThreshold: 50,
    blockOnIncompleteScan: true,
    requireFixedVersionRemediation: false,
    allowEmergencyOverride: false,
    isDefault: false,
    updatedAt: "2026-10-05T12:00:00Z",
    updatedBy: "security-ops@securegate.dev"
  }
];

export const INITIAL_IMAGES: ContainerImageRecord[] = [
  {
    id: "img-01",
    name: "securegate-api-service",
    tag: "v1.4.2",
    registryId: "reg-01",
    registryUrl: "us-central1-docker.pkg.dev/securegate-cloud/release-images/securegate-api-service:v1.4.2",
    digest: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    sizeBytes: 142000000, // 142 MB
    os: "linux/amd64 (Debian 12 distroless)",
    architecture: "amd64",
    pushedAt: "2026-10-10T04:15:00Z",
    lastScannedAt: "2026-10-10T04:17:32Z",
    gateStatus: "PASSED",
    isPromotedToRelease: true,
    quarantine: false,
    activeDeployments: ["dep-01"]
  },
  {
    id: "img-02",
    name: "legacy-payment-worker",
    tag: "v0.9.8",
    registryId: "reg-02",
    registryUrl: "us-central1-docker.pkg.dev/securegate-cloud/quarantine-staging/legacy-payment-worker:v0.9.8",
    digest: "sha256:4c23a78912ef369a8b123654f9871023cdaefb1982736450192837465abcde99",
    sizeBytes: 385000000,
    os: "linux/amd64 (Ubuntu 20.04 LTS)",
    architecture: "amd64",
    pushedAt: "2026-10-09T22:04:00Z",
    lastScannedAt: "2026-10-09T22:06:45Z",
    gateStatus: "BLOCKED",
    isPromotedToRelease: false,
    quarantine: true,
    activeDeployments: []
  },
  {
    id: "img-03",
    name: "auth-gateway-proxy",
    tag: "v2.1.0",
    registryId: "reg-01",
    registryUrl: "us-central1-docker.pkg.dev/securegate-cloud/release-images/auth-gateway-proxy:v2.1.0",
    digest: "sha256:91bcfe332145aa89102938475610293847561029384756102938475610293847",
    sizeBytes: 98000000,
    os: "linux/amd64 (Alpine 3.19.1)",
    architecture: "amd64",
    pushedAt: "2026-10-10T02:00:00Z",
    lastScannedAt: "2026-10-10T02:03:10Z",
    gateStatus: "PASSED",
    isPromotedToRelease: true,
    quarantine: false,
    activeDeployments: ["dep-02"]
  },
  {
    id: "img-04",
    name: "analytics-batch-processor",
    tag: "v3.0.0-rc1",
    registryId: "reg-02",
    registryUrl: "us-central1-docker.pkg.dev/securegate-cloud/quarantine-staging/analytics-batch-processor:v3.0.0-rc1",
    digest: "sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    sizeBytes: 512000000,
    os: "linux/amd64 (Ubuntu 22.04 LTS)",
    architecture: "amd64",
    pushedAt: "2026-10-08T15:20:00Z",
    lastScannedAt: "2026-10-08T15:22:50Z",
    gateStatus: "BLOCKED",
    isPromotedToRelease: false,
    quarantine: true,
    activeDeployments: []
  },
  {
    id: "img-05",
    name: "frontend-spa-edge",
    tag: "v1.8.0",
    registryId: "reg-01",
    registryUrl: "us-central1-docker.pkg.dev/securegate-cloud/release-images/frontend-spa-edge:v1.8.0",
    digest: "sha256:55aa66bb77cc88dd99ee00ff112233445566778899aabbccddeeff0011223344",
    sizeBytes: 48000000,
    os: "linux/amd64 (Nginx Alpine)",
    architecture: "amd64",
    pushedAt: "2026-10-10T06:10:00Z",
    lastScannedAt: "2026-10-10T06:12:15Z",
    gateStatus: "PASSED",
    isPromotedToRelease: true,
    quarantine: false,
    activeDeployments: ["dep-03"]
  }
];

export const INITIAL_SCANS: ScanRecord[] = [
  {
    id: "scan-901",
    imageId: "img-01",
    imageName: "securegate-api-service",
    imageTag: "v1.4.2",
    imageDigest: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    scannerEngine: "Trivy Scanner Adapter v0.58.1",
    scannerVersion: "0.58.1",
    status: "COMPLETED",
    currentStage: "Gate Evaluation Complete",
    progressPercent: 100,
    startedAt: "2026-10-10T04:16:00Z",
    completedAt: "2026-10-10T04:17:32Z",
    durationMs: 92000,
    criticalCount: 0,
    highCount: 1,
    mediumCount: 2,
    lowCount: 1,
    gateDecision: "PASSED",
    gateReason: "Complies with policy: 0 Critical (limit 0), 1 High (limit 2). Approved for release & Cloud Run deployment.",
    policyId: "policy-prod-strict",
    policyName: "Production Zero-Tolerance Strict Gate",
    triggeredBy: "Cloud Build Trigger #8912",
    vulnerabilities: [
      CVE_DATABASE[3], // CVE-2023-38545 HIGH
      CVE_DATABASE[7], // CVE-2023-34462 MEDIUM
      CVE_DATABASE[8], // CVE-2023-45853 MEDIUM
      CVE_DATABASE[9]  // CVE-2023-2650 LOW
    ]
  },
  {
    id: "scan-902",
    imageId: "img-02",
    imageName: "legacy-payment-worker",
    imageTag: "v0.9.8",
    imageDigest: "sha256:4c23a78912ef369a8b123654f9871023cdaefb1982736450192837465abcde99",
    scannerEngine: "Trivy Scanner Adapter v0.58.1",
    scannerVersion: "0.58.1",
    status: "COMPLETED",
    currentStage: "Gate Evaluation Complete",
    progressPercent: 100,
    startedAt: "2026-10-09T22:04:15Z",
    completedAt: "2026-10-09T22:06:45Z",
    durationMs: 150000,
    criticalCount: 2,
    highCount: 3,
    mediumCount: 4,
    lowCount: 2,
    gateDecision: "BLOCKED",
    gateReason: "SECURITY GATE VIOLATION: 2 CRITICAL vulnerabilities detected (CVE-2023-44487, CVE-2024-21626). Threshold is 0. Image isolated in quarantine repository.",
    policyId: "policy-prod-strict",
    policyName: "Production Zero-Tolerance Strict Gate",
    triggeredBy: "github-actions-bot",
    vulnerabilities: [
      CVE_DATABASE[0], // CVE-2023-44487 CRITICAL
      CVE_DATABASE[1], // CVE-2024-21626 CRITICAL
      CVE_DATABASE[3], // CVE-2023-38545 HIGH
      CVE_DATABASE[4], // CVE-2023-48795 HIGH
      CVE_DATABASE[5], // CVE-2024-29025 HIGH
      CVE_DATABASE[7], // CVE-2023-34462 MEDIUM
      CVE_DATABASE[8], // CVE-2023-45853 MEDIUM
      CVE_DATABASE[9]  // CVE-2023-2650 LOW
    ]
  },
  {
    id: "scan-903",
    imageId: "img-03",
    imageName: "auth-gateway-proxy",
    imageTag: "v2.1.0",
    imageDigest: "sha256:91bcfe332145aa89102938475610293847561029384756102938475610293847",
    scannerEngine: "Google Artifact Registry Vulnerability Scanner",
    scannerVersion: "GCP-AR-Scan-2026",
    status: "COMPLETED",
    currentStage: "Gate Evaluation Complete",
    progressPercent: 100,
    startedAt: "2026-10-10T02:01:00Z",
    completedAt: "2026-10-10T02:03:10Z",
    durationMs: 130000,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 1,
    lowCount: 1,
    gateDecision: "PASSED",
    gateReason: "Complies with policy: 0 Critical, 0 High vulnerabilities. Approved for production.",
    policyId: "policy-prod-strict",
    policyName: "Production Zero-Tolerance Strict Gate",
    triggeredBy: "gvajaykumar125@gmail.com",
    vulnerabilities: [
      CVE_DATABASE[8], // CVE-2023-45853 MEDIUM
      CVE_DATABASE[9]  // CVE-2023-2650 LOW
    ]
  },
  {
    id: "scan-904",
    imageId: "img-04",
    imageName: "analytics-batch-processor",
    imageTag: "v3.0.0-rc1",
    imageDigest: "sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    scannerEngine: "Trivy Scanner Adapter v0.58.1",
    scannerVersion: "0.58.1",
    status: "COMPLETED",
    currentStage: "Gate Evaluation Complete",
    progressPercent: 100,
    startedAt: "2026-10-08T15:20:10Z",
    completedAt: "2026-10-08T15:22:50Z",
    durationMs: 160000,
    criticalCount: 1,
    highCount: 4,
    mediumCount: 2,
    lowCount: 0,
    gateDecision: "BLOCKED",
    gateReason: "SECURITY GATE VIOLATION: 1 CRITICAL vulnerability (CVE-2024-6387) and 4 HIGH vulnerabilities (threshold: 2).",
    policyId: "policy-prod-strict",
    policyName: "Production Zero-Tolerance Strict Gate",
    triggeredBy: "scheduled-nightly-scanner",
    vulnerabilities: [
      CVE_DATABASE[2], // CVE-2024-6387 CRITICAL
      CVE_DATABASE[3], // CVE-2023-38545 HIGH
      CVE_DATABASE[4], // CVE-2023-48795 HIGH
      CVE_DATABASE[5], // CVE-2024-29025 HIGH
      CVE_DATABASE[6], // CVE-2024-24576 HIGH
      CVE_DATABASE[7], // CVE-2023-34462 MEDIUM
      CVE_DATABASE[8]  // CVE-2023-45853 MEDIUM
    ]
  }
];

export const INITIAL_DEPLOYMENTS: DeploymentRecord[] = [
  {
    id: "dep-01",
    serviceName: "securegate-api-service",
    environment: "production",
    region: "us-central1",
    imageDigest: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    imageTag: "v1.4.2",
    revision: "securegate-api-service-00042",
    status: "READY",
    healthStatus: "HEALTHY",
    deployedAt: "2026-10-10T04:25:00Z",
    deployedBy: "Cloud Build Continuous Delivery",
    trafficPercent: 100,
    url: "https://api-prod-rie3a6jexcselcqboosxns-296457971083.asia-southeast1.run.app",
    gateVerifiedAt: "2026-10-10T04:24:12Z",
    gateDecision: "PASSED",
    previousRevision: "securegate-api-service-00041"
  },
  {
    id: "dep-02",
    serviceName: "auth-gateway-proxy",
    environment: "production",
    region: "us-central1",
    imageDigest: "sha256:91bcfe332145aa89102938475610293847561029384756102938475610293847",
    imageTag: "v2.1.0",
    revision: "auth-gateway-proxy-00018",
    status: "READY",
    healthStatus: "HEALTHY",
    deployedAt: "2026-10-10T02:15:00Z",
    deployedBy: "gvajaykumar125@gmail.com",
    trafficPercent: 100,
    url: "https://auth-prod-rie3a6jexcselcqboosxns-296457971083.asia-southeast1.run.app",
    gateVerifiedAt: "2026-10-10T02:14:20Z",
    gateDecision: "PASSED",
    previousRevision: "auth-gateway-proxy-00017"
  },
  {
    id: "dep-03",
    serviceName: "frontend-spa-edge",
    environment: "production",
    region: "us-central1",
    imageDigest: "sha256:55aa66bb77cc88dd99ee00ff112233445566778899aabbccddeeff0011223344",
    imageTag: "v1.8.0",
    revision: "frontend-spa-edge-00089",
    status: "READY",
    healthStatus: "HEALTHY",
    deployedAt: "2026-10-10T06:20:00Z",
    deployedBy: "Cloud Build Automation",
    trafficPercent: 100,
    url: "https://ais-dev-rie3a6jexcselcqboosxns-296457971083.asia-southeast1.run.app",
    gateVerifiedAt: "2026-10-10T06:19:10Z",
    gateDecision: "PASSED",
    previousRevision: "frontend-spa-edge-00088"
  },
  {
    id: "dep-04",
    serviceName: "legacy-payment-worker",
    environment: "staging",
    region: "us-central1",
    imageDigest: "sha256:4c23a78912ef369a8b123654f9871023cdaefb1982736450192837465abcde99",
    imageTag: "v0.9.8",
    revision: "payment-worker-attempt-00009",
    status: "REJECTED_BY_GATE",
    healthStatus: "UNAVAILABLE",
    deployedAt: "2026-10-09T22:10:00Z",
    deployedBy: "github-actions-bot",
    trafficPercent: 0,
    url: "https://payment-staging-blocked.run.app",
    gateVerifiedAt: "2026-10-09T22:09:40Z",
    gateDecision: "BLOCKED",
    previousRevision: "payment-worker-00008"
  }
];

export const INITIAL_PIPELINES: PipelineRunRecord[] = [
  {
    id: "pipe-101",
    pipelineName: "Google Cloud Build — Release Workflow",
    repo: "securegate-ai/core-services",
    branch: "main",
    commitSha: "a9f831e",
    commitMessage: "feat: security gate verification before Cloud Run rollout",
    imageName: "securegate-api-service",
    imageTag: "v1.4.2",
    imageDigest: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    status: "PASSED",
    currentStage: "Cloud Run Deployment Verified",
    startedAt: "2026-10-10T04:12:00Z",
    completedAt: "2026-10-10T04:26:00Z",
    durationSeconds: 840,
    triggeredBy: "gvajaykumar125@gmail.com",
    stages: [
      { name: "Source Control", status: "COMPLETED", durationSeconds: 15, logs: ["Cloned repository securegate-ai/core-services", "Checked out main @ a9f831e"] },
      { name: "Container Build", status: "COMPLETED", durationSeconds: 210, logs: ["Running docker build -t us-central1-docker.pkg.dev/.../securegate-api-service:v1.4.2", "Layers cached: 7/9", "Successfully built sha256:7f83b165..."] },
      { name: "Trivy Vulnerability Scan", status: "COMPLETED", durationSeconds: 92, logs: ["Invoking trivy image --format json", "Found 0 CRITICAL, 1 HIGH, 2 MEDIUM, 1 LOW", "Report persisted in database"] },
      { name: "Security Gate Evaluation", status: "COMPLETED", durationSeconds: 4, logs: ["Evaluating against policy: Production Zero-Tolerance Strict Gate", "Critical: 0 <= 0 (PASS)", "High: 1 <= 2 (PASS)", "GATE DECISION: PASSED"] },
      { name: "Artifact Registry Promotion", status: "COMPLETED", durationSeconds: 65, logs: ["Promoting verified digest from quarantine to release-images repository", "Release digest pinned: sha256:7f83b165..."] },
      { name: "Cloud Run Deployment", status: "COMPLETED", durationSeconds: 110, logs: ["gcloud run deploy securegate-api-service --image=us-central1-docker.pkg.dev/...@sha256:7f83b165...", "Traffic migrated 100% to new revision"] },
      { name: "Health Verification", status: "COMPLETED", durationSeconds: 20, logs: ["GET /api/health HTTP/2 => 200 OK (latency: 18ms)", "Smoke test passed successfully"] }
    ]
  },
  {
    id: "pipe-102",
    pipelineName: "GitHub Actions — Pull Request Security Check",
    repo: "securegate-ai/payment-engine",
    branch: "feat/payment-processor-update",
    commitSha: "7b4c201",
    commitMessage: "update: bump base image dependencies",
    imageName: "legacy-payment-worker",
    imageTag: "v0.9.8",
    imageDigest: "sha256:4c23a78912ef369a8b123654f9871023cdaefb1982736450192837465abcde99",
    status: "BLOCKED",
    currentStage: "Security Gate Violation",
    startedAt: "2026-10-09T22:00:00Z",
    completedAt: "2026-10-09T22:07:00Z",
    durationSeconds: 420,
    triggeredBy: "github-actions-bot",
    stages: [
      { name: "Source Control", status: "COMPLETED", durationSeconds: 12, logs: ["PR #48 fetched", "Checked out commit 7b4c201"] },
      { name: "Container Build", status: "COMPLETED", durationSeconds: 180, logs: ["Built staging container image into quarantine repository"] },
      { name: "Trivy Vulnerability Scan", status: "COMPLETED", durationSeconds: 150, logs: ["Found 2 CRITICAL (CVE-2023-44487, CVE-2024-21626)"] },
      { name: "Security Gate Evaluation", status: "BLOCKED", durationSeconds: 3, logs: ["SECURITY GATE FAILED: 2 Critical vulnerabilities exceed threshold of 0", "DEPLOYMENT ABORTED. Image rejected from release repository."] },
      { name: "Artifact Registry Promotion", status: "SKIPPED", durationSeconds: 0, logs: ["Blocked by Security Gate"] },
      { name: "Cloud Run Deployment", status: "SKIPPED", durationSeconds: 0, logs: ["Blocked by Security Gate"] },
      { name: "Health Verification", status: "SKIPPED", durationSeconds: 0, logs: ["Blocked by Security Gate"] }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: "audit-01",
    timestamp: "2026-10-10T07:15:22Z",
    actorEmail: "gvajaykumar125@gmail.com",
    actorRole: "ADMIN",
    action: "AUTH_LOGIN",
    resourceType: "USER_SESSION",
    resourceId: "sess-9912",
    outcome: "SUCCESS",
    details: "Authenticated via Google Cloud Hackathon IAM credentials with role ADMIN",
    ipAddress: "35.240.180.92"
  },
  {
    id: "audit-02",
    timestamp: "2026-10-10T06:19:10Z",
    actorEmail: "cloudbuild@securegate-cloud.iam.gserviceaccount.com",
    actorRole: "CI_CD_WORKER",
    action: "GATE_EVALUATION",
    resourceType: "CONTAINER_IMAGE",
    resourceId: "img-05",
    outcome: "SUCCESS",
    details: "Image frontend-spa-edge:v1.8.0 evaluated against policy Production Zero-Tolerance Strict Gate: PASSED (0 Critical, 0 High)",
    ipAddress: "34.87.112.5"
  },
  {
    id: "audit-03",
    timestamp: "2026-10-10T04:25:00Z",
    actorEmail: "cloudrun-deployer@securegate-cloud.iam.gserviceaccount.com",
    actorRole: "CI_CD_WORKER",
    action: "CLOUD_RUN_DEPLOY",
    resourceType: "CLOUD_RUN_SERVICE",
    resourceId: "securegate-api-service",
    outcome: "SUCCESS",
    details: "Deployed immutable digest sha256:7f83b165... to revision securegate-api-service-00042. Pre-flight gate check verified.",
    ipAddress: "34.87.112.5"
  },
  {
    id: "audit-04",
    timestamp: "2026-10-09T22:06:50Z",
    actorEmail: "github-actions-bot",
    actorRole: "CI_CD_WORKER",
    action: "GATE_EVALUATION",
    resourceType: "CONTAINER_IMAGE",
    resourceId: "img-02",
    outcome: "BLOCKED",
    details: "SECURITY GATE VIOLATION: legacy-payment-worker:v0.9.8 blocked due to 2 CRITICAL vulnerabilities (CVE-2023-44487, CVE-2024-21626).",
    ipAddress: "140.82.114.3"
  },
  {
    id: "audit-05",
    timestamp: "2026-10-09T18:30:00Z",
    actorEmail: "gvajaykumar125@gmail.com",
    actorRole: "ADMIN",
    action: "POLICY_UPDATE",
    resourceType: "SECURITY_POLICY",
    resourceId: "policy-prod-strict",
    outcome: "SUCCESS",
    details: "Updated policy Production Zero-Tolerance Strict Gate: Critical threshold pinned to 0, High threshold pinned to 2.",
    ipAddress: "35.240.180.92"
  }
];

export const INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: "notif-01",
    timestamp: "2026-10-10T07:10:00Z",
    title: "Security Gate Enforced: 1 Image Blocked",
    message: "Image legacy-payment-worker:v0.9.8 was blocked from entering release repository due to 2 Critical CVEs.",
    severity: "CRITICAL",
    isRead: false,
    category: "GATE",
    link: "/scans/scan-902"
  },
  {
    id: "notif-02",
    timestamp: "2026-10-10T06:21:00Z",
    title: "Cloud Run Rollout Successful",
    message: "frontend-spa-edge:v1.8.0 verified and running healthy on Google Cloud Run.",
    severity: "INFO",
    isRead: true,
    category: "DEPLOYMENT",
    link: "/deployments"
  },
  {
    id: "notif-03",
    timestamp: "2026-10-10T04:26:00Z",
    title: "Release Image Promoted to Artifact Registry",
    message: "securegate-api-service:v1.4.2 promoted to us-central1-docker.pkg.dev/securegate-cloud/release-images with digest sha256:7f83b1...",
    severity: "INFO",
    isRead: true,
    category: "SCAN",
    link: "/explorer"
  }
];
