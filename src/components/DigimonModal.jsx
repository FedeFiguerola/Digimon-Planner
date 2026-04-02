import React from 'react';

// --- Stat key display labels ---
const STAT_LABELS = {
  max_HP: 'Max HP',
  HP: 'HP',
  max_SP: 'Max SP',
  ATK: 'ATK',
  DEF: 'DEF',
  INT: 'INT',
  SPD: 'SPD',
  SPI: 'SPI',
};

const SKILL_LABELS = {
  bonds_of_valor: 'Bonds of Valor',
  bonds_of_wisdom: 'Bonds of Wisdom',
  bonds_of_philanthropy: 'Bonds of Philanthropy',
  bonds_of_amicability: 'Bonds of Amicability',
};

// --- Sub-components ---

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
      {children}
    </p>
  );
}

function BaseRequirements({ requirements }) {
  const { agent_rank, stats, agent_skills } = requirements;
  const hasStats = stats && Object.keys(stats).length > 0;
  const hasSkills = agent_skills && Object.keys(agent_skills).length > 0;

  return (
    <div className="space-y-3">
      {agent_rank != null && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Agent Rank</span>
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-bold">
            {agent_rank}
          </span>
        </div>
      )}

      {hasStats && (
        <div>
          <SectionLabel>Stats Required</SectionLabel>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-2 divide-y divide-gray-200 dark:divide-gray-600">
            {Object.entries(stats).map(([key, val]) => (
              <StatRow key={key} label={STAT_LABELS[key] ?? key} value={val} />
            ))}
          </div>
        </div>
      )}

      {hasSkills && (
        <div>
          <SectionLabel>Agent Skills Required</SectionLabel>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-2 divide-y divide-gray-200 dark:divide-gray-600">
            {Object.entries(agent_skills).map(([key, val]) => (
              <StatRow key={key} label={SKILL_LABELS[key] ?? key} value={val} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DnaPathCard({ conditions }) {
  return (
    <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3">
        DNA Digivolution
      </p>
      <div className="space-y-2">
        {conditions.map((c, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{c.digimon}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300">
              {c.requirement}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModeChangeCard({ from }) {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
        Mode Change
      </p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">From</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{from}</span>
      </div>
    </div>
  );
}

function EvolutionPaths({ paths }) {
  if (!paths || paths.length === 0) return null;

  return (
    <div>
      <SectionLabel>Possible Evolution Methods</SectionLabel>
      <div className="space-y-3">
        {paths.map((path, i) => {
          if (path.type === 'dna') return <DnaPathCard key={i} conditions={path.conditions ?? []} />;
          if (path.type === 'mode_change') return <ModeChangeCard key={i} from={path.from} />;
          return null;
        })}
      </div>
    </div>
  );
}

function RequirementsSection({ requirements }) {
  if (!requirements) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
        This Digimon has no evolution requirements.
      </p>
    );
  }

  const hasBase =
    requirements.agent_rank != null ||
    (requirements.stats && Object.keys(requirements.stats).length > 0) ||
    (requirements.agent_skills && Object.keys(requirements.agent_skills).length > 0);

  const hasPaths = requirements.paths && requirements.paths.length > 0;

  return (
    <div className="space-y-4">
      {hasBase && <BaseRequirements requirements={requirements} />}
      {hasBase && hasPaths && (
        <hr className="border-gray-200 dark:border-gray-700" />
      )}
      {hasPaths && <EvolutionPaths paths={requirements.paths} />}
      {!hasBase && !hasPaths && (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          This Digimon has no evolution requirements.
        </p>
      )}
    </div>
  );
}

// --- Main Modal ---

export function DigimonModal({ digimon, onClose }) {
  if (!digimon) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            {digimon.icon && (
              <img
                src={digimon.icon}
                alt={digimon.name}
                className="w-14 h-14 rounded-lg object-cover bg-white/20 shadow"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{digimon.name}</h2>
              <p className="text-blue-100 text-sm">{digimon.generation}</p>
              <p className="text-blue-200 text-xs font-mono">#{digimon.id}</p>
            </div>
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
        <div className="p-6 space-y-6">

          {/* Full Image */}
          <div className="flex justify-center">
            {digimon.image ? (
              <img
                src={digimon.image}
                alt={digimon.name}
                className="max-h-56 w-auto rounded-2xl shadow-md object-contain"
                onError={(e) => { e.target.replaceWith(Object.assign(document.createElement('p'), { textContent: 'No image available', className: 'text-sm text-gray-400 italic py-4' })); }}
              />
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic py-4">No image available</p>
            )}
          </div>

          {/* Evolution Requirements */}
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Evolution Requirements
            </h3>
            <RequirementsSection requirements={digimon.requirements} />
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
