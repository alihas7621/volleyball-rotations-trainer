import { useState, useMemo, useCallback } from 'react';
import type { Player, Zone, CourtCoord, DisplayToggles, System } from '../types';
import { getZoneAssignments, getDefaultCoordForZone, getRotationLabel } from '../logic/rotation';
import { validateOverlap, suggestCorrection } from '../logic/validation';
import Court from './Court';
import RotationControls from './RotationControls';
import ExplanationPanel from './ExplanationPanel';
import DisplayToggleBar from './DisplayToggleBar';

interface OverlapModeProps {
  players: Player[];
  startingZones: Record<string, Zone>;
  system: System;
}

export default function OverlapMode({ players, startingZones, system }: OverlapModeProps) {
  const [rotationIndex, setRotationIndex] = useState(0);
  const [customCoords, setCustomCoords] = useState<Record<string, CourtCoord>>({});
  const [toggles, setToggles] = useState<DisplayToggles>({
    showZones: true,
    showFrontBackRow: true,
    showOverlapLines: true,
    showRoleLabels: true,
    showBeginnerExplanations: false,
    showGhostPositions: true,
    showReceiveShape: false,
    showHomeBase: false,
  });

  const zones = useMemo(
    () => getZoneAssignments(startingZones, rotationIndex),
    [startingZones, rotationIndex]
  );

  const label = useMemo(
    () => getRotationLabel(system, rotationIndex, startingZones, players),
    [system, rotationIndex, startingZones, players]
  );

  const defaultCoords = useMemo(() => {
    const coords: Record<string, CourtCoord> = {};
    for (const [pid, zone] of Object.entries(zones)) {
      coords[pid] = getDefaultCoordForZone(zone);
    }
    return coords;
  }, [zones]);

  const coordinates = useMemo(
    () => ({ ...defaultCoords, ...customCoords }),
    [defaultCoords, customCoords]
  );

  const validation = useMemo(
    () => validateOverlap(coordinates, zones),
    [coordinates, zones]
  );

  const handlePlayerMove = useCallback((playerId: string, coord: CourtCoord) => {
    setCustomCoords(prev => ({ ...prev, [playerId]: coord }));
  }, []);

  const handleReset = () => setCustomCoords({});

  const handleShowCorrection = useCallback(() => {
    setCustomCoords(suggestCorrection(coordinates, zones));
  }, [coordinates, zones]);

  const handleRotationChange = (newIndex: number) => {
    setRotationIndex(newIndex);
    setCustomCoords({});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-primary font-display">Overlap Sandbox</h2>
        <p className="text-sm text-text-secondary">
          Drag players freely. Check legality at the moment of serve. No auto-snapping.
        </p>
      </div>

      <DisplayToggleBar toggles={toggles} onChange={setToggles} />

      <RotationControls
        rotationIndex={rotationIndex}
        label={label}
        onPrev={() => handleRotationChange(Math.max(0, rotationIndex - 1))}
        onNext={() => handleRotationChange(Math.min(5, rotationIndex + 1))}
      />

      <div className="flex justify-center gap-2 flex-wrap">
        <button onClick={handleReset}
          className="px-3 py-1.5 bg-hover hover:bg-elevated text-text-primary rounded-md text-xs transition-colors">
          Reset Positions
        </button>
        {!validation.isLegal && (
          <button onClick={handleShowCorrection}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs transition-colors">
            Show Legal Correction
          </button>
        )}
        <span className={`px-3 py-1.5 rounded-md text-xs font-bold ${
          validation.isLegal
            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {validation.isLegal ? 'Legal' : `${validation.violations.filter(v => v.severity === 'illegal').length} Violation(s)`}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Court
          players={players}
          zoneAssignments={zones}
          coordinates={coordinates}
          toggles={toggles}
          validation={validation}
          ghostPositions={defaultCoords}
          draggable
          onPlayerMove={handlePlayerMove}
        />

        <ExplanationPanel
          players={players}
          zoneAssignments={zones}
          label={label}
          system={system}
          validation={validation}
          toggles={toggles}
          onShowCorrection={handleShowCorrection}
        />
      </div>

      {/* Rules reference */}
      <div className="bg-surface rounded-lg p-3 text-[10px] text-text-secondary space-y-1">
        <h4 className="text-xs font-bold text-text-primary mb-1">Overlap Rules</h4>
        <p><strong className="text-amber-400">Left-Right (front):</strong> Z4 level/left of Z3, Z3 level/left of Z2</p>
        <p><strong className="text-amber-400">Left-Right (back):</strong> Z5 level/left of Z6, Z6 level/left of Z1</p>
        <p><strong className="text-amber-400">Front-Back:</strong> Z4 level/closer to net than Z5, Z3 than Z6, Z2 than Z1</p>
        <p className="text-text-muted mt-1">Validation uses bubble boundaries. Bubbles that overlap or are level are legal.</p>
      </div>
    </div>
  );
}
