# PROJECT_CONTEXT.md

Technical reference for the Digimon Planner codebase. Intended for developers picking up the project.

---

## 1. Project Overview

Digimon Planner is a full-stack web app for players of **Digimon Story: Time Stranger**. Given any two Digimon, it computes every shortest evolution chain between them using BFS pathfinding and displays the results visually.

**Key features:**
- Finds ALL shortest evolution paths simultaneously (not just one)
- Optional de-digivolution toggle (allows traversing backward edges)
- Searchable dropdown for ~475 Digimon
- Clickable Digimon nodes open a detail modal with full image and evolution requirements
- Dark/light theme with localStorage persistence

---

## 2. Architecture

### Data flow

```
Browser (React/Vite :5173)
  └─ fetch /api/...
       └─ Vite proxy strips /api prefix
            └─ Express (:3000)
                 ├─ digimonService  (reads digimon.json once, caches in memory)
                 └─ pathfinderService → DigimonGraph (BFS)
```

### Backend (`app/`, `core/`, `server.js`)

```
server.js               Entry point — calls createApp(), starts listener
app/app.js              Express factory — wires middleware, services, routes
app/routes/
  digimon.routes.js     Thin controller for GET /digimon endpoints
  path.routes.js        Thin controller for POST /path
app/services/
  digimon.service.js    Loads JSON, builds id→Digimon and name→Digimon Maps
  pathfinder.service.js Validates names, delegates to DigimonGraph
core/
  pathfinder.js         DigimonGraph class + BFS algorithm (no framework deps)
```

### Frontend (`src/`)

```
main.jsx                React entry — StrictMode + ThemeProvider wrapper
App.jsx                 Root — state orchestration, layout
src/api/digimonApi.js   All fetch calls (single source of truth for HTTP)
src/hooks/useDigimon.js useDigimon (auto-fetch) + useEvolutionPath (on-demand)
src/context/
  ThemeContext.jsx       isDark state + toggleTheme, persisted to localStorage
src/components/
  DigimonSelector.jsx   Searchable dropdown with click-outside close
  DigimonOption.jsx     Single row in the dropdown list
  DigimonNode.jsx       Icon + name card in a path chain; detects de-digivolution
  PathCard.jsx          One evolution path row
  PathResults.jsx       Results container — handles loading/error/empty states
  ToggleSwitch.jsx      Accessible toggle for allowDeDigivolve
  DigimonModal.jsx      Detail overlay — image, requirements, evolution paths
```

---

## 3. Data Model

Source file: `data/processed/digimon.json` (~475 entries)

```json
{
  "id": 300,
  "name": "Shakkoumon",
  "generation": "Ultimate",
  "icon": "https://img.game8.co/.../show",
  "image": "https://www.grindosaur.com/.../shakkoumon-stats-overview.jpg",
  "evolutions": ["Goldramon", "Junomon", "Vikemon", "Magnadramon"],
  "pre_evolutions": ["Angemon", "Ankylomon"],
  "requirements": {
    "agent_rank": 5,
    "stats": { "max_HP": 1200 },
    "agent_skills": { "bonds_of_valor": 46 },
    "paths": [
      {
        "type": "dna",
        "conditions": [
          { "digimon": "Ankylomon", "requirement": "Overprotective" },
          { "digimon": "Angemon",   "requirement": "Enlightened" }
        ]
      }
    ]
  }
}
```

### Field reference

| Field | Type | Notes |
|---|---|---|
| `id` | number | Unique integer |
| `name` | string | Canonical casing (e.g. "WarGreymon") |
| `generation` | string | "In-Training I/II", "Rookie", "Champion", "Ultimate", "Mega", "Mega +", "Hybrid" |
| `icon` | string (URL) | Small sprite from Game8 |
| `image` | string (URL) | Full stats image from Grindosaur |
| `evolutions` | string[] | Names of Digimon this one can evolve into |
| `pre_evolutions` | string[] | Names of Digimon that can evolve into this one |
| `requirements` | object \| null | `null` for 7 Digimon with no requirements |

### Requirements sub-fields

| Field | Type | Notes |
|---|---|---|
| `agent_rank` | number | Minimum agent rank required |
| `stats` | object | Key = stat name, value = minimum value. Keys: `max_HP`, `HP`, `max_SP`, `ATK`, `DEF`, `INT`, `SPD`, `SPI` |
| `agent_skills` | object | Key = skill name, value = minimum level. Keys: `bonds_of_valor`, `bonds_of_wisdom`, `bonds_of_philanthropy`, `bonds_of_amicability` |
| `paths` | array | Alternative evolution methods (see below) |

### Evolution path types

**DNA Digivolution** — requires two specific Digimon with specific personality traits:
```json
{ "type": "dna", "conditions": [{ "digimon": "...", "requirement": "..." }] }
```

**Mode Change** — transforms from a specific Digimon:
```json
{ "type": "mode_change", "from": "BurningGreymon" }
```

Base requirements (`agent_rank`, `stats`, `agent_skills`) always apply. `paths` are alternative methods to satisfy the evolution trigger.

---

## 4. Pathfinding Logic

**File:** `core/pathfinder.js` — `DigimonGraph` class

### Graph structure

Built at startup from `digimon.json`. Each node stores:
```js
graph.set(name, { forward: string[], backward: string[] })
```
- `forward` = evolutions (digivolve)
- `backward` = pre_evolutions (de-digivolve)

### BFS algorithm (`findShortestPaths`)

Standard BFS with one extension: instead of stopping at the first path found, it continues processing the entire current BFS level to collect **all paths of equal shortest length**.

```
queue = [[start, [start]]]
visited = Set([start])

while queue not empty:
  process all nodes at current depth level
  for each neighbor:
    if neighbor == target → record path, set shortestDistance
    else if not visited → enqueue
  if any paths found → break (entire level processed)
```

### `allowDeDigivolve` flag

When `true`, `getNeighbors()` returns `[...forward, ...backward]` instead of just `forward`. This allows the BFS to traverse backward edges, enabling paths like `Agumon → Koromon → Patamon → ...`.

### Enriched paths

`findShortestPathsEnriched()` runs the same BFS then maps each name to its full Digimon object from `digimonMap`. The frontend always requests `enriched: true` so modal data is available without a second API call.

---

## 5. API Endpoints

All endpoints are served by Express on port 3000. In development, the Vite dev server proxies `/api/*` → `localhost:3000/*`.

### `GET /health`
Returns service status.
```json
{ "status": "ok", "services": { "digimon": "ready", "pathfinder": "ready" } }
```

### `GET /digimon`
Returns all Digimon. Optional `?search=` query for name filtering (case-insensitive, partial match).
```json
{ "count": 475, "data": [...] }
```

### `GET /digimon/:id`
Returns a single Digimon by numeric ID. 404 if not found.

### `GET /digimon/name/:name`
Returns a single Digimon by name (case-insensitive). 404 if not found.

### `POST /path`
Finds shortest evolution paths.

Request body:
```json
{
  "from": "Agumon",
  "to": "Omnimon",
  "allowDeDigivolve": false,
  "enriched": true
}
```

Response:
```json
{
  "paths": [[{ "id": 21, "name": "Agumon", ... }, ...]],
  "steps": 4,
  "count": 3
}
```

- `enriched: false` → `paths` contains `string[][]` (names only)
- `enriched: true` → `paths` contains full Digimon objects
- `steps: null` + `paths: []` → no path exists

**Error shape** (all endpoints):
```json
{ "error": "Error category", "message": "Detailed explanation" }
```

---

## 6. Frontend Behavior

### User flow

1. App loads → `useDigimon` fetches `GET /api/digimon`, populates both selectors
2. User picks "From" and "To" Digimon via searchable dropdowns
3. Optionally toggles "Allow De-Digivolution"
4. Clicks "Find Paths" → `useEvolutionPath.findPath()` calls `POST /api/path`
5. `PathResults` renders each path as a `PathCard` containing `DigimonNode` items
6. Clicking any `DigimonNode` sets `selectedDigimon` in `App`, opening `DigimonModal`
7. Changing either selector clears `hasSearched`, hiding stale results

### Key state in `App.jsx`

| State | Purpose |
|---|---|
| `selectedFrom` / `selectedTo` | Full Digimon objects from the enriched list |
| `allowDeDigivolve` | Passed directly to the API call |
| `hasSearched` | Guards result display — prevents showing results from a previous query |
| `selectedDigimon` | Controls modal visibility; `null` = closed |

### Theme

`ThemeContext` reads/writes `localStorage('theme')` and toggles the `dark` class on `<html>`. Tailwind's `darkMode: 'class'` activates all `dark:` variants. Default is dark mode.

---

## 7. Known Limitations

- **No path ≠ disconnected graph**: Some Digimon have no evolution connections at all (7 have `null` requirements, some have empty `evolutions`). The app correctly returns an empty result.
- **Image URLs are external**: Both `icon` (Game8) and `image` (Grindosaur) are hotlinked. If those sites change their URLs or block hotlinking, images break. The modal has an `onError` fallback.
- **BFS memory**: For very long paths with many branches, the queue can grow large. In practice with ~475 nodes this is not an issue.
- **No pagination**: `GET /digimon` returns all 475 entries in one response. Fine for this dataset size.
- **`allowDeDigivolve` can produce very long paths**: Backward edges can create cycles; the visited set prevents infinite loops but paths may be unexpectedly long.
- **Data is static**: The JSON is generated by the scraper pipeline and committed. Updating data requires re-running the pipeline.

---

## 8. How to Run

### Prerequisites
- Node.js ≥ 14
- Python 3 + pip (only needed to re-run the scraper)

### Backend
```bash
npm install
npm run api          # starts Express on http://localhost:3000
```

### Frontend (development)
```bash
# In a second terminal
npm run dev:vite     # starts Vite on http://localhost:5173
```

Both must run simultaneously. Vite proxies `/api/*` to Express.

### Production build
```bash
npm run dev:build    # outputs to dist/
npm run dev:preview  # serves the built dist/
```

### Re-running the scraper (optional)
```bash
pip install -r requirements.txt
python scraper/game8/run_pipeline.py --skip-links
# or full pipeline:
python scraper/game8/run_pipeline.py
```

---

## 9. Future Improvements

- **Keyboard navigation** in `DigimonSelector` (arrow keys, Enter to select)
- **Path comparison view** — highlight differences between multiple paths side by side
- **Filter by generation** in the selector dropdowns
- **Persist last search** in URL query params (shareable links)
- **Database migration** — SQLite would enable full-text search and faster queries at scale
- **Image caching** — proxy or cache external images to avoid hotlink dependency
