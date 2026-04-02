import { useState, useEffect } from 'react';
import { DigimonSelector } from './components/DigimonSelector';
import { ToggleSwitch } from './components/ToggleSwitch';
import { PathResults } from './components/PathResults';
import { DigimonModal } from './components/DigimonModal';
import { useDigimon, useEvolutionPath } from './hooks/useDigimon';
import { useTheme } from './context/ThemeContext';

function App() {
  // Data loading
  const { digimon, loading: loadingDigimon, error: errorDigimon } = useDigimon();

  // UI State
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [allowDeDigivolve, setAllowDeDigivolve] = useState(false);
  const [selectedDigimon, setSelectedDigimon] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Path finding
  const { paths, loading: loadingPaths, error: errorPaths, findPath } = useEvolutionPath();

  // Theme
  const { isDark, toggleTheme } = useTheme();

  // Clear search results when selections change
  useEffect(() => {
    setHasSearched(false);
  }, [selectedFrom, selectedTo]);

  const handleFindPaths = () => {
    if (selectedFrom && selectedTo && selectedFrom.id !== selectedTo.id) {
      setHasSearched(true);
      findPath(selectedFrom.name, selectedTo.name, allowDeDigivolve);
    }
  };



  return (
    <div
      className={isDark ? 'dark' : ''}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src="/digimon-icon.png"
                    alt="Digimon Planner"
                    className="w-10 h-10"
                  />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Digimon Story: Time Stranger - Planner
                  </h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Find the shortest evolution path between any two Digimon
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="
                  p-2 rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Error loading Digimon */}
          {errorDigimon && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300">
                <span className="font-semibold">Error loading Digimon:</span> {errorDigimon}
              </p>
            </div>
          )}

          {/* Loading Digimon */}
          {loadingDigimon ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading {digimon.length} Digimon...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selectors Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Select Evolution Path
                </h2>

                <div className="space-y-4">
                  {/* From/To Selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DigimonSelector
                      label="From Digimon"
                      digimon={digimon}
                      selected={selectedFrom}
                      onSelect={setSelectedFrom}
                      onClear={() => setSelectedFrom(null)}
                      placeholder="Choose a starting Digimon..."
                    />

                    <DigimonSelector
                      label="To Digimon"
                      digimon={digimon}
                      selected={selectedTo}
                      onSelect={setSelectedTo}
                      onClear={() => setSelectedTo(null)}
                      placeholder="Choose a destination Digimon..."
                    />
                  </div>

                  {/* Options */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <ToggleSwitch
                      checked={allowDeDigivolve}
                      onChange={setAllowDeDigivolve}
                      label="Allow De-Digivolution"
                    />
                  </div>

                  {/* Find Button */}
                  <button
                    onClick={handleFindPaths}
                    disabled={!selectedFrom || !selectedTo || selectedFrom.id === selectedTo.id || loadingPaths}
                    className="
                      w-full px-6 py-3
                      bg-blue-600 hover:bg-blue-700
                      dark:bg-blue-700 dark:hover:bg-blue-600
                      disabled:bg-gray-400 disabled:dark:bg-gray-600
                      disabled:cursor-not-allowed
                      text-white font-semibold rounded-lg
                      transition-colors
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                    "
                  >
                    {loadingPaths ? 'Finding...' : 'Find Paths'}
                  </button>
                </div>
              </div>

              {/* Results Section */}
              {(selectedFrom && selectedTo && selectedFrom.id !== selectedTo.id && hasSearched) && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <PathResults
                    paths={paths}
                    loading={loadingPaths}
                    error={errorPaths}
                    onDetailClick={setSelectedDigimon}
                    noResults={!loadingPaths && !errorPaths && (!paths || paths.length === 0)}
                  />
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 mt-12 py-6">
          <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              💾 Data source: {digimon.length} Digimon from Game8 • 
              ⚡ Built with React, Vite & Tailwind CSS
            </p>
          </div>
        </footer>
      </div>

      {/* Detail Modal */}
      <DigimonModal
        digimon={selectedDigimon}
        onClose={() => setSelectedDigimon(null)}
        digimonList={digimon}
      />
    </div>
  );
}

export default App;
