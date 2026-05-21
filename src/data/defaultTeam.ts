import type { Player, Team, Zone } from '../types';
import { ROLE_COLORS } from '../types';

// ─── Default 5-1 Roster ─────────────────────────────────────────
// Rotational order (opposite pairs across the diagonal):
//   S ↔ OPP, OH1 ↔ OH2, MB1 ↔ MB2
// Starting rotation 0 (P1): setter in zone 1
//   Z1=S, Z2=OH1, Z3=MB1, Z4=OPP, Z5=OH2, Z6=MB2

export const DEFAULT_PLAYERS: Player[] = [
  { id: 'setter',  name: 'Alex',   number: 1,  role: 'S',   color: ROLE_COLORS.S,   isLibero: false },
  { id: 'opp',     name: 'Casey',  number: 4,  role: 'OPP', color: ROLE_COLORS.OPP, isLibero: false },
  { id: 'oh1',     name: 'Jordan', number: 7,  role: 'OH1', color: ROLE_COLORS.OH1, isLibero: false },
  { id: 'oh2',     name: 'Riley',  number: 9,  role: 'OH2', color: ROLE_COLORS.OH2, isLibero: false },
  { id: 'mb1',     name: 'Sam',    number: 12, role: 'MB1', color: ROLE_COLORS.MB1, isLibero: false },
  { id: 'mb2',     name: 'Morgan', number: 15, role: 'MB2', color: ROLE_COLORS.MB2, isLibero: false },
];

export const LIBERO_PLAYER: Player = {
  id: 'libero', name: 'Taylor', number: 3, role: 'L', color: ROLE_COLORS.L, isLibero: true,
};

/** Build the libero player from team-specific overrides (name, number, color). */
export function getLiberoPlayer(team?: { liberoName?: string; liberoNumber?: number; liberoColor?: string }): Player {
  return {
    ...LIBERO_PLAYER,
    name: team?.liberoName ?? LIBERO_PLAYER.name,
    number: team?.liberoNumber ?? LIBERO_PLAYER.number,
    color: team?.liberoColor ?? LIBERO_PLAYER.color,
  };
}

// 5-1 starting zones (rotation 0 = P1 = setter in zone 1)
export const DEFAULT_STARTING_ZONES_5_1: Record<string, Zone> = {
  setter: 1,
  oh1:    2,
  mb1:    3,
  opp:    4,
  oh2:    5,
  mb2:    6,
};

// 6-2 starting zones (rotation 0 = P1 = setter1 in zone 1)
// setter1 in z1, setter2 in z4 (acting as right-side attacker when front row)
export const DEFAULT_STARTING_ZONES_6_2: Record<string, Zone> = {
  setter: 1,  // setter 1
  oh1:    2,
  mb1:    3,
  opp:    4,  // setter 2 / right-side in 6-2
  oh2:    5,
  mb2:    6,
};

// 6-0 starting zones (same as 5-1 rotation 0 for simplicity)
export const DEFAULT_STARTING_ZONES_6_0 = DEFAULT_STARTING_ZONES_5_1;

export const DEFAULT_TEAM: Team = {
  id: 'default',
  name: 'My Team',
  players: DEFAULT_PLAYERS,
  startingZones: DEFAULT_STARTING_ZONES_5_1,
  system: '5-1',
  liberoId: 'libero',
};

export function getDefaultStartingZones(system: string): Record<string, Zone> {
  switch (system) {
    case '6-2': return { ...DEFAULT_STARTING_ZONES_6_2 };
    case '6-0': return { ...DEFAULT_STARTING_ZONES_6_0 };
    default:    return { ...DEFAULT_STARTING_ZONES_5_1 };
  }
}
