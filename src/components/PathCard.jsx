import React from 'react';
import { DigimonNode } from './DigimonNode';

/**
 * Single evolution path card
 */
export function PathCard({ path, onDetailClick, index }) {
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
