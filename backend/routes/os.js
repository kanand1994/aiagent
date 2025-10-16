const express = require('express');
const router = express.Router();

let osManagement = [];

router.get('/', async (req, res) => {
  try {
    res.json(osManagement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newOS = {
      id: `OS-${String(osManagement.length + 1).padStart(3, '0')}`,
      ...req.body,
      created: new Date().toISOString()
    };
    
    osManagement.push(newOS);
    res.status(201).json(newOS);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;