import React, { useState, useEffect } from 'react';
import { fetchDeploymentById, analyzeDeploymentWithAI } from '../services/apiClient.js';
import { Deployment, AIAnalysis } from '../types/index.js';
import { Badge } from '../components/common/Badge.js';
import { RiskScoreGauge } from '../components/common/RiskScoreGauge.js';
import { AIAnalysisCard } from '../components/common/AIAnalysisCard.js';
import {
  GitCommit,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Sparkles,
  User,
  GitPullRequest,
  RefreshCw,
} from 'lucide-react';

interface DeploymentDetailsPageProps {
  deploymentId: string;
  onNavigate: (path: string) => void;
}

export const DeploymentDetailsPage: React.FC<DeploymentDetailsPageProps> = ({
  deploymentId,
  onNavigate,
}) => {
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzingAI, setAnalyzingAI] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const dep = await fetchDeploymentById(deploymentId);
      setDeployment(dep);
    } catch (err) {
      console.error('Failed to load deployment details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [deploymentId]);

  const handleRunAIAnalysis = async () => {
    if (!deployment) return;
    setAnalyzingAI(true);
    try {
      const res = await analyzeDeploymentWithAI(deployment.id);
      setAnalysis(res);
    } catch (err) {
      console.error('AI analysis error', err);
    } finally {
      setAnalyzingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-400 font-mono text-xs flex items-center justify-center">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Loading Deployment #{deploymentId} telemetry...
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="p-8 text-center text-zinc-400 font-mono text-xs space-y-4">
        <div>Deployment record #{deploymentId} not found.</div>
        <button
          onClick={() => onNavigate('/deployments')}
          className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-lg text-xs"
        >
          Back to Deployments
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Back Button & Top Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/deployments')}
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Deployments</span>
        </button>

        <button
          onClick={handleRunAIAnalysis}
          disabled={analyzingAI}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-900/30 transition-all"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>{analyzingAI ? 'Analyzing with Gemini...' : 'Analyze Deployment Risk with Gemini'}</span>
        </button>
      </div>

      {/* Deployment Overview Card */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 backdrop-blur space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <GitCommit className="w-6 h-6 text-violet-400" />
                Deployment #{deployment.id.replace('dep-', '')}
              </h1>
              <span className="text-base font-mono font-bold text-violet-300">{deployment.version}</span>
              <Badge value={deployment.status} size="md" />
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Target Environment: <span className="text-zinc-200">{deployment.environment}</span> • Created {deployment.created}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <div>
              <span className="block text-[10px] uppercase text-zinc-500">Duration</span>
              <span className="text-zinc-200 font-bold">{deployment.duration}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-zinc-500">Commit</span>
              <span className="text-zinc-200 font-bold">{deployment.commitHash || '8f3a91b'}</span>
            </div>
          </div>
        </div>

        {/* Status Check Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-2 text-xs">
            {deployment.buildSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
            <span className="text-zinc-200 font-medium">Build Step</span>
            <span className="ml-auto font-mono text-[10px] text-zinc-500">
              {deployment.buildSuccess ? 'Successful' : 'Failed'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-2 text-xs">
            {deployment.deploySuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
            <span className="text-zinc-200 font-medium">Deployment Step</span>
            <span className="ml-auto font-mono text-[10px] text-zinc-500">
              {deployment.deploySuccess ? 'Successful' : 'Failed'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-2 text-xs">
            {deployment.healthCheckPassed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
            <span className="text-zinc-200 font-medium">Health Probes</span>
            <span className="ml-auto font-mono text-[10px] text-zinc-500">
              {deployment.healthCheckPassed ? 'Passed' : 'Failed'}
            </span>
          </div>
        </div>
      </div>

      {/* AI Analysis Panel if run */}
      {analysis && (
        <AIAnalysisCard
          analysis={analysis}
          onNavigateLogs={() => onNavigate('/logs')}
          onNavigateServices={() => onNavigate('/services')}
          onNavigateSettings={() => onNavigate('/settings')}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Score & Changes Card */}
        <RiskScoreGauge
          score={deployment.riskScore}
          riskLevel={deployment.riskLevel}
          changes={deployment.changes}
        />

        {/* Deployment Timeline */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur">
          <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-400" />
            Deployment Step Timeline
          </h3>

          <div className="relative pl-6 space-y-4 border-l-2 border-zinc-800 font-mono text-xs">
            {deployment.timeline.map((event, idx) => (
              <div key={idx} className="relative group">
                <span
                  className={`absolute -left-[31px] top-0 w-3 h-3 rounded-full border-2 bg-zinc-950 ${
                    event.status === 'success'
                      ? 'border-emerald-400 bg-emerald-950'
                      : event.status === 'failed'
                      ? 'border-rose-500 bg-rose-950'
                      : event.status === 'warning'
                      ? 'border-amber-400 bg-amber-950'
                      : 'border-violet-400 bg-violet-950'
                  }`}
                />
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-zinc-200">{event.message}</span>
                  <span className="text-[10px] text-zinc-500">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
