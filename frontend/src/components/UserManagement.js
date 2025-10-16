import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Popconfirm, 
  message,
  Row,
  Col,
  Statistic,
  Avatar,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  CrownOutlined,
  TeamOutlined,
  SecurityScanOutlined,
  ToolOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { Option } = Select;

const UserManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Check if current user is admin
  const isAdmin = user?.role === 'IT Administrator';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await dataService.getUsers();
      setUsers(response.users || []);
    } catch (error) {
      message.error('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (userRecord) => {
    setEditingUser(userRecord);
    form.setFieldsValue({
      username: userRecord.username,
      email: userRecord.email,
      role: userRecord.role,
      permissions: userRecord.permissions,
      status: userRecord.status
    });
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await dataService.deleteUser(userId);
      message.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      message.error('Failed to delete user');
      console.error('Error deleting user:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await dataService.updateUser(editingUser.id, values);
        message.success('User updated successfully');
      } else {
        await dataService.createUser(values);
        message.success('User created successfully');
      }
      setIsModalVisible(false);
      loadUsers();
    } catch (error) {
      message.error(editingUser ? 'Failed to update user' : 'Failed to create user');
      console.error('Error saving user:', error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await dataService.updateUser(userId, { status: newStatus });
      message.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } catch (error) {
      message.error('Failed to update user status');
      console.error('Error updating user status:', error);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'IT Administrator': return <CrownOutlined style={{ color: '#ff4d4f' }} />;
      case 'IT Manager': return <TeamOutlined style={{ color: '#faad14' }} />;
      case 'IT Technician': return <ToolOutlined style={{ color: '#1890ff' }} />;
      case 'Security Analyst': return <SecurityScanOutlined style={{ color: '#722ed1' }} />;
      default: return <UserOutlined style={{ color: '#52c41a' }} />;
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

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={getRoleIcon(record.role)} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.username}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)} icon={getRoleIcon(role)}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions) => (
        <div>
          {permissions?.slice(0, 3).map(permission => (
            <Tag key={permission} size="small">{permission}</Tag>
          ))}
          {permissions?.length > 3 && (
            <Tag size="small">+{permissions.length - 3} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (lastLogin) => lastLogin || 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'Deactivate' : 'Activate'}>
            <Button 
              type="text" 
              icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => toggleUserStatus(record.id, record.status)}
            />
          </Tooltip>
          {record.username !== user?.username && (
            <Popconfirm
              title="Are you sure you want to delete this user?"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete User">
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const roleOptions = [
    { value: 'IT Administrator', label: 'IT Administrator', permissions: ['all'] },
    { value: 'IT Manager', label: 'IT Manager', permissions: ['dashboard', 'reports', 'changes', 'problems'] },
    { value: 'IT Technician', label: 'IT Technician', permissions: ['incidents', 'requests', 'assets', 'patches'] },
    { value: 'Security Analyst', label: 'Security Analyst', permissions: ['incidents', 'patches', 'users', 'assets'] },
    { value: 'End User', label: 'End User', permissions: ['requests', 'tickets'] }
  ];

  const handleRoleChange = (role) => {
    const selectedRole = roleOptions.find(r => r.value === role);
    if (selectedRole) {
      form.setFieldsValue({ permissions: selectedRole.permissions });
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <CrownOutlined style={{ fontSize: '64px', color: '#ccc', marginBottom: '16px' }} />
          <h3>Access Denied</h3>
          <p>Only IT Administrators can access user management.</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* User Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={users.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={users.filter(u => u.status === 'active').length}
              prefix={<UnlockOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Administrators"
              value={users.filter(u => u.role === 'IT Administrator').length}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="End Users"
              value={users.filter(u => u.role === 'End User').length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* User Management Table */}
      <Card 
        title="User Management" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateUser}
          >
            Add User
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
          }}
        />
      </Card>

      {/* User Form Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Create New User'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Please enter username' }]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: 'Please enter password' }]}
                >
                  <Input.Password placeholder="Enter password" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  rules={[
                    { required: true, message: 'Please confirm password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirm password" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select placeholder="Select role" onChange={handleRoleChange}>
                  {roleOptions.map(role => (
                    <Option key={role.value} value={role.value}>
                      <Space>
                        {getRoleIcon(role.value)}
                        {role.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
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
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[{ required: true, message: 'Please select permissions' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select permissions"
              options={[
                { value: 'all', label: 'All Permissions' },
                { value: 'dashboard', label: 'Dashboard' },
                { value: 'incidents', label: 'Incidents' },
                { value: 'requests', label: 'Requests' },
                { value: 'problems', label: 'Problems' },
                { value: 'changes', label: 'Changes' },
                { value: 'assets', label: 'Assets' },
                { value: 'applications', label: 'Applications' },
                { value: 'vms', label: 'VMs' },
                { value: 'patches', label: 'Patches' },
                { value: 'users', label: 'Users' },
                { value: 'reports', label: 'Reports' },
                { value: 'tickets', label: 'Tickets' }
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;