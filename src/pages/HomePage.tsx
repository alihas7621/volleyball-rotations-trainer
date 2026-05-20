import { Link } from 'react-router-dom';

const FEATURES = [
  {
    title: '5-1 Rotations',
    description: 'Step through all six rotations of the 5-1 system. See exactly where each player should be on the court after every serve.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </svg>
    ),
  },
  {
    title: 'Overlap Validation',
    description: 'Drag players to check positioning rules in real time. The app highlights illegal overlaps and warns when players are dangerously close.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Serve Receive',
    description: 'Visualize standard serve-receive formations for each rotation. Understand where passers, hitters, and the setter position themselves.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    title: 'Libero Replacement',
    description: 'Toggle libero substitutions to see when and where the libero replaces middle blockers in back-row rotations.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
      </svg>
    ),
  },
  {
    title: 'Quiz Mode',
    description: 'Test your knowledge by placing players in the correct positions for each rotation. Get instant feedback on your answers.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Challenge Mode',
    description: 'Race against the clock. Timed challenges push you to identify rotations quickly, building the muscle memory coaches need.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6">
            <svg width="64" height="64" viewBox="0 0 48 48" className="mx-auto">
              <circle cx="24" cy="24" r="22" fill="#f59e0b" stroke="#a85a1d" strokeWidth="2"/>
              <path d="M24 2C24 2 10 14 10 24s14 22 14 22" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5"/>
              <path d="M24 2C24 2 38 14 38 24s-14 22-14 22" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5"/>
              <path d="M3 20h42" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5"/>
              <path d="M3 28h42" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5"/>
            </svg>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-display mb-4 text-text-primary">
            Volleyball Rotations Trainer
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            An interactive tool for learning 5-1 volleyball rotations, serve receive formations, overlap rules, and libero replacements.
            Built for players, coaches, and referees.
          </p>
          <Link
            to="/trainer"
            className="inline-block px-8 py-3 bg-amber-500 hover:bg-amber-400 text-deep font-bold rounded-lg text-base transition-colors shadow-lg shadow-amber-500/20"
          >
            Open Trainer
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 bg-base">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold font-display text-center mb-10">What You Can Do</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-surface rounded-xl p-6 border border-elevated/50">
                <div className="mb-3">{f.icon}</div>
                <h3 className="text-base font-bold font-display mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold font-display mb-6">Who Is This For?</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-sm text-text-secondary">
            <div className="bg-surface rounded-xl p-5 border border-elevated/50">
              <p className="text-3xl mb-2">&#x1F3D0;</p>
              <p className="font-bold text-text-primary mb-1">Players</p>
              <p>Understand your position in every rotation so you never get called for an overlap.</p>
            </div>
            <div className="bg-surface rounded-xl p-5 border border-elevated/50">
              <p className="text-3xl mb-2">&#x1F4CB;</p>
              <p className="font-bold text-text-primary mb-1">Coaches</p>
              <p>Use it as a teaching tool to show your team exactly where to stand.</p>
            </div>
            <div className="bg-surface rounded-xl p-5 border border-elevated/50">
              <p className="text-3xl mb-2">&#x1F6A9;</p>
              <p className="font-bold text-text-primary mb-1">Referees</p>
              <p>Sharpen your eye for positional faults by practicing with overlap detection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-base">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold font-display mb-3">Ready to learn?</h2>
          <p className="text-sm text-text-secondary mb-6">
            No sign-up required. Your settings are saved locally in your browser.
          </p>
          <Link
            to="/trainer"
            className="inline-block px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-deep font-bold rounded-lg text-sm transition-colors"
          >
            Start Training
          </Link>
        </div>
      </section>
    </div>
  );
}
