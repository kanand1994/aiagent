import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Tag, 
  Row, 
  Col,
  Tabs,
  Alert,
  Progress,
  Steps,
  List,
  Avatar,
  Rate,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  DownloadOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  AppstoreOutlined,
  SafetyCertificateOutlined,
  RobotOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;

const ApplicationInstallation = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [catalogVisible, setCatalogVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadRequests();
    loadCatalog();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await dataService.apiCall('/api/software-requests');
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalog = async () => {
    try {
      const data = await dataService.apiCall('/api/software-catalog');
      setCatalog(data);
    } catch (error) {
      console.error('Error loading catalog:', error);
    }
  };

  const handleCreateRequest = async (values) => {
    try {
      await dataService.apiCall('/api/software-requests', 'POST', {
        ...values,
        requestedBy: user.id,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setModalVisible(false);
      form.resetFields();
      loadRequests();
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await dataService.apiCall(`/api/software-requests/${requestId}/approve`, 'POST');
      loadRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleInstallApp = async (appId, targetMachine) => {
    try {
      await dataService.apiCall('/api/software-requests', 'POST', {
        applicationId: appId,
        targetMachine,
        requestedBy: user.id,
        status: 'auto-approved',
        autoInstall: true,
        createdAt: new Date().toISOString()
      });
      setCatalogVisible(false);
      loadRequests();
    } catch (error) {
      console.error('Error installing application:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'processing',
      approved: 'success',
      rejected: 'error',
      installing: 'warning',
      completed: 'success',
      failed: 'error',
      'auto-approved': 'cyan'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      approved: <CheckCircleOutlined />,
      rejected: <ExclamationCircleOutlined />,
      installing: <DownloadOutlined />,
      completed: <CheckCircleOutlined />,
      failed: <ExclamationCircleOutlined />
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `REQ-${id.toString().padStart(6, '0')}`
    },
    {
      title: 'Application',
      dataIndex: 'applicationName',
      key: 'applicationName',
      render: (name, record) => (
        <div>
          <AppstoreOutlined style={{ marginRight: 8 }} />
          {name}
          <div style={{ fontSize: '12px', color: '#666' }}>{record.version}</div>
        </div>
      )
    },
    {
      title: 'Target Machine',
      dataIndex: 'targetMachine',
      key: 'targetMachine'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress, record) => {
        if (record.status === 'installing') {
          return <Progress percent={progress || 0} size="small" />;
        }
        if (record.status === 'completed') {
          return <Progress percent={100} size="small" status="success" />;
        }
        return '-';
      }
    },
    {
      title: 'Requested By',
      dataIndex: 'requestedBy',
      key: 'requestedBy'
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedRequest(record);
              setModalVisible(true);
            }}
          >
            View
          </Button>
          {user.role === 'IT Staff' && record.status === 'pending' && (
            <Button 
              type="link" 
              onClick={() => handleApproveRequest(record.id)}
            >
              Approve
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2>Application Installation & Software Requests</h2>
        </Col>
        <Col>
          <Button 
            type="default" 
            icon={<AppstoreOutlined />}
            onClick={() => setCatalogVisible(true)}
            style={{ marginRight: 8 }}
          >
            Browse Catalog
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedRequest(null);
              setModalVisible(true);
            }}
          >
            Request Software
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={requests}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Software Catalog Modal */}
      <Modal
        title="Software Catalog"
        visible={catalogVisible}
        onCancel={() => setCatalogVisible(false)}
        width={1000}
        footer={null}
      >
        <Row gutter={[16, 16]}>
          {catalog.map(app => (
            <Col xs={24} sm={12} md={8} key={app.id}>
              <Card
                hoverable
                cover={
                  <div style={{ padding: 20, textAlign: 'center', background: '#f5f5f5' }}>
                    <AppstoreOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                  </div>
                }
                actions={[
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => {
                      setSelectedApp(app);
                      setCatalogVisible(false);
                      setModalVisible(true);
                    }}
                  >
                    Install
                  </Button>
                ]}
              >
                <Card.Meta
                  title={app.name}
                  description={
                    <div>
                      <div>{app.description}</div>
                      <div style={{ marginTop: 8 }}>
                        <Tag color={app.approved ? 'green' : 'orange'}>
                          {app.approved ? 'Pre-approved' : 'Requires Approval'}
                        </Tag>
                        {app.securityRating && (
                          <div style={{ marginTop: 4 }}>
                            <SafetyCertificateOutlined style={{ marginRight: 4 }} />
                            <Rate disabled defaultValue={app.securityRating} size="small" />
                          </div>
                        )}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>

      {/* Request Details/Create Modal */}
      <Modal
        title={selectedRequest ? `Request REQ-${selectedRequest.id?.toString().padStart(6, '0')}` : selectedApp ? `Install ${selectedApp.name}` : 'Request Software'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedRequest ? (
          <Tabs defaultActiveKey="details">
            <TabPane tab="Details" key="details">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <strong>Application:</strong> {selectedRequest.applicationName}
                </Col>
                <Col span={12}>
                  <strong>Version:</strong> {selectedRequest.version}
                </Col>
                <Col span={12}>
                  <strong>Target Machine:</strong> {selectedRequest.targetMachine}
                </Col>
                <Col span={12}>
                  <strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedRequest.status)} style={{ marginLeft: 8 }}>
                    {selectedRequest.status?.toUpperCase()}
                  </Tag>
                </Col>
                <Col span={24}>
                  <strong>Business Justification:</strong>
                  <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                    {selectedRequest.justification}
                  </div>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Installation Progress" key="progress">
              <Steps 
                direction="vertical" 
                current={
                  selectedRequest.status === 'completed' ? 4 :
                  selectedRequest.status === 'installing' ? 3 :
                  selectedRequest.status === 'approved' ? 2 :
                  selectedRequest.status === 'pending' ? 1 : 0
                }
              >
                <Step title="Request Submitted" description="Software request created" />
                <Step title="Approval Review" description="Pending IT approval" />
                <Step title="Approved" description="Request approved for installation" />
                <Step title="Installing" description="Automated deployment in progress" />
                <Step title="Completed" description="Software successfully installed" />
              </Steps>
            </TabPane>
            <TabPane tab="Automation Log" key="log">
              <Alert
                message="Automated Installation"
                description="This installation is being handled by our automation scripts"
                type="info"
                showIcon
                icon={<RobotOutlined />}
                style={{ marginBottom: 16 }}
              />
              <List
                size="small"
                dataSource={[
                  'Pre-installation checks completed',
                  'Dependencies verified',
                  'Download initiated from secure repository',
                  'Installation package validated',
                  'Silent installation in progress...'
                ]}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            </TabPane>
          </Tabs>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={selectedApp ? 
              (values) => handleInstallApp(selectedApp.id, values.targetMachine) :
              handleCreateRequest
            }
            initialValues={selectedApp ? { applicationName: selectedApp.name, version: selectedApp.version } : {}}
          >
            <Form.Item
              name="applicationName"
              label="Application Name"
              rules={[{ required: true, message: 'Please enter application name' }]}
            >
              <Input placeholder="Application name" disabled={!!selectedApp} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="version"
                  label="Version"
                  rules={[{ required: true, message: 'Please enter version' }]}
                >
                  <Input placeholder="Version" disabled={!!selectedApp} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="targetMachine"
                  label="Target Machine"
                  rules={[{ required: true, message: 'Please enter target machine' }]}
                >
                  <Input placeholder="Machine name or IP" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="justification"
              label="Business Justification"
              rules={[{ required: true, message: 'Please enter justification' }]}
            >
              <TextArea rows={4} placeholder="Why do you need this software?" />
            </Form.Item>

            {selectedApp && selectedApp.approved && (
              <Alert
                message="Pre-approved Software"
                description="This software is pre-approved and will be installed automatically"
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                {selectedApp ? 'Install Now' : 'Submit Request'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationInstallation;