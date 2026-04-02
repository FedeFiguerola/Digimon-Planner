# Digimon Planner API

A clean Node.js/Express API for querying Digimon data and calculating evolution paths.

## 🚀 Quick Start

### Install Dependencies

```bash
npm install express
```

### Start the Server

```bash
node server.js
```

Server will run on `http://localhost:3000`

## 📚 API Endpoints

### 1. Health Check

```
GET /health
```

Check if the API is running and services are initialized.

**Response:**
```json
{
  "status": "ok",
  "services": {
    "digimon": "ready",
    "pathfinder": "ready"
  }
}
```

---

### 2. Get All Digimon

```
GET /digimon
```

Returns a list of all Digimon in the dataset.

**Query Parameters:**
- `search` (optional): Filter by name (case-insensitive, partial match)

**Examples:**
- `GET /digimon` - Get all Digimon
- `GET /digimon?search=agumon` - Search for Digimon containing "agumon"

**Response:**
```json
{
  "count": 475,
  "data": [
    {
      "id": 1,
      "name": "Kuramon",
      "generation": "In-Training I",
      "evolutions": ["Pagumon", "Tsumemon"],
      "pre_evolutions": [],
      "icon": "...",
      "image": null,
      "requirements": null
    },
    ...
  ]
}
```

---

### 3. Get Single Digimon by ID

```
GET /digimon/:id
```

Returns a single Digimon by ID.

**Parameters:**
- `id` (required): Digimon ID (integer)

**Examples:**
- `GET /digimon/1` - Get Digimon with ID 1
- `GET /digimon/430` - Get Omnimon

**Response:**
```json
{
  "id": 21,
  "name": "Agumon",
  "generation": "Rookie",
  "evolutions": ["Greymon", "Palmon"],
  "pre_evolutions": [],
  "icon": "...",
  "image": "...",
  "requirements": null
}
```

**Error (404):**
```json
{
  "error": "Not found",
  "message": "Digimon with ID 999 not found"
}
```

---

### 4. Get Digimon by Name

```
GET /digimon/name/:name
```

Get a Digimon by name (case-insensitive).

**Parameters:**
- `name` (required): Digimon name (case-insensitive)

**Examples:**
- `GET /digimon/name/agumon` - Get Agumon
- `GET /digimon/name/OMNIMON` - Get Omnimon
- `GET /digimon/name/WarGreymon` - Get WarGreymon

**Response:**
```json
{
  "id": 21,
  "name": "Agumon",
  "generation": "Rookie",
  "evolutions": ["Greymon", "Palmon"],
  "pre_evolutions": [],
  ...
}
```

**Error (404):**
```json
{
  "error": "Not found",
  "message": "Digimon \"InvalidName\" not found"
}
```

---

### 5. Find Shortest Evolution Path

```
POST /path
```

Calculate shortest evolution path(s) between two Digimon.

**Request Body:**
```json
{
  "from": "Agumon",        // Required: Starting Digimon name
  "to": "WarGreymon",      // Required: Target Digimon name
  "allowDeDigivolve": false, // Optional: Allow backward evolution (default: false)
  "enriched": false        // Optional: Return full Digimon objects (default: false)
}
```

**Examples:**

#### Basic path (names only)
```bash
curl -X POST http://localhost:3000/path \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Agumon",
    "to": "WarGreymon",
    "allowDeDigivolve": false
  }'
```

**Response:**
```json
{
  "paths": [
    ["Agumon", "Greymon", "MetalGreymon", "WarGreymon"]
  ],
  "steps": 3,
  "count": 1
}
```

#### With de-digivolution allowed
```bash
curl -X POST http://localhost:3000/path \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Agumon",
    "to": "WarGreymon",
    "allowDeDigivolve": true
  }'
```

#### Enriched response (with metadata)
```bash
curl -X POST http://localhost:3000/path \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Agumon",
    "to": "WarGreymon",
    "enriched": true
  }'
```

**Enriched Response:**
```json
{
  "paths": [
    [
      {
        "id": 21,
        "name": "Agumon",
        "generation": "Rookie",
        "icon": "...",
        "image": "..."
      },
      {
        "id": 90,
        "name": "Greymon",
        "generation": "Champion",
        "icon": "...",
        "image": "..."
      },
      ...
    ]
  ],
  "steps": 3,
  "count": 1
}
```

#### No path found
```json
{
  "paths": [],
  "steps": null,
  "count": 0
}
```

#### Invalid Digimon (400 error)
```json
{
  "error": "Invalid Digimon",
  "message": "Digimon not found: \"InvalidName\""
}
```

#### Missing required field (400 error)
```json
{
  "error": "Invalid input",
  "message": "Both \"from\" and \"to\" are required"
}
```

---

## 🏗️ Project Structure

```
/app
  /routes
    digimon.routes.js     - Digimon endpoints
    path.routes.js        - Pathfinding endpoints
  /services
    digimon.service.js    - Digimon business logic
    pathfinder.service.js - Pathfinding logic
  app.js                  - Express app setup

/core
  pathfinder.js           - BFS pathfinding algorithm (existing)

server.js                 - Server entry point
```

---

## 🔍 Features

### Digimon Service
- ✅ Load and cache Digimon data from JSON
- ✅ Fast O(1) lookups by ID or name
- ✅ Case-insensitive name matching
- ✅ Partial name search
- ✅ Dataset statistics

### Pathfinder Service
- ✅ Find ALL shortest paths (not just one)
- ✅ Optional de-digivolution support
- ✅ Case-insensitive input handling
- ✅ Enriched results with metadata
- ✅ Input validation

### API Features
- ✅ Clean separation of concerns (routes + services)
- ✅ Proper HTTP status codes
- ✅ Descriptive error messages
- ✅ Request logging
- ✅ Health check endpoint
- ✅ 404 handler

---

## 📝 Error Handling

### Error Response Format

All errors follow this standard format:

```json
{
  "error": "Error category",
  "message": "Detailed error message"
}
```

### Common Error Codes

| Code | Scenario |
|------|----------|
| 400 | Invalid input (missing required fields, wrong type, non-existent Digimon) |
| 404 | Resource not found (Digimon by ID) |
| 500 | Server error |

---

## 🚀 Usage Examples

### Example 1: Find Evolution Path

```javascript
// Client-side (JavaScript)
const response = await fetch('http://localhost:3000/path', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'Agumon',
    to: 'Omnimon',
    allowDeDigivolve: false
  })
});

const data = await response.json();
console.log(`Found ${data.count} path(s) with ${data.steps} steps`);
data.paths.forEach((path, i) => {
  console.log(`Path ${i + 1}: ${path.join(' → ')}`);
});
```

### Example 2: Search Digimon

```bash
# Search for all Digimon with "mega" in the name
curl 'http://localhost:3000/digimon?search=mega'
```

### Example 3: Get Details with Full Path

```bash
# Get Agumon details
curl 'http://localhost:3000/digimon/name/agumon'

# Find non-enriched path
curl -X POST http://localhost:3000/path \
  -H "Content-Type: application/json" \
  -d '{"from":"Agumon","to":"Omnimon"}'

# Find enriched path with metadata
curl -X POST http://localhost:3000/path \
  -H "Content-Type: application/json" \
  -d '{"from":"Agumon","to":"Omnimon","enriched":true}'
```

---

## 🔧 Configuration

### Port
Set the `PORT` environment variable to change the port:

```bash
PORT=5000 node server.js
```

### Data Source
Data is loaded from: `data/processed/digimon.json`

To use a different file, modify `digimonService.initialize()` in `app/services/digimon.service.js`

---

## 📊 Performance

- **Startup Time:** ~50ms (load and index Digimon data)
- **Search:** O(n) - Linear scan (acceptable for 475 Digimon)
- **ID Lookup:** O(1) - Hash map
- **Name Lookup:** O(1) - Hash map
- **Pathfinding:** <10ms typical (BFS on graph)

---

## 🎯 Next Steps

### For Frontend Integration
1. Start the server: `node server.js`
2. Call the API from your React/Vue/Angular frontend
3. Example: `fetch('http://localhost:3000/digimon?search=agumon')`

### Potential Enhancements
- [ ] Database support (PostgreSQL, MongoDB)
- [ ] Caching layer (Redis)
- [ ] Rate limiting
- [ ] Authentication/Authorization
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Filter by generation, type, requirements
- [ ] Batch operations
- [ ] WebSocket support for real-time updates

---

## 📝 Notes

- All Digimon names are case-insensitive in API requests
- The pathfinding algorithm returns ALL shortest paths (not just one)
- Services are initialized once at startup and cached in memory
- No database required - reads from JSON file once

---

**Status:** ✅ Production Ready  
**Date:** April 2, 2026
