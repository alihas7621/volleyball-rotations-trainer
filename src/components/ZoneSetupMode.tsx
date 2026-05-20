import { useState, useMemo, useCallback, useRef } from 'react';
import type { CourtCoord } from '../types';
import { BACK_ROW_ZONES, ROLE_ABBREV } from '../types';
import { getZoneAssignments, ZONE_ANCHORS } from '../logic/rotation';
import { FORMATIONS_5_1 } from '../data/formations';
import { DEFAULT_PLAYERS, LIBERO_PLAYER, DEFAULT_STARTING_ZONES_5_1 } from '../data/defaultTeam';

/**
 * Tolerance Zone Setup: Draw freehand polygons to define valid serve-receive areas.
 *
 * 1. Select a rotation (P1-P6)
 * 2. Click a player to select them
 * 3. Click points on the court to draw a polygon outline
 * 4. Click "Close Shape" or click near the first point to finish
 * 5. Export all polygons as JSON
 */

const COURT_M = 9;

interface PolygonData {
  [rotation: string]: {
    [role: string]: {
      center: CourtCoord;
      polygon: CourtCoord[];
    };
  };
}

export default function ZoneSetupMode() {
  const [rotationIndex, setRotationIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [drawingPoints, setDrawingPoints] = useState<CourtCoord[]>([]);
  const courtRef = useRef<HTMLDivElement>(null);

  // Store completed polygons: key = `${rotationIndex}-${role}` → CourtCoord[]
  const [polygons, setPolygons] = useState<Record<string, CourtCoord[]>>({});

  const formation = FORMATIONS_5_1[rotationIndex];
  const zones = useMemo(
    () => getZoneAssignments(DEFAULT_STARTING_ZONES_5_1, rotationIndex),
    [rotationIndex]
  );

  const displayPlayers = useMemo(() => {
    const updated = [...DEFAULT_PLAYERS];
    for (const [pid, zone] of Object.entries(zones)) {
      if (!BACK_ROW_ZONES.includes(zone)) continue;
      const player = updated.find(p => p.id === pid);
      if (!player) continue;
      if (player.role === 'MB1' || player.role === 'MB2') {
        const idx = updated.findIndex(p => p.id === pid);
        if (idx >= 0) updated[idx] = { ...LIBERO_PLAYER, id: pid };
      }
    }
    return updated;
  }, [zones]);

  const coordinates = useMemo(() => {
    const coords: Record<string, CourtCoord> = {};
    for (const [pid] of Object.entries(zones)) {
      const player = displayPlayers.find(p => p.id === pid);
      if (!player) continue;
      const pos = formation.serveReceive[player.role];
      if (pos) coords[pid] = { ...pos };
      else coords[pid] = { ...ZONE_ANCHORS[zones[pid]] };
    }
    return coords;
  }, [formation, displayPlayers, zones]);

  const selectedPlayer = selectedPlayerId ? displayPlayers.find(p => p.id === selectedPlayerId) : null;

  const mToPercent = (m: number) => (m / COURT_M) * 100;

  const finishPolygon = useCallback(() => {
    if (!selectedPlayerId || drawingPoints.length < 3) return;
    const player = displayPlayers.find(p => p.id === selectedPlayerId);
    if (!player) return;
    const key = `${rotationIndex}-${player.role}`;
    setPolygons(prev => ({ ...prev, [key]: [...drawingPoints] }));
    setDrawingPoints([]);
    setSelectedPlayerId(null);
  }, [selectedPlayerId, drawingPoints, displayPlayers, rotationIndex]);

  // Convert click on court to court meters
  const handleCourtClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedPlayerId || !courtRef.current) return;
    const rect = courtRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * COURT_M;
    const y = ((e.clientY - rect.top) / rect.height) * COURT_M;
    const point = { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };

    // If clicking near first point and we have 3+ points, close the polygon
    if (drawingPoints.length >= 3) {
      const first = drawingPoints[0];
      const dist = Math.sqrt((point.x - first.x) ** 2 + (point.y - first.y) ** 2);
      if (dist < 0.5) {
        finishPolygon();
        return;
      }
    }

    setDrawingPoints(prev => [...prev, point]);
  }, [selectedPlayerId, drawingPoints, finishPolygon]);

  const handleSelectPlayer = useCallback((pid: string) => {
    if (selectedPlayerId === pid) {
      // Deselect
      setSelectedPlayerId(null);
      setDrawingPoints([]);
    } else {
      // Select new player, load existing polygon as starting points
      setSelectedPlayerId(pid);
      setDrawingPoints([]);
    }
  }, [selectedPlayerId]);

  const handleClearPolygon = useCallback(() => {
    if (!selectedPlayerId) return;
    const player = displayPlayers.find(p => p.id === selectedPlayerId);
    if (!player) return;
    const key = `${rotationIndex}-${player.role}`;
    setPolygons(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setDrawingPoints([]);
  }, [selectedPlayerId, displayPlayers, rotationIndex]);

  const handleUndo = useCallback(() => {
    setDrawingPoints(prev => prev.slice(0, -1));
  }, []);

  const handleExport = useCallback(() => {
    const exportData: PolygonData = {};
    for (let r = 0; r < 6; r++) {
      const f = FORMATIONS_5_1[r];
      const rZones = getZoneAssignments(DEFAULT_STARTING_ZONES_5_1, r);
      const players = [...DEFAULT_PLAYERS];
      for (const [pid, zone] of Object.entries(rZones)) {
        if (!BACK_ROW_ZONES.includes(zone)) continue;
        const player = players.find(p => p.id === pid);
        if (!player) continue;
        if (player.role === 'MB1' || player.role === 'MB2') {
          const idx = players.findIndex(p => p.id === pid);
          if (idx >= 0) players[idx] = { ...LIBERO_PLAYER, id: pid };
        }
      }

      const rotData: Record<string, { center: CourtCoord; polygon: CourtCoord[] }> = {};
      for (const [pid] of Object.entries(rZones)) {
        const player = players.find(p => p.id === pid);
        if (!player) continue;
        const pos = f.serveReceive[player.role];
        if (!pos) continue;
        const key = `${r}-${player.role}`;
        rotData[player.role] = {
          center: { x: Math.round(pos.x * 100) / 100, y: Math.round(pos.y * 100) / 100 },
          polygon: polygons[key] || [],
        };
      }
      exportData[f.name] = rotData;
    }

    const json = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
    console.log('=== TOLERANCE ZONE EXPORT ===');
    console.log(json);
  }, [polygons]);

  // Count completed polygons for this rotation
  const completedCount = displayPlayers.filter(p => {
    const key = `${rotationIndex}-${p.role}`;
    return polygons[key] && polygons[key].length >= 3;
  }).length;

  // SVG polygon points string
  const toSvgPoints = (pts: CourtCoord[]) =>
    pts.map(p => `${mToPercent(p.x)},${mToPercent(p.y)}`).join(' ');

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-primary font-display">Setup: Tolerance Zones</h2>
        <p className="text-sm text-text-secondary">
          Select a player, then click on the court to draw their valid area. Click near the start to close.
        </p>
      </div>

      {/* Rotation selector */}
      <div className="flex items-center justify-center gap-2">
        {FORMATIONS_5_1.map((f, i) => (
          <button
            key={f.name}
            onClick={() => { setRotationIndex(i); setSelectedPlayerId(null); setDrawingPoints([]); }}
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 items-start">
        {/* Court */}
        <div
          ref={courtRef}
          className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-hover shadow-2xl cursor-crosshair"
          style={{ background: '#c66b22' }}
          onClick={handleCourtClick}
        >
          {/* Court surface */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #d9842e 0%, #c66b22 40%, #b86020 100%)' }} />

          {/* Court lines */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-white z-[3]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-1 bg-white text-[#8B4513] text-[9px] font-bold px-2 py-0.5 rounded-b z-[3]">
            NET
          </div>
          <div className="absolute left-0 right-0 border-t-2 border-dashed border-white/60 z-[3]" style={{ top: `${mToPercent(3)}%` }} />
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/70 z-[3]" />
          <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-white/50 z-[3]" />
          <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-white/50 z-[3]" />

          {/* Completed polygons */}
          <svg className="absolute inset-0 w-full h-full z-[4] pointer-events-none">
            {displayPlayers.map(player => {
              const key = `${rotationIndex}-${player.role}`;
              const pts = polygons[key];
              if (!pts || pts.length < 3) return null;
              return (
                <polygon
                  key={key}
                  points={toSvgPoints(pts)}
                  fill={`${player.color}20`}
                  stroke={player.color}
                  strokeWidth="2"
                  strokeDasharray="6,3"
                  opacity="0.7"
                />
              );
            })}

            {/* Drawing-in-progress polygon */}
            {drawingPoints.length >= 2 && (
              <polyline
                points={toSvgPoints(drawingPoints)}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="4,2"
              />
            )}
            {/* Drawing-in-progress: line from last point to show direction */}
            {drawingPoints.length >= 1 && drawingPoints.length < 20 && (
              <>
                {/* Dots at each vertex */}
                {drawingPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={`${mToPercent(pt.x)}%`}
                    cy={`${mToPercent(pt.y)}%`}
                    r="4"
                    fill={i === 0 ? '#22c55e' : '#fbbf24'}
                    stroke="white"
                    strokeWidth="1"
                  />
                ))}
              </>
            )}
          </svg>

          {/* Player tokens */}
          {displayPlayers.map(player => {
            const coord = coordinates[player.id];
            if (!coord) return null;
            const isSelected = selectedPlayerId === player.id;
            const key = `${rotationIndex}-${player.role}`;
            const hasPolygon = polygons[key] && polygons[key].length >= 3;
            return (
              <div
                key={player.id}
                className="absolute flex flex-col items-center z-[10] cursor-pointer"
                style={{
                  left: `${mToPercent(coord.x)}%`,
                  top: `${mToPercent(coord.y)}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={(e) => { e.stopPropagation(); handleSelectPlayer(player.id); }}
              >
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-white text-sm md:text-base shadow-lg border-2"
                  style={{
                    backgroundColor: player.color,
                    borderColor: isSelected ? '#fbbf24' : hasPolygon ? '#22c55e' : 'rgba(255,255,255,0.3)',
                    boxShadow: isSelected ? '0 0 16px #fbbf24' : hasPolygon ? '0 0 8px #22c55e' : '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  {player.number}
                </div>
                <div className="text-[8px] md:text-[9px] font-bold px-1 rounded mt-0.5" style={{ backgroundColor: player.color, color: 'white' }}>
                  {ROLE_ABBREV[player.role]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Drawing status */}
          {selectedPlayer && (
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg p-3 space-y-2">
              <h4 className="text-xs font-bold text-amber-400">
                Drawing: {ROLE_ABBREV[selectedPlayer.role]} (#{selectedPlayer.number})
              </h4>
              <p className="text-[10px] text-text-secondary">
                Click on the court to add points. {drawingPoints.length} point{drawingPoints.length !== 1 ? 's' : ''} placed.
                {drawingPoints.length >= 3 && ' Click near the green dot to close, or press Close Shape.'}
              </p>
              <div className="flex gap-1">
                {drawingPoints.length >= 3 && (
                  <button
                    onClick={finishPolygon}
                    className="px-2 py-1 bg-teal-500 text-white rounded text-[10px] font-bold"
                  >
                    Close Shape
                  </button>
                )}
                {drawingPoints.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="px-2 py-1 bg-elevated text-text-secondary rounded text-[10px]"
                  >
                    Undo
                  </button>
                )}
                <button
                  onClick={handleClearPolygon}
                  className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-[10px]"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {!selectedPlayer && (
            <div className="bg-surface rounded-lg p-3">
              <p className="text-[10px] text-text-secondary">
                Click a player on the court to start drawing their tolerance zone.
              </p>
            </div>
          )}

          {/* Player list */}
          <div className="bg-surface rounded-lg p-3">
            <h4 className="text-xs font-bold text-text-primary mb-2">
              {formation.name} — {completedCount}/{displayPlayers.length} zones defined
            </h4>
            {displayPlayers.map(player => {
              const zone = zones[player.id];
              if (!zone) return null;
              const key = `${rotationIndex}-${player.role}`;
              const hasPolygon = polygons[key] && polygons[key].length >= 3;
              const pointCount = polygons[key]?.length ?? 0;
              return (
                <button
                  key={player.id}
                  onClick={() => handleSelectPlayer(player.id)}
                  className={`w-full flex items-center gap-2 mb-1 text-xs px-2 py-1 rounded transition-all ${
                    selectedPlayerId === player.id
                      ? 'bg-amber-400/15 text-amber-400'
                      : hasPolygon
                      ? 'bg-teal-500/10 text-teal-400'
                      : 'text-text-secondary hover:bg-elevated'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.number}
                  </div>
                  <span>{ROLE_ABBREV[player.role]}</span>
                  <span className="ml-auto text-[10px]">
                    {hasPolygon ? `${pointCount} pts` : '—'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-bold text-sm transition-colors"
          >
            {copied ? 'Copied to Clipboard!' : 'Export Tolerance Zones (JSON)'}
          </button>

          <p className="text-[10px] text-text-muted">
            Also logged to console. Configure all 6 rotations, then export.
          </p>
        </div>
      </div>
    </div>
  );
}
