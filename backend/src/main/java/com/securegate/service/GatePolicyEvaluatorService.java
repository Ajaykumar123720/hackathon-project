package com.securegate.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class GatePolicyEvaluatorService {

    public record PolicyRuleResult(String ruleName, boolean passed, String message) {}

    public record GateEvaluationResult(
            String decision, // "PASSED" or "BLOCKED"
            String summaryReason,
            int criticalCount,
            int highCount,
            int mediumCount,
            int lowCount,
            List<PolicyRuleResult> ruleResults
    ) {}

    public GateEvaluationResult evaluate(
            int criticalCount,
            int highCount,
            int mediumCount,
            int lowCount,
            int criticalThreshold,
            int highThreshold,
            boolean isScanCompleted,
            boolean requireFixedVersionRemediation,
            boolean hasUnpatchedCriticalFix
    ) {
        List<PolicyRuleResult> rules = new ArrayList<>();

        // Rule 1: Fail-closed invariant on scan completeness
        if (!isScanCompleted) {
            rules.add(new PolicyRuleResult("Scan Integrity Check", false, "Scan failed, was interrupted, or is incomplete. Fail-closed enforced."));
            return new GateEvaluationResult(
                    "BLOCKED",
                    "SECURITY GATE BLOCKED: Scan failed or is incomplete. No image may pass without verified vulnerability data.",
                    criticalCount, highCount, mediumCount, lowCount, rules
            );
        } else {
            rules.add(new PolicyRuleResult("Scan Integrity Check", true, "Verified vulnerability scan completed successfully."));
        }

        // Rule 2: Critical Vulnerability Zero-Tolerance Gate
        boolean criticalPass = criticalCount <= criticalThreshold;
        if (!criticalPass) {
            rules.add(new PolicyRuleResult(
                    "Critical Vulnerabilities Threshold",
                    false,
                    String.format("Found %d Critical vulnerabilities (exceeds threshold of %d)", criticalCount, criticalThreshold)
            ));
        } else {
            rules.add(new PolicyRuleResult(
                    "Critical Vulnerabilities Threshold",
                    true,
                    String.format("Critical vulnerabilities count (%d) is within threshold (%d)", criticalCount, criticalThreshold)
            ));
        }

        // Rule 3: High Vulnerability Gate
        boolean highPass = highCount <= highThreshold;
        if (!highPass) {
            rules.add(new PolicyRuleResult(
                    "High Vulnerabilities Threshold",
                    false,
                    String.format("Found %d High vulnerabilities (exceeds threshold of %d)", highCount, highThreshold)
            ));
        } else {
            rules.add(new PolicyRuleResult(
                    "High Vulnerabilities Threshold",
                    true,
                    String.format("High vulnerabilities count (%d) is within threshold (%d)", highCount, highThreshold)
            ));
        }

        // Rule 4: Patch Remediation Requirement
        if (requireFixedVersionRemediation && hasUnpatchedCriticalFix) {
            rules.add(new PolicyRuleResult(
                    "Unpatched Fix Invariant",
                    false,
                    "Image contains known Critical vulnerabilities with available vendor patches that have not been applied."
            ));
        }

        boolean finalPassed = criticalPass && highPass && (!requireFixedVersionRemediation || !hasUnpatchedCriticalFix);

        String summary = finalPassed
                ? String.format("PASSED SECURITY GATE: %d Critical (limit %d), %d High (limit %d). Image approved for Artifact Registry release and Cloud Run deployment.",
                criticalCount, criticalThreshold, highCount, highThreshold)
                : String.format("SECURITY GATE BLOCKED: Image violates security policy (Critical: %d/limit %d, High: %d/limit %d). Quarantined from deployment.",
                criticalCount, criticalThreshold, highCount, highThreshold);

        return new GateEvaluationResult(
                finalPassed ? "PASSED" : "BLOCKED",
                summary,
                criticalCount,
                highCount,
                mediumCount,
                lowCount,
                rules
        );
    }
}
