import React from 'react';
import { DeploymentChange } from '../../types/index.js';
import { ShieldAlert, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

interface RiskScoreGaugeProps {
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  changes?: DeploymentChange;
  className?: string;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({
  score,
  riskLevel,
  changes,
  className = '',
}) => {
  const isLow = score < 30;
  const isMedium = score >= 30 && score < 70;

  const levelColor = isLow
    ? 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40'
    : isMedium
    ? 'text-amber-400 border-amber-800/60 bg-amber-950/40'
    : 'text-rose-400 border-rose-800/60 bg-rose-950/40';

  const progressBg = isLow ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className={`p-5 rounded-xl border border-zinc-800 bg-zinc-900/90 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
          <Shield className="w-4 h-4 text-zinc-400" />
          <span>Deployment Risk Score</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${levelColor}`}>
          {riskLevel} RISK
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-4xl font-bold font-mono text-zinc-100">{score}</span>
        <span className="text-zinc-500 text-sm font-mono">/ 100</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden mb-4">
        <div className={`h-full ${progressBg} transition-all duration-700 rounded-full`} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
      </div>

      {/* Changes Breakdown */}
      {changes && (
        <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2 text-xs">
          <div className="text-zinc-400 font-medium mb-1 uppercase tracking-wider">Change Analysis</div>
          <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
            <span className="text-zinc-300">Environment Variables</span>
            {changes.envVarsChanged ? (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Changed
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> No changes
              </span>
            )}
          </div>

          <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
            <span className="text-zinc-300">Dependency Updates</span>
            <span className={changes.dependencyChangesCount > 3 ? 'text-amber-400 font-medium' : 'text-zinc-400'}>
              {changes.dependencyChangesCount} modified
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
            <span className="text-zinc-300">Database Schema</span>
            {changes.schemaChanges ? (
              <span className="text-rose-400 font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Migration needed
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> No schema changes
              </span>
            )}
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-zinc-300">API Contract</span>
            {changes.apiContractChanges ? (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Breaking updates
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Unchanged
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
