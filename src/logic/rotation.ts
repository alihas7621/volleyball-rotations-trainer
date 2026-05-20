import type { Zone, CourtCoord, RotationLabel, System, Player } from '../types';
import { FRONT_ROW_ZONES, BACK_ROW_ZONES, ROLE_ABBREV } from '../types';

// ─── Clockwise rotation order ───────────────────────────────────
// 1→6→5→4→3→2→1
const ROTATION_ORDER: Zone[] = [1, 6, 5, 4, 3, 2];

export function rotateZone(zone: Zone): Zone {
  const idx = ROTATION_ORDER.indexOf(zone);
  return ROTATION_ORDER[(idx + 1) % 6];
}

export function rotateZoneBy(zone: Zone, steps: number): Zone {
  const idx = ROTATION_ORDER.indexOf(zone);
  const newIdx = ((idx + steps) % 6 + 6) % 6;
  return ROTATION_ORDER[newIdx];
}

export function getZoneAssignments(
  startingZones: Record<string, Zone>,
  rotationIndex: number
): Record<string, Zone> {
  const result: Record<string, Zone> = {};
  for (const [playerId, startZone] of Object.entries(startingZones)) {
    result[playerId] = rotateZoneBy(startZone, rotationIndex);
  }
  return result;
}

export function rotateLineup(zones: Record<string, Zone>): Record<string, Zone> {
  return getZoneAssignments(zones, 1);
}

// ─── Zone queries ───────────────────────────────────────────────

export function isFrontRow(zone: Zone): boolean {
  return FRONT_ROW_ZONES.includes(zone);
}

export function isBackRow(zone: Zone): boolean {
  return BACK_ROW_ZONES.includes(zone);
}

export function getServer(zones: Record<string, Zone>): string | undefined {
  return Object.entries(zones).find(([, z]) => z === 1)?.[0];
}

export function getPlayerInZone(zones: Record<string, Zone>, zone: Zone): string | undefined {
  return Object.entries(zones).find(([, z]) => z === zone)?.[0];
}

// ─── Court coordinates (9m × 9m half-court) ─────────────────────
// Net at y=0, attack line at y=3, end line at y=9

export const ZONE_ANCHORS: Record<Zone, CourtCoord> = {
  4: { x: 1.5, y: 1.5 },  // left front
  3: { x: 4.5, y: 1.5 },  // middle front
  2: { x: 7.5, y: 1.5 },  // right front
  5: { x: 1.5, y: 6.2 },  // left back
  6: { x: 4.5, y: 6.2 },  // middle back
  1: { x: 7.5, y: 6.2 },  // right back
};

export const SERVER_ANCHOR: CourtCoord = { x: 7.5, y: 10.0 };

export function getDefaultCoordForZone(zone: Zone): CourtCoord {
  return { ...ZONE_ANCHORS[zone] };
}

// ─── Zone labels ────────────────────────────────────────────────

export const ZONE_LABELS: Record<Zone, string> = {
  1: '1 RB',
  2: '2 RF',
  3: '3 MF',
  4: '4 LF',
  5: '5 LB',
  6: '6 MB',
};

export const ZONE_FULL_LABELS: Record<Zone, string> = {
  1: 'Right Back (Server)',
  2: 'Right Front',
  3: 'Middle Front',
  4: 'Left Front',
  5: 'Left Back',
  6: 'Middle Back',
};

// ─── System-aware rotation naming ───────────────────────────────

export function getRotationLabel(
  system: System,
  rotationIndex: number,
  startingZones: Record<string, Zone>,
  players: Player[]
): RotationLabel {
  const zones = getZoneAssignments(startingZones, rotationIndex);

  // Find setter(s)
  const setterEntry = Object.entries(zones).find(([id]) => {
    const p = players.find(pl => pl.id === id);
    return p?.role === 'S';
  });
  const setterZone = setterEntry ? setterEntry[1] : (1 as Zone);
  const setterFront = isFrontRow(setterZone);

  if (system === '6-0') {
    return {
      system,
      rotationIndex,
      name: `R${rotationIndex + 1}`,
      setterZone,
      setterFrontRow: setterFront,
    };
  }

  if (system === '5-1') {
    return {
      system,
      rotationIndex,
      name: `P${setterZone}`,
      setterZone,
      setterFrontRow: setterFront,
    };
  }

  // 6-2: find both setters (S and OPP act as setter pair)
  const setter1Entry = Object.entries(zones).find(([id]) => {
    const p = players.find(pl => pl.id === id);
    return p?.role === 'S';
  });
  const setter2Entry = Object.entries(zones).find(([id]) => {
    const p = players.find(pl => pl.id === id);
    return p?.role === 'OPP';
  });

  const s1Zone = setter1Entry?.[1] ?? (1 as Zone);
  const s1BackRow = isBackRow(s1Zone);
  const activeSetterId = s1BackRow ? setter1Entry?.[0] : setter2Entry?.[0];
  const activeSetterPlayer = players.find(p => p.id === activeSetterId);

  return {
    system,
    rotationIndex,
    name: `P${s1Zone}`,
    setterZone: s1Zone,
    setterFrontRow: isFrontRow(s1Zone),
    activeSetter: activeSetterPlayer
      ? `${activeSetterPlayer.name} (#${activeSetterPlayer.number}), back row`
      : undefined,
  };
}

// ─── Rotation explanation ───────────────────────────────────────

export function getRotationExplanation(
  system: System,
  rotationIndex: number,
  players: Player[],
  zones: Record<string, Zone>
): string {
  const label = getRotationLabel(system, rotationIndex, zones, players);
  const serverId = getServer(zones);
  const serverPlayer = players.find(p => p.id === serverId);

  const frontPlayers = Object.entries(zones)
    .filter(([, z]) => isFrontRow(z))
    .sort(([, a], [, b]) => a - b)
    .map(([id, z]) => {
      const p = players.find(pl => pl.id === id)!;
      return `#${p.number} ${p.name} (${ROLE_ABBREV[p.role]}) in Z${z}`;
    });

  const backPlayers = Object.entries(zones)
    .filter(([, z]) => isBackRow(z))
    .sort(([, a], [, b]) => {
      const order = [5, 6, 1];
      return order.indexOf(a) - order.indexOf(b);
    })
    .map(([id, z]) => {
      const p = players.find(pl => pl.id === id)!;
      return `#${p.number} ${p.name} (${ROLE_ABBREV[p.role]}) in Z${z}`;
    });

  let text = `${system} ${label.name} — `;
  text += label.setterFrontRow ? 'Setter front row' : 'Setter back row';
  if (label.activeSetter) {
    text += ` | Active setter: ${label.activeSetter}`;
  }
  text += '\n\n';
  text += `Server: #${serverPlayer?.number} ${serverPlayer?.name} (${ROLE_ABBREV[serverPlayer?.role ?? 'S']})\n\n`;
  text += `Front row: ${frontPlayers.join(', ')}\n`;
  text += `Back row: ${backPlayers.join(', ')}`;

  return text;
}

// ─── Overlap explanation for a specific player ──────────────────

export function getPlayerOverlapExplanation(
  playerId: string,
  zones: Record<string, Zone>,
  players: Player[]
): string {
  const zone = zones[playerId];
  const player = players.find(p => p.id === playerId);
  if (!zone || !player) return '';

  const roleName = ROLE_ABBREV[player.role];
  const parts: string[] = [];

  // Left-right relationships
  if (zone === 4) parts.push('must be left of Z3');
  if (zone === 3) parts.push('must be between Z4 (left) and Z2 (right)');
  if (zone === 2) parts.push('must be right of Z3');
  if (zone === 5) parts.push('must be left of Z6');
  if (zone === 6) parts.push('must be between Z5 (left) and Z1 (right)');
  if (zone === 1) parts.push('must be right of Z6');

  // Front-back relationships
  if (zone === 4) parts.push('must be closer to net than Z5');
  if (zone === 3) parts.push('must be closer to net than Z6');
  if (zone === 2) parts.push('must be closer to net than Z1');
  if (zone === 5) parts.push('must be farther from net than Z4');
  if (zone === 6) parts.push('must be farther from net than Z3');
  if (zone === 1) parts.push('must be farther from net than Z2');

  return `${roleName} in Z${zone}: ${parts.join('; ')}.`;
}
