const express = require('express');
const router = express.Router();

let problems = [];

router.get('/', async (req, res) => {
  try {
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newProblem = {
      id: `PRB-${String(problems.length + 1).padStart(3, '0')}`,
      ...req.body,
      created: new Date().toISOString()
    };
    
    problems.push(newProblem);
    res.status(201).json(newProblem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;