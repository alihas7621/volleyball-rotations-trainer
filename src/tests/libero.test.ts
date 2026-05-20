import { describe, it, expect } from 'vitest';
import { applyLiberoSubstitutions, shouldLiberoReplace } from '../logic/libero';
import { getZoneAssignments, getDefaultCoordForZone } from '../logic/rotation';
import { DEFAULT_PLAYERS, DEFAULT_STARTING_ZONES_5_1, LIBERO_PLAYER } from '../data/defaultTeam';
import type { Zone, CourtCoord } from '../types';

function buildCoords(zones: Record<string, Zone>): Record<string, CourtCoord> {
  const coords: Record<string, CourtCoord> = {};
  for (const [pid, zone] of Object.entries(zones)) {
    coords[pid] = getDefaultCoordForZone(zone);
  }
  return coords;
}

describe('libero substitution', () => {
  it('replaces back-row MB1 when replacesRole is MB1', () => {
    // Rotation 0: MB1 (Sam) is in Z3 (front row), so no replacement
    const zones0 = getZoneAssignments(DEFAULT_STARTING_ZONES_5_1, 0);
    const coords0 = buildCoords(zones0);
    const result0 = applyLiberoSubstitutions(DEFAULT_PLAYERS, zones0, coords0, LIBERO_PLAYER, 'MB1');
    expect(result0.replacedIds).toHaveLength(0);

    // Rotation 3: MB1 is in Z6 (back row), should be replaced
    const zones3 = getZoneAssignments(DEFAULT_STARTING_ZONES_5_1, 3);
    const coords3 = buildCoords(zones3);
    const result3 = applyLiberoSubstitutions(DEFAULT_PLAYERS, zones3, coords3, LIBERO_PLAYER, 'MB1');
    expect(result3.replacedIds).toHaveLength(1);
    const mb1 = DEFAULT_PLAYERS.find(p => p.role === 'MB1')!;
    expect(result3.replacedIds).toContain(mb1.id);
  });

  it('replaces both MBs in back row when replacesRole is both', () => {
    // Rotation 0: MB1 in Z3 (front), MB2 in Z6 (back)
    const zones0 = getZoneAssignments(DEFAULT_STARTING_ZONES_5_1, 0);
    const coords0 = buildCoords(zones0);
    const result0 = applyLiberoSubstitutions(DEFAULT_PLAYERS, zones0, coords0, LIBERO_PLAYER, 'both');
    // Only MB2 is in back row at rotation 0
    expect(result0.replacedIds).toHaveLength(1);
    const mb2 = DEFAULT_PLAYERS.find(p => p.role === 'MB2')!;
    expect(result0.replacedIds).toContain(mb2.id);
  });

  it('replaced player gets libero display properties', () => {
    const zones0 = getZoneAssignments(DEFAULT_STARTING_ZONES_5_1, 0);
    const coords0 = buildCoords(zones0);
    const result = applyLiberoSubstitutions(DEFAULT_PLAYERS, zones0, coords0, LIBERO_PLAYER, 'both');
    const replacedPlayer = result.players.find(p => p.id === result.replacedIds[0]);
    expect(replacedPlayer?.role).toBe('L');
    expect(replacedPlayer?.isLibero).toBe(true);
    expect(replacedPlayer?.name).toBe('Taylor');
  });
});

describe('shouldLiberoReplace', () => {
  const mb1 = DEFAULT_PLAYERS.find(p => p.role === 'MB1')!;
  const setter = DEFAULT_PLAYERS.find(p => p.role === 'S')!;

  it('returns true for MB1 in back row zone', () => {
    expect(shouldLiberoReplace(mb1, 5, 'MB1')).toBe(true);
    expect(shouldLiberoReplace(mb1, 6, 'MB1')).toBe(true);
    expect(shouldLiberoReplace(mb1, 1, 'MB1')).toBe(true);
  });

  it('returns false for MB1 in front row zone', () => {
    expect(shouldLiberoReplace(mb1, 2, 'MB1')).toBe(false);
    expect(shouldLiberoReplace(mb1, 3, 'MB1')).toBe(false);
    expect(shouldLiberoReplace(mb1, 4, 'MB1')).toBe(false);
  });

  it('returns false for non-MB player', () => {
    expect(shouldLiberoReplace(setter, 1, 'MB1')).toBe(false);
    expect(shouldLiberoReplace(setter, 1, 'both')).toBe(false);
  });
});
