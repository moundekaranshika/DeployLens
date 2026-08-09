import React, { useState } from 'react';
import { HealthBreakdown } from '../../types/index.js';
import { Info, AlertTriangle, ShieldCheck, Zap, Activity } from 'lucide-react';

interface HealthScoreCardProps {
  healthScore: HealthBreakdown;
  uptime: number;
  totalDeployments: number;
  activeIncidentsCount: number;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  healthScore,
  uptime,
  totalDeployments,
  activeIncidentsCount,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const score = healthScore.score;
  const isHealthy = score >= 85;
  const isDegraded = score >= 50 && score < 85;

  const strokeColor = isHealthy ? '#10b981' : isDegraded ? '#f59e0b' : '#f43f5e';
  const textColor = isHealthy ? 'text-emerald-400' : isDegraded ? 'text-amber-400' : 'text-rose-400';
  const bgGlow = isHealthy ? 'bg-emerald-500/10 border-emerald-500/20' : isDegraded ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Health Score Main Card */}
      <div className={`p-5 rounded-xl border bg-zinc-900/90 backdrop-blur transition-all ${bgGlow} relative group`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <Activity className="w-4 h-4 text-zinc-400" />
            Health Score
          </div>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1 transition-colors"
            title="View health score mathematical breakdown"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Breakdown</span>
          </button>
        </div>

        <div className="flex items-baseline justify-between mt-2">
          <div>
            <div className={`text-4xl font-bold font-mono tracking-tight ${textColor}`}>
              {score}<span className="text-zinc-500 text-lg font-normal">/100</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              {isHealthy ? '● Systems fully operational' : isDegraded ? '● Performance degraded' : '● Critical service disruption'}
            </p>
          </div>

          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="#27272a" strokeWidth="4" fill="transparent" />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke={strokeColor}
                strokeWidth="4"
                strokeDasharray={138}
                strokeDashoffset={138 - (138 * score) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className={`absolute text-xs font-bold font-mono ${textColor}`}>{score}</span>
          </div>
        </div>

        {/* Mathematical Breakdown Overlay */}
        {showBreakdown && (
          <div className="mt-4 pt-3 border-t border-zinc-800 text-xs space-y-1.5 font-mono text-zinc-400 animate-in fade-in duration-200">
            <div className="flex justify-between text-zinc-300 font-sans font-semibold">
              <span>Factor Penalties</span>
              <span>Points</span>
            </div>
            <div className="flex justify-between">
              <span>Base Max Score</span>
              <span className="text-emerald-400">+100</span>
            </div>
            <div className="flex justify-between">
              <span>Service Health Impact</span>
              <span className={healthScore.servicePenalty > 0 ? 'text-rose-400' : 'text-zinc-500'}>
                -{healthScore.servicePenalty}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Active Incident Impact</span>
              <span className={healthScore.incidentPenalty > 0 ? 'text-rose-400' : 'text-zinc-500'}>
                -{healthScore.incidentPenalty}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Error Rate Penalty</span>
              <span className={healthScore.errorPenalty > 0 ? 'text-rose-400' : 'text-zinc-500'}>
                -{healthScore.errorPenalty}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Latency Penalty</span>
              <span className={healthScore.latencyPenalty > 0 ? 'text-rose-400' : 'text-zinc-500'}>
                -{healthScore.latencyPenalty}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Uptime Card */}
      <div className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/80 backdrop-blur flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
          <span>Uptime</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-3">
          <div className="text-3xl font-bold font-mono text-zinc-100 tracking-tight">{uptime}%</div>
          <p className="text-xs text-zinc-400 mt-1 font-medium">Last 30 rolling days</p>
        </div>
      </div>

      {/* Total Deployments Card */}
      <div className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/80 backdrop-blur flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
          <span>Deployments</span>
          <Zap className="w-4 h-4 text-blue-400" />
        </div>
        <div className="mt-3">
          <div className="text-3xl font-bold font-mono text-zinc-100 tracking-tight">{totalDeployments}</div>
          <p className="text-xs text-zinc-400 mt-1 font-medium">Zerops Cloud Run runtime</p>
        </div>
      </div>

      {/* Active Incidents Card */}
      <div className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/80 backdrop-blur flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
          <span>Active Incidents</span>
          <AlertTriangle className={`w-4 h-4 ${activeIncidentsCount > 0 ? 'text-rose-400 animate-bounce' : 'text-zinc-500'}`} />
        </div>
        <div className="mt-3">
          <div className={`text-3xl font-bold font-mono tracking-tight ${activeIncidentsCount > 0 ? 'text-rose-400' : 'text-zinc-100'}`}>
            {activeIncidentsCount}
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            {activeIncidentsCount > 0 ? 'Requires immediate action' : 'All clear'}
          </p>
        </div>
      </div>
    </div>
  );
};
