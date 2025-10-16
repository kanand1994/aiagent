const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Get all assets
router.get('/', async (req, res) => {
  try {
    const assets = await db.query(`
      SELECT * FROM assets ORDER BY name ASC
    `);
    res.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Create new asset
router.post('/', async (req, res) => {
  try {
    const {
      name, type, serialNumber, location, owner, status,
      ipAddress, macAddress, operatingSystem, osVersion,
      cpu, memory, storage, createdBy
    } = req.body;

    const result = await databaseService.query(`
      INSERT INTO assets (
        name, type, serial_number, location, owner, status,
        ip_address, mac_address, operating_system, os_version,
        cpu, memory, storage, created_by, created_at, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [name, type, serialNumber, location, owner, status, ipAddress, macAddress, 
        operatingSystem, osVersion, cpu, memory, storage, createdBy]);

    res.json({ id: result.lastID, message: 'Asset created successfully' });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// Run asset discovery
router.post('/discovery/run', async (req, res) => {
  try {
    // Simulate discovery process
    setTimeout(async () => {
      // Add discovered assets
      const discoveredAssets = [
        {
          name: 'DISCOVERED-PC-001',
          type: 'workstation',
          serialNumber: 'DISC001',
          location: 'Auto-discovered',
          owner: 'Unknown',
          status: 'active',
          ipAddress: '192.168.1.100',
          macAddress: '00:11:22:33:44:55',
          operatingSystem: 'Windows 11',
          osVersion: '22H2',
          complianceScore: 85
        }
      ];

      for (const asset of discoveredAssets) {
        await databaseService.query(`
          INSERT OR IGNORE INTO assets (
            name, type, serial_number, location, owner, status,
            ip_address, mac_address, operating_system, os_version,
            compliance_score, created_at, last_updated, last_scan
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
        `, [asset.name, asset.type, asset.serialNumber, asset.location, asset.owner,
            asset.status, asset.ipAddress, asset.macAddress, asset.operatingSystem,
            asset.osVersion, asset.complianceScore]);
      }
    }, 2000);

    res.json({ message: 'Asset discovery started' });
  } catch (error) {
    console.error('Error running discovery:', error);
    res.status(500).json({ error: 'Failed to run asset discovery' });
  }
});

// Get discovery status
router.get('/discovery/status', async (req, res) => {
  try {
    res.json({ running: false });
  } catch (error) {
    console.error('Error getting discovery status:', error);
    res.status(500).json({ error: 'Failed to get discovery status' });
  }
});

// Scan specific asset
router.post('/:id/scan', async (req, res) => {
  try {
    const { id } = req.params;
    await databaseService.query(`
      UPDATE assets 
      SET last_scan = datetime('now'), compliance_score = ? 
      WHERE id = ?
    `, [Math.floor(Math.random() * 30) + 70, id]);
    res.json({ message: 'Asset scan completed' });
  } catch (error) {
    console.error('Error scanning asset:', error);
    res.status(500).json({ error: 'Failed to scan asset' });
  }
});

module.exports = router;