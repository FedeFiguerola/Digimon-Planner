/**
 * Pathfinder Test Suite
 * 
 * Demonstrates usage of the Digimon pathfinding system.
 * Run with: node test_pathfinder.js
 */

const { DigimonGraph, loadDigimonGraph, findShortestPaths } = require('./pathfinder');

/**
 * Helper function to pretty-print results
 */
function printResults(result, title = '') {
  if (title) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${title}`);
    console.log(`${'='.repeat(80)}`);
  }

  if (result.paths.length === 0) {
    console.log('❌ No path found');
    return;
  }

  console.log(`✅ Found ${result.paths.length} path(s) with ${result.steps} step(s)\n`);

  result.paths.forEach((path, index) => {
    console.log(`Path ${index + 1}: ${path.join(' → ')}`);
  });
}

/**
 * Test suite
 */
async function runTests() {
  console.log('🔧 Loading Digimon data...');
  const graph = loadDigimonGraph('data/processed/digimon.json');
  
  // Display graph stats
  console.log('\n📊 Graph Statistics:');
  const stats = graph.getStats();
  Object.entries(stats).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  // Test 1: Simple forward evolution
  console.log('\n\n--- TEST 1: Forward Evolution Only (allowDeDigivolve = false) ---');
  printResults(
    graph.findShortestPaths('Agumon', 'WarGreymon', false),
    'Find path from Agumon to WarGreymon (forward only)'
  );

  // Test 2: Same with de-digivolution
  console.log('\n\n--- TEST 2: With De-Digivolution Enabled (allowDeDigivolve = true) ---');
  printResults(
    graph.findShortestPaths('Agumon', 'WarGreymon', true),
    'Find path from Agumon to WarGreymon (with de-digivolution)'
  );

  // Test 3: Start equals target
  console.log('\n\n--- TEST 3: Start Equals Target ---');
  printResults(
    graph.findShortestPaths('Agumon', 'Agumon', false),
    'Find path from Agumon to itself'
  );

  // Test 4: Multiple shortest paths
  console.log('\n\n--- TEST 4: Multiple Shortest Paths ---');
  printResults(
    graph.findShortestPaths('Agumon', 'Omnimon', false),
    'Find all shortest paths from Agumon to Omnimon'
  );

  // Test 5: Enriched results
  console.log('\n\n--- TEST 5: Enriched Results (with metadata) ---');
  const enrichedResult = graph.findShortestPathsEnriched('Agumon', 'WarGreymon', false);
  if (enrichedResult.paths.length > 0) {
    console.log(`✅ Found ${enrichedResult.paths.length} path(s) with ${enrichedResult.steps} step(s)\n`);
    enrichedResult.paths.forEach((path, index) => {
      console.log(`Path ${index + 1}:`);
      path.forEach(digimon => {
        console.log(`  → ${digimon.name} (ID: ${digimon.id}, ${digimon.generation})`);
      });
    });
  }

  // Test 6: No path possible
  console.log('\n\n--- TEST 6: No Path Exists ---');
  try {
    // Find a suitable unreachable pair (needs to be in the dataset)
    const allNames = graph.getAllDigimonNames();
    printResults(
      graph.findShortestPaths(allNames[0], allNames[allNames.length - 1], false),
      `Find path from ${allNames[0]} to ${allNames[allNames.length - 1]}`
    );
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
  }

  // Test 7: Invalid Digimon
  console.log('\n\n--- TEST 7: Invalid Digimon Name ---');
  try {
    graph.findShortestPaths('InvalidDigimon', 'Agumon', false);
  } catch (e) {
    console.log(`❌ Caught expected error: ${e.message}`);
  }

  // Test 8: Convenience function
  console.log('\n\n--- TEST 8: Using Convenience Function ---');
  printResults(
    findShortestPaths('Agumon', 'MetalGreymon', false),
    'Using findShortestPaths() convenience function'
  );

  // Test 9: Large path
  console.log('\n\n--- TEST 9: Path to Mega Digimon ---');
  printResults(
    graph.findShortestPaths('Kuramon', 'Omnimon', false),
    'Find path from Kuramon (In-Training) to Omnimon (Mega)'
  );

  console.log('\n\n✨ All tests completed!\n');
}

// Run tests
runTests().catch(console.error);
