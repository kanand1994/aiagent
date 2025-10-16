const express = require('express');
const axios = require('axios');
const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Multi-agent chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/chat/message`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('AI service error:', error.message);
    res.status(500).json({ 
      error: 'AI service unavailable',
      message: 'I apologize, but the AI agents are currently unavailable. Please try again later or contact support.',
      agent_info: {
        agent_id: 'fallback',
        agent_name: 'Fallback Agent',
        capabilities: ['basic_response']
      }
    });
  }
});

// Get agent status
router.get('/agents/status', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/agents/status`);
    res.json(response.data);
  } catch (error) {
    console.error('AI service error:', error.message);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

// Incident analysis endpoint
router.post('/analyze-incident', async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/incidents/analyze`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('AI service error:', error.message);
    res.status(500).json({ error: 'AI analysis service unavailable' });
  }
});

module.exports = router;