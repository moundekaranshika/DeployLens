import React, { useState, useEffect } from 'react';
import { fetchIncidentById, analyzeIncidentWithAI } from '../services/apiClient.js';
import { Incident, AIAnalysis } from '../types/index.js';
import { Badge } from '../components/common/Badge.js';
import { AIAnalysisCard } from '../components/common/AIAnalysisCard.js';
import {
  AlertOctagon,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Cpu,
} from 'lucide-react';

interface IncidentDetailsPageProps {
  incidentId: string;
  onNavigate: (path: string) => void;
}

export const IncidentDetailsPage: React.FC<IncidentDetailsPageProps> = ({
  incidentId,
  onNavigate,
}) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [diagnosis, setDiagnosis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const inc = await fetchIncidentById(incidentId);
      setIncident(inc);
      if (inc.diagnosis) {
        setDiagnosis(inc.diagnosis);
      }
    } catch (err) {
      console.error('Failed to load incident details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [incidentId]);

  const handleReanalyzeAI = async () => {
    if (!incident) return;
    setAnalyzing(true);
    try {
      const res = await analyzeIncidentWithAI(incident.id);
      setDiagnosis(res);
    } catch (err) {
      console.error('AI re-analysis failed', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-400 font-mono text-xs flex items-center justify-center">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Loading Incident #{incidentId} telemetry...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-8 text-center text-zinc-400 font-mono text-xs space-y-4">
        <div>Incident record #{incidentId} not found.</div>
        <button
          onClick={() => onNavigate('/incidents')}
          className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-lg text-xs"
        >
          Back to Incidents
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Back Button & Top Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/incidents')}
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Incidents</span>
        </button>

        <button
          onClick={handleReanalyzeAI}
          disabled={analyzing}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-900/30 transition-all"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>{analyzing ? 'Re-analyzing with Gemini...' : 'Re-run Gemini AI Diagnosis'}</span>
        </button>
      </div>

      {/* Incident Header Card */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 backdrop-blur space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <AlertOctagon className="w-6 h-6 text-rose-400" />
                {incident.title}
              </h1>
              <Badge value={incident.severity} size="md" />
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Detected {incident.detectedAt} • Affected Services: {incident.affectedServices.join(', ')}
            </p>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-[10px] uppercase text-zinc-500 block">AI Confidence</span>
            <span className="text-emerald-400 font-bold text-base">{incident.aiConfidence}%</span>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
          {incident.summary}
        </p>
      </div>

      {/* AI Diagnosis Panel */}
      {diagnosis && (
        <AIAnalysisCard
          analysis={diagnosis}
          onNavigateLogs={() => onNavigate('/logs')}
          onNavigateServices={() => onNavigate('/services')}
          onNavigateSettings={() => onNavigate('/settings')}
        />
      )}

      {/* Incident Event Timeline & Actionable Remediation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Timeline */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur">
          <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center gap-2 font-mono">
            <Clock className="w-4 h-4 text-violet-400" />
            Incident Event Progression Timeline
          </h3>

          <div className="relative pl-6 space-y-4 border-l-2 border-zinc-800 font-mono text-xs">
            {incident.timeline.map((item, idx) => (
              <div key={idx} className="relative group">
                <span
                  className={`absolute -left-[31px] top-0 w-3 h-3 rounded-full border-2 bg-zinc-950 ${
                    item.type === 'alert'
                      ? 'border-rose-500 bg-rose-950'
                      : item.type === 'ai'
                      ? 'border-violet-400 bg-violet-950'
                      : item.type === 'resolution'
                      ? 'border-emerald-400 bg-emerald-950'
                      : 'border-zinc-500 bg-zinc-800'
                  }`}
                />
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-zinc-200">{item.title}</span>
                  <span className="text-[10px] text-zinc-500">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Remediation Steps */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur">
          <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Recommended Remediation Playbook
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {(incident.remediationSteps || [
              'Verify DATABASE_URL in environment configuration',
              'Check PostgreSQL container status on Zerops dashboard',
              'Restart API service container or roll back deployment',
            ]).map((step, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-zinc-200">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
