import {
  ServiceHealth,
  Deployment,
  LogEntry,
  Incident,
  MetricPoint,
  HealthBreakdown,
  AppDashboardData,
} from '../../src/types/index.js';

import pg from 'pg';

let pgPool: pg.Pool | null = null;

if (process.env.DATABASE_URL) {
  try {
    pgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    console.log('[DB] Initialized PostgreSQL connection pool');
  } catch (err) {
    console.error('[DB] Failed to connect to PostgreSQL, falling back to in-memory store:', err);
  }
}

// Initial Seed Data
const initialServices: ServiceHealth[] = [
  {
    id: 'srv-api',
    name: 'API',
    status: 'healthy',
    uptime: 99.95,
    latency: 42,
    cpuUsage: 28,
    memoryUsage: 320,
    errorRate: 0.02,
    lastDeploymentVersion: 'v2.4.1',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-frontend',
    name: 'Frontend',
    status: 'healthy',
    uptime: 99.99,
    latency: 18,
    cpuUsage: 12,
    memoryUsage: 140,
    errorRate: 0.00,
    lastDeploymentVersion: 'v2.4.1',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-postgres',
    name: 'PostgreSQL',
    status: 'healthy',
    uptime: 99.98,
    latency: 4,
    cpuUsage: 35,
    memoryUsage: 1024,
    errorRate: 0.00,
    lastDeploymentVersion: 'v15.3',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-worker',
    name: 'Background Worker',
    status: 'healthy',
    uptime: 99.85,
    latency: 85,
    cpuUsage: 18,
    memoryUsage: 280,
    errorRate: 0.05,
    lastDeploymentVersion: 'v2.4.1',
    updatedAt: new Date().toISOString(),
  },
];

const initialDeployments: Deployment[] = [
  {
    id: 'dep-24',
    version: 'v2.4.1',
    environment: 'Production',
    status: 'healthy',
    duration: '2m 14s',
    riskScore: 12,
    riskLevel: 'LOW',
    created: '8 minutes ago',
    buildSuccess: true,
    deploySuccess: true,
    healthCheckPassed: true,
    commitHash: '8f3a91b',
    author: 'Alex Rivera <alex@deploylens.dev>',
    timeline: [
      { time: '16:35', message: 'Deployment triggered via GitHub webhook', status: 'info' },
      { time: '16:36', message: 'Zerops build step completed in 48s', status: 'success' },
      { time: '16:37', message: 'Container booted and environment injected', status: 'success' },
      { time: '16:37', message: 'HTTP health probe returned 200 OK', status: 'success' },
      { time: '16:38', message: 'Traffic routed to v2.4.1', status: 'success' },
    ],
    changes: {
      envVarsChanged: false,
      dependencyChangesCount: 3,
      schemaChanges: false,
      apiContractChanges: false,
      notes: 'Updated @google/genai SDK and bumped internal express middleware',
    },
  },
  {
    id: 'dep-23',
    version: 'v2.4.0',
    environment: 'Production',
    status: 'healthy',
    duration: '1m 58s',
    riskScore: 24,
    riskLevel: 'LOW',
    created: '2 hours ago',
    buildSuccess: true,
    deploySuccess: true,
    healthCheckPassed: true,
    commitHash: '7e2c84d',
    author: 'Sarah Chen <sarah@deploylens.dev>',
    timeline: [
      { time: '14:20', message: 'Deployment started for feature release', status: 'info' },
      { time: '14:21', message: 'Build successful', status: 'success' },
      { time: '14:22', message: 'Health checks passed', status: 'success' },
    ],
    changes: {
      envVarsChanged: true,
      dependencyChangesCount: 1,
      schemaChanges: false,
      apiContractChanges: false,
      notes: 'Added RATE_LIMIT_PER_MIN environment configuration',
    },
  },
  {
    id: 'dep-22',
    version: 'v2.3.9',
    environment: 'Production',
    status: 'failed',
    duration: '3m 10s',
    riskScore: 78,
    riskLevel: 'HIGH',
    created: '5 hours ago',
    buildSuccess: true,
    deploySuccess: false,
    healthCheckPassed: false,
    commitHash: '3a1f90e',
    author: 'DevOps Automation <bot@deploylens.dev>',
    timeline: [
      { time: '11:15', message: 'Deployment #22 started', status: 'info' },
      { time: '11:16', message: 'Build completed successfully', status: 'success' },
      { time: '11:17', message: 'Container started with updated DB pooling config', status: 'info' },
      { time: '11:18', message: 'Health check probe failed (Connection Refused to PostgreSQL)', status: 'failed' },
      { time: '11:18', message: 'Deployment aborted. Rollback initiated to v2.3.8', status: 'failed' },
    ],
    changes: {
      envVarsChanged: true,
      dependencyChangesCount: 5,
      schemaChanges: true,
      apiContractChanges: true,
      notes: 'Refactored DATABASE_URL connection pooling & migration scripts',
    },
  },
  {
    id: 'dep-21',
    version: 'v2.3.8',
    environment: 'Production',
    status: 'healthy',
    duration: '2m 05s',
    riskScore: 15,
    riskLevel: 'LOW',
    created: '1 day ago',
    buildSuccess: true,
    deploySuccess: true,
    healthCheckPassed: true,
    commitHash: '9d8b12a',
    author: 'Alex Rivera <alex@deploylens.dev>',
    timeline: [
      { time: '09:00', message: 'Patch release deployment', status: 'info' },
      { time: '09:02', message: 'Successfully deployed to Zerops runtime', status: 'success' },
    ],
    changes: {
      envVarsChanged: false,
      dependencyChangesCount: 0,
      schemaChanges: false,
      apiContractChanges: false,
      notes: 'Security patch update',
    },
  },
  {
    id: 'dep-20',
    version: 'v2.3.7',
    environment: 'Staging',
    status: 'healthy',
    duration: '1m 45s',
    riskScore: 8,
    riskLevel: 'LOW',
    created: '2 days ago',
    buildSuccess: true,
    deploySuccess: true,
    healthCheckPassed: true,
    commitHash: '1c4e56f',
    author: 'Elena Rostova <elena@deploylens.dev>',
    timeline: [
      { time: '18:10', message: 'Staging environment sync', status: 'info' },
      { time: '18:11', message: 'Deployment completed', status: 'success' },
    ],
    changes: {
      envVarsChanged: false,
      dependencyChangesCount: 1,
      schemaChanges: false,
      apiContractChanges: false,
      notes: 'Staging integration validation',
    },
  },
  {
    id: 'dep-19',
    version: 'v2.3.6',
    environment: 'Production',
    status: 'warning',
    duration: '4m 12s',
    riskScore: 54,
    riskLevel: 'MEDIUM',
    created: '3 days ago',
    buildSuccess: true,
    deploySuccess: true,
    healthCheckPassed: true,
    commitHash: '5f92d11',
    author: 'Sarah Chen <sarah@deploylens.dev>',
    timeline: [
      { time: '12:00', message: 'Deployment started', status: 'info' },
      { time: '12:03', message: 'Latency spike observed during health check (450ms)', status: 'warning' },
      { time: '12:04', message: 'Traffic routing enabled with warning threshold', status: 'warning' },
    ],
    changes: {
      envVarsChanged: false,
      dependencyChangesCount: 8,
      schemaChanges: true,
      apiContractChanges: false,
      notes: 'Updated search indexing service',
    },
  },
  {
    id: 'dep-18',
    version: 'v2.3.5',
    environment: 'Production',
    status: 'healthy',
    duration: '2m 10s',
    riskScore: 10,
    riskLevel: 'LOW',
    created: '4 days ago',
    buildSuccess: true,
    deploySuccess: true,
    healthCheckPassed: true,
    commitHash: '6d3a82e',
    author: 'Alex Rivera <alex@deploylens.dev>',
    timeline: [{ time: '10:00', message: 'Deployment completed', status: 'success' }],
    changes: {
      envVarsChanged: false,
      dependencyChangesCount: 0,
      schemaChanges: false,
      apiContractChanges: false,
      notes: 'Bug fixes in notification dispatch',
    },
  },
  {
    id: 'dep-17',
    version: 'v2.3.4',
    environment: 'Development',
    status: 'healthy',
    duration: '1m 30s',
    riskScore: 5,
    riskLevel: 'LOW',
    created: '5 days ago',
    buildSuccess: true,
    deploySuccess: true,
    healthCheckPassed: true,
    commitHash: '2b11a9f',
    author: 'Elena Rostova <elena@deploylens.dev>',
    timeline: [{ time: '15:45', message: 'Dev environment build', status: 'success' }],
    changes: {
      envVarsChanged: false,
      dependencyChangesCount: 2,
      schemaChanges: false,
      apiContractChanges: false,
      notes: 'Local feature branch deployment test',
    },
  },
];

const initialLogs: LogEntry[] = [
  {
    id: 'log-101',
    timestamp: '16:42:21',
    severity: 'INFO',
    service: 'API',
    message: 'API server started on port 3000 (Zerops Cloud Run runtime)',
  },
  {
    id: 'log-102',
    timestamp: '16:42:22',
    severity: 'INFO',
    service: 'PostgreSQL',
    message: 'Database connection pool initialized (Max pool size: 20)',
  },
  {
    id: 'log-103',
    timestamp: '16:42:25',
    severity: 'INFO',
    service: 'Worker',
    message: 'Background task consumer registered on queue: deploylens-metrics',
  },
  {
    id: 'log-104',
    timestamp: '16:42:30',
    severity: 'INFO',
    service: 'Frontend',
    message: 'Assets bundled & served via Nginx edge cache',
  },
  {
    id: 'log-105',
    timestamp: '16:43:10',
    severity: 'WARN',
    service: 'API',
    message: 'Slow query detected: SELECT * FROM deployment_events WHERE project_id = $1 (210ms)',
  },
];

const initialIncidents: Incident[] = [
  {
    id: 'inc-1',
    title: 'Database connection failure',
    severity: 'critical',
    status: 'investigating',
    detectedAt: '8 minutes ago',
    affectedServices: ['API', 'PostgreSQL'],
    aiConfidence: 94,
    summary: 'API service reported database pool socket timeout. PostgreSQL host unreachable on port 5432.',
    timeline: [
      { time: '16:37', title: 'Deployment #22 executed', type: 'event' },
      { time: '16:38', title: 'Database connection errors reported by health check', type: 'alert' },
      { time: '16:39', title: 'Error rate exceeded 10% threshold', type: 'alert' },
      { time: '16:40', title: 'Incident automatically created by DeployLens Engine', type: 'event' },
      { time: '16:40', title: 'AI root cause diagnosis generated', type: 'ai' },
    ],
    diagnosis: {
      summary: 'PostgreSQL database container unreachable due to invalid DATABASE_URL host mapping after deployment #22.',
      rootCause: 'PostgreSQL is unreachable from the API service.',
      confidence: 94,
      severity: 'critical',
      evidence: [
        'Connection refused to PostgreSQL on port 5432',
        'Database initialization failed during API boot sequence',
        'Application startup aborted with ECONNREFUSED',
      ],
      likelyCauses: [
        'Incorrect DATABASE_URL environment variable mapping',
        'PostgreSQL container network connection closed or restarting',
        'Firewall or security group rules blocking port 5432 on Zerops subnet',
      ],
      recommendedFixes: [
        'Verify DATABASE_URL and confirm that the database service is accessible from the API container.',
        'Check Zerops environment variable configuration for postgres service hostname.',
        'Restart the PostgreSQL container or run rollback to deployment #21.',
      ],
      nextSteps: [
        'Verify Environment Variables in Zerops GUI',
        'Check Database Health metrics',
        'View Related Logs in Log Viewer',
      ],
    },
    remediationSteps: [
      'Navigate to Zerops environment variables panel',
      'Confirm DATABASE_URL equals postgresql://user:pass@postgresql:5432/deploylens',
      'Restart API container service',
    ],
  },
  {
    id: 'inc-2',
    title: 'API latency spike on search queries',
    severity: 'warning',
    status: 'resolved',
    detectedAt: '2 hours ago',
    affectedServices: ['API'],
    aiConfidence: 88,
    summary: 'Response latency surged to 450ms following deployment #19 due to missing GIN index on logs column.',
    timeline: [
      { time: '14:15', title: 'Search latency spike detected', type: 'alert' },
      { time: '14:18', title: 'AI analysis suggested adding index to logs table', type: 'ai' },
      { time: '14:25', title: 'Index applied in deployment #20', type: 'resolution' },
    ],
    remediationSteps: ['Index applied successfully', 'Latency returned to 42ms baseline'],
  },
];

const initialMetrics: MetricPoint[] = Array.from({ length: 12 }).map((_, i) => {
  const date = new Date(Date.now() - (11 - i) * 5 * 60 * 1000);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return {
    timestamp: timeStr,
    latency: Math.floor(35 + Math.random() * 15),
    errorRate: Number((Math.random() * 0.2).toFixed(2)),
    requests: Math.floor(1200 + Math.random() * 300),
    cpu: Math.floor(20 + Math.random() * 15),
    memory: Math.floor(300 + Math.random() * 50),
  };
});

// State Container
class DataStore {
  private services: ServiceHealth[] = [...initialServices];
  private deployments: Deployment[] = [...initialDeployments];
  private logs: LogEntry[] = [...initialLogs];
  private incidents: Incident[] = [...initialIncidents];
  private metrics: MetricPoint[] = [...initialMetrics];
  private failureSimulated: boolean = false;

  getDashboardData(): AppDashboardData {
    const healthScore = this.calculateHealthScore();
    return {
      healthScore,
      uptime: 99.92,
      totalDeployments: this.deployments.length,
      activeIncidentsCount: this.incidents.filter((i) => i.status !== 'resolved').length,
      services: this.services,
      recentDeployments: this.deployments,
      metrics: this.metrics,
      recentIncidents: this.incidents,
      currentFailureSimulated: this.failureSimulated,
    };
  }

  calculateHealthScore(): HealthBreakdown {
    let score = 100;
    let errorPenalty = 0;
    let latencyPenalty = 0;
    let incidentPenalty = 0;
    let servicePenalty = 0;

    // Check services
    for (const s of this.services) {
      if (s.status === 'critical') {
        servicePenalty += 25;
        score -= 25;
      } else if (s.status === 'degraded') {
        servicePenalty += 12;
        score -= 12;
      }

      if (s.errorRate > 5) {
        errorPenalty += 20;
        score -= 20;
      } else if (s.errorRate > 1) {
        errorPenalty += 10;
        score -= 10;
      }

      if (s.latency > 300) {
        latencyPenalty += 15;
        score -= 15;
      } else if (s.latency > 150) {
        latencyPenalty += 7;
        score -= 7;
      }
    }

    // Active incidents
    const activeIncidents = this.incidents.filter((i) => i.status !== 'resolved');
    for (const inc of activeIncidents) {
      if (inc.severity === 'critical') {
        incidentPenalty += 20;
        score -= 20;
      } else if (inc.severity === 'warning') {
        incidentPenalty += 10;
        score -= 10;
      }
    }

    const finalScore = Math.max(0, Math.min(100, score));

    return {
      score: finalScore,
      uptimePenalty: 0,
      errorPenalty,
      latencyPenalty,
      incidentPenalty,
      servicePenalty,
    };
  }

  getServices(): ServiceHealth[] {
    return this.services;
  }

  getServiceById(id: string): ServiceHealth | undefined {
    return this.services.find((s) => s.id === id || s.name.toLowerCase() === id.toLowerCase());
  }

  getDeployments(): Deployment[] {
    return this.deployments;
  }

  getDeploymentById(id: string): Deployment | undefined {
    return this.deployments.find((d) => d.id === id || d.id === `dep-${id}`);
  }

  getLogs(query?: string, severity?: string, service?: string): LogEntry[] {
    return this.logs.filter((log) => {
      if (severity && severity !== 'ALL' && log.severity !== severity) return false;
      if (service && service !== 'ALL' && log.service.toLowerCase() !== service.toLowerCase()) return false;
      if (query && query.trim() !== '') {
        const q = query.toLowerCase();
        return (
          log.message.toLowerCase().includes(q) ||
          log.service.toLowerCase().includes(q) ||
          log.severity.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }

  getIncidents(): Incident[] {
    return this.incidents;
  }

  getIncidentById(id: string): Incident | undefined {
    return this.incidents.find((i) => i.id === id || i.id === `inc-${id}`);
  }

  getMetrics(): MetricPoint[] {
    return this.metrics;
  }

  simulateFailureScenario(type: 'database' | 'latency' | 'error_spike' | 'healthy') {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (type === 'database') {
      this.failureSimulated = true;
      // Mark services
      this.services = this.services.map((s) => {
        if (s.name === 'PostgreSQL') {
          return { ...s, status: 'critical', errorRate: 98.5, latency: 1200, updatedAt: new Date().toISOString() };
        }
        if (s.name === 'API') {
          return { ...s, status: 'degraded', errorRate: 35.2, latency: 850, updatedAt: new Date().toISOString() };
        }
        return s;
      });

      // Add failed deployment
      const newDepId = `dep-${this.deployments.length + 1}`;
      const newDep: Deployment = {
        id: newDepId,
        version: 'v2.4.2-fail',
        environment: 'Production',
        status: 'failed',
        duration: '45s',
        riskScore: 92,
        riskLevel: 'HIGH',
        created: 'Just now',
        buildSuccess: true,
        deploySuccess: false,
        healthCheckPassed: false,
        commitHash: 'e41a99d',
        author: 'DeployLens AutoSim <sim@deploylens.dev>',
        timeline: [
          { time: nowStr, message: 'Simulated failure deployment triggered', status: 'info' },
          { time: nowStr, message: 'Build completed successfully', status: 'success' },
          { time: nowStr, message: 'Container started with database credentials', status: 'info' },
          { time: nowStr, message: 'FATAL Connection refused to PostgreSQL at postgresql:5432', status: 'failed' },
        ],
        changes: {
          envVarsChanged: true,
          dependencyChangesCount: 2,
          schemaChanges: true,
          apiContractChanges: false,
          notes: 'Simulated Database Failure event injected',
        },
      };
      this.deployments.unshift(newDep);

      // Append realistic logs as requested by prompt
      const newLogs: LogEntry[] = [
        {
          id: `log-${Date.now()}-1`,
          timestamp: nowStr,
          severity: 'INFO',
          service: 'API',
          message: 'API server booting up on port 3000...',
        },
        {
          id: `log-${Date.now()}-2`,
          timestamp: nowStr,
          severity: 'INFO',
          service: 'PostgreSQL',
          message: 'Connecting to PostgreSQL host postgresql:5432...',
        },
        {
          id: `log-${Date.now()}-3`,
          timestamp: nowStr,
          severity: 'ERROR',
          service: 'PostgreSQL',
          message: 'Connection refused to PostgreSQL (ECONNREFUSED 127.0.0.1:5432)',
        },
        {
          id: `log-${Date.now()}-4`,
          timestamp: nowStr,
          severity: 'ERROR',
          service: 'API',
          message: 'Database initialization failed. Unable to establish connection pool.',
        },
        {
          id: `log-${Date.now()}-5`,
          timestamp: nowStr,
          severity: 'FATAL',
          service: 'API',
          message: 'Application startup aborted due to unhandled database connection exception.',
        },
      ];
      this.logs.unshift(...newLogs);

      // Add critical incident
      const incId = `inc-${this.incidents.length + 1}`;
      const newIncident: Incident = {
        id: incId,
        title: 'Database connection failure',
        severity: 'critical',
        status: 'investigating',
        detectedAt: 'Just now',
        affectedServices: ['API', 'PostgreSQL'],
        aiConfidence: 94,
        summary: 'PostgreSQL is unreachable from the API service. Connection refused on TCP port 5432.',
        timeline: [
          { time: nowStr, title: `Deployment ${newDep.version} started`, type: 'event' },
          { time: nowStr, title: 'Database connection errors observed in logs', type: 'alert' },
          { time: nowStr, title: 'API Error rate spiked above 30%', type: 'alert' },
          { time: nowStr, title: 'Incident created automatically', type: 'event' },
        ],
        diagnosis: {
          summary: 'PostgreSQL is unreachable from the API service.',
          rootCause: 'PostgreSQL is unreachable from the API service.',
          confidence: 94,
          severity: 'critical',
          evidence: [
            'Connection refused to PostgreSQL',
            'Database initialization failed',
            'Application startup aborted',
          ],
          likelyCauses: [
            '1. Incorrect DATABASE_URL environment variable',
            '2. PostgreSQL service unavailable or crashed',
            '3. Network configuration issue or closed container port',
          ],
          recommendedFixes: [
            'Verify DATABASE_URL and confirm that the database service is accessible from the API.',
            'Ensure the PostgreSQL container process is healthy on Zerops.',
            'Check firewall and security group rules for database port 5432.',
          ],
          nextSteps: [
            'Verify Environment Variables',
            'Check Database Health',
            'View Related Logs',
          ],
        },
        remediationSteps: [
          'Verify DATABASE_URL in environment configuration',
          'Check PostgreSQL service container state on Zerops dashboard',
          'Restart PostgreSQL service or rollback deployment',
        ],
      };
      this.incidents.unshift(newIncident);

      // Update metrics spike
      this.metrics = this.metrics.map((m, idx) => {
        if (idx >= this.metrics.length - 2) {
          return { ...m, latency: 850, errorRate: 35.5 };
        }
        return m;
      });
    } else if (type === 'latency') {
      this.services = this.services.map((s) => {
        if (s.name === 'API' || s.name === 'Worker') {
          return { ...s, status: 'degraded', latency: 680, errorRate: 4.2 };
        }
        return s;
      });

      this.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        severity: 'WARN',
        service: 'API',
        message: 'High latency detected: Request p99 response time exceeded 680ms limit.',
      });

      this.incidents.unshift({
        id: `inc-${this.incidents.length + 1}`,
        title: 'API latency spike',
        severity: 'warning',
        status: 'investigating',
        detectedAt: 'Just now',
        affectedServices: ['API'],
        aiConfidence: 89,
        summary: 'Response time spiked to 680ms following query execution contention.',
        timeline: [{ time: nowStr, title: 'Latency surge detected', type: 'alert' }],
        remediationSteps: ['Optimize slow database queries', 'Scale worker processing pool'],
      });
    } else if (type === 'error_spike') {
      this.services = this.services.map((s) => {
        if (s.name === 'API') {
          return { ...s, status: 'degraded', errorRate: 18.4 };
        }
        return s;
      });

      this.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        severity: 'ERROR',
        service: 'API',
        message: 'Unhandled 500 Internal Server Error rate spiked on endpoint /api/v1/checkout.',
      });

      this.incidents.unshift({
        id: `inc-${this.incidents.length + 1}`,
        title: 'API error rate spike',
        severity: 'warning',
        status: 'investigating',
        detectedAt: 'Just now',
        affectedServices: ['API'],
        aiConfidence: 91,
        summary: 'HTTP 500 internal server error rate reached 18.4% on main API endpoints.',
        timeline: [{ time: nowStr, title: 'Error rate threshold exceeded', type: 'alert' }],
        remediationSteps: ['Inspect uncaught exceptions in log stream', 'Deploy patch release'],
      });
    } else if (type === 'healthy') {
      this.failureSimulated = false;
      this.services = initialServices.map((s) => ({ ...s, updatedAt: new Date().toISOString() }));
      this.deployments.unshift({
        id: `dep-${this.deployments.length + 1}`,
        version: `v2.4.${this.deployments.length + 1}`,
        environment: 'Production',
        status: 'healthy',
        duration: '1m 55s',
        riskScore: 8,
        riskLevel: 'LOW',
        created: 'Just now',
        buildSuccess: true,
        deploySuccess: true,
        healthCheckPassed: true,
        commitHash: '0a9f82d',
        author: 'DeployLens Engineer <admin@deploylens.dev>',
        timeline: [
          { time: nowStr, message: 'Healthy deployment deployed successfully', status: 'success' },
          { time: nowStr, message: 'All health checks green', status: 'success' },
        ],
        changes: {
          envVarsChanged: false,
          dependencyChangesCount: 0,
          schemaChanges: false,
          apiContractChanges: false,
          notes: 'Hotfix applied. All services restored to healthy state.',
        },
      });

      // Mark incidents resolved
      this.incidents = this.incidents.map((inc) => ({
        ...inc,
        status: 'resolved',
      }));

      this.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        severity: 'INFO',
        service: 'API',
        message: 'System recovery complete. All health checks passed 200 OK.',
      });
    }

    return this.getDashboardData();
  }

  resetDemoData() {
    this.services = [...initialServices];
    this.deployments = [...initialDeployments];
    this.logs = [...initialLogs];
    this.incidents = [...initialIncidents];
    this.metrics = [...initialMetrics];
    this.failureSimulated = false;
    return this.getDashboardData();
  }

  addDeployment(dep: Partial<Deployment>): Deployment {
    const newDep: Deployment = {
      id: `dep-${this.deployments.length + 1}`,
      version: dep.version || `v2.4.${this.deployments.length + 1}`,
      environment: dep.environment || 'Production',
      status: dep.status || 'healthy',
      duration: dep.duration || '2m 10s',
      riskScore: dep.riskScore ?? 12,
      riskLevel: dep.riskLevel || 'LOW',
      created: 'Just now',
      buildSuccess: dep.buildSuccess ?? true,
      deploySuccess: dep.deploySuccess ?? true,
      healthCheckPassed: dep.healthCheckPassed ?? true,
      commitHash: dep.commitHash || 'a1b2c3d',
      author: dep.author || 'Developer',
      timeline: dep.timeline || [
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), message: 'Deployment created', status: 'success' },
      ],
      changes: dep.changes || {
        envVarsChanged: false,
        dependencyChangesCount: 0,
        schemaChanges: false,
        apiContractChanges: false,
      },
    };
    this.deployments.unshift(newDep);
    return newDep;
  }
}

export const dbStore = new DataStore();
