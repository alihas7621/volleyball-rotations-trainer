import type { Player, Zone, CourtCoord, QuizQuestion, QuizCategory } from '../types';
import { BACK_ROW_ZONES, BUBBLE_RADIUS } from '../types';
import { getZoneAssignments } from './rotation';
import { FORMATIONS_5_1 } from '../data/formations';
import { LIBERO_PLAYER } from '../data/defaultTeam';
import { TOLERANCE_ZONES } from '../data/toleranceZones';
import type { ToleranceZone } from '../data/toleranceZones';

let quizCounter = 0;

/** Tolerance radius in meters for position accuracy checks (fallback for zone-placement) */
export const TOLERANCE_RADIUS = 1.2;

/** Distance between two court coordinates */
function dist(a: CourtCoord, b: CourtCoord): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Ray-casting point-in-polygon test */
function pointInPolygon(point: CourtCoord, polygon: CourtCoord[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    if ((yi > point.y) !== (yj > point.y) &&
        point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Minimum distance from a point to any edge of the polygon */
function distToPolygonEdge(point: CourtCoord, polygon: CourtCoord[]): number {
  let minDist = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j], b = polygon[i];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    let t = len2 === 0 ? 0 : ((point.x - a.x) * dx + (point.y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * dx, py = a.y + t * dy;
    const d = Math.sqrt((point.x - px) ** 2 + (point.y - py) ** 2);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

function getDisplayPlayers(
  players: Player[],
  zones: Record<string, Zone>,
  includeLibero: boolean
): Player[] {
  if (!includeLibero) return [...players];
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
}

function buildCoords(
  formation: typeof FORMATIONS_5_1[0],
  view: 'base' | 'serveReceive',
  players: Player[],
  zones: Record<string, Zone>
): Record<string, CourtCoord> {
  const formPos = view === 'base' ? formation.base : formation.serveReceive;
  const coords: Record<string, CourtCoord> = {};
  for (const [pid] of Object.entries(zones)) {
    const player = players.find(p => p.id === pid);
    if (!player) continue;
    const pos = formPos[player.role];
    if (pos) coords[pid] = { ...pos };
  }
  return coords;
}

/**
 * Generate a quiz question. For fix-overlap, difficulty = number of shuffled players (1-5).
 */
export function generateQuiz(
  players: Player[],
  startingZones: Record<string, Zone>,
  category: QuizCategory,
  difficulty: number = 2
): QuizQuestion {
  const rotationIndex = Math.floor(Math.random() * 6);
  const formation = FORMATIONS_5_1[rotationIndex];
  const zones = getZoneAssignments(startingZones, rotationIndex);

  quizCounter++;
  const id = `quiz-${quizCounter}`;

  switch (category) {
    case 'zone-placement': {
      const correctPositions = buildCoords(formation, 'base', players, zones);
      // Start positions = stacked vertically on left edge of court
      const startPositions: Record<string, CourtCoord> = {};
      const pids = Object.keys(zones);
      pids.forEach((pid, i) => {
        startPositions[pid] = {
          x: 0.5,
          y: 1.0 + (i * (7.0 / Math.max(pids.length - 1, 1))),
        };
      });
      return {
        id, category, rotationName: formation.name, rotationIndex,
        startPositions, correctPositions,
      };
    }

    case 'build-serve-receive': {
      const displayPlayers = getDisplayPlayers(players, zones, true);
      const startPositions = buildCoords(formation, 'base', players, zones);
      const correctPositions = buildCoords(formation, 'serveReceive', displayPlayers, zones);
      return {
        id, category, rotationName: formation.name, rotationIndex,
        startPositions, correctPositions,
      };
    }

    case 'fix-overlap': {
      const displayPlayers = getDisplayPlayers(players, zones, true);
      const correctPositions = buildCoords(formation, 'serveReceive', displayPlayers, zones);

      const pids = Object.keys(correctPositions);
      const shuffleCount = Math.min(Math.max(1, difficulty), pids.length);
      const shuffled = [...pids].sort(() => Math.random() - 0.5).slice(0, shuffleCount);

      const startPositions = { ...correctPositions };
      for (const pid of shuffled) {
        const player = displayPlayers.find(p => p.id === pid);
        if (!player) continue;

        // Pick a DIFFERENT rotation and a DIFFERENT role for maximum displacement
        const otherRotations = [0, 1, 2, 3, 4, 5].filter(r => r !== rotationIndex);
        // Shuffle the other rotations to try multiple
        const shuffledRotations = otherRotations.sort(() => Math.random() - 0.5);

        let placed = false;
        for (const otherIdx of shuffledRotations) {
          const otherFormation = FORMATIONS_5_1[otherIdx];
          // First try: same role from a distant rotation
          const sameRolePos = otherFormation.serveReceive[player.role];
          if (sameRolePos) {
            const d = dist(sameRolePos, correctPositions[pid]);
            // Only use if it's far enough away (at least 2m displacement)
            if (d >= 2.0) {
              startPositions[pid] = { ...sameRolePos };
              placed = true;
              break;
            }
          }
          // Second try: different role from another rotation for bigger displacement
          const allRoles = Object.keys(otherFormation.serveReceive);
          const randomRole = allRoles[Math.floor(Math.random() * allRoles.length)];
          const otherPos = otherFormation.serveReceive[randomRole];
          if (otherPos) {
            const d = dist(otherPos, correctPositions[pid]);
            if (d >= 2.0) {
              startPositions[pid] = { ...otherPos };
              placed = true;
              break;
            }
          }
        }

        // Fallback: guaranteed large random displacement
        if (!placed) {
          const cx = correctPositions[pid].x;
          const cy = correctPositions[pid].y;
          // Move to opposite side of court
          startPositions[pid] = {
            x: Math.max(0.5, Math.min(8.5, 9 - cx + (Math.random() - 0.5) * 2)),
            y: Math.max(0.5, Math.min(8.5, 9 - cy + (Math.random() - 0.5) * 2)),
          };
        }
      }

      return {
        id, category, rotationName: formation.name, rotationIndex,
        startPositions, correctPositions, shuffledPlayerIds: shuffled,
      };
    }
  }
}

export interface PlayerResult {
  correct: boolean;
  distance: number;
  /** 0–1 score: 1.0 = dead-on, scales down toward polygon edge */
  score: number;
}

/**
 * Look up the tolerance zone for a player in a given rotation.
 * Returns the zone if found, undefined otherwise.
 */
function getToleranceZone(
  rotationIndex: number,
  players: Player[],
  playerId: string,
): ToleranceZone | undefined {
  const zones = TOLERANCE_ZONES[rotationIndex];
  if (!zones) return undefined;
  const player = players.find(p => p.id === playerId);
  if (!player) return undefined;
  return zones[player.role];
}

/**
 * Score a player position against a polygon tolerance zone.
 *
 * - Center inside polygon: score 1.0 at center, scaling down to 0.5 at polygon edge
 * - Center outside but bubble edge touches polygon: score 0.25
 * - Completely outside: score 0, incorrect
 */
function scoreWithPolygon(
  current: CourtCoord,
  zone: ToleranceZone,
): PlayerResult {
  const d = dist(current, zone.center);
  const insidePolygon = pointInPolygon(current, zone.polygon);

  if (insidePolygon) {
    // Find max distance from center to any polygon vertex for normalization
    const maxR = Math.max(...zone.polygon.map(v => dist(zone.center, v)));
    if (d <= BUBBLE_RADIUS) {
      return { correct: true, distance: d, score: 1.0 };
    }
    // Scale from 1.0 (at center) to 0.5 (at polygon edge)
    const t = Math.min(d / maxR, 1);
    return { correct: true, distance: d, score: 1.0 - t * 0.5 };
  }

  // Outside polygon — check if bubble edge touches the polygon
  const edgeDist = distToPolygonEdge(current, zone.polygon);
  if (edgeDist <= BUBBLE_RADIUS) {
    return { correct: true, distance: d, score: 0.25 };
  }

  return { correct: false, distance: d, score: 0 };
}

/**
 * Check position accuracy with graduated scoring.
 *
 * When polygon tolerance zones are available (rotationIndex + players provided),
 * uses point-in-polygon testing. Falls back to circular radius for zone-placement.
 *
 * Circular fallback:
 * - Distance ≤ BUBBLE_RADIUS → score 1.0 (full point)
 * - Distance ≤ tolerance → score 1.0 down to 0.5
 * - Distance ≤ tolerance + BUBBLE_RADIUS → score 0.5 down to 0.25
 * - Beyond → score 0
 */
export function checkPositionAccuracy(
  currentPositions: Record<string, CourtCoord>,
  correctPositions: Record<string, CourtCoord>,
  tolerance: number = TOLERANCE_RADIUS,
  rotationIndex?: number,
  players?: Player[],
): Record<string, PlayerResult> {
  const results: Record<string, PlayerResult> = {};

  for (const [pid, correct] of Object.entries(correctPositions)) {
    const current = currentPositions[pid];
    if (!current) {
      results[pid] = { correct: false, distance: Infinity, score: 0 };
      continue;
    }

    // Try polygon-based scoring if rotation info available
    if (rotationIndex !== undefined && players) {
      const zone = getToleranceZone(rotationIndex, players, pid);
      if (zone) {
        results[pid] = scoreWithPolygon(current, zone);
        continue;
      }
    }

    // Circular fallback (zone-placement or missing polygon data)
    const d = dist(current, correct);
    const maxDist = tolerance + BUBBLE_RADIUS;

    if (d <= BUBBLE_RADIUS) {
      results[pid] = { correct: true, distance: d, score: 1.0 };
    } else if (d <= tolerance) {
      const t = (d - BUBBLE_RADIUS) / (tolerance - BUBBLE_RADIUS);
      results[pid] = { correct: true, distance: d, score: 1.0 - t * 0.5 };
    } else if (d <= maxDist) {
      const t = (d - tolerance) / BUBBLE_RADIUS;
      results[pid] = { correct: true, distance: d, score: 0.5 - t * 0.25 };
    } else {
      results[pid] = { correct: false, distance: d, score: 0 };
    }
  }
  return results;
}
