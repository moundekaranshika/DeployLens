import React, { useState } from 'react';
import { Settings, Shield, Server, Bell, Cpu, FileCode2, Check, ExternalLink } from 'lucide-react';

interface SettingsPageProps {
  activeEnv: string;
  onChangeEnv: (env: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ activeEnv, onChangeEnv }) => {
  const [appName, setAppName] = useState('DeployLens');
  const [pollingInterval, setPollingInterval] = useState('10s');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [webhookAlerts, setWebhookAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-violet-400" />
          Settings & Environment Configuration
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage system behavior, Gemini model parameters, notification channels, and Zerops architecture specs
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Application Settings */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-4">
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
            <Server className="w-4 h-4 text-violet-400" />
            General Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Application Title</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 outline-none focus:border-violet-600"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-medium mb-1">Active Target Environment</label>
              <select
                value={activeEnv}
                onChange={(e) => onChangeEnv(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 outline-none focus:border-violet-600"
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Development">Development</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI & Telemetry Settings */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-4">
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
            <Cpu className="w-4 h-4 text-violet-400" />
            AI & Telemetry Engine Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Gemini Model</label>
              <input
                type="text"
                disabled
                value="gemini-3.6-flash (Official Google GenAI SDK)"
                className="w-full bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2.5 text-zinc-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-medium mb-1">Health Polling Interval</label>
              <select
                value={pollingInterval}
                onChange={(e) => setPollingInterval(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 outline-none focus:border-violet-600"
              >
                <option value="5s">Every 5 Seconds (Real-time)</option>
                <option value="10s">Every 10 Seconds (Standard)</option>
                <option value="30s">Every 30 Seconds (Low Impact)</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400 space-y-1">
            <div className="text-zinc-200 font-bold flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" /> GEMINI_API_KEY Security
            </div>
            <p className="text-zinc-400 text-[11px]">
              API keys are secured strictly server-side inside Node/Express environment variables. Secrets are never exposed to the client bundle.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-4">
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
            <Bell className="w-4 h-4 text-violet-400" />
            Incident Alert Subscriptions
          </h2>

          <div className="space-y-3 text-xs font-mono">
            <label className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer">
              <span className="text-zinc-300">Email Notifications on Critical Incident</span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded accent-violet-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer">
              <span className="text-zinc-300">Webhook Dispatch to Slack / Discord</span>
              <input
                type="checkbox"
                checked={webhookAlerts}
                onChange={(e) => setWebhookAlerts(e.target.checked)}
                className="w-4 h-4 rounded accent-violet-600"
              />
            </label>
          </div>
        </div>

        {/* Zerops Architecture Guide */}
        <div className="p-5 rounded-xl border border-violet-900/50 bg-zinc-900/90 space-y-4">
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800/80 pb-3 font-mono">
            <FileCode2 className="w-4 h-4 text-violet-400" />
            Zerops Deployment Integration Specs
          </h2>

          <div className="text-xs font-mono text-zinc-300 space-y-2">
            <p>
              DeployLens is configured for native deployment on <strong>Zerops Cloud</strong> using <code>zerops.yaml</code>.
            </p>
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-violet-300 space-y-1">
              <div>• Zerops Runtime Services: Node.js (Express Backend + Vite Web), PostgreSQL Database</div>
              <div>• Health Check Probe: GET /api/dashboard HTTP 200 OK</div>
              <div>• Port Binding: 0.0.0.0:3000</div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all shadow-lg shadow-violet-900/30"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
};
