import { useState, useMemo, useCallback } from 'react';
import type { Player, Zone, CourtCoord, DisplayToggles, QuizCategory, Role } from '../types';
import { BACK_ROW_ZONES, FRONT_ROW_ZONES, ROLE_ABBREV } from '../types';
import { getZoneAssignments } from '../logic/rotation';
import { validateOverlap } from '../logic/validation';
import { FORMATIONS_5_1 } from '../data/formations';
import { LIBERO_PLAYER } from '../data/defaultTeam';
import { generateQuiz, checkPositionAccuracy, TOLERANCE_RADIUS } from '../logic/quiz';
import type { PlayerResult } from '../logic/quiz';
import type { QuizQuestion } from '../types';
import Court from './Court';

interface QuizModeProps {
  players: Player[];
  startingZones: Record<string, Zone>;
}

const QUIZ_TYPES: { key: QuizCategory; label: string }[] = [
  { key: 'zone-placement', label: 'Zone Placement' },
  { key: 'build-serve-receive', label: 'Build Serve Receive' },
  { key: 'fix-overlap', label: 'Fix Overlap' },
];

export default function QuizMode({ players, startingZones }: QuizModeProps) {
  const [category, setCategory] = useState<QuizCategory>('zone-placement');
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [customCoords, setCustomCoords] = useState<Record<string, CourtCoord>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, PlayerResult>>({});
  const [score, setScore] = useState({ points: 0, maxPoints: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [difficulty, setDifficulty] = useState(2);

  const rotationIndex = question?.rotationIndex ?? 0;
  const formation = FORMATIONS_5_1[rotationIndex];

  const zones = useMemo(
    () => getZoneAssignments(startingZones, rotationIndex),
    [startingZones, rotationIndex]
  );

  const displayPlayers = useMemo(() => {
    if (!question) return players;
    if (question.category === 'zone-placement') return players;
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
    return updated;
  }, [question, players, zones]);

  const coordinates = useMemo(() => {
    if (!question) return {};
    return { ...question.startPositions, ...customCoords };
  }, [question, customCoords]);

  const validation = useMemo(
    () => validateOverlap(coordinates, zones),
    [coordinates, zones]
  );

  const toggles: DisplayToggles = {
    showZones: submitted,
    showFrontBackRow: false,
    showOverlapLines: submitted,
    showRoleLabels: true,
    showBeginnerExplanations: false,
    showGhostPositions: false,
    showReceiveShape: false,
    showHomeBase: false,
  };

  // Zone placement: outlines WITHOUT role labels (that's the quiz!)
  const targetPositions = useMemo(() => {
    if (!question || question.category !== 'zone-placement') return undefined;
    return Object.entries(question.correctPositions).map(([pid, coord]) => {
      const player = players.find(p => p.id === pid);
      const role = player?.role ?? 'S';
      const correct = submitted ? results[pid]?.correct : undefined;
      return { coord, role: role as Role, correct, hideLabel: !submitted };
    });
  }, [question, players, submitted, results]);

  // After submit for serve-receive / fix-overlap: show correct positions
  const correctTargets = useMemo(() => {
    if (!question || !submitted) return undefined;
    if (question.category === 'zone-placement') return undefined;
    return Object.entries(question.correctPositions).map(([pid, coord]) => {
      const player = displayPlayers.find(p => p.id === pid);
      const role = player?.role ?? 'S';
      const correct = results[pid]?.correct;
      return { coord, role: role as Role, correct };
    });
  }, [question, submitted, displayPlayers, results]);

  // Zone placement: hide zone numbers, show F/B for OH and MB
  const zoneBadgeOverrides = useMemo(() => {
    if (!question || question.category !== 'zone-placement') return undefined;
    const overrides: Record<string, string> = {};
    for (const [pid, zone] of Object.entries(zones)) {
      const player = players.find(p => p.id === pid);
      if (!player) continue;
      const role = player.role;
      if (role === 'OH1' || role === 'OH2' || role === 'MB1' || role === 'MB2') {
        overrides[pid] = FRONT_ROW_ZONES.includes(zone) ? 'F' : 'B';
      } else {
        overrides[pid] = ''; // hide badge for S, OPP, L
      }
    }
    return overrides;
  }, [question, zones, players]);

  const handlePlayerMove = useCallback((playerId: string, coord: CourtCoord) => {
    if (submitted) return;
    setCustomCoords(prev => ({ ...prev, [playerId]: coord }));
  }, [submitted]);

  const startQuiz = useCallback(() => {
    const q = generateQuiz(players, startingZones, category, difficulty);
    setQuestion(q);
    setCustomCoords({});
    setSubmitted(false);
    setResults({});
  }, [players, startingZones, category, difficulty]);

  const handleSubmit = useCallback(() => {
    if (!question) return;
    const currentPositions = { ...question.startPositions, ...customCoords };
    // Use polygon zones for serve-receive quizzes, circular fallback for zone-placement
    const usePolygons = question.category !== 'zone-placement';
    const res = checkPositionAccuracy(
      currentPositions,
      question.correctPositions,
      TOLERANCE_RADIUS,
      usePolygons ? question.rotationIndex : undefined,
      usePolygons ? displayPlayers : undefined,
    );

    // Also check overlap rules — players in correct zones can still violate rotational order
    const overlapResult = validateOverlap(currentPositions, zones);
    if (!overlapResult.isLegal) {
      for (const v of overlapResult.violations) {
        if (v.severity === 'illegal') {
          if (res[v.playerA]) res[v.playerA] = { ...res[v.playerA], correct: false, score: 0 };
          if (res[v.playerB]) res[v.playerB] = { ...res[v.playerB], correct: false, score: 0 };
        }
      }
    }

    setResults(res);
    setSubmitted(true);

    // Accumulate graduated score: sum of per-player scores
    const roundPoints = Object.values(res).reduce((sum, r) => sum + r.score, 0);
    const roundMax = Object.keys(res).length; // 1.0 per player max
    setScore(prev => ({
      points: prev.points + roundPoints,
      maxPoints: prev.maxPoints + roundMax,
    }));
  }, [question, customCoords, zones, displayPlayers]);

  const handleReset = useCallback(() => {
    if (!question) return;
    setCustomCoords({});
    setSubmitted(false);
    setResults({});
  }, [question]);

  const hasChanges = Object.keys(customCoords).length > 0;
  const correctCount = Object.values(results).filter(r => r.correct).length;
  const totalCount = Object.values(results).length;
  const roundScore = Object.values(results).reduce((sum, r) => sum + r.score, 0);
  const roundMax = totalCount;

  return (
    <div className="flex flex-col gap-4">
      {/* Rotation label above court */}
      {question && (
        <div className="text-center">
          <span className="text-lg font-bold font-display text-amber-400">
            {question.rotationName}
          </span>
          <span className="text-sm text-text-secondary ml-2">
            {question.category === 'zone-placement' && '— Place players in base positions'}
            {question.category === 'build-serve-receive' && '— Build the serve receive'}
            {question.category === 'fix-overlap' && `— Fix ${question.shuffledPlayerIds?.length ?? 0} shuffled player(s)`}
          </span>
        </div>
      )}

      {/* Mobile drawer toggle */}
      <button
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="lg:hidden flex items-center justify-center gap-2 px-3 py-2 bg-surface rounded-lg text-text-secondary text-xs"
      >
        <span>{drawerOpen ? 'Hide' : 'Show'} Controls</span>
        <span className="text-[10px]">{drawerOpen ? '▲' : '▼'}</span>
      </button>

      {/* Court centered, sidebar absolute right */}
      <div className="relative">
        {/* Center: Court */}
        <div className="max-w-xl mx-auto">
          {question ? (
            <>
              <Court
                players={displayPlayers}
                zoneAssignments={zones}
                coordinates={coordinates}
                toggles={toggles}
                validation={submitted ? validation : undefined}
                targetPositions={targetPositions || correctTargets}
                zoneBadgeOverrides={zoneBadgeOverrides}
                draggable={!submitted}
                onPlayerMove={handlePlayerMove}
                containerClassName="w-full select-none"
              />

              {/* Buttons below court */}
              <div className="flex items-center justify-center gap-3 mt-3">
                {!submitted && hasChanges && (
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 transition-colors"
                  >
                    Check Formation
                  </button>
                )}
                {!submitted && (
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                  >
                    Reset
                  </button>
                )}
                {submitted && (
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    correctCount === totalCount
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {roundScore.toFixed(1)}/{roundMax} pts
                  </span>
                )}
                {submitted && (
                  <button
                    onClick={startQuiz}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-400 border border-amber-400/30 hover:bg-amber-400/30 transition-colors"
                  >
                    Next Question
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-text-muted">
              <p className="text-2xl mb-2">Select a quiz type and press Start</p>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className={`lg:absolute lg:top-0 lg:right-0 lg:w-[220px] space-y-3 ${drawerOpen ? 'block' : 'hidden'} lg:block`}>

          {/* Quiz type selector */}
          <div className="bg-surface rounded-lg p-3 space-y-2">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Quiz Type</h4>
            {QUIZ_TYPES.map(qt => (
              <button
                key={qt.key}
                onClick={() => { setCategory(qt.key); setQuestion(null); setSubmitted(false); setResults({}); setCustomCoords({}); }}
                className={`w-full px-2 py-1.5 rounded-md text-xs font-medium text-left transition-all ${
                  category === qt.key
                    ? 'bg-amber-400/15 text-amber-400'
                    : 'bg-elevated/50 text-text-secondary hover:bg-elevated'
                }`}
              >
                {qt.label}
              </button>
            ))}
          </div>

          {/* Difficulty (fix-overlap only) */}
          {category === 'fix-overlap' && (
            <div className="bg-surface rounded-lg p-3 space-y-2">
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Difficulty: {difficulty} player{difficulty > 1 ? 's' : ''}
              </h4>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 px-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                      difficulty === d
                        ? 'bg-amber-400 text-deep'
                        : 'bg-elevated text-text-secondary hover:bg-hover'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
          <button
            onClick={startQuiz}
            className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-bold text-sm transition-colors"
          >
            {question ? 'New Question' : 'Start Quiz'}
          </button>

          {/* Score */}
          <div className="bg-surface rounded-lg p-3">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Score</h4>
            <div className="mt-1 text-lg font-display font-bold text-text-primary">
              {score.points.toFixed(1)} / {score.maxPoints}
            </div>
            {score.maxPoints > 0 && (
              <div className="text-[10px] text-text-secondary">
                {Math.round((score.points / score.maxPoints) * 100)}%
              </div>
            )}
          </div>

          {/* Per-player results after submit */}
          {submitted && Object.keys(results).length > 0 && (
            <div className="bg-surface rounded-lg p-3 space-y-1">
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Results</h4>
              {Object.entries(results).map(([pid, res]) => {
                const player = displayPlayers.find(p => p.id === pid);
                if (!player) return null;
                const pct = Math.round(res.score * 100);
                return (
                  <div key={pid} className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${
                    res.score >= 0.75 ? 'bg-teal-500/10 text-teal-400'
                      : res.score >= 0.25 ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.number}
                    </div>
                    <span>{ROLE_ABBREV[player.role]}</span>
                    <span className="ml-auto text-[10px] font-bold">
                      {res.correct ? `${pct}%` : `${res.distance.toFixed(1)}m off`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rotation info */}
          {question && (
            <div className="bg-surface rounded-lg p-3">
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Rotation</h4>
              <div className="mt-1 text-sm font-display font-bold text-text-primary">
                5-1 {formation.name}
              </div>
              <div className="text-[11px] text-text-secondary mt-0.5">
                Setter Zone {formation.setterZone} &middot; {[2,3,4].includes(formation.setterZone) ? 'Front' : 'Back'} row
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
