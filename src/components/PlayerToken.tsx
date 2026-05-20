import { useRef, useCallback } from 'react';
import type { Player, Zone, CourtCoord, ViolationSeverity } from '../types';
import { ROLE_ABBREV } from '../types';

interface PlayerTokenProps {
  player: Player;
  zone: Zone;
  coord: CourtCoord; // court meters (0-9)
  courtRect: DOMRect | null;
  showRole: boolean;
  isGhost?: boolean;
  isDraggable?: boolean;
  violationSeverity?: ViolationSeverity;
  feedback?: string;
  isDragging?: boolean;
  /** Override the zone badge text. Set to '' to hide badge entirely. */
  zoneBadgeOverride?: string;
  onDragMove?: (playerId: string, coord: CourtCoord) => void;
  onDragEnd?: (playerId: string, coord: CourtCoord) => void;
}

// Court dimensions for coordinate conversion
const COURT_W = 9;
const COURT_H = 9;

function courtToPixel(coord: CourtCoord, rect: DOMRect): { px: number; py: number } {
  return {
    px: (coord.x / COURT_W) * rect.width,
    py: (coord.y / COURT_H) * rect.height,
  };
}

function pixelToCourt(px: number, py: number, rect: DOMRect): CourtCoord {
  return {
    x: Math.max(0.2, Math.min(8.8, (px / rect.width) * COURT_W)),
    y: Math.max(0.2, Math.min(8.8, (py / rect.height) * COURT_H)),
  };
}

export default function PlayerToken({
  player,
  zone,
  coord,
  courtRect,
  showRole,
  isGhost = false,
  isDraggable = false,
  violationSeverity,
  feedback,
  isDragging = false,
  zoneBadgeOverride,
  onDragMove,
  onDragEnd,
}: PlayerTokenProps) {
  const draggingRef = useRef(false);
  // Store pointer offset from bubble center on pointerdown to prevent jump
  const offsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isDraggable || !courtRect) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    // Compute offset between pointer and bubble center in pixel space
    const { px, py } = courtToPixel(coord, courtRect);
    const pointerX = e.clientX - courtRect.left;
    const pointerY = e.clientY - courtRect.top;
    offsetRef.current = { dx: pointerX - px, dy: pointerY - py };

    draggingRef.current = true;
  }, [isDraggable, courtRect, coord]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current || !courtRect || !onDragMove) return;
    e.preventDefault();
    // Subtract stored offset so bubble stays under finger
    const px = e.clientX - courtRect.left - offsetRef.current.dx;
    const py = e.clientY - courtRect.top - offsetRef.current.dy;
    const newCoord = pixelToCourt(px, py, courtRect);
    onDragMove(player.id, newCoord);
  }, [courtRect, onDragMove, player.id]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current || !courtRect) return;
    draggingRef.current = false;
    const px = e.clientX - courtRect.left - offsetRef.current.dx;
    const py = e.clientY - courtRect.top - offsetRef.current.dy;
    const newCoord = pixelToCourt(px, py, courtRect);
    onDragEnd?.(player.id, newCoord);
  }, [courtRect, onDragEnd, player.id]);

  if (!courtRect) return null;

  const { px, py } = courtToPixel(coord, courtRect);

  // Border color based on violation severity
  let borderColor = 'rgba(255,255,255,0.3)';
  let glowShadow = '';
  if (violationSeverity === 'illegal') {
    borderColor = '#ef4444';
    glowShadow = '0 0 12px #ef4444';
  } else if (violationSeverity === 'close') {
    borderColor = '#f59e0b';
    glowShadow = '0 0 8px #f59e0b';
  }

  // Ghost styling
  if (isGhost) {
    return (
      <div
        className="absolute pointer-events-none flex flex-col items-center"
        style={{
          left: px,
          top: py,
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
        }}
      >
        <div
          className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 border-dashed"
          style={{
            borderColor: `${player.color}80`,
            backgroundColor: `${player.color}15`,
          }}
        >
          <span className="text-[10px] md:text-xs font-bold font-mono" style={{ color: `${player.color}90` }}>
            Z{zone}
          </span>
        </div>
        <div className="text-[8px] md:text-[9px] mt-0.5 px-1 rounded bg-black/30" style={{ color: `${player.color}80` }}>
          {ROLE_ABBREV[player.role]} - {player.name}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute flex flex-col items-center touch-none ${
        isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{
        left: px,
        top: py,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 50 : 10,
        transition: isDragging ? 'none' : 'left 0.5s ease-in-out, top 0.5s ease-in-out',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Player circle */}
      <div
        className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-white text-sm md:text-base shadow-lg border-2"
        style={{
          backgroundColor: player.color,
          borderColor,
          boxShadow: glowShadow || '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {player.number}
      </div>

      {/* Name */}
      <div className="mt-0.5 text-[9px] md:text-[10px] font-medium text-text-primary bg-black/60 px-1 py-0.5 rounded whitespace-nowrap">
        {player.name}
      </div>

      {/* Role label */}
      {showRole && (
        <div
          className="text-[8px] md:text-[9px] font-bold px-1 rounded"
          style={{ backgroundColor: player.color, color: 'white' }}
        >
          {ROLE_ABBREV[player.role]}
        </div>
      )}

      {/* Zone badge */}
      {(zoneBadgeOverride === undefined || zoneBadgeOverride !== '') && (
        <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-text-primary text-deep rounded-full text-[8px] md:text-[9px] font-bold font-mono flex items-center justify-center shadow">
          {zoneBadgeOverride !== undefined ? zoneBadgeOverride : zone}
        </div>
      )}

      {/* Feedback tooltip */}
      {feedback && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-deep text-text-primary text-[9px] px-2 py-1 rounded-lg shadow-lg whitespace-nowrap max-w-[220px] text-wrap z-50 border border-elevated">
          {feedback}
        </div>
      )}
    </div>
  );
}
