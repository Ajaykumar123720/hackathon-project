-- SecureGate AI Initial Database Schema for MySQL 8.0+
-- Migration V1: Core Security Gate, Registry, Scan, Policy, CI/CD, and Audit Entities

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'DEVELOPER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS registries (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL UNIQUE,
    url VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'GOOGLE_ARTIFACT_REGISTRY',
    region VARCHAR(64) NOT NULL,
    project_id VARCHAR(64) NOT NULL,
    is_default_release BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_registries_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS container_images (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    tag VARCHAR(64) NOT NULL,
    registry_id VARCHAR(64) NOT NULL,
    registry_url VARCHAR(255) NOT NULL,
    digest VARCHAR(128) NOT NULL UNIQUE,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    os VARCHAR(64) NOT NULL,
    architecture VARCHAR(32) NOT NULL,
    gate_status VARCHAR(32) NOT NULL DEFAULT 'UNSCANNED',
    is_promoted_to_release BOOLEAN NOT NULL DEFAULT FALSE,
    quarantine BOOLEAN NOT NULL DEFAULT TRUE,
    pushed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_scanned_at TIMESTAMP NULL,
    FOREIGN KEY (registry_id) REFERENCES registries(id) ON DELETE CASCADE,
    INDEX idx_images_name_tag (name, tag),
    INDEX idx_images_digest (digest),
    INDEX idx_images_gate_status (gate_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS security_policies (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    version VARCHAR(32) NOT NULL,
    description TEXT,
    critical_threshold INT NOT NULL DEFAULT 0,
    high_threshold INT NOT NULL DEFAULT 2,
    medium_threshold INT NOT NULL DEFAULT 25,
    block_on_incomplete_scan BOOLEAN NOT NULL DEFAULT TRUE,
    require_fixed_version_remediation BOOLEAN NOT NULL DEFAULT TRUE,
    allow_emergency_override BOOLEAN NOT NULL DEFAULT FALSE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(64) NOT NULL,
    INDEX idx_policies_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vulnerabilities (
    id VARCHAR(64) PRIMARY KEY,
    cve_id VARCHAR(64) NOT NULL UNIQUE,
    pkg_name VARCHAR(128) NOT NULL,
    installed_version VARCHAR(64) NOT NULL,
    fixed_version VARCHAR(64) NULL,
    severity VARCHAR(16) NOT NULL,
    cvss_score DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    cvss_vector VARCHAR(128) NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    primary_url VARCHAR(255) NOT NULL,
    pkg_type VARCHAR(32) NOT NULL,
    published_date DATE NOT NULL,
    INDEX idx_vulns_cve (cve_id),
    INDEX idx_vulns_severity (severity),
    INDEX idx_vulns_pkg (pkg_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS scans (
    id VARCHAR(64) PRIMARY KEY,
    image_id VARCHAR(64) NOT NULL,
    image_name VARCHAR(128) NOT NULL,
    image_tag VARCHAR(64) NOT NULL,
    image_digest VARCHAR(128) NOT NULL,
    scanner_engine VARCHAR(64) NOT NULL,
    scanner_version VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    current_stage VARCHAR(128) NOT NULL,
    progress_percent INT NOT NULL DEFAULT 0,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    duration_ms BIGINT NULL,
    critical_count INT NOT NULL DEFAULT 0,
    high_count INT NOT NULL DEFAULT 0,
    medium_count INT NOT NULL DEFAULT 0,
    low_count INT NOT NULL DEFAULT 0,
    gate_decision VARCHAR(32) NOT NULL DEFAULT 'EVALUATING',
    gate_reason TEXT NOT NULL,
    policy_id VARCHAR(64) NOT NULL,
    triggered_by VARCHAR(64) NOT NULL,
    FOREIGN KEY (image_id) REFERENCES container_images(id) ON DELETE CASCADE,
    FOREIGN KEY (policy_id) REFERENCES security_policies(id),
    INDEX idx_scans_digest (image_digest),
    INDEX idx_scans_decision (gate_decision),
    INDEX idx_scans_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS scan_vulnerabilities (
    id VARCHAR(64) PRIMARY KEY,
    scan_id VARCHAR(64) NOT NULL,
    vulnerability_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE,
    FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    UNIQUE KEY uq_scan_vuln (scan_id, vulnerability_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deployments (
    id VARCHAR(64) PRIMARY KEY,
    service_name VARCHAR(128) NOT NULL,
    environment VARCHAR(32) NOT NULL DEFAULT 'production',
    region VARCHAR(64) NOT NULL DEFAULT 'us-central1',
    image_digest VARCHAR(128) NOT NULL,
    image_tag VARCHAR(64) NOT NULL,
    revision VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DEPLOYING',
    health_status VARCHAR(32) NOT NULL DEFAULT 'HEALTHY',
    traffic_percent INT NOT NULL DEFAULT 100,
    url VARCHAR(255) NOT NULL,
    gate_verified_at TIMESTAMP NOT NULL,
    gate_decision VARCHAR(32) NOT NULL,
    deployed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deployed_by VARCHAR(64) NOT NULL,
    previous_revision VARCHAR(128) NULL,
    INDEX idx_deployments_service (service_name),
    INDEX idx_deployments_digest (image_digest),
    INDEX idx_deployments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pipelines (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    repository VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pipeline_runs (
    id VARCHAR(64) PRIMARY KEY,
    pipeline_name VARCHAR(128) NOT NULL,
    repo VARCHAR(128) NOT NULL,
    branch VARCHAR(64) NOT NULL,
    commit_sha VARCHAR(64) NOT NULL,
    commit_message TEXT,
    image_name VARCHAR(128) NOT NULL,
    image_tag VARCHAR(64) NOT NULL,
    image_digest VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'RUNNING',
    current_stage VARCHAR(64) NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 0,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    triggered_by VARCHAR(64) NOT NULL,
    INDEX idx_pipeline_runs_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_email VARCHAR(128) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128) NOT NULL,
    outcome VARCHAR(32) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_timestamp (timestamp),
    INDEX idx_audit_actor (actor_email),
    INDEX idx_audit_outcome (outcome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(16) NOT NULL DEFAULT 'INFO',
    category VARCHAR(32) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_unread (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
