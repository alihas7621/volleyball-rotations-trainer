import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold font-display mb-6">About</h1>

      <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
        <p>
          Volleyball Rotations Trainer is a free, open-source tool designed to help anyone involved in volleyball
          understand the 5-1 rotation system. Whether you're a player trying to avoid overlap faults, a coach
          preparing your lineup, or a referee sharpening your calls, this app gives you a clear, interactive
          view of how rotations work.
        </p>

        <p>
          The app runs entirely in your browser. There is no account to create, no data sent to a server, and
          nothing to install. Your team settings are stored in your browser's local storage so they persist
          between sessions.
        </p>

        <h2 className="text-lg font-bold font-display text-text-primary pt-4">Features</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Step through all six rotations of a 5-1 system</li>
          <li>Serve receive formation overlays</li>
          <li>Real-time overlap and positional fault detection</li>
          <li>Libero replacement visualization</li>
          <li>Quiz mode for testing rotation knowledge</li>
          <li>Timed challenge mode</li>
          <li>Customizable player names, numbers, and colors</li>
          <li>Multi-team support</li>
          <li>JSON export and import for team configurations</li>
        </ul>

        <h2 className="text-lg font-bold font-display text-text-primary pt-4">Open Source</h2>
        <p>
          This project is released under the MIT License. You can view the source code, report bugs, or
          contribute on{' '}
          <a
            href="https://github.com/alihas7621/volleyball-rotations-trainer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 underline"
          >
            GitHub
          </a>.
        </p>
      </div>

      <div className="mt-10">
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
