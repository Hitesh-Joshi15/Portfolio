// ===================================
// WORLD — SHARED THEME & CONSTANTS
// Mirrors the site palette (styles.css :root) so 3D mode feels
// like the same portfolio. Slice 1 foundation.
// ===================================

export const COLORS = {
    primary: 0x00f0ff,      // --primary-color
    secondary: 0x5200ff,    // --secondary-color
    accent: 0xff00ff,       // --accent-color
    bgPrimary: 0x0a0a0f,    // --bg-primary
    bgSecondary: 0x1a1a2e,  // --bg-secondary
    bgTertiary: 0x16213e,   // --bg-tertiary
    floor: 0x14141f,
    wall: 0x1d1d30,
    wallWhite: 0xe9e9f2,     // soft off-white for 3 walls
    wallLavender: 0xa78fd6,  // lavender feature wall (behind desk) — slightly darker
    coveCyan: 0x00f0ff,      // LED cove trim
    coveMagenta: 0xaa00ff,
    moonlight: 0x9db4ff,     // cool moon light tint
    ceiling: 0x0d0d16,
    deskTop: 0x241d2e,
    deskLeg: 0x15121c,
    monitor: 0x05050a,
    chair: 0x1a1424,
};

// CSS custom-property names, for HUD elements that live in the DOM.
export const CSS_VARS = {
    primary: 'var(--primary-color, #00f0ff)',
    secondary: 'var(--secondary-color, #5200ff)',
    accent: 'var(--accent-color, #ff00ff)',
    fontTitle: "var(--font-primary, 'Orbitron', sans-serif)",
    fontBody: "var(--font-secondary, 'Rajdhani', sans-serif)",
    fontMono: "var(--font-mono, 'Share Tech Mono', monospace)",
};

// Camera / movement tuning (metres, radians, seconds).
export const TUNING = {
    seatedEyeHeight: 1.15,     // eye height while sitting on the chair
    standingEyeHeight: 1.62,   // eye height while standing/walking
    walkSpeed: 2.6,            // metres / second
    sprintMultiplier: 1.8,     // hold Shift
    lookSensitivity: 0.0026,   // radians per pixel dragged
    seatedYawLimit: Math.PI * 0.75, // how far you can swivel in the chair (±)
    pitchLimit: Math.PI * 0.42,     // up/down clamp (both modes)
    transitionDuration: 1.0,   // sit <-> stand tween seconds
    collisionPadding: 0.35,    // keep camera this far from walls
};

export const FOV = 62;
