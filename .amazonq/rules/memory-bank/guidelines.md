# Digimon Planner - Development Guidelines

## Code Quality Standards

### Naming Conventions
- **React components**: PascalCase files and function names (`DigimonSelector.jsx`, `PathCard.jsx`)
- **Hooks**: `use` prefix, camelCase (`useDigimon`, `useEvolutionPath`, `useTheme`)
- **Backend services**: camelCase files with `.service.js` suffix (`digimon.service.js`)
- **Backend routes**: camelCase files with `.routes.js` suffix (`digimon.routes.js`)
- **Private class methods**: underscore prefix (`_buildGraph`, `_countByGeneration`, `_avgEvolutions`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE`)
- **Python**: snake_case for variables, functions, and files

### File Organization
- One component per `.jsx` file, named identically to the exported function
- API fetch functions isolated in `src/api/digimonApi.js` — never fetch directly in components or hooks
- Hooks only import from `../api/`, never from other hooks
- Backend routes are thin controllers — all logic lives in services

---

## Frontend Patterns

### Custom Hook Structure
All data-fetching hooks follow this exact pattern:
```js
export function useDigimon() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchAllDigimon();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { data, loading, error };
}
```
- Always initialize `loading: true` for auto-fetching hooks, `loading: false` for on-demand hooks
- Always reset `error` to `null` before each fetch attempt
- Always use `finally` to clear loading state
- Return `{ data, loading, error }` (or `{ data, loading, error, action }` for imperative hooks)

### On-Demand Actions with useCallback
```js
const findPath = useCallback(async (from, to, allowDeDigivolve = false) => {
  try {
    setLoading(true);
    setError(null);
    const result = await findEvolutionPath(from, to, allowDeDigivolve);
    setPaths(result);
  } catch (err) {
    setError(err.message);
    setPaths([]);
  } finally {
    setLoading(false);
  }
}, []);
```
- Wrap imperative async actions in `useCallback` with empty deps `[]` when they don't close over state

### API Layer (`src/api/digimonApi.js`)
```js
const API_BASE = '/api';

export async function findEvolutionPath(from, to, allowDeDigivolve = false) {
  const response = await fetch(`${API_BASE}/path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, allowDeDigivolve, enriched: true }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to find path');
  }
  const data = await response.json();
  return data.paths || [];
}
```
- All requests use `/api` prefix (Vite proxies to Express in dev)
- Check `response.ok` and throw with the backend's `error.message` when available
- Return the specific data shape (not the full response object)

### Tailwind Dark Mode
- Dark mode is class-based (`darkMode: 'class'` in `tailwind.config.js`)
- The root `<div>` in `App.jsx` receives `className={isDark ? 'dark' : ''}` to activate dark variants
- Always pair light and dark variants: `bg-gray-50 dark:bg-gray-900`, `text-gray-900 dark:text-white`
- Use `transition-colors` on elements that change between themes

### Theme Context Pattern
```jsx
// ThemeContext.jsx - provides isDark + toggleTheme
const { isDark, toggleTheme } = useTheme();
```
- Theme state lives in `ThemeContext`, consumed via `useTheme()` hook
- `ThemeProvider` wraps the entire app in `main.jsx` (outside `App`)

### React Entry Point
```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```
- Always wrap with `React.StrictMode`
- Global providers (Context) go in `main.jsx`, not `App.jsx`

---

## Backend Patterns

### Express App Factory
```js
// app/app.js
function createApp() {
  const app = express();
  app.use(express.json());
  // ... middleware, routes
  return app;
}
module.exports = createApp;
```
- Export a factory function, not the app instance — enables testing
- `server.js` calls `createApp()` and calls `.listen()`

### Service Singleton Pattern
```js
// Bottom of every service file
module.exports = new DigimonService();
```
- Services are exported as singletons — instantiated once, shared across routes
- Services expose an `initialize()` method called once at startup in `app.js`
- Services cache data in instance properties (`this.digimons`, `this.digimonMap`)

### O(1) Lookup Indexes
```js
// Build Map indexes at initialization for fast lookups
this.digimonMap = new Map(); // id -> Digimon
this.nameMap = new Map();    // name.toLowerCase() -> Digimon

for (const digimon of this.digimons) {
  this.digimonMap.set(digimon.id, digimon);
  this.nameMap.set(digimon.name.toLowerCase(), digimon);
}
```
- Always lowercase keys in name maps for case-insensitive lookups
- Use `Map` over plain objects for dynamic key sets

### Standard Error Response Shape
```json
{ "error": "Error category", "message": "Detailed explanation" }
```
- All error responses use this two-field shape
- HTTP 400 for invalid input, 404 for not found, 500 for server errors

### JSDoc on All Backend Functions
```js
/**
 * Get Digimon by name (case-insensitive)
 * @param {string} name - Digimon name
 * @returns {Object|null} Digimon object or null if not found
 */
getByName(name) { ... }
```
- Every public method on services and the `DigimonGraph` class has a JSDoc block
- Include `@param` types, `@returns` type, and `@throws` when applicable

### Private Methods Convention
```js
_countByGeneration() { ... }
_avgEvolutions() { ... }
_buildGraph() { ... }
```
- Prefix internal/helper methods with `_`

---

## Core Algorithm (`core/pathfinder.js`)

### DigimonGraph Class
- Framework-agnostic — no Express or React imports
- Graph stored as `Map<name, { forward: string[], backward: string[] }>`
- BFS collects ALL paths of equal shortest length (not just one)
- `allowDeDigivolve` flag merges `forward` + `backward` neighbors

### Enriched vs. Plain Paths
- `findShortestPaths()` returns `{ paths: string[][], steps: number }`
- `findShortestPathsEnriched()` maps names to full Digimon objects — used by the frontend via `enriched: true` in POST body

---

## Python Scraper Conventions
- Use `pathlib.Path` for file paths (not `os.path`)
- Use `BeautifulSoup` with `lxml` parser
- Scripts are standalone utilities — no shared module imports between scraper files
- f-strings for all string formatting

---

## Configuration Files
- `postcss.config.js` — ES module default export, only `tailwindcss` and `autoprefixer` plugins
- `tailwind.config.js` — content globs cover `./index.html` and `./src/**/*.{js,jsx}`, `darkMode: 'class'`
- `vite.config.js` — single proxy rule: `/api` → `http://localhost:3000` with prefix rewrite
