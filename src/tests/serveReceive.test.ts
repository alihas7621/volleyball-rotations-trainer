import { describe, it, expect } from 'vitest';
import { getRotationTemplate, SERVE_RECEIVE_PRESETS } from '../logic/serveReceiveShapes';
import { validateOverlap } from '../logic/validation';
import { getZoneAssignments } from '../logic/rotation';
import { DEFAULT_PLAYERS, DEFAULT_STARTING_ZONES_5_1 } from '../data/defaultTeam';

describe('serve-receive template legality', () => {
  for (let rot = 0; rot < 6; rot++) {
    it(`P${[1, 6, 5, 4, 3, 2][rot]} template (rotation ${rot}) is legal`, () => {
      const template = getRotationTemplate(rot);
      expect(template).toBeDefined();
      expect(template.positions).toBeDefined();

      const zones = getZoneAssignments(DEFAULT_STARTING_ZONES_5_1, rot);
      const positions = SERVE_RECEIVE_PRESETS[1].getPositions(zones, DEFAULT_PLAYERS, '5-1', rot);

      // Every player should have a position
      expect(Object.keys(positions).length).toBe(6);

      const result = validateOverlap(positions, zones);
      expect(result.isLegal).toBe(true);
      if (!result.isLegal) {
        // Helpful debug output if this ever fails
        for (const v of result.violations) {
          console.error(`  ${v.message} (margin: ${v.marginMeters.toFixed(3)}m)`);
        }
      }
    });
  }
});

describe('serve-receive template structure', () => {
  for (let rot = 0; rot < 6; rot++) {
    it(`rotation ${rot} has 3 passers and 3 non-passers`, () => {
      const template = getRotationTemplate(rot);
      expect(template.passers.length).toBe(3);
      expect(template.nonPassers.length).toBe(3);
      // No overlap between passers and non-passers
      for (const p of template.passers) {
        expect(template.nonPassers).not.toContain(p);
      }
    });
  }

  it('rotations 0-2 have setter in back row', () => {
    for (let rot = 0; rot < 3; rot++) {
      expect(getRotationTemplate(rot).setter).toBe('back');
    }
  });

  it('rotations 3-5 have setter in front row', () => {
    for (let rot = 3; rot < 6; rot++) {
      expect(getRotationTemplate(rot).setter).toBe('front');
    }
  });
});
