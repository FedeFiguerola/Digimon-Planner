/**
 * Pathfinder Service
 * 
 * Wrapper around the pathfinding algorithm
 * - Handles validation
 * - Formats responses
 * - Manages graph initialization
 */

const { loadDigimonGraph } = require('../../core/pathfinder');
const digimonService = require('./digimon.service');

class PathfinderService {
  constructor() {
    this.graph = null;
  }

  /**
   * Initialize the pathfinder with Digimon data
   * Should be called once on application startup
   */
  initialize() {
    try {
      this.graph = loadDigimonGraph('data/processed/digimon.json');
      console.log('[PathfinderService] Graph initialized successfully');
    } catch (error) {
      console.error('[PathfinderService] Failed to initialize graph:', error.message);
      throw error;
    }
  }

  /**
   * Find shortest paths between two Digimon
   * 
   * @param {string} fromName - Starting Digimon name (case-insensitive)
   * @param {string} toName - Target Digimon name (case-insensitive)
   * @param {boolean} allowDeDigivolve - Allow backward evolution steps
   * 
   * @returns {Object} Result object:
   *   - paths: array of shortest paths (each path is array of names)
   *   - steps: number of steps in shortest path, null if no path
   * 
   * @throws {Error} If Digimon names don't exist
   */
  findPaths(fromName, toName, allowDeDigivolve = false) {
    // Validate inputs
    if (!fromName || !toName) {
      throw new Error('Both "from" and "to" parameters are required');
    }

    // Check if Digimon exist (case-insensitive)
    if (!digimonService.exists(fromName)) {
      throw new Error(`Digimon not found: "${fromName}"`);
    }
    if (!digimonService.exists(toName)) {
      throw new Error(`Digimon not found: "${toName}"`);
    }

    // Get exact names for pathfinding
    const exactFromName = digimonService.getExactName(fromName);
    const exactToName = digimonService.getExactName(toName);

    // Use pathfinder
    const result = this.graph.findShortestPaths(
      exactFromName,
      exactToName,
      allowDeDigivolve
    );

    return {
      paths: result.paths,
      steps: result.steps
    };
  }

  /**
   * Find shortest paths with enriched metadata
   * 
   * @param {string} fromName - Starting Digimon name (case-insensitive)
   * @param {string} toName - Target Digimon name (case-insensitive)
   * @param {boolean} allowDeDigivolve - Allow backward evolution steps
   * 
   * @returns {Object} Result with enriched paths containing full Digimon objects
   */
  findPathsEnriched(fromName, toName, allowDeDigivolve = false) {
    // Validate inputs
    if (!fromName || !toName) {
      throw new Error('Both "from" and "to" parameters are required');
    }

    // Check if Digimon exist
    if (!digimonService.exists(fromName)) {
      throw new Error(`Digimon not found: "${fromName}"`);
    }
    if (!digimonService.exists(toName)) {
      throw new Error(`Digimon not found: "${toName}"`);
    }

    // Get exact names
    const exactFromName = digimonService.getExactName(fromName);
    const exactToName = digimonService.getExactName(toName);

    // Use enriched pathfinder
    const result = this.graph.findShortestPathsEnriched(
      exactFromName,
      exactToName,
      allowDeDigivolve
    );

    return {
      paths: result.paths,
      steps: result.steps
    };
  }

  /**
   * Get graph statistics
   * @returns {Object} Graph metrics
   */
  getStats() {
    if (!this.graph) {
      throw new Error('Graph not initialized');
    }
    return this.graph.getStats();
  }

  /**
   * Check if graph is ready
   * @returns {boolean}
   */
  isReady() {
    return this.graph !== null;
  }
}

// Export singleton instance
module.exports = new PathfinderService();
