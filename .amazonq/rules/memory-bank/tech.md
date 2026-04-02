# Digimon Planner - Technology Stack

## Languages
- **JavaScript (ES2020+)** - Frontend (React/JSX) and backend (Node.js/CommonJS)
- **Python 3** - Scraper pipeline (`scraper/game8/`)
- **CSS** - Tailwind utility classes + `globals.css` base layer

## Frontend
| Tool | Version | Role |
|------|---------|------|
| React | ^18.2.0 | UI framework |
| Vite | ^5.0.0 | Dev server + bundler |
| @vitejs/plugin-react | ^4.2.0 | JSX transform + HMR |
| Tailwind CSS | ^3.3.0 | Utility-first styling |
| PostCSS | ^8.4.31 | CSS processing |
| Autoprefixer | ^10.4.16 | Vendor prefixes |

## Backend
| Tool | Version | Role |
|------|---------|------|
| Node.js | >=14.0.0 | Runtime |
| Express | ^4.18.2 | HTTP server + routing |

## Module Systems
- **Frontend**: ES Modules (`import`/`export`)
- **Backend**: CommonJS (`require`/`module.exports`)

## Dev Commands
```bash
# Start Express API (port 3000)
npm run api

# Start Vite dev server (port 5173, proxies /api → :3000)
npm run dev:vite

# Production build
npm run dev:build

# Preview production build
npm run dev:preview
```

## Python Scraper
```bash
# Install Python deps
pip install -r requirements.txt

# Run full scrape pipeline
python scraper/game8/run_pipeline.py
```

## Vite Proxy Configuration
```js
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```
All frontend API calls use `/api/...` prefix; Vite strips it before forwarding to Express.

## Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Express server port |

## Data Format (`data/processed/digimon.json`)
```json
[
  {
    "id": 21,
    "name": "Agumon",
    "generation": "Rookie",
    "icon": "<url>",
    "image": "<url>",
    "evolutions": ["Greymon", "..."],
    "pre_evolutions": ["Koromon", "..."]
  }
]
```
