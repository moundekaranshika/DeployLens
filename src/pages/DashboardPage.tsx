import React from 'react';
import { AppDashboardData, ServiceHealth, Deployment, Incident } from '../types/index.js';
import { HealthScoreCard } from '../components/common/HealthScoreCard.js';
import { PerformanceChart } from '../components/common/PerformanceChart.js';
import { Badge } from '../components/common/Badge.js';
import { AIAnalysisCard } from '../components/common/AIAnalysisCard.js';
import {
  Server,
  GitCommit,
  AlertOctagon,
  ArrowRight,
  ExternalLink,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface DashboardPageProps {
  data: AppDashboardData | null;
  loading: boolean;
  onNavigate: (path: string) => void;
  onOpenDemoControls: () => void;
  onRefresh: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  data,
  loading,
  onNavigate,
  onOpenDemoControls,
  onRefresh,
}) => {
  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh] text-zinc-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-violet-400" />
        Loading DeployLens Telemetry Engine...
      </div>
    );
  }

  const criticalIncident = data.recentIncidents.find((i) => i.status !== 'resolved');

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Simulated Failure Warning */}
      {data.currentFailureSimulated && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-900 text-rose-300">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-100 flex items-center gap-2">
                Simulated Deployment Failure Active (#22 / v2.4.2-fail)
              </h3>
              <p className="text-xs text-rose-200/80 mt-0.5">
                PostgreSQL is unreachable from API service. Health score dropped to {data.healthScore.score}/100.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => onNavigate('/logs')}
              className="px-3 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze Logs with Gemini</span>
            </button>
            <button
              onClick={onOpenDemoControls}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-rose-800 hover:bg-zinc-800 text-zinc-200 text-xs transition-colors"
            >
              Demo Controls
            </button>
          </div>
        </div>
      )}

      {/* Health Overview Cards */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">System Overview</h2>
          <button
            onClick={onRefresh}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Refresh Metrics
          </button>
        </div>

        <HealthScoreCard
          healthScore={data.healthScore}
          uptime={data.uptime}
          totalDeployments={data.totalDeployments}
          activeIncidentsCount={data.activeIncidentsCount}
        />
      </section>

      {/* Critical Active AI Root Cause Callout Card */}
      {criticalIncident && criticalIncident.diagnosis && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Active Incident AI Diagnosis
            </h2>
            <button
              onClick={() => onNavigate(`/incidents/${criticalIncident.id}`)}
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              <span>Full Diagnosis & Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <AIAnalysisCard
            analysis={criticalIncident.diagnosis}
            onNavigateLogs={() => onNavigate('/logs')}
            onNavigateServices={() => onNavigate('/services')}
            onNavigateSettings={() => onNavigate('/settings')}
          />
        </section>
      )}

      {/* Services Health Grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-zinc-500" />
            Service Health Status
          </h2>
          <button
            onClick={() => onNavigate('/services')}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
          >
            <span>View All Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.services.map((srv: ServiceHealth) => (
            <div
              key={srv.id}
              onClick={() => onNavigate(`/services/${srv.id}`)}
              className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-zinc-100 group-hover:text-violet-300 transition-colors">
                  {srv.name}
                </span>
                <Badge value={srv.status} size="sm" />
              </div>

              <div className="space-y-1.5 text-xs font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span>Latency</span>
                  <span className={srv.latency > 300 ? 'text-rose-400 font-bold' : 'text-zinc-200'}>
                    {srv.latency}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate</span>
                  <span className={srv.errorRate > 1 ? 'text-rose-400 font-bold' : 'text-zinc-200'}>
                    {srv.errorRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="text-zinc-200">{srv.uptime}%</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Version {srv.lastDeploymentVersion}</span>
                <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Performance Chart */}
      <section>
        <PerformanceChart data={data.metrics} />
      </section>

      {/* Bottom Grid: Recent Deployments & Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deployments Table */}
        <section className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-violet-400" />
              Recent Deployment Activity
            </h3>
            <button
              onClick={() => onNavigate('/deployments')}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
            >
              <span>History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px]">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Version</th>
                  <th className="pb-2">Env</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {data.recentDeployments.slice(0, 5).map((dep: Deployment) => (
                  <tr
                    key={dep.id}
                    onClick={() => onNavigate(`/deployments/${dep.id}`)}
                    className="hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 font-bold text-zinc-300">#{dep.id.replace('dep-', '')}</td>
                    <td className="py-2.5 text-zinc-200 font-semibold">{dep.version}</td>
                    <td className="py-2.5 text-zinc-400">{dep.environment}</td>
                    <td className="py-2.5">
                      <Badge value={dep.status} size="sm" />
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`font-bold ${
                          dep.riskScore > 70
                            ? 'text-rose-400'
                            : dep.riskScore > 30
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {dep.riskScore}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Incidents List */}
        <section className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              Incidents Log
            </h3>
            <button
              onClick={() => onNavigate('/incidents')}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
            >
              <span>All Incidents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {data.recentIncidents.map((inc: Incident) => (
              <div
                key={inc.id}
                onClick={() => onNavigate(`/incidents/${inc.id}`)}
                className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 transition-all cursor-pointer flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-100">{inc.title}</span>
                    <Badge value={inc.severity} size="sm" />
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1">{inc.summary}</p>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    Detected {inc.detectedAt} • Affected: {inc.affectedServices.join(', ')}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                    AI Conf: {inc.aiConfidence}%
                  </span>
                  <span className="text-[10px] text-zinc-500 capitalize">{inc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
