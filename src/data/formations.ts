import type { CourtCoord } from '../types';

/**
 * Hardcoded 5-1 formations for all 6 rotations.
 *
 * Starting lineup (P1 = setter in Z1):
 *   S(Z1) OH1(Z2) MB1(Z3) OPP(Z4) OH2(Z5) MB2(Z6)
 *
 * Positions configured by user via Setup screen.
 * In serve-receive, Libero (L) replaces the back-row MB automatically.
 */

export interface RotationFormation {
  name: string;
  setterZone: number;
  base: Record<string, CourtCoord>;
  serveReceive: Record<string, CourtCoord>;
}

export const FORMATIONS_5_1: RotationFormation[] = [
  // ── P1: Setter in Z1 (back right, serving) ──
  {
    name: 'P1',
    setterZone: 1,
    base: {
      S:   { x: 7.5,  y: 6.2  },
      OH1: { x: 7.5,  y: 1.5  },
      MB1: { x: 4.5,  y: 1.5  },
      OPP: { x: 1.5,  y: 1.5  },
      OH2: { x: 1.5,  y: 6.2  },
      MB2: { x: 4.5,  y: 6.2  },
    },
    serveReceive: {
      S:   { x: 7.82, y: 5.6  },
      OH1: { x: 7.46, y: 5.16 },
      MB1: { x: 2.56, y: 2.08 },
      OPP: { x: 0.37, y: 2.96 },
      OH2: { x: 1.41, y: 5.74 },
      L:   { x: 4.5,  y: 6.2  },
    },
  },
  // ── P6: Setter in Z6 ──
  {
    name: 'P6',
    setterZone: 6,
    base: {
      S:   { x: 4.5,  y: 6.2  },
      OH1: { x: 7.5,  y: 6.2  },
      MB1: { x: 7.5,  y: 1.5  },
      OPP: { x: 4.5,  y: 1.5  },
      OH2: { x: 1.5,  y: 1.5  },
      MB2: { x: 1.5,  y: 6.2  },
    },
    serveReceive: {
      S:   { x: 6.49, y: 0.93 },
      OH1: { x: 7.42, y: 5.54 },
      MB1: { x: 7.92, y: 2.37 },
      OPP: { x: 6.76, y: 0.49 },
      OH2: { x: 1.47, y: 5.13 },
      L:   { x: 4.52, y: 6.05 },
    },
  },
  // ── P5: Setter in Z5 ──
  {
    name: 'P5',
    setterZone: 5,
    base: {
      S:   { x: 1.5,  y: 6.2  },
      OH1: { x: 4.5,  y: 6.2  },
      MB1: { x: 7.5,  y: 6.2  },
      OPP: { x: 7.5,  y: 1.5  },
      OH2: { x: 4.5,  y: 1.5  },
      MB2: { x: 1.5,  y: 1.5  },
    },
    serveReceive: {
      S:   { x: 0.43, y: 1.03 },
      OH1: { x: 4.5,  y: 6.2  },
      L:   { x: 7.5,  y: 6.2  },
      OPP: { x: 8.69, y: 3.42 },
      OH2: { x: 1.19, y: 5.92 },
      MB2: { x: 0.29, y: 0.5  },
    },
  },
  // ── P4: Setter in Z4 (front left) ──
  {
    name: 'P4',
    setterZone: 4,
    base: {
      S:   { x: 1.5,  y: 1.5  },
      OH1: { x: 1.5,  y: 6.2  },
      MB1: { x: 4.5,  y: 6.2  },
      OPP: { x: 7.5,  y: 6.2  },
      OH2: { x: 7.5,  y: 1.5  },
      MB2: { x: 4.5,  y: 1.5  },
    },
    serveReceive: {
      S:   { x: 0.36, y: 0.55 },
      OH1: { x: 1.52, y: 5.54 },
      L:   { x: 4.51, y: 6.37 },
      OPP: { x: 7.97, y: 8.2  },
      OH2: { x: 7.43, y: 5.74 },
      MB2: { x: 0.48, y: 1.14 },
    },
  },
  // ── P3: Setter in Z3 (front middle) ──
  {
    name: 'P3',
    setterZone: 3,
    base: {
      S:   { x: 4.5,  y: 1.5  },
      OH1: { x: 1.5,  y: 1.5  },
      MB1: { x: 1.5,  y: 6.2  },
      OPP: { x: 4.5,  y: 6.2  },
      OH2: { x: 7.5,  y: 6.2  },
      MB2: { x: 7.5,  y: 1.5  },
    },
    serveReceive: {
      S:   { x: 6.45, y: 0.53 },
      OH1: { x: 1.32, y: 5.54 },
      L:   { x: 4.36, y: 6.33 },
      OPP: { x: 5.52, y: 7.91 },
      OH2: { x: 7.57, y: 5.66 },
      MB2: { x: 8.37, y: 2.64 },
    },
  },
  // ── P2: Setter in Z2 (front right) ──
  {
    name: 'P2',
    setterZone: 2,
    base: {
      S:   { x: 7.5,  y: 1.5  },
      OH1: { x: 4.5,  y: 1.5  },
      MB1: { x: 1.5,  y: 1.5  },
      OPP: { x: 1.5,  y: 6.2  },
      OH2: { x: 4.5,  y: 6.2  },
      MB2: { x: 7.5,  y: 6.2  },
    },
    serveReceive: {
      S:   { x: 5.96, y: 0.65 },
      OH1: { x: 1.72, y: 5.67 },
      MB1: { x: 0.27, y: 0.86 },
      OPP: { x: 2.95, y: 8.0  },
      OH2: { x: 4.5,  y: 6.2  },
      L:   { x: 7.49, y: 5.95 },
    },
  },
];

/** Get formation by rotation index (0-5) */
export function getFormation(rotationIndex: number): RotationFormation {
  return FORMATIONS_5_1[rotationIndex % 6];
}
