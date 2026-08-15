# Interactive Portfolio Website

A feature-rich personal portfolio built with vanilla JavaScript and modular scripts, featuring interactive 3D visuals, 11 mini-games with Firebase-powered global leaderboards, and a living 3D avatar character.

## Live Site
- https://hitesh-joshi.netlify.app

---

## Main Features

### Portfolio Sections
- **Home:** Hero title with CSS glitch animation, animated typing effect cycling through 7 job titles, CTA buttons (View Work, Download Resume, Get In Touch), social links (GitHub, LinkedIn, Email, Phone), layered visual effects (shader + particles + Three.js 3D scene).
- **About:** Terminal-style content display, profile image auto-switcher (4s interval), animated stat counters, and a dedicated 3D avatar + Pretext text-reflow experience.
- **Experience:** Spiral 3D timeline visualization with expandable detail cards and staggered entry transitions.
- **Projects:** Interactive cards with 3D perspective tilt on hover, auto-rotating image carousels (4s interval with pause-on-hover), and clickable indicator dots.
- **Skills:** Chart.js radar chart, animated horizontal skill bars, and interactive skill keyword bubbles. All driven by centralized skill metadata with proficiency ratings.
- **Achievements:** Filterable certification cards (All / Platform / Industry / Language) with SVG progress rings that animate on scroll into view.
- **Tech Stack:** Data-driven technology cards and summary stats, sourced from skills-data.js.
- **Contact:** Contact methods, QR code, and vCard download.

### Global UX Systems
- **Loader:** 2-second terminal-style loading screen with progress bar animation.
- **Navigation:** Sticky navbar with active section tracking via Intersection Observer, mobile hamburger menu.
- **Side Navigation:** Dot indicators on the right sidebar tracking current viewport section.
- **Scroll Progress:** Top progress bar showing page scroll percentage.
- **Theme Toggle:** Light/dark mode with localStorage persistence. First-time visitors default to light theme.
- **Command Palette:** Searchable command menu triggered by Ctrl/Cmd + K for section navigation and actions.
- **Custom Cursor:** 14 themed cursor styles (code, terminal, pixel, binary, AI, hacker, etc.) cycled with Alt+C. Includes particle trails, hover scale/color shifts, click pulse animation, and `difference` blend mode.
- **Sound System:** Web Audio API synthesized UI sounds (hover, click, success, error, notification, whoosh, type) — no audio files. Toggle persists to localStorage.

### Visual Engine Layers
- **Shader Background:** WebGL fragment shader with 2-octave Perlin noise, time-animated wave patterns, mouse-reactive distance field, and cyan→purple→magenta color interpolation. Adapts to theme.
- **Particle Network:** 100 canvas particles with random velocity, wall bounce, connection lines within 150px (alpha 0.2), and mouse repulsion (150px radius). Theme-aware colors.
- **Hero Three.js Scene:** 1000 particles with cyan→purple gradient and additive blending, plus rotating geometric shapes (torus, wireframe cube, icosahedron). Mouse interaction causes particle repulsion.
- **About Section 3D Avatar:** Full 3D character with Mixamo animation retargeting, click interactions, idle behaviors, floating physics objects, and Pretext text reflow. See dedicated section below.

### Games and Leaderboards
Game hub (FAB button appears 2.5s after page load) includes 11 mini-games:

| Game | Type | Score Mode | Key Mechanic |
|------|------|-----------|--------------|
| Code Typing | Speed | Higher | Type code snippets in 60s, 100pts/char × accuracy |
| Memory Match | Puzzle | Higher | Flip pairs of programming icons |
| Reflex Tester | Reaction | Lower | Click when circle changes color |
| Code Quiz | Knowledge | Higher | Multiple choice programming Q&A |
| Word Tetris | Puzzle | Higher | Stack Tetrominos with letters, type words to clear |
| Terminal Hacker | Adventure | Higher | Terminal command navigation |
| Binary Converter | Logic | Higher | Convert decimal/hex/binary under time pressure |
| CSS Battle | Design | Lower | Recreate target designs with minimal CSS |
| Regex Golf | Patterns | Lower | Write shortest regex matching target strings |
| Minesweeper | Strategy | Higher | Classic minesweeper with bitwise reveal |
| Path Finder | Algorithm | Higher | Visualize A*, Dijkstra, BFS pathfinding |

**Leaderboard Storage:**
- Local best: localStorage per game (`highscore_{gameName}`)
- Global leaderboard: Firestore per game (`leaderboards/{gameName}/scores/{docId}`)
- Player name persists across all games via localStorage

### Browser Tab Branding
Configured in index.html `<head>`:
- **Tab title:** `<title>Hitesh Joshi | Crafting Ideas into Reality</title>`
- **Favicon files:**
  - `images/favicon-16.png` — 16×16, for small browser tab/bookmark UI
  - `images/favicon-32.png` — 32×32, for standard desktop browser tabs
  - `images/apple-touch-icon.png` — 180×180, for iOS home screen icon

---

## Architecture and Implementation

### Script Loading and Startup Flow
1. `index.html` loads external libraries (Firebase SDK, Three.js, GLTFLoader, FBXLoader, Chart.js, Font Awesome, Google Fonts).
2. `firebase-config.js` initializes Firebase App, Firestore, enables offline persistence, and triggers anonymous auth. Sets `window.firebaseAuthReady` on success.
3. Non-module scripts register classes and utilities (highscore-manager, cursor, sound-system, etc.).
4. `script.js` runs on `DOMContentLoaded` and initializes all UI systems in sequence: loader → navigation → scroll effects → typing effect → command palette → theme toggle → project cards → carousels → skills visualization → tech stack → stat counters → smooth scroll animations → resume download.
5. `philosophy-section.js` (ES module) boots the advanced About section 3D scene with avatar, animations, physics, and text reflow.

### Core File Responsibilities

| File | Purpose |
|------|---------|
| `index.html` | Page structure, CDN script/font loading order, favicon/title metadata, section layout |
| `styles.css` | CSS custom properties for theming (dark/light), glass effects, glitch animations, responsive breakpoints (mobile <600px, tablet 600-1024px, desktop >1024px), all component styling |
| `script.js` | App bootstrap, UI feature initializers (typing effect, command palette, theme toggle, project carousels/tilt, Chart.js radar, skill bars/bubbles, tech stack, stat counters, scroll animations) |
| `philosophy-section.js` | About 3D avatar (GLB loading, FBX animation retargeting, movement, click detection, idle behaviors), floating physics objects, Pretext text reflow, chair prop, theme transition handling |
| `three-scene.js` | Hero Three.js scene — 1000 particles with gradient colors, rotating geometries, mouse repulsion |
| `particles.js` | 2D canvas particle network with connection lines, wall bounce, mouse repulsion |
| `shader-background.js` | WebGL shader with Perlin noise, wave patterns, mouse influence, theme-adaptive colors |
| `timeline.js` | Spiral 3D experience timeline with expandable cards and staggered transitions |
| `skills-data.js` | Centralized skill metadata (proficiency 0-100, active/past/occasional flags, break periods, years of experience, categories) |
| `certifications.js` | Certification filter system with SVG progress rings animated via Intersection Observer |
| `typing-game.js` | GameHub dispatcher + 10 mini-game classes (all except Word Tetris) |
| `word-tetris.js` | Word Tetris gameplay — 10×20 grid, 7 standard Tetrominos + single block, weighted letter randomization, 150+ word bank, infinite/timed modes, normal/hard difficulty |
| `highscore-manager.js` | Dual storage score manager — localStorage personal best + Firestore global leaderboard, scoring mode abstraction (higher/lower), auth-aware submission with retry |
| `firebase-config.js` | Firebase initialization, Firestore reference, anonymous auth, offline persistence, error handling |
| `cursor.js` | 14 themed cursor styles cycled with Alt+C, particle trails, hover/click effects, difference blend mode |
| `sound-system.js` | Web Audio API sound synthesis — 7 sound types generated from oscillators (no audio files), volume 0.1, localStorage toggle |

### CSS Theme System

**Dark Theme (default):**
- `--primary-color: #00f0ff` (cyan), `--secondary-color: #5200ff` (purple), `--accent-color: #ff00ff` (magenta)
- `--bg-primary: #0a0a0f`, glass background with rgba dark tints

**Light Theme:**
- `--primary-color: #0099ff` (blue), `--secondary-color: #6600cc` (purple), `--accent-color: #cc00cc` (magenta)
- `--bg-primary: #f5f7fa`, glass background with rgba white tints

Key CSS patterns: `.glass-effect` (backdrop-filter blur), `.glitch` (clip-path text shift animation), `.section-title` (gradient text), buttons with ripple hover effects.

---

## About 3D Scene: How It Works

### Model and Animation Pipeline
- **Avatar Loading:** GLTFLoader loads Avaturn GLB models (`formal_model.glb` for light theme, `casual_model.glb` for dark theme). Models are scaled to 0.75 and positioned in an avatarGroup at (0.9, 10.0, 0).
- **Animation Loading:** FBXLoader loads 13 Mixamo FBX animation clips. Mode-specific animations: `Walk-casual.fbx` / `walk-formal.fbx` and `entrance-casual.fbx` / `entrance-formal.fbx`. Universal animations: Idle, Ascending-Stairs (walkUp), Jump, wave, bow, dance, backflip, look-around, yawn, sit-down, dodge.
- **Retargeting (`retargetClip`):**
  1. Strips `mixamorig:` prefix from Mixamo bone names to match Avaturn GLB skeleton (plain names like "Hips", "Spine", "LeftArm").
  2. Scales all position track values by 0.01 (Mixamo uses centimeters, GLB uses meters).
  3. Zeros Hips Z-position to first-frame value to prevent forward drift during walking.
  4. Falls back to underscore-variant matching (e.g., "Left_Arm") if exact name doesn't match.
- **Animation Mixer:** Three.js AnimationMixer plays retargeted clips with crossfade transitions (default 0.3s fade duration).
- **Procedural Fallbacks:** If FBX clips fail to load, bone-level procedural animations are used: parabolic jump arc, arm-wave oscillation, rhythmic dance bounce, spine-bend bow, 2π-rotation backflip, lean-and-duck dodge, head-rotation look-around, arms-stretch yawn, slide-in entrance, head-nod welcome-back.

### Click Detection
1. **Primary:** Raycaster from camera through click coordinates tests against an invisible CylinderGeometry hitbox (radius 0.5, height 1.6) centered on the avatar. Cylinder is rotation-invariant (unlike a box hitbox that would rotate edge-on when walking).
2. **Fallback:** Projects avatar world position to screen coordinates. If click is within 120px screen distance, counts as a character hit.
3. **Rapid-Click Tracking:** Maintains a `recentClicks` array of timestamps within a 1200ms window. 3+ clicks within that window triggers the dodge animation.

### Interaction Model

| Interaction | Light Theme (Formal) | Dark Theme (Casual) |
|-------------|---------------------|---------------------|
| Single click on character | wave (2000ms) | random: dance (3000ms) or wave (2000ms) |
| Double-click on character | bow (1800ms) | backflip (1200ms) |
| Rapid clicks (3+ in 1.2s) | dodge (800ms) | dodge (800ms) |
| Ground click (nearby) | Walk to target | Walk to target |
| Ground click (>2.5 units) | Walk to target | Jump 70% distance, then walk remainder |
| Idle 5 seconds | lookAround (3000ms) | dance (3000ms) |
| Idle 15 seconds | sitDown (persistent, shows chair) | sitDown (persistent, shows chair) |
| Scroll back to section | welcomeBack (1200ms) | welcomeBack (1200ms) |
| Theme toggle | entrance animation (1800ms) | entrance animation (1800ms) |

**One-Shot Animation System:** `playOneShotAnim(state, duration)` calls `switchAnimation()` first, then sets `animLocked = true` (order matters — switchAnimation checks animLocked and returns early if locked). Chair is shown for sitDown, hidden on timeout or interruption.

**Idle Timer:** Only reset by clicks and scrolls (mousemove does NOT reset). Two thresholds at 5000ms and 15000ms in `idleTriggerTimes`. Timer resets after walk completes.

### Chair Prop
```
createChair():
  Materials:
    Frame: metallic gray (metalness 0.8, roughness 0.3)
    Cushion: dark fabric (metalness 0, roughness 0.9)
  
  Seat cushion: 0.4×0.05×0.38 box at Y=0.4
  Backrest cushion: 0.36×0.4×0.04 box at Y=0.625, Z=-0.2 (behind character)
  Backrest frame: 0.38×0.42×0.02 box at Y=0.625, Z=-0.22
  4 legs: cylinder (r=0.015, h=0.25) at [±0.16, 0.275, ±0.14]
  2 cross bars: cylinder (r=0.008, h=0.28) at Y=0.2, rotated π/2

showChair(): Creates on first use, positions at (0, -0.1, -0.05) relative to avatar, sets visible
hideChair(): Sets visible=false (mesh is reused, not destroyed)
```

### Floating Objects (10 Total)
1. Code Brackets `</>`
2. Neural Network (interconnected nodes)
3. Database Stack (stacked cylinders)
4. Gear (12-tooth with hub)
5. Sparkle (glowing sphere + PointLight)
6. Terminal Plane (canvas texture with code text)
7. Atom (core + 3 orbital rings)
8. Data Cube (wireframe with 12 edges)
9. Circuit Board (PCB with traces + chip)
10. Hash Symbol `#` (2 vertical + 2 horizontal bars)

**Physics System:**
- Initial velocity: random angle, 0.3–0.6 units/frame.
- Wall bounce: clamp to visible bounds with margin, reverse velocity component on impact.
- Cursor repel: distance-falloff force (1–1.2 unit range), accumulates to velocity.
- Inter-object collision: radius-based (0.2 default), elastic bounce with velocity swap along collision normal.
- Speed clamping: max 0.6 units/frame to prevent runaway acceleration.
- Continuous rotation: each object spins; gears spin fast on Z-axis.

**Theme-Aware Colors:**
- Light: cyan (0x0099ff), orange (0xffaa00), green (0x006633), purple (0x9933cc)
- Dark: bright cyan (0x00f0ff), red (0xff4444), lime (0x00aa44), magenta (0xcc66ff)

### Pretext Text Reflow
- **Library:** `@chenglou/pretext@0.0.4` (ES module).
- **API:** `prepareWithSegments(text, fontString)` → segments; `layoutNextLine(prepared, cursor, lineWidth)` → `{ text, end }`.
- **Algorithm:**
  1. Project avatar + floating objects to 2D screen-space bounding boxes (obstacles).
  2. For each Y line position, compute available width left and right of obstacles.
  3. Left obstacles shift text rightward; right obstacles reduce available width.
  4. Lines narrower than 60px minimum are skipped.
  5. Render onto DPR-scaled canvas with font 13–17px 'Share Tech Mono' (responsive), line height 1.7×, 30px edge padding.
- **Container Auto-Sizing:** Dry-run at 45% width (worst-case obstacle blocking), resize container to fit all text, update camera FOV to preserve horizontal view.

### Theme Transition Handling
1. Save camera position, FOV, and aspect ratio.
2. Clear current avatar model, animation mixer, and bone references.
3. Reload GLB from theme-appropriate path (`formal_model.glb` / `casual_model.glb`).
4. Restore camera settings.
5. Play entrance animation.
6. Update floating object materials (emissive intensity adjustment).
7. Update accent light color (0x0099ff for light / 0x00f0ff for dark).

---

## Game and Leaderboard Internals

### Score Manager Design
`highscore-manager.js` provides:
- Local best tracking via localStorage (`highscore_{gameName}`)
- Global submission to Firestore with auth-aware retry
- Top-score queries with 1-minute cache
- Modal rendering for leaderboard display
- Scoring mode abstraction: `'higher'` (descending sort) and `'lower'` (ascending sort)

Key methods: `saveLocalHighScore()`, `submitGlobalScore()`, `getGlobalTopFive()`, `getStartScreenHTML()` (async render of leaderboard cards), `getPlayerName()` / `setPlayerName()`.

### Firestore Schema
Collection path: `leaderboards/{gameName}/scores/{docId}`

Document fields:
- `score` (number)
- `playerName` (string)
- `userId` (string, anonymous auth UID)
- `timestamp` (server timestamp)
- `date` (display string)
- `gameVersion` (string)

### Submission Pipeline
1. Game computes score on completion.
2. Local best is updated if score beats current (respecting scoring mode).
3. `submitGlobalScore()` waits for `window.firebaseAuthReady`.
4. If auth not ready, retries anonymous sign-in.
5. Firestore write creates new document in game-specific path.
6. Leaderboard cache is invalidated.
7. `showLeaderboard(waitForSubmission)` optionally delays fetch for post-submit sync before rendering modal.

### Word Tetris Specifics
- Grid: 10×20 (standard Tetris dimensions).
- Pieces: 7 standard Tetrominos + single block, each assigned weighted-random letters (vowels are more common).
- Letter patterns: intentional clusters (AT, ING, ER, etc.) during piece generation.
- Word bank: 150+ common English 3–6 letter words.
- Modes: Infinite (play until stack-out) and Timed (3-minute challenge).
- Difficulty: Normal (1200ms drop) and Hard (1000ms, increases with level).
- Scoring: 10pts per block cleared + 25 × word length × (3 – lines cleared) bonus.
- Highlight reset: `highlightedBlocks` is cleared in all completion and failure branches to prevent ghost highlights.

---

## Local Development

### Prerequisites
- Modern browser (Chrome, Edge, or Firefox)
- Node.js (for local dev server commands)

### Run Commands
```bash
npm run start    # live-server with auto-reload on port 3000
npm run serve    # http-server alternative on port 3000
```

### Dev Dependencies
- `live-server@^1.2.2` — Auto-reload development server
- `http-server@^14.1.1` — Alternative static file server

### External Dependencies (CDN)
- Three.js r128+ (GLTFLoader, FBXLoader)
- fflate v0.8.2 (required by FBXLoader for decompression)
- Chart.js (radar skill visualization)
- Font Awesome 6.4.0 (icons)
- Google Fonts (Orbitron, Rajdhani, Share Tech Mono)
- Firebase SDK compat (App, Auth, Firestore)
- Pretext v0.0.4 (ES module for text layout)

## Deployment
Static hosting compatible (no server-side code):
- Netlify (current)
- Vercel
- GitHub Pages
- Firebase Hosting

## Documentation Index
- `FIREBASE_SETUP_GUIDE.md` — Firebase project setup, config, Firestore rules, and troubleshooting
- `GAME_SCORING_REVIEW.md` — Scoring behavior, fairness controls, and implementation patterns per game
- `LEADERBOARD_FIX_SUMMARY.md` — Leaderboard reliability fixes and current behavior
- `BUGFIX_SUMMARY.md` — Significant bug fixes and why they worked
- `QUICK_TEST_GUIDE.md` — Fast confidence pass checklist after changes
- `TEST_SUITE.md` — Comprehensive regression test suite for releases

## License
MIT
