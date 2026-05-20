import { useState, useMemo, useCallback } from 'react';
import type { Player, Zone, CourtCoord, DisplayToggles, System } from '../types';
import { getZoneAssignments, getRotationLabel, ZONE_ANCHORS } from '../logic/rotation';
import { validateOverlap } from '../logic/validation';
import { SERVE_RECEIVE_PRESETS, getRotationTemplate } from '../logic/serveReceiveShapes';
import Court from './Court';
import RotationControls from './RotationControls';
import DisplayToggleBar from './DisplayToggleBar';
import { trackEvent } from '../lib/analytics';

interface ServeReceiveModeProps {
  players: Player[];
  startingZones: Record<string, Zone>;
  system: System;
}

export default function ServeReceiveMode({ players, startingZones, system }: ServeReceiveModeProps) {
  const [rotationIndex, setRotationIndex] = useState(0);
  const [customCoords, setCustomCoords] = useState<Record<string, CourtCoord>>({});
  const [activePreset, setActivePreset] = useState(1); // default: 3-person receive
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

  const template = useMemo(
    () => getRotationTemplate(rotationIndex),
    [rotationIndex]
  );

  const presetCoords = useMemo(
    () => SERVE_RECEIVE_PRESETS[activePreset].getPositions(zones, players, system, rotationIndex),
    [zones, players, system, activePreset, rotationIndex]
  );

  const coordinates = useMemo(
    () => ({ ...presetCoords, ...customCoords }),
    [presetCoords, customCoords]
  );

  const ghostPositions = useMemo(() => {
    const ghosts: Record<string, CourtCoord> = {};
    for (const [pid, zone] of Object.entries(zones)) {
      ghosts[pid] = { ...ZONE_ANCHORS[zone] };
    }
    return ghosts;
  }, [zones]);

  const validation = useMemo(
    () => validateOverlap(coordinates, zones),
    [coordinates, zones]
  );

  const handlePlayerMove = useCallback((playerId: string, coord: CourtCoord) => {
    setCustomCoords(prev => ({ ...prev, [playerId]: coord }));
  }, []);

  const handlePresetChange = (idx: number) => {
    setActivePreset(idx);
    setCustomCoords({});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-primary font-display">Serve Receive Builder</h2>
        <p className="text-sm text-text-secondary">
          {system} {label.name}: Rotation-specific receive formations
        </p>
      </div>

      <DisplayToggleBar toggles={toggles} onChange={setToggles} />

      <RotationControls
        rotationIndex={rotationIndex}
        label={label}
        onPrev={() => { const idx = Math.max(0, rotationIndex - 1); setRotationIndex(idx); setCustomCoords({}); trackEvent('change_rotation', { rotation: `P${idx + 1}`, system }); }}
        onNext={() => { const idx = Math.min(5, rotationIndex + 1); setRotationIndex(idx); setCustomCoords({}); trackEvent('change_rotation', { rotation: `P${idx + 1}`, system }); }}
      />

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {SERVE_RECEIVE_PRESETS.map((preset, i) => (
          <button
            key={preset.name}
            onClick={() => handlePresetChange(i)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activePreset === i ? 'bg-amber-400 text-deep' : 'bg-elevated text-text-secondary hover:bg-hover'
            }`}
            title={preset.description}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Validation badge */}
      <div className="flex justify-center">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          validation.isLegal
            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {validation.isLegal ? 'Legal Formation' : `${validation.violations.filter(v => v.severity === 'illegal').length} Violation(s)`}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Court
          players={players}
          zoneAssignments={zones}
          coordinates={coordinates}
          toggles={toggles}
          validation={validation}
          ghostPositions={ghostPositions}
          draggable
          onPlayerMove={handlePlayerMove}
        />

        <div className="space-y-3">
          {/* Rotation-specific template info */}
          <div className="bg-surface rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-bold text-text-primary">{template.name}</h4>
            <p className="text-xs text-text-secondary">{template.description}</p>
            <div className="bg-elevated/50 rounded p-2">
              <p className="text-[10px] text-text-secondary leading-relaxed">{template.explanation}</p>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                Passers: {template.passers.join(', ')}
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                template.setter === 'front'
                  ? 'bg-teal-500/20 text-teal-300'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                Setter: {template.setter === 'front' ? 'front row (no release)' : 'back row (must release)'}
              </span>
            </div>
          </div>

          {!validation.isLegal && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-1">
              <h4 className="text-xs font-bold text-red-400">Violations</h4>
              {validation.violations.filter(v => v.severity === 'illegal').map((v, i) => (
                <p key={i} className="text-[10px] text-red-300">{v.message}</p>
              ))}
            </div>
          )}

          <button
            onClick={() => setCustomCoords({})}
            className="w-full px-3 py-1.5 bg-hover hover:bg-elevated text-text-primary rounded-md text-xs transition-colors"
          >
            Reset to Preset
          </button>
        </div>
      </div>
    </div>
  );
}
