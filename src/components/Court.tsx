import { useRef, useState, useCallback, useEffect } from 'react';
import type { Player, Zone, CourtCoord, DisplayToggles, ValidationResult, ViolationSeverity, Role } from '../types';
import { ROLE_ABBREV } from '../types';
import { ZONE_ANCHORS } from '../logic/rotation';
import { getAllRuleChecks } from '../logic/validation';
import PlayerToken from './PlayerToken';

interface CourtProps {
  players: Player[];
  zoneAssignments: Record<string, Zone>;
  coordinates: Record<string, CourtCoord>;
  toggles: DisplayToggles;
  validation?: ValidationResult;
  ghostPositions?: Record<string, CourtCoord>;
  hiddenPlayerIds?: string[];
  targetPositions?: { coord: CourtCoord; role: Role; correct?: boolean; hideLabel?: boolean }[];
  quizFeedback?: Record<string, { correct: boolean; message: string }>;
  draggable?: boolean;
  /** Override zone badge text per player. '' hides the badge. */
  zoneBadgeOverrides?: Record<string, string>;
  onPlayerMove?: (playerId: string, coord: CourtCoord) => void;
  containerClassName?: string;
}

const COURT_M = 9; // 9 meters per side

// Zone regions for drawing (in meters)
const ZONE_REGIONS: Record<Zone, { x: number; y: number; w: number; h: number; label: string }> = {
  4: { x: 0, y: 0, w: 3, h: 3, label: '4' },
  3: { x: 3, y: 0, w: 3, h: 3, label: '3' },
  2: { x: 6, y: 0, w: 3, h: 3, label: '2' },
  5: { x: 0, y: 3, w: 3, h: 6, label: '5' },
  6: { x: 3, y: 3, w: 3, h: 6, label: '6' },
  1: { x: 6, y: 3, w: 3, h: 6, label: '1' },
};

export default function Court({
  players,
  zoneAssignments,
  coordinates,
  toggles,
  validation,
  ghostPositions,
  hiddenPlayerIds = [],
  targetPositions,
  quizFeedback,
  draggable = false,
  zoneBadgeOverrides,
  onPlayerMove,
  containerClassName,
}: CourtProps) {
  const courtRef = useRef<HTMLDivElement>(null);
  const [courtRect, setCourtRect] = useState<DOMRect | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [liveCoords, setLiveCoords] = useState<Record<string, CourtCoord>>({});

  // Update court rect on resize
  useEffect(() => {
    const updateRect = () => {
      if (courtRef.current) setCourtRect(courtRef.current.getBoundingClientRect());
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, []);

  // Build violation lookup
  const violatingPlayers = new Map<string, ViolationSeverity>();
  if (validation) {
    for (const v of validation.violations) {
      const existing = violatingPlayers.get(v.playerA);
      if (!existing || v.severity === 'illegal') violatingPlayers.set(v.playerA, v.severity);
      const existingB = violatingPlayers.get(v.playerB);
      if (!existingB || v.severity === 'illegal') violatingPlayers.set(v.playerB, v.severity);
    }
  }

  // Rule check lines for visualization
  const allChecks = toggles.showOverlapLines
    ? getAllRuleChecks({ ...coordinates, ...liveCoords }, zoneAssignments)
    : [];

  const handleDragMove = useCallback((playerId: string, coord: CourtCoord) => {
    setDraggingId(playerId);
    setLiveCoords(prev => ({ ...prev, [playerId]: coord }));
  }, []);

  const handleDragEnd = useCallback((playerId: string, coord: CourtCoord) => {
    setDraggingId(null);
    setLiveCoords(prev => {
      const next = { ...prev };
      delete next[playerId];
      return next;
    });
    onPlayerMove?.(playerId, coord);
  }, [onPlayerMove]);

  // Coordinate helpers
  const mToPercent = (m: number) => (m / COURT_M) * 100;

  return (
    <div className={containerClassName || "w-full max-w-md mx-auto select-none"}>
      <div
        ref={courtRef}
        className="relative w-full aspect-square rounded-xl overflow-hidden shadow-2xl shadow-black/40"
        style={{ background: '#c66b22', border: '2px solid rgba(255,255,255,0.08)' }}
      >
        {/* ── Layer 1: Court surface ── */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #d9842e 0%, #c66b22 40%, #b86020 100%)' }} />

        {/* ── Layer 2: Zone regions ── */}
        {toggles.showZones && Object.entries(ZONE_REGIONS).map(([zone, r]) => (
          <div
            key={zone}
            className="absolute border border-white/20 flex items-center justify-center"
            style={{
              left: `${mToPercent(r.x)}%`,
              top: `${mToPercent(r.y)}%`,
              width: `${mToPercent(r.w)}%`,
              height: `${mToPercent(r.h)}%`,
              backgroundColor: [2, 3, 4].includes(Number(zone))
                ? 'rgba(59,130,246,0.08)'
                : 'rgba(45,212,191,0.06)',
            }}
          >
            <span className="text-white/20 text-2xl md:text-3xl font-bold font-mono">{r.label}</span>
          </div>
        ))}

        {/* ── Layer 3: Court lines (z-3) ── */}
        {/* Net (top edge) */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-white z-[3]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-0.5 bg-white/90 text-court-dark text-[9px] font-bold px-2.5 py-0.5 rounded-b-md z-[3] tracking-wide">
          NET
        </div>

        {/* Attack line (3m from net = 33.3%) */}
        <div
          className="absolute left-0 right-0 z-[3]"
          style={{ top: `${mToPercent(3)}%` }}
        >
          <div className="w-full border-t-2 border-dashed border-white/50" />
          <div className="absolute right-2 -top-4 text-[9px] text-white/40 font-semibold font-mono tracking-wide">
            ATTACK LINE
          </div>
        </div>

        {/* End line (bottom) */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/70 z-[3]" />

        {/* Sidelines */}
        <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-white/50 z-[3]" />
        <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-white/50 z-[3]" />

        {/* ── Layer 3.5: Target position outlines (quiz) ── */}
        {targetPositions?.map((target, i) => {
          const cx = mToPercent(target.coord.x);
          const cy = mToPercent(target.coord.y);
          const color = target.correct === true ? '#14b8a6' : target.correct === false ? '#ef4444' : 'rgba(255,255,255,0.4)';
          return (
            <div
              key={`target-${i}`}
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                left: `${cx}%`,
                top: `${cy}%`,
                transform: 'translate(-50%, -50%)',
                width: '12%',
                height: '12%',
                borderRadius: '50%',
                border: `2px dashed ${color}`,
                backgroundColor: target.correct === true ? 'rgba(20,184,166,0.1)' : target.correct === false ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                zIndex: 4,
              }}
            >
              {!target.hideLabel && (
                <span className="text-[9px] md:text-[10px] font-bold" style={{ color }}>
                  {ROLE_ABBREV[target.role]}
                </span>
              )}
            </div>
          );
        })}

        {/* ── Layer 4: Ghost rotational anchors ── */}
        {toggles.showGhostPositions && players.map(player => {
          if (hiddenPlayerIds.includes(player.id)) return null;
          const zone = zoneAssignments[player.id];
          if (!zone) return null;
          const ghostCoord = ghostPositions?.[player.id] || ZONE_ANCHORS[zone];
          return (
            <PlayerToken
              key={`ghost-${player.id}`}
              player={player}
              zone={zone}
              coord={ghostCoord}
              courtRect={courtRect}
              showRole={false}
              isGhost
            />
          );
        })}

        {/* ── Layer 5: Overlap relationship lines ── */}
        {toggles.showOverlapLines && courtRect && (
          <svg className="absolute inset-0 w-full h-full z-[6] pointer-events-none">
            {allChecks.map((check, i) => {
              if (!check.playerA || !check.playerB) return null;
              const cA = liveCoords[check.playerA] || coordinates[check.playerA];
              const cB = liveCoords[check.playerB] || coordinates[check.playerB];
              if (!cA || !cB) return null;

              const x1 = (cA.x / COURT_M) * 100;
              const y1 = (cA.y / COURT_M) * 100;
              const x2 = (cB.x / COURT_M) * 100;
              const y2 = (cB.y / COURT_M) * 100;

              const color = check.severity === 'illegal' ? '#ef4444'
                : check.severity === 'close' ? '#f59e0b'
                : '#14b8a6';

              return (
                <line
                  key={i}
                  x1={`${x1}%`} y1={`${y1}%`}
                  x2={`${x2}%`} y2={`${y2}%`}
                  stroke={color}
                  strokeWidth={check.severity === 'illegal' ? 2.5 : 1.5}
                  strokeDasharray={check.rule.type === 'front-back' ? '6,4' : 'none'}
                  opacity={0.7}
                />
              );
            })}
          </svg>
        )}

        {/* ── Layer 6: Player tokens ── */}
        {players.map(player => {
          if (hiddenPlayerIds.includes(player.id)) return null;
          const zone = zoneAssignments[player.id];
          if (!zone) return null;
          const coord = liveCoords[player.id] || coordinates[player.id] || ZONE_ANCHORS[zone];
          const fb = quizFeedback?.[player.id];

          return (
            <PlayerToken
              key={player.id}
              player={player}
              zone={zone}
              coord={coord}
              courtRect={courtRect}
              showRole={toggles.showRoleLabels}
              isDraggable={draggable}
              isDragging={draggingId === player.id}
              violationSeverity={violatingPlayers.get(player.id)}
              feedback={fb?.message}
              zoneBadgeOverride={zoneBadgeOverrides?.[player.id]}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </div>

    </div>
  );
}
