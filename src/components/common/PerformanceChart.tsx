import React, { useState } from 'react';
import { MetricPoint } from '../../types/index.js';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Activity, AlertTriangle, Zap } from 'lucide-react';

interface PerformanceChartProps {
  data: MetricPoint[];
  className?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  className = '',
}) => {
  const [activeMetric, setActiveMetric] = useState<'latency' | 'errorRate' | 'requests'>('latency');

  const config = {
    latency: {
      name: 'Response Latency',
      unit: 'ms',
      color: '#8b5cf6', // violet
      icon: Activity,
    },
    errorRate: {
      name: 'Error Rate',
      unit: '%',
      color: '#f43f5e', // rose
      icon: AlertTriangle,
    },
    requests: {
      name: 'Requests / sec',
      unit: 'req/s',
      color: '#3b82f6', // blue
      icon: Zap,
    },
  }[activeMetric];

  return (
    <div className={`p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            Performance & Health Metrics
          </h3>
          <p className="text-xs text-zinc-400">Real-time telemetric aggregation across services</p>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('latency')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              activeMetric === 'latency'
                ? 'bg-violet-900/60 text-violet-200 border border-violet-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Latency (ms)
          </button>
          <button
            onClick={() => setActiveMetric('errorRate')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              activeMetric === 'errorRate'
                ? 'bg-rose-900/60 text-rose-200 border border-rose-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Error Rate (%)
          </button>
          <button
            onClick={() => setActiveMetric('requests')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              activeMetric === 'requests'
                ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Throughput (req/s)
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="timestamp" stroke="#71717a" fontSize={11} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                borderColor: '#3f3f46',
                borderRadius: '8px',
                color: '#f4f4f5',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
              formatter={(val: any) => [`${val} ${config.unit}`, config.name]}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={config.color}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#metricGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
