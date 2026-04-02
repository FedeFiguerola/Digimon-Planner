/**
 * Digimon Service
 * 
 * Business logic for Digimon operations
 * - Load and cache Digimon data
 * - Provide search and lookup functions
 */

const fs = require('fs');
const path = require('path');

class DigimonService {
  constructor() {
    this.digimons = null;           // Array of all Digimon
    this.digimonMap = new Map();    // id -> Digimon
    this.nameMap = new Map();       // name (lowercase) -> Digimon
  }

  /**
   * Initialize service by loading and indexing Digimon data
   * Should be called once on application startup
   */
  initialize() {
    const filePath = path.join(__dirname, '../../data/processed/digimon.json');
    
    const data = fs.readFileSync(filePath, 'utf-8');
    this.digimons = JSON.parse(data);

    // Build indexes for O(1) lookups
    for (const digimon of this.digimons) {
      this.digimonMap.set(digimon.id, digimon);
      // Store lowercase for case-insensitive lookups
      this.nameMap.set(digimon.name.toLowerCase(), digimon);
    }

    console.log(`[DigimonService] Loaded ${this.digimons.length} Digimon`);
  }

  /**
   * Get all Digimon
   * @returns {Object[]} Array of Digimon objects
   */
  getAll() {
    return this.digimons;
  }

  /**
   * Get Digimon by ID
   * @param {number} id - Digimon ID
   * @returns {Object|null} Digimon object or null if not found
   */
  getById(id) {
    return this.digimonMap.get(id) || null;
  }

  /**
   * Get Digimon by name (case-insensitive)
   * @param {string} name - Digimon name
   * @returns {Object|null} Digimon object or null if not found
   */
  getByName(name) {
    return this.nameMap.get(name.toLowerCase()) || null;
  }

  /**
   * Search Digimon by name (case-insensitive, partial match)
   * @param {string} query - Search query
   * @returns {Object[]} Array of matching Digimon
   */
  search(query) {
    if (!query || query.trim().length === 0) {
      return this.digimons;
    }

    const lowerQuery = query.toLowerCase();
    return this.digimons.filter(d => 
      d.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Check if Digimon exists by name (case-insensitive)
   * @param {string} name - Digimon name
   * @returns {boolean}
   */
  exists(name) {
    return this.nameMap.has(name.toLowerCase());
  }

  /**
   * Get exact match Digimon name (case-insensitive input)
   * Useful for normalizing user input
   * @param {string} name - Digimon name (case-insensitive)
   * @returns {string|null} Exact Digimon name or null
   */
  getExactName(name) {
    const digimon = this.getByName(name);
    return digimon ? digimon.name : null;
  }

  /**
   * Get stats about the Digimon dataset
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      total: this.digimons.length,
      byGeneration: this._countByGeneration(),
      avgEvolutions: this._avgEvolutions()
    };
  }

  /**
   * Count Digimon by generation
   * @private
   * @returns {Object}
   */
  _countByGeneration() {
    const counts = {};
    for (const digimon of this.digimons) {
      const gen = digimon.generation;
      counts[gen] = (counts[gen] || 0) + 1;
    }
    return counts;
  }

  /**
   * Calculate average evolutions per Digimon
   * @private
   * @returns {number}
   */
  _avgEvolutions() {
    const total = this.digimons.reduce((sum, d) => 
      sum + (d.evolutions?.length || 0), 0
    );
    return (total / this.digimons.length).toFixed(2);
  }
}

// Export singleton instance
module.exports = new DigimonService();
