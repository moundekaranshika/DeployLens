import React, { useState } from 'react';
import { Bell, User, Sparkles, ChevronDown, Check } from 'lucide-react';

interface HeaderProps {
  activeEnv: string;
  onChangeEnv: (env: string) => void;
  onOpenDemoControls: () => void;
  activeIncidentsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeEnv,
  onChangeEnv,
  onOpenDemoControls,
  activeIncidentsCount = 0,
}) => {
  const [showEnvMenu, setShowEnvMenu] = useState(false);
  const envs = ['Production', 'Staging', 'Development'];

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Title & Tagline */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            DeployLens
            <span className="text-zinc-500 font-normal text-xs">• AI Deployment Reliability Copilot</span>
          </h1>
          <p className="text-[11px] text-zinc-400">See the failure. Understand the cause. Fix the deployment.</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Environment Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowEnvMenu(!showEnvMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Environment: {activeEnv}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          {showEnvMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 py-1 text-xs">
              {envs.map((env) => (
                <button
                  key={env}
                  onClick={() => {
                    onChangeEnv(env);
                    setShowEnvMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center justify-between text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  <span>{env}</span>
                  {activeEnv === env && <Check className="w-3.5 h-3.5 text-violet-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Simulator Trigger Pill */}
        <button
          onClick={onOpenDemoControls}
          className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>Simulate Failure</span>
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {activeIncidentsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeIncidentsCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-medium text-xs">
            <User className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono text-zinc-300 hidden sm:inline">dev@deploylens.io</span>
        </div>
      </div>
    </header>
  );
};
