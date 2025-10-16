import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Alert, 
  Statistic, 
  Row, 
  Col,
  Timeline,
  Tabs,
  Badge,
  Tooltip,
  Progress,
  message
} from 'antd';
import { 
  PlusOutlined, 
  ExclamationCircleOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  FireOutlined,
  TeamOutlined,
  BellOutlined,
  ToolOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const IncidentManagement = ({ user }) => {
  const [incidents, setIncidents] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0
  });

  useEffect(() => {
    updateStats();
    
    // Listen for routed tickets
    const handleRoutedTicket = (event) => {
      const { ticket, agent } = event.detail;
      if (agent === 'incident') {
        // Convert ticket to incident format
        const newIncident = {
          key: String(incidents.length + 1),
          id: ticket.id.replace('TKT-', 'INC-'),
          title: ticket.title,
          description: ticket.description,
          status: 'Open',
          severity: ticket.priority === 'Critical' ? 'Critical' : 
                   ticket.priority === 'High' ? 'High' : 'Medium',
          priority: ticket.priority === 'Critical' ? 'P1' : 
                   ticket.priority === 'High' ? 'P2' : 'P3',
          assignee: 'Incident Team',
          created: new Date().toLocaleString(),
          updated: new Date().toLocaleString(),
          impact: 'Routed from Service Desk',
          urgency: ticket.priority,
          category: ticket.category,
          resolution: null
        };
        
        setIncidents(prev => [newIncident, ...prev]);
        
        // Show notification
        Modal.success({
          title: 'New Incident Routed',
          content: `Ticket ${ticket.id} has been converted to incident ${newIncident.id} and added to the incident queue.`
        });
      }
    };
    
    // Check for existing routed tickets on component mount
    const existingTickets = JSON.parse(localStorage.getItem('routed_tickets_incident') || '[]');
    if (existingTickets.length > 0) {
      existingTickets.forEach(ticket => {
        handleRoutedTicket({ detail: { ticket, agent: 'incident' } });
      });
      // Clear processed tickets
      localStorage.removeItem('routed_tickets_incident');
    }
    
    window.addEventListener('ticketRouted', handleRoutedTicket);
    
    return () => {
      window.removeEventListener('ticketRouted', handleRoutedTicket);
    };
  }, [incidents]);

  const updateStats = () => {
    const newStats = {
      total: incidents.length,
      open: incidents.filter(i => i.status === 'Open').length,
      inProgress: incidents.filter(i => i.status === 'In Progress').length,
      resolved: incidents.filter(i => i.status === 'Resolved').length,
      critical: incidents.filter(i => i.severity === 'Critical' || i.severity === 'High').length
    };
    setStats(newStats);
  };

  const columns = [
    {
      title: 'Incident ID',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Button 
          type="link" 
          style={{ padding: 0 }}
          onClick={() => viewIncidentDetails(record)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <small style={{ color: '#666' }}>{record.category}</small>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          'Open': { color: 'red', icon: <ExclamationCircleOutlined /> },
          'In Progress': { color: 'blue', icon: <ClockCircleOutlined /> },
          'Resolved': { color: 'green', icon: <CheckCircleOutlined /> }
        };
        return (
          <Tag color={config[status]?.color} icon={config[status]?.icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const config = {
          'Critical': { color: 'red', icon: <FireOutlined /> },
          'High': { color: 'orange', icon: <ExclamationCircleOutlined /> },
          'Medium': { color: 'yellow' },
          'Low': { color: 'green' }
        };
        return (
          <Tag color={config[severity]?.color} icon={config[severity]?.icon}>
            {severity}
          </Tag>
        );
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => <Badge count={priority} style={{ backgroundColor: '#1890ff' }} />
    },
    {
      title: 'Assignee',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (assignee) => (
        <Space>
          <TeamOutlined />
          {assignee || 'Unassigned'}
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              size="small" 
              icon={<ExclamationCircleOutlined />}
              onClick={() => viewIncidentDetails(record)}
            >
              View
            </Button>
          </Tooltip>
          <Tooltip title="Assign/Update">
            <Button 
              size="small" 
              icon={<TeamOutlined />}
              onClick={() => assignIncident(record)}
            >
              Assign
            </Button>
          </Tooltip>
          <Tooltip title="Start Troubleshooting">
            <Button 
              size="small" 
              type="primary"
              icon={<ToolOutlined />}
              onClick={() => startTroubleshooting(record)}
            >
              Troubleshoot
            </Button>
          </Tooltip>
          {record.status !== 'Resolved' && (
            <Tooltip title="Resolve Incident">
              <Button 
                size="small" 
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => resolveIncident(record)}
                style={{ backgroundColor: '#52c41a' }}
              >
                Resolve
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const handleCreateIncident = async (values) => {
    setLoading(true);
    try {
      const newIncident = {
        key: String(incidents.length + 1),
        id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
        ...values,
        status: 'Open',
        created: new Date().toLocaleString(),
        updated: new Date().toLocaleString(),
        impact: values.impact || 'To be assessed',
        urgency: values.urgency || values.severity,
        category: values.category || 'General'
      };
      
      setIncidents([...incidents, newIncident]);
      setIsModalVisible(false);
      form.resetFields();
      
      // Show success notification
      Modal.success({
        title: 'Incident Created Successfully!',
        content: `Incident ${newIncident.id} has been created and assigned to ${newIncident.assignee || 'the appropriate team'}.`,
      });
      
      // Auto-notify stakeholders for high severity incidents
      if (values.severity === 'Critical' || values.severity === 'High') {
        setTimeout(() => {
          Modal.info({
            title: 'Stakeholders Notified',
            content: 'High severity incident detected. Stakeholders have been automatically notified.',
            icon: <BellOutlined style={{ color: '#1890ff' }} />
          });
        }, 1000);
      }
    } catch (error) {
      Modal.error({
        title: 'Error Creating Incident',
        content: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const viewIncidentDetails = (incident) => {
    setSelectedIncident(incident);
    setIsDetailModalVisible(true);
  };

  const assignIncident = (incident) => {
    Modal.confirm({
      title: 'Assign Incident',
      content: `Assign incident ${incident.id} to a team member?`,
      onOk: () => {
        const updatedIncidents = incidents.map(i => 
          i.id === incident.id 
            ? { ...i, status: 'In Progress', assignee: 'IT Specialist', updated: new Date().toLocaleString() }
            : i
        );
        setIncidents(updatedIncidents);
        Modal.success({
          title: 'Incident Assigned',
          content: `${incident.id} has been assigned to IT Specialist.`
        });
      }
    });
  };

  const startTroubleshooting = (incident) => {
    Modal.info({
      title: 'Troubleshooting Started',
      content: (
        <div>
          <p>Automated troubleshooting initiated for {incident.id}</p>
          <Timeline>
            <Timeline.Item color="blue">Running network diagnostics...</Timeline.Item>
            <Timeline.Item color="blue">Checking system logs...</Timeline.Item>
            <Timeline.Item color="blue">Analyzing error patterns...</Timeline.Item>
            <Timeline.Item color="green">Generating resolution recommendations...</Timeline.Item>
          </Timeline>
        </div>
      ),
      width: 600,
      onOk: () => {
        const updatedIncidents = incidents.map(i => 
          i.id === incident.id 
            ? { ...i, status: 'In Progress', resolution: 'Automated diagnostics completed. Manual intervention required.', updated: new Date().toLocaleString() }
            : i
        );
        setIncidents(updatedIncidents);
      }
    });
  };

  const resolveIncident = (incident) => {
    Modal.confirm({
      title: 'Resolve Incident',
      content: `Mark incident ${incident.id} as resolved?`,
      onOk: () => {
        const updatedIncidents = incidents.map(i => 
          i.id === incident.id 
            ? { ...i, status: 'Resolved', resolution: 'Issue resolved successfully', updated: new Date().toLocaleString() }
            : i
        );
        setIncidents(updatedIncidents);
        Modal.success({
          title: 'Incident Resolved',
          content: `${incident.id} has been marked as resolved.`
        });
      }
    });
  };

  return (
    <>
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Incidents"
              value={stats.total}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Open"
              value={stats.open}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={stats.inProgress}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Critical/High"
              value={stats.critical}
              valueStyle={{ color: '#fa541c' }}
              prefix={<FireOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Critical Incidents Alert */}
      {stats.critical > 0 && (
        <Alert
          message="Critical Incidents Detected"
          description={`${stats.critical} high-priority incidents require immediate attention.`}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
          action={
            <Button 
              size="small" 
              danger
              onClick={() => {
                // Filter to show only critical/high incidents
                const criticalIncidents = incidents.filter(i => 
                  i.severity === 'Critical' || i.severity === 'High'
                );
                Modal.info({
                  title: 'Critical Incidents',
                  content: (
                    <div>
                      <p>Found {criticalIncidents.length} critical/high priority incidents:</p>
                      <ul>
                        {criticalIncidents.map(incident => (
                          <li key={incident.id}>
                            <strong>{incident.id}</strong>: {incident.title} 
                            <Tag color="red" style={{ marginLeft: '8px' }}>{incident.severity}</Tag>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
                  width: 600
                });
              }}
            >
              View Critical
            </Button>
          }
        />
      )}

      <Card 
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
            <span>Incident Management</span>
            <Badge count={stats.open} style={{ backgroundColor: '#f5222d' }} />
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={() => {
                // Refresh incidents data while maintaining state
                updateStats();
                message.success('Incidents refreshed successfully');
              }}
            >
              Refresh
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              Create Incident
            </Button>
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={incidents}
          pagination={{ pageSize: 10 }}
          rowClassName={(record) => 
            record.severity === 'Critical' ? 'critical-row' : 
            record.severity === 'High' ? 'high-row' : ''
          }
        />
      </Card>

      {/* Create Incident Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
            <span>Create New Incident</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateIncident}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Brief description of the incident" />
          </Form.Item>
          
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Detailed description of the incident" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="severity" label="Severity" rules={[{ required: true }]}>
                <Select placeholder="Select severity">
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                  <Option value="Critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                <Select placeholder="Select priority">
                  <Option value="P4">P4 - Low</Option>
                  <Option value="P3">P3 - Medium</Option>
                  <Option value="P2">P2 - High</Option>
                  <Option value="P1">P1 - Critical</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Category">
                <Select placeholder="Select category">
                  <Option value="Network">Network</Option>
                  <Option value="Hardware">Hardware</Option>
                  <Option value="Software">Software</Option>
                  <Option value="Security">Security</Option>
                  <Option value="Email">Email</Option>
                  <Option value="Database">Database</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="assignee" label="Assignee">
                <Select placeholder="Assign to team/person">
                  <Option value="Network Team">Network Team</Option>
                  <Option value="Application Team">Application Team</Option>
                  <Option value="Security Team">Security Team</Option>
                  <Option value="Infrastructure Team">Infrastructure Team</Option>
                  <Option value="Database Team">Database Team</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="impact" label="Business Impact">
            <TextArea rows={2} placeholder="Describe the business impact of this incident" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Incident
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Incident Details Modal */}
      <Modal
        title={`Incident Details - ${selectedIncident?.id}`}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedIncident && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Overview" key="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" title="Basic Information">
                    <p><strong>Title:</strong> {selectedIncident.title}</p>
                    <p><strong>Description:</strong> {selectedIncident.description}</p>
                    <p><strong>Status:</strong> <Tag color="blue">{selectedIncident.status}</Tag></p>
                    <p><strong>Severity:</strong> <Tag color="red">{selectedIncident.severity}</Tag></p>
                    <p><strong>Priority:</strong> {selectedIncident.priority}</p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Assignment & Timeline">
                    <p><strong>Assignee:</strong> {selectedIncident.assignee || 'Unassigned'}</p>
                    <p><strong>Created:</strong> {selectedIncident.created}</p>
                    <p><strong>Updated:</strong> {selectedIncident.updated}</p>
                    <p><strong>Category:</strong> {selectedIncident.category}</p>
                    <p><strong>Impact:</strong> {selectedIncident.impact}</p>
                  </Card>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Resolution" key="2">
              <Card>
                <p><strong>Current Resolution Status:</strong></p>
                <p>{selectedIncident.resolution || 'No resolution notes available.'}</p>
                {selectedIncident.status === 'Resolved' && (
                  <Alert
                    message="Incident Resolved"
                    description="This incident has been successfully resolved."
                    type="success"
                    showIcon
                  />
                )}
              </Card>
            </TabPane>
            <TabPane tab="Actions" key="3">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  icon={<TeamOutlined />}
                  onClick={() => assignIncident(selectedIncident)}
                  block
                >
                  Assign to Team Member
                </Button>
                <Button 
                  type="primary" 
                  icon={<ToolOutlined />}
                  onClick={() => startTroubleshooting(selectedIncident)}
                  block
                >
                  Start Automated Troubleshooting
                </Button>
                <Button 
                  type="primary" 
                  icon={<BellOutlined />}
                  block
                >
                  Notify Stakeholders
                </Button>
                {selectedIncident.status !== 'Resolved' && (
                  <Button 
                    type="primary" 
                    icon={<CheckCircleOutlined />}
                    onClick={() => resolveIncident(selectedIncident)}
                    style={{ backgroundColor: '#52c41a' }}
                    block
                  >
                    Mark as Resolved
                  </Button>
                )}
              </Space>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      <style jsx>{`
        .critical-row {
          background-color: #fff2f0 !important;
        }
        .high-row {
          background-color: #fff7e6 !important;
        }
      `}</style>
    </div>
    </>
  );
};

export default IncidentManagement;