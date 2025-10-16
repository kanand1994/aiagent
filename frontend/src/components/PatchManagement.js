import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Tag, 
  Row, 
  Col,
  Tabs,
  Alert,
  Progress,
  Timeline,
  Badge,
  Tooltip,
  Space,
  Select
} from 'antd';
import { 
  SecurityScanOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  BugOutlined,
  SafetyCertificateOutlined,
  RobotOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { Option } = Select;
const { TabPane } = Tabs;

const PatchManagement = ({ user }) => {
  const [patches, setPatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatch, setSelectedPatch] = useState(null);
  const [scanRunning, setScanRunning] = useState(false);

  useEffect(() => {
    loadPatches();
  }, []);

  const loadPatches = async () => {
    setLoading(true);
    try {
      const data = await dataService.apiCall('/api/patches');
      setPatches(data);
    } catch (error) {
      console.error('Error loading patches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScan = async () => {
    try {
      setScanRunning(true);
      await dataService.apiCall('/api/patches/scan', 'POST');
      setTimeout(() => {
        loadPatches();
        setScanRunning(false);
      }, 5000);
    } catch (error) {
      console.error('Error running patch scan:', error);
      setScanRunning(false);
    }
  };

  const handleInstallPatch = async (patchId) => {
    try {
      await dataService.apiCall(`/api/patches/${patchId}/install`, 'POST');
      loadPatches();
    } catch (error) {
      console.error('Error installing patch:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'red',
      high: 'orange',
      medium: 'yellow',
      low: 'green'
    };
    return colors[severity] || 'default';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: <ExclamationCircleOutlined />,
      high: <WarningOutlined />,
      medium: <ClockCircleOutlined />,
      low: <CheckCircleOutlined />
    };
    return icons[severity] || <ClockCircleOutlined />;
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'processing',
      scheduled: 'warning',
      installing: 'processing',
      installed: 'success',
      failed: 'error'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Patch',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <BugOutlined style={{ marginRight: 8 }} />
          {name}
          <div style={{ fontSize: '12px', color: '#666' }}>{record.kb}</div>
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{type}</Tag>
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)} icon={getSeverityIcon(severity)}>
          {severity?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Affected Assets',
      dataIndex: 'affectedAssets',
      key: 'affectedAssets',
      render: (count) => <Badge count={count} showZero />
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
    },
    {
      title: 'Release Date',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedPatch(record);
              setModalVisible(true);
            }}
          >
            View
          </Button>
          {user.role === 'IT Staff' && record.status === 'available' && (
            <Button 
              type="link" 
              onClick={() => handleInstallPatch(record.id)}
            >
              Install
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
          <h2>Patch Management</h2>
        </Col>
        <Col>
          <Button 
            type="default" 
            icon={<SecurityScanOutlined />}
            onClick={handleRunScan}
            loading={scanRunning}
          >
            Scan for Patches
          </Button>
        </Col>
      </Row>

      {scanRunning && (
        <Alert
          message="Patch Intelligence Scan Running"
          description="Scanning systems for available patches and security updates..."
          type="info"
          showIcon
          icon={<RobotOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={patches}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={selectedPatch ? `Patch: ${selectedPatch.name}` : 'Patch Details'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedPatch && (
          <Tabs defaultActiveKey="details">
            <TabPane tab="Details" key="details">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <strong>Patch Name:</strong> {selectedPatch.name}
                </Col>
                <Col span={12}>
                  <strong>KB Number:</strong> {selectedPatch.kb}
                </Col>
                <Col span={12}>
                  <strong>Type:</strong> <Tag>{selectedPatch.type}</Tag>
                </Col>
                <Col span={12}>
                  <strong>Severity:</strong> 
                  <Tag color={getSeverityColor(selectedPatch.severity)} style={{ marginLeft: 8 }}>
                    {selectedPatch.severity?.toUpperCase()}
                  </Tag>
                </Col>
                <Col span={24}>
                  <strong>Description:</strong>
                  <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                    {selectedPatch.description}
                  </div>
                </Col>
                <Col span={24}>
                  <strong>CVE References:</strong>
                  <div style={{ marginTop: 8 }}>
                    {selectedPatch.cveReferences?.map(cve => (
                      <Tag key={cve} color="red">{cve}</Tag>
                    ))}
                  </div>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Affected Systems" key="systems">
              <Table
                size="small"
                columns={[
                  { title: 'Asset', dataIndex: 'name', key: 'name' },
                  { title: 'OS', dataIndex: 'os', key: 'os' },
                  { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag> },
                  { title: 'Last Scan', dataIndex: 'lastScan', key: 'lastScan' }
                ]}
                dataSource={selectedPatch.affectedSystems || []}
                pagination={false}
              />
            </TabPane>
            <TabPane tab="Compliance" key="compliance">
              <Alert
                message="Compliance Status"
                description="Patch compliance and regulatory requirements"
                type="info"
                showIcon
                icon={<SafetyCertificateOutlined />}
                style={{ marginBottom: 16 }}
              />
              <Timeline>
                <Timeline.Item color="green">
                  <strong>Patch Available</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>Microsoft released security update</div>
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <strong>Compliance Window</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>30 days to install critical patches</div>
                </Timeline.Item>
                <Timeline.Item color="red">
                  <strong>Risk Assessment</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>High risk if not patched within window</div>
                </Timeline.Item>
              </Timeline>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default PatchManagement;