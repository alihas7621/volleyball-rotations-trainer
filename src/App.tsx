import { useState } from 'react';
import type { AppMode } from './types';
import { useTeam } from './hooks/useTeam';
import LearnMode from './components/LearnMode';
import QuizMode from './components/QuizMode';
import SettingsMode from './components/SettingsMode';
// SetupMode + ZoneSetupMode kept in code for future use

const MODES: { key: AppMode; label: string }[] = [
  { key: 'learn', label: 'Learn' },
  { key: 'quiz', label: 'Quiz' },
];

function App() {
  const [mode, setMode] = useState<AppMode>('learn');
  const {
    teams, activeTeam, activeTeamId, settings,
    setActiveTeamId, updatePlayer, updateStartingZone,
    updateSystem, updateSettings, saveTeam, deleteTeam,
    exportTeam, importTeam, resetApp,
  } = useTeam();

  return (
    <div className="min-h-screen bg-deep text-text-primary">
      {/* Header + Nav combined */}
      <header className="bg-base border-b border-elevated">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5 py-3 mr-2">
            <svg width="28" height="28" viewBox="0 0 48 48" className="flex-shrink-0">
              <circle cx="24" cy="24" r="22" fill="#f59e0b" stroke="#a85a1d" strokeWidth="2"/>
              <path d="M24 2C24 2 10 14 10 24s14 22 14 22" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5"/>
              <path d="M24 2C24 2 38 14 38 24s-14 22-14 22" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5"/>
              <path d="M3 20h42" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5"/>
              <path d="M3 28h42" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5"/>
            </svg>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-text-primary font-display leading-tight">
                Rotations Trainer
              </h1>
              <p className="text-[10px] text-text-muted leading-tight">5-1 System</p>
            </div>
          </div>

          {/* Mode tabs */}
          <nav className="flex items-stretch gap-1 overflow-x-auto -mb-px">
            {MODES.map(m => (
              <button key={m.key} onClick={() => setMode(m.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  mode === m.key
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}>
                {m.label}
              </button>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Settings */}
          <button onClick={() => setMode('settings')}
            className={`px-3 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
              mode === 'settings'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-5">
        {mode === 'learn' && (
          <LearnMode players={activeTeam.players} startingZones={activeTeam.startingZones} />
        )}
        {mode === 'quiz' && (
          <QuizMode players={activeTeam.players} startingZones={activeTeam.startingZones} />
        )}
        {mode === 'settings' && (
          <SettingsMode
            team={activeTeam} teams={teams} activeTeamId={activeTeamId} settings={settings}
            onSelectTeam={setActiveTeamId} onUpdatePlayer={updatePlayer}
            onUpdateStartingZone={updateStartingZone} onUpdateSystem={updateSystem}
            onUpdateSettings={updateSettings} onExport={exportTeam} onImport={importTeam}
            onSaveTeam={saveTeam} onDeleteTeam={deleteTeam} onReset={resetApp}
          />
        )}
      </main>
    </div>
  );
}

export default App;
