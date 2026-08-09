import React, { useState } from 'react';
import { simulateFailure, resetDemoState } from '../../services/apiClient.js';
import { AppDashboardData } from '../../types/index.js';
import { Play, Database, Clock, AlertTriangle, CheckCircle2, RotateCcw, X, Sparkles } from 'lucide-react';

interface DemoControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateDashboard: (data: AppDashboardData) => void;
}

export const DemoControlsModal: React.FC<DemoControlsModalProps> = ({
  isOpen,
  onClose,
  onUpdateDashboard,
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulate = async (type: 'database' | 'latency' | 'error_spike' | 'healthy') => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await simulateFailure(type);
      onUpdateDashboard(res.dashboard);
      setFeedback(`Simulated scenario: ${type.toUpperCase()} applied!`);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await resetDemoState();
      onUpdateDashboard(res.dashboard);
      setFeedback('Demo state reset to initial baseline.');
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg bg-zinc-800/50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/60">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Zerops Challenge Demo Controls</h2>
            <p className="text-xs text-zinc-400 font-mono">Inject real-time failure scenarios to test Gemini AI Copilot</p>
          </div>
        </div>

        {feedback && (
          <div className="my-4 p-3 text-xs font-mono rounded-lg bg-violet-950/60 border border-violet-800/60 text-violet-300">
            {feedback}
          </div>
        )}

        <div className="space-y-3 mt-5">
          {/* Simulate Database Failure - Primary Scenario */}
          <button
            disabled={loading}
            onClick={() => handleSimulate('database')}
            className="w-full p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/50 text-rose-200 text-left transition-all flex items-start gap-3 group"
          >
            <div className="p-2 rounded-lg bg-rose-900/60 text-rose-300 mt-0.5">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <span>Simulate Database Failure</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-rose-900 text-rose-200 rounded uppercase font-mono">Primary Demo</span>
              </div>
              <p className="text-xs text-rose-200/70 mt-1">
                Creates failed deployment #22, appends ECONNREFUSED PostgreSQL logs, drops Health Score to 31/100, and triggers AI analysis.
              </p>
            </div>
          </button>

          {/* Simulate High Latency */}
          <button
            disabled={loading}
            onClick={() => handleSimulate('latency')}
            className="w-full p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 hover:bg-amber-900/40 text-amber-200 text-left transition-all flex items-start gap-3"
          >
            <div className="p-2 rounded-lg bg-amber-900/50 text-amber-300 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-300">Simulate High Latency Spike</div>
              <p className="text-xs text-amber-200/70 mt-1">
                Surges response time to 680ms, marks API as Degraded, and logs slow query execution warnings.
              </p>
            </div>
          </button>

          {/* Simulate API Error Spike */}
          <button
            disabled={loading}
            onClick={() => handleSimulate('error_spike')}
            className="w-full p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 hover:bg-amber-900/40 text-amber-200 text-left transition-all flex items-start gap-3"
          >
            <div className="p-2 rounded-lg bg-amber-900/50 text-amber-300 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-300">Simulate API Error Spike</div>
              <p className="text-xs text-amber-200/70 mt-1">
                Spikes HTTP 500 internal server error rate to 18.4% and logs uncaught exception traces.
              </p>
            </div>
          </button>

          {/* Deploy Healthy Version */}
          <button
            disabled={loading}
            onClick={() => handleSimulate('healthy')}
            className="w-full p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 hover:bg-emerald-900/40 text-emerald-200 text-left transition-all flex items-start gap-3"
          >
            <div className="p-2 rounded-lg bg-emerald-900/50 text-emerald-300 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-300">Deploy Healthy Version</div>
              <p className="text-xs text-emerald-200/70 mt-1">
                Deploys new version, resolves active incidents, restores health checks to 100/100 green status.
              </p>
            </div>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <button
            disabled={loading}
            onClick={handleReset}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Baseline</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
          >
            Close Controls
          </button>
        </div>
      </div>
    </div>
  );
};
