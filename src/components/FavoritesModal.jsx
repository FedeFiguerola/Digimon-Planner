import React, { useEffect } from 'react';
import { DigimonNode } from './DigimonNode';

function FavoriteEntry({ favorite, onLoad, onRemove, onDetailClick }) {
  const { from, to, allowDeDigivolve, path } = favorite;
  const steps = path.length - 1;

  return (
    <div className="
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      rounded-xl p-4 space-y-3
    ">
      {/* Meta row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {from} → {to}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {steps} {steps === 1 ? 'step' : 'steps'}
            </span>
            {allowDeDigivolve && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                De-Digivolution
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onLoad(favorite)}
            className="
              text-xs px-3 py-1.5 rounded-lg font-medium
              bg-blue-600 hover:bg-blue-700
              dark:bg-blue-700 dark:hover:bg-blue-600
              text-white transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            Load
          </button>
          <button
            onClick={() => onRemove(favorite.id)}
            className="
              text-xs px-3 py-1.5 rounded-lg font-medium
              bg-gray-100 hover:bg-red-50 dark:bg-gray-700 dark:hover:bg-red-900/30
              text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-red-400
            "
          >
            Remove
          </button>
        </div>
      </div>

      {/* Path visual */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {path.map((digimon, idx) => (
          <div key={`${digimon.id}-${idx}`}>
            <DigimonNode
              digimon={digimon}
              onDetailClick={onDetailClick}
              isLast={idx === path.length - 1}
              nextDigimon={idx < path.length - 1 ? path[idx + 1] : null}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FavoritesModal({ favorites, onClose, onLoad, onRemove, onDetailClick }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <h2 className="text-xl font-bold text-white">Favorite Paths</h2>
            {favorites.length > 0 && (
              <span className="text-xs bg-white/25 text-white px-2 py-0.5 rounded-full font-medium">
                {favorites.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 font-medium">No favorite paths yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Save a path using the ★ button on any result
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map(fav => (
                <FavoriteEntry
                  key={fav.id}
                  favorite={fav}
                  onLoad={onLoad}
                  onRemove={onRemove}
                  onDetailClick={onDetailClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
