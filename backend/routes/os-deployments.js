const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// Get all OS deployments
router.get('/', async (req, res) => {
  try {
    const deployments = await databaseService.query(`
      SELECT od.*, u.name as requestedBy 
      FROM os_deployments od 
      LEFT JOIN users u ON od.requested_by = u.id 
      ORDER BY od.created_at DESC
    `);
    res.json(deployments);
  } catch (error) {
    console.error('Error fetching OS deployments:', error);
    res.status(500).json({ error: 'Failed to fetch OS deployments' });
  }
});

// Create new OS deployment
router.post('/', async (req, res) => {
  try {
    const {
      targetAsset,
      osImageId,
      deploymentType,
      hardened,
      notes,
      requestedBy
    } = req.body;

    // Get OS image details (simulated)
    const osImages = {
      1: { name: 'Windows 11 Pro', version: '22H2' },
      2: { name: 'Windows Server 2022', version: '21H2' },
      3: { name: 'Ubuntu Server', version: '22.04 LTS' },
      4: { name: 'CentOS', version: '8' }
    };

    const osImage = osImages[osImageId];

    const result = await databaseService.query(`
      INSERT INTO os_deployments (
        asset_id, os_name, os_version, deployment_type,
        status, progress, hardened, notes, requested_by, created_at
      ) VALUES (?, ?, ?, ?, 'pending', 0, ?, ?, ?, datetime('now'))
    `, [null, osImage.name, osImage.version, deploymentType, hardened, notes, requestedBy]);

    // Update with target asset info
    await databaseService.query(`
      UPDATE os_deployments 
      SET target_asset = ? 
      WHERE id = ?
    `, [targetAsset, result.lastID]);

    res.json({ id: result.lastID, message: 'OS deployment scheduled successfully' });
  } catch (error) {
    console.error('Error creating OS deployment:', error);
    res.status(500).json({ error: 'Failed to create OS deployment' });
  }
});

// Start OS deployment
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Start deployment process
    await databaseService.query(`
      UPDATE os_deployments 
      SET status = 'preparing', progress = 10 
      WHERE id = ?
    `, [id]);

    // Simulate deployment phases
    setTimeout(async () => {
      await databaseService.query(`
        UPDATE os_deployments 
        SET status = 'installing', progress = 30 
        WHERE id = ?
      `, [id]);
    }, 2000);

    setTimeout(async () => {
      await databaseService.query(`
        UPDATE os_deployments 
        SET status = 'configuring', progress = 60 
        WHERE id = ?
      `, [id]);
    }, 5000);

    setTimeout(async () => {
      await databaseService.query(`
        UPDATE os_deployments 
        SET status = 'hardening', progress = 80 
        WHERE id = ?
      `, [id]);
    }, 8000);

    setTimeout(async () => {
      await databaseService.query(`
        UPDATE os_deployments 
        SET status = 'completed', progress = 100, completed_date = datetime('now') 
        WHERE id = ?
      `, [id]);
    }, 12000);

    res.json({ message: 'OS deployment started' });
  } catch (error) {
    console.error('Error starting OS deployment:', error);
    res.status(500).json({ error: 'Failed to start OS deployment' });
  }
});

module.exports = router;