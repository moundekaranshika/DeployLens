import { GoogleGenAI, Type } from '@google/genai';
import { AIAnalysis, LogEntry, Deployment, Incident, AppDashboardData } from '../../src/types/index.js';

let genAI: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.error('[GeminiService] Error instantiating GoogleGenAI:', err);
    }
  }
  return genAI;
}

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: 'High-level executive summary of the issue' },
    rootCause: { type: Type.STRING, description: 'Direct concise root cause explanation' },
    confidence: { type: Type.NUMBER, description: 'Confidence percentage from 0 to 100' },
    severity: { type: Type.STRING, description: 'Severity level: critical, warning, or info' },
    evidence: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Bullet points of concrete evidence found in logs/metrics',
    },
    likelyCauses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Top probable technical causes ranked by probability',
    },
    recommendedFixes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Actionable developer fixes to resolve the deployment issue',
    },
    nextSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Immediate verification steps for the developer',
    },
  },
  required: ['summary', 'rootCause', 'confidence', 'severity', 'evidence', 'likelyCauses', 'recommendedFixes', 'nextSteps'],
};

export async function analyzeLogs(logs: LogEntry[], serviceName?: string): Promise<AIAnalysis> {
  const ai = getGeminiClient();

  const formattedLogs = logs
    .slice(0, 30)
    .map((l) => `[${l.timestamp}] [${l.severity}] [${l.service}]: ${l.message}`)
    .join('\n');

  if (!ai) {
    console.log('[GeminiService] GEMINI_API_KEY not found or client uninitialized, using deterministic analysis fallback');
    return generateFallbackLogAnalysis(logs, serviceName);
  }

  try {
    const prompt = `You are DeployLens, an expert AI Deployment Reliability Copilot for Zerops deployments.
Analyze the following deployment logs and identify the root cause of any failures or anomalies.

Target Service: ${serviceName || 'All Services'}

LOGS:
${formattedLogs}

Please provide a precise, structured analysis in valid JSON format matching the schema.
Focus on identifying exact technical errors (e.g. ECONNREFUSED, database host mismatch, environment variable configuration, latency bottlenecks).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: ANALYSIS_SCHEMA,
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim()) as AIAnalysis;
      return parsed;
    }
  } catch (err) {
    console.error('[GeminiService] Log analysis call failed:', err);
  }

  return generateFallbackLogAnalysis(logs, serviceName);
}

export async function analyzeDeployment(
  deployment: Deployment,
  logs: LogEntry[]
): Promise<AIAnalysis> {
  const ai = getGeminiClient();

  const formattedLogs = logs
    .slice(0, 20)
    .map((l) => `[${l.timestamp}] [${l.severity}] [${l.service}]: ${l.message}`)
    .join('\n');

  if (!ai) {
    return generateFallbackDeploymentAnalysis(deployment);
  }

  try {
    const prompt = `You are DeployLens AI Copilot. Analyze this deployment and determine risk factors and potential root cause of failure.

DEPLOYMENT DETAILS:
- Version: ${deployment.version}
- Environment: ${deployment.environment}
- Status: ${deployment.status}
- Risk Score: ${deployment.riskScore}/100 (${deployment.riskLevel})
- Environment Vars Changed: ${deployment.changes.envVarsChanged}
- Dependency Changes: ${deployment.changes.dependencyChangesCount}
- Database Schema Changes: ${deployment.changes.schemaChanges}
- API Contract Changes: ${deployment.changes.apiContractChanges}
- Deployment Notes: ${deployment.changes.notes || 'None'}

RECENT DEPLOYMENT LOGS:
${formattedLogs}

Provide a structured JSON diagnosis matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: ANALYSIS_SCHEMA,
      },
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as AIAnalysis;
    }
  } catch (err) {
    console.error('[GeminiService] Deployment analysis failed:', err);
  }

  return generateFallbackDeploymentAnalysis(deployment);
}

export async function analyzeIncident(
  incident: Incident,
  logs: LogEntry[]
): Promise<AIAnalysis> {
  const ai = getGeminiClient();

  if (!ai) {
    return (
      incident.diagnosis || {
        summary: incident.summary,
        rootCause: 'PostgreSQL database container is unreachable on port 5432.',
        confidence: incident.aiConfidence || 94,
        severity: incident.severity,
        evidence: [
          'Connection refused to PostgreSQL',
          'Database initialization failed during container boot',
          'Application startup aborted',
        ],
        likelyCauses: [
          '1. Incorrect DATABASE_URL environment variable',
          '2. PostgreSQL container service crashed or unavailable',
          '3. Network configuration or firewall port blocking',
        ],
        recommendedFixes: [
          'Verify DATABASE_URL and confirm that the database service is accessible from the API.',
          'Check Zerops environment variable configuration for postgres service hostname.',
          'Verify database container state in Zerops console.',
        ],
        nextSteps: [
          'Verify Environment Variables in Zerops GUI',
          'Check Database Health',
          'View Related Logs',
        ],
      }
    );
  }

  try {
    const formattedLogs = logs
      .slice(0, 20)
      .map((l) => `[${l.timestamp}] [${l.severity}] [${l.service}]: ${l.message}`)
      .join('\n');

    const prompt = `You are DeployLens AI Copilot. Generate an in-depth diagnosis for incident: "${incident.title}".

INCIDENT SUMMARY: ${incident.summary}
SEVERITY: ${incident.severity}
AFFECTED SERVICES: ${incident.affectedServices.join(', ')}

RECENT LOGS:
${formattedLogs}

Provide a structured JSON diagnosis matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: ANALYSIS_SCHEMA,
      },
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as AIAnalysis;
    }
  } catch (err) {
    console.error('[GeminiService] Incident analysis failed:', err);
  }

  return incident.diagnosis || generateFallbackLogAnalysis(logs);
}

export async function chatWithAssistant(
  message: string,
  history: { sender: string; text: string }[],
  appContext: AppDashboardData
): Promise<string> {
  const ai = getGeminiClient();

  const formattedHistory = history
    .slice(-6)
    .map((h) => `${h.sender === 'user' ? 'Developer' : 'DeployLens AI'}: ${h.text}`)
    .join('\n');

  const contextPrompt = `You are DeployLens, an AI Deployment Reliability Copilot for developers building and deploying apps on Zerops.
You are concise, developer-focused, technical, direct, and practical.

CURRENT APPLICATION HEALTH & METRICS CONTEXT:
- Health Score: ${appContext.healthScore.score}/100
- Active Incidents (${appContext.activeIncidentsCount}): ${appContext.recentIncidents
    .filter((i) => i.status !== 'resolved')
    .map((i) => `${i.title} (${i.severity.toUpperCase()})`)
    .join('; ') || 'None'}
- Service Statuses:
${appContext.services.map((s) => `  * ${s.name}: ${s.status.toUpperCase()} (Latency: ${s.latency}ms, Error Rate: ${s.errorRate}%)`).join('\n')}
- Recent Deployments:
${appContext.recentDeployments.slice(0, 5).map((d) => `  * #${d.id} (${d.version}, ${d.environment}): ${d.status.toUpperCase()} - Risk ${d.riskScore}/100`).join('\n')}

CONVERSATION HISTORY:
${formattedHistory}

DEVELOPER QUESTION: "${message}"

INSTRUCTIONS:
1. Answer clearly, accurately using the current application context provided above.
2. If the user asks about why a deployment failed or why a service is unhealthy, reference exact metrics, incidents, logs, or deployment changes.
3. Keep the answer structured using markdown formatting, code blocks if appropriate, bold headers, and bullet points.
4. Do not make up information that isn't provided. If data is missing, clearly state so.`;

  if (!ai) {
    return generateFallbackChatResponse(message, appContext);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contextPrompt,
    });

    if (response.text) {
      return response.text;
    }
  } catch (err) {
    console.error('[GeminiService] Chat with assistant failed:', err);
  }

  return generateFallbackChatResponse(message, appContext);
}

// Fallbacks for offline or unconfigured API Key mode
function generateFallbackLogAnalysis(logs: LogEntry[], serviceName?: string): AIAnalysis {
  const hasDbError = logs.some((l) => l.message.toLowerCase().includes('postgresql') || l.message.toLowerCase().includes('database') || l.message.toLowerCase().includes('connection refused'));

  if (hasDbError) {
    return {
      summary: 'PostgreSQL is unreachable from the API service during boot initialization.',
      rootCause: 'PostgreSQL is unreachable from the API service.',
      confidence: 94,
      severity: 'critical',
      evidence: [
        'Connection refused to PostgreSQL at 127.0.0.1:5432 / postgresql:5432',
        'Database initialization failed during API server boot sequence',
        'Application startup aborted with ECONNREFUSED exception',
      ],
      likelyCauses: [
        '1. Incorrect DATABASE_URL environment variable configuration in Zerops GUI',
        '2. PostgreSQL service container unavailable or restarting',
        '3. Internal Zerops network bridge or port 5432 firewall policy restriction',
      ],
      recommendedFixes: [
        'Verify DATABASE_URL and confirm that the database service is accessible from the API container.',
        'Check Zerops environment settings for postgres container hostname.',
        'Confirm PostgreSQL container status on Zerops console.',
      ],
      nextSteps: [
        'Verify Environment Variables',
        'Check Database Health',
        'View Related Logs',
      ],
    };
  }

  return {
    summary: `Log analysis complete for ${serviceName || 'all services'}. System operating within nominal parameters.`,
    rootCause: 'No critical errors or fatal exception traces detected in recent logs.',
    confidence: 96,
    severity: 'info',
    evidence: [
      'HTTP health probes returned 200 OK across active instances',
      'Database query execution latency averages 42ms',
      'Error rate remains below 0.05% threshold',
    ],
    likelyCauses: [
      '1. Standard operational logging without critical exceptions',
      '2. Routine background task processing',
    ],
    recommendedFixes: [
      'Maintain standard automated health monitoring on Zerops',
      'Ensure log retention alerts are enabled for ERROR level logs',
    ],
    nextSteps: [
      'Monitor real-time metrics',
      'Review service latency trends',
    ],
  };
}

function generateFallbackDeploymentAnalysis(deployment: Deployment): AIAnalysis {
  if (deployment.status === 'failed' || deployment.riskScore > 70) {
    return {
      summary: `Deployment ${deployment.version} encountered a critical deployment health failure during runtime verification.`,
      rootCause: 'Environment variable and database connection pooling configuration mismatch following container startup.',
      confidence: 92,
      severity: 'critical',
      evidence: [
        `Deployment Risk Score: ${deployment.riskScore}/100 (${deployment.riskLevel})`,
        `Environment Variables Changed: ${deployment.changes.envVarsChanged}`,
        `Database Schema Changes: ${deployment.changes.schemaChanges}`,
        'Container health probe failed on port 3000',
      ],
      likelyCauses: [
        '1. DATABASE_URL or environment secret mismatch',
        '2. Pending database migration required prior to API startup',
        '3. Missing environment variable dependency in Zerops configuration',
      ],
      recommendedFixes: [
        'Check Zerops environment secrets and re-verify DATABASE_URL value',
        'Roll back to previous healthy deployment version',
        'Run database migrations before launching API containers',
      ],
      nextSteps: [
        'Verify Environment Variables',
        'Check Deployment Timeline',
        'Review Container Logs',
      ],
    };
  }

  return {
    summary: `Deployment ${deployment.version} passed all automated health checks and risk evaluations successfully.`,
    rootCause: 'No deployment anomalies or environment risks detected.',
    confidence: 98,
    severity: 'info',
    evidence: [
      `Risk score evaluated at ${deployment.riskScore}/100 (LOW RISK)`,
      'All container health probes returned HTTP 200 OK',
      'Zero schema breaking changes detected',
    ],
    likelyCauses: ['Clean deployment release with standard dependency updates'],
    recommendedFixes: ['No action required. Deployment is healthy and actively serving traffic.'],
    nextSteps: ['Monitor latency metrics for post-deploy anomalies'],
  };
}

function generateFallbackChatResponse(message: string, appContext: AppDashboardData): string {
  const msg = message.toLowerCase();

  if (msg.includes('22') || msg.includes('fail')) {
    return `### 🚨 Deployment #22 Failure Analysis

**Root Cause:**
PostgreSQL is unreachable from the API service.

**Key Evidence:**
- **Status:** FAILED
- **Risk Score:** 78/100 (HIGH RISK)
- **Error Logs:** \`Connection refused to PostgreSQL\`
- **Changes Detected:** Environment variables changed (\`DATABASE_URL\`), 5 dependency changes, database schema migration.

**Recommended Fix:**
1. Verify \`DATABASE_URL\` in Zerops environment configuration.
2. Confirm PostgreSQL container is running on port \`5432\`.
3. Roll back to healthy deployment **#21 (v2.3.8)** or apply fixed connection string.`;
  }

  if (msg.includes('safe') || msg.includes('latest')) {
    const latest = appContext.recentDeployments[0];
    return `### 🛡️ Latest Deployment Status (${latest?.version || 'v2.4.1'})

**Status:** ${latest?.status?.toUpperCase() || 'HEALTHY'}
**Risk Score:** ${latest?.riskScore || 12}/100 (${latest?.riskLevel || 'LOW RISK'})

All container health probes passed successfully. Current application Health Score is **${appContext.healthScore.score}/100**.`;
  }

  if (msg.includes('unhealthy') || msg.includes('service')) {
    const unhealthy = appContext.services.filter((s) => s.status !== 'healthy');
    if (unhealthy.length === 0) {
      return `All services (**API**, **Frontend**, **PostgreSQL**, **Background Worker**) are currently **● Healthy** with 99.92% overall uptime!`;
    }
    return `### ⚠️ Unhealthy Services Detected

${unhealthy.map((s) => `- **${s.name}**: Status **${s.status.toUpperCase()}** (Latency: ${s.latency}ms, Error Rate: ${s.errorRate}%)`).join('\n')}

Click **Simulate Database Failure** or check the **Services** tab for detailed diagnostic logs.`;
  }

  return `### 🤖 DeployLens Reliability Assistant

I am keeping track of your application health (**Score: ${appContext.healthScore.score}/100**).

Here is a quick snapshot:
- **Active Incidents:** ${appContext.activeIncidentsCount}
- **Services:** ${appContext.services.map((s) => `${s.name}: ${s.status}`).join(', ')}
- **Latest Version:** ${appContext.recentDeployments[0]?.version || 'v2.4.1'}

How can I help you troubleshoot or analyze your deployments on Zerops today?`;
}
