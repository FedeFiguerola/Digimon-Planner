# Digimon Planner - Product Overview

## Purpose
Full-stack web application for finding the shortest evolution path between any two Digimon in Digimon Story: Time Stranger. Users select a starting and destination Digimon, and the app computes all shortest evolution chains using BFS pathfinding.

## Key Features
- **Evolution Pathfinding**: Finds ALL shortest paths between two Digimon using BFS
- **De-Digivolution Toggle**: Optionally allow backward evolution traversal
- **Digimon Browser**: Search and filter ~475 Digimon by name
- **Enriched Results**: Paths display full Digimon metadata (icon, image, generation)
- **Dark/Light Theme**: Persistent theme toggle
- **Detail Modal**: Click any Digimon in a path to view full details
- **Case-Insensitive Search**: User-friendly name lookups throughout

## Target Users
Digimon Story: Time Stranger players who want to plan optimal evolution routes without manual trial-and-error.

## Use Cases
1. Find the minimum steps to evolve from a rookie to a mega Digimon
2. Discover all equally-short evolution paths between two Digimon
3. Plan evolution chains that allow de-digivolution as intermediate steps
4. Browse and search the full Digimon roster with metadata

## Data
- ~475 Digimon sourced from Game8 via a custom Python scraper pipeline
- Stored as static JSON (`data/processed/digimon.json`)
- Each Digimon has: `id`, `name`, `generation`, `icon`, `image`, `evolutions[]`, `pre_evolutions[]`

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health check |
| GET | `/digimon` | List all / search Digimon |
| GET | `/digimon/:id` | Get by numeric ID |
| GET | `/digimon/name/:name` | Get by name (case-insensitive) |
| POST | `/path` | Find shortest evolution paths |
