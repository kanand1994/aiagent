const express = require('express');
const router = express.Router();

// Mock notifications data - In production, this would be in a database
let notifications = [
  {
    id: '1',
    userId: '1', // admin
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
    userId: '2', // ittech
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
    userId: '1', // admin
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
    userId: '5', // security
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
    userId: '2', // ittech
    type: 'patch',
    title: 'Patch Deployment Complete',
    message: 'Security patches have been successfully deployed to 15 servers.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'medium',
    actionUrl: '/patches'
  }
];

// Get notifications for current user
router.get('/', async (req, res) => {
  try {
    // In production, get userId from authenticated session
    const userId = req.query.userId || '1'; // Default to admin for demo
    
    const userNotifications = notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const unreadCount = userNotifications.filter(n => !n.read).length;
    
    res.json({
      notifications: userNotifications,
      unreadCount,
      total: userNotifications.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notificationIndex = notifications.findIndex(n => n.id === req.params.id);
    if (notificationIndex === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notifications[notificationIndex].read = true;
    notifications[notificationIndex].readAt = new Date().toISOString();
    
    res.json(notifications[notificationIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read for user
router.patch('/mark-all-read', async (req, res) => {
  try {
    const userId = req.query.userId || '1'; // Default to admin for demo
    
    notifications = notifications.map(n => 
      n.userId === userId ? { ...n, read: true, readAt: new Date().toISOString() } : n
    );
    
    const userNotifications = notifications.filter(n => n.userId === userId);
    
    res.json({
      message: 'All notifications marked as read',
      count: userNotifications.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const notificationIndex = notifications.findIndex(n => n.id === req.params.id);
    if (notificationIndex === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notifications.splice(notificationIndex, 1);
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new notification (for system use)
router.post('/', async (req, res) => {
  try {
    const { userId, type, title, message, priority = 'medium', actionUrl } = req.body;
    
    const newNotification = {
      id: String(notifications.length + 1),
      userId,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      priority,
      actionUrl
    };
    
    notifications.push(newNotification);
    
    // In production, emit WebSocket event here
    // io.to(`user_${userId}`).emit('new_notification', newNotification);
    
    res.status(201).json(newNotification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notification statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.query.userId || '1';
    const userNotifications = notifications.filter(n => n.userId === userId);
    
    const stats = {
      total: userNotifications.length,
      unread: userNotifications.filter(n => !n.read).length,
      byType: {
        incident: userNotifications.filter(n => n.type === 'incident').length,
        ticket: userNotifications.filter(n => n.type === 'ticket').length,
        system: userNotifications.filter(n => n.type === 'system').length,
        security: userNotifications.filter(n => n.type === 'security').length,
        patch: userNotifications.filter(n => n.type === 'patch').length
      },
      byPriority: {
        high: userNotifications.filter(n => n.priority === 'high').length,
        medium: userNotifications.filter(n => n.priority === 'medium').length,
        low: userNotifications.filter(n => n.priority === 'low').length
      }
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;