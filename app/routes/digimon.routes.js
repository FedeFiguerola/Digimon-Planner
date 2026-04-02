/**
 * Digimon Routes
 * 
 * Endpoints for Digimon operations:
 * - GET /digimon - List all Digimon
 * - GET /digimon/:id - Get single Digimon by ID
 * - GET /digimon/name/:name - Get Digimon by name (case-insensitive)
 * - GET /digimon/search?q=... - Search Digimon by name
 */

const express = require('express');
const router = express.Router();
const digimonService = require('../services/digimon.service');

/**
 * GET /digimon
 * Get all Digimon with optional search
 * 
 * Query parameters:
 *   - search: string (optional) - Filter by name
 */
router.get('/', (req, res) => {
  try {
    const { search } = req.query;

    let result;
    if (search) {
      result = digimonService.search(search);
    } else {
      result = digimonService.getAll();
    }

    res.json({
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('[GET /digimon] Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch Digimon',
      message: error.message
    });
  }
});

/**
 * GET /digimon/:id
 * Get single Digimon by ID
 * 
 * Parameters:
 *   - id: number - Digimon ID
 */
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'ID must be a number'
      });
    }

    const digimon = digimonService.getById(id);

    if (!digimon) {
      return res.status(404).json({
        error: 'Not found',
        message: `Digimon with ID ${id} not found`
      });
    }

    res.json(digimon);
  } catch (error) {
    console.error(`[GET /digimon/:id] Error:`, error.message);
    res.status(500).json({
      error: 'Failed to fetch Digimon',
      message: error.message
    });
  }
});

/**
 * GET /digimon/name/:name
 * Get Digimon by name (case-insensitive)
 * 
 * Parameters:
 *   - name: string - Digimon name (case-insensitive)
 */
router.get('/name/:name', (req, res) => {
  try {
    const { name } = req.params;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid name',
        message: 'Name parameter is required'
      });
    }

    const digimon = digimonService.getByName(name);

    if (!digimon) {
      return res.status(404).json({
        error: 'Not found',
        message: `Digimon "${name}" not found`
      });
    }

    res.json(digimon);
  } catch (error) {
    console.error('[GET /digimon/name/:name] Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch Digimon',
      message: error.message
    });
  }
});

module.exports = router;
