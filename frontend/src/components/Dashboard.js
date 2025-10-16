import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, List, Badge, Timeline, Button, Spin, Alert } from 'antd';
import {
  ArrowUpOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  CloudServerOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AIAssistant from './AIAssistant';
import dataService from '../services/dataService';

const Dashboard = ({ user, onNavigate }) => {
  const [metrics, setMetrics] = useState({
    totalTickets: 0,
    openIncidents: 0,
    pendingChanges: 0,
    systemUptime: 0,
    avgResolutionTime: 0,
    automationRate: 0
  });
  const [ticketTrendData, setTicketTrendData] = useState([]);
  const [incidentsByCategory, setIncidentsByCategory] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [systemPerformance, setSystemPerformance] = useState({ cpu: 0, memory: 0, disk: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadDashboardData();

    // Set up real-time updates
    dataService.connectWebSocket();
    dataService.subscribe('metrics_update', handleMetricsUpdate);
    dataService.subscribe('new_incident', handleNewIncident);
    dataService.subscribe('new_ticket', handleNewTicket);

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);

    return () => {
      clearInterval(interval);
      dataService.unsubscribe('metrics_update', handleMetricsUpdate);
      dataService.unsubscribe('new_incident', handleNewIncident);
      dataService.unsubscribe('new_ticket', handleNewTicket);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        metricsData,
        trendsData,
        incidentsData,
        activitiesData,
        alertsData,
        performanceData
      ] = await Promise.all([
        dataService.getDashboardMetrics(),
        dataService.getTicketTrends(),
        dataService.apiCall('/api/dashboard/incidents-by-category'),
        dataService.apiCall('/api/dashboard/recent-activities'),
        dataService.getCriticalAlerts(),
        dataService.getSystemPerformance()
      ]);

      setMetrics(metricsData);
      setTicketTrendData(trendsData);
      setIncidentsByCategory(incidentsData);
      setRecentActivities(activitiesData);
      setCriticalAlerts(alertsData);
      setSystemPerformance(performanceData);
      setLastUpdated(new Date());

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please check your connection.');

      // Set empty data instead of mock data
      setMetrics({
        totalTickets: 0,
        openIncidents: 0,
        pendingChanges: 0,
        systemUptime: 0,
        avgResolutionTime: 0,
        automationRate: 0
      });
      setTicketTrendData([
        { name: 'Mon', tickets: 0, resolved: 0 },
        { name: 'Tue', tickets: 0, resolved: 0 },
        { name: 'Wed', tickets: 0, resolved: 0 },
        { name: 'Thu', tickets: 0, resolved: 0 },
        { name: 'Fri', tickets: 0, resolved: 0 },
        { name: 'Sat', tickets: 0, resolved: 0 },
        { name: 'Sun', tickets: 0, resolved: 0 }
      ]);
      setIncidentsByCategory([]);
      setRecentActivities([]);
      setCriticalAlerts([]);
      setSystemPerformance({ cpu: 0, memory: 0, disk: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleMetricsUpdate = (data) => {
    setMetrics(prev => ({ ...prev, ...data }));
    setLastUpdated(new Date());
  };

  const handleNewIncident = (data) => {
    setMetrics(prev => ({ ...prev, openIncidents: prev.openIncidents + 1 }));
    setRecentActivities(prev => [
      { type: 'incident', title: `New incident: ${data.title}`, time: 'Just now', status: 'processing' },
      ...prev.slice(0, 3)
    ]);
  };

  const handleNewTicket = (data) => {
    setMetrics(prev => ({ ...prev, totalTickets: prev.totalTickets + 1 }));
    setRecentActivities(prev => [
      { type: 'ticket', title: `New ticket: ${data.title}`, time: 'Just now', status: 'processing' },
      ...prev.slice(0, 3)
    ]);
  };



  if (loading && !metrics.totalTickets) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <Alert
          message="Data Loading Issue"
          description={error}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={loadDashboardData} icon={<ReloadOutlined />}>
              Retry
            </Button>
          }
        />
      )}

      {/* Last Updated Info */}
      <div style={{ textAlign: 'right', marginBottom: 8, color: '#666', fontSize: '12px' }}>
        Last updated: {lastUpdated.toLocaleTimeString()}
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={loadDashboardData}
          loading={loading}
          style={{ marginLeft: 8 }}
        >
          Refresh
        </Button>
      </div>

      {/* AI Assistant Section - Only for IT staff, not end users */}
      {user && user.role !== 'End User' && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <AIAssistant user={user} onNavigate={onNavigate} />
          </Col>
        </Row>
      )}

      {/* End User Quick Actions */}
      {user && user.role === 'End User' && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card
              title="Quick Actions"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
              headStyle={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={() => window.location.href = '/service-desk'}
                    style={{ height: '60px', background: 'rgba(255,255,255,0.2)', border: 'none' }}
                  >
                    <div>
                      <CustomerServiceOutlined style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }} />
                      Create Ticket
                    </div>
                  </Button>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={() => window.location.href = '/requests'}
                    style={{ height: '60px', background: 'rgba(255,255,255,0.2)', border: 'none' }}
                  >
                    <div>
                      <FileTextOutlined style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }} />
                      Request Software
                    </div>
                  </Button>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={() => window.location.href = '/vms'}
                    style={{ height: '60px', background: 'rgba(255,255,255,0.2)', border: 'none' }}
                  >
                    <div>
                      <CloudServerOutlined style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }} />
                      Request VM
                    </div>
                  </Button>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={() => window.location.href = '/service-desk'}
                    style={{ height: '60px', background: 'rgba(255,255,255,0.2)', border: 'none' }}
                  >
                    <div>
                      <UserOutlined style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }} />
                      Get Support
                    </div>
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* IT Staff Dashboard - Show detailed metrics and charts */}
      {user && user.role !== 'user' && (
        <><Row gutter={[16, 16]}>
          {/* Key Metrics */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Tickets"
                value={metrics.totalTickets}
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: '#3f8600' }}
                suffix="↑" />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Open Incidents"
                value={metrics.openIncidents}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="System Uptime"
                value={metrics.systemUptime}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Automation Rate"
                value={metrics.automationRate}
                suffix="%"
                valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
        </Row><Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {/* Ticket Trends */}
            <Col xs={24} lg={16}>
              <Card title="Ticket Trends (Last 7 Days)" style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ticketTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="tickets" stroke="#1890ff" strokeWidth={2} />
                    <Line type="monotone" dataKey="resolved" stroke="#52c41a" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Incidents by Category */}
            <Col xs={24} lg={8}>
              <Card title="Incidents by Category" style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={incidentsByCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {incidentsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row><Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {/* Recent Activities */}
            <Col xs={24} lg={12}>
              <Card title="Recent Activities" style={{ height: 350 }}>
                <Timeline>
                  {recentActivities.map((activity, index) => (
                    <Timeline.Item
                      key={index}
                      color={activity.status === 'success' ? 'green' : 'blue'}
                      dot={activity.status === 'success' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{activity.title}</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>{activity.time}</div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>

            {/* Critical Alerts */}
            <Col xs={24} lg={12}>
              <Card title="Critical Alerts" style={{ height: 350 }}>
                <List
                  dataSource={criticalAlerts}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Badge
                          status={item.severity === 'high' ? 'error' : 'warning'}
                          icon={item.severity === 'high' ? <ExclamationCircleOutlined /> : <WarningOutlined />} />}
                        title={item.message}
                        description={item.time} />
                    </List.Item>
                  )} />
              </Card>
            </Col>
          </Row><Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {/* Performance Metrics */}
            <Col xs={24}>
              <Card title="System Performance">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ marginBottom: 8 }}>CPU Usage</div>
                      <Progress type="circle" percent={65} strokeColor="#52c41a" />
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ marginBottom: 8 }}>Memory Usage</div>
                      <Progress type="circle" percent={78} strokeColor="#faad14" />
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ marginBottom: 8 }}>Disk Usage</div>
                      <Progress type="circle" percent={45} strokeColor="#1890ff" />
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row></>
      )}

      {/* End User Dashboard - Show simple status message */}
      {user && user.role === 'user' && (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              title="Your IT Support Status"
              style={{ textAlign: 'center', padding: '40px 20px' }}
            >
              <div style={{ fontSize: '16px', marginBottom: '20px' }}>
                Welcome to the IT Support Portal! Use the quick actions above to:
              </div>
              <Row gutter={[16, 16]} justify="center">
                <Col xs={24} sm={12} md={6}>
                  <div style={{ padding: '20px', background: '#f0f2f5', borderRadius: '8px', marginBottom: '16px' }}>
                    <CustomerServiceOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                    <div><strong>Create Tickets</strong></div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Report issues or request help</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ padding: '20px', background: '#f0f2f5', borderRadius: '8px', marginBottom: '16px' }}>
                    <FileTextOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                    <div><strong>Request Software</strong></div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Install approved applications</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ padding: '20px', background: '#f0f2f5', borderRadius: '8px', marginBottom: '16px' }}>
                    <CloudServerOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: '8px' }} />
                    <div><strong>Request VM</strong></div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Get virtual machine access</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ padding: '20px', background: '#f0f2f5', borderRadius: '8px', marginBottom: '16px' }}>
                    <UserOutlined style={{ fontSize: '24px', color: '#fa8c16', marginBottom: '8px' }} />
                    <div><strong>Get Support</strong></div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Chat with our support team</div>
                  </div>
                </Col>
              </Row>
              <Alert
                message="Need Help?"
                description="Our IT support team is here to help you with any technical issues or requests. Simply create a ticket and we'll get back to you as soon as possible."
                type="info"
                showIcon
                style={{ marginTop: '20px' }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dashboard;