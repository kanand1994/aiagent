const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Get all change requests
router.get('/', async (req, res) => {
  try {
    const changes = await db.query(`
      SELECT c.*, u.full_name as requestedBy 
      FROM changes c 
      LEFT JOIN users u ON c.requested_by = u.id 
      ORDER BY c.created_at DESC
    `);
    res.json(changes);
  } catch (error) {
    console.error('Error fetching changes:', error);
    res.status(500).json({ error: 'Failed to fetch changes' });
  }
});

// Create new change request
router.post('/', async (req, res) => {
  try {
    const {
      title,
      type,
      riskLevel,
      description,
      businessJustification,
      rollbackPlan,
      scheduledDate,
      requestedBy
    } = req.body;

    const result = await databaseService.query(`
      INSERT INTO changes (
        title, type, risk_level, description, business_justification,
        rollback_plan, scheduled_date, requested_by, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `, [title, type, riskLevel, description, businessJustification, rollbackPlan, scheduledDate, requestedBy]);

    res.json({ id: result.lastID, message: 'Change request created successfully' });
  } catch (error) {
    console.error('Error creating change:', error);
    res.status(500).json({ error: 'Failed to create change request' });
  }
});

// Approve change request
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    await databaseService.query(`
      UPDATE changes 
      SET status = 'approved', approved_at = datetime('now') 
      WHERE id = ?
    `, [id]);
    res.json({ message: 'Change request approved' });
  } catch (error) {
    console.error('Error approving change:', error);
    res.status(500).json({ error: 'Failed to approve change request' });
  }
});

// Reject change request
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await databaseService.query(`
      UPDATE changes 
      SET status = 'rejected', rejection_reason = ?, rejected_at = datetime('now') 
      WHERE id = ?
    `, [reason, id]);
    res.json({ message: 'Change request rejected' });
  } catch (error) {
    console.error('Error rejecting change:', error);
    res.status(500).json({ error: 'Failed to reject change request' });
  }
});

module.exports = router;