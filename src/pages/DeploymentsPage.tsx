import React, { useState, useEffect } from 'react';
import { fetchDeployments, createDeployment } from '../services/apiClient.js';
import { Deployment } from '../types/index.js';
import { Badge } from '../components/common/Badge.js';
import { GitCommit, Plus, RefreshCw, Filter, ArrowRight, Shield } from 'lucide-react';

interface DeploymentsPageProps {
  onNavigate: (path: string) => void;
}

export const DeploymentsPage: React.FC<DeploymentsPageProps> = ({ onNavigate }) => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [envFilter, setEnvFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadDeployments = async () => {
    setLoading(true);
    try {
      const data = await fetchDeployments();
      setDeployments(data);
    } catch (err) {
      console.error('Failed to load deployments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeployments();
  }, []);

  const handleCreateNew = async () => {
    try {
      const versionNum = deployments.length + 1;
      const newDep = await createDeployment({
        version: `v2.4.${versionNum}`,
        environment: 'Production',
        status: 'healthy',
        duration: '2m 04s',
        riskScore: Math.floor(8 + Math.random() * 15),
        riskLevel: 'LOW',
        changes: {
          envVarsChanged: false,
          dependencyChangesCount: 1,
          schemaChanges: false,
          apiContractChanges: false,
          notes: 'Triggered from DeployLens Console',
        },
      });
      setDeployments([newDep, ...deployments]);
    } catch (err) {
      console.error('Failed to trigger deployment', err);
    }
  };

  const filteredDeployments = deployments.filter((d) => {
    if (envFilter !== 'ALL' && d.environment.toUpperCase() !== envFilter.toUpperCase()) return false;
    if (statusFilter !== 'ALL' && d.status.toUpperCase() !== statusFilter.toUpperCase()) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <GitCommit className="w-6 h-6 text-violet-400" />
            Deployment History & Risk Matrix
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Complete record of build artifacts, runtime health, duration, and risk scoring across environments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDeployments}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Refresh deployments"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-violet-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Trigger Deployment</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 text-xs">
        <div className="flex items-center gap-2 text-zinc-400 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>

        {/* Environment Filter */}
        <select
          value={envFilter}
          onChange={(e) => setEnvFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg px-2.5 py-1.5 outline-none font-mono focus:border-violet-600"
        >
          <option value="ALL">All Environments</option>
          <option value="PRODUCTION">Production</option>
          <option value="STAGING">Staging</option>
          <option value="DEVELOPMENT">Development</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg px-2.5 py-1.5 outline-none font-mono focus:border-violet-600"
        >
          <option value="ALL">All Statuses</option>
          <option value="HEALTHY">✓ Healthy</option>
          <option value="FAILED">✗ Failed</option>
          <option value="WARNING">⚠ Warning</option>
        </select>

        <span className="text-zinc-500 font-mono ml-auto">
          Showing {filteredDeployments.length} of {deployments.length} deployments
        </span>
      </div>

      {/* Deployments Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-400 font-mono text-xs">Loading deployment records...</div>
        ) : filteredDeployments.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-mono">No deployments found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[11px] bg-zinc-950/50">
                  <th className="p-4">ID</th>
                  <th className="p-4">Version</th>
                  <th className="p-4">Environment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Risk Score</th>
                  <th className="p-4">Created</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredDeployments.map((dep) => (
                  <tr
                    key={dep.id}
                    onClick={() => onNavigate(`/deployments/${dep.id}`)}
                    className="hover:bg-zinc-800/60 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-bold text-zinc-300">#{dep.id.replace('dep-', '')}</td>
                    <td className="p-4 text-zinc-100 font-bold group-hover:text-violet-300 transition-colors">
                      {dep.version}
                    </td>
                    <td className="p-4 text-zinc-400">{dep.environment}</td>
                    <td className="p-4">
                      <Badge value={dep.status} size="sm" />
                    </td>
                    <td className="p-4 text-zinc-400">{dep.duration}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
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
                        <span className="text-[10px] text-zinc-500 uppercase">({dep.riskLevel})</span>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-400">{dep.created}</td>
                    <td className="p-4 text-right">
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
