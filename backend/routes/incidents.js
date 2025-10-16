const express = require('express');
const router = express.Router();

// Mock incidents data
let incidents = [
  {
    id: 'INC-001',
    title: 'Network connectivity issue',
    description: 'Users unable to access internal resources',
    status: 'Open',
    severity: 'High',
    priority: 'P1',
    assignee: 'Network Team',
    affected_systems: ['Router-01', 'Switch-02'],
    created: '2024-01-15T10:30:00Z',
    updated: '2024-01-15T10:30:00Z'
  }
];

// Get all incidents
router.get('/', async (req, res) => {
  try {
    const { status, severity, assignee } = req.query;
    
    let filteredIncidents = [...incidents];
    
    if (status) {
      filteredIncidents = filteredIncidents.filter(i => i.status === status);
    }
    if (severity) {
      filteredIncidents = filteredIncidents.filter(i => i.severity === severity);
    }
    if (assignee) {
      filteredIncidents = filteredIncidents.filter(i => i.assignee.includes(assignee));
    }
    
    res.json(filteredIncidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new incident
router.post('/', async (req, res) => {
  try {
    const newIncident = {
      id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
      ...req.body,
      status: 'Open',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    incidents.push(newIncident);
    res.status(201).json(newIncident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;