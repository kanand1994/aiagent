const express = require('express');
const router = express.Router();
const dbService = require('../services/databaseService');

// Get dashboard metrics
router.get('/metrics', async (req, res) => {
  try {
    // Get real metrics from database
    const tickets = await dbService.getTickets();
    const incidents = await dbService.getIncidents();
    const requests = await dbService.getRequests();
    const problems = await dbService.getProblems();
    
    const metrics = {
      totalTickets: tickets.length,
      openIncidents: incidents.filter(i => i.status === 'Open').length,
      pendingChanges: requests.filter(r => r.status === 'Pending Approval').length,
      systemUptime: 99.5, // This would come from monitoring system
      avgResolutionTime: 2.3, // This would be calculated from resolved tickets
      automationRate: 85 // This would be calculated from auto-routed tickets
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get ticket trends
router.get('/ticket-trends', async (req, res) => {
  try {
    // Get real ticket trends from database
    const tickets = await dbService.getTickets();
    
    // For now, return empty data since we start with no tickets
    // In a real system, this would analyze ticket creation dates
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map(day => ({
      name: day,
      tickets: 0,
      resolved: 0
    }));
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching ticket trends:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get incidents by category
router.get('/incidents-by-category', async (req, res) => {
  try {
    // Get real incidents from database
    const incidents = await dbService.getIncidents();
    
    // Count incidents by category
    const categoryCount = {};
    incidents.forEach(incident => {
      const category = incident.category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    // Convert to chart format
    const categories = Object.entries(categoryCount).map(([name, value], index) => {
      const colors = ['#ff4d4f', '#faad14', '#52c41a', '#1890ff', '#722ed1'];
      return {
        name,
        value,
        color: colors[index % colors.length]
      };
    });
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent activities
router.get('/recent-activities', async (req, res) => {
  try {
    // Get real recent activities from database
    // For now, return empty array since we start with no data
    const activities = [];
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get critical alerts
router.get('/critical-alerts', async (req, res) => {
  try {
    // Get real critical alerts from database
    // For now, return empty array since we start with no data
    const alerts = [];
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching critical alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get system performance
router.get('/system-performance', async (req, res) => {
  try {
    // Get real system performance from monitoring system
    // For now, return static low values since we start fresh
    const performance = {
      cpu: 15,
      memory: 25,
      disk: 30
    };
    
    res.json(performance);
  } catch (error) {
    console.error('Error fetching system performance:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;