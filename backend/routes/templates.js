const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = [
      {
        id: 1,
        name: 'Windows Server 2022 Standard',
        operatingSystem: 'Windows Server 2022',
        version: '21H2',
        type: 'server',
        status: 'ready',
        size: 25,
        usageCount: 15,
        hardened: true,
        description: 'Standard Windows Server template with IIS, .NET Framework, and security hardening',
        createdBy: 'IT Team',
        lastUpdated: '2024-01-15',
        installedSoftware: [
          { name: 'IIS', version: '10.0', type: 'Web Server', status: 'installed' },
          { name: '.NET Framework', version: '4.8', type: 'Runtime', status: 'installed' },
          { name: 'Windows Defender', version: 'Latest', type: 'Security', status: 'installed' }
        ]
      },
      {
        id: 2,
        name: 'Ubuntu 22.04 LTS Server',
        operatingSystem: 'Ubuntu Server',
        version: '22.04 LTS',
        type: 'server',
        status: 'ready',
        size: 8,
        usageCount: 23,
        hardened: true,
        description: 'Ubuntu Server with Docker, Node.js, and security hardening',
        createdBy: 'DevOps Team',
        lastUpdated: '2024-01-14',
        installedSoftware: [
          { name: 'Docker', version: '24.0', type: 'Container', status: 'installed' },
          { name: 'Node.js', version: '18.x', type: 'Runtime', status: 'installed' },
          { name: 'UFW Firewall', version: 'Latest', type: 'Security', status: 'installed' }
        ]
      },
      {
        id: 3,
        name: 'Windows 11 Pro Development',
        operatingSystem: 'Windows 11 Pro',
        version: '22H2',
        type: 'desktop',
        status: 'building',
        size: 45,
        usageCount: 8,
        hardened: true,
        description: 'Windows 11 desktop with development tools and productivity software',
        createdBy: 'Development Team',
        lastUpdated: '2024-01-16',
        installedSoftware: [
          { name: 'Visual Studio 2022', version: '17.8', type: 'IDE', status: 'installing' },
          { name: 'Office 365', version: '2024', type: 'Productivity', status: 'installed' },
          { name: 'Chrome', version: 'Latest', type: 'Browser', status: 'installed' }
        ]
      },
      {
        id: 4,
        name: 'CentOS 8 Web Server',
        operatingSystem: 'CentOS',
        version: '8',
        type: 'server',
        status: 'ready',
        size: 12,
        usageCount: 6,
        hardened: false,
        description: 'CentOS web server with Apache, PHP, and MySQL',
        createdBy: 'Web Team',
        lastUpdated: '2024-01-10',
        installedSoftware: [
          { name: 'Apache', version: '2.4', type: 'Web Server', status: 'installed' },
          { name: 'PHP', version: '8.1', type: 'Runtime', status: 'installed' },
          { name: 'MySQL', version: '8.0', type: 'Database', status: 'installed' }
        ]
      },
      {
        id: 5,
        name: 'Security Appliance Template',
        operatingSystem: 'Ubuntu Server',
        version: '22.04 LTS',
        type: 'appliance',
        status: 'testing',
        size: 15,
        usageCount: 2,
        hardened: true,
        description: 'Security monitoring appliance with SIEM and network monitoring tools',
        createdBy: 'Security Team',
        lastUpdated: '2024-01-16',
        installedSoftware: [
          { name: 'Elasticsearch', version: '8.x', type: 'Search Engine', status: 'installed' },
          { name: 'Kibana', version: '8.x', type: 'Visualization', status: 'installed' },
          { name: 'Suricata', version: '6.x', type: 'IDS/IPS', status: 'testing' }
        ]
      }
    ];
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Create new template
router.post('/', async (req, res) => {
  try {
    const {
      name,
      operatingSystem,
      version,
      type,
      description,
      hardened,
      softwarePackages,
      createdBy
    } = req.body;

    // Simulate template creation process
    const templateId = Date.now(); // Simple ID generation
    
    // Start build process
    setTimeout(async () => {
      console.log(`Template ${templateId} build started`);
      // Simulate build phases
      setTimeout(() => {
        console.log(`Template ${templateId} - OS installation phase`);
      }, 2000);
      
      setTimeout(() => {
        console.log(`Template ${templateId} - Software installation phase`);
      }, 5000);
      
      setTimeout(() => {
        console.log(`Template ${templateId} - Security hardening phase`);
      }, 8000);
      
      setTimeout(() => {
        console.log(`Template ${templateId} - Build completed`);
      }, 12000);
    }, 1000);

    res.json({ 
      id: templateId, 
      message: 'Template creation started',
      estimatedTime: '10-15 minutes'
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Build template
router.post('/:id/build', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simulate template build process
    setTimeout(() => {
      console.log(`Template ${id} rebuild completed`);
    }, 10000);

    res.json({ message: 'Template build started' });
  } catch (error) {
    console.error('Error building template:', error);
    res.status(500).json({ error: 'Failed to build template' });
  }
});

// Clone template
router.post('/:id/clone', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simulate template cloning
    const cloneId = Date.now();
    
    setTimeout(() => {
      console.log(`Template ${id} cloned as ${cloneId}`);
    }, 3000);

    res.json({ 
      id: cloneId, 
      message: 'Template cloning started',
      originalId: id
    });
  } catch (error) {
    console.error('Error cloning template:', error);
    res.status(500).json({ error: 'Failed to clone template' });
  }
});

// Upload template
router.post('/upload', async (req, res) => {
  try {
    // Handle file upload logic here
    // This would typically involve multer middleware for file handling
    
    res.json({ message: 'Template upload completed' });
  } catch (error) {
    console.error('Error uploading template:', error);
    res.status(500).json({ error: 'Failed to upload template' });
  }
});

module.exports = router;