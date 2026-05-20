import type { Player, Zone, CourtCoord } from '../types';
import { BACK_ROW_ZONES } from '../types';

/**
 * Apply libero substitutions: replace back-row middle blockers with the libero.
 * Returns updated player list and coordinates with the libero swapped in.
 */
export function applyLiberoSubstitutions(
  players: Player[],
  zones: Record<string, Zone>,
  coordinates: Record<string, CourtCoord>,
  libero: Player,
  replacesRole: 'MB1' | 'MB2' | 'both'
): {
  players: Player[];
  coordinates: Record<string, CourtCoord>;
  replacedIds: string[];
} {
  const replacedIds: string[] = [];
  const newPlayers = [...players];
  const newCoords = { ...coordinates };

  for (const [pid, zone] of Object.entries(zones)) {
    if (!BACK_ROW_ZONES.includes(zone)) continue;

    const player = players.find(p => p.id === pid);
    if (!player) continue;

    const shouldReplace =
      (replacesRole === 'both' && (player.role === 'MB1' || player.role === 'MB2')) ||
      (replacesRole === 'MB1' && player.role === 'MB1') ||
      (replacesRole === 'MB2' && player.role === 'MB2');

    if (shouldReplace) {
      replacedIds.push(pid);
      // Replace the player in the list with a libero copy using their ID slot
      const idx = newPlayers.findIndex(p => p.id === pid);
      if (idx >= 0) {
        newPlayers[idx] = {
          ...libero,
          id: pid, // Keep the same ID slot for zone mapping
        };
      }
      // Keep the same court position
      if (coordinates[pid]) {
        newCoords[pid] = { ...coordinates[pid] };
      }
    }
  }

  return { players: newPlayers, coordinates: newCoords, replacedIds };
}

/**
 * Check if a player in a given zone should be replaced by the libero.
 */
export function shouldLiberoReplace(
  player: Player,
  zone: Zone,
  replacesRole: 'MB1' | 'MB2' | 'both'
): boolean {
  if (!BACK_ROW_ZONES.includes(zone)) return false;
  if (replacesRole === 'both') return player.role === 'MB1' || player.role === 'MB2';
  return player.role === replacesRole;
}
