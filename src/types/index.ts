export type ServiceStatus = 'healthy' | 'degraded' | 'critical';
export type DeploymentStatus = 'healthy' | 'warning' | 'failed' | 'in_progress';
export type IncidentSeverity = 'critical' | 'warning' | 'info';
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
export type LogSeverity = 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface ServiceHealth {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime: number; // percentage
  latency: number; // ms
  cpuUsage: number; // percentage
  memoryUsage: number; // MB or percentage
  errorRate: number; // percentage
  lastDeploymentVersion: string;
  updatedAt: string;
}

export interface HealthBreakdown {
  score: number;
  uptimePenalty: number;
  errorPenalty: number;
  latencyPenalty: number;
  incidentPenalty: number;
  servicePenalty: number;
}

export interface DeploymentChange {
  envVarsChanged: boolean;
  dependencyChangesCount: number;
  schemaChanges: boolean;
  apiContractChanges: boolean;
  notes?: string;
}

export interface DeploymentTimelineEvent {
  time: string;
  message: string;
  status: 'success' | 'warning' | 'failed' | 'info';
}

export interface RiskBreakdown {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: {
    name: string;
    score: number;
    description: string;
  }[];
}

export interface Deployment {
  id: string;
  version: string;
  environment: 'Production' | 'Staging' | 'Development';
  status: DeploymentStatus;
  duration: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  created: string;
  buildSuccess: boolean;
  deploySuccess: boolean;
  healthCheckPassed: boolean;
  timeline: DeploymentTimelineEvent[];
  changes: DeploymentChange;
  commitHash?: string;
  author?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  severity: LogSeverity;
  service: string;
  message: string;
  details?: string;
  stackTrace?: string;
}

export interface IncidentTimelineItem {
  time: string;
  title: string;
  type: 'event' | 'alert' | 'ai' | 'resolution';
}

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  detectedAt: string;
  affectedServices: string[];
  aiConfidence: number;
  summary: string;
  timeline: IncidentTimelineItem[];
  diagnosis?: AIAnalysis;
  remediationSteps?: string[];
}

export interface MetricPoint {
  timestamp: string;
  latency: number; // ms
  errorRate: number; // percentage
  requests: number; // req/sec
  cpu?: number;
  memory?: number;
}

export interface AIAnalysis {
  summary: string;
  rootCause: string;
  confidence: number;
  severity: IncidentSeverity;
  evidence: string[];
  likelyCauses: string[];
  recommendedFixes: string[];
  nextSteps: string[];
  rawMarkdown?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  relatedDeploymentId?: string;
  relatedIncidentId?: string;
}

export interface AppDashboardData {
  healthScore: HealthBreakdown;
  uptime: number;
  totalDeployments: number;
  activeIncidentsCount: number;
  services: ServiceHealth[];
  recentDeployments: Deployment[];
  metrics: MetricPoint[];
  recentIncidents: Incident[];
  currentFailureSimulated?: boolean;
}
