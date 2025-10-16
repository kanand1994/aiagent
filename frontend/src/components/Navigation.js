import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button } from 'antd';
import {
  DashboardOutlined,
  CustomerServiceOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  BugOutlined,
  SettingOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  CloudServerOutlined,
  SecurityScanOutlined,
  TeamOutlined,
  DesktopOutlined,
  CloudOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined
} from '@ant-design/icons';

const { Header, Sider } = Layout;
const { SubMenu } = Menu;

const Navigation = ({ user, currentPage, onPageChange, collapsed, onToggleCollapse, onLogout }) => {
  const [notifications] = useState(5); // Mock notification count
  const [notificationVisible, setNotificationVisible] = useState(false);

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case 'profile':
        onPageChange('profile-settings');
        break;
      case 'preferences':
        onPageChange('preferences');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleNotificationClick = () => {
    setNotificationVisible(!notificationVisible);
    onPageChange('notifications');
  };

  const userMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile Settings
      </Menu.Item>
      <Menu.Item key="preferences" icon={<SettingOutlined />}>
        Preferences
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const getMenuItems = () => {
    const baseItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard'
      }
    ];

    // IT Staff and Admin get full access
    if (user?.role !== 'user') {
      return [
        ...baseItems,
        {
          key: 'service-management',
          icon: <CustomerServiceOutlined />,
          label: 'Service Management',
          children: [
            { key: 'service-desk', icon: <CustomerServiceOutlined />, label: 'Service Desk' },
            { key: 'incident-management', icon: <ExclamationCircleOutlined />, label: 'Incident Management' },
            { key: 'request-fulfillment', icon: <FileTextOutlined />, label: 'Request Fulfillment' },
            { key: 'problem-management', icon: <BugOutlined />, label: 'Problem Management' }
          ]
        },
        {
          key: 'automation',
          icon: <RobotOutlined />,
          label: 'IT Automation',
          children: [
            { key: 'change-management', icon: <SettingOutlined />, label: 'Change Management' },
            { key: 'asset-management', icon: <DatabaseOutlined />, label: 'Asset Management' },
            { key: 'application-installation', icon: <AppstoreOutlined />, label: 'Software Installation' },
            { key: 'vm-management', icon: <CloudServerOutlined />, label: 'VM Management' },
            { key: 'template-management', icon: <CloudOutlined />, label: 'Template Management' },
            { key: 'patch-management', icon: <SecurityScanOutlined />, label: 'Patch Management' },
            { key: 'user-access-management', icon: <TeamOutlined />, label: 'User Access Management' },
            { key: 'os-management', icon: <DesktopOutlined />, label: 'OS Management' }
          ]
        },
        {
          key: 'reports-analytics',
          icon: <BarChartOutlined />,
          label: 'Reports & Analytics'
        }
      ];
    }

    // End users get limited access
    return [
      ...baseItems,
      {
        key: 'self-service',
        icon: <CustomerServiceOutlined />,
        label: 'Self Service',
        children: [
          { key: 'service-desk', icon: <CustomerServiceOutlined />, label: 'Create Ticket' },
          { key: 'application-installation', icon: <AppstoreOutlined />, label: 'Request Software' },
          { key: 'vm-management', icon: <CloudServerOutlined />, label: 'Request VM' }
        ]
      }
    ];
  };

  const renderMenuItem = (item) => {
    if (item.children) {
      return (
        <SubMenu key={item.key} icon={item.icon} title={item.label}>
          {item.children.map(child => (
            <Menu.Item key={child.key} icon={child.icon}>
              {child.label}
            </Menu.Item>
          ))}
        </SubMenu>
      );
    }
    return (
      <Menu.Item key={item.key} icon={item.icon}>
        {item.label}
      </Menu.Item>
    );
  };

  return (
    <>
      <Header style={{ 
        padding: '0 16px', 
        background: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggleCollapse}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <h1 style={{ margin: 0, marginLeft: 16, color: '#1890ff', fontSize: '20px' }}>
            IT Automation Platform
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Badge count={notifications} size="small">
            <BellOutlined 
              style={{ fontSize: '18px', cursor: 'pointer' }} 
              onClick={handleNotificationClick}
            />
          </Badge>
          
          <Dropdown overlay={userMenu} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px' }}>
              <Avatar 
                size="small" 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#1890ff', marginRight: 8 }}
              />
              <span style={{ fontWeight: 500 }}>
                {user?.name || 'User'}
              </span>
              <span style={{ 
                marginLeft: 8, 
                padding: '2px 8px', 
                background: '#f0f0f0', 
                borderRadius: '12px', 
                fontSize: '12px',
                color: '#666'
              }}>
                {user?.role || 'User'}
              </span>
            </div>
          </Dropdown>
        </div>
      </Header>

      <Sider 
        trigger={null}
        collapsible 
        collapsed={collapsed}
        width={250}
        style={{
          background: '#fff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[currentPage]}
          onClick={({ key }) => onPageChange(key)}
          style={{ 
            height: '100%', 
            borderRight: 0,
            paddingTop: 16
          }}
        >
          {getMenuItems().map(renderMenuItem)}
        </Menu>
      </Sider>
    </>
  );
};

export default Navigation;