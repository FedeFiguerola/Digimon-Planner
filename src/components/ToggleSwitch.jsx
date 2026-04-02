import React from 'react';

/**
 * Modern toggle switch component
 */
export function ToggleSwitch({ checked, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-8 w-14 items-center rounded-full
          transition-colors duration-200 ease-in-out
          ${checked 
            ? 'bg-blue-600 dark:bg-blue-500' 
            : 'bg-gray-300 dark:bg-gray-600'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          dark:focus:ring-offset-gray-900
          cursor-pointer
        `}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`
            inline-block h-6 w-6 transform rounded-full bg-white
            transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-7' : 'translate-x-1'}
          `}
        />
      </button>
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
    </div>
  );
}
