import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  List, 
  Badge, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  Avatar, 
  Divider,
  Empty,
  Tooltip,
  Popconfirm
} from 'antd';
import { 
  BellOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloseOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { Text, Title } = Typography;

const NotificationCenter = ({ user }) => {
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time notification updates
    dataService.connectWebSocket();
    dataService.subscribe('new_notification', handleNewNotification);
    dataService.subscribe('notification_update', handleNotificationUpdate);
    
    return () => {
      dataService.unsubscribe('new_notification', handleNewNotification);
      dataService.unsubscribe('notification_update', handleNotificationUpdate);
    };
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await dataService.getNotifications(user?.id || '1');
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to mock notifications
      const mockNotifications = generateMockNotifications();
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } finally {
      setLoading(false);
    }
  };

  const generateMockNotifications = () => {
    const notifications = [
      {
        id: '1',
        type: 'incident',
        title: 'High Priority Incident',
        message: 'Network outage detected on Server-01. Immediate attention required.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high',
        actionUrl: '/incidents'
      },
      {
        id: '2',
        type: 'ticket',
        title: 'New Ticket Assigned',
        message: 'Ticket TKT-001 has been assigned to you for resolution.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
        priority: 'medium',
        actionUrl: '/service-desk'
      },
      {
        id: '3',
        type: 'system',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will begin at 2:00 AM tonight.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: true,
        priority: 'low',
        actionUrl: null
      },
      {
        id: '4',
        type: 'security',
        title: 'Security Alert',
        message: 'Multiple failed login attempts detected from IP 192.168.1.100.',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high',
        actionUrl: '/security'
      },
      {
        id: '5',
        type: 'patch',
        title: 'Patch Deployment Complete',
        message: 'Security patches have been successfully deployed to 15 servers.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: 'medium',
        actionUrl: '/patches'
      }
    ];
    
    // Filter notifications based on user role
    return notifications.filter(notification => {
      if (user?.role === 'End User') {
        return ['ticket', 'system'].includes(notification.type);
      }
      return true; // IT staff see all notifications
    });
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const handleNotificationUpdate = (updatedNotification) => {
    setNotifications(prev => 
      prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
    );
    if (updatedNotification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await dataService.markNotificationAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Fallback to local update
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      await dataService.markAllNotificationsAsRead(user?.id || '1');
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Fallback to local update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await dataService.deleteNotification(notificationId);
      
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Fallback to local update
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const getNotificationIcon = (type, priority) => {
    const iconProps = {
      style: { 
        fontSize: '16px',
        color: priority === 'high' ? '#ff4d4f' : 
               priority === 'medium' ? '#faad14' : '#52c41a'
      }
    };

    switch (type) {
      case 'incident':
        return <ExclamationCircleOutlined {...iconProps} />;
      case 'ticket':
        return <InfoCircleOutlined {...iconProps} />;
      case 'security':
        return <WarningOutlined {...iconProps} />;
      case 'system':
        return <CheckCircleOutlined {...iconProps} />;
      default:
        return <BellOutlined {...iconProps} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <Badge count={unreadCount} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: '18px' }} />}
            onClick={() => setVisible(true)}
          />
        </Badge>
      </Tooltip>

      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>
              Notifications
            </Title>
            {unreadCount > 0 && (
              <Button size="small" type="link" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        }
        placement="right"
        onClose={() => setVisible(false)}
        open={visible}
        width={400}
        bodyStyle={{ padding: 0 }}
      >
        {notifications.length === 0 ? (
          <Empty
            description="No notifications"
            style={{ marginTop: '50px' }}
          />
        ) : (
          <List
            dataSource={notifications}
            loading={loading}
            renderItem={(notification) => (
              <List.Item
                style={{
                  padding: '16px',
                  backgroundColor: notification.read ? 'transparent' : '#f6ffed',
                  borderLeft: notification.read ? 'none' : '3px solid #52c41a',
                  cursor: notification.actionUrl ? 'pointer' : 'default'
                }}
                onClick={() => handleNotificationClick(notification)}
                actions={[
                  <Tooltip title="Mark as read">
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      disabled={notification.read}
                    />
                  </Tooltip>,
                  <Popconfirm
                    title="Delete this notification?"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                      danger
                    />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={getNotificationIcon(notification.type, notification.priority)}
                      style={{ backgroundColor: 'transparent' }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong={!notification.read}>
                        {notification.title}
                      </Text>
                      <Space>
                        <Tag color={getPriorityColor(notification.priority)} size="small">
                          {notification.priority}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {formatTimestamp(notification.timestamp)}
                        </Text>
                      </Space>
                    </div>
                  }
                  description={
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      {notification.message}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </>
  );
};

export default NotificationCenter;