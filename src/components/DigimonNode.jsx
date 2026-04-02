import React from 'react';

/**
 * Single Digimon icon + name in an evolution path chain
 * 
 * Determines if the next step is a de-digivolution by checking if the
 * next Digimon is in the current Digimon's evolutions list or not.
 */
export function DigimonNode({ digimon, onDetailClick, isLast, nextDigimon }) {
  // Determine if the transition to the next Digimon is a de-digivolution
  // De-digivolution = moving backward to a pre-evolution (not jumping to an evolution)
  const isDeDigivolve = nextDigimon && 
    digimon.pre_evolutions && 
    digimon.pre_evolutions.includes(nextDigimon.name);
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onDetailClick?.(digimon)}
        className="
          flex flex-col items-center gap-1
          hover:opacity-80 transition-opacity cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-500 rounded
          p-1
        "
      >
        {digimon.icon && (
          <img
            src={digimon.icon}
            alt={digimon.name}
            className="w-12 h-12 rounded object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center max-w-[60px] line-clamp-2">
          {digimon.name}
        </span>
      </button>
      {!isLast && (
        <div className={`flex items-center gap-1 ${
          isDeDigivolve 
            ? 'text-red-500 dark:text-red-400' 
            : 'text-blue-500 dark:text-blue-400'
        }`} title={isDeDigivolve ? 'De-digivolution' : 'Evolution'}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
