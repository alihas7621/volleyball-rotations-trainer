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
      {/* Header */}
      <header className="bg-base border-b border-elevated px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-base md:text-lg font-bold text-amber-400 font-display">
            Volleyball Rotations Trainer
          </h1>
        </div>
      </header>

      {/* Mode tabs + settings gear on far right */}
      <nav className="bg-base/50 border-b border-elevated overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center">
          {MODES.map(m => (
            <button key={m.key} onClick={() => setMode(m.key)}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                mode === m.key
                  ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-elevated/30'
              }`}>
              {m.label}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={() => setMode('settings')}
            className={`px-3 py-2 text-xs md:text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
              mode === 'settings'
                ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-elevated/30'
            }`}>
            Settings
          </button>
        </div>
      </nav>

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
