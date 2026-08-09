import React, { useState, useEffect } from 'react';
import { fetchServices, fetchServiceById } from '../services/apiClient.js';
import { ServiceHealth, LogEntry } from '../types/index.js';
import { Badge } from '../components/common/Badge.js';
import { Server, Activity, Cpu, HardDrive, AlertTriangle, RefreshCw, X, FileText } from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (path: string) => void;
  selectedServiceId?: string;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate, selectedServiceId }) => {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [activeServiceModal, setActiveServiceModal] = useState<{
    service: ServiceHealth;
    logs: LogEntry[];
  } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await fetchServices();
      setServices(data);
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      openServiceDetail(selectedServiceId);
    }
  }, [selectedServiceId]);

  const openServiceDetail = async (id: string) => {
    setModalLoading(true);
    try {
      const data = await fetchServiceById(id);
      setActiveServiceModal(data);
    } catch (err) {
      console.error('Failed to load service detail', err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Server className="w-6 h-6 text-violet-400" />
            Services Infrastructure Health
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time telemetry, latency distribution, resource utilization, and error rates across Zerops runtime
          </p>
        </div>

        <button
          onClick={loadServices}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors self-start sm:self-auto"
          title="Refresh services telemetry"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="p-8 text-center text-zinc-400 font-mono text-xs">Loading services telemetry...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv) => {
            const isCritical = srv.status === 'critical';
            const isDegraded = srv.status === 'degraded';

            return (
              <div
                key={srv.id}
                onClick={() => openServiceDetail(srv.id)}
                className={`p-5 rounded-2xl border bg-zinc-900/90 hover:border-zinc-700 transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                  isCritical
                    ? 'border-rose-900/60 bg-rose-950/20'
                    : isDegraded
                    ? 'border-amber-900/60 bg-amber-950/20'
                    : 'border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-base text-zinc-100 group-hover:text-violet-300 transition-colors">
                      {srv.name}
                    </span>
                    <Badge value={srv.status} size="sm" />
                  </div>

                  <div className="space-y-2 text-xs font-mono text-zinc-400">
                    <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <Activity className="w-3.5 h-3.5 text-violet-400" /> Latency
                      </span>
                      <span className={srv.latency > 300 ? 'text-rose-400 font-bold' : 'text-zinc-100'}>
                        {srv.latency}ms
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Error Rate
                      </span>
                      <span className={srv.errorRate > 1 ? 'text-rose-400 font-bold' : 'text-zinc-100'}>
                        {srv.errorRate}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <Cpu className="w-3.5 h-3.5 text-blue-400" /> CPU Usage
                      </span>
                      <span className="text-zinc-100">{srv.cpuUsage}%</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Memory
                      </span>
                      <span className="text-zinc-100">{srv.memoryUsage} MB</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">Uptime {srv.uptime}%</span>
                  <span className="text-violet-400 font-medium group-hover:underline">
                    Inspect Service &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Service Detail Modal */}
      {activeServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl relative max-h-[85vh] overflow-y-auto font-mono">
            <button
              onClick={() => setActiveServiceModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg bg-zinc-800/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-800">
              <div className="p-2.5 rounded-xl bg-violet-950 text-violet-400 border border-violet-800/60">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-zinc-100">{activeServiceModal.service.name}</h2>
                  <Badge value={activeServiceModal.service.status} size="sm" />
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Latest Version: {activeServiceModal.service.lastDeploymentVersion} • Uptime: {activeServiceModal.service.uptime}%
                </p>
              </div>
            </div>

            {/* Telemetry Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase text-zinc-500 block">Response Latency</span>
                <span className="text-lg font-bold text-zinc-100">{activeServiceModal.service.latency} ms</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase text-zinc-500 block">Error Rate</span>
                <span className={`text-lg font-bold ${activeServiceModal.service.errorRate > 1 ? 'text-rose-400' : 'text-zinc-100'}`}>
                  {activeServiceModal.service.errorRate} %
                </span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase text-zinc-500 block">CPU Load</span>
                <span className="text-lg font-bold text-zinc-100">{activeServiceModal.service.cpuUsage} %</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase text-zinc-500 block">Memory Allocation</span>
                <span className="text-lg font-bold text-zinc-100">{activeServiceModal.service.memoryUsage} MB</span>
              </div>
            </div>

            {/* Service Log Stream */}
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-violet-400" />
                Service Specific Logs
              </h3>

              <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-3 space-y-1 max-h-60 overflow-y-auto text-xs">
                {activeServiceModal.logs.length === 0 ? (
                  <div className="text-zinc-500 text-center py-4">No recent logs recorded for this service.</div>
                ) : (
                  activeServiceModal.logs.map((log) => (
                    <div key={log.id} className="p-1.5 rounded hover:bg-zinc-900 flex items-start gap-2">
                      <span className="text-zinc-500 shrink-0">{log.timestamp}</span>
                      <span
                        className={`px-1 py-0.2 rounded text-[10px] font-bold ${
                          log.severity === 'ERROR' || log.severity === 'FATAL'
                            ? 'text-rose-400 bg-rose-950/60'
                            : 'text-zinc-400 bg-zinc-900'
                        }`}
                      >
                        {log.severity}
                      </span>
                      <span className="text-zinc-300">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
