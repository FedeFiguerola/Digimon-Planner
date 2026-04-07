import React from 'react';
import { DigimonNode } from './DigimonNode';

/**
 * Single evolution path card
 */
export function PathCard({ path, onDetailClick, index, onSave, isSaved }) {
  return (
    <div className="
      bg-white dark:bg-gray-800
      rounded-lg p-4 border border-gray-200 dark:border-gray-700
      hover:shadow-lg dark:hover:shadow-lg/50
      transition-shadow
    ">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Path {index + 1} ({path.length - 1} {path.length - 1 === 1 ? 'step' : 'steps'})
        </span>

        {onSave && (
          <button
            onClick={() => onSave(path)}
            title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
            className="
              flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
              transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400
              hover:bg-amber-50 dark:hover:bg-amber-900/20
            "
          >
            <svg
              className={`w-4 h-4 transition-colors ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-gray-400 dark:text-gray-500'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={isSaved ? 0 : 1.5}
              fill={isSaved ? 'currentColor' : 'none'}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <span className={isSaved ? 'text-amber-500 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}>
              {isSaved ? 'Saved' : 'Save'}
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
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
