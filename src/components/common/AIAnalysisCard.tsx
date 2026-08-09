import React from 'react';
import { AIAnalysis } from '../../types/index.js';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import { Badge } from './Badge.js';

interface AIAnalysisCardProps {
  analysis: AIAnalysis;
  onNavigateLogs?: () => void;
  onNavigateServices?: () => void;
  onNavigateSettings?: () => void;
  className?: string;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  analysis,
  onNavigateLogs,
  onNavigateServices,
  onNavigateSettings,
  className = '',
}) => {
  return (
    <div className={`p-6 rounded-xl border border-violet-900/40 bg-zinc-900/95 shadow-xl backdrop-blur relative overflow-hidden ${className}`}>
      {/* Decorative Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-violet-950/80 border border-violet-800/60 text-violet-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              AI ROOT CAUSE ANALYSIS
            </h3>
            <p className="text-xs text-zinc-400 font-mono">Gemini 3.6 Flash Reliability Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-zinc-400 uppercase font-medium">Confidence</div>
            <div className="text-base font-bold font-mono text-emerald-400">{analysis.confidence}%</div>
          </div>
          <Badge value={analysis.severity} size="md" />
        </div>
      </div>

      {/* Summary / Root Cause Highlight */}
      <div className="mb-6 p-4 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-200">
        <div className="text-xs uppercase font-bold text-rose-400 tracking-wider mb-1 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Root Cause
        </div>
        <p className="text-sm font-semibold text-rose-100">{analysis.rootCause}</p>
        {analysis.summary && analysis.summary !== analysis.rootCause && (
          <p className="text-xs text-zinc-300 mt-2">{analysis.summary}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Evidence */}
        <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800">
          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Observed Evidence
          </div>
          <ul className="space-y-2 text-xs text-zinc-300 font-mono">
            {analysis.evidence.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-violet-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Likely Causes */}
        <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800">
          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Probable Causes
          </div>
          <ol className="space-y-2 text-xs text-zinc-300">
            {analysis.likelyCauses.map((cause, idx) => (
              <li key={idx} className="flex items-start gap-2 font-mono">
                <span className="text-amber-400 font-bold font-mono">{idx + 1}.</span>
                <span>{cause.replace(/^\d+\.\s*/, '')}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Recommended Fix */}
      <div className="mb-6 p-4 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-emerald-200">
        <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider mb-2 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-emerald-400" />
          Recommended Fix
        </div>
        <ul className="space-y-1.5 text-xs text-zinc-200 font-medium">
          {analysis.recommendedFixes.map((fix, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>{fix}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Steps Actions */}
      <div>
        <div className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-2">Next Steps</div>
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateSettings && (
            <button
              onClick={onNavigateSettings}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-700"
            >
              <span>Verify Environment Variables</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onNavigateServices && (
            <button
              onClick={onNavigateServices}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-700"
            >
              <span>Check Database Health</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onNavigateLogs && (
            <button
              onClick={onNavigateLogs}
              className="px-3 py-1.5 rounded-lg bg-violet-900/60 hover:bg-violet-800/80 text-violet-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-violet-700/60"
            >
              <span>View Related Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
