import { useState, useEffect, useCallback } from 'react';
import { fetchAllDigimon, findEvolutionPath } from '../api/digimonApi';

export function useDigimon() {
  const [digimon, setDigimon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDigimon() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllDigimon();
        setDigimon(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDigimon();
  }, []);

  return { digimon, loading, error };
}

export function useEvolutionPath() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findPath = useCallback(async (from, to, allowDeDigivolve = false) => {
    if (!from || !to) {
      setError('Please select both Digimon');
      setPaths([]);
      return;
    }

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

  return { paths, loading, error, findPath };
}
