import type { RotationLabel } from '../types';

interface RotationControlsProps {
  rotationIndex: number;
  label: RotationLabel;
  onPrev: () => void;
  onNext: () => void;
}

export default function RotationControls({
  rotationIndex,
  label,
  onPrev,
  onNext,
}: RotationControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <button
        onClick={onPrev}
        className="px-4 py-2 bg-elevated hover:bg-hover text-text-primary rounded-lg font-medium text-sm transition-colors disabled:opacity-40"
        disabled={rotationIndex <= 0}
      >
        Prev
      </button>

      <div className="text-center min-w-[160px]">
        <div className="text-lg font-bold text-text-primary font-display">
          {label.system} {label.name}
        </div>
        <div className="text-xs text-text-secondary">
          Rotation {rotationIndex + 1}/6 &middot; Setter {label.setterFrontRow ? 'front row' : 'back row'}
        </div>
        {label.activeSetter && (
          <div className="text-[10px] text-purple-400">Active: {label.activeSetter}</div>
        )}
      </div>

      <button
        onClick={onNext}
        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-40"
        disabled={rotationIndex >= 5}
      >
        Next
      </button>

      {/* Rotation dots */}
      <div className="flex gap-1 ml-2">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === rotationIndex ? 'bg-amber-400 scale-125' : 'bg-hover'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
