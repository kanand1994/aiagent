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
  Steps,
  Timeline,
  Badge,
  Tooltip,
  Space,
  DatePicker
} from 'antd';
import { 
  PlusOutlined, 
  UserAddOutlined, 
  UserDeleteOutlined,
  KeyOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RobotOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;

const UserAccessManagement = ({ user }) => {
  const [accessRequests, setAccessRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAccessRequests();
    loadUsers();
  }, []);

  const loadAccessRequests = async () => {
    setLoading(true);
    try {
      const data = await dataService.apiCall('/api/access-requests');
      setAccessRequests(data);
    } catch (error) {
      console.error('Error loading access requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await dataService.apiCall('/api/users');
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateRequest = async (values) => {
    try {
      await dataService.apiCall('/api/access-requests', 'POST', {
        ...values,
        requestedBy: user.id,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setModalVisible(false);
      form.resetFields();
      loadAccessRequests();
    } catch (error) {
      console.error('Error creating access request:', error);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await dataService.apiCall(`/api/access-requests/${requestId}/approve`, 'POST');
      loadAccessRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleUserOnboarding = async (userData) => {
    try {
      await dataService.apiCall('/api/users/onboard', 'POST', userData);
      loadUsers();
    } catch (error) {
      console.error('Error onboarding user:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'processing',
      approved: 'success',
      rejected: 'error',
      expired: 'default',
      active: 'success'
    };
    return colors[status] || 'default';
  };

  const getAccessLevelColor = (level) => {
    const colors = {
      read: 'blue',
      write: 'orange',
      admin: 'red',
      full: 'purple'
    };
    return colors[level] || 'default';
  };

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `ACC-${id.toString().padStart(6, '0')}`
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      render: (name, record) => (
        <div>
          <TeamOutlined style={{ marginRight: 8 }} />
          {name}
          <div style={{ fontSize: '12px', color: '#666' }}>{record.userEmail}</div>
        </div>
      )
    },
    {
      title: 'Resource',
      key: 'resource',
      render: (_, record) => (
        <div>
          <div>{record.resourceName}</div>
          <Tag size="small">{record.resourceType}</Tag>
        </div>
      )
    },
    {
      title: 'Access Level',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      render: (level) => <Tag color={getAccessLevelColor(level)}>{level?.toUpperCase()}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Never'
    },
    {
      title: 'Requested By',
      dataIndex: 'requestedBy',
      key: 'requestedBy'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
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
        </Space>
      )
    }
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2>User Access Management</h2>
        </Col>
        <Col>
          <Space>
            <Button 
              type="default" 
              icon={<UserAddOutlined />}
              onClick={() => {/* Handle user onboarding */}}
            >
              Onboard User
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedRequest(null);
                setModalVisible(true);
              }}
            >
              Request Access
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <TeamOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>{users.length}</div>
              <div style={{ color: '#666' }}>Active Users</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <KeyOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                {accessRequests.filter(r => r.status === 'approved').length}
              </div>
              <div style={{ color: '#666' }}>Active Access</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                {accessRequests.filter(r => r.status === 'pending').length}
              </div>
              <div style={{ color: '#666' }}>Pending Requests</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={accessRequests}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={selectedRequest ? `Access Request ACC-${selectedRequest.id?.toString().padStart(6, '0')}` : 'Request Access'}
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
                  <strong>User:</strong> {selectedRequest.userName}
                </Col>
                <Col span={12}>
                  <strong>Resource:</strong> {selectedRequest.resourceName}
                </Col>
                <Col span={12}>
                  <strong>Resource Type:</strong> <Tag>{selectedRequest.resourceType}</Tag>
                </Col>
                <Col span={12}>
                  <strong>Access Level:</strong> 
                  <Tag color={getAccessLevelColor(selectedRequest.accessLevel)} style={{ marginLeft: 8 }}>
                    {selectedRequest.accessLevel?.toUpperCase()}
                  </Tag>
                </Col>
                <Col span={12}>
                  <strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedRequest.status)} style={{ marginLeft: 8 }}>
                    {selectedRequest.status?.toUpperCase()}
                  </Tag>
                </Col>
                <Col span={12}>
                  <strong>Expires:</strong> {selectedRequest.expiresAt ? new Date(selectedRequest.expiresAt).toLocaleDateString() : 'Never'}
                </Col>
                <Col span={24}>
                  <strong>Justification:</strong>
                  <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                    {selectedRequest.justification}
                  </div>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Approval Workflow" key="workflow">
              <Steps current={selectedRequest.status === 'approved' ? 2 : selectedRequest.status === 'pending' ? 1 : 0}>
                <Step title="Submitted" description="Access request created" />
                <Step title="Review" description="Pending manager approval" />
                <Step title="Approved" description="Access granted" />
                <Step title="Provisioned" description="Automated access provisioning" />
              </Steps>
            </TabPane>
            <TabPane tab="Automation Log" key="automation">
              <Alert
                message="Automated Access Provisioning"
                description="Access rights are automatically provisioned upon approval"
                type="info"
                showIcon
                icon={<RobotOutlined />}
                style={{ marginBottom: 16 }}
              />
              <Timeline>
                <Timeline.Item color="green">
                  <strong>Request Approved</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>Manager approval received</div>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <strong>Group Mapping</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>User added to appropriate security groups</div>
                </Timeline.Item>
                <Timeline.Item color="green">
                  <strong>Access Provisioned</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>Permissions applied successfully</div>
                </Timeline.Item>
              </Timeline>
            </TabPane>
          </Tabs>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateRequest}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="userId"
                  label="User"
                  rules={[{ required: true, message: 'Please select user' }]}
                >
                  <Select placeholder="Select user">
                    {users.map(u => (
                      <Option key={u.id} value={u.id}>{u.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="resourceType"
                  label="Resource Type"
                  rules={[{ required: true, message: 'Please select resource type' }]}
                >
                  <Select placeholder="Select resource type">
                    <Option value="application">Application</Option>
                    <Option value="database">Database</Option>
                    <Option value="server">Server</Option>
                    <Option value="network">Network</Option>
                    <Option value="file_share">File Share</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="resourceName"
                  label="Resource Name"
                  rules={[{ required: true, message: 'Please enter resource name' }]}
                >
                  <Input placeholder="Resource name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="accessLevel"
                  label="Access Level"
                  rules={[{ required: true, message: 'Please select access level' }]}
                >
                  <Select placeholder="Select access level">
                    <Option value="read">Read Only</Option>
                    <Option value="write">Read/Write</Option>
                    <Option value="admin">Administrator</Option>
                    <Option value="full">Full Control</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="expiresAt"
              label="Expiration Date (Optional)"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="justification"
              label="Business Justification"
              rules={[{ required: true, message: 'Please enter justification' }]}
            >
              <TextArea rows={4} placeholder="Why is this access needed?" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                Submit Request
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

export default UserAccessManagement;