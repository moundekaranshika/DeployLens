import React, { useState, useEffect } from 'react';
import { fetchIncidents } from '../services/apiClient.js';
import { Incident } from '../types/index.js';
import { Badge } from '../components/common/Badge.js';
import { AlertOctagon, ArrowRight, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface IncidentsPageProps {
  onNavigate: (path: string) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({ onNavigate }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await fetchIncidents();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-rose-400" />
            Active & Resolved Incidents
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Automated detection, AI diagnosis, and resolution workflows for deployment incidents
          </p>
        </div>

        <button
          onClick={loadIncidents}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors self-start sm:self-auto"
          title="Refresh incidents"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Incidents Grid */}
      {loading ? (
        <div className="p-8 text-center text-zinc-400 font-mono text-xs">Loading incident telemetry...</div>
      ) : incidents.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 font-mono text-xs">No active or resolved incidents found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => onNavigate(`/incidents/${inc.id}`)}
              className={`p-5 rounded-xl border bg-zinc-900/90 hover:border-zinc-700 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                inc.severity === 'critical' ? 'border-rose-900/50' : 'border-zinc-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge value={inc.severity} size="md" />
                  <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Conf: {inc.aiConfidence}%
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-zinc-100">{inc.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{inc.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-800/80">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 block">Detected</span>
                    <span className="text-zinc-200">{inc.detectedAt}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 block">Affected</span>
                    <span className="text-zinc-200">{inc.affectedServices.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs font-mono capitalize text-zinc-400">
                  Status: <strong className="text-zinc-200">{inc.status}</strong>
                </span>

                <span className="px-3 py-1 rounded-lg bg-violet-950 text-violet-300 border border-violet-800/60 text-xs font-medium flex items-center gap-1 group-hover:bg-violet-900 transition-colors">
                  <span>View Incident</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
