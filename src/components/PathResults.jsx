import React from 'react';
import { PathCard } from './PathCard';

/**
 * Display all shortest evolution paths
 */
export function PathResults({ paths, loading, error, onDetailClick, noResults, onSave, isFavorite }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Finding evolution paths...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-800 dark:text-red-300">
          <span className="font-medium">Error:</span> {error}
        </p>
      </div>
    );
  }

  if (noResults) {
    return (
      <div className="p-8 text-center">
        <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-600 dark:text-gray-400 font-medium">No evolution paths found</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          Try different Digimon or enable de-digivolution
        </p>
      </div>
    );
  }

  if (!paths || paths.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Found {paths.length} {paths.length === 1 ? 'path' : 'paths'}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {paths[0].length - 1} {paths[0].length - 1 === 1 ? 'step' : 'steps'} each
        </span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Click on any Digimon to see details
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {paths.map((path, idx) => (
          <PathCard
            key={`path-${idx}`}
            path={path}
            onDetailClick={onDetailClick}
            index={idx}
            onSave={onSave ? () => onSave(path) : undefined}
            isSaved={isFavorite ? isFavorite(path) : false}
          />
        ))}
      </div>
    </div>
  );
}
