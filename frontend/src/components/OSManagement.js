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
  Timeline,
  Badge,
  Tooltip,
  Space
} from 'antd';
import { 
  PlusOutlined, 
  DesktopOutlined, 
  SettingOutlined,
  SecurityScanOutlined,
  CloudDownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RobotOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;

const OSManagement = ({ user }) => {
  const [deployments, setDeployments] = useState([]);
  const [osImages, setOSImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDeployments();
    loadOSImages();
  }, []);

  const loadDeployments = async () => {
    setLoading(true);
    try {
      const data = await dataService.apiCall('/api/os-deployments');
      setDeployments(data);
    } catch (error) {
      console.error('Error loading deployments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOSImages = async () => {
    try {
      const images = [
        {
          id: 1,
          name: 'Windows 11 Pro',
          version: '22H2',
          type: 'desktop',
          hardened: true,
          description: 'Corporate Windows 11 with security hardening'
        },
        {
          id: 2,
          name: 'Windows Server 2022',
          version: '21H2',
          type: 'server',
          hardened: true,
          description: 'Enterprise server OS with security baseline'
        },
        {
          id: 3,
          name: 'Ubuntu Server',
          version: '22.04 LTS',
          type: 'server',
          hardened: true,
          description: 'Hardened Ubuntu server with CIS benchmarks'
        },
        {
          id: 4,
          name: 'CentOS',
          version: '8',
          type: 'server',
          hardened: false,
          description: 'Standard CentOS installation'
        }
      ];
      setOSImages(images);
    } catch (error) {
      console.error('Error loading OS images:', error);
    }
  };

  const handleCreateDeployment = async (values) => {
    try {
      await dataService.apiCall('/api/os-deployments', 'POST', {
        ...values,
        requestedBy: user.id,
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString()
      });
      setModalVisible(false);
      form.resetFields();
      loadDeployments();
    } catch (error) {
      console.error('Error creating deployment:', error);
    }
  };

  const handleStartDeployment = async (deploymentId) => {
    try {
      await dataService.apiCall(`/api/os-deployments/${deploymentId}/start`, 'POST');
      loadDeployments();
    } catch (error) {
      console.error('Error starting deployment:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'processing',
      preparing: 'warning',
      installing: 'processing',
      configuring: 'warning',
      hardening: 'orange',
      completed: 'success',
      failed: 'error'
    };
    return colors[status] || 'default';
  };

  const getDeploymentTypeColor = (type) => {
    const colors = {
      fresh: 'blue',
      upgrade: 'orange',
      migration: 'purple',
      recovery: 'red'
    };
    return colors[type] || 'default';
  };

  const columns = [
    {
      title: 'Deployment',
      dataIndex: 'id',
      key: 'id',
      render: (id, record) => (
        <div>
          <DesktopOutlined style={{ marginRight: 8 }} />
          OS-{id.toString().padStart(6, '0')}
          <div style={{ fontSize: '12px', color: '#666' }}>{record.targetAsset}</div>
        </div>
      )
    },
    {
      title: 'OS Image',
      key: 'osImage',
      render: (_, record) => (
        <div>
          <div>{record.osName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.osVersion}</div>
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'deploymentType',
      key: 'deploymentType',
      render: (type) => <Tag color={getDeploymentTypeColor(type)}>{type?.toUpperCase()}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress, record) => {
        if (record.status === 'installing' || record.status === 'configuring' || record.status === 'hardening') {
          return <Progress percent={progress || 0} size="small" />;
        }
        if (record.status === 'completed') {
          return <Progress percent={100} size="small" status="success" />;
        }
        return '-';
      }
    },
    {
      title: 'Scheduled',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Not scheduled'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedDeployment(record);
              setModalVisible(true);
            }}
          >
            View
          </Button>
          {user.role === 'IT Staff' && record.status === 'pending' && (
            <Button 
              type="link" 
              onClick={() => handleStartDeployment(record.id)}
            >
              Start
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
          <h2>OS Management & Deployment</h2>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedDeployment(null);
              setModalVisible(true);
            }}
          >
            New Deployment
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <DesktopOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                {deployments.filter(d => d.status === 'completed').length}
              </div>
              <div style={{ color: '#666' }}>Completed</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                {deployments.filter(d => ['installing', 'configuring', 'hardening'].includes(d.status)).length}
              </div>
              <div style={{ color: '#666' }}>In Progress</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <SafetyCertificateOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                {deployments.filter(d => d.hardened).length}
              </div>
              <div style={{ color: '#666' }}>Hardened</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ExclamationCircleOutlined style={{ fontSize: 24, color: '#f5222d', marginBottom: 8 }} />
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                {deployments.filter(d => d.status === 'failed').length}
              </div>
              <div style={{ color: '#666' }}>Failed</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={deployments}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={selectedDeployment ? `OS Deployment OS-${selectedDeployment.id?.toString().padStart(6, '0')}` : 'New OS Deployment'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedDeployment ? (
          <Tabs defaultActiveKey="details">
            <TabPane tab="Details" key="details">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <strong>Target Asset:</strong> {selectedDeployment.targetAsset}
                </Col>
                <Col span={12}>
                  <strong>OS Image:</strong> {selectedDeployment.osName} {selectedDeployment.osVersion}
                </Col>
                <Col span={12}>
                  <strong>Deployment Type:</strong> 
                  <Tag color={getDeploymentTypeColor(selectedDeployment.deploymentType)} style={{ marginLeft: 8 }}>
                    {selectedDeployment.deploymentType?.toUpperCase()}
                  </Tag>
                </Col>
                <Col span={12}>
                  <strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedDeployment.status)} style={{ marginLeft: 8 }}>
                    {selectedDeployment.status?.toUpperCase()}
                  </Tag>
                </Col>
                <Col span={12}>
                  <strong>Security Hardening:</strong> 
                  <Badge status={selectedDeployment.hardened ? 'success' : 'default'} 
                         text={selectedDeployment.hardened ? 'Enabled' : 'Disabled'} />
                </Col>
                <Col span={12}>
                  <strong>Progress:</strong> 
                  <Progress percent={selectedDeployment.progress || 0} size="small" style={{ marginLeft: 8 }} />
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Deployment Steps" key="steps">
              <Steps 
                direction="vertical" 
                current={
                  selectedDeployment.status === 'completed' ? 5 :
                  selectedDeployment.status === 'hardening' ? 4 :
                  selectedDeployment.status === 'configuring' ? 3 :
                  selectedDeployment.status === 'installing' ? 2 :
                  selectedDeployment.status === 'preparing' ? 1 : 0
                }
              >
                <Step title="Preparation" description="Preparing deployment environment" />
                <Step title="OS Installation" description="Installing operating system" />
                <Step title="Configuration" description="Applying system configuration" />
                <Step title="Security Hardening" description="Implementing security baseline" />
                <Step title="Validation" description="Testing and validation" />
                <Step title="Completed" description="Deployment successful" />
              </Steps>
            </TabPane>
            <TabPane tab="Security Hardening" key="security">
              <Alert
                message="Security Hardening Applied"
                description="OS deployment includes automated security hardening based on industry standards"
                type="success"
                showIcon
                icon={<SafetyCertificateOutlined />}
                style={{ marginBottom: 16 }}
              />
              <Timeline>
                <Timeline.Item color="green">
                  <strong>CIS Benchmarks Applied</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>Industry standard security configurations</div>
                </Timeline.Item>
                <Timeline.Item color="green">
                  <strong>Windows Defender Configured</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>Real-time protection enabled</div>
                </Timeline.Item>
                <Timeline.Item color="green">
                  <strong>Firewall Rules Applied</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>Network security policies enforced</div>
                </Timeline.Item>
                <Timeline.Item color="green">
                  <strong>User Account Control</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>UAC settings optimized</div>
                </Timeline.Item>
              </Timeline>
            </TabPane>
            <TabPane tab="Automation Log" key="log">
              <Alert
                message="Automated OS Deployment"
                description="Full lifecycle automation from installation to security hardening"
                type="info"
                showIcon
                icon={<RobotOutlined />}
                style={{ marginBottom: 16 }}
              />
              <Timeline>
                <Timeline.Item color="green">
                  <strong>PXE Boot Initiated</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>Network boot sequence started</div>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <strong>OS Image Deployed</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>Base OS installation completed</div>
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <strong>Configuration Scripts Running</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>Applying corporate configuration</div>
                </Timeline.Item>
                <Timeline.Item color="green">
                  <strong>Security Hardening Complete</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>All security policies applied</div>
                </Timeline.Item>
              </Timeline>
            </TabPane>
          </Tabs>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateDeployment}
          >
            <Form.Item
              name="targetAsset"
              label="Target Asset"
              rules={[{ required: true, message: 'Please enter target asset' }]}
            >
              <Input placeholder="Asset name or IP address" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="osImageId"
                  label="OS Image"
                  rules={[{ required: true, message: 'Please select OS image' }]}
                >
                  <Select placeholder="Select OS image">
                    {osImages.map(image => (
                      <Option key={image.id} value={image.id}>
                        {image.name} {image.version}
                        {image.hardened && <Tag color="green" size="small" style={{ marginLeft: 8 }}>Hardened</Tag>}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="deploymentType"
                  label="Deployment Type"
                  rules={[{ required: true, message: 'Please select deployment type' }]}
                >
                  <Select placeholder="Select deployment type">
                    <Option value="fresh">Fresh Installation</Option>
                    <Option value="upgrade">OS Upgrade</Option>
                    <Option value="migration">System Migration</Option>
                    <Option value="recovery">Disaster Recovery</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="hardened"
              label="Security Hardening"
              rules={[{ required: true, message: 'Please select hardening option' }]}
            >
              <Select placeholder="Apply security hardening">
                <Option value={true}>Enable Security Hardening</Option>
                <Option value={false}>Standard Installation</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="notes"
              label="Deployment Notes"
            >
              <TextArea rows={3} placeholder="Additional deployment instructions or notes" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                Schedule Deployment
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

export default OSManagement;