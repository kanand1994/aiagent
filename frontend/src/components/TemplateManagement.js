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
  Upload,
  Steps,
  Timeline,
  Badge,
  Tooltip,
  Space,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  CloudServerOutlined, 
  UploadOutlined,
  DownloadOutlined,
  CopyOutlined,
  DeleteOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  CodeOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Dragger } = Upload;

const TemplateManagement = ({ user }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [buildInProgress, setBuildInProgress] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await dataService.apiCall('/api/templates');
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (values) => {
    try {
      await dataService.apiCall('/api/templates', 'POST', {
        ...values,
        createdBy: user.id,
        status: 'building',
        createdAt: new Date().toISOString()
      });
      setModalVisible(false);
      form.resetFields();
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleBuildTemplate = async (templateId) => {
    try {
      setBuildInProgress(true);
      await dataService.apiCall(`/api/templates/${templateId}/build`, 'POST');
      setTimeout(() => {
        loadTemplates();
        setBuildInProgress(false);
      }, 10000); // Simulate build time
    } catch (error) {
      console.error('Error building template:', error);
      setBuildInProgress(false);
    }
  };

  const handleCloneTemplate = async (templateId) => {
    try {
      await dataService.apiCall(`/api/templates/${templateId}/clone`, 'POST');
      loadTemplates();
    } catch (error) {
      console.error('Error cloning template:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      building: 'processing',
      ready: 'success',
      failed: 'error',
      deprecated: 'default',
      testing: 'warning'
    };
    return colors[status] || 'default';
  };

  const getOSIcon = (os) => {
    if (os.toLowerCase().includes('windows')) return '🪟';
    if (os.toLowerCase().includes('ubuntu')) return '🐧';
    if (os.toLowerCase().includes('centos')) return '🔴';
    if (os.toLowerCase().includes('rhel')) return '🎩';
    return '💻';
  };

  const columns = [
    {
      title: 'Template',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <CloudServerOutlined style={{ marginRight: 8 }} />
          {name}
          <div style={{ fontSize: '12px', color: '#666' }}>
            {getOSIcon(record.operatingSystem)} {record.operatingSystem} {record.version}
          </div>
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size) => `${size} GB`
    },
    {
      title: 'Usage Count',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count) => <Badge count={count} showZero />
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="link" 
              icon={<SettingOutlined />}
              onClick={() => {
                setSelectedTemplate(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Clone Template">
            <Button 
              type="link" 
              icon={<CopyOutlined />}
              onClick={() => handleCloneTemplate(record.id)}
            />
          </Tooltip>
          {record.status === 'ready' && (
            <Tooltip title="Rebuild Template">
              <Button 
                type="link" 
                icon={<RobotOutlined />}
                onClick={() => handleBuildTemplate(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete Template">
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => {/* Handle delete */}}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const uploadProps = {
    name: 'template',
    multiple: false,
    accept: '.ova,.vmdk,.iso',
    action: '/api/templates/upload',
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        loadTemplates();
      }
    }
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2>OVA/Template Creation & Management</h2>
        </Col>
        <Col>
          <Space>
            <Button 
              type="default" 
              icon={<UploadOutlined />}
              onClick={() => {/* Handle upload modal */}}
            >
              Upload Template
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedTemplate(null);
                setModalVisible(true);
              }}
            >
              Create Template
            </Button>
          </Space>
        </Col>
      </Row>

      {buildInProgress && (
        <Alert
          message="Template Build in Progress"
          description="Automated template creation and optimization is running..."
          type="info"
          showIcon
          icon={<RobotOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CloudServerOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                {templates.filter(t => t.status === 'ready').length}
              </div>
              <div style={{ color: '#666' }}>Ready Templates</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <RobotOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                {templates.reduce((sum, t) => sum + (t.usageCount || 0), 0)}
              </div>
              <div style={{ color: '#666' }}>Total Deployments</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                {templates.filter(t => t.status === 'building').length}
              </div>
              <div style={{ color: '#666' }}>Building</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <SafetyCertificateOutlined style={{ fontSize: 24, color: '#722ed1', marginBottom: 8 }} />
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                {templates.filter(t => t.hardened).length}
              </div>
              <div style={{ color: '#666' }}>Hardened</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={templates}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={selectedTemplate ? `Template: ${selectedTemplate.name}` : 'Create New Template'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={900}
        footer={null}
      >
        {selectedTemplate ? (
          <Tabs defaultActiveKey="details">
            <TabPane tab="Details" key="details">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <strong>Name:</strong> {selectedTemplate.name}
                </Col>
                <Col span={12}>
                  <strong>Operating System:</strong> {selectedTemplate.operatingSystem} {selectedTemplate.version}
                </Col>
                <Col span={12}>
                  <strong>Type:</strong> <Tag color="blue">{selectedTemplate.type}</Tag>
                </Col>
                <Col span={12}>
                  <strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedTemplate.status)} style={{ marginLeft: 8 }}>
                    {selectedTemplate.status?.toUpperCase()}
                  </Tag>
                </Col>
                <Col span={12}>
                  <strong>Size:</strong> {selectedTemplate.size} GB
                </Col>
                <Col span={12}>
                  <strong>Usage Count:</strong> {selectedTemplate.usageCount || 0}
                </Col>
                <Col span={12}>
                  <strong>Security Hardened:</strong> 
                  <Badge status={selectedTemplate.hardened ? 'success' : 'default'} 
                         text={selectedTemplate.hardened ? 'Yes' : 'No'} />
                </Col>
                <Col span={12}>
                  <strong>Created By:</strong> {selectedTemplate.createdBy}
                </Col>
                <Col span={24}>
                  <strong>Description:</strong>
                  <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                    {selectedTemplate.description}
                  </div>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Build Process" key="build">
              <Steps 
                direction="vertical" 
                current={
                  selectedTemplate.status === 'ready' ? 5 :
                  selectedTemplate.status === 'testing' ? 4 :
                  selectedTemplate.status === 'building' ? 3 : 0
                }
              >
                <Step title="Base OS Installation" description="Installing base operating system" />
                <Step title="Software Installation" description="Installing required software packages" />
                <Step title="Configuration" description="Applying system configuration" />
                <Step title="Security Hardening" description="Implementing security baseline" />
                <Step title="Testing & Validation" description="Running automated tests" />
                <Step title="Template Ready" description="Template available for deployment" />
              </Steps>
            </TabPane>
            <TabPane tab="Software Packages" key="software">
              <Table
                size="small"
                columns={[
                  { title: 'Package', dataIndex: 'name', key: 'name' },
                  { title: 'Version', dataIndex: 'version', key: 'version' },
                  { title: 'Type', dataIndex: 'type', key: 'type', render: (type) => <Tag size="small">{type}</Tag> },
                  { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status === 'installed' ? 'green' : 'orange'} size="small">{status}</Tag> }
                ]}
                dataSource={selectedTemplate.installedSoftware || [
                  { name: 'Windows Updates', version: 'Latest', type: 'System', status: 'installed' },
                  { name: 'Antivirus', version: '2024.1', type: 'Security', status: 'installed' },
                  { name: 'Office 365', version: '2024', type: 'Productivity', status: 'installed' }
                ]}
                pagination={false}
              />
            </TabPane>
            <TabPane tab="Security Hardening" key="security">
              <Alert
                message="Security Hardening Applied"
                description="Template includes automated security hardening based on industry standards"
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
                <Timeline.Item color="green">
                  <strong>Registry Hardening</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>Security registry keys configured</div>
                </Timeline.Item>
              </Timeline>
            </TabPane>
            <TabPane tab="Automation Scripts" key="scripts">
              <Alert
                message="Automated Template Creation"
                description="Template lifecycle is fully automated from creation to deployment"
                type="info"
                showIcon
                icon={<CodeOutlined />}
                style={{ marginBottom: 16 }}
              />
              <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, fontFamily: 'monospace' }}>
                <div># Template Build Script</div>
                <div>1. Download base OS ISO</div>
                <div>2. Create VM with specified resources</div>
                <div>3. Install OS with unattended configuration</div>
                <div>4. Install software packages from manifest</div>
                <div>5. Apply security hardening policies</div>
                <div>6. Run validation tests</div>
                <div>7. Create OVA template</div>
                <div>8. Upload to template repository</div>
              </div>
            </TabPane>
          </Tabs>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateTemplate}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Template Name"
                  rules={[{ required: true, message: 'Please enter template name' }]}
                >
                  <Input placeholder="Template name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Template Type"
                  rules={[{ required: true, message: 'Please select template type' }]}
                >
                  <Select placeholder="Select template type">
                    <Option value="server">Server Template</Option>
                    <Option value="desktop">Desktop Template</Option>
                    <Option value="container">Container Template</Option>
                    <Option value="appliance">Virtual Appliance</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="operatingSystem"
                  label="Operating System"
                  rules={[{ required: true, message: 'Please select OS' }]}
                >
                  <Select placeholder="Select operating system">
                    <Option value="Windows Server 2022">Windows Server 2022</Option>
                    <Option value="Windows 11 Pro">Windows 11 Pro</Option>
                    <Option value="Ubuntu 22.04 LTS">Ubuntu 22.04 LTS</Option>
                    <Option value="CentOS 8">CentOS 8</Option>
                    <Option value="RHEL 9">Red Hat Enterprise Linux 9</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="version"
                  label="OS Version"
                  rules={[{ required: true, message: 'Please enter OS version' }]}
                >
                  <Input placeholder="OS version" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea rows={3} placeholder="Template description and use case" />
            </Form.Item>

            <Form.Item
              name="hardened"
              label="Security Hardening"
              rules={[{ required: true, message: 'Please select hardening option' }]}
            >
              <Select placeholder="Apply security hardening">
                <Option value={true}>Enable Security Hardening</Option>
                <Option value={false}>Standard Configuration</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="softwarePackages"
              label="Software Packages"
            >
              <Select mode="multiple" placeholder="Select software to include">
                <Option value="office365">Microsoft Office 365</Option>
                <Option value="chrome">Google Chrome</Option>
                <Option value="firefox">Mozilla Firefox</Option>
                <Option value="vscode">Visual Studio Code</Option>
                <Option value="docker">Docker Desktop</Option>
                <Option value="nodejs">Node.js</Option>
                <Option value="python">Python</Option>
                <Option value="git">Git</Option>
              </Select>
            </Form.Item>

            <Divider />

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                Create Template
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

export default TemplateManagement;