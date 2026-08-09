import React, { useState, useEffect } from 'react';
import { fetchDashboardData } from './services/apiClient.js';
import { AppDashboardData } from './types/index.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';
import { DemoControlsModal } from './components/demo/DemoControlsModal.js';

import { DashboardPage } from './pages/DashboardPage.js';
import { DeploymentsPage } from './pages/DeploymentsPage.js';
import { DeploymentDetailsPage } from './pages/DeploymentDetailsPage.js';
import { LogsPage } from './pages/LogsPage.js';
import { IncidentsPage } from './pages/IncidentsPage.js';
import { IncidentDetailsPage } from './pages/IncidentDetailsPage.js';
import { ServicesPage } from './pages/ServicesPage.js';
import { AssistantPage } from './pages/AssistantPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [activeEnv, setActiveEnv] = useState<string>('Production');
  const [dashboardData, setDashboardData] = useState<AppDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoControlsOpen, setIsDemoControlsOpen] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Browser navigation popstate handler
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  const renderCurrentPage = () => {
    if (currentPath === '/') {
      return (
        <DashboardPage
          data={dashboardData}
          loading={loading}
          onNavigate={navigateTo}
          onOpenDemoControls={() => setIsDemoControlsOpen(true)}
          onRefresh={loadData}
        />
      );
    }

    if (currentPath === '/deployments') {
      return <DeploymentsPage onNavigate={navigateTo} />;
    }

    if (currentPath.startsWith('/deployments/')) {
      const depId = currentPath.replace('/deployments/', '');
      return <DeploymentDetailsPage deploymentId={depId} onNavigate={navigateTo} />;
    }

    if (currentPath === '/logs') {
      return <LogsPage onNavigate={navigateTo} />;
    }

    if (currentPath === '/incidents') {
      return <IncidentsPage onNavigate={navigateTo} />;
    }

    if (currentPath.startsWith('/incidents/')) {
      const incId = currentPath.replace('/incidents/', '');
      return <IncidentDetailsPage incidentId={incId} onNavigate={navigateTo} />;
    }

    if (currentPath === '/services') {
      return <ServicesPage onNavigate={navigateTo} />;
    }

    if (currentPath.startsWith('/services/')) {
      const srvId = currentPath.replace('/services/', '');
      return <ServicesPage onNavigate={navigateTo} selectedServiceId={srvId} />;
    }

    if (currentPath === '/assistant') {
      return <AssistantPage onNavigate={navigateTo} />;
    }

    if (currentPath === '/settings') {
      return <SettingsPage activeEnv={activeEnv} onChangeEnv={setActiveEnv} />;
    }

    return (
      <DashboardPage
        data={dashboardData}
        loading={loading}
        onNavigate={navigateTo}
        onOpenDemoControls={() => setIsDemoControlsOpen(true)}
        onRefresh={loadData}
      />
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans antialiased selection:bg-violet-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={navigateTo}
        onOpenDemoControls={() => setIsDemoControlsOpen(true)}
        isSimulatedFailure={dashboardData?.currentFailureSimulated}
      />

      {/* Main Content View Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <Header
          activeEnv={activeEnv}
          onChangeEnv={setActiveEnv}
          onOpenDemoControls={() => setIsDemoControlsOpen(true)}
          activeIncidentsCount={dashboardData?.activeIncidentsCount || 0}
        />

        <main className="flex-1 pb-12">{renderCurrentPage()}</main>
      </div>

      {/* Demo Controls Scenario Modal */}
      <DemoControlsModal
        isOpen={isDemoControlsOpen}
        onClose={() => setIsDemoControlsOpen(false)}
        onUpdateDashboard={(newDashboard) => {
          setDashboardData(newDashboard);
          loadData();
        }}
      />
    </div>
  );
}
