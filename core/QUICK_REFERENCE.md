# Pathfinder Quick Reference

## One-Liner Imports

```javascript
const { loadDigimonGraph, findShortestPaths } = require('./core/pathfinder');
```

## Load Graph (One Time)

```javascript
const graph = loadDigimonGraph('data/processed/digimon.json');
```

---

## Finding Paths

### Basic Path

```javascript
graph.findShortestPaths('Agumon', 'WarGreymon', false)
// → { paths: [[...]], steps: 3 }
```

### With De-Digivolution

```javascript
graph.findShortestPaths('Agumon', 'WarGreymon', true)
// May find shorter paths using backward edges
```

### With Full Metadata

```javascript
graph.findShortestPathsEnriched('Agumon', 'WarGreymon', false)
// → { paths: [[{id, name, generation, icon, image}]], steps: 3 }
```

---

## Getting Info

### Get Single Digimon

```javascript
graph.getDigimon('Agumon')
// → { id: 21, name: 'Agumon', generation: 'Rookie', ... }
```

### Get Neighbors

```javascript
graph.getNeighbors('Agumon', false)  // forward only
graph.getNeighbors('Agumon', true)   // forward + backward
// → ['Greymon', 'Palmon', ...]
```

### All Digimon Names

```javascript
graph.getAllDigimonNames()
// → ['Kuramon', 'Choromon', ..., 'Omnimon MM']
```

### Graph Stats

```javascript
graph.getStats()
// → { totalDigimon: 475, totalEdges: 2236, ... }
```

---

## Error Handling

```javascript
try {
  graph.findShortestPaths('InvalidName', 'Agumon', false);
} catch (e) {
  console.error(e.message);  // "Start Digimon not found: ..."
}
```

---

## Common Snippets

### Check If Path Exists

```javascript
const result = graph.findShortestPaths(start, target, false);
const exists = result.paths.length > 0;
```

### Get First Shortest Path

```javascript
const result = graph.findShortestPaths(start, target, false);
const path = result.paths.length > 0 ? result.paths[0] : null;
```

### Loop All Shortest Paths

```javascript
const result = graph.findShortestPaths(start, target, false);
result.paths.forEach((path, i) => {
  console.log(`Path ${i + 1}: ${path.join(' → ')}`);
});
```

### Format Output

```javascript
const result = graph.findShortestPaths(start, target, false);
if (result.paths.length === 0) {
  console.log('No path found');
} else {
  console.log(`Found ${result.paths.length} path(s):`);
  console.log(`Shortest distance: ${result.steps} steps`);
  result.paths.forEach(p => console.log(`  ${p.join(' → ')}`));
}
```

---

## Parameters

### `findShortestPaths(start, target, allowDeDigivolve)`

| Param | Type | Required | Example |
|-------|------|----------|---------|
| `start` | string | ✅ | `'Agumon'` |
| `target` | string | ✅ | `'WarGreymon'` |
| `allowDeDigivolve` | boolean | ❌ | `false` or `true` |

---

## Return Format

### Standard Result

```javascript
{
  paths: [
    ['Agumon', 'Greymon', 'MetalGreymon', 'WarGreymon'],
    ['Agumon', 'Palmon', 'Togemon', ...]  // if multiple paths exist
  ],
  steps: 3  // or null if no path found
}
```

### Enriched Result

```javascript
{
  paths: [
    [
      { id: 21, name: 'Agumon', generation: 'Rookie', icon: '...', image: '...' },
      { id: 90, name: 'Greymon', generation: 'Champion', icon: '...', image: '...' },
      ...
    ]
  ],
  steps: 3
}
```

---

## Edge Cases

| Scenario | Result |
|----------|--------|
| Start = Target | `{ paths: [['Agumon']], steps: 0 }` |
| No Path | `{ paths: [], steps: null }` |
| Invalid Name | Throws `Error` |
| Isolated Node | `{ paths: [], steps: null }` |

---

## Performance Tips

- Load graph once, reuse for multiple queries
- `findShortestPaths()` is <10ms typical
- EnrichedResults adds ~1-2ms overhead
- For bulk queries, consider caching results

---

## Common Mistakes to Avoid

❌ **Wrong:**
```javascript
graph.findShortestPaths('agumon', 'wargreymon', false)  // case-sensitive!
```

✅ **Right:**
```javascript
graph.findShortestPaths('Agumon', 'WarGreymon', false)
```

---

❌ **Wrong:**
```javascript
const graph = loadDigimonGraph('...');  // Inside a function, called repeatedly
```

✅ **Right:**
```javascript
const graph = loadDigimonGraph('...');  // Load once at startup
// Reuse graph for all queries
```

---

## Testing

```bash
node core/test_pathfinder.js
```

All 9 tests should pass ✅

---

## Integration Example

```javascript
const express = require('express');
const { loadDigimonGraph } = require('./core/pathfinder');

const app = express();
const graph = loadDigimonGraph('data/processed/digimon.json');

app.get('/path/:start/:target', (req, res) => {
  try {
    const result = graph.findShortestPaths(
      req.params.start,
      req.params.target,
      req.query.deDigivolve === 'true'
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

---

**For detailed API docs:** See `PATHFINDER.md`  
**For implementation details:** See `IMPLEMENTATION_SUMMARY.md`
