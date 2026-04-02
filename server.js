/**
 * Digimon Planner API Server
 * 
 * Entry point for the Express server
 * Run with: node server.js
 */

const createApp = require('./app/app');

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`\n🚀 Digimon Planner API running on http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  GET  http://localhost:${PORT}/digimon`);
  console.log(`  GET  http://localhost:${PORT}/digimon/:id`);
  console.log(`  GET  http://localhost:${PORT}/digimon/name/:name`);
  console.log(`  POST http://localhost:${PORT}/path`);
  console.log('');
});

module.exports = app;
