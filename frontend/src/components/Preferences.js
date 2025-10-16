import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Switch, 
  Select, 
  Button, 
  Row, 
  Col, 
  Divider,
  message,
  Slider,
  Radio,
  InputNumber
} from 'antd';
import { 
  SaveOutlined,
  SettingOutlined,
  BellOutlined,
  EyeOutlined,
  SecurityScanOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;

const Preferences = ({ user }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage for demo
      localStorage.setItem('userPreferences', JSON.stringify(values));
      
      message.success('Preferences saved successfully!');
    } catch (error) {
      message.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    form.setFieldsValue({
      theme: 'light',
      language: 'English',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12',
      autoRefresh: true,
      refreshInterval: 30,
      emailNotifications: true,
      pushNotifications: true,
      soundNotifications: false,
      desktopNotifications: true,
      notificationFrequency: 'immediate',
      dashboardLayout: 'default',
      itemsPerPage: 10,
      defaultView: 'dashboard',
      showTutorials: true,
      compactMode: false,
      twoFactorAuth: false,
      sessionTimeout: 60,
      passwordExpiry: 90,
      loginNotifications: true
    });
    message.info('Preferences reset to defaults');
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h2>
            <SettingOutlined style={{ marginRight: 8 }} />
            Preferences
          </h2>
        </Col>
        <Col>
          <Button 
            style={{ marginRight: 8 }}
            onClick={resetToDefaults}
          >
            Reset to Defaults
          </Button>
          <Button 
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={loading}
          >
            Save Preferences
          </Button>
        </Col>
      </Row>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          theme: 'light',
          language: 'English',
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12',
          autoRefresh: true,
          refreshInterval: 30,
          emailNotifications: true,
          pushNotifications: true,
          soundNotifications: false,
          desktopNotifications: true,
          notificationFrequency: 'immediate',
          dashboardLayout: 'default',
          itemsPerPage: 10,
          defaultView: 'dashboard',
          showTutorials: true,
          compactMode: false,
          twoFactorAuth: false,
          sessionTimeout: 60,
          passwordExpiry: 90,
          loginNotifications: true
        }}
      >
        <Row gutter={[24, 24]}>
          {/* Appearance Settings */}
          <Col xs={24} lg={12}>
            <Card title={<><EyeOutlined style={{ marginRight: 8 }} />Appearance</>}>
              <Form.Item
                name="theme"
                label="Theme"
              >
                <Radio.Group>
                  <Radio value="light">Light</Radio>
                  <Radio value="dark">Dark</Radio>
                  <Radio value="auto">Auto</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="language"
                label="Language"
              >
                <Select>
                  <Option value="English">English</Option>
                  <Option value="Spanish">Español</Option>
                  <Option value="French">Français</Option>
                  <Option value="German">Deutsch</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="compactMode"
                label="Compact Mode"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="showTutorials"
                label="Show Tutorial Tips"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>

          {/* Regional Settings */}
          <Col xs={24} lg={12}>
            <Card title={<><ClockCircleOutlined style={{ marginRight: 8 }} />Regional</>}>
              <Form.Item
                name="timezone"
                label="Timezone"
              >
                <Select>
                  <Option value="America/New_York">Eastern Time (ET)</Option>
                  <Option value="America/Chicago">Central Time (CT)</Option>
                  <Option value="America/Denver">Mountain Time (MT)</Option>
                  <Option value="America/Los_Angeles">Pacific Time (PT)</Option>
                  <Option value="Europe/London">Greenwich Mean Time (GMT)</Option>
                  <Option value="Europe/Paris">Central European Time (CET)</Option>
                  <Option value="Asia/Tokyo">Japan Standard Time (JST)</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="dateFormat"
                label="Date Format"
              >
                <Select>
                  <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                  <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                  <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                  <Option value="DD MMM YYYY">DD MMM YYYY</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="timeFormat"
                label="Time Format"
              >
                <Radio.Group>
                  <Radio value="12">12 Hour</Radio>
                  <Radio value="24">24 Hour</Radio>
                </Radio.Group>
              </Form.Item>
            </Card>
          </Col>

          {/* Notification Settings */}
          <Col xs={24} lg={12}>
            <Card title={<><BellOutlined style={{ marginRight: 8 }} />Notifications</>}>
              <Form.Item
                name="emailNotifications"
                label="Email Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="pushNotifications"
                label="Push Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="desktopNotifications"
                label="Desktop Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="soundNotifications"
                label="Sound Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="notificationFrequency"
                label="Notification Frequency"
              >
                <Select>
                  <Option value="immediate">Immediate</Option>
                  <Option value="hourly">Hourly Digest</Option>
                  <Option value="daily">Daily Digest</Option>
                  <Option value="weekly">Weekly Digest</Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>

          {/* Dashboard Settings */}
          <Col xs={24} lg={12}>
            <Card title="Dashboard & Display">
              <Form.Item
                name="defaultView"
                label="Default Landing Page"
              >
                <Select>
                  <Option value="dashboard">Dashboard</Option>
                  <Option value="service-desk">Service Desk</Option>
                  <Option value="tickets">My Tickets</Option>
                  <Option value="reports">Reports</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="dashboardLayout"
                label="Dashboard Layout"
              >
                <Radio.Group>
                  <Radio value="default">Default</Radio>
                  <Radio value="compact">Compact</Radio>
                  <Radio value="detailed">Detailed</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="itemsPerPage"
                label="Items Per Page"
              >
                <Select>
                  <Option value={5}>5</Option>
                  <Option value={10}>10</Option>
                  <Option value={25}>25</Option>
                  <Option value={50}>50</Option>
                  <Option value={100}>100</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="autoRefresh"
                label="Auto Refresh Data"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="refreshInterval"
                label="Refresh Interval (seconds)"
              >
                <Slider
                  min={10}
                  max={300}
                  step={10}
                  marks={{
                    10: '10s',
                    60: '1m',
                    180: '3m',
                    300: '5m'
                  }}
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Security Settings */}
          <Col xs={24}>
            <Card title={<><SecurityScanOutlined style={{ marginRight: 8 }} />Security</>}>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="twoFactorAuth"
                    label="Two-Factor Authentication"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="loginNotifications"
                    label="Login Notifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="sessionTimeout"
                    label="Session Timeout (minutes)"
                  >
                    <InputNumber min={15} max={480} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default Preferences;