const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Get all software requests
router.get('/', async (req, res) => {
  try {
    const requests = await db.query(`
      SELECT sr.*, u.full_name as requestedBy 
      FROM software_requests sr 
      LEFT JOIN users u ON sr.requested_by = u.id 
      ORDER BY sr.created_at DESC
    `);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching software requests:', error);
    res.status(500).json({ error: 'Failed to fetch software requests' });
  }
});

// Create new software request
router.post('/', async (req, res) => {
  try {
    const {
      applicationName,
      version,
      targetMachine,
      justification,
      requestedBy,
      autoInstall
    } = req.body;

    const status = autoInstall ? 'auto-approved' : 'pending';

    const result = await db.run(`
      INSERT INTO software_requests (
        application_name, version, target_machine, justification,
        requested_by, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `, [applicationName, version, targetMachine, justification, requestedBy, status]);

    // If auto-approved, simulate installation
    if (autoInstall) {
      setTimeout(async () => {
        await db.run(`
          UPDATE software_requests 
          SET status = 'installing', progress = 50 
          WHERE id = ?
        `, [result.id]);

        setTimeout(async () => {
          await db.run(`
            UPDATE software_requests 
            SET status = 'completed', progress = 100 
            WHERE id = ?
          `, [result.id]);
        }, 3000);
      }, 1000);
    }

    res.json({ id: result.id, message: 'Software request created successfully' });
  } catch (error) {
    console.error('Error creating software request:', error);
    res.status(500).json({ error: 'Failed to create software request' });
  }
});


// Approve software request
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run(`
      UPDATE software_requests 
      SET status = 'approved', approved_at = datetime('now') 
      WHERE id = ?
    `, [id]);
    res.json({ message: 'Software request approved' });
  } catch (error) {
    console.error('Error approving software request:', error);
    res.status(500).json({ error: 'Failed to approve software request' });
  }
});

module.exports = router;