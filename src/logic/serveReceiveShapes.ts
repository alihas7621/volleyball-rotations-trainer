import type { Zone, CourtCoord, Player, System } from '../types';
import { ZONE_ANCHORS } from './rotation';

// ─── 5-1 Rotation-Specific Serve-Receive Templates ─────────────
// Each template must be LEGAL under bubble-boundary validation.
// Positions are keyed by ROLE but must respect the ZONE the role occupies.
//
// Overlap constraints (bubble radius 0.45m):
//   Front L-R: Z4.x ≤ Z3.x ≤ Z2.x
//   Back  L-R: Z5.x ≤ Z6.x ≤ Z1.x
//   Front-back: Z4.y ≤ Z5.y, Z3.y ≤ Z6.y, Z2.y ≤ Z1.y

export interface RotationTemplate {
  name: string;
  description: string;
  passers: string[];
  nonPassers: string[];
  setter: 'front' | 'back';
  setterRelease: string;
  explanation: string;
  positions: Record<string, CourtCoord>;
}

// ─── P1 (rotation 0) ───────────────────────────────────────────
// Zones: Z1=S, Z2=OH1, Z3=MB1, Z4=OPP, Z5=OH2, Z6=MB2
// Front row (L→R): OPP(Z4) - MB1(Z3) - OH1(Z2)
// Back row  (L→R): OH2(Z5) - MB2(Z6) - S(Z1)
const P1_TEMPLATE: RotationTemplate = {
  name: 'P1 — Setter Back Right',
  description: 'Setter in Z1 (back row right). Releases to right-front after serve.',
  passers: ['OPP', 'OH1', 'OH2'],
  nonPassers: ['S', 'MB1', 'MB2'],
  setter: 'back',
  setterRelease: 'S releases from right-back to right-front target (x≈7, y≈1) after serve contact.',
  explanation: 'OPP (Z4, left-front) drops back to pass. MB1 (Z3) hides at net center for quick attack. OH1 (Z2, right-front) passes right side. OH2 (Z5) passes deep left. MB2 (Z6) center-back (libero replaces). Setter hides right-back.',
  positions: {
    OPP: { x: 1.5, y: 2.5 },   // Z4 left-front, passes
    MB1: { x: 4.5, y: 0.8 },   // Z3 net center, hidden
    OH1: { x: 7.5, y: 2.5 },   // Z2 right-front, passes
    OH2: { x: 1.5, y: 7.0 },   // Z5 deep left, passes
    MB2: { x: 4.5, y: 6.5 },   // Z6 center-back (libero)
    S:   { x: 7.5, y: 6.5 },   // Z1 right-back, hides
  },
};

// ─── P6 (rotation 1) ───────────────────────────────────────────
// Zones: Z6=S, Z1=OH1, Z2=MB1, Z3=OPP, Z4=OH2, Z5=MB2
// Front row (L→R): OH2(Z4) - OPP(Z3) - MB1(Z2)
// Back row  (L→R): MB2(Z5) - S(Z6) - OH1(Z1)
const P6_TEMPLATE: RotationTemplate = {
  name: 'P6 — Setter Back Center',
  description: 'Setter in Z6 (back row center). Releases to right-front after serve.',
  passers: ['OH2', 'OPP', 'OH1'],
  nonPassers: ['S', 'MB1', 'MB2'],
  setter: 'back',
  setterRelease: 'S releases from center-back to right-front after serve contact. Must stay between Z5 and Z1.',
  explanation: 'OH2 (Z4, left-front) passes. OPP (Z3, center-front) can pass or attack. MB1 (Z2) hides at right net for quick. MB2 (Z5) left-back (libero replaces). Setter hides center-back. OH1 (Z1) passes right-back.',
  positions: {
    OH2: { x: 1.5, y: 2.0 },   // Z4 left-front, passes
    OPP: { x: 4.0, y: 1.5 },   // Z3 center-front, passes
    MB1: { x: 7.5, y: 0.8 },   // Z2 right net, hidden
    MB2: { x: 1.5, y: 6.5 },   // Z5 left-back (libero)
    S:   { x: 5.5, y: 6.5 },   // Z6 center-back, hides
    OH1: { x: 7.5, y: 6.5 },   // Z1 right-back, passes
  },
};

// ─── P5 (rotation 2) ───────────────────────────────────────────
// Zones: Z5=S, Z6=OH1, Z1=MB1, Z2=OPP, Z3=OH2, Z4=MB2
// Front row (L→R): MB2(Z4) - OH2(Z3) - OPP(Z2)
// Back row  (L→R): S(Z5) - OH1(Z6) - MB1(Z1)
const P5_TEMPLATE: RotationTemplate = {
  name: 'P5 — Setter Back Left',
  description: 'Setter in Z5 (back row left). Hardest rotation for setter release.',
  passers: ['OH2', 'OPP', 'OH1'],
  nonPassers: ['S', 'MB1', 'MB2'],
  setter: 'back',
  setterRelease: 'S releases from left-back to right-front — longest path. Must stay left of Z6 and behind Z4.',
  explanation: 'MB2 (Z4) hides at left net for quick. OH2 (Z3) passes center-front. OPP (Z2) passes right-front. S hides deep left. OH1 (Z6) passes center-back. MB1 (Z1) right-back (libero replaces).',
  positions: {
    MB2: { x: 1.5, y: 0.8 },   // Z4 left net, hidden
    OH2: { x: 4.0, y: 2.0 },   // Z3 center-front, passes
    OPP: { x: 7.5, y: 2.5 },   // Z2 right-front, passes
    S:   { x: 1.2, y: 6.5 },   // Z5 deep left, hides
    OH1: { x: 4.5, y: 6.5 },   // Z6 center-back, passes
    MB1: { x: 7.5, y: 6.5 },   // Z1 right-back (libero)
  },
};

// ─── P4 (rotation 3) ───────────────────────────────────────────
// Zones: Z4=S, Z5=OH1, Z6=MB1, Z1=OPP, Z2=OH2, Z3=MB2
// Front row (L→R): S(Z4) - MB2(Z3) - OH2(Z2)
// Back row  (L→R): OH1(Z5) - MB1(Z6) - OPP(Z1)
const P4_TEMPLATE: RotationTemplate = {
  name: 'P4 — Setter Front Left',
  description: 'Setter in Z4 (front row left). Sets from left-front near net.',
  passers: ['OH2', 'OH1', 'OPP'],
  nonPassers: ['S', 'MB1', 'MB2'],
  setter: 'front',
  setterRelease: 'Setter is front row — no release needed. Sets from left-front and slides right to target.',
  explanation: 'S (Z4) at left net, sets. MB2 (Z3) hides at net center. OH2 (Z2, right-front) passes. OH1 (Z5) passes deep left. MB1 (Z6) center-back (libero replaces). OPP (Z1) passes deep right.',
  positions: {
    S:   { x: 1.5, y: 0.8 },   // Z4 left net, sets
    MB2: { x: 4.5, y: 0.8 },   // Z3 net center, hidden
    OH2: { x: 7.5, y: 2.0 },   // Z2 right-front, passes
    OH1: { x: 1.5, y: 7.0 },   // Z5 deep left, passes
    MB1: { x: 4.5, y: 6.5 },   // Z6 center-back (libero)
    OPP: { x: 7.5, y: 6.5 },   // Z1 right-back, passes
  },
};

// ─── P3 (rotation 4) ───────────────────────────────────────────
// Zones: Z3=S, Z4=OH1, Z5=MB1, Z6=OPP, Z1=OH2, Z2=MB2
// Front row (L→R): OH1(Z4) - S(Z3) - MB2(Z2)
// Back row  (L→R): MB1(Z5) - OPP(Z6) - OH2(Z1)
const P3_TEMPLATE: RotationTemplate = {
  name: 'P3 — Setter Front Center',
  description: 'Setter in Z3 (front row center). Ideal setting position.',
  passers: ['OH1', 'OPP', 'OH2'],
  nonPassers: ['S', 'MB1', 'MB2'],
  setter: 'front',
  setterRelease: 'Setter is front row center — ideal position. No release needed.',
  explanation: 'OH1 (Z4, left-front) attacks. S (Z3) at net center, sets. MB2 (Z2) hides at right net. MB1 (Z5) left-back (libero replaces). OPP (Z6) passes center-back. OH2 (Z1) passes deep right.',
  positions: {
    OH1: { x: 1.5, y: 1.5 },   // Z4 left-front, attacks
    S:   { x: 4.5, y: 0.8 },   // Z3 center net, sets
    MB2: { x: 7.5, y: 0.8 },   // Z2 right net, hidden
    MB1: { x: 1.5, y: 6.5 },   // Z5 left-back (libero)
    OPP: { x: 4.5, y: 7.0 },   // Z6 center-back, passes
    OH2: { x: 7.5, y: 7.0 },   // Z1 right-back, passes
  },
};

// ─── P2 (rotation 5) ───────────────────────────────────────────
// Zones: Z2=S, Z3=OH1, Z4=MB1, Z5=OPP, Z6=OH2, Z1=MB2
// Front row (L→R): MB1(Z4) - OH1(Z3) - S(Z2)
// Back row  (L→R): OPP(Z5) - OH2(Z6) - MB2(Z1)
const P2_TEMPLATE: RotationTemplate = {
  name: 'P2 — Setter Front Right',
  description: 'Setter in Z2 (front row right). Best rotation — already at target.',
  passers: ['OH1', 'OPP', 'OH2'],
  nonPassers: ['S', 'MB1', 'MB2'],
  setter: 'front',
  setterRelease: 'Setter at right net — natural target position. No release needed.',
  explanation: 'MB1 (Z4) hides at left net for quick. OH1 (Z3) center-front, attacks. S (Z2) at right net, sets. OPP (Z5) passes deep left. OH2 (Z6) passes center-back. MB2 (Z1) right-back (libero replaces).',
  positions: {
    MB1: { x: 1.5, y: 0.8 },   // Z4 left net, hidden
    OH1: { x: 4.5, y: 1.5 },   // Z3 center-front, attacks
    S:   { x: 7.5, y: 0.8 },   // Z2 right net, sets
    OPP: { x: 1.5, y: 7.0 },   // Z5 deep left, passes
    OH2: { x: 4.5, y: 7.0 },   // Z6 center-back, passes
    MB2: { x: 7.5, y: 6.5 },   // Z1 right-back (libero)
  },
};

const TEMPLATES_51: RotationTemplate[] = [
  P1_TEMPLATE, P6_TEMPLATE, P5_TEMPLATE,
  P4_TEMPLATE, P3_TEMPLATE, P2_TEMPLATE,
];

/**
 * Get 5-1 rotation-specific serve-receive positions.
 * Maps roles to actual player IDs using zone assignments.
 */
function get51ReceivePositions(
  zones: Record<string, Zone>,
  players: Player[],
  rotationIndex: number
): Record<string, CourtCoord> {
  const template = TEMPLATES_51[rotationIndex % 6];
  const coords: Record<string, CourtCoord> = {};

  for (const [pid, zone] of Object.entries(zones)) {
    const player = players.find(p => p.id === pid);
    if (!player) continue;

    const roleKey = player.role;
    if (template.positions[roleKey]) {
      coords[pid] = { ...template.positions[roleKey] };
    } else {
      coords[pid] = { ...ZONE_ANCHORS[zone] };
    }
  }

  return coords;
}

function defaultPositions(zones: Record<string, Zone>): Record<string, CourtCoord> {
  const coords: Record<string, CourtCoord> = {};
  for (const [pid, zone] of Object.entries(zones)) {
    coords[pid] = { ...ZONE_ANCHORS[zone] };
  }
  return coords;
}

export function homeBasePositions(
  zones: Record<string, Zone>,
  players: Player[]
): Record<string, CourtCoord> {
  const coords: Record<string, CourtCoord> = {};

  for (const [pid, zone] of Object.entries(zones)) {
    const player = players.find(p => p.id === pid);
    if (!player) continue;

    const front = zone === 2 || zone === 3 || zone === 4;

    switch (player.role) {
      case 'S':
        coords[pid] = { x: 7.0, y: 0.8 };
        break;
      case 'OPP':
        coords[pid] = front ? { x: 7.5, y: 1.0 } : { x: 7.5, y: 5.5 };
        break;
      case 'OH1':
      case 'OH2':
        coords[pid] = front ? { x: 1.5, y: 1.0 } : { x: 3.0, y: 6.5 };
        break;
      case 'MB1':
      case 'MB2':
        coords[pid] = front ? { x: 4.5, y: 0.8 } : { x: 4.5, y: 6.0 };
        break;
      case 'L':
        coords[pid] = { x: 4.5, y: 7.0 };
        break;
      default:
        coords[pid] = { ...ZONE_ANCHORS[zone] };
    }
  }

  return coords;
}

export function getRotationTemplate(rotationIndex: number): RotationTemplate {
  return TEMPLATES_51[rotationIndex % 6];
}

export interface ServeReceivePresetConfig {
  name: string;
  description: string;
  getPositions: (
    zones: Record<string, Zone>,
    players: Player[],
    system: System,
    rotationIndex: number
  ) => Record<string, CourtCoord>;
}

export const SERVE_RECEIVE_PRESETS: ServeReceivePresetConfig[] = [
  {
    name: 'Rotational Base',
    description: 'Players at their rotational zone anchors (no tactical shaping)',
    getPositions: (zones) => defaultPositions(zones),
  },
  {
    name: '3-Person Receive (5-1)',
    description: 'Rotation-specific: setter and MBs hidden, passers spread',
    getPositions: (zones, players, _system, rotationIndex) =>
      get51ReceivePositions(zones, players, rotationIndex),
  },
  {
    name: 'Home Base (Post-Serve)',
    description: 'Transition positions after serve contact — where players release to',
    getPositions: (zones, players) => homeBasePositions(zones, players),
  },
];
