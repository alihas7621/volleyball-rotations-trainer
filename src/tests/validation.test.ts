import { describe, it, expect } from 'vitest';
import { validateOverlap } from '../logic/validation';
import type { Zone, CourtCoord } from '../types';
import { BUBBLE_RADIUS } from '../types';

// Helper: create zone assignments and coordinates
function makeScenario(
  positions: Record<Zone, CourtCoord>
): { coords: Record<string, CourtCoord>; zones: Record<string, Zone> } {
  const coords: Record<string, CourtCoord> = {};
  const zones: Record<string, Zone> = {};
  for (const [zone, coord] of Object.entries(positions)) {
    const pid = `p${zone}`;
    coords[pid] = coord;
    zones[pid] = Number(zone) as Zone;
  }
  return { coords, zones };
}

describe('overlap validation (bubble-boundary)', () => {
  it('default zone anchors are legal', () => {
    const { coords, zones } = makeScenario({
      4: { x: 1.5, y: 1.5 },
      3: { x: 4.5, y: 1.5 },
      2: { x: 7.5, y: 1.5 },
      5: { x: 1.5, y: 6.2 },
      6: { x: 4.5, y: 6.2 },
      1: { x: 7.5, y: 6.2 },
    });
    const result = validateOverlap(coords, zones);
    expect(result.isLegal).toBe(true);
  });

  it('exact level centers are legal (front-back)', () => {
    // Z4 and Z5 at same y — bubbles overlap, margin = 2*radius > 0 → legal
    const { coords, zones } = makeScenario({
      4: { x: 1.5, y: 4.0 },
      3: { x: 4.5, y: 1.5 },
      2: { x: 7.5, y: 1.5 },
      5: { x: 1.5, y: 4.0 },
      6: { x: 4.5, y: 6.2 },
      1: { x: 7.5, y: 6.2 },
    });
    const result = validateOverlap(coords, zones);
    const z4z5violation = result.violations.find(
      v => v.rule.zoneA === 4 && v.rule.zoneB === 5 && v.severity === 'illegal'
    );
    expect(z4z5violation).toBeUndefined();
  });

  it('front player slightly closer to net is legal', () => {
    const { coords, zones } = makeScenario({
      4: { x: 1.5, y: 5.9 },
      3: { x: 4.5, y: 1.5 },
      2: { x: 7.5, y: 1.5 },
      5: { x: 1.5, y: 6.0 },
      6: { x: 4.5, y: 6.2 },
      1: { x: 7.5, y: 6.2 },
    });
    const result = validateOverlap(coords, zones);
    const z4z5violation = result.violations.find(
      v => v.rule.zoneA === 4 && v.rule.zoneB === 5 && v.severity === 'illegal'
    );
    expect(z4z5violation).toBeUndefined();
  });

  it('front player behind corresponding back player beyond bubble tolerance is illegal', () => {
    // Z4 at y=7.5, Z5 at y=6.0
    // margin = 6.0 - 7.5 + 2*0.45 = -1.5 + 0.9 = -0.6 → illegal
    const { coords, zones } = makeScenario({
      4: { x: 1.5, y: 7.5 },
      3: { x: 4.5, y: 1.5 },
      2: { x: 7.5, y: 1.5 },
      5: { x: 1.5, y: 6.0 },
      6: { x: 4.5, y: 6.2 },
      1: { x: 7.5, y: 6.2 },
    });
    const result = validateOverlap(coords, zones);
    expect(result.isLegal).toBe(false);
    const z4z5violation = result.violations.find(
      v => v.rule.zoneA === 4 && v.rule.zoneB === 5 && v.severity === 'illegal'
    );
    expect(z4z5violation).toBeDefined();
  });

  it('left player level with middle is legal (left-right)', () => {
    // Z4 and Z3 at same x — margin = 2*radius → legal
    const { coords, zones } = makeScenario({
      4: { x: 4.5, y: 1.5 },
      3: { x: 4.5, y: 1.5 },
      2: { x: 7.5, y: 1.5 },
      5: { x: 1.5, y: 6.2 },
      6: { x: 4.5, y: 6.2 },
      1: { x: 7.5, y: 6.2 },
    });
    const result = validateOverlap(coords, zones);
    const z4z3violation = result.violations.find(
      v => v.rule.zoneA === 4 && v.rule.zoneB === 3 && v.severity === 'illegal'
    );
    expect(z4z3violation).toBeUndefined();
  });

  it('left player far to the right of middle is illegal', () => {
    // Z4 at x=6.5, Z3 at x=4.5
    // margin = 4.5 - 6.5 + 2*0.45 = -2.0 + 0.9 = -1.1 → illegal
    const { coords, zones } = makeScenario({
      4: { x: 6.5, y: 1.5 },
      3: { x: 4.5, y: 1.5 },
      2: { x: 7.5, y: 1.5 },
      5: { x: 1.5, y: 6.2 },
      6: { x: 4.5, y: 6.2 },
      1: { x: 7.5, y: 6.2 },
    });
    const result = validateOverlap(coords, zones);
    expect(result.isLegal).toBe(false);
    const z4z3violation = result.violations.find(
      v => v.rule.zoneA === 4 && v.rule.zoneB === 3 && v.severity === 'illegal'
    );
    expect(z4z3violation).toBeDefined();
  });

  it('bubbles overlapping but centers close is still legal', () => {
    // Z4 at x=4.4, Z3 at x=4.5
    // margin = 4.5 - 4.4 + 0.9 = 1.0 → legal
    const { coords, zones } = makeScenario({
      4: { x: 4.4, y: 1.5 },
      3: { x: 4.5, y: 1.5 },
      2: { x: 7.5, y: 1.5 },
      5: { x: 1.5, y: 6.2 },
      6: { x: 4.5, y: 6.2 },
      1: { x: 7.5, y: 6.2 },
    });
    const result = validateOverlap(coords, zones);
    const z4z3violation = result.violations.find(
      v => v.rule.zoneA === 4 && v.rule.zoneB === 3 && v.severity === 'illegal'
    );
    expect(z4z3violation).toBeUndefined();
  });

  it('front player behind back player but within bubble tolerance is legal', () => {
    // Z2 at y=6.5, Z1 at y=6.0
    // margin = 6.0 - 6.5 + 2*0.45 = -0.5 + 0.9 = 0.4 → legal (> 0.3 threshold)
    const { coords, zones } = makeScenario({
      4: { x: 1.5, y: 1.5 },
      3: { x: 4.5, y: 1.5 },
      2: { x: 7.5, y: 6.5 },
      5: { x: 1.5, y: 6.2 },
      6: { x: 4.5, y: 6.2 },
      1: { x: 7.5, y: 6.0 },
    });
    const result = validateOverlap(coords, zones);
    // margin = 0.4, which is above CLOSE_THRESHOLD (0.3), so it's legal
    const z2z1violation = result.violations.find(
      v => v.rule.zoneA === 2 && v.rule.zoneB === 1 && v.severity === 'illegal'
    );
    expect(z2z1violation).toBeUndefined();
  });

  it('BUBBLE_RADIUS is defined correctly', () => {
    expect(BUBBLE_RADIUS).toBe(0.45);
  });

  it('front player way behind back player is definitely illegal', () => {
    // Z2 at y=8.0, Z1 at y=6.0
    // margin = 6.0 - 8.0 + 0.9 = -1.1 → illegal
    const { coords, zones } = makeScenario({
      4: { x: 1.5, y: 1.5 },
      3: { x: 4.5, y: 1.5 },
      2: { x: 7.5, y: 8.0 },
      5: { x: 1.5, y: 6.2 },
      6: { x: 4.5, y: 6.2 },
      1: { x: 7.5, y: 6.0 },
    });
    const result = validateOverlap(coords, zones);
    expect(result.isLegal).toBe(false);
  });
});
