import type { Zone, CourtCoord, OverlapRule, ValidationResult, Violation, ViolationSeverity } from '../types';
import { BUBBLE_RADIUS } from '../types';

// ─── Epsilon / thresholds ───────────────────────────────────────
const EPSILON = 0.02; // ~2cm tolerance for "level"
const CLOSE_THRESHOLD = 0.3; // amber warning if within 30cm

// ─── Overlap rules ──────────────────────────────────────────────
// Front-back: zoneA.y <= zoneB.y (A closer to or level with net)
// Left-right: zoneA.x <= zoneB.x (A closer to or level with left sideline)
export const OVERLAP_RULES: OverlapRule[] = [
  // Front row left-right
  { description: 'Zone 4 must be level with or left of Zone 3', type: 'left-right', zoneA: 4, zoneB: 3 },
  { description: 'Zone 3 must be level with or left of Zone 2', type: 'left-right', zoneA: 3, zoneB: 2 },
  // Back row left-right
  { description: 'Zone 5 must be level with or left of Zone 6', type: 'left-right', zoneA: 5, zoneB: 6 },
  { description: 'Zone 6 must be level with or left of Zone 1', type: 'left-right', zoneA: 6, zoneB: 1 },
  // Front-back pairs
  { description: 'Zone 4 must be level with or closer to net than Zone 5', type: 'front-back', zoneA: 4, zoneB: 5 },
  { description: 'Zone 3 must be level with or closer to net than Zone 6', type: 'front-back', zoneA: 3, zoneB: 6 },
  { description: 'Zone 2 must be level with or closer to net than Zone 1', type: 'front-back', zoneA: 2, zoneB: 1 },
];

// ─── Bubble-boundary validation ────────────────────────────────
// For front-back: A's bubble bottom edge must not go past B's bubble top edge
//   Legal when: centerA.y - radius <= centerB.y + radius + epsilon
//   Margin = (centerB.y + radius) - (centerA.y - radius) = centerB.y - centerA.y + 2*radius
//
// For left-right: A's bubble left edge must not go past B's bubble right edge
//   Legal when: centerA.x - radius <= centerB.x + radius + epsilon
//   Margin = (centerB.x + radius) - (centerA.x - radius) = centerB.x - centerA.x + 2*radius

function getMarginFrontBack(coordA: CourtCoord, coordB: CourtCoord): number {
  // A must be closer to net (smaller y). Margin positive = legal.
  return coordB.y - coordA.y + 2 * BUBBLE_RADIUS;
}

function getMarginLeftRight(coordA: CourtCoord, coordB: CourtCoord): number {
  // A must be to the left (smaller x). Margin positive = legal.
  return coordB.x - coordA.x + 2 * BUBBLE_RADIUS;
}

function getSeverity(margin: number): ViolationSeverity {
  if (margin < -EPSILON) return 'illegal';
  if (margin < CLOSE_THRESHOLD) return 'close';
  return 'legal';
}

/**
 * Validate overlap rules using bubble-boundary geometry.
 * coordinates: playerId → bubble centre (CourtCoord in meters)
 * zoneAssignments: playerId → zone
 */
export function validateOverlap(
  coordinates: Record<string, CourtCoord>,
  zoneAssignments: Record<string, Zone>
): ValidationResult {
  const violations: Violation[] = [];

  // Build zone → playerId map
  const zoneToPlayer: Partial<Record<Zone, string>> = {};
  for (const [playerId, zone] of Object.entries(zoneAssignments)) {
    zoneToPlayer[zone] = playerId;
  }

  for (const rule of OVERLAP_RULES) {
    const playerA = zoneToPlayer[rule.zoneA];
    const playerB = zoneToPlayer[rule.zoneB];
    if (!playerA || !playerB) continue;

    const coordA = coordinates[playerA];
    const coordB = coordinates[playerB];
    if (!coordA || !coordB) continue;

    const margin = rule.type === 'front-back'
      ? getMarginFrontBack(coordA, coordB)
      : getMarginLeftRight(coordA, coordB);

    const severity = getSeverity(margin);

    if (severity !== 'legal') {
      violations.push({
        rule,
        playerA,
        playerB,
        message: rule.description,
        severity,
        marginMeters: margin,
      });
    }
  }

  return {
    isLegal: violations.every(v => v.severity !== 'illegal'),
    violations: violations.filter(v => v.severity !== 'legal'),
  };
}

/**
 * Get all rule checks with severity for visualization (includes legal ones).
 */
export function getAllRuleChecks(
  coordinates: Record<string, CourtCoord>,
  zoneAssignments: Record<string, Zone>
): Array<{ rule: OverlapRule; severity: ViolationSeverity; margin: number; playerA: string; playerB: string }> {
  const zoneToPlayer: Partial<Record<Zone, string>> = {};
  for (const [playerId, zone] of Object.entries(zoneAssignments)) {
    zoneToPlayer[zone] = playerId;
  }

  return OVERLAP_RULES.map(rule => {
    const playerA = zoneToPlayer[rule.zoneA] ?? '';
    const playerB = zoneToPlayer[rule.zoneB] ?? '';
    if (!playerA || !playerB) {
      return { rule, severity: 'legal' as ViolationSeverity, margin: 9, playerA, playerB };
    }

    const coordA = coordinates[playerA];
    const coordB = coordinates[playerB];
    if (!coordA || !coordB) {
      return { rule, severity: 'legal' as ViolationSeverity, margin: 9, playerA, playerB };
    }

    const margin = rule.type === 'front-back'
      ? getMarginFrontBack(coordA, coordB)
      : getMarginLeftRight(coordA, coordB);

    return { rule, severity: getSeverity(margin), margin, playerA, playerB };
  });
}

/**
 * Suggest correction: move violating players to resolve violations.
 */
export function suggestCorrection(
  coordinates: Record<string, CourtCoord>,
  zoneAssignments: Record<string, Zone>
): Record<string, CourtCoord> {
  const result: Record<string, CourtCoord> = {};
  for (const [k, v] of Object.entries(coordinates)) {
    result[k] = { ...v };
  }

  const { violations } = validateOverlap(coordinates, zoneAssignments);
  for (const v of violations) {
    if (v.severity !== 'illegal') continue;
    const cA = result[v.playerA];
    const cB = result[v.playerB];
    if (!cA || !cB) continue;

    if (v.rule.type === 'front-back') {
      const mid = (cA.y + cB.y) / 2;
      cA.y = Math.max(0.3, mid - 0.5);
      cB.y = Math.min(8.7, mid + 0.5);
    } else {
      const mid = (cA.x + cB.x) / 2;
      cA.x = Math.max(0.3, mid - 0.5);
      cB.x = Math.min(8.7, mid + 0.5);
    }
    result[v.playerA] = cA;
    result[v.playerB] = cB;
  }

  return result;
}
