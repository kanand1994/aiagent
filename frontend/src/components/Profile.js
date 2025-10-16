import React, { useState, useEffect } from 'react';
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
  Space, 
  Tag, 
  Statistic,
  List,
  Typography,
  message,
  Modal
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  SaveOutlined, 
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  TeamOutlined,
  KeyOutlined,
  HistoryOutlined,
  SettingOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { Title, Text } = Typography;

const Profile = ({ user, onUserUpdate }) => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [userStats, setUserStats] = useState({});
  const [activityLog, setActivityLog] = useState([]);
  const [profileData, setProfileData] = useState({});

  useEffect(() => {
    loadProfileData();
    loadUserStats();
    loadActivityLog();
  }, [user]);

  const loadProfileData = async () => {
    try {
      const response = await dataService.apiCall(`/api/users/${user.id}`);
      setProfileData(response);
      form.setFieldsValue({
        username: response.username,
        email: response.email,
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        phone: response.phone || '',
        department: response.department || '',
        jobTitle: response.jobTitle || '',
        location: response.location || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to current user data
      setProfileData(user);
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        department: user.department || 'IT Department',
        jobTitle: user.jobTitle || user.role,
        location: user.location || 'Main Office'
      });
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await dataService.apiCall(`/api/users/${user.id}/stats`);
      setUserStats(response);
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Fallback to mock stats
      setUserStats({
        ticketsCreated: 45,
        ticketsResolved: 38,
        incidentsHandled: 12,
        avgResolutionTime: '4.2 hours',
        lastLogin: user.lastLogin || new Date().toISOString()
      });
    }
  };

  const loadActivityLog = async () => {
    try {
      const response = await dataService.apiCall(`/api/users/${user.id}/activity`);
      setActivityLog(response.activities || []);
    } catch (error) {
      console.error('Error loading activity log:', error);
      // Fallback to mock activity
      setActivityLog([
        {
          id: '1',
          action: 'Login',
          description: 'Logged into the system',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          ip: '192.168.1.100'
        },
        {
          id: '2',
          action: 'Ticket Created',
          description: 'Created ticket TKT-001 for email issue',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          ip: '192.168.1.100'
        },
        {
          id: '3',
          action: 'Profile Updated',
          description: 'Updated profile information',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          ip: '192.168.1.100'
        }
      ]);
    }
  };

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      const response = await dataService.updateUser(user.id, values);
      setProfileData({ ...profileData, ...values });
      message.success('Profile updated successfully');
      setEditing(false);
      
      // Update user context if callback provided
      if (onUserUpdate) {
        onUserUpdate({ ...user, ...values });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {
      await dataService.apiCall(`/api/users/${user.id}/password`, {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        })
      });
      
      message.success('Password changed successfully');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const response = await dataService.apiCall(`/api/users/${user.id}/avatar`, {
        method: 'POST',
        body: formData,
        headers: {} // Remove Content-Type to let browser set it for FormData
      });
      
      setProfileData({ ...profileData, avatar: response.avatarUrl });
      message.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      message.error('Failed to upload avatar');
    }
    
    return false; // Prevent default upload behavior
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'IT Administrator': return '👑';
      case 'IT Manager': return '👔';
      case 'IT Technician': return '🔧';
      case 'Security Analyst': return '🛡️';
      default: return '👤';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'IT Administrator': return 'red';
      case 'IT Manager': return 'orange';
      case 'IT Technician': return 'blue';
      case 'Security Analyst': return 'purple';
      default: return 'green';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Upload
                showUploadList={false}
                beforeUpload={handleAvatarUpload}
                accept="image/*"
              >
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    size={120}
                    src={profileData.avatar}
                    icon={<UserOutlined />}
                    style={{ cursor: 'pointer' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      background: '#1890ff',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <CameraOutlined style={{ color: 'white', fontSize: '14px' }} />
                  </div>
                </div>
              </Upload>
              
              <Title level={3} style={{ marginTop: '16px', marginBottom: '8px' }}>
                {profileData.firstName && profileData.lastName 
                  ? `${profileData.firstName} ${profileData.lastName}`
                  : profileData.username
                }
              </Title>
              
              <Tag 
                color={getRoleColor(user.role)} 
                style={{ fontSize: '14px', padding: '4px 12px' }}
              >
                {getRoleIcon(user.role)} {user.role}
              </Tag>
            </div>

            <Divider />

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text type="secondary">
                  <MailOutlined /> Email
                </Text>
                <div>{profileData.email}</div>
              </div>
              
              <div>
                <Text type="secondary">
                  <PhoneOutlined /> Phone
                </Text>
                <div>{profileData.phone || 'Not provided'}</div>
              </div>
              
              <div>
                <Text type="secondary">
                  <TeamOutlined /> Department
                </Text>
                <div>{profileData.department || 'Not specified'}</div>
              </div>
              
              <div>
                <Text type="secondary">
                  <CalendarOutlined /> Member Since
                </Text>
                <div>{formatTimestamp(profileData.createdAt || user.createdAt)}</div>
              </div>
            </Space>

            <Divider />

            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </Button>
              <Button
                icon={<KeyOutlined />}
                onClick={() => setPasswordModalVisible(true)}
              >
                Change Password
              </Button>
            </Space>
          </Card>

          {/* User Statistics */}
          <Card title="Statistics" style={{ marginTop: '24px' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Tickets Created"
                  value={userStats.ticketsCreated || 0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tickets Resolved"
                  value={userStats.ticketsResolved || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Incidents Handled"
                  value={userStats.incidentsHandled || 0}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Avg Resolution"
                  value={userStats.avgResolutionTime || 'N/A'}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Profile Form */}
        <Col xs={24} lg={16}>
          <Card
            title="Profile Information"
            extra={
              editing && (
                <Space>
                  <Button onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => form.submit()}
                    loading={loading}
                  >
                    Save Changes
                  </Button>
                </Space>
              )
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleProfileUpdate}
              disabled={!editing}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                  >
                    <Input placeholder="Enter first name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                  >
                    <Input placeholder="Enter last name" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: 'Username is required' }]}
                  >
                    <Input placeholder="Enter username" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Email is required' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input placeholder="Enter email address" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                  >
                    <Input placeholder="Enter phone number" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="jobTitle"
                    label="Job Title"
                  >
                    <Input placeholder="Enter job title" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="department"
                    label="Department"
                  >
                    <Input placeholder="Enter department" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="location"
                    label="Location"
                  >
                    <Input placeholder="Enter location" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Activity Log */}
          <Card 
            title={
              <Space>
                <HistoryOutlined />
                Recent Activity
              </Space>
            }
            style={{ marginTop: '24px' }}
          >
            <List
              dataSource={activityLog}
              renderItem={(activity) => (
                <List.Item>
                  <List.Item.Meta
                    title={activity.action}
                    description={
                      <div>
                        <div>{activity.description}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {formatTimestamp(activity.timestamp)} • IP: {activity.ip}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Password Change Modal */}
      <Modal
        title="Change Password"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter current password' }]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            rules={[
              { required: true, message: 'Please confirm new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Change Password
              </Button>
              <Button onClick={() => setPasswordModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;