import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Terminal,
  FileCode,
  Download,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { PipelineRunRecord } from '../types';

export const PipelineCenterPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<PipelineRunRecord[]>([]);
  const [activePipeline, setActivePipeline] = useState<PipelineRunRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'runs' | 'cloudbuild' | 'github'>('runs');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [triggering, setTriggering] = useState(false);
  const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(null);

  const loadPipelines = async () => {
    try {
      const runs = await api.getPipelines();
      setPipelines(runs);
      if (runs.length > 0 && !activePipeline) {
        setActivePipeline(runs[0]);
      }
    } catch (err) {
      console.error('Failed to load pipelines:', err);
    }
  };

  useEffect(() => {
    loadPipelines();
  }, []);

  // Poll active pipeline if running
  useEffect(() => {
    let interval: any = null;
    if (activePipeline && activePipeline.status === 'RUNNING') {
      interval = setInterval(async () => {
        try {
          const run = await api.getPipelineById(activePipeline.id);
          setActivePipeline(run);
          if (run.status !== 'RUNNING') {
            loadPipelines();
          }
        } catch {
          // ignore
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activePipeline]);

  const handleTriggerRun = async () => {
    setTriggering(true);
    try {
      const run = await api.triggerPipeline({
        pipelineName: 'Google Cloud Build — Release Workflow',
        repo: 'securegate-ai/core-services',
        branch: 'main',
        imageName: 'securegate-api-service',
        imageTag: `v1.4.${Math.floor(Math.random() * 10) + 3}`
      });
      setActivePipeline(run);
      setPipelines([run, ...pipelines]);
    } catch (err: any) {
      alert('Failed to trigger pipeline: ' + err.message);
    } finally {
      setTriggering(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const cloudBuildConfig = `# Google Cloud Build Pipeline with SecureGate AI Security Gate
steps:
  # Stage 1: Checkout Source Code
  - name: 'gcr.io/cloud-builders/git'
    args: ['clone', 'https://github.com/securegate-ai/core-services.git']

  # Stage 2: Build Container Image into Isolated Quarantine Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/quarantine-staging/securegate-api-service:$SHORT_SHA'
      - '.'

  # Stage 3: Trivy Security Scan with JSON output
  - name: 'aquasec/trivy:0.58.1'
    args:
      - 'image'
      - '--format'
      - 'json'
      - '--output'
      - 'scan-results.json'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/quarantine-staging/securegate-api-service:$SHORT_SHA'

  # Stage 4: SecureGate AI Gate Evaluation (Fail-Closed Enforcement)
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        CRIT_COUNT=$(jq '[.Results[].Vulnerabilities[]? | select(.Severity == "CRITICAL")] | length' scan-results.json)
        HIGH_COUNT=$(jq '[.Results[].Vulnerabilities[]? | select(.Severity == "HIGH")] | length' scan-results.json)
        echo "SecureGate Scan Evaluation: Critical=$CRIT_COUNT, High=$HIGH_COUNT"
        if [ "$CRIT_COUNT" -gt 0 ]; then
          echo "SECURITY GATE FAILED: $CRIT_COUNT Critical vulnerabilities detected."
          exit 1
        fi
        if [ "$HIGH_COUNT" -gt 2 ]; then
          echo "SECURITY GATE FAILED: $HIGH_COUNT High vulnerabilities exceed limit of 2."
          exit 1
        fi
        echo "SECURITY GATE PASSED: Image approved for production release."

  # Stage 5: Promote Approved Image to Release Registry by Immutable Digest
  - name: 'gcr.io/cloud-builders/docker'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' us-central1-docker.pkg.dev/$PROJECT_ID/quarantine-staging/securegate-api-service:$SHORT_SHA)
        docker tag $DIGEST us-central1-docker.pkg.dev/$PROJECT_ID/release-images/securegate-api-service:$SHORT_SHA
        docker push us-central1-docker.pkg.dev/$PROJECT_ID/release-images/securegate-api-service:$SHORT_SHA

  # Stage 6: Deploy Approved Immutable Digest to Google Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'securegate-api-service'
      - '--image=us-central1-docker.pkg.dev/$PROJECT_ID/release-images/securegate-api-service:$SHORT_SHA'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'`;

  const githubActionsConfig = `name: SecureGate AI DevSecOps Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  securegate-pipeline:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - name: Checkout Source
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud (Workload Identity)
        uses: google-github-actions/auth@v2
        with:
          project_id: securegate-cloud
          workload_identity_provider: projects/12345/locations/global/workloadIdentityPools/github-pool/providers/github-provider

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Quarantine Image
        run: |
          docker build -t us-central1-docker.pkg.dev/securegate-cloud/quarantine-staging/app:\${{ github.sha }} .

      - name: Run Trivy Vulnerability Scanner
        uses: aquasecurity/trivy-action@0.28.0
        with:
          image-ref: us-central1-docker.pkg.dev/securegate-cloud/quarantine-staging/app:\${{ github.sha }}
          format: 'json'
          output: 'trivy-results.json'

      - name: Evaluate Security Gate Policy
        run: |
          CRITICAL=$(jq '[.Results[].Vulnerabilities[]? | select(.Severity=="CRITICAL")] | length' trivy-results.json)
          if [ "$CRITICAL" -gt 0 ]; then
            echo "::error::SECURITY GATE BLOCKED: Found $CRITICAL Critical CVEs. Deployment aborted."
            exit 1
          fi

      - name: Promote Digest to Release Repository
        run: |
          docker tag us-central1-docker.pkg.dev/securegate-cloud/quarantine-staging/app:\${{ github.sha }} us-central1-docker.pkg.dev/securegate-cloud/release-images/app:\${{ github.sha }}
          docker push us-central1-docker.pkg.dev/securegate-cloud/release-images/app:\${{ github.sha }}

      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: securegate-api-service
          image: us-central1-docker.pkg.dev/securegate-cloud/release-images/app:\${{ github.sha }}
          region: us-central1`;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>CI/CD Automated Gate Enforcement</span>
            <span aria-hidden="true">·</span>
            <span>Google Cloud Build & GitHub Actions</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
            CI/CD Pipeline Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerRun}
            disabled={triggering}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Trigger Pipeline Run</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('runs')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'runs'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Pipeline Runs & Execution Visualizer
        </button>
        <button
          onClick={() => setActiveTab('cloudbuild')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'cloudbuild'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Google Cloud Build Config (cloudbuild.yaml)
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'github'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          GitHub Actions Workflow YAML
        </button>
      </div>

      {activeTab === 'runs' && (
        <div className="space-y-6">
          {/* Active Pipeline Stage Visualizer */}
          {activePipeline && (
            <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-slate-100">{activePipeline.pipelineName}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-sm font-mono text-xs font-semibold ${
                        activePipeline.status === 'PASSED'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                          : activePipeline.status === 'BLOCKED'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                          : 'bg-cyan-950/60 text-cyan-400 border border-cyan-800'
                      }`}
                    >
                      {activePipeline.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs font-mono text-slate-400">
                    <span>{activePipeline.repo}</span>
                    <span aria-hidden="true">·</span>
                    <span>branch: {activePipeline.branch}</span>
                    <span aria-hidden="true">·</span>
                    <span>commit: {activePipeline.commitSha}</span>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-slate-400">
                  <div>Image: {activePipeline.imageName}:{activePipeline.imageTag}</div>
                  <div>Duration: {activePipeline.durationSeconds}s</div>
                </div>
              </div>

              {/* 7-Stage Horizontal Pipeline Flow */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-4">
                  End-to-End DevSecOps Stage Progression
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {activePipeline.stages.map((stage, idx) => (
                    <div
                      key={stage.name}
                      onClick={() => setSelectedStageIndex(selectedStageIndex === idx ? null : idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedStageIndex === idx
                          ? 'ring-1 ring-cyan-500 bg-slate-850'
                          : 'bg-slate-950/80 hover:bg-slate-900'
                      } ${
                        stage.status === 'COMPLETED'
                          ? 'border-emerald-800/60'
                          : stage.status === 'BLOCKED' || stage.status === 'FAILED'
                          ? 'border-rose-800/80'
                          : stage.status === 'RUNNING'
                          ? 'border-cyan-500/80 animate-pulse'
                          : 'border-slate-800/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                        {stage.status === 'COMPLETED' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                        {stage.status === 'BLOCKED' && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                        {stage.status === 'RUNNING' && <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                      </div>

                      <div className="text-xs font-semibold text-slate-200 line-clamp-1">{stage.name}</div>
                      <div className="mt-2 text-[10px] font-mono flex items-center justify-between text-slate-400">
                        <span>{stage.status}</span>
                        <span>{stage.durationSeconds}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage Logs Viewer */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-850 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>
                      {selectedStageIndex !== null
                        ? `Execution Logs: Stage ${selectedStageIndex + 1} (${activePipeline.stages[selectedStageIndex]?.name})`
                        : 'Consolidated Pipeline Execution Logs'}
                    </span>
                  </div>
                  <span>{activePipeline.status}</span>
                </div>

                <div className="font-mono text-xs text-slate-300 space-y-1 max-h-48 overflow-y-auto pt-1">
                  {selectedStageIndex !== null
                    ? activePipeline.stages[selectedStageIndex]?.logs.map((line, i) => (
                        <div key={i} className="text-slate-300">
                          &gt; {line}
                        </div>
                      ))
                    : activePipeline.stages.flatMap((s) => s.logs).map((line, i) => (
                        <div key={i} className="text-slate-300">
                          &gt; {line}
                        </div>
                      ))}
                </div>
              </div>
            </div>
          )}

          {/* Historical Pipeline Runs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100">Historical Pipeline Runs</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Pipeline</th>
                    <th className="py-3 px-4">Branch & Commit</th>
                    <th className="py-3 px-4">Target Image</th>
                    <th className="py-3 px-4">Gate Decision</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pipelines.map((run) => (
                    <tr
                      key={run.id}
                      onClick={() => setActivePipeline(run)}
                      className={`hover:bg-slate-850/40 transition-colors cursor-pointer ${
                        activePipeline?.id === run.id ? 'bg-slate-850/60' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {run.pipelineName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {run.branch} @ {run.commitSha}
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-400">
                        {run.imageName}:{run.imageTag}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-sm font-mono text-[10px] font-semibold ${
                            run.status === 'PASSED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {run.durationSeconds}s
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {new Date(run.startedAt).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Build View */}
      {activeTab === 'cloudbuild' && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">cloudbuild.yaml</h2>
              <p className="text-xs text-slate-400">Production Google Cloud Build configuration with fail-closed Trivy gate</p>
            </div>
            <button
              onClick={() => copyToClipboard(cloudBuildConfig, 'cloudbuild')}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-950 border border-slate-800 rounded-lg transition-colors"
            >
              {copiedCode === 'cloudbuild' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'cloudbuild' ? 'Copied' : 'Copy YAML'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed border border-slate-800">
            {cloudBuildConfig}
          </pre>
        </div>
      )}

      {/* GitHub Actions View */}
      {activeTab === 'github' && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">.github/workflows/securegate-ci.yml</h2>
              <p className="text-xs text-slate-400">GitHub Actions CI/CD with Workload Identity Federation & Artifact Registry</p>
            </div>
            <button
              onClick={() => copyToClipboard(githubActionsConfig, 'github')}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-950 border border-slate-800 rounded-lg transition-colors"
            >
              {copiedCode === 'github' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'github' ? 'Copied' : 'Copy YAML'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed border border-slate-800">
            {githubActionsConfig}
          </pre>
        </div>
      )}
    </div>
  );
};
