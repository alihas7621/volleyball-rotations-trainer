import type { DisplayToggles } from '../types';

interface DisplayToggleBarProps {
  toggles: DisplayToggles;
  onChange: (toggles: DisplayToggles) => void;
}

const TOGGLE_CONFIG: { key: keyof DisplayToggles; label: string }[] = [
  { key: 'showZones', label: 'Zones' },
  { key: 'showFrontBackRow', label: 'Front/Back' },
  { key: 'showOverlapLines', label: 'Overlap Lines' },
  { key: 'showRoleLabels', label: 'Roles' },
  { key: 'showGhostPositions', label: 'Ghost Positions' },
  { key: 'showBeginnerExplanations', label: 'Beginner Tips' },
  { key: 'showReceiveShape', label: 'Receive Shape' },
  { key: 'showHomeBase', label: 'Home Base' },
];

export default function DisplayToggleBar({ toggles, onChange }: DisplayToggleBarProps) {
  return (
    <div className="flex flex-wrap gap-1.5 py-2">
      {TOGGLE_CONFIG.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange({ ...toggles, [key]: !toggles[key] })}
          className={`px-2 py-1 rounded-full text-[11px] font-medium transition-all ${
            toggles[key]
              ? 'bg-amber-400 text-deep shadow-sm'
              : 'bg-elevated text-text-secondary hover:bg-hover'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
