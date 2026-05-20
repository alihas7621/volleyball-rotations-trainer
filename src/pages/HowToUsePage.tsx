import { Link } from 'react-router-dom';

const STEPS = [
  {
    number: '1',
    title: 'Set Up Your Team',
    description:
      'Go to Settings in the trainer and customize your players. Set names, jersey numbers, roles (Setter, Opposite, Outside Hitters, Middle Blockers, Libero), and starting zones.',
  },
  {
    number: '2',
    title: 'Learn Rotations',
    description:
      'In Learn mode, step through each of the six rotations. The court shows where every player should stand. Toggle overlays to see serve receive formations and overlap rules.',
  },
  {
    number: '3',
    title: 'Understand Overlaps',
    description:
      'Enable overlap lines to see which players must maintain their relative positions. Red lines indicate illegal overlaps. Amber means dangerously close. Green means safe.',
  },
  {
    number: '4',
    title: 'Toggle Libero',
    description:
      'Enable the libero in Settings to see when and where the libero replaces a middle blocker in back-row rotations. You can choose which MB the libero replaces.',
  },
  {
    number: '5',
    title: 'Test Yourself',
    description:
      'Switch to Quiz mode and try placing players in their correct positions. The app tells you immediately if you got it right. Challenge mode adds a timer.',
  },
];

export default function HowToUsePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold font-display mb-6">How to Use</h1>

      <div className="space-y-6">
        {STEPS.map(step => (
          <div key={step.number} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-deep flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
              {step.number}
            </div>
            <div>
              <h3 className="text-base font-bold font-display mb-1">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-5 bg-surface rounded-xl border border-elevated/50">
        <h3 className="text-base font-bold font-display mb-2">Display Options</h3>
        <p className="text-sm text-text-secondary leading-relaxed mb-3">
          In Learn mode, use the toggle bar to control what appears on the court:
        </p>
        <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
          <li><strong className="text-text-primary">Zones</strong> - Show zone numbers on the court</li>
          <li><strong className="text-text-primary">Roles</strong> - Show role labels on player tokens</li>
          <li><strong className="text-text-primary">Ghosts</strong> - Show base positions as faded tokens</li>
          <li><strong className="text-text-primary">Overlap Lines</strong> - Show positional rule lines</li>
          <li><strong className="text-text-primary">Serve Receive</strong> - Show serve receive formations</li>
        </ul>
      </div>

      <div className="mt-8">
        <Link
          to="/trainer"
          className="inline-block px-5 py-2 bg-amber-500 hover:bg-amber-400 text-deep font-bold rounded-lg text-sm transition-colors"
        >
          Open Trainer
        </Link>
      </div>
    </div>
  );
}
