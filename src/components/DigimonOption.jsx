import React from 'react';

/**
 * Single Digimon option in dropdown
 */
export function DigimonOption({ digimon, onClick }) {
  return (
    <button
      onClick={() => onClick(digimon)}
      className="
        w-full px-4 py-3 flex items-center gap-3 
        hover:bg-blue-100 dark:hover:bg-blue-900/30
        transition-colors duration-150
        text-left
      "
    >
      {digimon.icon && (
        <img
          src={digimon.icon}
          alt={digimon.name}
          className="w-8 h-8 rounded object-cover flex-shrink-0"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
          {digimon.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {digimon.generation}
        </p>
      </div>
    </button>
  );
}
