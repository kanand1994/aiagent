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
  Row,
  Col,
  Statistic,
  Alert,
  Timeline,
  Tabs,
  Badge,
  Tooltip,
  Progress,
  List,
  Avatar,
  message
} from 'antd';
import {
  PlusOutlined,
  BugOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  LinkOutlined,
  BarChartOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  TeamOutlined,
  ToolOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const ProblemManagement = ({ user }) => {
  const [problems, setProblems] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    high: 0
  });

  useEffect(() => {
    updateStats();
    
    // Listen for routed tickets
    const handleRoutedTicket = (event) => {
      const { ticket, agent } = event.detail;
      if (agent === 'problem') {
        // Convert ticket to problem format
        const newProblem = {
          key: String(problems.length + 1),
          id: ticket.id.replace('TKT-', 'PRB-'),
          title: ticket.title,
          description: ticket.description,
          status: 'Open',
          priority: ticket.priority,
          category: ticket.category,
          assignee: 'Problem Team',
          created: new Date().toLocaleString(),
          updated: new Date().toLocaleString(),
          relatedIncidents: [],
          rootCause: null,
          workaround: null,
          impact: 'Routed from Service Desk'
        };
        
        setProblems(prev => [newProblem, ...prev]);
        
        // Show notification
        Modal.success({
          title: 'New Problem Routed',
          content: `Ticket ${ticket.id} has been converted to problem ${newProblem.id} and added to the problem queue.`
        });
      }
    };
    
    // Check for existing routed tickets on component mount
    const existingTickets = JSON.parse(localStorage.getItem('routed_tickets_problem') || '[]');
    if (existingTickets.length > 0) {
      existingTickets.forEach(ticket => {
        handleRoutedTicket({ detail: { ticket, agent: 'problem' } });
      });
      // Clear processed tickets
      localStorage.removeItem('routed_tickets_problem');
    }
    
    window.addEventListener('ticketRouted', handleRoutedTicket);
    
    return () => {
      window.removeEventListener('ticketRouted', handleRoutedTicket);
    };
  }, [problems]);

  const updateStats = () => {
    const newStats = {
      total: problems.length,
      open: problems.filter(p => p.status === 'Open').length,
      inProgress: problems.filter(p => p.status === 'In Progress').length,
      resolved: problems.filter(p => p.status === 'Resolved').length,
      high: problems.filter(p => p.priority === 'High').length
    };
    setStats(newStats);
  };

  const columns = [
    {
      title: 'Problem ID',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => viewProblemDetails(record)}
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
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const config = {
          'High': { color: 'red', icon: <FireOutlined /> },
          'Medium': { color: 'orange' },
          'Low': { color: 'green' }
        };
        return (
          <Tag color={config[priority]?.color} icon={config[priority]?.icon}>
            {priority}
          </Tag>
        );
      },
    },
    {
      title: 'Related Incidents',
      dataIndex: 'relatedIncidents',
      key: 'relatedIncidents',
      render: (incidents) => (
        <Badge count={incidents?.length || 0} style={{ backgroundColor: '#1890ff' }} />
      ),
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
              icon={<BugOutlined />}
              onClick={() => viewProblemDetails(record)}
            >
              View
            </Button>
          </Tooltip>
          <Tooltip title="Root Cause Analysis">
            <Button
              size="small"
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => startRootCauseAnalysis(record)}
            >
              Analyze
            </Button>
          </Tooltip>
          <Tooltip title="Link Incidents">
            <Button
              size="small"
              icon={<LinkOutlined />}
              onClick={() => linkIncidents(record)}
            >
              Link
            </Button>
          </Tooltip>
          {record.status !== 'Resolved' && (
            <Tooltip title="Resolve Problem">
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => resolveProblem(record)}
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

  const handleCreateProblem = async (values) => {
    setLoading(true);
    try {
      const newProblem = {
        key: String(problems.length + 1),
        id: `PRB-${String(problems.length + 1).padStart(3, '0')}`,
        ...values,
        status: 'Open',
        created: new Date().toLocaleString(),
        updated: new Date().toLocaleString(),
        relatedIncidents: [],
        rootCause: null,
        workaround: null
      };

      setProblems([...problems, newProblem]);
      setIsModalVisible(false);
      form.resetFields();

      // Show success notification
      Modal.success({
        title: 'Problem Record Created Successfully!',
        content: `Problem ${newProblem.id} has been created and assigned to ${newProblem.assignee || 'the appropriate team'}.`,
      });

      // Auto-start analysis for high priority problems
      if (values.priority === 'High') {
        setTimeout(() => {
          startRootCauseAnalysis(newProblem);
        }, 1000);
      }
    } catch (error) {
      Modal.error({
        title: 'Error Creating Problem',
        content: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const viewProblemDetails = (problem) => {
    setSelectedProblem(problem);
    setIsDetailModalVisible(true);
  };

  const startRootCauseAnalysis = (problem) => {
    Modal.info({
      title: 'Root Cause Analysis Started',
      content: (
        <div>
          <p>Automated root cause analysis initiated for {problem.id}</p>
          <Timeline>
            <Timeline.Item color="blue">Analyzing related incidents...</Timeline.Item>
            <Timeline.Item color="blue">Identifying common patterns...</Timeline.Item>
            <Timeline.Item color="blue">Correlating system logs...</Timeline.Item>
            <Timeline.Item color="blue">Generating hypothesis...</Timeline.Item>
            <Timeline.Item color="green">Analysis complete - recommendations ready</Timeline.Item>
          </Timeline>
        </div>
      ),
      width: 600,
      onOk: () => {
        const updatedProblems = problems.map(p =>
          p.id === problem.id
            ? {
              ...p,
              status: 'In Progress',
              rootCause: 'Analysis in progress - preliminary findings suggest configuration drift',
              updated: new Date().toLocaleString()
            }
            : p
        );
        setProblems(updatedProblems);
      }
    });
  };

  const linkIncidents = (problem) => {
    Modal.info({
      title: 'Link Related Incidents',
      content: (
        <div>
          <p>Searching for related incidents for {problem.id}...</p>
          <List
            size="small"
            dataSource={['INC-009', 'INC-012', 'INC-015']}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<ExclamationCircleOutlined />} />}
                  title={item}
                  description="Similar symptoms detected"
                />
                <Button size="small" type="link">Link</Button>
              </List.Item>
            )}
          />
        </div>
      ),
      width: 600,
      onOk: () => {
        const updatedProblems = problems.map(p =>
          p.id === problem.id
            ? {
              ...p,
              relatedIncidents: [...(p.relatedIncidents || []), 'INC-009', 'INC-012'],
              updated: new Date().toLocaleString()
            }
            : p
        );
        setProblems(updatedProblems);
      }
    });
  };

  const resolveProblem = (problem) => {
    Modal.confirm({
      title: 'Resolve Problem',
      content: `Mark problem ${problem.id} as resolved?`,
      onOk: () => {
        const updatedProblems = problems.map(p =>
          p.id === problem.id
            ? {
              ...p,
              status: 'Resolved',
              rootCause: 'Root cause identified and permanent solution implemented',
              updated: new Date().toLocaleString()
            }
            : p
        );
        setProblems(updatedProblems);
        Modal.success({
          title: 'Problem Resolved',
          content: `${problem.id} has been marked as resolved with permanent solution implemented.`
        });
      }
    });
  };

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Problems"
              value={stats.total}
              prefix={<BugOutlined />}
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
              title="High Priority"
              value={stats.high}
              valueStyle={{ color: '#fa541c' }}
              prefix={<FireOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* High Priority Problems Alert */}
      {stats.high > 0 && (
        <Alert
          message="High Priority Problems"
          description={`${stats.high} high-priority problems require immediate attention and root cause analysis.`}
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
          action={
            <Button 
              size="small" 
              type="primary"
              onClick={() => {
                // Filter to show only high priority problems
                const highPriorityProblems = problems.filter(p => p.priority === 'High');
                Modal.info({
                  title: 'High Priority Problems',
                  content: (
                    <div>
                      <p>Found {highPriorityProblems.length} high priority problems:</p>
                      <List
                        dataSource={highPriorityProblems}
                        renderItem={problem => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar icon={<BugOutlined />} style={{ backgroundColor: '#fa541c' }} />}
                              title={
                                <Space>
                                  <strong>{problem.id}</strong>
                                  <Tag color="red">{problem.priority}</Tag>
                                </Space>
                              }
                              description={
                                <div>
                                  <div>{problem.title}</div>
                                  <small style={{ color: '#666' }}>
                                    Status: {problem.status} | Category: {problem.category}
                                  </small>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  ),
                  width: 700
                });
              }}
            >
              View High Priority
            </Button>
          }
        />
      )}

      <Card
        title={
          <Space>
            <BugOutlined style={{ color: '#1890ff' }} />
            <span>Problem Management</span>
            <Badge count={stats.open} style={{ backgroundColor: '#f5222d' }} />
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                // Refresh problems data while maintaining state
                updateStats();
                message.success('Problems refreshed successfully');
              }}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              Create Problem
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={problems}
          pagination={{ pageSize: 10 }}
          rowClassName={(record) =>
            record.priority === 'High' ? 'high-priority-row' : ''
          }
        />
      </Card>

      {/* Create Problem Modal */}
      <Modal
        title={
          <Space>
            <BugOutlined style={{ color: '#1890ff' }} />
            <span>Create New Problem</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateProblem}>
          <Form.Item name="title" label="Problem Title" rules={[{ required: true }]}>
            <Input placeholder="Brief description of the problem" />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Detailed description of the problem and its symptoms" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                <Select placeholder="Select priority">
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
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
          </Row>

          <Form.Item name="assignee" label="Assignee">
            <Select placeholder="Assign to team/person">
              <Option value="Network Team">Network Team</Option>
              <Option value="Application Team">Application Team</Option>
              <Option value="Security Team">Security Team</Option>
              <Option value="Infrastructure Team">Infrastructure Team</Option>
              <Option value="Database Team">Database Team</Option>
            </Select>
          </Form.Item>

          <Form.Item name="impact" label="Business Impact">
            <TextArea rows={2} placeholder="Describe the business impact of this problem" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Problem
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Problem Details Modal */}
      <Modal
        title={`Problem Details - ${selectedProblem?.id}`}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedProblem && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Overview" key="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" title="Problem Information">
                    <p><strong>Title:</strong> {selectedProblem.title}</p>
                    <p><strong>Description:</strong> {selectedProblem.description}</p>
                    <p><strong>Status:</strong> <Tag color="blue">{selectedProblem.status}</Tag></p>
                    <p><strong>Priority:</strong> <Tag color="red">{selectedProblem.priority}</Tag></p>
                    <p><strong>Category:</strong> {selectedProblem.category}</p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Assignment & Timeline">
                    <p><strong>Assignee:</strong> {selectedProblem.assignee || 'Unassigned'}</p>
                    <p><strong>Created:</strong> {selectedProblem.created}</p>
                    <p><strong>Updated:</strong> {selectedProblem.updated}</p>
                    <p><strong>Related Incidents:</strong> {selectedProblem.relatedIncidents?.length || 0}</p>
                    <p><strong>Impact:</strong> {selectedProblem.impact}</p>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Root Cause Analysis" key="2">
              <Card>
                <p><strong>Current Root Cause:</strong></p>
                <p>{selectedProblem.rootCause || 'Root cause analysis not yet completed.'}</p>

                {selectedProblem.workaround && (
                  <>
                    <p><strong>Workaround:</strong></p>
                    <p>{selectedProblem.workaround}</p>
                  </>
                )}

                {selectedProblem.status === 'Resolved' && (
                  <Alert
                    message="Problem Resolved"
                    description="Root cause has been identified and permanent solution implemented."
                    type="success"
                    showIcon
                  />
                )}
              </Card>
            </TabPane>

            <TabPane tab="Related Incidents" key="3">
              <List
                dataSource={selectedProblem.relatedIncidents || []}
                renderItem={incident => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<ExclamationCircleOutlined />} />}
                      title={incident}
                      description="Related incident with similar symptoms"
                    />
                    <Button type="link">View Details</Button>
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane tab="Actions" key="4">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => startRootCauseAnalysis(selectedProblem)}
                  block
                >
                  Start Root Cause Analysis
                </Button>
                <Button
                  type="primary"
                  icon={<LinkOutlined />}
                  onClick={() => linkIncidents(selectedProblem)}
                  block
                >
                  Link Related Incidents
                </Button>
                <Button
                  icon={<TeamOutlined />}
                  block
                >
                  Assign to Specialist
                </Button>
                {selectedProblem.status !== 'Resolved' && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => resolveProblem(selectedProblem)}
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
        .high-priority-row {
          background-color: #fff7e6 !important;
        }
      `}</style>
    </div>
  );
};

export default ProblemManagement;