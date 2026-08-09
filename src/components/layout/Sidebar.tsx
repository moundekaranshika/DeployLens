import React from 'react';
import {
  LayoutDashboard,
  Server,
  FileText,
  AlertOctagon,
  GitCommit,
  Bot,
  Settings,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenDemoControls: () => void;
  isSimulatedFailure?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  onOpenDemoControls,
  isSimulatedFailure,
}) => {
  const navGroups = [
    {
      title: 'MONITORING',
      items: [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/services', label: 'Services', icon: Server },
        { path: '/logs', label: 'Logs', icon: FileText },
        { path: '/incidents', label: 'Incidents', icon: AlertOctagon },
      ],
    },
    {
      title: 'DEPLOYMENTS',
      items: [{ path: '/deployments', label: 'Deployments', icon: GitCommit }],
    },
    {
      title: 'AI COPILOT',
      items: [{ path: '/assistant', label: 'AI Assistant', icon: Bot }],
    },
    {
      title: 'SYSTEM',
      items: [{ path: '/settings', label: 'Settings', icon: Settings }],
    },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto font-sans select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-900/30 font-bold font-mono">
              DL
            </div>
            <div>
              <div className="text-base font-bold text-zinc-100 tracking-tight flex items-center gap-1.5">
                DeployLens
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-950 text-violet-400 border border-violet-800/60 font-medium">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium leading-none mt-1">AI Reliability Copilot</p>
            </div>
          </div>
        </div>

        {/* Zerops Platform Tag */}
        <div className="mx-4 mt-4 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Zerops Cloud</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Production</span>
        </div>

        {/* Navigation Sections */}
        <nav className="p-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <div className="px-3 mb-2 text-[10px] font-bold text-zinc-500 tracking-wider uppercase">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    currentPath === item.path ||
                    (item.path !== '/' && currentPath.startsWith(item.path));

                  return (
                    <button
                      key={item.path}
                      onClick={() => onNavigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-violet-950/60 text-violet-300 border border-violet-800/60 shadow-inner'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-zinc-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Demo Controls Callout */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950">
        <button
          onClick={onOpenDemoControls}
          className={`w-full p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
            isSimulatedFailure
              ? 'bg-rose-950/60 text-rose-300 border-rose-800/80 hover:bg-rose-900/70'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Demo Scenarios</span>
          </div>
          <span className="text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">Controls</span>
        </button>
      </div>
    </aside>
  );
};
