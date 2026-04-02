/**
 * API Service - Handles all HTTP requests to backend
 */

const API_BASE = '/api';

export async function fetchAllDigimon() {
  try {
    const response = await fetch(`${API_BASE}/digimon`);
    if (!response.ok) throw new Error('Failed to fetch Digimon');
    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error('Error fetching Digimon:', error);
    throw error;
  }
}

export async function findEvolutionPath(from, to, allowDeDigivolve = false) {
  try {
    const response = await fetch(`${API_BASE}/path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        allowDeDigivolve,
        enriched: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to find path');
    }

    const data = await response.json();
    return data.paths || [];
  } catch (error) {
    console.error('Error finding path:', error);
    throw error;
  }
}
