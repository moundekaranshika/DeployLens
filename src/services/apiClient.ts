import {
  AppDashboardData,
  Deployment,
  LogEntry,
  Incident,
  ServiceHealth,
  MetricPoint,
  AIAnalysis,
} from '../types/index.js';

export async function fetchDashboardData(): Promise<AppDashboardData> {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('Failed to load dashboard data');
  return res.json();
}

export async function fetchDeployments(): Promise<Deployment[]> {
  const res = await fetch('/api/deployments');
  if (!res.ok) throw new Error('Failed to load deployments');
  return res.json();
}

export async function fetchDeploymentById(id: string): Promise<Deployment> {
  const res = await fetch(`/api/deployments/${id}`);
  if (!res.ok) throw new Error(`Failed to load deployment #${id}`);
  return res.json();
}

export async function createDeployment(dep: Partial<Deployment>): Promise<Deployment> {
  const res = await fetch('/api/deployments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dep),
  });
  if (!res.ok) throw new Error('Failed to create deployment');
  return res.json();
}

export async function fetchLogs(query?: string, severity?: string, service?: string): Promise<LogEntry[]> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (severity && severity !== 'ALL') params.append('severity', severity);
  if (service && service !== 'ALL') params.append('service', service);

  const res = await fetch(`/api/logs?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load logs');
  return res.json();
}

export async function fetchIncidents(): Promise<Incident[]> {
  const res = await fetch('/api/incidents');
  if (!res.ok) throw new Error('Failed to load incidents');
  return res.json();
}

export async function fetchIncidentById(id: string): Promise<Incident> {
  const res = await fetch(`/api/incidents/${id}`);
  if (!res.ok) throw new Error(`Failed to load incident #${id}`);
  return res.json();
}

export async function fetchServices(): Promise<ServiceHealth[]> {
  const res = await fetch('/api/services');
  if (!res.ok) throw new Error('Failed to load services');
  return res.json();
}

export async function fetchServiceById(id: string): Promise<{ service: ServiceHealth; logs: LogEntry[] }> {
  const res = await fetch(`/api/services/${id}`);
  if (!res.ok) throw new Error(`Failed to load service #${id}`);
  return res.json();
}

export async function fetchMetrics(): Promise<MetricPoint[]> {
  const res = await fetch('/api/metrics');
  if (!res.ok) throw new Error('Failed to load metrics');
  return res.json();
}

export async function analyzeLogsWithAI(query?: string, severity?: string, service?: string): Promise<AIAnalysis> {
  const res = await fetch('/api/ai/analyze-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, severity, service }),
  });
  if (!res.ok) throw new Error('AI Log analysis failed');
  return res.json();
}

export async function analyzeDeploymentWithAI(deploymentId: string): Promise<AIAnalysis> {
  const res = await fetch('/api/ai/analyze-deployment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deploymentId }),
  });
  if (!res.ok) throw new Error('AI Deployment analysis failed');
  return res.json();
}

export async function analyzeIncidentWithAI(incidentId: string): Promise<AIAnalysis> {
  const res = await fetch('/api/ai/analyze-incident', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incidentId }),
  });
  if (!res.ok) throw new Error('AI Incident analysis failed');
  return res.json();
}

export async function sendChatMessageToAI(message: string, history: { sender: string; text: string }[]): Promise<string> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error('Failed to send chat message to AI Assistant');
  const data = await res.json();
  return data.reply;
}

export async function simulateFailure(type: 'database' | 'latency' | 'error_spike' | 'healthy'): Promise<{ message: string; dashboard: AppDashboardData }> {
  const res = await fetch('/api/demo/simulate-failure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
  if (!res.ok) throw new Error('Failure simulation failed');
  return res.json();
}

export async function resetDemoState(): Promise<{ message: string; dashboard: AppDashboardData }> {
  const res = await fetch('/api/demo/reset', {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Demo reset failed');
  return res.json();
}
