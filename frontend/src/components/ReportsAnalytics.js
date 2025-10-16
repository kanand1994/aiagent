import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col,
  Select,
  DatePicker,
  Button,
  Table,
  Tabs,
  Statistic,
  Progress,
  Alert,
  Space,
  Divider
} from 'antd';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  FileTextOutlined,
  DownloadOutlined,
  PrinterOutlined,
  MailOutlined,
  CalendarOutlined,
  RiseOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ReportsAnalytics = ({ user }) => {
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    loadReportData();
  }, [selectedReport, dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const data = await dataService.apiCall(`/api/reports/${selectedReport}`, 'POST', {
        dateRange: dateRange.map(d => d?.format('YYYY-MM-DD'))
      });
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
      // Set mock data for demonstration
      setReportData({
        overview: {
          totalTickets: 1247,
          resolvedTickets: 1089,
          avgResolutionTime: 4.2,
          customerSatisfaction: 4.6,
          ticketTrends: [
            { month: 'Jan', created: 120, resolved: 115 },
            { month: 'Feb', created: 135, resolved: 128 },
            { month: 'Mar', created: 98, resolved: 105 },
            { month: 'Apr', created: 142, resolved: 138 },
            { month: 'May', created: 156, resolved: 149 },
            { month: 'Jun', created: 134, resolved: 141 }
          ],
          categoryBreakdown: [
            { name: 'Hardware', value: 35, color: '#8884d8' },
            { name: 'Software', value: 28, color: '#82ca9d' },
            { name: 'Network', value: 22, color: '#ffc658' },
            { name: 'Security', value: 15, color: '#ff7300' }
          ]
        },
        performance: {
          slaCompliance: 94.5,
          firstCallResolution: 78.2,
          escalationRate: 12.3,
          performanceTrends: [
            { week: 'W1', sla: 92, fcr: 75, escalation: 15 },
            { week: 'W2', sla: 94, fcr: 78, escalation: 13 },
            { week: 'W3', sla: 96, fcr: 80, escalation: 11 },
            { week: 'W4', sla: 95, fcr: 77, escalation: 12 }
          ]
        },
        automation: {
          automationRate: 67.8,
          timesSaved: 2340,
          costSavings: 125000,
          automationTrends: [
            { category: 'Password Resets', automated: 95, manual: 5 },
            { category: 'Software Installation', automated: 78, manual: 22 },
            { category: 'VM Provisioning', automated: 89, manual: 11 },
            { category: 'User Onboarding', automated: 45, manual: 55 }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = (format) => {
    // Handle report export
    console.log(`Exporting report in ${format} format`);
  };

  const renderOverviewReport = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Tickets"
              value={reportData.overview?.totalTickets || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Resolution Rate"
              value={((reportData.overview?.resolvedTickets || 0) / (reportData.overview?.totalTickets || 1) * 100).toFixed(1)}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Avg Resolution Time"
              value={reportData.overview?.avgResolutionTime || 0}
              suffix="hours"
              precision={1}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Customer Satisfaction"
              value={reportData.overview?.customerSatisfaction || 0}
              suffix="/5"
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Ticket Trends" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.overview?.ticketTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#1890ff" strokeWidth={2} name="Created" />
                <Line type="monotone" dataKey="resolved" stroke="#52c41a" strokeWidth={2} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Category Breakdown" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.overview?.categoryBreakdown || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(reportData.overview?.categoryBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderPerformanceReport = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                SLA Compliance
              </div>
              <Progress 
                type="circle" 
                percent={reportData.performance?.slaCompliance || 0} 
                strokeColor="#52c41a"
                format={percent => `${percent}%`}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                First Call Resolution
              </div>
              <Progress 
                type="circle" 
                percent={reportData.performance?.firstCallResolution || 0} 
                strokeColor="#1890ff"
                format={percent => `${percent}%`}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                Escalation Rate
              </div>
              <Progress 
                type="circle" 
                percent={reportData.performance?.escalationRate || 0} 
                strokeColor="#faad14"
                format={percent => `${percent}%`}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Performance Trends" style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={reportData.performance?.performanceTrends || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="sla" stackId="1" stroke="#52c41a" fill="#52c41a" name="SLA Compliance %" />
            <Area type="monotone" dataKey="fcr" stackId="2" stroke="#1890ff" fill="#1890ff" name="First Call Resolution %" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const renderAutomationReport = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Automation Rate"
              value={reportData.automation?.automationRate || 0}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#52c41a' }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Hours Saved"
              value={reportData.automation?.timesSaved || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Cost Savings"
              value={reportData.automation?.costSavings || 0}
              prefix="$"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Automation by Category" style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData.automation?.automationTrends || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="automated" stackId="a" fill="#52c41a" name="Automated %" />
            <Bar dataKey="manual" stackId="a" fill="#ff4d4f" name="Manual %" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2>Reports & Analytics</h2>
        </Col>
        <Col>
          <Space>
            <Select
              value={selectedReport}
              onChange={setSelectedReport}
              style={{ width: 200 }}
            >
              <Option value="overview">Overview Report</Option>
              <Option value="performance">Performance Report</Option>
              <Option value="automation">Automation Report</Option>
              <Option value="security">Security Report</Option>
              <Option value="compliance">Compliance Report</Option>
            </Select>
            <RangePicker onChange={setDateRange} />
            <Button icon={<DownloadOutlined />} onClick={() => handleExportReport('pdf')}>
              Export PDF
            </Button>
            <Button icon={<PrinterOutlined />} onClick={() => handleExportReport('print')}>
              Print
            </Button>
          </Space>
        </Col>
      </Row>

      <Alert
        message="Executive Dashboard"
        description="Comprehensive analytics and reporting for IT operations management"
        type="info"
        showIcon
        icon={<DashboardOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Card>
        <Tabs activeKey={selectedReport} onChange={setSelectedReport}>
          <TabPane tab="Overview" key="overview">
            {renderOverviewReport()}
          </TabPane>
          <TabPane tab="Performance" key="performance">
            {renderPerformanceReport()}
          </TabPane>
          <TabPane tab="Automation" key="automation">
            {renderAutomationReport()}
          </TabPane>
          <TabPane tab="Security" key="security">
            <Alert message="Security Report" description="Security metrics and compliance status" type="warning" />
          </TabPane>
          <TabPane tab="Compliance" key="compliance">
            <Alert message="Compliance Report" description="Regulatory compliance and audit trails" type="success" />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ReportsAnalytics;