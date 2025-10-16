import React, { useState, useMemo } from 'react';
import { Layout, Menu, Badge } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  CustomerServiceOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  BugOutlined,
  SwapOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  CloudServerOutlined,
  SecurityScanOutlined,
  UserOutlined,
  SettingOutlined,
  RobotOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = ({ user }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const allMenuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'AI Dashboard',
      permissions: ['all', 'dashboard']
    },
    {
      key: '/service-desk',
      icon: <CustomerServiceOutlined />,
      label: 'Service Desk',
      permissions: ['all', 'requests', 'tickets']
    },
    {
      key: '/incidents',
      icon: <ExclamationCircleOutlined />,
      label: 'Incident Management',
      permissions: ['all', 'incidents']
    },
    {
      key: '/requests',
      icon: <FileTextOutlined />,
      label: 'Request Fulfillment',
      permissions: ['all', 'requests', 'tickets']
    },
    {
      key: '/problems',
      icon: <BugOutlined />,
      label: 'Problem Management',
      permissions: ['all', 'problems']
    },
    {
      key: '/changes',
      icon: <SwapOutlined />,
      label: 'Change Management',
      permissions: ['all', 'changes']
    },
    {
      key: '/assets',
      icon: <DatabaseOutlined />,
      label: 'Asset Management',
      permissions: ['all', 'assets']
    },
    {
      key: '/applications',
      icon: <AppstoreOutlined />,
      label: 'Application Installation',
      permissions: ['all', 'applications']
    },
    {
      key: '/vms',
      icon: <CloudServerOutlined />,
      label: 'VM Management',
      permissions: ['all', 'vms']
    },
    {
      key: '/patches',
      icon: <SecurityScanOutlined />,
      label: 'Patch Management',
      permissions: ['all', 'patches']
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'User Access Management',
      permissions: ['all', 'users']
    },
    {
      key: '/user-management',
      icon: <TeamOutlined />,
      label: 'User Management',
      permissions: ['all']
    },
    {
      key: '/os-management',
      icon: <SettingOutlined />,
      label: 'OS Management',
      permissions: ['all', 'os']
    },
  ];

  const menuItems = useMemo(() => {
    if (!user) return [];
    
    return allMenuItems.filter(item => {
      return item.permissions.some(permission => 
        user.permissions.includes(permission)
      );
    }).map(item => ({
      ...item,
      label: (
        <span>
          {item.label}
          {item.key === '/' && (
            <Badge 
              count="AI" 
              size="small" 
              style={{ 
                backgroundColor: '#52c41a', 
                marginLeft: '8px',
                fontSize: '10px'
              }} 
            />
          )}
        </span>
      )
    }));
  }, [user]);

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      theme="dark"
      width={280}
    >
      <div style={{ 
        height: 64, 
        margin: 16, 
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <RobotOutlined style={{ fontSize: '20px', marginBottom: '4px' }} />
        {collapsed ? 'AI' : 'IT Automation AI'}
        {!collapsed && (
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            Multi-Agent System
          </div>
        )}
      </div>
      
      {!collapsed && user && (
        <div style={{ 
          margin: '0 16px 16px 16px', 
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 6,
          color: 'white',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {user.role}
          </div>
          <div style={{ opacity: 0.8 }}>
            {user.permissions.length} modules accessible
          </div>
        </div>
      )}
      
      <Menu
        theme="dark"
        selectedKeys={[location.pathname]}
        mode="inline"
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar;