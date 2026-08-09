import React from 'react';

interface BadgeProps {
  type?: 'status' | 'risk' | 'severity' | 'log';
  value: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ value, size = 'sm' }) => {
  const valLower = value.toLowerCase();

  let bgClass = 'bg-zinc-800 text-zinc-300 border-zinc-700';
  let dotColor = 'bg-zinc-400';

  if (valLower === 'healthy' || valLower === 'low' || valLower === 'info' || valLower === 'resolved' || valLower === 'success') {
    bgClass = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
    dotColor = 'bg-emerald-400 animate-pulse';
  } else if (valLower === 'degraded' || valLower === 'medium' || valLower === 'warning' || valLower === 'warn' || valLower === 'investigating' || valLower === 'identified') {
    bgClass = 'bg-amber-950/60 text-amber-400 border-amber-800/60';
    dotColor = 'bg-amber-400 animate-pulse';
  } else if (valLower === 'critical' || valLower === 'high' || valLower === 'failed' || valLower === 'error' || valLower === 'fatal') {
    bgClass = 'bg-rose-950/60 text-rose-400 border-rose-800/60';
    dotColor = 'bg-rose-500 animate-pulse';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border uppercase tracking-wider ${bgClass} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {value}
    </span>
  );
};
