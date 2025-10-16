const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Get all access requests
router.get('/', async (req, res) => {
  try {
    const requests = await db.query(`
      SELECT ar.*, u1.full_name as userName, u1.email as userEmail, u2.full_name as requestedBy 
      FROM access_requests ar 
      LEFT JOIN users u1 ON ar.user_id = u1.id 
      LEFT JOIN users u2 ON ar.requested_by = u2.id 
      ORDER BY ar.created_at DESC
    `);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching access requests:', error);
    res.status(500).json({ error: 'Failed to fetch access requests' });
  }
});

// Create new access request
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      resourceType,
      resourceName,
      accessLevel,
      justification,
      expiresAt,
      requestedBy
    } = req.body;

    const result = await databaseService.query(`
      INSERT INTO access_requests (
        user_id, resource_type, resource_name, access_level,
        justification, expires_at, requested_by, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `, [userId, resourceType, resourceName, accessLevel, justification, expiresAt, requestedBy]);

    res.json({ id: result.lastID, message: 'Access request created successfully' });
  } catch (error) {
    console.error('Error creating access request:', error);
    res.status(500).json({ error: 'Failed to create access request' });
  }
});

// Approve access request
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    await databaseService.query(`
      UPDATE access_requests 
      SET status = 'approved', approved_at = datetime('now') 
      WHERE id = ?
    `, [id]);

    // Simulate automated provisioning
    setTimeout(async () => {
      await databaseService.query(`
        UPDATE access_requests 
        SET status = 'active' 
        WHERE id = ?
      `, [id]);
    }, 2000);

    res.json({ message: 'Access request approved' });
  } catch (error) {
    console.error('Error approving access request:', error);
    res.status(500).json({ error: 'Failed to approve access request' });
  }
});

module.exports = router;