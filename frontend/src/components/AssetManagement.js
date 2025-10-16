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
  Descriptions,
  Timeline,
  Badge,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  ScanOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  LaptopOutlined,
  MobileOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { Option } = Select;
const { TabPane } = Tabs;

const AssetManagement = ({ user }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [discoveryRunning, setDiscoveryRunning] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAssets();
    loadDiscoveryStatus();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await dataService.apiCall('/api/assets');
      setAssets(data);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiscoveryStatus = async () => {
    try {
      const status = await dataService.apiCall('/api/assets/discovery/status');
      setDiscoveryRunning(status.running);
    } catch (error) {
      console.error('Error loading discovery status:', error);
    }
  };

  const handleCreateAsset = async (values) => {
    try {
      await dataService.apiCall('/api/assets', 'POST', {
        ...values,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
      setModalVisible(false);
      form.resetFields();
      loadAssets();
    } catch (error) {
      console.error('Error creating asset:', error);
    }
  };

  const handleRunDiscovery = async () => {
    try {
      setDiscoveryRunning(true);
      await dataService.apiCall('/api/assets/discovery/run', 'POST');
      setTimeout(() => {
        loadAssets();
        setDiscoveryRunning(false);
      }, 5000); // Simulate discovery time
    } catch (error) {
      console.error('Error running discovery:', error);
      setDiscoveryRunning(false);
    }
  };

  const getAssetIcon = (type) => {
    const icons = {
      server: <DatabaseOutlined />,
      workstation: <LaptopOutlined />,
      laptop: <LaptopOutlined />,
      mobile: <MobileOutlined />,
      vm: <CloudServerOutlined />
    };
    return icons[type] || <DatabaseOutlined />;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'default',
      maintenance: 'warning',
      retired: 'error',
      unknown: 'processing'
    };
    return colors[status] || 'default';
  };

  const getComplianceColor = (compliance) => {
    if (compliance >= 90) return 'success';
    if (compliance >= 70) return 'warning';
    return 'error';
  };

  const columns = [
    {
      title: 'Asset',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          {getAssetIcon(record.type)} {name}
          <div style={{ fontSize: '12px', color: '#666' }}>{record.serialNumber}</div>
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{type?.toUpperCase()}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Badge status={getStatusColor(status)} text={status?.toUpperCase()} />
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner'
    },
    {
      title: 'Compliance',
      dataIndex: 'complianceScore',
      key: 'complianceScore',
      render: (score) => (
        <Progress 
          percent={score || 0} 
          size="small" 
          status={getComplianceColor(score)}
          format={percent => `${percent}%`}
        />
      )
    },
    {
      title: 'Last Scan',
      dataIndex: 'lastScan',
      key: 'lastScan',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Never'
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
              setSelectedAsset(record);
              setModalVisible(true);
            }}
          >
            View
          </Button>
          <Button 
            type="link" 
            icon={<ScanOutlined />}
            onClick={() => handleScanAsset(record.id)}
          >
            Scan
          </Button>
        </div>
      )
    }
  ];

  const handleScanAsset = async (assetId) => {
    try {
      await dataService.apiCall(`/api/assets/${assetId}/scan`, 'POST');
      loadAssets();
    } catch (error) {
      console.error('Error scanning asset:', error);
    }
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2>Asset & Configuration Management</h2>
        </Col>
        <Col>
          <Button 
            type="default" 
            icon={<ScanOutlined />}
            onClick={handleRunDiscovery}
            loading={discoveryRunning}
            style={{ marginRight: 8 }}
          >
            Run Discovery
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedAsset(null);
              setModalVisible(true);
            }}
          >
            Add Asset
          </Button>
        </Col>
      </Row>

      {discoveryRunning && (
        <Alert
          message="Asset Discovery Running"
          description="Scanning network for new assets and configuration changes..."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={assets}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={selectedAsset ? `Asset: ${selectedAsset.name}` : 'Add New Asset'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedAsset ? (
          <Tabs defaultActiveKey="details">
            <TabPane tab="Details" key="details">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Name">{selectedAsset.name}</Descriptions.Item>
                <Descriptions.Item label="Type">
                  <Tag>{selectedAsset.type?.toUpperCase()}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Serial Number">{selectedAsset.serialNumber}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Badge status={getStatusColor(selectedAsset.status)} text={selectedAsset.status?.toUpperCase()} />
                </Descriptions.Item>
                <Descriptions.Item label="Location">{selectedAsset.location}</Descriptions.Item>
                <Descriptions.Item label="Owner">{selectedAsset.owner}</Descriptions.Item>
                <Descriptions.Item label="IP Address">{selectedAsset.ipAddress}</Descriptions.Item>
                <Descriptions.Item label="MAC Address">{selectedAsset.macAddress}</Descriptions.Item>
                <Descriptions.Item label="OS">{selectedAsset.operatingSystem}</Descriptions.Item>
                <Descriptions.Item label="OS Version">{selectedAsset.osVersion}</Descriptions.Item>
                <Descriptions.Item label="CPU">{selectedAsset.cpu}</Descriptions.Item>
                <Descriptions.Item label="Memory">{selectedAsset.memory}</Descriptions.Item>
                <Descriptions.Item label="Storage">{selectedAsset.storage}</Descriptions.Item>
                <Descriptions.Item label="Compliance Score">
                  <Progress 
                    percent={selectedAsset.complianceScore || 0} 
                    size="small" 
                    status={getComplianceColor(selectedAsset.complianceScore)}
                  />
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            <TabPane tab="Configuration" key="configuration">
              <Alert
                message="Configuration Drift Detection"
                description="Monitoring for unauthorized changes to system configuration"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Timeline>
                <Timeline.Item color="green">
                  <strong>Baseline Configuration Set</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>2024-01-15 10:30 AM</div>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <strong>Configuration Scan Completed</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>2024-01-16 02:00 AM</div>
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <strong>Drift Detected: Unauthorized Software</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>2024-01-16 09:15 AM</div>
                </Timeline.Item>
              </Timeline>
            </TabPane>
            <TabPane tab="Software" key="software">
              <Table
                size="small"
                columns={[
                  { title: 'Software', dataIndex: 'name', key: 'name' },
                  { title: 'Version', dataIndex: 'version', key: 'version' },
                  { title: 'License', dataIndex: 'license', key: 'license' },
                  { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status === 'compliant' ? 'green' : 'red'}>{status}</Tag> }
                ]}
                dataSource={selectedAsset.installedSoftware || []}
                pagination={false}
              />
            </TabPane>
          </Tabs>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateAsset}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Asset Name"
                  rules={[{ required: true, message: 'Please enter asset name' }]}
                >
                  <Input placeholder="Asset name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Asset Type"
                  rules={[{ required: true, message: 'Please select asset type' }]}
                >
                  <Select placeholder="Select asset type">
                    <Option value="server">Server</Option>
                    <Option value="workstation">Workstation</Option>
                    <Option value="laptop">Laptop</Option>
                    <Option value="mobile">Mobile Device</Option>
                    <Option value="vm">Virtual Machine</Option>
                    <Option value="network">Network Device</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="serialNumber"
                  label="Serial Number"
                  rules={[{ required: true, message: 'Please enter serial number' }]}
                >
                  <Input placeholder="Serial number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="location"
                  label="Location"
                  rules={[{ required: true, message: 'Please enter location' }]}
                >
                  <Input placeholder="Physical location" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="owner"
                  label="Owner"
                  rules={[{ required: true, message: 'Please enter owner' }]}
                >
                  <Input placeholder="Asset owner" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select placeholder="Select status">
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                    <Option value="maintenance">Maintenance</Option>
                    <Option value="retired">Retired</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ipAddress" label="IP Address">
                  <Input placeholder="IP address" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="macAddress" label="MAC Address">
                  <Input placeholder="MAC address" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                Add Asset
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

export default AssetManagement;