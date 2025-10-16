import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Switch, 
  Select, 
  Button, 
  Row, 
  Col, 
  Divider, 
  Space, 
  Typography,
  message,
  Slider,
  TimePicker,
  Checkbox,
  Radio,
  InputNumber,
  Alert
} from 'antd';
import { 
  SettingOutlined,
  BellOutlined,
  EyeOutlined,
  SecurityScanOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings = ({ user, onSettingsUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const response = await dataService.apiCall(`/api/users/${user.id}/settings`);
      setSettings(response);
      form.setFieldsValue(response);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fallback to default settings
      const defaultSettings = {
        // Notification Settings
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        notificationTypes: ['incidents', 'tickets', 'system'],
        quietHoursEnabled: false,
        quietHoursStart: moment('22:00', 'HH:mm'),
        quietHoursEnd: moment('08:00', 'HH:mm'),
        
        // Display Settings
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        dashboardRefreshInterval: 30,
        
        // Security Settings
        sessionTimeout: 60,
        twoFactorEnabled: false,
        loginNotifications: true,
        
        // Accessibility Settings
        highContrast: false,
        fontSize: 'medium',
        reducedMotion: false,
        
        // Advanced Settings
        debugMode: false,
        betaFeatures: false,
        dataCollection: true
      };
      
      setSettings(defaultSettings);
      form.setFieldsValue(defaultSettings);
    }
  };

  const handleSaveSettings = async (values) => {
    setLoading(true);
    try {
      // Convert moment objects to strings for API
      const settingsToSave = {
        ...values,
        quietHoursStart: values.quietHoursStart?.format('HH:mm'),
        quietHoursEnd: values.quietHoursEnd?.format('HH:mm')
      };
      
      await dataService.apiCall(`/api/users/${user.id}/settings`, {
        method: 'PUT',
        body: JSON.stringify(settingsToSave)
      });
      
      setSettings(values);
      message.success('Settings saved successfully');
      
      // Notify parent component of settings update
      if (onSettingsUpdate) {
        onSettingsUpdate(values);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    form.resetFields();
    loadSettings();
    message.info('Settings reset to defaults');
  };

  const notificationTypeOptions = [
    { label: 'Incidents', value: 'incidents' },
    { label: 'Tickets', value: 'tickets' },
    { label: 'System Updates', value: 'system' },
    { label: 'Security Alerts', value: 'security' },
    { label: 'Maintenance', value: 'maintenance' }
  ];

  const themeOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Auto', value: 'auto' }
  ];

  const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
    { label: 'Chinese', value: 'zh' }
  ];

  const timezoneOptions = [
    { label: 'UTC', value: 'UTC' },
    { label: 'Eastern Time', value: 'America/New_York' },
    { label: 'Central Time', value: 'America/Chicago' },
    { label: 'Mountain Time', value: 'America/Denver' },
    { label: 'Pacific Time', value: 'America/Los_Angeles' },
    { label: 'London', value: 'Europe/London' },
    { label: 'Paris', value: 'Europe/Paris' },
    { label: 'Tokyo', value: 'Asia/Tokyo' }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <Title level={2}>
        <SettingOutlined /> Settings
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveSettings}
        initialValues={settings}
      >
        <Row gutter={[24, 24]}>
          {/* Notification Settings */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <BellOutlined />
                  Notification Settings
                </Space>
              }
            >
              <Form.Item name="emailNotifications" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Email Notifications</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Receive notifications via email
                      </Text>
                    </div>
                  </div>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="pushNotifications" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Push Notifications</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Receive browser push notifications
                      </Text>
                    </div>
                  </div>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="smsNotifications" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>SMS Notifications</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Receive notifications via SMS
                      </Text>
                    </div>
                  </div>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="notificationTypes" label="Notification Types">
                <Checkbox.Group options={notificationTypeOptions} />
              </Form.Item>

              <Divider />

              <Form.Item name="quietHoursEnabled" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Quiet Hours</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Disable notifications during specified hours
                      </Text>
                    </div>
                  </div>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
                prevValues.quietHoursEnabled !== currentValues.quietHoursEnabled
              }>
                {({ getFieldValue }) => 
                  getFieldValue('quietHoursEnabled') && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="quietHoursStart" label="Start Time">
                          <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="quietHoursEnd" label="End Time">
                          <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  )
                }
              </Form.Item>
            </Card>
          </Col>

          {/* Display Settings */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <EyeOutlined />
                  Display Settings
                </Space>
              }
            >
              <Form.Item name="theme" label="Theme">
                <Radio.Group options={themeOptions} />
              </Form.Item>

              <Form.Item name="language" label="Language">
                <Select>
                  {languageOptions.map(lang => (
                    <Option key={lang.value} value={lang.value}>
                      {lang.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="timezone" label="Timezone">
                <Select showSearch>
                  {timezoneOptions.map(tz => (
                    <Option key={tz.value} value={tz.value}>
                      {tz.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="dateFormat" label="Date Format">
                <Select>
                  <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                  <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                  <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                </Select>
              </Form.Item>

              <Form.Item name="timeFormat" label="Time Format">
                <Radio.Group>
                  <Radio value="12h">12 Hour</Radio>
                  <Radio value="24h">24 Hour</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="dashboardRefreshInterval" label="Dashboard Refresh (seconds)">
                <Slider
                  min={10}
                  max={300}
                  marks={{
                    10: '10s',
                    30: '30s',
                    60: '1m',
                    120: '2m',
                    300: '5m'
                  }}
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Security Settings */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <SecurityScanOutlined />
                  Security Settings
                </Space>
              }
            >
              <Form.Item name="sessionTimeout" label="Session Timeout (minutes)">
                <InputNumber min={15} max={480} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name="twoFactorEnabled" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Two-Factor Authentication</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Add an extra layer of security
                      </Text>
                    </div>
                  </div>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="loginNotifications" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Login Notifications</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Get notified of new login attempts
                      </Text>
                    </div>
                  </div>
                  <Switch />
                </div>
              </Form.Item>
            </Card>
          </Col>

          {/* Accessibility Settings */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <GlobalOutlined />
                  Accessibility
                </Space>
              }
            >
              <Form.Item name="highContrast" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>High Contrast</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Increase contrast for better visibility
                      </Text>
                    </div>
                  </div>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="fontSize" label="Font Size">
                <Radio.Group>
                  <Radio value="small">Small</Radio>
                  <Radio value="medium">Medium</Radio>
                  <Radio value="large">Large</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="reducedMotion" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Reduced Motion</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Minimize animations and transitions
                      </Text>
                    </div>
                  </div>
                  <Switch />
                </div>
              </Form.Item>
            </Card>
          </Col>

          {/* Advanced Settings */}
          {user?.role === 'IT Administrator' && (
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <ClockCircleOutlined />
                    Advanced Settings
                  </Space>
                }
              >
                <Alert
                  message="Administrator Settings"
                  description="These settings are only available to IT Administrators and may affect system behavior."
                  type="warning"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />

                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Form.Item name="debugMode" valuePropName="checked">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>Debug Mode</Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Enable detailed logging
                            </Text>
                          </div>
                        </div>
                        <Switch />
                      </div>
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={8}>
                    <Form.Item name="betaFeatures" valuePropName="checked">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>Beta Features</Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Access experimental features
                            </Text>
                          </div>
                        </div>
                        <Switch />
                      </div>
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={8}>
                    <Form.Item name="dataCollection" valuePropName="checked">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>Data Collection</Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Help improve the platform
                            </Text>
                          </div>
                        </div>
                        <Switch />
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          )}
        </Row>

        {/* Action Buttons */}
        <Card style={{ marginTop: '24px', textAlign: 'center' }}>
          <Space size="large">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={loading}
              size="large"
            >
              Save Settings
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetSettings}
              size="large"
            >
              Reset to Defaults
            </Button>
          </Space>
        </Card>
      </Form>
    </div>
  );
};

export default Settings;