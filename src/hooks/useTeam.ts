import { useState, useEffect, useCallback } from 'react';
import type { Player, Team, Zone, System, AppSettings } from '../types';
import { DEFAULT_TEAM, getDefaultStartingZones } from '../data/defaultTeam';

const TEAMS_KEY = 'vrt-teams';
const ACTIVE_KEY = 'vrt-active-team';
const SETTINGS_KEY = 'vrt-settings';

const DEFAULT_SETTINGS: AppSettings = {
  system: '5-1',
  ruleProfile: 'fivb-2025',
  checkServingTeam: false,
  courtOrientation: 'net-top',
  liberoEnabled: true,
  liberoReplacesRole: 'both',
};

function loadTeams(): Team[] {
  try {
    const stored = localStorage.getItem(TEAMS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [DEFAULT_TEAM];
}

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

export function useTeam() {
  const [teams, setTeams] = useState<Team[]>(loadTeams);
  const [activeTeamId, setActiveTeamId] = useState<string>(() =>
    localStorage.getItem(ACTIVE_KEY) || DEFAULT_TEAM.id
  );
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const activeTeam = teams.find(t => t.id === activeTeamId) || teams[0];

  useEffect(() => {
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_KEY, activeTeamId);
  }, [activeTeamId]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updatePlayer = useCallback((playerId: string, updates: Partial<Player>) => {
    setTeams(prev => prev.map(team =>
      team.id === activeTeamId
        ? { ...team, players: team.players.map(p => p.id === playerId ? { ...p, ...updates } : p) }
        : team
    ));
  }, [activeTeamId]);

  const updateStartingZone = useCallback((playerId: string, zone: Zone) => {
    setTeams(prev => prev.map(team =>
      team.id === activeTeamId
        ? { ...team, startingZones: { ...team.startingZones, [playerId]: zone } }
        : team
    ));
  }, [activeTeamId]);

  const updateSystem = useCallback((system: System) => {
    setSettings(prev => ({ ...prev, system }));
    setTeams(prev => prev.map(team =>
      team.id === activeTeamId
        ? { ...team, system, startingZones: getDefaultStartingZones(system) }
        : team
    ));
  }, [activeTeamId]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const saveTeam = useCallback((team: Team) => {
    setTeams(prev => {
      const exists = prev.find(t => t.id === team.id);
      return exists ? prev.map(t => t.id === team.id ? team : t) : [...prev, team];
    });
  }, []);

  const deleteTeam = useCallback((teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
    if (activeTeamId === teamId) setActiveTeamId(DEFAULT_TEAM.id);
  }, [activeTeamId]);

  const exportTeam = useCallback((): string => {
    return JSON.stringify(activeTeam, null, 2);
  }, [activeTeam]);

  const importTeam = useCallback((json: string): boolean => {
    try {
      if (teams.length >= 3) return false;
      const team = JSON.parse(json) as Team;
      if (team.id && team.name && team.players && team.startingZones) {
        team.id = `imported-${Date.now()}`;
        saveTeam(team);
        setActiveTeamId(team.id);
        return true;
      }
    } catch { /* ignore */ }
    return false;
  }, [saveTeam, teams.length]);

  const resetApp = useCallback(() => {
    localStorage.removeItem(TEAMS_KEY);
    localStorage.removeItem(ACTIVE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    setTeams([DEFAULT_TEAM]);
    setActiveTeamId(DEFAULT_TEAM.id);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    teams, activeTeam, activeTeamId, settings,
    setActiveTeamId, updatePlayer, updateStartingZone,
    updateSystem, updateSettings, saveTeam, deleteTeam,
    exportTeam, importTeam, resetApp,
  };
}
