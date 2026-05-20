# Volleyball Rotations Trainer

An interactive web app for learning and practicing volleyball rotations in the 5-1 system.

## Features

- **Learn Mode** — Step through all six rotations and see where each player should stand on the court.
- **Serve Receive** — View standard serve-receive formations for each rotation.
- **Overlap Detection** — Real-time positional fault checking with visual indicators for illegal overlaps and close calls.
- **Libero Replacement** — Toggle libero substitutions to see when the libero replaces middle blockers in back-row rotations.
- **Quiz Mode** — Test your knowledge by placing players in the correct positions.
- **Challenge Mode** — Timed drills for quick rotation identification.
- **Team Customization** — Set player names, jersey numbers, roles, colors, and starting zones. Supports multiple teams.
- **Import / Export** — Save and load team configurations as JSON.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests with Vitest |

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Vitest

## License

[MIT](LICENSE)
