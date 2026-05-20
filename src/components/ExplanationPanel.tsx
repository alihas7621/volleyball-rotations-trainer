import type { Player, Zone, ValidationResult, DisplayToggles, System, RotationLabel } from '../types';
import { ROLE_ABBREV } from '../types';
import { isFrontRow, ZONE_FULL_LABELS, getPlayerOverlapExplanation } from '../logic/rotation';

interface ExplanationPanelProps {
  players: Player[];
  zoneAssignments: Record<string, Zone>;
  label: RotationLabel;
  system: System;
  validation?: ValidationResult;
  toggles: DisplayToggles;
  onShowCorrection?: () => void;
}

export default function ExplanationPanel({
  players,
  zoneAssignments,
  label,
  system,
  validation,
  toggles,
  onShowCorrection,
}: ExplanationPanelProps) {
  const serverId = Object.entries(zoneAssignments).find(([, z]) => z === 1)?.[0];
  const serverPlayer = players.find(p => p.id === serverId);

  const frontRow = Object.entries(zoneAssignments)
    .filter(([, z]) => isFrontRow(z))
    .sort(([, a], [, b]) => a - b)
    .map(([id, z]) => ({ player: players.find(p => p.id === id)!, zone: z }))
    .filter(e => e.player);

  const backRow = Object.entries(zoneAssignments)
    .filter(([, z]) => !isFrontRow(z))
    .sort(([, a], [, b]) => {
      const order: Zone[] = [5, 6, 1];
      return order.indexOf(a) - order.indexOf(b);
    })
    .map(([id, z]) => ({ player: players.find(p => p.id === id)!, zone: z }))
    .filter(e => e.player);

  return (
    <div className="bg-surface rounded-lg p-4 text-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-text-primary font-display">
          {system} {label.name}
        </h3>
        {validation && (
          <span className={`px-2 py-1 rounded text-xs font-bold ${
            validation.isLegal ? 'bg-teal-500/20 text-teal-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {validation.isLegal ? 'LEGAL' : 'ILLEGAL'}
          </span>
        )}
      </div>

      {/* Setter status */}
      <div className="bg-elevated/50 rounded p-2 text-xs">
        <span className="text-text-secondary">Setter:</span>
        <span className="ml-1 text-yellow-400 font-medium">
          Z{label.setterZone} ({label.setterFrontRow ? 'front row' : 'back row'})
        </span>
        {label.activeSetter && (
          <>
            <br />
            <span className="text-text-secondary">Active (6-2):</span>
            <span className="ml-1 text-purple-400">{label.activeSetter}</span>
          </>
        )}
      </div>

      {/* Server */}
      <div className="bg-elevated/50 rounded p-2 text-xs">
        <span className="text-text-secondary">Server:</span>
        <span className="ml-1 text-text-primary font-medium">
          #{serverPlayer?.number} {serverPlayer?.name} ({ROLE_ABBREV[serverPlayer?.role ?? 'S']})
        </span>
      </div>

      {/* Front row */}
      <div>
        <div className="text-xs text-blue-400 font-medium mb-1">Front Row</div>
        {frontRow.map(({ player, zone }) => (
          <div key={player.id} className="flex items-center gap-2 text-text-secondary text-xs mb-0.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ backgroundColor: player.color }}>
              {player.number}
            </div>
            <span className="text-text-primary">{player.name}</span>
            <span className="text-text-muted">{ROLE_ABBREV[player.role]} &middot; Z{zone} {ZONE_FULL_LABELS[zone]}</span>
          </div>
        ))}
      </div>

      {/* Back row */}
      <div>
        <div className="text-xs text-teal-400 font-medium mb-1">Back Row</div>
        {backRow.map(({ player, zone }) => (
          <div key={player.id} className="flex items-center gap-2 text-text-secondary text-xs mb-0.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ backgroundColor: player.color }}>
              {player.number}
            </div>
            <span className="text-text-primary">{player.name}</span>
            <span className="text-text-muted">{ROLE_ABBREV[player.role]} &middot; Z{zone} {ZONE_FULL_LABELS[zone]}</span>
          </div>
        ))}
      </div>

      {/* Violations */}
      {validation && !validation.isLegal && (
        <div className="bg-red-500/10 border border-red-500/30 rounded p-2 space-y-1">
          <div className="text-red-400 font-bold text-xs">Overlap Violations</div>
          {validation.violations.map((v, i) => (
            <div key={i} className={`text-xs ${v.severity === 'illegal' ? 'text-red-300' : 'text-amber-300'}`}>
              {v.message} ({v.marginMeters > 0 ? `${v.marginMeters.toFixed(2)}m margin` : `${Math.abs(v.marginMeters).toFixed(2)}m overlap`})
            </div>
          ))}
          {onShowCorrection && (
            <button
              onClick={onShowCorrection}
              className="mt-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-2 py-1 rounded transition-colors"
            >
              Show Legal Correction
            </button>
          )}
        </div>
      )}

      {/* Beginner overlap explanations */}
      {toggles.showBeginnerExplanations && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 space-y-1">
          <div className="text-blue-400 font-bold text-xs">Overlap Relationships</div>
          {Object.entries(zoneAssignments).map(([id]) => {
            const explanation = getPlayerOverlapExplanation(id, zoneAssignments, players);
            if (!explanation) return null;
            return (
              <p key={id} className="text-text-secondary text-[10px] leading-relaxed">{explanation}</p>
            );
          })}
          <p className="text-text-muted text-[10px] mt-1">
            These rules apply at the moment of serve contact only. After serve, players release to base positions.
          </p>
        </div>
      )}
    </div>
  );
}
