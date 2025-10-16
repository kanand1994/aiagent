import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Avatar, 
  Upload, 
  Row, 
  Col, 
  Divider,
  message,
  Select,
  Switch
} from 'antd';
import { 
  UserOutlined, 
  UploadOutlined, 
  SaveOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Option } = Select;

const ProfileSettings = ({ user }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (info) => {
    if (info.file.status === 'done') {
      message.success('Profile picture updated successfully!');
    }
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h2>Profile Settings</h2>
        </Col>
        <Col>
          <Button 
            type={editing ? "default" : "primary"}
            icon={editing ? <SaveOutlined /> : <EditOutlined />}
            onClick={() => editing ? form.submit() : setEditing(true)}
            loading={loading}
          >
            {editing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card title="Profile Picture">
            <div style={{ textAlign: 'center' }}>
              <Avatar 
                size={120} 
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
              />
              <div>
                <Upload
                  name="avatar"
                  showUploadList={false}
                  action="/api/upload/avatar"
                  onChange={handleUpload}
                  disabled={!editing}
                >
                  <Button 
                    icon={<UploadOutlined />}
                    disabled={!editing}
                  >
                    Change Picture
                  </Button>
                </Upload>
              </div>
            </div>
          </Card>

          <Card title="Account Status" style={{ marginTop: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 8 }}>
                <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                {user?.role || 'IT Staff'}
              </div>
              <div style={{ color: '#666', fontSize: 12 }}>
                Active since: January 2024
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Personal Information">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                fullName: user?.name || 'John Doe',
                email: user?.email || 'john.doe@company.com',
                phone: '+1 (555) 123-4567',
                department: user?.department || 'Information Technology',
                jobTitle: 'Senior IT Specialist',
                manager: 'Jane Smith',
                location: 'New York Office',
                timezone: 'America/New_York',
                language: 'English',
                emailNotifications: true,
                smsNotifications: false
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="fullName"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your full name' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />}
                      disabled={!editing}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined />}
                      disabled={!editing}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                  >
                    <Input 
                      prefix={<PhoneOutlined />}
                      disabled={!editing}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="department"
                    label="Department"
                  >
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="jobTitle"
                    label="Job Title"
                  >
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="manager"
                    label="Manager"
                  >
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="location"
                    label="Office Location"
                  >
                    <Select disabled={!editing}>
                      <Option value="New York Office">New York Office</Option>
                      <Option value="San Francisco Office">San Francisco Office</Option>
                      <Option value="London Office">London Office</Option>
                      <Option value="Remote">Remote</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="timezone"
                    label="Timezone"
                  >
                    <Select disabled={!editing}>
                      <Option value="America/New_York">Eastern Time (ET)</Option>
                      <Option value="America/Chicago">Central Time (CT)</Option>
                      <Option value="America/Denver">Mountain Time (MT)</Option>
                      <Option value="America/Los_Angeles">Pacific Time (PT)</Option>
                      <Option value="Europe/London">Greenwich Mean Time (GMT)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <h3>Notification Preferences</h3>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="emailNotifications"
                    label="Email Notifications"
                    valuePropName="checked"
                  >
                    <Switch disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="smsNotifications"
                    label="SMS Notifications"
                    valuePropName="checked"
                  >
                    <Switch disabled={!editing} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="language"
                    label="Preferred Language"
                  >
                    <Select disabled={!editing}>
                      <Option value="English">English</Option>
                      <Option value="Spanish">Spanish</Option>
                      <Option value="French">French</Option>
                      <Option value="German">German</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfileSettings;