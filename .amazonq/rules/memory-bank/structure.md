# Digimon Planner - Project Structure

## Directory Layout

```
digimon-planner/
├── src/                        # React frontend (Vite)
│   ├── api/
│   │   └── digimonApi.js       # Fetch wrappers for backend API
│   ├── components/             # UI components
│   │   ├── DigimonSelector.jsx # Searchable dropdown for picking Digimon
│   │   ├── DigimonModal.jsx    # Detail modal for a single Digimon
│   │   ├── DigimonNode.jsx     # Single Digimon card in a path
│   │   ├── DigimonOption.jsx   # Dropdown option item
│   │   ├── PathCard.jsx        # Renders one evolution path
│   │   ├── PathResults.jsx     # Container for all path results
│   │   └── ToggleSwitch.jsx    # Reusable toggle (de-digivolution)
│   ├── context/
│   │   └── ThemeContext.jsx    # Dark/light theme via React Context
│   ├── hooks/
│   │   └── useDigimon.js       # useDigimon + useEvolutionPath hooks
│   ├── App.jsx                 # Root component, layout, state orchestration
│   ├── globals.css             # Tailwind base styles
│   └── main.jsx                # React entry point, ThemeProvider wrapper
│
├── app/                        # Express backend
│   ├── routes/
│   │   ├── digimon.routes.js   # GET /digimon endpoints
│   │   └── path.routes.js      # POST /path endpoint
│   ├── services/
│   │   ├── digimon.service.js  # Data loading, caching, lookups
│   │   └── pathfinder.service.js # Wraps DigimonGraph for route handlers
│   └── app.js                  # Express app factory (createApp)
│
├── core/
│   └── pathfinder.js           # DigimonGraph class + BFS algorithm
│
├── data/
│   ├── processed/
│   │   └── digimon.json        # Canonical Digimon dataset (~475 entries)
│   └── raw/game8/              # Raw scraped HTML files
│
├── scraper/game8/              # Python scraper pipeline
│   ├── scrape_links.py         # Collect Digimon page URLs
│   ├── scrape_requirements.py  # Extract evolution requirements
│   ├── inspect_page.py         # Page structure inspection utility
│   ├── merge.py                # Merge scraped data into digimon.json
│   └── run_pipeline.py         # Orchestrate full scrape pipeline
│
├── scripts/digimon-parser/     # Node.js data utilities
│   ├── digimon-parser.js       # Parse/transform Digimon data
│   └── update-digimon-images.js # Update image URLs in dataset
│
├── public/
│   └── digimon-icon.png        # App favicon/logo
│
├── server.js                   # Express server entry point
├── index.html                  # Vite HTML template
├── vite.config.js              # Vite config (proxy /api → :3000)
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
└── package.json                # Unified deps (React + Express)
```

## Core Components & Relationships

```
App.jsx
  ├── useDigimon()          → GET /api/digimon
  ├── useEvolutionPath()    → POST /api/path
  ├── DigimonSelector       (×2: from / to)
  ├── ToggleSwitch          (allowDeDigivolve)
  ├── PathResults
  │     └── PathCard[]
  │           └── DigimonNode[]
  └── DigimonModal          (detail overlay)

ThemeContext  →  wraps entire app in main.jsx
```

```
Express Backend
  server.js → createApp() → app.js
    ├── digimonService.initialize()    (loads + caches digimon.json)
    ├── pathfinderService.initialize() (builds DigimonGraph)
    ├── /digimon  → digimon.routes.js → digimonService
    └── /path     → path.routes.js    → pathfinderService → DigimonGraph (BFS)
```

## Architectural Patterns

- **Monorepo**: Frontend (Vite/React) and backend (Express) share one `package.json`
- **Vite Proxy**: `/api/*` requests in dev are proxied to `localhost:3000`, stripping the `/api` prefix
- **Service Layer**: Business logic lives in `app/services/`, routes are thin controllers
- **Singleton Services**: `digimonService` and `pathfinderService` initialize once at startup and cache data in memory
- **Core Algorithm Isolation**: `DigimonGraph` in `core/pathfinder.js` is framework-agnostic; services wrap it
- **Custom Hooks**: Data fetching and path-finding state are encapsulated in `useDigimon.js`, keeping `App.jsx` declarative
- **Context for Cross-Cutting Concerns**: Theme state uses React Context to avoid prop drilling
