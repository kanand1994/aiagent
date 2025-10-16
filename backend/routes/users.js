const express = require('express');
const router = express.Router();
const { sampleUsers } = require('./auth');

// Get all users (Admin only)
router.get('/', async (req, res) => {
  try {
    // In production, check user permissions here
    const users = sampleUsers.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
    
    res.json({ users, total: users.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = sampleUsers.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user (Admin only)
router.post('/', async (req, res) => {
  try {
    const { username, email, password, role, permissions, status = 'active' } = req.body;
    
    // Check if username or email already exists
    const existingUser = sampleUsers.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    const newUser = {
      id: String(sampleUsers.length + 1),
      username,
      email,
      password, // In production, hash this password
      role,
      permissions,
      status,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    sampleUsers.push(newUser);
    
    // Return user without password
    const { password: _, ...userResponse } = newUser;
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const userIndex = sampleUsers.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { username, email, role, permissions, status } = req.body;
    
    // Check if new username or email conflicts with other users
    if (username || email) {
      const conflictUser = sampleUsers.find(u => 
        u.id !== req.params.id && (u.username === username || u.email === email)
      );
      if (conflictUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
    }
    
    // Update user
    const updatedUser = {
      ...sampleUsers[userIndex],
      ...(username && { username }),
      ...(email && { email }),
      ...(role && { role }),
      ...(permissions && { permissions }),
      ...(status && { status }),
      updatedAt: new Date().toISOString()
    };
    
    sampleUsers[userIndex] = updatedUser;
    
    // Return user without password
    const { password: _, ...userResponse } = updatedUser;
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const userIndex = sampleUsers.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent deleting the last admin
    const user = sampleUsers[userIndex];
    if (user.role === 'IT Administrator') {
      const adminCount = sampleUsers.filter(u => u.role === 'IT Administrator').length;
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last administrator' });
      }
    }
    
    sampleUsers.splice(userIndex, 1);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle user status (Admin only)
router.patch('/:id/status', async (req, res) => {
  try {
    const userIndex = sampleUsers.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = sampleUsers[userIndex];
    user.status = user.status === 'active' ? 'inactive' : 'active';
    user.updatedAt = new Date().toISOString();
    
    const { password: _, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;