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
  Progress,
  Timeline,
  Tabs,
  Badge,
  Alert,
  Tooltip,
  Steps,
  List,
  Avatar,
  message
} from 'antd';
import {
  PlusOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  ToolOutlined,
  DeploymentUnitOutlined,
  ReloadOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Step } = Steps;

const RequestFulfillment = ({ user }) => {
  const [requests, setRequests] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    inProgress: 0,
    completed: 0
  });

  useEffect(() => {
    updateStats();
    
    // Listen for routed tickets
    const handleRoutedTicket = (event) => {
      const { ticket, agent } = event.detail;
      if (agent === 'request') {
        // Convert ticket to request format
        const newRequest = {
          key: String(requests.length + 1),
          id: ticket.id.replace('TKT-', 'REQ-'),
          title: ticket.title,
          type: ticket.category || 'General',
          status: 'Pending Approval',
          priority: ticket.priority,
          requester: ticket.requester,
          created: new Date().toLocaleString(),
          approver: null,
          estimatedCompletion: calculateEstimatedCompletion(ticket.category || 'General'),
          progress: 0,
          description: ticket.description,
          justification: 'Routed from Service Desk'
        };
        
        setRequests(prev => [newRequest, ...prev]);
        
        // Show notification
        Modal.success({
          title: 'New Request Routed',
          content: `Ticket ${ticket.id} has been converted to request ${newRequest.id} and added to the request queue.`
        });
      }
    };
    
    // Check for existing routed tickets on component mount
    const existingTickets = JSON.parse(localStorage.getItem('routed_tickets_request') || '[]');
    if (existingTickets.length > 0) {
      existingTickets.forEach(ticket => {
        handleRoutedTicket({ detail: { ticket, agent: 'request' } });
      });
      // Clear processed tickets
      localStorage.removeItem('routed_tickets_request');
    }
    
    window.addEventListener('ticketRouted', handleRoutedTicket);
    
    return () => {
      window.removeEventListener('ticketRouted', handleRoutedTicket);
    };
  }, [requests]);

  const updateStats = () => {
    const newStats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'Pending Approval').length,
      approved: requests.filter(r => r.status === 'Approved').length,
      inProgress: requests.filter(r => r.status === 'In Progress').length,
      completed: requests.filter(r => r.status === 'Completed').length
    };
    setStats(newStats);
  };

  const serviceCatalog = [
    {
      category: 'Software',
      icon: <ToolOutlined />,
      items: [
        { name: 'Microsoft Office', description: 'Word, Excel, PowerPoint suite', sla: '2-3 days' },
        { name: 'Adobe Creative Suite', description: 'Photoshop, Illustrator, InDesign', sla: '3-5 days' },
        { name: 'Visual Studio', description: 'Development environment', sla: '1-2 days' },
        { name: 'Slack', description: 'Team communication tool', sla: '1 day' }
      ]
    },
    {
      category: 'Hardware',
      icon: <DeploymentUnitOutlined />,
      items: [
        { name: 'Laptop', description: 'Standard business laptop', sla: '5-7 days' },
        { name: 'Desktop', description: 'Desktop workstation', sla: '3-5 days' },
        { name: 'Monitor', description: 'Additional display monitor', sla: '2-3 days' },
        { name: 'Keyboard & Mouse', description: 'Standard peripherals', sla: '1-2 days' }
      ]
    },
    {
      category: 'Access',
      icon: <UserOutlined />,
      items: [
        { name: 'VPN Access', description: 'Remote network access', sla: '1-2 days' },
        { name: 'Application Access', description: 'Business application permissions', sla: '1-3 days' },
        { name: 'File Share Access', description: 'Network drive permissions', sla: '1 day' },
        { name: 'Database Access', description: 'Database query permissions', sla: '2-3 days' }
      ]
    },
    {
      category: 'Services',
      icon: <FileTextOutlined />,
      items: [
        { name: 'Email Account', description: 'New email account setup', sla: '1-2 days' },
        { name: 'Phone Extension', description: 'Desk phone setup', sla: '2-3 days' },
        { name: 'Parking Pass', description: 'Building parking access', sla: '1 day' },
        { name: 'Building Access', description: 'Key card access setup', sla: '1-2 days' }
      ]
    }
  ];

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => viewRequestDetails(record)}
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
          <small style={{ color: '#666' }}>{record.type}</small>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const config = {
          'Pending Approval': { color: 'orange', icon: <ClockCircleOutlined /> },
          'Approved': { color: 'green', icon: <CheckCircleOutlined /> },
          'In Progress': { color: 'blue', icon: <ThunderboltOutlined /> },
          'Completed': { color: 'green', icon: <CheckCircleOutlined /> },
          'Rejected': { color: 'red', icon: <ExclamationCircleOutlined /> }
        };
        return (
          <div>
            <Tag color={config[status]?.color} icon={config[status]?.icon}>
              {status}
            </Tag>
            {record.progress !== undefined && (
              <Progress
                percent={record.progress}
                size="small"
                style={{ width: '60px', marginTop: '4px' }}
                showInfo={false}
              />
            )}
          </div>
        );
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const config = {
          'High': { color: 'red', icon: <ExclamationCircleOutlined /> },
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
      title: 'Requester',
      dataIndex: 'requester',
      key: 'requester',
      render: (requester) => (
        <Space>
          <UserOutlined />
          {requester}
        </Space>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress
          percent={progress || 0}
          size="small"
          style={{ width: '80px' }}
        />
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
              icon={<FileTextOutlined />}
              onClick={() => viewRequestDetails(record)}
            >
              View
            </Button>
          </Tooltip>
          {record.status === 'Pending Approval' && (
            <>
              <Tooltip title="Approve Request">
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => approveRequest(record)}
                >
                  Approve
                </Button>
              </Tooltip>
              <Tooltip title="Reject Request">
                <Button
                  size="small"
                  danger
                  icon={<ExclamationCircleOutlined />}
                  onClick={() => rejectRequest(record)}
                >
                  Reject
                </Button>
              </Tooltip>
            </>
          )}
          {record.status === 'Approved' && (
            <Tooltip title="Start Fulfillment">
              <Button
                size="small"
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={() => startFulfillment(record)}
              >
                Start
              </Button>
            </Tooltip>
          )}
          {record.status === 'In Progress' && (
            <Tooltip title="Mark Complete">
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => completeRequest(record)}
                style={{ backgroundColor: '#52c41a' }}
              >
                Complete
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const handleCreateRequest = async (values) => {
    setLoading(true);
    try {
      const newRequest = {
        key: String(requests.length + 1),
        id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
        ...values,
        status: 'Pending Approval',
        created: new Date().toLocaleString(),
        progress: 0,
        approver: null,
        estimatedCompletion: calculateEstimatedCompletion(values.type)
      };

      setRequests([...requests, newRequest]);
      setIsModalVisible(false);
      form.resetFields();

      // Show success notification
      Modal.success({
        title: 'Request Submitted Successfully!',
        content: `Request ${newRequest.id} has been submitted and is pending approval.`,
      });

      // Auto-approve low-risk requests
      if (values.type === 'Access' && values.priority === 'Low') {
        setTimeout(() => {
          approveRequest(newRequest);
        }, 2000);
      }
    } catch (error) {
      Modal.error({
        title: 'Error Creating Request',
        content: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedCompletion = (type) => {
    const days = {
      'Software': 3,
      'Hardware': 7,
      'Access': 2,
      'Services': 2
    };
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + (days[type] || 3));
    return completionDate.toISOString().split('T')[0];
  };

  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailModalVisible(true);
  };

  const approveRequest = (request) => {
    Modal.confirm({
      title: 'Approve Request',
      content: `Approve request ${request.id}?`,
      onOk: () => {
        const updatedRequests = requests.map(r =>
          r.id === request.id
            ? { ...r, status: 'Approved', approver: user?.username || 'IT Manager', progress: 25, updated: new Date().toLocaleString() }
            : r
        );
        setRequests(updatedRequests);
        Modal.success({
          title: 'Request Approved',
          content: `${request.id} has been approved and queued for fulfillment.`
        });
      }
    });
  };

  const rejectRequest = (request) => {
    Modal.confirm({
      title: 'Reject Request',
      content: `Reject request ${request.id}? Please provide a reason.`,
      onOk: () => {
        const updatedRequests = requests.map(r =>
          r.id === request.id
            ? { ...r, status: 'Rejected', approver: user?.username || 'IT Manager', updated: new Date().toLocaleString() }
            : r
        );
        setRequests(updatedRequests);
        Modal.info({
          title: 'Request Rejected',
          content: `${request.id} has been rejected. The requester will be notified.`
        });
      }
    });
  };

  const startFulfillment = (request) => {
    Modal.info({
      title: 'Starting Fulfillment Process',
      content: (
        <div>
          <p>Initiating automated fulfillment for {request.id}</p>
          <Timeline size="small">
            <Timeline.Item color="blue">Validating request details...</Timeline.Item>
            <Timeline.Item color="blue">Checking resource availability...</Timeline.Item>
            <Timeline.Item color="blue">Scheduling deployment...</Timeline.Item>
            <Timeline.Item color="green">Fulfillment process started</Timeline.Item>
          </Timeline>
        </div>
      ),
      width: 600,
      onOk: () => {
        const updatedRequests = requests.map(r =>
          r.id === request.id
            ? { ...r, status: 'In Progress', progress: 50, updated: new Date().toLocaleString() }
            : r
        );
        setRequests(updatedRequests);
      }
    });
  };

  const completeRequest = (request) => {
    Modal.confirm({
      title: 'Complete Request',
      content: `Mark request ${request.id} as completed?`,
      onOk: () => {
        const updatedRequests = requests.map(r =>
          r.id === request.id
            ? { ...r, status: 'Completed', progress: 100, updated: new Date().toLocaleString() }
            : r
        );
        setRequests(updatedRequests);
        Modal.success({
          title: 'Request Completed',
          content: `${request.id} has been completed successfully. The requester will be notified.`
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
                title="Total Requests"
                value={stats.total}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending Approval"
                value={stats.pending}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="In Progress"
                value={stats.inProgress}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ThunderboltOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Completed"
                value={stats.completed}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Pending Approvals Alert */}
        {stats.pending > 0 && (
          <Alert
            message="Pending Approvals"
            description={`${stats.pending} requests are waiting for approval.`}
            type="warning"
            showIcon
            style={{ marginBottom: '16px' }}
            action={
              <Button 
                size="small" 
                type="primary"
                onClick={() => {
                  // Filter to show only pending approval requests
                  const pendingRequests = requests.filter(r => r.status === 'Pending Approval');
                  Modal.info({
                    title: 'Pending Approval Requests',
                    content: (
                      <div>
                        <p>Found {pendingRequests.length} requests waiting for approval:</p>
                        <List
                          dataSource={pendingRequests}
                          renderItem={request => (
                            <List.Item
                              actions={[
                                <Button 
                                  key="approve"
                                  type="primary" 
                                  size="small"
                                  onClick={() => {
                                    approveRequest(request);
                                    // Close the modal and refresh
                                    Modal.destroyAll();
                                  }}
                                >
                                  Approve
                                </Button>,
                                <Button 
                                  key="reject"
                                  danger 
                                  size="small"
                                  onClick={() => {
                                    rejectRequest(request);
                                    // Close the modal and refresh
                                    Modal.destroyAll();
                                  }}
                                >
                                  Reject
                                </Button>
                              ]}
                            >
                              <List.Item.Meta
                                avatar={<Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                                title={
                                  <Space>
                                    <strong>{request.id}</strong>
                                    <Tag color="orange">{request.priority}</Tag>
                                  </Space>
                                }
                                description={
                                  <div>
                                    <div><strong>{request.title}</strong></div>
                                    <div>Type: {request.type} | Requester: {request.requester}</div>
                                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                                      {request.description}
                                    </div>
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      </div>
                    ),
                    width: 800
                  });
                }}
              >
                Review Pending
              </Button>
            }
          />
        )}

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          {/* Service Catalog */}
          <Card
            title={
              <Space>
                <ShoppingCartOutlined style={{ color: '#1890ff' }} />
                <span>Service Catalog</span>
              </Space>
            }
            style={{ flex: 1 }}
          >
            {serviceCatalog.map((category, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {category.icon}
                  {category.category}
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {category.items.map((item, itemIndex) => (
                    <Tooltip key={itemIndex} title={`${item.description} - SLA: ${item.sla}`}>
                      <Button
                        size="small"
                        icon={<ShoppingCartOutlined />}
                        onClick={() => {
                          form.setFieldsValue({
                            title: `${category.category} Request - ${item.name}`,
                            type: category.category,
                            item: item.name,
                            description: item.description
                          });
                          setIsModalVisible(true);
                        }}
                        style={{ marginBottom: '4px' }}
                      >
                        {item.name}
                      </Button>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </Card>

          {/* Quick Stats */}
          <Card title="SLA Performance" style={{ width: '300px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>On-Time Delivery</span>
                <span>92%</span>
              </div>
              <Progress percent={92} strokeColor="#52c41a" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Avg. Fulfillment Time</span>
                <span>2.3 days</span>
              </div>
              <Progress percent={85} strokeColor="#1890ff" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>User Satisfaction</span>
                <span>4.7/5</span>
              </div>
              <Progress percent={94} strokeColor="#faad14" />
            </div>
          </Card>
        </div>

        <Card
          title={
            <Space>
              <FileTextOutlined style={{ color: '#1890ff' }} />
              <span>Request Management</span>
              <Badge count={stats.pending} style={{ backgroundColor: '#faad14' }} />
            </Space>
          }
          extra={
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  // Refresh requests data while maintaining state
                  updateStats();
                  message.success('Requests refreshed successfully');
                }}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Create Request
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={requests}
            pagination={{ pageSize: 10 }}
            rowClassName={(record) =>
              record.priority === 'High' ? 'high-priority-row' : ''
            }
          />
        </Card>

        {/* Create Request Modal */}
        <Modal
          title={
            <Space>
              <PlusOutlined style={{ color: '#1890ff' }} />
              <span>Create New Request</span>
            </Space>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateRequest}>
            <Form.Item name="title" label="Request Title" rules={[{ required: true }]}>
              <Input placeholder="Brief description of the request" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="type" label="Request Type" rules={[{ required: true }]}>
                  <Select placeholder="Select request type">
                    <Option value="Software">Software</Option>
                    <Option value="Hardware">Hardware</Option>
                    <Option value="Access">Access</Option>
                    <Option value="Services">Services</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                  <Select placeholder="Select priority">
                    <Option value="Low">Low</Option>
                    <Option value="Medium">Medium</Option>
                    <Option value="High">High</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <TextArea rows={4} placeholder="Detailed description of the request" />
            </Form.Item>

            <Form.Item name="requester" label="Requester" rules={[{ required: true }]}>
              <Input placeholder="Name of the person making the request" defaultValue={user?.username} />
            </Form.Item>

            <Form.Item name="justification" label="Business Justification" rules={[{ required: true }]}>
              <TextArea rows={3} placeholder="Why is this request needed? How does it benefit the business?" />
            </Form.Item>

            <Alert
              message="Automated Processing"
              description="Low-priority access requests may be automatically approved and processed."
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit Request
                </Button>
                <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Request Details Modal */}
        <Modal
          title={`Request Details - ${selectedRequest?.id}`}
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={null}
          width={900}
        >
          {selectedRequest && (
            <Tabs defaultActiveKey="1">
              <TabPane tab="Overview" key="1">
                <Row gutter={16}>
                  <Col span={12}>
                    <Card size="small" title="Request Information">
                      <p><strong>Title:</strong> {selectedRequest.title}</p>
                      <p><strong>Type:</strong> <Tag color="blue">{selectedRequest.type}</Tag></p>
                      <p><strong>Description:</strong> {selectedRequest.description}</p>
                      <p><strong>Status:</strong> <Tag color="green">{selectedRequest.status}</Tag></p>
                      <p><strong>Priority:</strong> <Tag color="orange">{selectedRequest.priority}</Tag></p>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" title="Progress & Timeline">
                      <p><strong>Progress:</strong></p>
                      <Progress percent={selectedRequest.progress || 0} />
                      <p><strong>Requester:</strong> {selectedRequest.requester}</p>
                      <p><strong>Approver:</strong> {selectedRequest.approver || 'Pending'}</p>
                      <p><strong>Created:</strong> {selectedRequest.created}</p>
                      <p><strong>Est. Completion:</strong> {selectedRequest.estimatedCompletion}</p>
                    </Card>
                  </Col>
                </Row>

                {selectedRequest.justification && (
                  <Card size="small" title="Business Justification" style={{ marginTop: '16px' }}>
                    <p>{selectedRequest.justification}</p>
                  </Card>
                )}
              </TabPane>

              <TabPane tab="Workflow" key="2">
                <Steps
                  current={
                    selectedRequest.status === 'Pending Approval' ? 0 :
                      selectedRequest.status === 'Approved' ? 1 :
                        selectedRequest.status === 'In Progress' ? 2 :
                          selectedRequest.status === 'Completed' ? 3 : 0
                  }
                  direction="vertical"
                >
                  <Step
                    title="Request Submitted"
                    description="Request created and submitted for approval"
                    icon={<FileTextOutlined />}
                  />
                  <Step
                    title="Approval Process"
                    description="Request reviewed and approved by manager"
                    icon={<CheckCircleOutlined />}
                  />
                  <Step
                    title="Fulfillment"
                    description="Request being processed and fulfilled"
                    icon={<ThunderboltOutlined />}
                  />
                  <Step
                    title="Completed"
                    description="Request completed and delivered"
                    icon={<CheckCircleOutlined />}
                  />
                </Steps>
              </TabPane>

              <TabPane tab="Actions" key="3">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {selectedRequest.status === 'Pending Approval' && (
                    <>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => approveRequest(selectedRequest)}
                        block
                      >
                        Approve Request
                      </Button>
                      <Button
                        danger
                        icon={<ExclamationCircleOutlined />}
                        onClick={() => rejectRequest(selectedRequest)}
                        block
                      >
                        Reject Request
                      </Button>
                    </>
                  )}

                  {selectedRequest.status === 'Approved' && (
                    <Button
                      type="primary"
                      icon={<ThunderboltOutlined />}
                      onClick={() => startFulfillment(selectedRequest)}
                      block
                    >
                      Start Fulfillment Process
                    </Button>
                  )}

                  {selectedRequest.status === 'In Progress' && (
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => completeRequest(selectedRequest)}
                      style={{ backgroundColor: '#52c41a' }}
                      block
                    >
                      Mark as Completed
                    </Button>
                  )}

                  <Button
                    icon={<UserOutlined />}
                    block
                  >
                    Notify Requester
                  </Button>

                  <Button
                    icon={<FileTextOutlined />}
                    block
                  >
                    Add Comments
                  </Button>
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
    </>
  );
};

export default RequestFulfillment;