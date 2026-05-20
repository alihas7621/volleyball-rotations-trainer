export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold font-display mb-6">Contact</h1>

      <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
        <p>
          Volleyball Rotations Trainer is an open-source project. The best way to get in touch is through GitHub.
        </p>

        <div className="bg-surface rounded-xl p-5 border border-elevated/50 space-y-3">
          <div>
            <h3 className="text-base font-bold font-display text-text-primary mb-1">Report a Bug</h3>
            <p>
              Found something broken? Open an issue on the{' '}
              <a
                href="https://github.com/alihas7621/volleyball-rotations-trainer/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 underline"
              >
                GitHub Issues
              </a>{' '}
              page.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold font-display text-text-primary mb-1">Feature Requests</h3>
            <p>
              Have an idea for a new feature? Open an issue with the "enhancement" label and describe what
              you'd like to see.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold font-display text-text-primary mb-1">Contribute</h3>
            <p>
              Pull requests are welcome. Check the{' '}
              <a
                href="https://github.com/alihas7621/volleyball-rotations-trainer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 underline"
              >
                repository
              </a>{' '}
              for the source code and contribution guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
