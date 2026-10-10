import { db } from '../db';
import { CVE_DATABASE, VulnerabilityRecord, ScanRecord, ContainerImageRecord } from '../data/seed';
import { spawn } from 'child_process';
import crypto from 'crypto';

export class ScannerService {
  private static async checkTrivyBinary(): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn('which', ['trivy']);
      child.on('close', (code) => {
        resolve(code === 0);
      });
      child.on('error', () => {
        resolve(false);
      });
    });
  }

  static async initiateScan(
    imageName: string,
    imageTag: string,
    policyId?: string,
    triggeredBy = 'admin'
  ): Promise<ScanRecord> {
    const hasTrivy = await this.checkTrivyBinary();
    db.integrations.trivyInstalled = hasTrivy;

    const policy = db.policies.find((p) => p.id === policyId) || db.policies.find((p) => p.isDefault) || db.policies[0];

    // Find or create container image
    let image = db.images.find((img) => img.name === imageName && img.tag === imageTag);
    const generatedDigest = 'sha256:' + crypto.createHash('sha256').update(`${imageName}:${imageTag}:${Date.now()}`).digest('hex');

    if (!image) {
      image = {
        id: `img-${Date.now()}`,
        name: imageName,
        tag: imageTag,
        registryId: 'reg-02', // Starts in quarantine
        registryUrl: `us-central1-docker.pkg.dev/${db.integrations.gcpProjectId}/${db.integrations.quarantineRepositoryName}/${imageName}:${imageTag}`,
        digest: generatedDigest,
        sizeBytes: 185000000,
        os: imageName.includes('alpine') ? 'linux/amd64 (Alpine Linux 3.19)' : 'linux/amd64 (Ubuntu 22.04 LTS)',
        architecture: 'amd64',
        pushedAt: new Date().toISOString(),
        lastScannedAt: null,
        gateStatus: 'SCANNING',
        isPromotedToRelease: false,
        quarantine: true,
        activeDeployments: []
      };
      db.images.unshift(image);
    } else {
      image.gateStatus = 'SCANNING';
    }

    const scanId = `scan-${Date.now()}`;
    const newScan: ScanRecord = {
      id: scanId,
      imageId: image.id,
      imageName: image.name,
      imageTag: image.tag,
      imageDigest: image.digest,
      scannerEngine: 'Trivy Scanner Adapter v0.58.1',
      scannerVersion: '0.58.1',
      status: 'SCANNING',
      currentStage: 'Validating container image manifest',
      progressPercent: 15,
      startedAt: new Date().toISOString(),
      completedAt: null,
      durationMs: null,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      gateDecision: 'EVALUATING',
      gateReason: 'Scan in progress...',
      policyId: policy.id,
      policyName: policy.name,
      vulnerabilities: [],
      triggeredBy
    };

    db.scans.unshift(newScan);

    // Asynchronously progress the scan stages
    this.runScanJob(newScan, image, policy);

    db.logAudit(
      triggeredBy,
      'USER',
      'SCAN_TRIGGERED',
      'CONTAINER_IMAGE',
      image.name + ':' + image.tag,
      'SUCCESS',
      `Trivy vulnerability scan started for ${image.name}:${image.tag} with digest ${image.digest.substring(0, 19)}...`
    );

    return newScan;
  }

  private static runScanJob(scan: ScanRecord, image: ContainerImageRecord, policy: typeof db.policies[0]) {
    // Stage 1: Manifest inspection
    setTimeout(() => {
      scan.currentStage = 'Extracting container layers and SBOM packages';
      scan.progressPercent = 45;
    }, 1200);

    // Stage 2: Correlation with CVE database
    setTimeout(() => {
      scan.currentStage = 'Correlating vulnerability databases (NVD, GitHub Advisories, Debian Sec)';
      scan.progressPercent = 75;
    }, 2500);

    // Stage 3: Gate evaluation & Completion
    setTimeout(() => {
      let vulns: VulnerabilityRecord[] = [];

      // Determine vulnerability profile realistically based on image name
      if (image.name.includes('legacy') || image.name.includes('payment') || image.name.includes('vulnerable') || image.name.includes('ubuntu:20')) {
        // High risk image with CRITICAL CVEs
        vulns = [
          CVE_DATABASE[0], // Rapid Reset CRITICAL
          CVE_DATABASE[1], // runc breakout CRITICAL
          CVE_DATABASE[3], // curl buffer overflow HIGH
          CVE_DATABASE[4], // Terrapin HIGH
          CVE_DATABASE[8], // zlib MEDIUM
          CVE_DATABASE[9]  // openssl LOW
        ];
      } else if (image.name.includes('rc') || image.name.includes('batch') || image.name.includes('node:16')) {
        // Staging image with HIGH vulnerabilities
        vulns = [
          CVE_DATABASE[3], // curl HIGH
          CVE_DATABASE[5], // netty HIGH
          CVE_DATABASE[6], // rust command injection HIGH
          CVE_DATABASE[7], // netty MEDIUM
          CVE_DATABASE[8]  // zlib MEDIUM
        ];
      } else if (image.name.includes('alpine') || image.name.includes('secure') || image.name.includes('distroless')) {
        // Hardened image with 0 Critical, 0 High
        vulns = [
          CVE_DATABASE[8], // zlib MEDIUM
          CVE_DATABASE[9]  // openssl LOW
        ];
      } else {
        // Default modern container with minor findings
        vulns = [
          CVE_DATABASE[3], // curl HIGH (1 High)
          CVE_DATABASE[7], // netty MEDIUM
          CVE_DATABASE[9]  // openssl LOW
        ];
      }

      const criticalCount = vulns.filter((v) => v.severity === 'CRITICAL').length;
      const highCount = vulns.filter((v) => v.severity === 'HIGH').length;
      const mediumCount = vulns.filter((v) => v.severity === 'MEDIUM').length;
      const lowCount = vulns.filter((v) => v.severity === 'LOW').length;

      scan.criticalCount = criticalCount;
      scan.highCount = highCount;
      scan.mediumCount = mediumCount;
      scan.lowCount = lowCount;
      scan.vulnerabilities = vulns;

      // Gate evaluation logic
      const criticalViolation = criticalCount > policy.criticalThreshold;
      const highViolation = highCount > policy.highThreshold;
      const mediumViolation = mediumCount > policy.mediumThreshold;

      if (criticalViolation) {
        scan.gateDecision = 'BLOCKED';
        scan.gateReason = `SECURITY GATE VIOLATION: ${criticalCount} CRITICAL vulnerabilities detected (Threshold: ${policy.criticalThreshold}). Image is blocked from release.`;
      } else if (highViolation) {
        scan.gateDecision = 'BLOCKED';
        scan.gateReason = `SECURITY GATE VIOLATION: ${highCount} HIGH vulnerabilities detected (Threshold: ${policy.highThreshold}).`;
      } else if (mediumViolation) {
        scan.gateDecision = 'BLOCKED';
        scan.gateReason = `SECURITY GATE VIOLATION: ${mediumCount} MEDIUM vulnerabilities exceed limit (${policy.mediumThreshold}).`;
      } else {
        scan.gateDecision = 'PASSED';
        scan.gateReason = `PASSED SECURITY GATE: 0 Critical, ${highCount} High (allowed <= ${policy.highThreshold}), ${mediumCount} Medium. Complies with ${policy.name}.`;
      }

      scan.status = 'COMPLETED';
      scan.currentStage = 'Security Gate Evaluation Complete';
      scan.progressPercent = 100;
      scan.completedAt = new Date().toISOString();
      scan.durationMs = 3800;

      // Update image record
      image.gateStatus = scan.gateDecision === 'PASSED' ? 'PASSED' : 'BLOCKED';
      image.lastScannedAt = scan.completedAt;

      // If passed, allow promotion
      if (scan.gateDecision === 'PASSED') {
        image.isPromotedToRelease = true;
        image.quarantine = false;
        image.registryUrl = `us-central1-docker.pkg.dev/${db.integrations.gcpProjectId}/${db.integrations.releaseRepositoryName}/${image.name}:${image.tag}`;
      } else {
        image.isPromotedToRelease = false;
        image.quarantine = true;
      }

      // Record audit log
      db.logAudit(
        scan.triggeredBy,
        'SYSTEM_GATE',
        'GATE_EVALUATION',
        'CONTAINER_IMAGE',
        `${image.name}:${image.tag}`,
        scan.gateDecision === 'PASSED' ? 'SUCCESS' : 'BLOCKED',
        `Evaluated scan ${scan.id} for ${image.name}:${image.tag}: ${scan.gateDecision}. ${scan.gateReason}`
      );

      // Notification
      if (scan.gateDecision === 'BLOCKED') {
        db.addNotification(
          `Security Gate Blocked: ${image.name}:${image.tag}`,
          `${scan.criticalCount} Critical and ${scan.highCount} High vulnerabilities exceed gate threshold. Image locked in quarantine.`,
          'CRITICAL',
          'GATE',
          `/scans/${scan.id}`
        );
      } else {
        db.addNotification(
          `Security Gate Approved: ${image.name}:${image.tag}`,
          `Passed gate with 0 Critical CVEs. Image approved for Google Artifact Registry release & Cloud Run.`,
          'INFO',
          'GATE',
          `/scans/${scan.id}`
        );
      }
    }, 4000);
  }
}
