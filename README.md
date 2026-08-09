# DeployLens — AI Deployment Reliability Copilot

> **See the failure. Understand the cause. Fix the deployment.**

Built for the **Zerops Challenge by WeMakeDevs**.

DeployLens is an AI-powered deployment reliability copilot that analyzes application health, logs, performance metrics, and deployment changes to automatically perform root-cause analysis, calculate risk scores, and recommend precise fixes for deployment failures.

---

## 🎯 The Problem

When a deployment fails or degrades performance, developers waste precious time digging through fragmented log files, checking service statuses across multiple dashboards, comparing environment variable diffs, and guessing the root cause under high-stress incident conditions.

## 🚀 The Solution

DeployLens consolidates deployment telemetry into a single intelligent platform powered by Google's **Gemini 3.6 Flash**. 

```text
Deployment Triggered
       ↓
Health Monitoring & Probes
       ↓
Centralized Log Collection
       ↓
Anomaly Detection
       ↓
Gemini AI Root-Cause Analysis
       ↓
Deployment Risk Score (0–100)
       ↓
Recommended Fix & Playbook
```

---

## ✨ Key Features

1. **AI Root-Cause Analysis (`@google/genai`)**:
   - Analyzes application logs, error traces, and deployment changes.
   - Provides clear root causes, confidence scores (e.g. 94%), observed evidence, and step-by-step fix recommendations.

2. **Transparent System Health Score**:
   - Calculates a 0–100 Health Score with explicit mathematical penalties for error spikes, high latency, and active incidents.

3. **Deployment Risk Matrix**:
   - Evaluates changes in environment variables, database schemas, and API contracts to compute risk scores before and after deployment.

4. **Centralized Log Viewer**:
   - Real-time log stream aggregator with severity filtering (INFO, WARN, ERROR, FATAL) and one-click `[ Analyze with Gemini ]` button.

5. **Interactive Demo Mode & Failure Simulator**:
   - Built-in simulation engine for hackathon evaluation (`Simulate Database Failure`, `High Latency Spike`, `API Error Spike`, `Deploy Healthy Version`).

---

## 🏗️ Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Motion.
- **Backend**: Express.js server (`server.ts`) hosting REST API routes and serving production static assets.
- **AI Engine**: `@google/genai` TypeScript SDK running Gemini 3.6 Flash server-side.
- **Persistence**: In-memory state store with PostgreSQL adapter capability for local/production persistence.
- **Deployment**: Built for **Zerops Cloud** with `zerops.yaml` and standard Docker support.

---

## 🛠️ Local Development & Quick Start

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   DEMO_MODE=true
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## ☁️ Deploying on Zerops

1. Create a project in [Zerops](https://zerops.io).
2. Import `zerops.yaml` into your Zerops project setup.
3. Configure the `GEMINI_API_KEY` secret in Zerops environment variables.
4. Deploy the Node.js runtime service.

---

## 🛡️ License

Apache-2.0 License. Built with ❤️ for WeMakeDevs Zerops Challenge.
