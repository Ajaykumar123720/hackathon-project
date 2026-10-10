# SecureGate AI — Artifact Registry with Vulnerability Scanning Gates

> **Enterprise DevSecOps platform preventing insecure Docker container images from reaching Google Cloud Run and release repositories using Trivy vulnerability scanning, automated policy enforcement, and Google Artifact Registry.**

---

## 1. System Architecture

```
                                      +---------------------------------------------+
                                      |              Developer / CI/CD              |
                                      +---------------------------------------------+
                                                             |
                                           1. Build & Push Image
                                                             v
                                      +---------------------------------------------+
                                      |   GCP Artifact Registry (Quarantine Staging) |
                                      +---------------------------------------------+
                                                             |
                                                  2. Trigger Scan
                                                             v
                                      +---------------------------------------------+
                                      |    Trivy Vulnerability Scanner Adapter      |
                                      |   - OS & Dependency CVE Correlation (NVD)   |
                                      +---------------------------------------------+
                                                             |
                                                  3. Evaluate Rules
                                                             v
                            +-----------------------------------------------------------------+
                            |                     SECURITY GATE ENFORCER                      |
                            |  Rule: Critical == 0 AND High <= Threshold AND Scan Verified    |
                            +-----------------------------------------------------------------+
                                       /                                           \
                           PASSED     /                                             \   BLOCKED
                                     v                                               v
        +-----------------------------------------+                     +---------------------------+
        |   GCP Artifact Registry (Release Repo)  |                     |  Isolated Quarantine Lock |
        |   Pinned Immutable Digest Promotion     |                     |  Audit Log Alert Emitted  |
        +-----------------------------------------+                     +---------------------------+
                             |
                   4. Automated Rollout
                             v
        +-----------------------------------------+
        |       Google Cloud Run Deployment       |
        |   - Pre-flight Gate Verification Check  |
        |   - Active Revision & Zero-Downtime     |
        +-----------------------------------------+
```

---

## 2. Core Security Invariant

**No image may pass the security gate unless it satisfies the configured security policy.**

- **CRITICAL Vulnerabilities**: Strict limit: 0. Any image with &gt; 0 Critical CVEs is **BLOCKED**.
- **HIGH Vulnerabilities**: Configurable threshold (Default: &le; 2). Exceeding limit is **BLOCKED**.
- **MEDIUM & LOW Vulnerabilities**: Reported, cataloged, and tracked for compliance roadmaps.
- **Incomplete / Failed Scans**: **BLOCKED BY DEFAULT** (Fail-Closed Architecture).
- **Immutable Digest Enforcement**: Every promotion and deployment pins the unique SHA256 digest (`sha256:...`) to prevent mutable tag poisoning attacks.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, TanStack Query.
- **Full-Stack Runtime**: Express.js server on Node.js 22 with Vite middleware (`server.ts`).
- **Backend Architecture**: Spring Boot 3.3.4 (Java 17), Maven, Spring Security, JWT, Spring Data JPA, Flyway, MySQL 8.0.
- **Vulnerability Scanning**: Trivy Security Scanner (`aquasec/trivy:0.58.1`) + Google Container Analysis API integration.
- **Google Cloud Platform**: Artifact Registry, Cloud Run, Cloud Build, Identity and Access Management (IAM).

---

## 4. Quick Start & Local Run

### A. Run Interactive Application (Port 3000)
```bash
# Install dependencies
npm install

# Start full-stack dev server with Express API + Vite Frontend
npm run dev
```
Open `http://localhost:3000` to access the SecureGate AI Console.

### B. Run Full Spring Boot 3 + MySQL Stack with Docker Compose
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Spring Boot API: `http://localhost:8080/api`
- Swagger UI Documentation: `http://localhost:8080/api/swagger-ui.html`
- MySQL Database: `localhost:3306`

---

## 5. Hackathon Live Demo Walkthrough

### Scenario 1: Block a Vulnerable Container Image (Zero-Tolerance Gate)
1. Navigate to the **Vulnerability Scanner** tab.
2. In the "Quick Test Scenarios" panel, click **legacy-payment-worker:v0.9.8 (BLOCK TEST)**.
3. Click **Launch Trivy Scan**.
4. Observe the live multi-stage scanning progress:
   - Manifest extraction &rarr; SBOM analysis &rarr; CVE correlation &rarr; Gate policy evaluation.
5. Result: The image contains 2 Critical CVEs (`CVE-2023-44487` HTTP/2 Rapid Reset, `CVE-2024-21626` runc container breakout).
6. **Decision**: `BLOCKED`. The image is locked in `quarantine-staging` and blocked from release.
7. Attempt to deploy this image in **Cloud Run Deployments**: The deployment is immediately rejected by the pre-flight gate check with a full audit trail!

### Scenario 2: Approve and Deploy a Hardened Container Image
1. Select **securegate-api-service:v1.4.2 (PASS TEST)**.
2. Run scan: Discovers 0 Critical and 1 High vulnerability (within policy threshold of &le; 2).
3. **Decision**: `PASSED`.
4. Image is promoted to `us-central1-docker.pkg.dev/securegate-cloud/release-images`.
5. Deploy to **Google Cloud Run**: Pre-flight gate check passes, and a new revision is created with 100% traffic allocation.

### Scenario 3: Real-Time Policy Threshold Simulation
1. Navigate to **Security Gate Center**.
2. In the **Interactive Security Gate Simulator**, slide the Critical count to 1 &rarr; Watch the decision instantly turn to **BLOCKED**.
3. Slide Critical to 0 and High to 2 &rarr; Watch the decision transition to **PASSED**.
4. Test emergency overrides with audited justification and expiration timers.

---

## 6. Google Cloud Setup & Verification

```bash
# 1. Enable required GCP APIs
gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerscanning.googleapis.com

# 2. Create Release and Quarantine Repositories
gcloud artifacts repositories create release-images \
  --repository-format=docker \
  --location=us-central1 \
  --description="SecureGate AI production release images"

gcloud artifacts repositories create quarantine-staging \
  --repository-format=docker \
  --location=us-central1 \
  --description="SecureGate AI quarantine staging repository"
```

---

## 7. Deliverables Index

- `server.ts`: Full-stack backend serving REST endpoints & Vite SPA.
- `server/routes/api.ts`: Complete REST endpoints (scans, policies, registries, deployments, audit).
- `server/services/scannerService.ts`: Safe Trivy scanner adapter with fail-closed gate policy enforcement.
- `backend/`: Production Spring Boot 3.3.4 project with Java entities, JPA repositories, Flyway migrations, and tests.
- `cloudbuild.yaml`: Google Cloud Build pipeline with automated Trivy scanning.
- `.github/workflows/securegate-ci.yml`: GitHub Actions DevSecOps workflow.
- `docker-compose.yml`: Multi-container stack with MySQL, Spring Boot, and Frontend.
