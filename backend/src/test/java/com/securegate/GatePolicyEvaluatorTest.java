package com.securegate;

import com.securegate.service.GatePolicyEvaluatorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class GatePolicyEvaluatorTest {

    private GatePolicyEvaluatorService evaluatorService;

    @BeforeEach
    void setUp() {
        evaluatorService = new GatePolicyEvaluatorService();
    }

    @Test
    @DisplayName("Scenario 1: Zero critical and acceptable high vulnerabilities -> PASS")
    void testZeroCriticalAcceptableHighPasses() {
        var result = evaluatorService.evaluate(
                0, // critical
                1, // high
                4, // medium
                2, // low
                0, // criticalThreshold
                2, // highThreshold
                true, // isScanCompleted
                false, // requireFix
                false
        );

        assertEquals("PASSED", result.decision());
        assertTrue(result.summaryReason().contains("PASSED SECURITY GATE"));
    }

    @Test
    @DisplayName("Scenario 2: One critical vulnerability -> BLOCK")
    void testOneCriticalBlocks() {
        var result = evaluatorService.evaluate(
                1, // critical
                1, // high
                2, // medium
                1, // low
                0, // criticalThreshold
                2, // highThreshold
                true,
                false,
                false
        );

        assertEquals("BLOCKED", result.decision());
        assertTrue(result.summaryReason().contains("SECURITY GATE BLOCKED"));
    }

    @Test
    @DisplayName("Scenario 3: High vulnerabilities exceeding configured threshold -> BLOCK")
    void testExceedingHighThresholdBlocks() {
        var result = evaluatorService.evaluate(
                0, // critical
                5, // high (limit 2)
                8, // medium
                2, // low
                0, // criticalThreshold
                2, // highThreshold
                true,
                false,
                false
        );

        assertEquals("BLOCKED", result.decision());
        assertTrue(result.summaryReason().contains("High: 5/limit 2"));
    }

    @Test
    @DisplayName("Scenario 4: Failed or incomplete scan -> BLOCK (Fail Closed)")
    void testIncompleteScanFailsClosed() {
        var result = evaluatorService.evaluate(
                0,
                0,
                0,
                0,
                0,
                2,
                false, // isScanCompleted = FALSE
                false,
                false
        );

        assertEquals("BLOCKED", result.decision());
        assertTrue(result.summaryReason().contains("Scan failed or is incomplete"));
    }

    @Test
    @DisplayName("Scenario 5: Unpatched vendor fix available on Critical -> BLOCK")
    void testUnpatchedCriticalFixBlocks() {
        var result = evaluatorService.evaluate(
                0,
                1,
                2,
                1,
                0,
                2,
                true,
                true, // requireFixedVersionRemediation = TRUE
                true  // hasUnpatchedCriticalFix = TRUE
        );

        assertEquals("BLOCKED", result.decision());
    }
}
