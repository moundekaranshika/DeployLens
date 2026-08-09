import React, { useState, useEffect } from 'react';
import { fetchLogs, analyzeLogsWithAI } from '../services/apiClient.js';
import { LogEntry, AIAnalysis } from '../types/index.js';
import { AIAnalysisCard } from '../components/common/AIAnalysisCard.js';
import {
  FileText,
  Search,
  Filter,
  Sparkles,
  RefreshCw,
  Terminal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface LogsPageProps {
  onNavigate: (path: string) => void;
}

export const LogsPage: React.FC<LogsPageProps> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15;

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchLogs(searchQuery, severityFilter, serviceFilter);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [severityFilter, serviceFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  const handleAnalyzeGemini = async () => {
    setAnalyzingAI(true);
    try {
      const res = await analyzeLogsWithAI(searchQuery, severityFilter, serviceFilter);
      setAnalysis(res);
    } catch (err) {
      console.error('AI log analysis failed', err);
    } finally {
      setAnalyzingAI(false);
    }
  };

  // Pagination slicing
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage) || 1;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2 font-sans">
            <Terminal className="w-6 h-6 text-violet-400" />
            Centralized Log Console
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Real-time multi-service log aggregator with instant Gemini AI Root Cause Analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadLogs}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleAnalyzeGemini}
            disabled={analyzingAI}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-violet-900/40 transition-all"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
            <span>{analyzingAI ? 'Gemini Analyzing Logs...' : 'Analyze with Gemini'}</span>
          </button>
        </div>
      </div>

      {/* AI Analysis Result Panel */}
      {analysis && (
        <AIAnalysisCard
          analysis={analysis}
          onNavigateLogs={() => {}}
          onNavigateServices={() => onNavigate('/services')}
          onNavigateSettings={() => onNavigate('/settings')}
        />
      )}

      {/* Search & Filters Toolbar */}
      <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search log messages (e.g., ECONNREFUSED, PostgreSQL, 500, startup)..."
            className="w-full bg-transparent text-zinc-200 placeholder-zinc-500 outline-none text-xs"
          />
        </form>

        <div className="flex items-center gap-3">
          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-600"
          >
            <option value="ALL">All Services</option>
            <option value="API">API Service</option>
            <option value="Frontend">Frontend Service</option>
            <option value="PostgreSQL">PostgreSQL DB</option>
            <option value="Worker">Background Worker</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-600"
          >
            <option value="ALL">All Severities</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="FATAL">FATAL</option>
          </select>
        </div>
      </div>

      {/* Terminal Log Console View */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl overflow-hidden font-mono text-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80 text-[11px] text-zinc-500 uppercase tracking-wider">
          <span>Timestamp</span>
          <span className="w-20 text-center">Severity</span>
          <span className="w-28 text-left">Service</span>
          <span className="flex-1 pl-4">Log Stream</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-500">Retrieving stream logs...</div>
        ) : currentLogs.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">No logs match query parameters.</div>
        ) : (
          <div className="space-y-1 divide-y divide-zinc-900/60">
            {currentLogs.map((log) => {
              const isError = log.severity === 'ERROR' || log.severity === 'FATAL';
              const isWarn = log.severity === 'WARN';

              const severityColor = isError
                ? 'text-rose-400 bg-rose-950/60 border-rose-900/80'
                : isWarn
                ? 'text-amber-400 bg-amber-950/60 border-amber-900/80'
                : 'text-zinc-400 bg-zinc-900 border-zinc-800';

              const lineBg = isError
                ? 'bg-rose-950/20 border-l-2 border-rose-500 text-rose-200'
                : isWarn
                ? 'bg-amber-950/10 border-l-2 border-amber-500 text-amber-200'
                : 'hover:bg-zinc-900/40 text-zinc-300';

              return (
                <div key={log.id} className={`p-2 rounded flex items-start gap-3 transition-colors ${lineBg}`}>
                  <span className="text-zinc-500 shrink-0 text-[11px]">{log.timestamp}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 uppercase text-center w-16 ${severityColor}`}>
                    {log.severity}
                  </span>
                  <span className="text-violet-300 shrink-0 w-28 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                    [{log.service}]
                  </span>
                  <span className="flex-1 whitespace-pre-wrap break-all leading-relaxed">
                    {log.message}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Toolbar */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-zinc-500 text-xs">
          <span>
            Page {currentPage} of {totalPages} ({logs.length} log events)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
