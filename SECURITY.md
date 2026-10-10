# Security Policy & Vulnerability Management — SecureGate AI

## 1. Zero-Bypass Security Gate Policy

SecureGate AI enforces the following non-negotiable security invariant across all container image delivery pipelines:

> **No image may pass the security gate unless it satisfies the configured security policy.**

### Policy Invariants:
1. **Critical Vulnerabilities**: Zero tolerance (`critical_count == 0`). Any container image containing 1 or more Critical CVEs is immediately rejected and quarantined.
2. **High Vulnerabilities**: Governed by configurable threshold (default: &le; 2).
3. **Fail-Closed on Unverified Scans**: If Trivy scanning fails, terminates prematurely, times out, or cannot verify image digest integrity, the gate decision defaults strictly to **BLOCKED**.
4. **Immutable Digest Pinning**: All deployments to Google Cloud Run and promotions to Google Artifact Registry use immutable SHA256 digests (`sha256:...`), preventing tag mutability attacks.
5. **Emergency Overrides**: Must be explicitly requested by authorized `ADMIN` role, accompanied by a documented justification reason, assigned a strict expiration timer (e.g. 30 minutes), and permanently recorded in the append-only audit trail.

## 2. Reporting a Vulnerability

If you discover a vulnerability in SecureGate AI or its dependencies:
1. Email: `security@securegate.dev` or `gvajaykumar125@gmail.com`
2. Include reproduction steps, affected container digest, and CVSS vector score.
3. We follow coordinated disclosure with response time within 24 hours.
