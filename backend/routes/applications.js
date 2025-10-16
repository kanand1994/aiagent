const express = require('express');
const router = express.Router();

let applications = [];

router.get('/', async (req, res) => {
  try {
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newApp = {
      id: `APP-${String(applications.length + 1).padStart(3, '0')}`,
      ...req.body,
      created: new Date().toISOString()
    };
    
    applications.push(newApp);
    res.status(201).json(newApp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;