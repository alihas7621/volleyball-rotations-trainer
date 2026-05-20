# Design System -- Volleyball Rotations Trainer

## Product Context
- **What this is:** Interactive web app for learning and practicing volleyball rotations, overlap rules, and serve-receive formations
- **Who it's for:** Volleyball players, coaches, and referees learning positional strategy
- **Space/industry:** Sports education / coaching tools (competitors: Rotate123, Volleyball Rotations App, Coach Tactic Board)
- **Project type:** Web app (educational training tool)

## Aesthetic Direction
- **Direction:** Arena Dark -- warm dark tones (not cold gray), the feeling of being courtside in a well-lit gym
- **Decoration level:** Intentional -- subtle grain/texture on dark surfaces, the court itself provides visual interest
- **Mood:** Precise, sporty, focused. Like a coaching whiteboard that came to life. Not playful, not corporate. Technical but approachable.
- **Reference sites:** Rotate123.com, volleyballrotations.app, planet.training

## Typography
- **Display/Hero:** Satoshi (900/700/500) -- geometric, warm, sporty. Contemporary sports-media feel without being generic. Use for mode titles, rotation labels (P1, P6), section headers.
- **Body/UI:** Geist (300-700) -- clean, highly readable, supports tabular-nums for data alignment. Use for descriptions, button labels, panel text, form labels.
- **Data/Tables:** JetBrains Mono (400/500/700) -- monospace for zone numbers, overlap margins, stat values, court labels. Zone badges (Z1-Z6), margin values (+0.45m), and score displays.
- **Code:** JetBrains Mono
- **Loading:** Satoshi from FontShare (api.fontshare.com), Geist and JetBrains Mono from Google Fonts
- **Scale:**
  - 4xl: 3rem (48px) -- hero/splash only
  - 3xl: 2.25rem (36px) -- page titles
  - 2xl: 1.75rem (28px) -- section titles, rotation labels
  - xl: 1.375rem (22px) -- card titles
  - lg: 1.125rem (18px) -- sub-headings
  - base: 0.9375rem (15px) -- body text
  - sm: 0.8125rem (13px) -- UI labels, buttons
  - xs: 0.6875rem (11px) -- captions, badges, zone labels

## Color
- **Approach:** Balanced -- warm neutrals + two accent tones (amber primary, teal success)
- **Neutrals (warm brown-blacks, NOT blue-grays):**
  - Deep: #0f0d0b (page background)
  - Base: #1a1614 (content area background)
  - Surface: #252019 (cards, panels)
  - Elevated: #312a22 (interactive elements, borders)
  - Hover: #3d342a (hover states)
- **Text:**
  - Primary: #f5f0eb (headings, values)
  - Secondary: #a89e94 (body text, descriptions)
  - Muted: #6b6058 (labels, captions, disabled)
- **Amber accent (primary actions, branding):**
  - 50: #fef9ee
  - 100: #fef0d3
  - 200: #fce0a5
  - 300: #f9cb6d
  - 400: #f59e0b (primary -- buttons, active tabs, highlights)
  - 500: #e68a06
  - 600: #cb6e02
  - 700: #a85006
- **Teal (legal/success/valid):**
  - 400: #2dd4bf
  - 500: #14b8a6 (primary success)
  - 600: #0d9488
- **Red (violation/error/illegal):**
  - 400: #f87171
  - 500: #ef4444 (primary error)
- **Yellow (warning/close call):**
  - 400: #facc15
  - 500: #eab308
- **Court surface:**
  - Light: #d9842e
  - Base: #c66b22
  - Dark: #a85a1d
  - Gradient: linear-gradient(180deg, #d9842e 0%, #c66b22 40%, #b86020 100%)
- **Role colors (player tokens):**
  - Setter: #eab308
  - Opposite: #8b5cf6
  - Outside Hitter 1: #3b82f6
  - Outside Hitter 2: #2563eb
  - Middle Blocker 1: #ef4444
  - Middle Blocker 2: #dc2626
  - Libero: #22c55e
- **Dark mode:** Default. This IS the dark theme.
- **Light mode strategy:** Flip neutrals to warm creams (#faf8f6 deep, #f5f0eb base, #ebe5dd surface). Text flips to dark warm tones (#1a1614 primary). Accents stay the same. Reduce amber saturation slightly.

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable
- **Scale:**
  - 2xs: 2px
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px
  - 2xl: 48px
  - 3xl: 64px

## Layout
- **Approach:** Grid-disciplined -- the court is always the visual hero, panels and controls wrap around it
- **Grid:** Single column on mobile, 2-column (court + panel) on desktop, 3-column for quiz mode
- **Max content width:** 1100px
- **Border radius:**
  - sm: 4px (badges, small chips)
  - md: 8px (buttons, inputs, cards)
  - lg: 12px (panels, modals)
  - xl: 16px (app frame, mockup containers)
  - full: 9999px (pills, toggle buttons, player tokens)

## Motion
- **Approach:** Intentional -- smooth drag, pulse on violations, subtle entrance on mode switch
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:**
  - micro: 50-100ms (button press, hover)
  - short: 150ms (token position snap, toggle)
  - medium: 250ms (mode switch, panel slide)
  - long: 400ms (rotation animation, court transition)
- **Specific animations:**
  - Player token drag: no transition during drag, 150ms ease-out on snap
  - Violation pulse: 0 0 12px #ef4444 box-shadow with 600ms pulse
  - Close-call pulse: 0 0 8px #f59e0b box-shadow
  - Mode tab switch: 250ms fade-in for content area

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-20 | Initial design system created | Arena Dark aesthetic: warm brown-blacks, amber+teal accents. Differentiated from generic gray sports apps. |
| 2026-05-20 | Teal for success instead of green | Avoids Christmas-tree effect with red violations. Teal pairs better with amber and reads as "verified." |
| 2026-05-20 | Satoshi as display font | Geometric warmth, sports-media feel. Avoids overused Inter/Roboto. |
| 2026-05-20 | JetBrains Mono for data | Zone numbers and margins need monospace alignment. JetBrains Mono has the right weight range. |
