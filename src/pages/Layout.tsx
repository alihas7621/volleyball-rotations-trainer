import { Link, Outlet, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/trainer', label: 'Trainer' },
  { to: '/how-to-use', label: 'How to Use' },
  { to: '/about', label: 'About' },
];

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-deep text-text-primary flex flex-col">
      {/* Site nav */}
      <nav className="bg-base border-b border-elevated">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1">
          <Link to="/" className="flex items-center gap-2.5 py-3 mr-4">
            <svg width="28" height="28" viewBox="0 0 48 48" className="flex-shrink-0">
              <circle cx="24" cy="24" r="22" fill="#f59e0b" stroke="#a85a1d" strokeWidth="2"/>
              <path d="M24 2C24 2 10 14 10 24s14 22 14 22" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5"/>
              <path d="M24 2C24 2 38 14 38 24s-14 22-14 22" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5"/>
              <path d="M3 20h42" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5"/>
              <path d="M3 28h42" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5"/>
            </svg>
            <span className="hidden sm:block text-sm font-bold text-text-primary font-display">
              Volleyball Rotations
            </span>
          </Link>

          <div className="flex items-stretch gap-1 overflow-x-auto -mb-px">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  pathname === link.to
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex-1" />

          <a
            href="https://github.com/alihas7621/volleyball-rotations-trainer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-text-primary transition-colors p-2"
            aria-label="GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
          </a>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-base border-t border-elevated py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-text-secondary transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-text-secondary transition-colors">Contact</Link>
            <a
              href="https://github.com/alihas7621/volleyball-rotations-trainer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-secondary transition-colors"
            >
              GitHub
            </a>
          </div>
          <p>&copy; {new Date().getFullYear()} Volleyball Rotations Trainer</p>
        </div>
      </footer>
    </div>
  );
}
