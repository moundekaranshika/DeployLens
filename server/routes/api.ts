import { Router, Request, Response } from 'express';
import { dbStore } from '../database/db.js';
import {
  analyzeLogs,
  analyzeDeployment,
  analyzeIncident,
  chatWithAssistant,
} from '../ai/geminiService.js';

const router = Router();

// GET /api/dashboard
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    const data = dbStore.getDashboardData();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch dashboard data', message: err.message });
  }
});

// GET /api/deployments
router.get('/deployments', (req: Request, res: Response) => {
  try {
    const deployments = dbStore.getDeployments();
    res.json(deployments);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch deployments', message: err.message });
  }
});

// GET /api/deployments/:id
router.get('/deployments/:id', (req: Request, res: Response) => {
  try {
    const deployment = dbStore.getDeploymentById(req.params.id);
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    res.json(deployment);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch deployment', message: err.message });
  }
});

// POST /api/deployments
router.post('/deployments', (req: Request, res: Response) => {
  try {
    const newDep = dbStore.addDeployment(req.body);
    res.status(201).json(newDep);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create deployment', message: err.message });
  }
});

// GET /api/logs
router.get('/logs', (req: Request, res: Response) => {
  try {
    const { q, severity, service } = req.query;
    const logs = dbStore.getLogs(
      typeof q === 'string' ? q : undefined,
      typeof severity === 'string' ? severity : undefined,
      typeof service === 'string' ? service : undefined
    );
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch logs', message: err.message });
  }
});

// GET /api/incidents
router.get('/incidents', (req: Request, res: Response) => {
  try {
    const incidents = dbStore.getIncidents();
    res.json(incidents);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch incidents', message: err.message });
  }
});

// GET /api/incidents/:id
router.get('/incidents/:id', (req: Request, res: Response) => {
  try {
    const incident = dbStore.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch incident', message: err.message });
  }
});

// GET /api/services
router.get('/services', (req: Request, res: Response) => {
  try {
    const services = dbStore.getServices();
    res.json(services);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch services', message: err.message });
  }
});

// GET /api/services/:id
router.get('/services/:id', (req: Request, res: Response) => {
  try {
    const service = dbStore.getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    const serviceLogs = dbStore.getLogs(undefined, undefined, service.name);
    res.json({ service, logs: serviceLogs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch service details', message: err.message });
  }
});

// GET /api/metrics
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const metrics = dbStore.getMetrics();
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch metrics', message: err.message });
  }
});

// POST /api/ai/analyze-logs
router.post('/ai/analyze-logs', async (req: Request, res: Response) => {
  try {
    const { service, severity, query } = req.body;
    const logs = dbStore.getLogs(query, severity, service);
    const analysis = await analyzeLogs(logs, service);
    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: 'Log analysis failed', message: err.message });
  }
});

// POST /api/ai/analyze-deployment
router.post('/ai/analyze-deployment', async (req: Request, res: Response) => {
  try {
    const { deploymentId } = req.body;
    const deployment = dbStore.getDeploymentById(deploymentId) || dbStore.getDeployments()[0];
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    const logs = dbStore.getLogs();
    const analysis = await analyzeDeployment(deployment, logs);
    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: 'Deployment analysis failed', message: err.message });
  }
});

// POST /api/ai/analyze-incident
router.post('/ai/analyze-incident', async (req: Request, res: Response) => {
  try {
    const { incidentId } = req.body;
    const incident = dbStore.getIncidentById(incidentId) || dbStore.getIncidents()[0];
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    const logs = dbStore.getLogs();
    const analysis = await analyzeIncident(incident, logs);
    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: 'Incident analysis failed', message: err.message });
  }
});

// POST /api/ai/chat
router.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    const appContext = dbStore.getDashboardData();
    const reply = await chatWithAssistant(message, history || [], appContext);
    res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: 'AI Assistant chat failed', message: err.message });
  }
});

// POST /api/demo/simulate-failure
router.post('/demo/simulate-failure', (req: Request, res: Response) => {
  try {
    const type = req.body.type || 'database';
    const updatedDashboard = dbStore.simulateFailureScenario(type);
    res.json({
      message: `Simulated failure scenario (${type}) triggered successfully`,
      dashboard: updatedDashboard,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to simulate failure', message: err.message });
  }
});

// POST /api/demo/reset
router.post('/demo/reset', (req: Request, res: Response) => {
  try {
    const resetDashboard = dbStore.resetDemoData();
    res.json({
      message: 'Demo state reset successfully',
      dashboard: resetDashboard,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset demo state', message: err.message });
  }
});

export default router;
