import { describe, it, expect } from 'vitest';
import { rotateZone, rotateZoneBy, getZoneAssignments, getRotationLabel } from '../logic/rotation';
import type { Zone } from '../types';
import { DEFAULT_PLAYERS, DEFAULT_STARTING_ZONES_5_1, DEFAULT_STARTING_ZONES_6_2 } from '../data/defaultTeam';

describe('rotateZone (clockwise)', () => {
  it('Z1 → Z6', () => expect(rotateZone(1)).toBe(6));
  it('Z6 → Z5', () => expect(rotateZone(6)).toBe(5));
  it('Z5 → Z4', () => expect(rotateZone(5)).toBe(4));
  it('Z4 → Z3', () => expect(rotateZone(4)).toBe(3));
  it('Z3 → Z2', () => expect(rotateZone(3)).toBe(2));
  it('Z2 → Z1', () => expect(rotateZone(2)).toBe(1));
});

describe('rotateZoneBy', () => {
  it('0 steps returns same zone', () => {
    expect(rotateZoneBy(1, 0)).toBe(1);
    expect(rotateZoneBy(4, 0)).toBe(4);
  });

  it('6 steps returns same zone (full cycle)', () => {
    const zones: Zone[] = [1, 2, 3, 4, 5, 6];
    for (const z of zones) {
      expect(rotateZoneBy(z, 6)).toBe(z);
    }
  });

  it('2 steps: Z1 → Z5', () => expect(rotateZoneBy(1, 2)).toBe(5));
});

describe('getZoneAssignments', () => {
  it('rotation 0 returns starting zones unchanged', () => {
    const result = getZoneAssignments(DEFAULT_STARTING_ZONES_5_1, 0);
    expect(result).toEqual(DEFAULT_STARTING_ZONES_5_1);
  });

  it('rotation 1 moves everyone one step clockwise', () => {
    const result = getZoneAssignments(DEFAULT_STARTING_ZONES_5_1, 1);
    // setter starts Z1, after 1 rotation → Z6
    expect(result['setter']).toBe(6);
    // oh1 starts Z2, after 1 rotation → Z1
    expect(result['oh1']).toBe(1);
  });
});

describe('5-1 rotation naming', () => {
  it('P1 means setter in Zone 1 (rotation 0)', () => {
    const label = getRotationLabel('5-1', 0, DEFAULT_STARTING_ZONES_5_1, DEFAULT_PLAYERS);
    expect(label.name).toBe('P1');
    expect(label.setterZone).toBe(1);
    expect(label.setterFrontRow).toBe(false);
  });

  it('P6 means setter in Zone 6 (rotation 1)', () => {
    const label = getRotationLabel('5-1', 1, DEFAULT_STARTING_ZONES_5_1, DEFAULT_PLAYERS);
    expect(label.name).toBe('P6');
    expect(label.setterZone).toBe(6);
    expect(label.setterFrontRow).toBe(false);
  });

  it('P5 means setter in Zone 5 (rotation 2)', () => {
    const label = getRotationLabel('5-1', 2, DEFAULT_STARTING_ZONES_5_1, DEFAULT_PLAYERS);
    expect(label.name).toBe('P5');
    expect(label.setterZone).toBe(5);
  });
});

describe('6-2 active setter identification', () => {
  it('identifies back-row setter as active', () => {
    // Rotation 0: S in Z1 (back row), OPP in Z4 (front row)
    // Active setter should be S (back row)
    const label = getRotationLabel('6-2', 0, DEFAULT_STARTING_ZONES_6_2, DEFAULT_PLAYERS);
    expect(label.activeSetter).toBeDefined();
    expect(label.activeSetter).toContain('back row');
    // S is Alex, should be active when in back row
    expect(label.activeSetter).toContain('Alex');
  });
});
