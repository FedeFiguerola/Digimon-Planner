/**
 * Digimon Planner API - Usage Examples
 * 
 * This file demonstrates common API usage patterns
 * Run the server first: node server.js
 */

const BASE_URL = 'http://localhost:3000';

// ============================================================================
// DIGIMON ENDPOINTS
// ============================================================================

/**
 * Example 1: Get all Digimon
 */
async function getAllDigimon() {
  console.log('\n--- Example 1: Get All Digimon ---');
  
  const response = await fetch(`${BASE_URL}/digimon`);
  const data = await response.json();
  
  console.log(`Total Digimon: ${data.count}`);
  console.log(`First 3: ${data.data.slice(0, 3).map(d => d.name).join(', ')}`);
}

/**
 * Example 2: Search Digimon by name
 */
async function searchDigimon() {
  console.log('\n--- Example 2: Search Digimon ---');
  
  const response = await fetch(`${BASE_URL}/digimon?search=agumon`);
  const data = await response.json();
  
  console.log(`Found ${data.count} Digimon matching "agumon":`);
  data.data.forEach(d => {
    console.log(`  - ${d.name} (${d.generation})`);
  });
}

/**
 * Example 3: Get Digimon by ID
 */
async function getDigimonById() {
  console.log('\n--- Example 3: Get Digimon by ID ---');
  
  const response = await fetch(`${BASE_URL}/digimon/21`);
  const data = await response.json();
  
  console.log(`ID: ${data.id}`);
  console.log(`Name: ${data.name}`);
  console.log(`Generation: ${data.generation}`);
  console.log(`Evolutions: ${data.evolutions.join(', ')}`);
}

/**
 * Example 4: Get Digimon by name (case-insensitive)
 */
async function getDigimonByName() {
  console.log('\n--- Example 4: Get Digimon by Name (Case-Insensitive) ---');
  
  // Try different case variations
  const names = ['agumon', 'AGUMON', 'Agumon', 'AGuMoN'];
  
  for (const name of names) {
    try {
      const response = await fetch(`${BASE_URL}/digimon/name/${name}`);
      const data = await response.json();
      console.log(`✓ "${name}" → ${data.name}`);
    } catch (error) {
      console.log(`✗ "${name}" → Error`);
    }
  }
}

/**
 * Example 5: Handle errors with non-existent Digimon
 */
async function handleNotFound() {
  console.log('\n--- Example 5: Error Handling (Not Found) ---');
  
  const response = await fetch(`${BASE_URL}/digimon/name/InvalidDigi`);
  const data = await response.json();
  
  console.log(`Status: ${response.status}`);
  console.log(`Error: ${data.error}`);
  console.log(`Message: ${data.message}`);
}

// ============================================================================
// PATHFINDING ENDPOINTS
// ============================================================================

/**
 * Example 6: Find shortest evolution path (basic)
 */
async function findSimplePath() {
  console.log('\n--- Example 6: Find Simple Evolution Path ---');
  
  const response = await fetch(`${BASE_URL}/path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Agumon',
      to: 'WarGreymon',
      allowDeDigivolve: false
    })
  });
  
  const data = await response.json();
  
  console.log(`Target: Agumon → WarGreymon`);
  console.log(`Shortest distance: ${data.steps} steps`);
  console.log(`Paths found: ${data.count}`);
  data.paths.forEach((path, i) => {
    console.log(`  Path ${i + 1}: ${path.join(' → ')}`);
  });
}

/**
 * Example 7: Find path with de-digivolution allowed
 */
async function findPathWithDeDigivolve() {
  console.log('\n--- Example 7: Find Path With De-Digivolution ---');
  
  const response = await fetch(`${BASE_URL}/path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Agumon',
      to: 'WarGreymon',
      allowDeDigivolve: true  // Allow backward edges
    })
  });
  
  const data = await response.json();
  
  console.log(`Steps without de-digivolution: usually 3`);
  console.log(`Steps with de-digivolution: ${data.steps}`);
  console.log(`Paths found: ${data.count}`);
}

/**
 * Example 8: Find enriched path (with full metadata)
 */
async function findEnrichedPath() {
  console.log('\n--- Example 8: Find Enriched Path (With Metadata) ---');
  
  const response = await fetch(`${BASE_URL}/path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Agumon',
      to: 'WarGreymon',
      enriched: true  // Return full objects
    })
  });
  
  const data = await response.json();
  
  console.log(`Path with ${data.steps} steps:`);
  data.paths[0].forEach((digimon, i) => {
    console.log(`  ${i + 1}. ${digimon.name} (${digimon.generation}, ID: ${digimon.id})`);
  });
}

/**
 * Example 9: Find multiple shortest paths
 */
async function findMultiplePaths() {
  console.log('\n--- Example 9: Find Multiple Shortest Paths ---');
  
  const response = await fetch(`${BASE_URL}/path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Agumon',
      to: 'Omnimon'
    })
  });
  
  const data = await response.json();
  
  console.log(`Found ${data.count} path(s) with ${data.steps} steps:`);
  data.paths.forEach((path, i) => {
    console.log(`\n  Path ${i + 1}:`);
    console.log(`    ${path.join(' → ')}`);
  });
}

/**
 * Example 10: Case-insensitive path finding
 */
async function caseInsensitivePath() {
  console.log('\n--- Example 10: Case-Insensitive Path Finding ---');
  
  const testCases = [
    { from: 'agumon', to: 'wargreymon' },
    { from: 'AGUMON', to: 'WARGREYMON' },
    { from: 'Agumon', to: 'WarGreymon' },
    { from: 'aGuMoN', to: 'WaRgReYmOn' }
  ];
  
  for (const testCase of testCases) {
    const response = await fetch(`${BASE_URL}/path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase)
    });
    
    const data = await response.json();
    console.log(`✓ "${testCase.from}" → "${testCase.to}": ${data.steps} steps`);
  }
}

/**
 * Example 11: Handle invalid input (missing fields)
 */
async function handleMissingFields() {
  console.log('\n--- Example 11: Error Handling (Missing Fields) ---');
  
  const response = await fetch(`${BASE_URL}/path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Agumon'
      // Missing 'to' field
    })
  });
  
  const data = await response.json();
  
  console.log(`Status: ${response.status}`);
  console.log(`Error: ${data.error}`);
  console.log(`Message: ${data.message}`);
}

/**
 * Example 12: Handle invalid Digimon name
 */
async function handleInvalidDigimon() {
  console.log('\n--- Example 12: Error Handling (Invalid Digimon) ---');
  
  const response = await fetch(`${BASE_URL}/path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'InvalidDigi',
      to: 'Agumon'
    })
  });
  
  const data = await response.json();
  
  console.log(`Status: ${response.status}`);
  console.log(`Error: ${data.error}`);
  console.log(`Message: ${data.message}`);
}

/**
 * Example 13: No path available
 */
async function noPathAvailable() {
  console.log('\n--- Example 13: No Path Available ---');
  
  const response = await fetch(`${BASE_URL}/path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Kuramon',      // In-Training
      to: 'Kuramon'         // Same = 0 steps
    })
  });
  
  const data = await response.json();
  
  console.log(`From and to are the same:`);
  console.log(`Steps: ${data.steps}`);
  console.log(`Path: [${data.paths[0].join(' → ')}]`);
}

/**
 * Example 14: Long path (bottom to top)
 */
async function longPath() {
  console.log('\n--- Example 14: Long Path (In-Training to Mega) ---');
  
  const response = await fetch(`${BASE_URL}/path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Kuramon',      // In-Training I
      to: 'Omnimon',        // Mega +
      enriched: true
    })
  });
  
  const data = await response.json();
  
  console.log(`Evolution from In-Training I to Mega +:`);
  console.log(`Total steps: ${data.steps}`);
  console.log(`Generations:`);
  data.paths[0].forEach(d => console.log(`  - ${d.name} (${d.generation})`));
}

/**
 * Example 15: Health check
 */
async function healthCheck() {
  console.log('\n--- Example 15: Health Check ---');
  
  const response = await fetch(`${BASE_URL}/health`);
  const data = await response.json();
  
  console.log(`Status: ${data.status}`);
  console.log(`Services: ${JSON.stringify(data.services, null, 2)}`);
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Digimon Planner API - Usage Examples               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Health check first
    await healthCheck();

    // Digimon endpoints
    await getAllDigimon();
    await searchDigimon();
    await getDigimonById();
    await getDigimonByName();
    await handleNotFound();

    // Pathfinding endpoints
    await findSimplePath();
    await findPathWithDeDigivolve();
    await findEnrichedPath();
    await findMultiplePaths();
    await caseInsensitivePath();

    // Error handling
    await handleMissingFields();
    await handleInvalidDigimon();

    // Special cases
    await noPathAvailable();
    await longPath();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                  All Examples Completed!                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
  } catch (error) {
    console.error('Error running examples:', error);
    console.log('\n⚠️  Make sure the server is running: node server.js');
  }
}

// Run examples
runAllExamples();
