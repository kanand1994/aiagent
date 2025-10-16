const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// Get overview report
router.post('/overview', async (req, res) => {
  try {
    const { dateRange } = req.body;
    
    // Get ticket statistics
    const totalTickets = await databaseService.query(`
      SELECT COUNT(*) as count FROM tickets 
      WHERE created_at >= date('now', '-30 days')
    `);
    
    const resolvedTickets = await databaseService.query(`
      SELECT COUNT(*) as count FROM tickets 
      WHERE status = 'Resolved' AND created_at >= date('now', '-30 days')
    `);

    // Mock data for demonstration
    const reportData = {
      totalTickets: totalTickets[0]?.count || 1247,
      resolvedTickets: resolvedTickets[0]?.count || 1089,
      avgResolutionTime: 4.2,
      customerSatisfaction: 4.6,
      ticketTrends: [
        { month: 'Jan', created: 120, resolved: 115 },
        { month: 'Feb', created: 135, resolved: 128 },
        { month: 'Mar', created: 98, resolved: 105 },
        { month: 'Apr', created: 142, resolved: 138 },
        { month: 'May', created: 156, resolved: 149 },
        { month: 'Jun', created: 134, resolved: 141 }
      ],
      categoryBreakdown: [
        { name: 'Hardware', value: 35, color: '#8884d8' },
        { name: 'Software', value: 28, color: '#82ca9d' },
        { name: 'Network', value: 22, color: '#ffc658' },
        { name: 'Security', value: 15, color: '#ff7300' }
      ]
    };

    res.json(reportData);
  } catch (error) {
    console.error('Error generating overview report:', error);
    res.status(500).json({ error: 'Failed to generate overview report' });
  }
});

// Get performance report
router.post('/performance', async (req, res) => {
  try {
    const reportData = {
      slaCompliance: 94.5,
      firstCallResolution: 78.2,
      escalationRate: 12.3,
      performanceTrends: [
        { week: 'W1', sla: 92, fcr: 75, escalation: 15 },
        { week: 'W2', sla: 94, fcr: 78, escalation: 13 },
        { week: 'W3', sla: 96, fcr: 80, escalation: 11 },
        { week: 'W4', sla: 95, fcr: 77, escalation: 12 }
      ]
    };

    res.json(reportData);
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({ error: 'Failed to generate performance report' });
  }
});

// Get automation report
router.post('/automation', async (req, res) => {
  try {
    const reportData = {
      automationRate: 67.8,
      timesSaved: 2340,
      costSavings: 125000,
      automationTrends: [
        { category: 'Password Resets', automated: 95, manual: 5 },
        { category: 'Software Installation', automated: 78, manual: 22 },
        { category: 'VM Provisioning', automated: 89, manual: 11 },
        { category: 'User Onboarding', automated: 45, manual: 55 }
      ]
    };

    res.json(reportData);
  } catch (error) {
    console.error('Error generating automation report:', error);
    res.status(500).json({ error: 'Failed to generate automation report' });
  }
});

// Get security report
router.post('/security', async (req, res) => {
  try {
    const reportData = {
      securityIncidents: 23,
      patchCompliance: 92.5,
      vulnerabilities: {
        critical: 2,
        high: 8,
        medium: 15,
        low: 34
      },
      securityTrends: [
        { month: 'Jan', incidents: 5, patches: 89 },
        { month: 'Feb', incidents: 3, patches: 92 },
        { month: 'Mar', incidents: 7, patches: 88 },
        { month: 'Apr', incidents: 4, patches: 94 },
        { month: 'May', incidents: 2, patches: 96 },
        { month: 'Jun', incidents: 2, patches: 93 }
      ]
    };

    res.json(reportData);
  } catch (error) {
    console.error('Error generating security report:', error);
    res.status(500).json({ error: 'Failed to generate security report' });
  }
});

// Get compliance report
router.post('/compliance', async (req, res) => {
  try {
    const reportData = {
      overallCompliance: 88.7,
      frameworks: {
        iso27001: 92,
        sox: 85,
        gdpr: 94,
        hipaa: 78
      },
      auditFindings: [
        { category: 'Access Control', findings: 3, severity: 'Medium' },
        { category: 'Data Protection', findings: 1, severity: 'High' },
        { category: 'Change Management', findings: 5, severity: 'Low' },
        { category: 'Incident Response', findings: 2, severity: 'Medium' }
      ]
    };

    res.json(reportData);
  } catch (error) {
    console.error('Error generating compliance report:', error);
    res.status(500).json({ error: 'Failed to generate compliance report' });
  }
});

module.exports = router;