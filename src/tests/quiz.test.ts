import { describe, it, expect } from 'vitest';
import { generateQuiz, checkPositionAccuracy, TOLERANCE_RADIUS } from '../logic/quiz';
import { DEFAULT_PLAYERS, DEFAULT_STARTING_ZONES_5_1 } from '../data/defaultTeam';
import { FORMATIONS_5_1 } from '../data/formations';

describe('quiz generation', () => {
  it('zone-placement: start positions at bottom, correct positions match base formation', () => {
    const q = generateQuiz(DEFAULT_PLAYERS, DEFAULT_STARTING_ZONES_5_1, 'zone-placement');
    expect(q.category).toBe('zone-placement');
    // All start positions should be at x ~0.5 (left edge tray)
    for (const coord of Object.values(q.startPositions)) {
      expect(coord.x).toBeCloseTo(0.5, 0);
    }
    // Correct positions should come from the formation base
    const formation = FORMATIONS_5_1[q.rotationIndex];
    for (const [pid, coord] of Object.entries(q.correctPositions)) {
      const player = DEFAULT_PLAYERS.find(p => p.id === pid);
      if (!player) continue;
      const expected = formation.base[player.role];
      if (expected) {
        expect(coord.x).toBeCloseTo(expected.x, 1);
        expect(coord.y).toBeCloseTo(expected.y, 1);
      }
    }
  });

  it('build-serve-receive: start at base, correct is serve-receive', () => {
    const q = generateQuiz(DEFAULT_PLAYERS, DEFAULT_STARTING_ZONES_5_1, 'build-serve-receive');
    expect(q.category).toBe('build-serve-receive');
    expect(Object.keys(q.startPositions).length).toBeGreaterThan(0);
    expect(Object.keys(q.correctPositions).length).toBeGreaterThan(0);
    // Start and correct should differ (base vs serve-receive)
    const anyDiff = Object.keys(q.startPositions).some(pid => {
      const s = q.startPositions[pid];
      const c = q.correctPositions[pid];
      return c && (Math.abs(s.x - c.x) > 0.1 || Math.abs(s.y - c.y) > 0.1);
    });
    expect(anyDiff).toBe(true);
  });

  it('fix-overlap: shuffles 2 players from correct serve-receive positions', () => {
    const q = generateQuiz(DEFAULT_PLAYERS, DEFAULT_STARTING_ZONES_5_1, 'fix-overlap');
    expect(q.category).toBe('fix-overlap');
    expect(q.shuffledPlayerIds).toBeDefined();
    expect(q.shuffledPlayerIds!.length).toBe(2);
    // Shuffled players should have different start vs correct positions
    for (const pid of q.shuffledPlayerIds!) {
      const s = q.startPositions[pid];
      const c = q.correctPositions[pid];
      expect(s).toBeDefined();
      expect(c).toBeDefined();
      const dist = Math.sqrt((s.x - c.x) ** 2 + (s.y - c.y) ** 2);
      expect(dist).toBeGreaterThan(0.1);
    }
  });
});

describe('position accuracy checking', () => {
  it('exact positions score 1.0', () => {
    const correct = { p1: { x: 5, y: 5 }, p2: { x: 2, y: 3 } };
    const current = { p1: { x: 5, y: 5 }, p2: { x: 2, y: 3 } };
    const results = checkPositionAccuracy(current, correct);
    expect(results.p1.correct).toBe(true);
    expect(results.p1.score).toBe(1.0);
    expect(results.p2.correct).toBe(true);
    expect(results.p2.score).toBe(1.0);
  });

  it('positions within bubble radius score 1.0 (full point)', () => {
    const correct = { p1: { x: 5, y: 5 } };
    const current = { p1: { x: 5.3, y: 5.3 } }; // ~0.42m, within BUBBLE_RADIUS 0.45
    const results = checkPositionAccuracy(current, correct, TOLERANCE_RADIUS);
    expect(results.p1.correct).toBe(true);
    expect(results.p1.score).toBe(1.0);
  });

  it('positions within tolerance score between 0.5 and 1.0', () => {
    const correct = { p1: { x: 5, y: 5 } };
    const current = { p1: { x: 5.5, y: 5.5 } }; // ~0.707m
    const results = checkPositionAccuracy(current, correct, TOLERANCE_RADIUS);
    expect(results.p1.correct).toBe(true);
    expect(results.p1.score).toBeGreaterThan(0.5);
    expect(results.p1.score).toBeLessThan(1.0);
  });

  it('positions outside tolerance+bubble are incorrect with score 0', () => {
    const correct = { p1: { x: 1, y: 1 } };
    const current = { p1: { x: 5, y: 5 } };
    const results = checkPositionAccuracy(current, correct, TOLERANCE_RADIUS);
    expect(results.p1.correct).toBe(false);
    expect(results.p1.score).toBe(0);
  });

  it('missing positions score 0', () => {
    const correct = { p1: { x: 5, y: 5 } };
    const current = {};
    const results = checkPositionAccuracy(current, correct);
    expect(results.p1.correct).toBe(false);
    expect(results.p1.distance).toBe(Infinity);
    expect(results.p1.score).toBe(0);
  });

  it('closer positions score higher than farther ones', () => {
    const correct = { close: { x: 5, y: 5 }, far: { x: 5, y: 5 } };
    const current = { close: { x: 5.5, y: 5 }, far: { x: 6, y: 5 } };
    const results = checkPositionAccuracy(current, correct, TOLERANCE_RADIUS);
    expect(results.close.score).toBeGreaterThan(results.far.score);
  });
});
