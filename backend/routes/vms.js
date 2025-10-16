const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Get all VMs
router.get('/', async (req, res) => {
  try {
    const vms = await db.query(`
      SELECT v.*, u.full_name as owner 
      FROM virtual_machines v 
      LEFT JOIN users u ON v.requested_by = u.id 
      ORDER BY v.created_at DESC
    `);
    res.json(vms);
  } catch (error) {
    console.error('Error fetching VMs:', error);
    res.status(500).json({ error: 'Failed to fetch VMs' });
  }
});

// Get VM templates
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 1,
        name: 'Windows Server 2022',
        os: 'Windows Server 2022',
        description: 'Standard Windows Server template with IIS and .NET Framework',
        minCpu: 2,
        minMemory: 4,
        minStorage: 50
      },
      {
        id: 2,
        name: 'Ubuntu 22.04 LTS',
        os: 'Ubuntu 22.04 LTS',
        description: 'Ubuntu Server with Docker and development tools pre-installed',
        minCpu: 1,
        minMemory: 2,
        minStorage: 25
      },
      {
        id: 3,
        name: 'CentOS 8',
        os: 'CentOS 8',
        description: 'Enterprise Linux distribution for production workloads',
        minCpu: 2,
        minMemory: 4,
        minStorage: 30
      },
      {
        id: 4,
        name: 'Windows 11 Pro',
        os: 'Windows 11 Pro',
        description: 'Windows 11 desktop environment for development and testing',
        minCpu: 2,
        minMemory: 8,
        minStorage: 100
      }
    ];
    res.json(templates);
  } catch (error) {
    console.error('Error fetching VM templates:', error);
    res.status(500).json({ error: 'Failed to fetch VM templates' });
  }
});

// Create new VM
router.post('/', async (req, res) => {
  try {
    const {
      name,
      template,
      environment,
      cpu,
      memory,
      storage,
      purpose,
      requestedBy
    } = req.body;

    // Generate IP address (simplified)
    const ipAddress = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

    const result = await databaseService.query(`
      INSERT INTO virtual_machines (
        name, template, environment, cpu, memory, storage,
        purpose, ip_address, status, requested_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'provisioning', ?, datetime('now'))
    `, [name, template, environment, cpu, memory, storage, purpose, ipAddress, requestedBy]);

    // Simulate VM provisioning
    setTimeout(async () => {
      await databaseService.query(`
        UPDATE virtual_machines 
        SET status = 'running' 
        WHERE id = ?
      `, [result.lastID]);
    }, 5000);

    res.json({ id: result.lastID, message: 'VM creation started' });
  } catch (error) {
    console.error('Error creating VM:', error);
    res.status(500).json({ error: 'Failed to create VM' });
  }
});

// VM actions (start, stop, delete)
router.post('/:id/:action', async (req, res) => {
  try {
    const { id, action } = req.params;
    
    let newStatus;
    switch (action) {
      case 'start':
        newStatus = 'running';
        break;
      case 'stop':
        newStatus = 'stopped';
        break;
      case 'suspend':
        newStatus = 'suspended';
        break;
      case 'delete':
        await databaseService.query('DELETE FROM virtual_machines WHERE id = ?', [id]);
        return res.json({ message: 'VM deleted successfully' });
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    await databaseService.query(`
      UPDATE virtual_machines 
      SET status = ? 
      WHERE id = ?
    `, [newStatus, id]);

    res.json({ message: `VM ${action} completed` });
  } catch (error) {
    console.error(`Error ${req.params.action} VM:`, error);
    res.status(500).json({ error: `Failed to ${req.params.action} VM` });
  }
});

module.exports = router;