import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Steps, 
  Tag, 
  Timeline, 
  Row, 
  Col,
  Tabs,
  Alert,
  Progress,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RollbackOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;

const ChangeManagement = ({ user }) => {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChange, setSelectedChange] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadChanges();
  }, []);

  const loadChanges = async () => {
    setLoading(true);
    try {
      const data = await dataService.apiCall('/api/changes');
      setChanges(data);
    } catch (error) {
      console.error('Error loading changes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChange = async (values) => {
    try {
      await dataService.apiCall('/api/changes', 'POST', {
        ...values,
        requestedBy: user.id,
        status: 'draft',
        createdAt: new Date().toISOString()
      });
      setModalVisible(false);
      form.resetFields();
      loadChanges();
    } catch (error) {
      console.error('Error creating change:', error);
    }
  };

  const handleApproveChange = async (changeId) => {
    try {
      await dataService.apiCall(`/api/changes/${changeId}/approve`, 'POST');
      loadChanges();
    } catch (error) {
      console.error('Error approving change:', error);
    }
  };

  const handleRejectChange = async (changeId, reason) => {
    try {
      await dataService.apiCall(`/api/changes/${changeId}/reject`, 'POST', { reason });
      loadChanges();
    } catch (error) {
      console.error('Error rejecting change:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending: 'processing',
      approved: 'success',
      rejected: 'error',
      implementing: 'warning',
      completed: 'success',
      failed: 'error'
    };
    return colors[status] || 'default';
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      critical: 'red'
    };
    return colors[risk] || 'default';
  };

  const columns = [
    {
      title: 'Change ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `CHG-${id.toString().padStart(6, '0')}`
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{type}</Tag>
    },
    {
      title: 'Risk Level',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (risk) => <Tag color={getRiskColor(risk)}>{risk?.toUpperCase()}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
    },
    {
      title: 'Requested By',
      dataIndex: 'requestedBy',
      key: 'requestedBy'
    },
    {
      title: 'Scheduled Date',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Not scheduled'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedChange(record);
              setModalVisible(true);
            }}
          >
            View
          </Button>
          {user.role === 'IT Staff' && record.status === 'pending' && (
            <>
              <Button 
                type="link" 
                icon={<CheckCircleOutlined />}
                onClick={() => handleApproveChange(record.id)}
              >
                Approve
              </Button>
              <Button 
                type="link" 
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleRejectChange(record.id, 'Rejected by reviewer')}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2>Change Management</h2>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedChange(null);
              setModalVisible(true);
            }}
          >
            Create Change Request
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={changes}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={selectedChange ? `Change Request CHG-${selectedChange.id?.toString().padStart(6, '0')}` : 'Create Change Request'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedChange ? (
          <Tabs defaultActiveKey="details">
            <TabPane tab="Details" key="details">
              <div>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <strong>Title:</strong> {selectedChange.title}
                  </Col>
                  <Col span={12}>
                    <strong>Type:</strong> <Tag>{selectedChange.type}</Tag>
                  </Col>
                  <Col span={12}>
                    <strong>Risk Level:</strong> <Tag color={getRiskColor(selectedChange.riskLevel)}>{selectedChange.riskLevel?.toUpperCase()}</Tag>
                  </Col>
                  <Col span={12}>
                    <strong>Status:</strong> <Tag color={getStatusColor(selectedChange.status)}>{selectedChange.status?.toUpperCase()}</Tag>
                  </Col>
                  <Col span={24}>
                    <strong>Description:</strong>
                    <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                      {selectedChange.description}
                    </div>
                  </Col>
                </Row>
              </div>
            </TabPane>
            <TabPane tab="Approval Workflow" key="workflow">
              <Steps current={selectedChange.status === 'approved' ? 2 : selectedChange.status === 'pending' ? 1 : 0}>
                <Step title="Submitted" description="Change request created" />
                <Step title="Review" description="Pending approval" />
                <Step title="Approved" description="Ready for implementation" />
                <Step title="Implementation" description="Change in progress" />
                <Step title="Completed" description="Change successfully implemented" />
              </Steps>
            </TabPane>
            <TabPane tab="Rollback Plan" key="rollback">
              <Alert
                message="Rollback Plan"
                description={selectedChange.rollbackPlan || "No rollback plan specified"}
                type="info"
                showIcon
                icon={<RollbackOutlined />}
              />
            </TabPane>
          </Tabs>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateChange}
          >
            <Form.Item
              name="title"
              label="Change Title"
              rules={[{ required: true, message: 'Please enter change title' }]}
            >
              <Input placeholder="Brief description of the change" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Change Type"
                  rules={[{ required: true, message: 'Please select change type' }]}
                >
                  <Select placeholder="Select change type">
                    <Option value="standard">Standard</Option>
                    <Option value="normal">Normal</Option>
                    <Option value="emergency">Emergency</Option>
                    <Option value="major">Major</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="riskLevel"
                  label="Risk Level"
                  rules={[{ required: true, message: 'Please select risk level' }]}
                >
                  <Select placeholder="Select risk level">
                    <Option value="low">Low</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="high">High</Option>
                    <Option value="critical">Critical</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea rows={4} placeholder="Detailed description of the change" />
            </Form.Item>

            <Form.Item
              name="businessJustification"
              label="Business Justification"
              rules={[{ required: true, message: 'Please enter business justification' }]}
            >
              <TextArea rows={3} placeholder="Why is this change needed?" />
            </Form.Item>

            <Form.Item
              name="rollbackPlan"
              label="Rollback Plan"
              rules={[{ required: true, message: 'Please enter rollback plan' }]}
            >
              <TextArea rows={3} placeholder="How to rollback if the change fails" />
            </Form.Item>

            <Form.Item
              name="scheduledDate"
              label="Scheduled Implementation Date"
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                Submit Change Request
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

export default ChangeManagement;