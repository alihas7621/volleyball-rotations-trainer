// ─── Court Geometry ─────────────────────────────────────────────
// Single-team half-court: 9m wide × 9m deep
// x: 0 = left sideline, 9 = right sideline
// y: 0 = net, 3 = attack line, 9 = end line
// Smaller y = closer to net

export interface CourtCoord {
  x: number; // 0–9 meters from left sideline
  y: number; // 0–9 meters from net (0 = net, 9 = end line)
}

// ─── Bubble Geometry ────────────────────────────────────────────
// Each player token is a circle with BUBBLE_RADIUS (meters).
// Overlap validation uses bubble boundaries, not centre points or feet.

/** Player bubble radius in court meters */
export const BUBBLE_RADIUS = 0.45;

// ─── Zone ───────────────────────────────────────────────────────
export type Zone = 1 | 2 | 3 | 4 | 5 | 6;
export const ALL_ZONES: Zone[] = [1, 2, 3, 4, 5, 6];
export const FRONT_ROW_ZONES: Zone[] = [2, 3, 4];
export const BACK_ROW_ZONES: Zone[] = [1, 5, 6];

// ─── Roles ──────────────────────────────────────────────────────
export type Role = 'S' | 'OPP' | 'OH1' | 'OH2' | 'MB1' | 'MB2' | 'L';

export const ROLE_DISPLAY: Record<Role, string> = {
  S: 'Setter',
  OPP: 'Opposite',
  OH1: 'Outside 1',
  OH2: 'Outside 2',
  MB1: 'Middle 1',
  MB2: 'Middle 2',
  L: 'Libero',
};

export const ROLE_ABBREV: Record<Role, string> = {
  S: 'S',
  OPP: 'OPP',
  OH1: 'OH',
  OH2: 'OH',
  MB1: 'MB',
  MB2: 'MB',
  L: 'L',
};

export const ROLE_COLORS: Record<Role, string> = {
  S: '#eab308',
  OPP: '#8b5cf6',
  OH1: '#3b82f6',
  OH2: '#2563eb',
  MB1: '#ef4444',
  MB2: '#dc2626',
  L: '#22c55e',
};

// ─── Player ─────────────────────────────────────────────────────
export interface Player {
  id: string;
  name: string;
  number: number;
  role: Role;
  color: string;
  isLibero: boolean;
}

// ─── Systems ────────────────────────────────────────────────────
export type System = '6-0' | '5-1' | '6-2';

// ─── Rule Profile ───────────────────────────────────────────────
export type RuleProfile = 'fivb-2025' | 'legacy-both-teams';

// ─── Team ───────────────────────────────────────────────────────
export interface Team {
  id: string;
  name: string;
  players: Player[];
  startingZones: Record<string, Zone>; // playerId → starting zone (rotation 0)
  system: System;
  liberoId?: string;
  liberoName?: string;
  liberoNumber?: number;
  liberoColor?: string;
}

// ─── Three-Position Model ───────────────────────────────────────
// A. rotationalZone — the zone number the player is assigned to in this rotation
// B. receivePosition — pre-serve draggable position on court (must satisfy overlap)
// C. homeBasePosition — post-serve transition target
export interface PlayerPositionSet {
  playerId: string;
  rotationalZone: Zone;
  receivePosition: CourtCoord;
  homeBasePosition: CourtCoord;
}

// ─── Overlap Rules ──────────────────────────────────────────────
export type OverlapType = 'left-right' | 'front-back';

export interface OverlapRule {
  description: string;
  type: OverlapType;
  zoneA: Zone; // must be left-of or closer-to-net-than zoneB
  zoneB: Zone;
}

export type ViolationSeverity = 'legal' | 'close' | 'illegal';

export interface Violation {
  rule: OverlapRule;
  playerA: string;
  playerB: string;
  message: string;
  severity: ViolationSeverity;
  marginMeters: number; // positive = legal margin, negative = illegal distance
}

export interface ValidationResult {
  isLegal: boolean;
  violations: Violation[];
}

// ─── Rotation Naming ────────────────────────────────────────────
// 5-1: P1 = setter in zone 1, P6 = setter in zone 6, …
// 6-2: P1 = setter 1 in zone 1, etc.
export interface RotationLabel {
  system: System;
  rotationIndex: number;
  name: string; // e.g. "P1", "P6"
  setterZone: Zone;
  setterFrontRow: boolean;
  activeSetter?: string; // for 6-2: which setter is active
}

// ─── Display Toggles ───────────────────────────────────────────
export interface DisplayToggles {
  showZones: boolean;
  showFrontBackRow: boolean;
  showOverlapLines: boolean;
  showRoleLabels: boolean;
  showBeginnerExplanations: boolean;
  showGhostPositions: boolean;
  showReceiveShape: boolean;
  showHomeBase: boolean;
}

// ─── App Mode ───────────────────────────────────────────────────
export type AppMode = 'learn' | 'quiz' | 'settings' | 'setup' | 'zone-setup';

// ─── Formation Data ────────────────────────────────────────────
// Hardcoded positions for each rotation, keyed by role
export type FormationView = 'base' | 'serve-receive';

export interface FormationData {
  /** Positions keyed by role (S, OPP, OH1, OH2, MB1, MB2, L) */
  [role: string]: CourtCoord;
}

/** All 6 rotations × 2 views */
export interface FormationSet {
  rotations: {
    base: FormationData;
    'serve-receive': FormationData;
  }[];
}

// ─── Quiz ───────────────────────────────────────────────────────
export type QuizCategory = 'zone-placement' | 'build-serve-receive' | 'fix-overlap';

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  rotationName: string; // "P1", "P6", etc.
  rotationIndex: number;
  /** Starting positions for all players (what's shown initially) */
  startPositions: Record<string, CourtCoord>;
  /** Correct positions to check against */
  correctPositions: Record<string, CourtCoord>;
  /** For fix-overlap: which player IDs were shuffled */
  shuffledPlayerIds?: string[];
}

// ─── Challenge ──────────────────────────────────────────────────
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'referee';

export type ChallengeType =
  | 'build_serve_receive'
  | 'who_serves_next'
  | 'is_lineup_legal'
  | 'find_overlap_fault'
  | 'rotate_and_place'
  | 'identify_active_setter';

export interface Challenge {
  id: string;
  type: ChallengeType;
  difficulty: Difficulty;
  system: System;
  rotationName: string;
  title: string;
  description: string;
  rotationIndex: number;
  initialPositions?: Record<string, CourtCoord>;
  correctAnswer?: unknown;
}

// ─── Serve-Receive Preset ───────────────────────────────────────
export interface ServeReceivePreset {
  name: string;
  description: string;
  getPositions: (
    zoneAssignments: Record<string, Zone>,
    players: Player[],
    system: System,
    rotationIndex: number
  ) => Record<string, CourtCoord>;
}

// ─── Settings ───────────────────────────────────────────────────
export interface AppSettings {
  system: System;
  ruleProfile: RuleProfile;
  checkServingTeam: boolean; // educational toggle
  courtOrientation: 'net-top' | 'net-bottom';
  liberoEnabled: boolean;
  liberoReplacesRole: 'MB1' | 'MB2' | 'both'; // which MB the libero replaces in back row
}
