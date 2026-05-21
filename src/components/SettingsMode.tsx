import { useState } from 'react';
import type { Player, Team, Zone, Role, System, AppSettings } from '../types';
import { ROLE_COLORS, ROLE_DISPLAY } from '../types';
import { trackEvent } from '../lib/analytics';

interface SettingsModeProps {
  team: Team;
  teams: Team[];
  activeTeamId: string;
  settings: AppSettings;
  onSelectTeam: (id: string) => void;
  onUpdatePlayer: (playerId: string, updates: Partial<Player>) => void;
  onUpdateStartingZone: (playerId: string, zone: Zone) => void;
  onUpdateSystem: (system: System) => void;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onExport: () => string;
  onImport: (json: string) => boolean;
  onSaveTeam: (team: Team) => void;
  onDeleteTeam: (id: string) => void;
  onReset: () => void;
}

const ROLES: Role[] = ['S', 'OPP', 'OH1', 'OH2', 'MB1', 'MB2', 'L'];
const ZONES: Zone[] = [1, 2, 3, 4, 5, 6];

export default function SettingsMode({
  team,
  teams,
  activeTeamId,
  settings,
  onSelectTeam,
  onUpdatePlayer,
  onUpdateStartingZone,
  onUpdateSettings,
  onExport,
  onImport,
  onSaveTeam,
  onDeleteTeam,
  onReset,
}: SettingsModeProps) {
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExport = () => {
    const json = onExport();
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleImport = () => {
    if (onImport(importJson)) {
      setImportJson('');
      setShowImport(false);
      setImportError('');
    } else {
      setImportError('Invalid JSON.');
    }
  };

  const usedZones = new Set(Object.values(team.startingZones));

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="text-center py-1">
        <h2 className="text-xl font-bold text-text-primary font-display">Settings</h2>
        <p className="text-xs text-text-muted mt-0.5">Configure your team and preferences</p>
      </div>

      {/* ── Libero ── */}
      <div className="bg-surface rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-text-primary font-display">Libero</h3>
        <label className="flex items-center gap-2 text-xs text-text-secondary">
          <input type="checkbox" checked={settings.liberoEnabled}
            onChange={e => { onUpdateSettings({ liberoEnabled: e.target.checked }); if (e.target.checked) trackEvent('enable_libero'); }}
            className="rounded" />
          Enable libero replacement (auto-swap back-row MB)
        </label>
        {settings.liberoEnabled && (
          <div className="space-y-3">
            <div className="bg-elevated/50 rounded-lg p-3 flex items-center gap-2 flex-wrap border border-elevated/50">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: team.liberoColor ?? ROLE_COLORS.L }}
              >
                {team.liberoNumber ?? 3}
              </div>
              <input type="number" value={team.liberoNumber ?? 3}
                onChange={e => onSaveTeam({ ...team, liberoNumber: parseInt(e.target.value) || 0 })}
                className="w-12 bg-hover text-text-primary text-center rounded-lg px-1 py-1.5 text-xs" min={0} max={99} />
              <input type="text" value={team.liberoName ?? 'Libero'}
                onChange={e => onSaveTeam({ ...team, liberoName: e.target.value })}
                className="flex-1 min-w-[80px] bg-hover text-text-primary rounded-lg px-2 py-1.5 text-xs"
                placeholder="Libero name" />
              <span className="text-xs text-teal-400 font-medium">Libero</span>
              <input type="color" value={team.liberoColor ?? ROLE_COLORS.L}
                onChange={e => onSaveTeam({ ...team, liberoColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0" />
            </div>
            <p className="text-[10px] text-text-muted">Which middle blocker does the libero replace?</p>
            <div className="flex gap-2">
              {([['MB1', 'MB1 only'], ['MB2', 'MB2 only'], ['both', 'Both MBs']] as ['MB1' | 'MB2' | 'both', string][]).map(([val, label]) => (
                <button key={val} onClick={() => onUpdateSettings({ liberoReplacesRole: val })}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                    settings.liberoReplacesRole === val ? 'bg-teal-500 text-white' : 'bg-elevated text-text-secondary hover:bg-hover'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Team Selector ── */}
      <div className="bg-surface rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-text-primary font-display">Team</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {teams.map(t => (
            <button key={t.id} onClick={() => onSelectTeam(t.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                activeTeamId === t.id ? 'bg-amber-400 text-deep' : 'bg-elevated text-text-secondary hover:bg-hover'
              }`}>
              {t.name}
            </button>
          ))}
          {teams.length < 3 && <button onClick={() => {
            const newTeam: Team = {
              id: `team-${Date.now()}`,
              name: `Team ${teams.length + 1}`,
              players: team.players.map((p, i) => ({ ...p, id: `p-${Date.now()}-${i}` })),
              startingZones: {},
              system: '5-1',
            };
            newTeam.players.forEach((p, i) => { newTeam.startingZones[p.id] = ZONES[i]; });
            onSaveTeam(newTeam);
            onSelectTeam(newTeam.id);
          }}
            className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-md text-xs">
            + New
          </button>}
          {teams.length >= 3 && (
            <span className="text-[10px] text-text-muted">Max 3 teams</span>
          )}
          {teams.length > 1 && activeTeamId !== 'default' && (
            <button onClick={() => onDeleteTeam(activeTeamId)}
              className="px-3 py-1 bg-red-600/30 text-red-400 rounded-md text-xs hover:bg-red-600/50">
              Delete
            </button>
          )}
        </div>
      </div>

      {/* ── Player Editor ── */}
      <div className="bg-surface rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-text-primary font-display">Players</h3>
        {team.players.map(player => {
          const currentZone = team.startingZones[player.id];
          return (
            <div key={player.id} className="bg-elevated/50 rounded-lg p-3 flex items-center gap-2 flex-wrap border border-elevated/50">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: player.color }}>
                {player.number}
              </div>
              <input type="number" value={player.number}
                onChange={e => onUpdatePlayer(player.id, { number: parseInt(e.target.value) || 0 })}
                className="w-12 bg-hover text-text-primary text-center rounded-lg px-1 py-1.5 text-xs" min={0} max={99} />
              <input type="text" value={player.name}
                onChange={e => onUpdatePlayer(player.id, { name: e.target.value })}
                className="flex-1 min-w-[80px] bg-hover text-text-primary rounded-lg px-2 py-1.5 text-xs" />
              <select value={player.role}
                onChange={e => {
                  const role = e.target.value as Role;
                  onUpdatePlayer(player.id, { role, color: ROLE_COLORS[role], isLibero: role === 'L' });
                }}
                className="bg-hover text-text-primary rounded-lg px-2 py-1.5 text-xs">
                {ROLES.map(r => (
                  <option key={r} value={r}>{ROLE_DISPLAY[r]}</option>
                ))}
              </select>
              <select value={currentZone}
                onChange={e => onUpdateStartingZone(player.id, parseInt(e.target.value) as Zone)}
                className="bg-hover text-text-primary rounded-lg px-2 py-1.5 text-xs">
                {ZONES.map(z => (
                  <option key={z} value={z} disabled={usedZones.has(z) && currentZone !== z}>
                    Z{z}{usedZones.has(z) && currentZone !== z ? ' (taken)' : ''}
                  </option>
                ))}
              </select>
              <input type="color" value={player.color}
                onChange={e => onUpdatePlayer(player.id, { color: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0" />
            </div>
          );
        })}
      </div>

      {/* ── Export / Import ── */}
      <div className="bg-surface rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-text-primary font-display">Data</h3>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleExport}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs">
            {copied ? 'Copied!' : 'Export JSON'}
          </button>
          <button onClick={() => setShowImport(!showImport)}
            className="px-3 py-1.5 bg-hover hover:bg-elevated text-text-primary rounded-md text-xs">
            Import JSON
          </button>
        </div>
        {showImport && (
          <div className="space-y-2">
            <textarea value={importJson} onChange={e => setImportJson(e.target.value)}
              placeholder="Paste lineup JSON..."
              className="w-full h-20 bg-elevated text-text-primary rounded-md p-2 text-[10px] font-mono" />
            {importError && <p className="text-red-400 text-[10px]">{importError}</p>}
            <button onClick={handleImport}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-md text-xs">
              Load
            </button>
          </div>
        )}
      </div>

      {/* ── Reset ── */}
      <div className="bg-surface rounded-xl p-5">
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)}
            className="px-3 py-1.5 bg-red-600/30 text-red-400 rounded-md text-xs hover:bg-red-600/50">
            Reset App
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">Are you sure? This clears all data.</span>
            <button onClick={() => { onReset(); setConfirmReset(false); }}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md text-xs">
              Yes, Reset
            </button>
            <button onClick={() => setConfirmReset(false)}
              className="px-3 py-1.5 bg-hover text-text-primary rounded-md text-xs">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
