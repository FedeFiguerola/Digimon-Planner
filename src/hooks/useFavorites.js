import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'favoritePaths';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // localStorage unavailable — fail silently
  }
}

/** Stable key used for duplicate detection. */
function pathKey(from, to, allowDeDigivolve, path) {
  const ids = path.map(d => d.id).join('-');
  return `${from}|${to}|${allowDeDigivolve}|${ids}`;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(loadFromStorage);

  useEffect(() => {
    saveToStorage(favorites);
  }, [favorites]);

  const isFavorite = useCallback((from, to, allowDeDigivolve, path) => {
    const key = pathKey(from, to, allowDeDigivolve, path);
    return favorites.some(f => pathKey(f.from, f.to, f.allowDeDigivolve, f.path) === key);
  }, [favorites]);

  const getFavoriteId = useCallback((from, to, allowDeDigivolve, path) => {
    const key = pathKey(from, to, allowDeDigivolve, path);
    return favorites.find(f => pathKey(f.from, f.to, f.allowDeDigivolve, f.path) === key)?.id ?? null;
  }, [favorites]);

  const addFavorite = useCallback((from, to, allowDeDigivolve, path) => {
    if (isFavorite(from, to, allowDeDigivolve, path)) return;
    const entry = {
      id: Date.now().toString(),
      from,
      to,
      allowDeDigivolve,
      path,
    };
    setFavorites(prev => [entry, ...prev]);
  }, [isFavorite]);

  const removeFavorite = useCallback((id) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  }, []);

  return { favorites, addFavorite, removeFavorite, isFavorite, getFavoriteId };
}
