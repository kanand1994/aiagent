import React, { useState, useEffect } from 'react';
import { Layout, Spin, Alert } from 'antd';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ServiceDesk from './components/ServiceDesk';
import IncidentManagement from './components/IncidentManagement';
import RequestFulfillment from './components/RequestFulfillment';
import ProblemManagement from './components/ProblemManagement';
import ChangeManagement from './components/ChangeManagement';
import AssetManagement from './components/AssetManagement';
import ApplicationInstallation from './components/ApplicationInstallation';
import VMManagement from './components/VMManagement';
import TemplateManagement from './components/TemplateManagement';
import PatchManagement from './components/PatchManagement';
import UserAccessManagement from './components/UserAccessManagement';
import OSManagement from './components/OSManagement';
import ReportsAnalytics from './components/ReportsAnalytics';
import ProfileSettings from './components/ProfileSettings';
import Preferences from './components/Preferences';
import Notifications from './components/Notifications';
import dataService from './services/dataService';
import './App.css';

const { Content } = Layout;

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize data service
      await dataService.initialize();
      
      // Check for existing authentication
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          // Invalid stored data, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
    } catch (err) {
      console.error('Failed to initialize app:', err);
      setError('Failed to initialize application. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const renderCurrentPage = () => {
    const pageProps = { user, onNavigate: handlePageChange };

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard {...pageProps} />;
      case 'service-desk':
        return <ServiceDesk {...pageProps} />;
      case 'incident-management':
        return <IncidentManagement {...pageProps} />;
      case 'request-fulfillment':
        return <RequestFulfillment {...pageProps} />;
      case 'problem-management':
        return <ProblemManagement {...pageProps} />;
      case 'change-management':
        return <ChangeManagement {...pageProps} />;
      case 'asset-management':
        return <AssetManagement {...pageProps} />;
      case 'application-installation':
        return <ApplicationInstallation {...pageProps} />;
      case 'vm-management':
        return <VMManagement {...pageProps} />;
      case 'template-management':
        return <TemplateManagement {...pageProps} />;
      case 'patch-management':
        return <PatchManagement {...pageProps} />;
      case 'user-access-management':
        return <UserAccessManagement {...pageProps} />;
      case 'os-management':
        return <OSManagement {...pageProps} />;
      case 'reports-analytics':
        return <ReportsAnalytics {...pageProps} />;
      case 'profile-settings':
        return <ProfileSettings {...pageProps} />;
      case 'preferences':
        return <Preferences {...pageProps} />;
      case 'notifications':
        return <Notifications {...pageProps} />;
      default:
        return <Dashboard {...pageProps} />;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, fontSize: '16px', color: '#666' }}>
          Initializing IT Automation Platform...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '50px' }}>
        <Alert
          message="Application Error"
          description={error}
          type="error"
          showIcon
          action={
            <button onClick={initializeApp} style={{ 
              background: '#1890ff', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Retry
            </button>
          }
        />
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navigation
        user={user}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        onLogout={handleLogout}
      />
      
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 112px)',
          overflow: 'auto'
        }}>
          {renderCurrentPage()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;