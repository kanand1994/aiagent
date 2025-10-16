import React from 'react';
import { Layout, Avatar, Dropdown, Space, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, CrownOutlined } from '@ant-design/icons';
import NotificationCenter from '../NotificationCenter';

const { Header: AntHeader } = Layout;

const Header = ({ user, onLogout }) => {
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => window.location.href = '/profile'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => window.location.href = '/settings'
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: onLogout
    },
  ];

  const getRoleColor = (role) => {
    if (role.includes('Administrator')) return 'red';
    if (role.includes('Manager')) return 'orange';
    if (role.includes('Technician')) return 'blue';
    if (role.includes('Security')) return 'purple';
    return 'green';
  };

  const getRoleIcon = (role) => {
    if (role.includes('Administrator')) return <CrownOutlined />;
    return <UserOutlined />;
  };

  return (
    <AntHeader style={{ 
      padding: '0 24px', 
      background: '#fff', 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 4px rgba(0,21,41,.08)'
    }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#001529' }}>
        IT Automation Platform - Multi-Agent AI System
      </div>
      
      <Space size="large">
        <NotificationCenter user={user} />
        
        <Space>
          <Tag color={getRoleColor(user?.role)} icon={getRoleIcon(user?.role)}>
            {user?.role}
          </Tag>
        </Space>
        
        <Dropdown
          menu={{ 
            items: userMenuItems,
            onClick: ({ key }) => {
              if (key === 'logout') {
                onLogout();
              }
            }
          }}
          placement="bottomRight"
          arrow
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={getRoleIcon(user?.role)} style={{ backgroundColor: getRoleColor(user?.role) === 'red' ? '#ff4d4f' : '#1890ff' }} />
            <div>
              <div style={{ fontWeight: 'bold' }}>{user?.username}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Logged in at {new Date(user?.loginTime).toLocaleTimeString()}
              </div>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;