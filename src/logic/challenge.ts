import type { Challenge, ChallengeType, Difficulty, Player, Zone, System, CourtCoord } from '../types';
import { getZoneAssignments, getDefaultCoordForZone, getRotationLabel } from './rotation';

let challengeCounter = 0;

interface ChallengeTemplate {
  type: ChallengeType;
  difficulty: Difficulty;
  systems: System[];
  titleFn: (label: string) => string;
  descFn: (system: System, label: string, players: Player[], zones: Record<string, Zone>) => string;
}

const TEMPLATES: ChallengeTemplate[] = [
  {
    type: 'build_serve_receive',
    difficulty: 'beginner',
    systems: ['5-1', '6-2', '6-0'],
    titleFn: (label) => `Build Serve Receive (${label})`,
    descFn: (system, label) => {
      return `${system} ${label}, receiving serve. Place all players in a legal three-person receive formation.`;
    },
  },
  {
    type: 'who_serves_next',
    difficulty: 'beginner',
    systems: ['5-1', '6-2', '6-0'],
    titleFn: () => 'Who Serves Next?',
    descFn: (system, label, players, zones) => {
      const serverId = Object.entries(zones).find(([, z]) => z === 1)?.[0];
      const server = players.find(p => p.id === serverId);
      return `${system} ${label}: #${server?.number} ${server?.name} is serving. If the receiving team wins the rally, who serves next after rotation?`;
    },
  },
  {
    type: 'is_lineup_legal',
    difficulty: 'intermediate',
    systems: ['5-1', '6-2'],
    titleFn: (label) => `Legal Lineup? (${label})`,
    descFn: (system, label) =>
      `${system} ${label}, receiving serve. Look at the player positions on court. Is this lineup legal at the moment of serve?`,
  },
  {
    type: 'find_overlap_fault',
    difficulty: 'intermediate',
    systems: ['5-1', '6-2'],
    titleFn: (label) => `Find the Overlap Fault (${label})`,
    descFn: (system, label) =>
      `${system} ${label}, receiving serve. One or more players are positioned illegally. Find and fix all overlap faults before the serve.`,
  },
  {
    type: 'rotate_and_place',
    difficulty: 'advanced',
    systems: ['5-1', '6-2'],
    titleFn: (label) => `Rotate & Place (${label})`,
    descFn: (system, label) =>
      `${system} ${label}: The team just won the rally. Rotate all players clockwise and place them in legal positions for the next serve.`,
  },
  {
    type: 'identify_active_setter',
    difficulty: 'advanced',
    systems: ['6-2'],
    titleFn: (label) => `Active Setter? (6-2 ${label})`,
    descFn: (_system, label) =>
      `6-2 ${label}: Which setter is the active (back-row) setter for this rotation? Identify them.`,
  },
];

export function generateChallenge(
  players: Player[],
  startingZones: Record<string, Zone>,
  difficulty: Difficulty,
  system: System
): Challenge {
  const eligible = TEMPLATES.filter(t => {
    if (!t.systems.includes(system)) return false;
    if (difficulty === 'referee') return true;
    if (difficulty === 'advanced') return t.difficulty !== 'referee';
    if (difficulty === 'intermediate') return t.difficulty === 'beginner' || t.difficulty === 'intermediate';
    return t.difficulty === 'beginner';
  });

  const template = eligible[Math.floor(Math.random() * eligible.length)] || TEMPLATES[0];
  const rotationIndex = Math.floor(Math.random() * 6);
  const zones = getZoneAssignments(startingZones, rotationIndex);
  const label = getRotationLabel(system, rotationIndex, startingZones, players);

  challengeCounter++;

  const challenge: Challenge = {
    id: `challenge-${challengeCounter}`,
    type: template.type,
    difficulty: template.difficulty,
    system,
    rotationName: label.name,
    title: template.titleFn(label.name),
    description: template.descFn(system, label.name, players, zones),
    rotationIndex,
  };

  // For "find_overlap_fault", create intentionally illegal positions
  if (template.type === 'find_overlap_fault') {
    const positions: Record<string, CourtCoord> = {};
    for (const [pid, zone] of Object.entries(zones)) {
      positions[pid] = getDefaultCoordForZone(zone);
    }
    // Swap Z2 and Z3 x-coordinates to create left-right violation
    const z2pid = Object.entries(zones).find(([, z]) => z === 2)?.[0];
    const z3pid = Object.entries(zones).find(([, z]) => z === 3)?.[0];
    if (z2pid && z3pid) {
      const tmp = positions[z2pid].x;
      positions[z2pid].x = positions[z3pid].x;
      positions[z3pid].x = tmp;
    }
    challenge.initialPositions = positions;
  }

  return challenge;
}

export function getNextServerId(
  players: Player[],
  startingZones: Record<string, Zone>,
  currentRotation: number
): string | undefined {
  const nextZones = getZoneAssignments(startingZones, (currentRotation + 1) % 6);
  return Object.entries(nextZones).find(([, zone]) => zone === 1)?.[0];
}
