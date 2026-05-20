import { useState, useMemo, useCallback } from 'react';
import type { Player, Zone, CourtCoord, DisplayToggles, Difficulty, Challenge, System } from '../types';
import { getZoneAssignments, getDefaultCoordForZone, getRotationLabel } from '../logic/rotation';
import { validateOverlap } from '../logic/validation';
import { generateChallenge, getNextServerId } from '../logic/challenge';
import Court from './Court';
import DisplayToggleBar from './DisplayToggleBar';

interface ChallengeModeProps {
  players: Player[];
  startingZones: Record<string, Zone>;
  system: System;
}

export default function ChallengeMode({ players, startingZones, system }: ChallengeModeProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [customCoords, setCustomCoords] = useState<Record<string, CourtCoord>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [stats, setStats] = useState({ streak: 0, best: 0, total: 0, correct: 0 });
  const [toggles, setToggles] = useState<DisplayToggles>({
    showZones: true,
    showFrontBackRow: false,
    showOverlapLines: false,
    showRoleLabels: true,
    showBeginnerExplanations: false,
    showGhostPositions: false,
    showReceiveShape: false,
    showHomeBase: false,
  });

  const zones = useMemo(() => {
    if (!challenge) return getZoneAssignments(startingZones, 0);
    return getZoneAssignments(startingZones, challenge.rotationIndex);
  }, [startingZones, challenge]);

  const coordinates = useMemo(() => {
    const coords: Record<string, CourtCoord> = {};
    if (challenge?.initialPositions) {
      for (const [pid, coord] of Object.entries(challenge.initialPositions)) {
        coords[pid] = coord;
      }
    } else {
      for (const [pid, zone] of Object.entries(zones)) {
        coords[pid] = getDefaultCoordForZone(zone);
      }
    }
    return { ...coords, ...customCoords };
  }, [zones, challenge, customCoords]);

  const validation = useMemo(
    () => validateOverlap(coordinates, zones),
    [coordinates, zones]
  );

  // Hide overlap lines before submission to prevent cheating
  const effectiveToggles = useMemo(() => ({
    ...toggles,
    showOverlapLines: submitted ? toggles.showOverlapLines : false,
  }), [toggles, submitted]);

  const startChallenge = useCallback(() => {
    setChallenge(generateChallenge(players, startingZones, difficulty, system));
    setCustomCoords({});
    setSelectedAnswer(null);
    setSubmitted(false);
    setResult(null);
  }, [players, startingZones, difficulty, system]);

  const handlePlayerMove = useCallback((playerId: string, coord: CourtCoord) => {
    if (submitted) return;
    setCustomCoords(prev => ({ ...prev, [playerId]: coord }));
  }, [submitted]);

  const handleSubmit = useCallback(() => {
    if (!challenge) return;
    setSubmitted(true);

    let correct = false;
    let message = '';

    switch (challenge.type) {
      case 'build_serve_receive':
      case 'rotate_and_place':
      case 'find_overlap_fault': {
        correct = validation.isLegal;
        message = correct
          ? 'Legal formation! Well done.'
          : `Illegal: ${validation.violations.filter(v => v.severity === 'illegal').map(v => v.message).join('. ')}`;
        break;
      }
      case 'who_serves_next': {
        const nextServer = getNextServerId(players, startingZones, challenge.rotationIndex);
        const nextPlayer = players.find(p => p.id === nextServer);
        correct = selectedAnswer === nextServer;
        message = correct
          ? `Correct! #${nextPlayer?.number} ${nextPlayer?.name} serves next.`
          : `Wrong. #${nextPlayer?.number} ${nextPlayer?.name} serves next after rotation.`;
        break;
      }
      case 'is_lineup_legal': {
        correct = (selectedAnswer === 'legal') === validation.isLegal;
        message = validation.isLegal
          ? (correct ? 'Correct, lineup is legal.' : 'Actually, this lineup IS legal.')
          : (correct ? `Correct, illegal: ${validation.violations[0]?.message}` : `Wrong: ${validation.violations.map(v => v.message).join('. ')}`);
        break;
      }
      case 'identify_active_setter': {
        const label = getRotationLabel(system, challenge.rotationIndex, startingZones, players);
        correct = label.activeSetter?.includes(selectedAnswer || '') ?? false;
        message = correct ? 'Correct!' : `The active setter is: ${label.activeSetter}`;
        break;
      }
    }

    setResult({ correct, message });
    setStats(prev => ({
      streak: correct ? prev.streak + 1 : 0,
      best: Math.max(prev.best, correct ? prev.streak + 1 : prev.best),
      total: prev.total + 1,
      correct: prev.correct + (correct ? 1 : 0),
    }));
  }, [challenge, validation, selectedAnswer, players, startingZones, system]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-primary font-display">Challenge Mode</h2>
        <p className="text-sm text-text-secondary">{system} scenarios with scoring</p>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="text-center">
          <div className="text-amber-400 font-bold font-mono">{stats.streak}</div>
          <div className="text-text-muted text-[10px]">Streak</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-400 font-bold font-mono">{stats.best}</div>
          <div className="text-text-muted text-[10px]">Best</div>
        </div>
        <div className="text-center">
          <div className="text-teal-400 font-bold font-mono">{stats.correct}/{stats.total}</div>
          <div className="text-text-muted text-[10px]">Score</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {(['beginner', 'intermediate', 'advanced', 'referee'] as Difficulty[]).map(d => (
          <button key={d} onClick={() => setDifficulty(d)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${difficulty === d ? 'bg-amber-400 text-deep' : 'bg-elevated text-text-secondary hover:bg-hover'}`}>
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        <button onClick={startChallenge}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-medium text-sm">
          {challenge ? 'Next' : 'Start'}
        </button>
      </div>

      <DisplayToggleBar toggles={toggles} onChange={setToggles} />

      {challenge ? (
        <div className="space-y-4">
          <div className="bg-surface border border-amber-400/30 rounded-lg p-3 text-center">
            <h3 className="text-base font-bold text-amber-400 font-display">{challenge.title}</h3>
            <p className="text-xs text-text-secondary mt-1">{challenge.description}</p>
          </div>

          {challenge.type === 'who_serves_next' && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {players.map(p => (
                <button key={p.id} onClick={() => !submitted && setSelectedAnswer(p.id)} disabled={submitted}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${selectedAnswer === p.id ? 'bg-amber-400 text-deep' : 'bg-elevated text-text-secondary hover:bg-hover'}`}>
                  #{p.number} {p.name}
                </button>
              ))}
            </div>
          )}

          {challenge.type === 'is_lineup_legal' && (
            <div className="flex justify-center gap-3">
              <button onClick={() => !submitted && setSelectedAnswer('legal')} disabled={submitted}
                className={`px-5 py-1.5 rounded-lg font-bold text-xs ${selectedAnswer === 'legal' ? 'bg-teal-500 text-white' : 'bg-elevated text-text-secondary'}`}>
                Legal
              </button>
              <button onClick={() => !submitted && setSelectedAnswer('illegal')} disabled={submitted}
                className={`px-5 py-1.5 rounded-lg font-bold text-xs ${selectedAnswer === 'illegal' ? 'bg-red-500 text-white' : 'bg-elevated text-text-secondary'}`}>
                Illegal
              </button>
            </div>
          )}

          {challenge.type === 'identify_active_setter' && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {players.filter(p => p.role === 'S' || p.role === 'OPP').map(p => (
                <button key={p.id} onClick={() => !submitted && setSelectedAnswer(p.name)} disabled={submitted}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                    selectedAnswer === p.name ? 'bg-amber-400 text-deep' : 'bg-elevated text-text-secondary hover:bg-hover'
                  }`}>
                  #{p.number} {p.name} ({p.role})
                </button>
              ))}
            </div>
          )}

          <Court
            players={players}
            zoneAssignments={zones}
            coordinates={coordinates}
            toggles={effectiveToggles}
            validation={submitted ? validation : undefined}
            draggable={!submitted && ['build_serve_receive', 'find_overlap_fault', 'rotate_and_place'].includes(challenge.type)}
            onPlayerMove={handlePlayerMove}
          />

          {!submitted && (
            <div className="text-center">
              <button onClick={handleSubmit}
                className="px-6 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-bold text-sm"
                disabled={['who_serves_next', 'is_lineup_legal', 'identify_active_setter'].includes(challenge.type) && !selectedAnswer}>
                Submit
              </button>
            </div>
          )}

          {result && (
            <div className={`text-center p-3 rounded-lg ${result.correct ? 'bg-teal-500/20 border border-teal-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
              <div className={`text-base font-bold ${result.correct ? 'text-teal-400' : 'text-red-400'}`}>
                {result.correct ? 'Correct!' : 'Not Quite...'}
              </div>
              <p className="text-xs text-text-secondary mt-1">{result.message}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-text-muted">
          <p className="text-3xl mb-3">&#127942;</p>
          <p>Press "Start" for a {system} challenge!</p>
        </div>
      )}
    </div>
  );
}
