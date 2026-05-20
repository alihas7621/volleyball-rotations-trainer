# Volleyball Rotations Trainer

An interactive web app for learning and practicing volleyball rotations, overlap rules, serve-receive formations, and positional strategy.

Built with React 19, TypeScript, Vite, and Tailwind CSS v4.

## Features

- **Learn Mode** -- Step through all 6 rotations in 5-1, 6-2, or 6-0 systems. View rotational base, serve-receive shapes, and home/transition positions. Ghost overlays show where players should be.
- **Quiz Mode** -- Test your knowledge with category-based quizzes: zone placement, setter identification, serve-receive building, overlap fault fixing, active setter identification (6-2), and referee positional fault calls.
- **Overlap Mode** -- Drag players freely and see real-time overlap validation with bubble-boundary math (0.45m radius). Left-right and front-back constraints visualized with colored lines.
- **Serve Receive Mode** -- Build legal 3-person receive formations for each rotation. Preset templates for all 6 rotations showing passer/non-passer roles, setter release paths, and libero positions.
- **Challenge Mode** -- Scored scenarios with streak tracking. Build serve-receive, find overlap faults, identify who serves next, check lineup legality, and more.
- **Settings** -- Configure team roster, player roles/numbers/colors, starting zones, system (5-1/6-2/6-0), rule profile (FIVB 2025+), and libero replacement.

## Court Model

- 9m x 9m half-court: x=0 left sideline, x=9 right sideline, y=0 net, y=9 endline
- 6 zones: Z4(LF), Z3(MF), Z2(RF), Z5(LB), Z6(MB), Z1(RB)
- Bubble-boundary validation: each player occupies a 0.45m radius circle
- Overlap constraints checked at bubble edges, not center points

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Type-check + production build
npm test          # Run Vitest unit tests
npm run lint      # ESLint check
```

## Tech Stack

- React 19 + TypeScript 6
- Vite 8 with @tailwindcss/vite
- Tailwind CSS v4
- Vitest for testing
- localStorage for team/settings persistence
