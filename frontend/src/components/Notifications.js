import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Badge, 
  Button, 
  Row, 
  Col, 
  Tabs, 
  Tag, 
  Avatar,
  Empty,
  Dropdown,
  Menu,
  message,
  Switch
} from 'antd';
import { 
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  SettingOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { TabPane } = Tabs;

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Mock notifications data
      const mockNotifications = [
        {
          id: 1,
          type: 'success',
          title: 'Change Request Approved',
          message: 'Your change request CHG-000123 has been approved and scheduled for implementation.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          category: 'change-management'
        },
        {
          id: 2,
          type: 'warning',
          title: 'System Maintenance Scheduled',
          message: 'Scheduled maintenance for the email server will begin at 2:00 AM EST tonight.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          category: 'system'
        },
        {
          id: 3,
          type: 'info',
          title: 'New Software Available',
          message: 'Visual Studio Code 1.85.1 is now available in the software catalog.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          read: true,
          category: 'software'
        },
        {
          id: 4,
          type: 'error',
          title: 'Critical Alert: Server Down',
          message: 'Database server SRV-DB-01 is not responding. Incident INC-000456 has been created.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
          read: true,
          category: 'incident'
        },
        {
          id: 5,
          type: 'info',
          title: 'Ticket Assignment',
          message: 'Ticket TKT-000789 has been assigned to you for resolution.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          category: 'ticket'
        },
        {
          id: 6,
          type: 'success',
          title: 'VM Provisioning Complete',
          message: 'Your virtual machine DEV-WEB-02 has been successfully provisioned and is ready for use.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          read: true,
          category: 'vm'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      message.success('Notification marked as read');
    } catch (error) {
      message.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      message.success('All notifications marked as read');
    } catch (error) {
      message.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
      message.success('Notification deleted');
    } catch (error) {
      message.error('Failed to delete notification');
    }
  };

  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      message.success('All notifications cleared');
    } catch (error) {
      message.error('Failed to clear notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'info':
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'error':
        return '#ff4d4f';
      case 'info':
      default:
        return '#1890ff';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.read;
      case 'read':
        return notif.read;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const notificationMenu = (notification) => (
    <Menu>
      {!notification.read && (
        <Menu.Item 
          key="read" 
          icon={<CheckOutlined />}
          onClick={() => markAsRead(notification.id)}
        >
          Mark as Read
        </Menu.Item>
      )}
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />}
        onClick={() => deleteNotification(notification.id)}
        danger
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h2>
            <BellOutlined style={{ marginRight: 8 }} />
            Notifications
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ marginLeft: 8 }} />
            )}
          </h2>
        </Col>
        <Col>
          <Button 
            style={{ marginRight: 8 }}
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
          <Button 
            danger
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
          >
            Clear All
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={18}>
          <Card>
            <Tabs 
              activeKey={filter} 
              onChange={setFilter}
              tabBarExtraContent={
                <Tag color="blue">
                  {filteredNotifications.length} notifications
                </Tag>
              }
            >
              <TabPane tab="All" key="all" />
              <TabPane 
                tab={
                  <span>
                    Unread
                    {unreadCount > 0 && (
                      <Badge count={unreadCount} size="small" style={{ marginLeft: 4 }} />
                    )}
                  </span>
                } 
                key="unread" 
              />
              <TabPane tab="Read" key="read" />
            </Tabs>

            {filteredNotifications.length === 0 ? (
              <Empty 
                description="No notifications"
                style={{ margin: '40px 0' }}
              />
            ) : (
              <List
                dataSource={filteredNotifications}
                renderItem={notification => (
                  <List.Item
                    style={{ 
                      backgroundColor: notification.read ? 'transparent' : '#f6ffed',
                      border: notification.read ? 'none' : '1px solid #b7eb8f',
                      borderRadius: 4,
                      marginBottom: 8,
                      padding: 16
                    }}
                    actions={[
                      <Dropdown 
                        overlay={notificationMenu(notification)} 
                        trigger={['click']}
                      >
                        <Button type="text" icon={<MoreOutlined />} />
                      </Dropdown>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={getNotificationIcon(notification.type)}
                          style={{ 
                            backgroundColor: getNotificationColor(notification.type) + '20',
                            border: `1px solid ${getNotificationColor(notification.type)}`
                          }}
                        />
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                            {notification.title}
                          </span>
                          {!notification.read && (
                            <Badge status="processing" />
                          )}
                          <Tag size="small" color="blue">
                            {notification.category}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: 4 }}>
                            {notification.message}
                          </div>
                          <div style={{ 
                            fontSize: 12, 
                            color: '#999',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <ClockCircleOutlined />
                            {formatTimestamp(notification.timestamp)}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Card title={<><SettingOutlined style={{ marginRight: 8 }} />Notification Settings</>}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Email Notifications</div>
              <Switch defaultChecked />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Push Notifications</div>
              <Switch defaultChecked />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Desktop Notifications</div>
              <Switch />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Sound Alerts</div>
              <Switch />
            </div>

            <Button type="link" style={{ padding: 0 }}>
              Advanced Settings
            </Button>
          </Card>

          <Card title="Quick Stats" style={{ marginTop: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {notifications.length}
              </div>
              <div style={{ color: '#666', marginBottom: 16 }}>
                Total Notifications
              </div>
              
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                {unreadCount}
              </div>
              <div style={{ color: '#666' }}>
                Unread
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Notifications;