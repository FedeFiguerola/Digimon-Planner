import React, { useState, useRef, useEffect } from 'react';
import { DigimonOption } from './DigimonOption';

/**
 * Searchable Digimon selector dropdown
 */
export function DigimonSelector({ label, digimon, selected, onSelect, onClear, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const filtered = digimon.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    onSelect(item);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full px-4 py-3 text-left
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          rounded-lg
          flex items-center gap-3
          hover:border-blue-500 dark:hover:border-blue-400
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors
        "
      >
        {selected ? (
          <>
            {selected.icon && (
              <img
                src={selected.icon}
                alt={selected.name}
                className="w-6 h-6 rounded object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <span className="text-gray-900 dark:text-white font-medium flex-1">
              {selected.name}
            </span>
            {onClear && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="
                  text-gray-400 hover:text-red-500 dark:hover:text-red-400
                  transition-colors p-1
                  focus:outline-none focus:ring-2 focus:ring-red-500 rounded
                "
                title="Clear selection"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
        )}
        {!selected && (
          <span className="ml-auto text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="
          absolute top-full left-0 right-0 mt-2 z-50
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          rounded-lg shadow-lg
        ">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full px-4 py-2
              border-b border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white
              focus:outline-none
            "
            autoFocus
          />
          <div className="max-h-64 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <DigimonOption
                  key={item.id}
                  digimon={item}
                  onClick={handleSelect}
                />
              ))
            ) : (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                No Digimon found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
