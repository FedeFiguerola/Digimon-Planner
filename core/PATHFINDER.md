# Digimon Pathfinder

A robust pathfinding system for calculating the **shortest evolution paths** between Digimon in your dataset.

## 📋 Overview

The Digimon Pathfinder uses **Breadth-First Search (BFS)** to find all shortest paths between two Digimon, with support for:

- ✅ **Forward evolution** (primary evolution paths)
- ✅ **De-digivolution** (reverse evolution paths)
- ✅ **Multiple shortest paths** (returns all paths with equal minimum length)
- ✅ **Enriched results** (full Digimon metadata)
- ✅ **Error handling** (validation & graceful errors)

## 🚀 Quick Start

### Basic Usage

```javascript
const { loadDigimonGraph } = require('./pathfinder');

// Create graph instance from data
const graph = loadDigimonGraph('../data/processed/digimon.json');

// Find shortest path from Agumon to WarGreymon
const result = graph.findShortestPaths('Agumon', 'WarGreymon', false);

console.log(result);
// Output:
// {
//   paths: [
//     ["Agumon", "Greymon", "MetalGreymon", "WarGreymon"],
//     ["Agumon", "GeoGreymon", "RizeGreymon", "ShineGreymon", ...]
//   ],
//   steps: 3
// }
```

### With De-Digivolution

```javascript
// Allow going backwards in evolution
const result = graph.findShortestPaths('Agumon', 'WarGreymon', true);
// Will find shorter paths if they exist using de-digivolution
```

## 📚 API Reference

### Class: `DigimonGraph`

Main class for pathfinding operations.

#### Constructor

```javascript
new DigimonGraph(digimonData)
```

**Parameters:**
- `digimonData` (Array): Array of Digimon objects from JSON

#### Methods

##### `findShortestPaths(startName, targetName, allowDeDigivolve)`

Finds all shortest paths between two Digimon.

**Parameters:**
- `startName` (string): Name of starting Digimon
- `targetName` (string): Name of target Digimon
- `allowDeDigivolve` (boolean): Enable backward evolution (default: `false`)

**Returns:**
```javascript
{
  paths: string[][],  // Array of paths, each path is array of names
  steps: number | null  // Number of evolution steps, null if no path
}
```

**Example:**
```javascript
graph.findShortestPaths('Agumon', 'Omnimon', false)
// {
//   paths: [
//     ["Agumon", "Greymon", "MetalGreymon", "WarGreymon", "Omnimon"],
//     ["Agumon", "GeoGreymon", "RizeGreymon", "ShineGreymon", "Omnimon"]
//   ],
//   steps: 4
// }
```

**Throws:** `Error` if Digimon names are invalid

---

##### `findShortestPathsEnriched(startName, targetName, allowDeDigivolve)`

Same as `findShortestPaths()` but returns full Digimon objects in paths.

**Returns:**
```javascript
{
  paths: [{id, name, generation, icon, image}][][],
  steps: number | null
}
```

**Example:**
```javascript
const result = graph.findShortestPathsEnriched('Agumon', 'WarGreymon', false);
// paths[0][0] = {
//   id: 12,
//   name: "Agumon",
//   generation: "Rookie",
//   icon: "https://...",
//   image: "https://..."
// }
```

---

##### `getDigimon(name)`

Get a single Digimon by name.

**Returns:** Full Digimon object

**Example:**
```javascript
const agumon = graph.getDigimon('Agumon');
console.log(agumon.generation); // "Rookie"
```

---

##### `getNeighbors(name, allowDeDigivolve)`

Get all adjacent Digimon (evolution/de-digivolution).

**Returns:** `string[]` - Array of adjacent Digimon names

---

##### `getAllDigimonNames()`

Get all Digimon names in the dataset.

**Returns:** `string[]`

---

##### `getStats()`

Get statistics about the graph structure.

**Returns:**
```javascript
{
  totalDigimon: number,
  totalEdges: number,
  nodesWithEvolutions: number,
  nodesWithPreEvolutions: number,
  averageDegree: string
}
```

---

### Function: `loadDigimonGraph(filePath)`

Load Digimon data from JSON file and create graph.

**Parameters:**
- `filePath` (string): Path to `digimon.json` (relative or absolute)

**Returns:** `DigimonGraph` instance

**Example:**
```javascript
const graph = loadDigimonGraph('./data/processed/digimon.json');
// OR
const graph = loadDigimonGraph('../data/processed/digimon.json');
```

---

### Function: `findShortestPaths(startName, targetName, allowDeDigivolve, graph)`

Convenience function - simplified interface.

**Parameters:**
- `startName` (string): Start Digimon
- `targetName` (string): Target Digimon
- `allowDeDigivolve` (boolean): Enable de-digivolution (default: `false`)
- `graph` (DigimonGraph): Graph instance (loaded automatically if `null`)

**Returns:** Same as `DigimonGraph.findShortestPaths()`

**Example:**
```javascript
// Loads graph automatically
const result = findShortestPaths('Agumon', 'WarGreymon', false);
```

---

## 🧠 How It Works

### Algorithm: BFS (Breadth-First Search)

1. **Start at source Digimon**
2. **Queue initial node** with its path `[source]`
3. **Process nodes level by level**:
   - Get all neighbors (forward evolutions, optionally backward)
   - For each neighbor:
     - If it's the target, record the path
     - If not visited, add to queue
4. **Stop when target is found** at current level
5. **Return ALL paths** with the same minimum length

### Why BFS?
- All edges have equal weight (1 step)
- Guarantees shortest path
- Efficient for ~500 nodes
- Easy to extend for multiple paths

### De-Digivolution Behavior

**When `allowDeDigivolve = false` (default):**
- Only follows `evolutions` field
- Respects natural evolution direction

**When `allowDeDigivolve = true`:**
- Follows both `evolutions` (forward) and `pre_evolutions` (backward)
- May find shorter paths using reverse edges
- Each backward step counts as 1 step

## 🎯 Edge Cases

All handled gracefully:

| Case | Result |
|------|--------|
| Start = Target | Returns `[[start]]` with `steps: 0` |
| No path exists | Returns `{ paths: [], steps: null }` |
| Invalid Digimon | Throws descriptive `Error` |
| Isolated Digimon | No path found (returns empty paths) |
| Multiple shortest paths | All returned with same `steps` value |

## 🧪 Running Tests

```bash
node core/test_pathfinder.js
```

Test cases include:
- ✅ Forward evolution only
- ✅ With de-digivolution
- ✅ Start equals target
- ✅ Multiple shortest paths
- ✅ Enriched metadata
- ✅ No path exists
- ✅ Invalid Digimon name
- ✅ Large paths (In-Training to Mega)

## 📊 Performance

**Dataset:** ~475 Digimon  
**Algorithm:** BFS  
**Time Complexity:** O(V + E) where V = nodes, E = edges  
**Space Complexity:** O(V) for visited set and queue

**Expected Performance:**
- Path finding: <10ms typically
- Graph initialization: <50ms
- Memory footprint: ~1-2MB

## 💡 Usage Examples

### Example 1: Simple Evolution Path

```javascript
const graph = loadDigimonGraph('../data/processed/digimon.json');
const result = graph.findShortestPaths('Agumon', 'WarGreymon', false);

if (result.paths.length > 0) {
  console.log(`Shortest path: ${result.paths[0].join(' → ')}`);
  console.log(`Takes ${result.steps} evolutions`);
}
```

### Example 2: Check All Paths with Enriched Data

```javascript
const result = graph.findShortestPathsEnriched('Agumon', 'Omnimon', true);

result.paths.forEach((path, i) => {
  console.log(`\nOption ${i + 1}:`);
  path.forEach(d => console.log(`  - ${d.name} (${d.generation})`));
});

console.log(`\nAll options take ${result.steps} steps`);
```

### Example 3: Validate Digimon Exists

```javascript
try {
  const digimon = graph.getDigimon('Agumon');
  console.log(`Found: ${digimon.name}`);
} catch (e) {
  console.log(`Not found: ${e.message}`);
}
```

### Example 4: Explore Graph

```javascript
const stats = graph.getStats();
console.log(`Total Digimon: ${stats.totalDigimon}`);
console.log(`Total Evolution Edges: ${stats.totalEdges}`);

const names = graph.getAllDigimonNames().slice(0, 5);
console.log(`First 5 Digimon: ${names.join(', ')}`);
```

## 🔄 Integration with Other Modules

The pathfinder is designed as a self-contained module. To use in other parts of your project:

```javascript
// In any file needing pathfinding:
const { loadDigimonGraph } = require('./core/pathfinder');

const graph = loadDigimonGraph('./data/processed/digimon.json');
const paths = graph.findShortestPaths(start, target, allowDeDigivolve);
```

## 🎁 Bonus Features Implemented

✅ **Enriched Results** - Full metadata in paths  
✅ **Graph Statistics** - Understand graph structure  
✅ **Error Handling** - Validation & helpful messages  
✅ **Convenience Function** - Auto-load graph  
✅ **Well Documented** - JSDoc comments throughout  

## 🚀 Future Enhancements

Possible improvements (not implemented):

- [ ] Filter results by generation
- [ ] Restrict to specific Digimon type/family
- [ ] Weight edges by evolution requirements
- [ ] Dijkstra's algorithm for weighted paths
- [ ] Path visualization/export
- [ ] Caching for repeated queries
- [ ] REST API endpoint
- [ ] UI dashboard

## 📝 Notes

- **Graph is immutable** after loading - no modifications during runtime
- **Digimon names are case-sensitive** - ensure exact capitalization
- **De-digivolution can create longer paths** - may not always find shorter routes
- **No circular dependency checking** - dataset should be acyclic

---

**Created:** April 1, 2026  
**Status:** Production Ready  
**License:** Your Project License
