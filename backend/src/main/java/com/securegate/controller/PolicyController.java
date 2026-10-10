package com.securegate.controller;

import com.securegate.service.GatePolicyEvaluatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/policies")
@Tag(name = "Policies", description = "Security Gate Policy Management & Simulation")
public class PolicyController {

    private final GatePolicyEvaluatorService evaluatorService;

    public PolicyController(GatePolicyEvaluatorService evaluatorService) {
        this.evaluatorService = evaluatorService;
    }

    @PostMapping("/{id}/evaluate")
    @Operation(summary = "Interactive policy simulation against candidate vulnerability metrics")
    public ResponseEntity<?> evaluatePolicy(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload
    ) {
        int critical = ((Number) payload.getOrDefault("criticalCount", 0)).intValue();
        int high = ((Number) payload.getOrDefault("highCount", 0)).intValue();
        int medium = ((Number) payload.getOrDefault("mediumCount", 0)).intValue();
        int low = ((Number) payload.getOrDefault("lowCount", 0)).intValue();
        boolean incomplete = Boolean.TRUE.equals(payload.get("isScanIncomplete"));

        var result = evaluatorService.evaluate(
                critical,
                high,
                medium,
                low,
                0, // Critical threshold
                2, // High threshold
                !incomplete,
                true,
                false
        );

        return ResponseEntity.ok(Map.of(
                "decision", result.decision(),
                "reason", result.summaryReason(),
                "rulesEvaluated", result.ruleResults()
        ));
    }
}
