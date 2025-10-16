const express = require('express');
const router = express.Router();

let requests = [
  {
    id: 'REQ-001',
    title: 'Software installation request',
    description: 'Need Adobe Photoshop installed',
    type: 'Software',
    status: 'Pending',
    priority: 'Medium',
    requester: 'John Doe',
    created: '2024-01-15T09:00:00Z'
  }
];

router.get('/', async (req, res) => {
  try {
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newRequest = {
      id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
      ...req.body,
      status: 'Pending',
      created: new Date().toISOString()
    };
    
    requests.push(newRequest);
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;