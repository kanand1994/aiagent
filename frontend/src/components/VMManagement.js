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
  Descriptions,
  Tooltip,
  Space
} from 'antd';
import { 
  PlusOutlined, 
  PlayCircleOutlined, 
  PauseCircleOutlined,
  StopOutlined,
  DeleteOutlined,
  CloudServerOutlined,
  SettingOutlined,
  MonitorOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;

const VMManagement = ({ user }) => {
  const [vms, setVms] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVM, setSelectedVM] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadVMs();
    loadTemplates();
  }, []);

  const loadVMs = async () => {
    setLoading(true);
    try {
      const data = await dataService.apiCall('/api/vms');
      setVms(data);
    } catch (error) {
      console.error('Error loading VMs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await dataService.apiCall('/api/vm-templates');
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }; 
 const handleCreateVM = async (values) => {
    try {
      await dataService.apiCall('/api/vms', 'POST', {
        ...values,
        requestedBy: user.id,
        status: 'provisioning',
        createdAt: new Date().toISOString()
      });
      setModalVisible(false);
      form.resetFields();
      loadVMs();
    } catch (error) {
      console.error('Error creating VM:', error);
    }
  };

  const handleVMAction = async (vmId, action) => {
    try {
      await dataService.apiCall(`/api/vms/${vmId}/${action}`, 'POST');
      loadVMs();
    } catch (error) {
      console.error(`Error ${action} VM:`, error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      running: 'success',
      stopped: 'default',
      provisioning: 'processing',
      error: 'error',
      suspended: 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      running: <PlayCircleOutlined />,
      stopped: <StopOutlined />,
      provisioning: <CloudServerOutlined />,
      suspended: <PauseCircleOutlined />
    };
    return icons[status] || <CloudServerOutlined />;
  };

  const columns = [
    {
      title: 'VM Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <CloudServerOutlined style={{ marginRight: 8 }} />
          {name}
          <div style={{ fontSize: '12px', color: '#666' }}>{record.ipAddress}</div>
        </div>
      )
    },
    {
      title: 'Template',
      dataIndex: 'template',
      key: 'template'
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
      title: 'Resources',
      key: 'resources',
      render: (_, record) => (
        <div>
          <div>CPU: {record.cpu} cores</div>
          <div>RAM: {record.memory} GB</div>
          <div>Disk: {record.storage} GB</div>
        </div>
      )
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner'
    },
    {
      title: 'Environment',
      dataIndex: 'environment',
      key: 'environment',
      render: (env) => <Tag color={env === 'production' ? 'red' : env === 'staging' ? 'orange' : 'blue'}>{env}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="link" 
              icon={<MonitorOutlined />}
              onClick={() => {
                setSelectedVM(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'stopped' && (
            <Tooltip title="Start VM">
              <Button 
                type="link" 
                icon={<PlayCircleOutlined />}
                onClick={() => handleVMAction(record.id, 'start')}
              />
            </Tooltip>
          )}
          {record.status === 'running' && (
            <Tooltip title="Stop VM">
              <Button 
                type="link" 
                icon={<StopOutlined />}
                onClick={() => handleVMAction(record.id, 'stop')}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete VM">
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleVMAction(record.id, 'delete')}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2>VM Management & Provisioning</h2>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedVM(null);
              setModalVisible(true);
            }}
          >
            Create VM
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={vms}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={selectedVM ? `VM: ${selectedVM.name}` : 'Create New VM'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedVM ? (
          <Tabs defaultActiveKey="details">
            <TabPane tab="Details" key="details">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Name">{selectedVM.name}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(selectedVM.status)}>{selectedVM.status?.toUpperCase()}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Template">{selectedVM.template}</Descriptions.Item>
                <Descriptions.Item label="Environment">
                  <Tag color={selectedVM.environment === 'production' ? 'red' : 'blue'}>
                    {selectedVM.environment}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="IP Address">{selectedVM.ipAddress}</Descriptions.Item>
                <Descriptions.Item label="Owner">{selectedVM.owner}</Descriptions.Item>
                <Descriptions.Item label="CPU">{selectedVM.cpu} cores</Descriptions.Item>
                <Descriptions.Item label="Memory">{selectedVM.memory} GB</Descriptions.Item>
                <Descriptions.Item label="Storage">{selectedVM.storage} GB</Descriptions.Item>
                <Descriptions.Item label="Created">{new Date(selectedVM.createdAt).toLocaleDateString()}</Descriptions.Item>
              </Descriptions>
            </TabPane>
            <TabPane tab="Performance" key="performance">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card size="small" title="CPU Usage">
                    <Progress type="circle" percent={selectedVM.cpuUsage || 45} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" title="Memory Usage">
                    <Progress type="circle" percent={selectedVM.memoryUsage || 67} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" title="Disk Usage">
                    <Progress type="circle" percent={selectedVM.diskUsage || 32} />
                  </Card>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Security" key="security">
              <Alert
                message="Security Compliance"
                description="VM security hardening and compliance status"
                type="info"
                showIcon
                icon={<SafetyCertificateOutlined />}
                style={{ marginBottom: 16 }}
              />
              <Descriptions bordered>
                <Descriptions.Item label="Firewall">Enabled</Descriptions.Item>
                <Descriptions.Item label="Antivirus">Up to date</Descriptions.Item>
                <Descriptions.Item label="OS Patches">Current</Descriptions.Item>
                <Descriptions.Item label="Encryption">Enabled</Descriptions.Item>
                <Descriptions.Item label="Backup">Daily</Descriptions.Item>
                <Descriptions.Item label="Compliance Score">
                  <Progress percent={92} size="small" status="success" />
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
          </Tabs>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateVM}
          >
            <Form.Item
              name="name"
              label="VM Name"
              rules={[{ required: true, message: 'Please enter VM name' }]}
            >
              <Input placeholder="VM name" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="template"
                  label="Template"
                  rules={[{ required: true, message: 'Please select template' }]}
                >
                  <Select placeholder="Select template">
                    {templates.map(template => (
                      <Option key={template.id} value={template.name}>
                        {template.name} - {template.os}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="environment"
                  label="Environment"
                  rules={[{ required: true, message: 'Please select environment' }]}
                >
                  <Select placeholder="Select environment">
                    <Option value="development">Development</Option>
                    <Option value="testing">Testing</Option>
                    <Option value="staging">Staging</Option>
                    <Option value="production">Production</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="cpu"
                  label="CPU Cores"
                  rules={[{ required: true, message: 'Please select CPU cores' }]}
                >
                  <Select placeholder="CPU cores">
                    <Option value={1}>1 Core</Option>
                    <Option value={2}>2 Cores</Option>
                    <Option value={4}>4 Cores</Option>
                    <Option value={8}>8 Cores</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="memory"
                  label="Memory (GB)"
                  rules={[{ required: true, message: 'Please select memory' }]}
                >
                  <Select placeholder="Memory">
                    <Option value={2}>2 GB</Option>
                    <Option value={4}>4 GB</Option>
                    <Option value={8}>8 GB</Option>
                    <Option value={16}>16 GB</Option>
                    <Option value={32}>32 GB</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="storage"
                  label="Storage (GB)"
                  rules={[{ required: true, message: 'Please select storage' }]}
                >
                  <Select placeholder="Storage">
                    <Option value={50}>50 GB</Option>
                    <Option value={100}>100 GB</Option>
                    <Option value={250}>250 GB</Option>
                    <Option value={500}>500 GB</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="purpose"
              label="Business Purpose"
              rules={[{ required: true, message: 'Please enter purpose' }]}
            >
              <TextArea rows={3} placeholder="What will this VM be used for?" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                Create VM
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

export default VMManagement;