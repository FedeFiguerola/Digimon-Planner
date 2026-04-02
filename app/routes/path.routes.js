/**
 * Pathfinder Routes
 * 
 * Endpoints for pathfinding operations:
 * - POST /path - Find shortest paths between two Digimon
 */

const express = require('express');
const router = express.Router();
const pathfinderService = require('../services/pathfinder.service');

/**
 * POST /path
 * Find shortest evolution paths between two Digimon
 * 
 * Request body:
 *   - from: string (required) - Starting Digimon name
 *   - to: string (required) - Target Digimon name
 *   - allowDeDigivolve: boolean (optional, default: false) - Allow backward evolution
 *   - enriched: boolean (optional, default: false) - Include full Digimon metadata
 * 
 * Response:
 *   - paths: array of shortest paths (each path is array of Digimon names or objects)
 *   - steps: number of evolution steps, or null if no path exists
 */
router.post('/', (req, res) => {
  try {
    const { from, to, allowDeDigivolve = false, enriched = false } = req.body;

    // Validate required fields
    if (!from || !to) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Both "from" and "to" are required'
      });
    }

    if (typeof from !== 'string' || typeof to !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: '"from" and "to" must be strings'
      });
    }

    // Validate optional parameters
    if (typeof allowDeDigivolve !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid input',
        message: '"allowDeDigivolve" must be a boolean'
      });
    }

    // Call appropriate service method
    let result;
    if (enriched) {
      result = pathfinderService.findPathsEnriched(from, to, allowDeDigivolve);
    } else {
      result = pathfinderService.findPaths(from, to, allowDeDigivolve);
    }

    res.json({
      paths: result.paths,
      steps: result.steps,
      count: result.paths.length
    });
  } catch (error) {
    console.error('[POST /path] Error:', error.message);

    // Check if error is about non-existent Digimon
    if (error.message.includes('not found')) {
      return res.status(400).json({
        error: 'Invalid Digimon',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Pathfinding failed',
      message: error.message
    });
  }
});

module.exports = router;
