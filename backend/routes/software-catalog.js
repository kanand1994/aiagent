const express = require('express');
const router = express.Router();

// Get software catalog
router.get('/', async (req, res) => {
  try {
    const catalog = [
      {
        id: 1,
        name: 'Visual Studio Code',
        version: '1.85.0',
        description: 'Lightweight code editor with IntelliSense, debugging, and Git integration',
        approved: true,
        securityRating: 5,
        category: 'Development'
      },
      {
        id: 2,
        name: 'Google Chrome',
        version: '120.0',
        description: 'Fast, secure web browser with modern web standards support',
        approved: true,
        securityRating: 4,
        category: 'Browser'
      },
      {
        id: 3,
        name: 'Adobe Photoshop',
        version: '2024',
        description: 'Professional image editing and graphic design software',
        approved: false,
        securityRating: 4,
        category: 'Design'
      },
      {
        id: 4,
        name: 'Microsoft Office 365',
        version: '2024',
        description: 'Complete office productivity suite with Word, Excel, PowerPoint',
        approved: true,
        securityRating: 5,
        category: 'Productivity'
      },
      {
        id: 5,
        name: 'Slack',
        version: '4.36.0',
        description: 'Team collaboration and messaging platform',
        approved: true,
        securityRating: 4,
        category: 'Communication'
      },
      {
        id: 6,
        name: 'Docker Desktop',
        version: '4.26.0',
        description: 'Containerization platform for application development',
        approved: false,
        securityRating: 3,
        category: 'Development'
      }
    ];
    res.json(catalog);
  } catch (error) {
    console.error('Error fetching software catalog:', error);
    res.status(500).json({ error: 'Failed to fetch software catalog' });
  }
});

module.exports = router;