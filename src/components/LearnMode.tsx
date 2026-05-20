import { useState, useMemo, useCallback } from 'react';
import type { Player, Zone, CourtCoord, DisplayToggles } from '../types';
import { BACK_ROW_ZONES } from '../types';
import { getZoneAssignments, ZONE_ANCHORS } from '../logic/rotation';
import { validateOverlap } from '../logic/validation';
import { FORMATIONS_5_1 } from '../data/formations';
import { LIBERO_PLAYER } from '../data/defaultTeam';
import Court from './Court';

interface LearnModeProps {
  players: Player[];
  startingZones: Record<string, Zone>;
}

type ViewMode = 'base' | 'serve-receive';

export default function LearnMode({ players, startingZones }: LearnModeProps) {
  const [rotationIndex, setRotationIndex] = useState(0);
  const [view, setView] = useState<ViewMode>('base');
  const [customCoords, setCustomCoords] = useState<Record<string, CourtCoord>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [showOverlapLines, setShowOverlapLines] = useState(false);
  const [showGhostPositions, setShowGhostPositions] = useState(false);


  const formation = FORMATIONS_5_1[rotationIndex];
  const zones = useMemo(
    () => getZoneAssignments(startingZones, rotationIndex),
    [startingZones, rotationIndex]
  );

  // In serve-receive, replace back-row MB with libero
  const { displayPlayers, displayZones } = useMemo(() => {
    if (view === 'base') {
      return { displayPlayers: players, displayZones: zones };
    }
    const updated = [...players];
    for (const [pid, zone] of Object.entries(zones)) {
      if (!BACK_ROW_ZONES.includes(zone)) continue;
      const player = updated.find(p => p.id === pid);
      if (!player) continue;
      if (player.role === 'MB1' || player.role === 'MB2') {
        const idx = updated.findIndex(p => p.id === pid);
        if (idx >= 0) updated[idx] = { ...LIBERO_PLAYER, id: pid };
      }
    }
    return { displayPlayers: updated, displayZones: zones };
  }, [view, zones, players]);

  // Build coordinates from hardcoded formations + custom overrides
  const coordinates = useMemo(() => {
    const formPos = view === 'base' ? formation.base : formation.serveReceive;
    const coords: Record<string, CourtCoord> = {};
    for (const [pid] of Object.entries(displayZones)) {
      const player = displayPlayers.find(p => p.id === pid);
      if (!player) continue;
      const role = player.role;
      coords[pid] = formPos[role]
        ? { ...formPos[role] }
        : { ...ZONE_ANCHORS[displayZones[pid]] };
    }
    return { ...coords, ...customCoords };
  }, [formation, view, displayPlayers, displayZones, customCoords]);

  // Ghost positions = zone anchors (rotational base)
  const ghostPositions = useMemo(() => {
    const ghosts: Record<string, CourtCoord> = {};
    for (const [pid, zone] of Object.entries(displayZones)) {
      ghosts[pid] = { ...ZONE_ANCHORS[zone] };
    }
    return ghosts;
  }, [displayZones]);

  const validation = useMemo(
    () => validateOverlap(coordinates, displayZones),
    [coordinates, displayZones]
  );

  const toggles: DisplayToggles = {
    showZones,
    showFrontBackRow: false,
    showOverlapLines,
    showRoleLabels: true,
    showBeginnerExplanations: false,
    showGhostPositions,
    showReceiveShape: false,
    showHomeBase: false,
  };

  const handlePlayerMove = useCallback((playerId: string, coord: CourtCoord) => {
    setCustomCoords(prev => ({ ...prev, [playerId]: coord }));
  }, []);

  const handleRotationChange = (idx: number) => {
    setRotationIndex(idx);
    setCustomCoords({});
  };

  const handleViewChange = (v: ViewMode) => {
    setView(v);
    setCustomCoords({});
  };

  const handleReset = () => setCustomCoords({});

  const hasCustom = Object.keys(customCoords).length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Rotation selector */}
      <div className="flex items-center justify-center gap-2">
        {FORMATIONS_5_1.map((f, i) => (
          <button
            key={f.name}
            onClick={() => handleRotationChange(i)}
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

      {/* Mobile drawer toggle */}
      <button
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="lg:hidden flex items-center justify-center gap-2 px-3 py-2 bg-surface rounded-lg text-text-secondary text-xs"
      >
        <span>{drawerOpen ? 'Hide' : 'Show'} Controls</span>
        <span className="text-[10px]">{drawerOpen ? '▲' : '▼'}</span>
      </button>

      {/* Court centered in viewport, sidebar absolute-right on desktop */}
      <div className="relative">

        {/* Center: Court — always centered */}
        <div className="max-w-xl mx-auto">
          <Court
            players={displayPlayers}
            zoneAssignments={displayZones}
            coordinates={coordinates}
            toggles={toggles}
            validation={validation}
            ghostPositions={showGhostPositions ? ghostPositions : undefined}
            draggable
            onPlayerMove={handlePlayerMove}
            containerClassName="w-full select-none"
          />

          {/* Validation + reset below court */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              validation.isLegal
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {validation.isLegal ? 'Legal' : `${validation.violations.filter(v => v.severity === 'illegal').length} Violation(s)`}
            </span>
            {hasCustom && (
              <button
                onClick={handleReset}
                className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                Reset positions
              </button>
            )}
          </div>

        </div>

        {/* Right: Controls sidebar — pinned to right on desktop */}
        <div className={`lg:absolute lg:top-0 lg:right-0 lg:w-[220px] space-y-3 ${drawerOpen ? 'block' : 'hidden'} lg:block`}>

          {/* View toggle */}
          <div className="bg-surface rounded-lg p-3 space-y-2">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">View</h4>
            <div className="flex gap-1">
              {([['base', 'Base'] as const, ['serve-receive', 'Serve Receive'] as const]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleViewChange(key)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                    view === key
                      ? 'bg-amber-400 text-deep'
                      : 'bg-elevated text-text-secondary hover:bg-hover'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Display toggles */}
          <div className="bg-surface rounded-lg p-3 space-y-2">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Display</h4>
            {([
              ['Zones', showZones, setShowZones] as const,
              ['Overlap Lines', showOverlapLines, setShowOverlapLines] as const,
              ['Ghost Positions', showGhostPositions, setShowGhostPositions] as const,
            ] as [string, boolean, (v: boolean) => void][]).map(([label, value, setter]) => (
              <button
                key={label}
                onClick={() => setter(!value)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-all ${
                  value
                    ? 'bg-amber-400/15 text-amber-400'
                    : 'bg-elevated/50 text-text-secondary hover:bg-elevated'
                }`}
              >
                <span>{label}</span>
                <span className="text-[10px]">{value ? 'ON' : 'OFF'}</span>
              </button>
            ))}
          </div>

          {/* Violations detail */}
          {!validation.isLegal && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-1">
              <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Violations</h4>
              {validation.violations.filter(v => v.severity === 'illegal').map((v, i) => (
                <p key={i} className="text-[10px] text-red-300">{v.message}</p>
              ))}
            </div>
          )}

          {/* Rotation info */}
          <div className="bg-surface rounded-lg p-3">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Rotation</h4>
            <div className="mt-1 text-sm font-display font-bold text-text-primary">
              5-1 {formation.name}
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              Setter Zone {formation.setterZone} &middot; {[2,3,4].includes(formation.setterZone) ? 'Front' : 'Back'} row
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
