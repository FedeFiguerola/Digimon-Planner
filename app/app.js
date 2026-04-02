/**
 * Digimon Planner API
 * 
 * Main Express application setup
 * Initializes services and configures routes
 */

const express = require('express');
const digimonService = require('./services/digimon.service');
const pathfinderService = require('./services/pathfinder.service');
const digimonRoutes = require('./routes/digimon.routes');
const pathRoutes = require('./routes/path.routes');

/**
 * Create and configure Express app
 */
function createApp() {
  const app = express();

  // Middleware
  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    const { method, path } = req;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${method} ${path}`);
    next();
  });

  // Initialize services
  try {
    digimonService.initialize();
    pathfinderService.initialize();
  } catch (error) {
    console.error('Failed to initialize services:', error.message);
    process.exit(1);
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      services: {
        digimon: 'ready',
        pathfinder: pathfinderService.isReady() ? 'ready' : 'not ready'
      }
    });
  });

  // Digimon endpoints
  app.use('/digimon', digimonRoutes);

  // Pathfinding endpoint
  app.use('/path', pathRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not found',
      message: `Route ${req.method} ${req.path} not found`,
      available: [
        'GET /health',
        'GET /digimon',
        'GET /digimon/:id',
        'GET /digimon/name/:name',
        'POST /path'
      ]
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  });

  return app;
}

module.exports = createApp;
