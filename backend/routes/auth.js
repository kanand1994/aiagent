const express = require('express');
const router = express.Router();

// Sample users for demo - In production, this would be in a database
let sampleUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'IT Administrator',
    permissions: ['all'],
    email: 'admin@company.com',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-16T10:30:00Z'
  },
  {
    id: '2',
    username: 'ittech',
    password: 'tech123',
    role: 'IT Technician',
    permissions: ['incidents', 'requests', 'assets', 'patches'],
    email: 'ittech@company.com',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T14:20:00Z'
  },
  {
    id: '3',
    username: 'manager',
    password: 'mgr123',
    role: 'IT Manager',
    permissions: ['dashboard', 'reports', 'changes', 'problems'],
    email: 'manager@company.com',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-14T09:15:00Z'
  },
  {
    id: '4',
    username: 'user',
    password: 'user123',
    role: 'End User',
    permissions: ['requests', 'tickets'],
    email: 'user@company.com',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-13T16:45:00Z'
  },
  {
    id: '5',
    username: 'security',
    password: 'sec123',
    role: 'Security Analyst',
    permissions: ['incidents', 'patches', 'users', 'assets'],
    email: 'security@company.com',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-12T11:30:00Z'
  }
];

// Export users for use in other routes
module.exports.sampleUsers = sampleUsers;

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user in sample users
    const user = sampleUsers.find(u => 
      u.username === username && u.password === password
    );
    
    if (user && user.status === 'active') {
      // Update last login
      user.lastLogin = new Date().toISOString();
      
      const token = `jwt-token-${user.username}-${Date.now()}`;
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          loginTime: new Date().toISOString()
        }
      });
    } else if (user && user.status === 'inactive') {
      res.status(401).json({ error: 'Account is deactivated. Please contact administrator.' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;