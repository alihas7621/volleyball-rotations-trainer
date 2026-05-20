import type { CourtCoord } from '../types';

/**
 * Hand-drawn tolerance zones for serve-receive positions.
 * Each zone is a polygon defining the acceptable area for a player,
 * plus the ideal center position.
 *
 * Keyed by rotation index (0-5), then by role.
 * In back-row rotations, MB is replaced by L (libero).
 */

export interface ToleranceZone {
  center: CourtCoord;
  polygon: CourtCoord[];
}

export type RotationToleranceZones = Record<string, ToleranceZone>;

/** Index 0=P1, 1=P6, 2=P5, 3=P4, 4=P3, 5=P2 */
export const TOLERANCE_ZONES: RotationToleranceZones[] = [
  // ── 0: P1 ──
  {
    S:   { center: { x: 7.82, y: 5.6 },  polygon: [{ x: 6.51, y: 4.04 }, { x: 8.88, y: 3.99 }, { x: 8.74, y: 7.07 }, { x: 6.5, y: 6.92 }] },
    OH1: { center: { x: 7.46, y: 5.16 }, polygon: [{ x: 5.54, y: 3.14 }, { x: 8.83, y: 3.18 }, { x: 8.7, y: 7.71 }, { x: 5.58, y: 7.47 }] },
    MB1: { center: { x: 2.56, y: 2.08 }, polygon: [{ x: 0.93, y: 0.26 }, { x: 3.71, y: 0.32 }, { x: 3.73, y: 3.1 }, { x: 1.06, y: 3.08 }] },
    OPP: { center: { x: 0.37, y: 2.96 }, polygon: [{ x: 0.22, y: 0.36 }, { x: 2.18, y: 0.41 }, { x: 2.05, y: 3.73 }, { x: 0.07, y: 3.85 }] },
    OH2: { center: { x: 1.41, y: 5.74 }, polygon: [{ x: 0.17, y: 3.44 }, { x: 3.54, y: 3.42 }, { x: 3.59, y: 8.37 }, { x: 0.16, y: 8.32 }] },
    L:   { center: { x: 4.5, y: 6.2 },   polygon: [{ x: 2.78, y: 3.47 }, { x: 6.23, y: 3.53 }, { x: 6.26, y: 8.58 }, { x: 2.73, y: 8.41 }] },
  },
  // ── 1: P6 ──
  {
    S:   { center: { x: 6.49, y: 0.93 }, polygon: [{ x: 5.11, y: 0.27 }, { x: 5.2, y: 2.78 }, { x: 8.79, y: 2.78 }, { x: 8.72, y: 0.26 }] },
    OH1: { center: { x: 7.42, y: 5.54 }, polygon: [{ x: 5.41, y: 3.3 }, { x: 8.7, y: 3.24 }, { x: 8.61, y: 8.41 }, { x: 5.6, y: 8.23 }] },
    MB1: { center: { x: 7.92, y: 2.37 }, polygon: [{ x: 6.34, y: 0.35 }, { x: 6.35, y: 3.01 }, { x: 8.75, y: 4.33 }, { x: 8.83, y: 0.26 }] },
    OPP: { center: { x: 6.76, y: 0.49 }, polygon: [{ x: 5.16, y: 0.22 }, { x: 5.27, y: 2.86 }, { x: 8.75, y: 2.86 }, { x: 8.83, y: 0.19 }] },
    OH2: { center: { x: 1.47, y: 5.13 }, polygon: [{ x: 0.18, y: 3.3 }, { x: 3.47, y: 3.42 }, { x: 3.53, y: 8.57 }, { x: 0.19, y: 8.52 }] },
    L:   { center: { x: 4.52, y: 6.05 }, polygon: [{ x: 2.82, y: 3.32 }, { x: 6.07, y: 3.34 }, { x: 6.12, y: 8.34 }, { x: 2.6, y: 8.17 }] },
  },
  // ── 2: P5 ──
  {
    S:   { center: { x: 0.43, y: 1.03 }, polygon: [{ x: 0.12, y: 0.13 }, { x: 2.21, y: 0.17 }, { x: 2.24, y: 2.87 }, { x: 0.08, y: 2.89 }] },
    OH1: { center: { x: 4.5, y: 6.2 },  polygon: [{ x: 2.64, y: 3.43 }, { x: 6.04, y: 3.42 }, { x: 5.99, y: 8.72 }, { x: 2.58, y: 8.69 }] },
    L:   { center: { x: 7.5, y: 6.2 },  polygon: [{ x: 5.87, y: 3.37 }, { x: 8.89, y: 3.04 }, { x: 8.72, y: 8.62 }, { x: 5.84, y: 8.51 }] },
    OPP: { center: { x: 8.69, y: 3.42 }, polygon: [{ x: 6.27, y: 0.44 }, { x: 8.81, y: 0.4 }, { x: 8.69, y: 4.48 }, { x: 6.35, y: 4.42 }] },
    OH2: { center: { x: 1.19, y: 5.92 }, polygon: [{ x: 0.29, y: 3.34 }, { x: 3.24, y: 3.38 }, { x: 3.37, y: 8.61 }, { x: 0.18, y: 8.67 }] },
    MB2: { center: { x: 0.29, y: 0.5 },  polygon: [{ x: 0.11, y: 0.09 }, { x: 2.27, y: 0.19 }, { x: 2.21, y: 2.87 }, { x: 0.06, y: 2.92 }] },
  },
  // ── 3: P4 ──
  {
    S:   { center: { x: 0.36, y: 0.55 }, polygon: [{ x: 0.12, y: 0.05 }, { x: 2.4, y: 0.19 }, { x: 2.48, y: 2.79 }, { x: 0.13, y: 2.83 }] },
    OH1: { center: { x: 1.52, y: 5.54 }, polygon: [{ x: 0.16, y: 3.22 }, { x: 3.18, y: 3.28 }, { x: 3.19, y: 8.55 }, { x: 0.12, y: 8.51 }] },
    L:   { center: { x: 4.51, y: 6.37 }, polygon: [{ x: 2.79, y: 3.24 }, { x: 5.92, y: 3.24 }, { x: 6.06, y: 8.8 }, { x: 2.77, y: 8.67 }] },
    OPP: { center: { x: 7.97, y: 8.2 },  polygon: [{ x: 5.24, y: 6.28 }, { x: 8.78, y: 6.32 }, { x: 8.83, y: 8.77 }, { x: 5.24, y: 8.67 }] },
    OH2: { center: { x: 7.43, y: 5.74 }, polygon: [{ x: 5.65, y: 3.22 }, { x: 8.75, y: 3.27 }, { x: 8.78, y: 8.26 }, { x: 5.62, y: 7.88 }] },
    MB2: { center: { x: 0.48, y: 1.14 }, polygon: [{ x: 0.06, y: 0.07 }, { x: 2.32, y: 0.19 }, { x: 2.35, y: 2.83 }, { x: 0.09, y: 2.85 }] },
  },
  // ── 4: P3 ──
  {
    S:   { center: { x: 6.45, y: 0.53 }, polygon: [{ x: 5.28, y: 0.3 }, { x: 8.86, y: 0.26 }, { x: 8.83, y: 3.29 }, { x: 5.4, y: 3.05 }] },
    OH1: { center: { x: 1.32, y: 5.54 }, polygon: [{ x: 0.12, y: 3.24 }, { x: 3.64, y: 3.28 }, { x: 3.76, y: 8.64 }, { x: 0.19, y: 8.61 }] },
    L:   { center: { x: 4.36, y: 6.33 }, polygon: [{ x: 2.63, y: 3.35 }, { x: 6.34, y: 3.29 }, { x: 6.3, y: 8.57 }, { x: 2.52, y: 8.42 }] },
    OPP: { center: { x: 5.52, y: 7.91 }, polygon: [{ x: 4.73, y: 5.97 }, { x: 8.06, y: 6.03 }, { x: 8.75, y: 8.59 }, { x: 4.72, y: 8.43 }] },
    OH2: { center: { x: 7.57, y: 5.66 }, polygon: [{ x: 5.47, y: 3.48 }, { x: 8.72, y: 3.5 }, { x: 8.76, y: 8.81 }, { x: 5.52, y: 8.51 }] },
    MB2: { center: { x: 8.37, y: 2.64 }, polygon: [{ x: 6.71, y: 0.93 }, { x: 8.86, y: 0.96 }, { x: 8.8, y: 3.9 }, { x: 6.22, y: 3.88 }] },
  },
  // ── 5: P2 ──
  {
    S:   { center: { x: 5.96, y: 0.65 }, polygon: [{ x: 3.49, y: 0.19 }, { x: 3.46, y: 1.55 }, { x: 8.72, y: 1.55 }, { x: 8.71, y: 0.22 }] },
    OH1: { center: { x: 1.72, y: 5.67 }, polygon: [{ x: 0.2, y: 3.39 }, { x: 2.85, y: 3.37 }, { x: 2.95, y: 8.67 }, { x: 0.33, y: 8.68 }] },
    MB1: { center: { x: 0.27, y: 0.86 }, polygon: [{ x: 0.2, y: 0.17 }, { x: 2.54, y: 0.17 }, { x: 2.55, y: 2.8 }, { x: 0.15, y: 2.75 }] },
    OPP: { center: { x: 2.95, y: 8.0 },  polygon: [{ x: 1.76, y: 6.74 }, { x: 4.46, y: 6.82 }, { x: 4.59, y: 8.72 }, { x: 1.73, y: 8.76 }] },
    OH2: { center: { x: 4.5, y: 6.2 },   polygon: [{ x: 2.59, y: 3.29 }, { x: 6.14, y: 3.31 }, { x: 6.08, y: 8.64 }, { x: 2.64, y: 8.54 }] },
    L:   { center: { x: 7.49, y: 5.95 }, polygon: [{ x: 5.41, y: 3.37 }, { x: 8.72, y: 3.36 }, { x: 8.65, y: 8.58 }, { x: 5.33, y: 8.42 }] },
  },
];
