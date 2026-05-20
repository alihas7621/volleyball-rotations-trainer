import { useState, useMemo, useCallback } from 'react';
import type { CourtCoord, DisplayToggles, FormationView } from '../types';
import { BACK_ROW_ZONES } from '../types';
import { getZoneAssignments, ZONE_ANCHORS } from '../logic/rotation';
import { validateOverlap } from '../logic/validation';
import { FORMATIONS_5_1 } from '../data/formations';
import { DEFAULT_PLAYERS, LIBERO_PLAYER, DEFAULT_STARTING_ZONES_5_1 } from '../data/defaultTeam';
import Court from './Court';

/**
 * Setup Mode: Visual position editor for configuring formations.
 *
 * The user drags players to set exact positions for each rotation (P1-P6)
 * in both Base and Serve Receive views. Then exports the JSON so we can
 * hardcode the positions into formations.ts.
 */
export default function SetupMode() {
  const [rotationIndex, setRotationIndex] = useState(0);
  const [view, setView] = useState<FormationView>('base');
  const [copied, setCopied] = useState(false);

  // Store custom coordinates per rotation per view
  // Key: `${rotationIndex}-${view}` → Record<playerId, CourtCoord>
  const [allCustomCoords, setAllCustomCoords] = useState<Record<string, Record<string, CourtCoord>>>({});

  const stateKey = `${rotationIndex}-${view}`;
  const customCoords = useMemo(() => allCustomCoords[stateKey] || {}, [allCustomCoords, stateKey]);

  const formation = FORMATIONS_5_1[rotationIndex];
  const zones = useMemo(
    () => getZoneAssignments(DEFAULT_STARTING_ZONES_5_1, rotationIndex),
    [rotationIndex]
  );

  // Determine which players are on court (libero replaces back-row MB in serve-receive)
  const { displayPlayers, displayZones } = useMemo(() => {
    if (view === 'base') {
      return { displayPlayers: DEFAULT_PLAYERS, displayZones: zones };
    }

    // Serve-receive: find back-row MBs and replace with libero
    const players = [...DEFAULT_PLAYERS];
    const newZones = { ...zones };

    for (const [pid, zone] of Object.entries(zones)) {
      if (!BACK_ROW_ZONES.includes(zone)) continue;
      const player = players.find(p => p.id === pid);
      if (!player) continue;
      if (player.role === 'MB1' || player.role === 'MB2') {
        // Replace this MB with the libero
        const idx = players.findIndex(p => p.id === pid);
        if (idx >= 0) {
          players[idx] = { ...LIBERO_PLAYER, id: pid };
        }
      }
    }

    return { displayPlayers: players, displayZones: newZones };
  }, [view, zones]);

  // Build coordinates: start from formation defaults, override with custom
  const coordinates = useMemo(() => {
    const formationPositions = view === 'base' ? formation.base : formation.serveReceive;
    const coords: Record<string, CourtCoord> = {};

    // Map role-based formation positions to player IDs
    for (const [pid, zone] of Object.entries(displayZones)) {
      const player = displayPlayers.find(p => p.id === pid);
      if (!player) continue;
      const role = player.role;
      if (formationPositions[role]) {
        coords[pid] = { ...formationPositions[role] };
      } else {
        coords[pid] = { ...ZONE_ANCHORS[zone] };
      }
    }

    // Apply custom overrides
    return { ...coords, ...customCoords };
  }, [formation, view, displayPlayers, displayZones, customCoords]);

  const validation = useMemo(
    () => validateOverlap(coordinates, displayZones),
    [coordinates, displayZones]
  );

  const toggles: DisplayToggles = {
    showZones: true,
    showFrontBackRow: false,
    showOverlapLines: true,
    showRoleLabels: true,
    showBeginnerExplanations: false,
    showGhostPositions: false,
    showReceiveShape: false,
    showHomeBase: false,
  };

  const handlePlayerMove = useCallback((playerId: string, coord: CourtCoord) => {
    setAllCustomCoords(prev => ({
      ...prev,
      [stateKey]: {
        ...(prev[stateKey] || {}),
        [playerId]: coord,
      },
    }));
  }, [stateKey]);

  const handleExport = useCallback(() => {
    // Build export data: for each rotation, collect base and serve-receive coords
    const exportData: Record<string, { base: Record<string, CourtCoord>; serveReceive: Record<string, CourtCoord> }> = {};

    for (let r = 0; r < 6; r++) {
      const f = FORMATIONS_5_1[r];
      const rZones = getZoneAssignments(DEFAULT_STARTING_ZONES_5_1, r);

      const buildCoords = (v: FormationView) => {
        const key = `${r}-${v}`;
        const custom = allCustomCoords[key] || {};
        const formPos = v === 'base' ? f.base : f.serveReceive;

        // Figure out which players are on court for this view
        const players = v === 'base' ? DEFAULT_PLAYERS : DEFAULT_PLAYERS.map(p => {
          const zone = rZones[p.id];
          if (zone && BACK_ROW_ZONES.includes(zone) && (p.role === 'MB1' || p.role === 'MB2')) {
            return { ...LIBERO_PLAYER, id: p.id };
          }
          return p;
        });

        const coords: Record<string, { role: string; x: number; y: number }> = {};
        for (const [pid] of Object.entries(rZones)) {
          const player = players.find(p => p.id === pid);
          if (!player) continue;
          const role = player.role;
          const pos = custom[pid] || formPos[role] || { x: 4.5, y: 4.5 };
          coords[role] = { role, x: Math.round(pos.x * 100) / 100, y: Math.round(pos.y * 100) / 100 };
        }
        return coords;
      };

      exportData[f.name] = {
        base: buildCoords('base'),
        serveReceive: buildCoords('serve-receive'),
      };
    }

    const json = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
    console.log('=== FORMATION EXPORT ===');
    console.log(json);
  }, [allCustomCoords]);

  const handleReset = useCallback(() => {
    setAllCustomCoords(prev => {
      const next = { ...prev };
      delete next[stateKey];
      return next;
    });
  }, [stateKey]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-primary font-display">Setup: Configure Formations</h2>
        <p className="text-sm text-text-secondary">
          Drag players to set exact positions. Export when done.
        </p>
      </div>

      {/* Rotation selector */}
      <div className="flex items-center justify-center gap-2">
        {FORMATIONS_5_1.map((f, i) => (
          <button
            key={f.name}
            onClick={() => setRotationIndex(i)}
            className={`px-4 py-2 rounded-lg text-sm font-bold font-display transition-all ${
              rotationIndex === i
                ? 'bg-amber-400 text-deep'
                : 'bg-elevated text-text-secondary hover:bg-hover'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-center gap-2">
        {([['base', 'Base'] as const, ['serve-receive', 'Serve Receive'] as const]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === key
                ? 'bg-amber-400 text-deep'
                : 'bg-elevated text-text-secondary hover:bg-hover'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">
        {/* Court */}
        <Court
          players={displayPlayers}
          zoneAssignments={displayZones}
          coordinates={coordinates}
          toggles={toggles}
          validation={validation}
          draggable
          onPlayerMove={handlePlayerMove}
          containerClassName="w-full select-none"
        />

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Player list */}
          <div className="bg-surface rounded-lg p-3">
            <h4 className="text-xs font-bold text-text-primary mb-2">
              {formation.name} — {view === 'base' ? 'Base' : 'Serve Receive'}
            </h4>
            {displayPlayers.map(player => {
              const zone = displayZones[player.id];
              if (!zone) return null;
              const coord = coordinates[player.id];
              const isCustom = !!customCoords[player.id];
              return (
                <div key={player.id} className="flex items-center gap-2 mb-1 text-xs">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.number}
                  </div>
                  <span className="text-text-primary">{player.role}</span>
                  <span className="text-text-muted">Z{zone}</span>
                  {coord && (
                    <span className="text-text-muted font-mono text-[10px]">
                      ({coord.x.toFixed(1)}, {coord.y.toFixed(1)})
                    </span>
                  )}
                  {isCustom && <span className="text-amber-400 text-[9px]">*</span>}
                </div>
              );
            })}
          </div>

          {/* Validation */}
          <div className={`rounded-lg px-3 py-2 text-xs font-bold ${
            validation.isLegal
              ? 'bg-teal-500/20 text-teal-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {validation.isLegal
              ? 'Legal'
              : `${validation.violations.filter(v => v.severity === 'illegal').length} Violation(s)`}
          </div>

          {validation.violations.filter(v => v.severity === 'illegal').length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 space-y-1">
              {validation.violations.filter(v => v.severity === 'illegal').map((v, i) => (
                <p key={i} className="text-[10px] text-red-300">{v.message}</p>
              ))}
            </div>
          )}

          {/* Actions */}
          <button
            onClick={handleReset}
            className="w-full px-3 py-1.5 bg-elevated hover:bg-hover text-text-primary rounded-lg text-xs transition-colors"
          >
            Reset This View
          </button>

          <button
            onClick={handleExport}
            className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-bold text-sm transition-colors"
          >
            {copied ? 'Copied to Clipboard!' : 'Export All Positions (JSON)'}
          </button>

          <p className="text-[10px] text-text-muted">
            Also logged to browser console. Configure all 6 rotations in both views, then export.
          </p>
        </div>
      </div>
    </div>
  );
}
