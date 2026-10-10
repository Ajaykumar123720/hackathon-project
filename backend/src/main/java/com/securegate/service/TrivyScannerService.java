package com.securegate.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class TrivyScannerService {

    private static final Logger log = LoggerFactory.getLogger(TrivyScannerService.class);
    private static final Pattern SAFE_IMAGE_PATTERN = Pattern.compile("^[a-zA-Z0-9_./:-]{3,200}$");

    @Value("${securegate.trivy.bin-path:trivy}")
    private String trivyBinPath;

    @Value("${securegate.trivy.timeout-seconds:180}")
    private int timeoutSeconds;

    public record ScanExecutionOutput(
            boolean success,
            String rawJson,
            String errorMessage,
            int exitCode
    ) {}

    public ScanExecutionOutput executeScan(String imageRef) {
        // Validate image reference against shell injection
        if (imageRef == null || !SAFE_IMAGE_PATTERN.matcher(imageRef).matches()) {
            throw new IllegalArgumentException("Invalid container image reference supplied. Must match standard registry URI syntax.");
        }

        List<String> command = List.of(
                trivyBinPath,
                "image",
                "--format", "json",
                "--quiet",
                "--security-checks", "vuln",
                imageRef
        );

        log.info("Executing safe Trivy scan command: {}", command);

        try {
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                return new ScanExecutionOutput(true, output.toString(), null, exitCode);
            } else {
                log.warn("Trivy scan process exited with non-zero code {}: {}", exitCode, output);
                return new ScanExecutionOutput(false, null, output.toString(), exitCode);
            }
        } catch (Exception ex) {
            log.error("Failed to execute Trivy scanner process for image {}", imageRef, ex);
            return new ScanExecutionOutput(false, null, ex.getMessage(), -1);
        }
    }
}
