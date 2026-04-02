/**
 * Digimon Pathfinder
 * 
 * Calculates shortest evolution paths between two Digimon using BFS.
 * Supports optional de-digivolution (backward edge traversal).
 */

const fs = require('fs');
const path = require('path');

/**
 * DigimonGraph - Encapsulates the graph structure and pathfinding logic
 */
class DigimonGraph {
  constructor(digimonData) {
    this.digimons = digimonData; // Raw Digimon array
    this.digimonMap = new Map(); // name -> Digimon object
    this.graph = new Map(); // name -> { forward: [], backward: [] }
    
    this._buildDigimonMap();
    this._buildGraph();
  }

  /**
   * Build a map for O(1) lookups by Digimon name
   */
  _buildDigimonMap() {
    for (const digimon of this.digimons) {
      this.digimonMap.set(digimon.name, digimon);
    }
  }

  /**
   * Build adjacency list for the graph
   */
  _buildGraph() {
    for (const digimon of this.digimons) {
      const { name, evolutions = [], pre_evolutions = [] } = digimon;

      if (!this.graph.has(name)) {
        this.graph.set(name, { forward: [], backward: [] });
      }

      // Forward edges (evolutions)
      for (const evolution of evolutions) {
        this.graph.get(name).forward.push(evolution);
      }

      // Backward edges (pre_evolutions)
      for (const preEvolution of pre_evolutions) {
        this.graph.get(name).backward.push(preEvolution);
      }
    }
  }

  /**
   * Get adjacency list for a given Digimon
   * @param {string} name - Digimon name
   * @param {boolean} allowDeDigivolve - If true, include backward edges
   * @returns {string[]} - List of adjacent Digimon names
   * @throws {Error} - If Digimon name is invalid
   */
  getNeighbors(name, allowDeDigivolve = false) {
    if (!this.graph.has(name)) {
      throw new Error(`Invalid Digimon name: "${name}". Not found in dataset.`);
    }

    const { forward, backward } = this.graph.get(name);
    
    if (allowDeDigivolve) {
      return [...forward, ...backward];
    }
    return forward;
  }

  /**
   * Find ALL shortest paths between two Digimon
   * Uses BFS to find shortest paths and collects all paths of equal length
   * 
   * @param {string} startName - Starting Digimon name
   * @param {string} targetName - Target Digimon name
   * @param {boolean} allowDeDigivolve - If true, allow backward evolution (de-digivolution)
   * @returns {Object} - { paths: string[][], steps: number | null }
   * @throws {Error} - If either Digimon name is invalid
   */
  findShortestPaths(startName, targetName, allowDeDigivolve = false) {
    // Validate input
    if (!this.graph.has(startName)) {
      throw new Error(`Start Digimon not found: "${startName}"`);
    }
    if (!this.graph.has(targetName)) {
      throw new Error(`Target Digimon not found: "${targetName}"`);
    }

    // Edge case: start equals target
    if (startName === targetName) {
      return {
        paths: [[startName]],
        steps: 0
      };
    }

    // BFS queue: each item contains [currentName, [path]]
    const queue = [[startName, [startName]]];
    
    // Visited set: tracks nodes already processed at current level
    const visited = new Set([startName]);
    
    // Store all shortest paths when found
    let shortestPaths = [];
    let shortestDistance = null;

    while (queue.length > 0) {
      // Process all nodes at current level
      const levelSize = queue.length;

      for (let i = 0; i < levelSize; i++) {
        const [currentName, currentPath] = queue.shift();
        const currentDistance = currentPath.length - 1;

        // If we already found shorter paths, skip nodes at greater distance
        if (shortestDistance !== null && currentDistance > shortestDistance) {
          // Put the item back for next iteration (will be skipped)
          queue.unshift([currentName, currentPath]);
          continue;
        }

        // Get neighbors
        const neighbors = this.getNeighbors(currentName, allowDeDigivolve);

        for (const neighbor of neighbors) {
          const newPath = [...currentPath, neighbor];
          const newDistance = newPath.length - 1;

          // Found target!
          if (neighbor === targetName) {
            // If this is a new shortest distance, clear previous paths
            if (shortestDistance === null) {
              shortestDistance = newDistance;
              shortestPaths = [newPath];
            } else if (newDistance === shortestDistance) {
              // Same distance, add to paths
              shortestPaths.push(newPath);
            }
            // If newDistance > shortestDistance, don't add
          } else if (shortestDistance === null && !visited.has(neighbor)) {
            // Haven't found target yet, continue BFS
            visited.add(neighbor);
            queue.push([neighbor, newPath]);
          }
        }
      }

      // If we found paths, we can stop (they are at smallest distance)
      if (shortestPaths.length > 0) {
        break;
      }
    }

    return {
      paths: shortestPaths,
      steps: shortestDistance
    };
  }

  /**
   * Find ALL shortest paths with enriched Digimon data
   * Instead of just names, returns full Digimon objects
   * 
   * @param {string} startName - Starting Digimon name
   * @param {string} targetName - Target Digimon name
   * @param {boolean} allowDeDigivolve - If true, allow backward evolution
   * @returns {Object} - { paths: Object[][], steps: number | null }
   */
  findShortestPathsEnriched(startName, targetName, allowDeDigivolve = false) {
    const result = this.findShortestPaths(startName, targetName, allowDeDigivolve);

    if (result.paths.length === 0) {
      return {
        paths: [],
        steps: result.steps
      };
    }

    // Enrich paths with full Digimon objects
    const enrichedPaths = result.paths.map(path =>
      path.map(name => this.digimonMap.get(name))
    );

    return {
      paths: enrichedPaths,
      steps: result.steps
    };
  }

  /**
   * Get a Digimon by name
   * @param {string} name - Digimon name
   * @returns {Object} - Full Digimon object
   * @throws {Error} - If Digimon not found
   */
  getDigimon(name) {
    if (!this.digimonMap.has(name)) {
      throw new Error(`Digimon not found: "${name}"`);
    }
    return this.digimonMap.get(name);
  }

  /**
   * Get all Digimon names
   * @returns {string[]} - Array of all Digimon names
   */
  getAllDigimonNames() {
    return Array.from(this.digimonMap.keys());
  }

  /**
   * Get stats about the graph
   * @returns {Object} - Graph statistics
   */
  getStats() {
    const totalNodes = this.graph.size;
    let totalEdges = 0;
    let nodesWithEvolutions = 0;
    let nodesWithPreEvolutions = 0;

    for (const [name, { forward, backward }] of this.graph) {
      totalEdges += forward.length + backward.length;
      if (forward.length > 0) nodesWithEvolutions++;
      if (backward.length > 0) nodesWithPreEvolutions++;
    }

    return {
      totalDigimon: totalNodes,
      totalEdges,
      nodesWithEvolutions,
      nodesWithPreEvolutions,
      averageDegree: (totalEdges / totalNodes).toFixed(2)
    };
  }
}

/**
 * Load Digimon data from JSON file and create a graph instance
 * @param {string} filePath - Path to digimon.json (relative to workspace root or absolute)
 * @returns {DigimonGraph} - Initialized graph instance
 */
function loadDigimonGraph(filePath) {
  let absolutePath;
  
  if (path.isAbsolute(filePath)) {
    absolutePath = filePath;
  } else {
    // Try relative to working directory first
    const cwdPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(cwdPath)) {
      absolutePath = cwdPath;
    } else {
      // Try relative to this file's directory
      absolutePath = path.join(__dirname, '..', filePath);
    }
  }
  
  const data = fs.readFileSync(absolutePath, 'utf-8');
  const digimons = JSON.parse(data);
  
  return new DigimonGraph(digimons);
}

/**
 * Convenience function - simplified interface
 * 
 * @param {string} startName - Starting Digimon
 * @param {string} targetName - Target Digimon
 * @param {boolean} allowDeDigivolve - Allow de-digivolution
 * @param {DigimonGraph} graph - Graph instance (loaded if not provided)
 * @returns {Object} - { paths: string[][], steps: number | null }
 */
function findShortestPaths(startName, targetName, allowDeDigivolve = false, graph = null) {
  if (graph === null) {
    graph = loadDigimonGraph('data/processed/digimon.json');
  }
  return graph.findShortestPaths(startName, targetName, allowDeDigivolve);
}

// Export for use as module
module.exports = {
  DigimonGraph,
  loadDigimonGraph,
  findShortestPaths
};
