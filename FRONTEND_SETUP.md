# Frontend Setup & Startup Guide

This guide walks you through setting up and running the Digimon Planner web application.

## Architecture Overview

**Monorepo Structure:**
- **Backend** (Express.js): Runs on `http://localhost:3000`
  - REST API with 5 endpoints for Digimon data and pathfinding
  - See [APP_SETUP_GUIDE.md](./APP_SETUP_GUIDE.md) for API documentation
  
- **Frontend** (React + Vite): Runs on `http://localhost:5173` (development)
  - Modern UI with Tailwind CSS dark mode
  - Auto-proxies API calls to backend via `/api` prefix

## Prerequisites

- **Node.js** 14.0.0 or higher
- **npm** 6.0.0 or higher
- Ensure you're in the project root: `d:\Datos\Documentos\Digimon-Planner`

## Installation

### One-Time Setup

```bash
# Install all dependencies (backend + frontend)
npm install
```

This installs:
- **Backend**: Express 4.18.2
- **Frontend**: React 18.2.0, Vite 5.0.0, Tailwind CSS 3.3.0

## Running the Application

### Option 1: Two-Terminal Setup (Recommended for Development)

**Terminal 1 - Start Backend API:**
```bash
npm run api
```
- Starts Express server on `http://localhost:3000`
- Loads all Digimon data from `data/processed/digimon.json`
- API ready when you see: "Server running on port 3000"

**Terminal 2 - Start Frontend Dev Server:**
```bash
npm run dev:vite
```
- Starts Vite dev server on `http://localhost:5173`
- Auto-reloads on file changes
- API requests automatically proxy to `http://localhost:3000/api`

### Option 2: Single Terminal (Using Both Services)

If you want to run in a single terminal, start the backend first:
```bash
npm run api
```

Then press `Ctrl+Z` to suspend it, type `bg` to background it, and start the frontend:
```bash
npm run dev:vite
```

Both will run in parallel.

---

## Development Workflow

### File Structure

```
src/
├── App.jsx                    # Main app component with state management
├── main.jsx                   # React entry point
├── globals.css               # Tailwind directives
├── api/
│   └── digimonApi.js         # API service (3 functions)
├── hooks/
│   └── useDigimon.js         # Custom hooks (3 hooks)
├── context/
│   └── ThemeContext.jsx      # Theme provider with localStorage
└── components/
    ├── DigimonSelector.jsx   # Searchable dropdown
    ├── DigimonOption.jsx     # Single option in dropdown
    ├── ToggleSwitch.jsx      # De-digivolution toggle
    ├── PathResults.jsx       # Display paths
    ├── PathCard.jsx          # Single path card
    ├── DigimonNode.jsx       # Icon + name in path
    └── DigimonModal.jsx      # Detail view with requirements

data/
└── processed/
    └── digimon.json          # 475 Digimon with evolution data
```

### Adding Features

1. **New Component**: Create in `src/components/`
   - Use Tailwind CSS classes for styling
   - Import and use in parent component

2. **New Data API Call**: Add function to `src/api/digimonApi.js`
   - Export async function
   - Error handling included

3. **New Custom Hook**: Add to `src/hooks/useDigimon.js`
   - Use `useEffect` for data loading
   - Return `{data, loading, error}`

### Building for Production

```bash
npm run dev:build
```

Creates optimized build in `dist/` directory:
- Minified JS, CSS
- Tree-shaking removes unused code
- Source maps for debugging

To preview production build locally:
```bash
npm run dev:preview
```

---

## API Integration Details

### Backend API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/digimon` | List all Digimon (with optional `?search` param) |
| `GET` | `/digimon/:id` | Get single Digimon by ID |
| `GET` | `/digimon/name/:name` | Get Digimon by name (case-insensitive) |
| `POST` | `/path` | Find shortest evolution paths |
| `GET` | `/health` | Server health check |

### Vite Proxy Configuration

File: `vite.config.js`

All requests to `/api` are proxied to `http://localhost:3000`:
```javascript
proxy: {
  '/api': 'http://localhost:3000'
}
```

This means:
- Frontend: `fetch('/api/digimon')` 
- Actual: `http://localhost:3000/digimon`

---

## Troubleshooting

### "Cannot find module 'react'"
```bash
npm install
# Ensure node_modules exists and has all dependencies
```

### "ECONNREFUSED: Connection refused" (API Error)
- Backend server not running
- Run `npm run api` in another terminal
- Check that it's on port 3000

### Port 3000 or 5173 Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in vite.config.js and app.js
```

### Digimon Not Loading in Dropdown
- Check browser console for errors (F12)
- Verify `data/processed/digimon.json` exists
- Backend tests: `node core/test_pathfinder.js`

### Vite Dev Server Not Auto-Reloading
- Ensure file is saved (Ctrl+S)
- Check terminal for build errors
- Refresh browser (Ctrl+Shift+R for hard refresh)

---

## Testing

### Backend API Tests
```bash
node core/test_pathfinder.js
```
- Tests BFS algorithm with 9 test cases
- All tests should pass ✓

### Manual API Testing
```bash
# In new terminal with backend running:

# Get all Digimon
curl http://localhost:3000/digimon

# Get single Digimon
curl http://localhost:3000/digimon/1

# Find paths (Agumon → Wargreymon)
curl -X POST http://localhost:3000/path \
  -H "Content-Type: application/json" \
  -d "{\"from\":\"Agumon\",\"to\":\"Wargreymon\",\"enriched\":true}"
```

---

## Performance Tips

1. **Faster Initial Load**:
   - Digimon data loads once on startup
   - Hooks cache results with useCallback

2. **Smooth Animations**:
   - Tailwind transitions for hover/state changes
   - CSS animations in `globals.css`

3. **Optimized Builds**:
   - Vite chunks React code splitting
   - Tree-shaking removes unused Tailwind classes

---

## Environment Variables

When you need to configure different API endpoints (e.g., production backend):

Create `.env` file in root:
```
VITE_API_URL=http://api.production.com
```

Update `src/api/digimonApi.js`:
```javascript
const API_BASE = import.meta.env.VITE_API_URL || '/api';
```

---

## Next Steps

1. ✅ Frontend setup complete
2. ✅ All components created
3. ✅ API integration ready
4. **Next**: Customize styling and add more features:
   - Animation effects
   - Keyboard shortcuts (e.g., Enter to search)
   - Export paths as image/PDF
   - Compare multiple paths side-by-side
   - Bookmark favorite paths

---

## Support

For issues or questions:
1. Check the [README.md](./README.md)
2. Review [APP_SETUP_GUIDE.md](./APP_SETUP_GUIDE.md) for API details
3. Check browser console (F12) for error messages
4. Run backend tests: `node core/test_pathfinder.js`
