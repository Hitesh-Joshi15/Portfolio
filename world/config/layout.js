// ===================================
// WORLD — ROOM LAYOUT BLUEPRINT
// Pure data. Tweak these numbers to reshape the room; every module
// reads from here so the layout stays in one place.
//
// Coordinate system: metres, Y-up, room centred on origin.
//   -Z = far wall (where the desk lives)   +Z = near wall (door, later)
//   -X = left wall                          +X = right wall
//   floor at y = 0, ceiling at y = ROOM.height
// ===================================

export const ROOM = {
    width: 10,   // X span  (-5 .. 5)
    depth: 10,   // Z span  (-5 .. 5)
    height: 3.7, // Y span  (0 .. 3.7) — low ceiling, just above the AC
};

export const BOUNDS = {
    minX: -ROOM.width / 2,
    maxX: ROOM.width / 2,
    minZ: -ROOM.depth / 2,
    maxZ: ROOM.depth / 2,
};

// Doorway opening cut into the right (+X) wall, leading to the outdoor balcony.
export const OPENING = { z0: -3.8, z1: 3.8, top: 2.5 };

// Walkable balcony patch just outside that opening (lets you step out of the room).
export const BALCONY = {
    minX: BOUNDS.maxX,
    maxX: 7.4,
    minZ: OPENING.z0 + 0.3,
    maxZ: OPENING.z1 - 0.3,
};

// Desk sits against the far (-Z) wall, centred on X.
export const DESK = {
    position: { x: 0, y: 0, z: -3.9 },
    size: { w: 3.6, h: 0.75, d: 1.2 }, // width, height (top surface), depth
};

// Placeholder monitor on the desk (real model arrives in Slice 3).
export const MONITOR = {
    position: { x: 0, y: DESK.size.h + 0.28, z: -4.7 },
    size: { w: 1.0, h: 0.56, d: 0.05 },
};

// The chair anchor — also the seated camera pivot.
export const CHAIR = {
    position: { x: 0, y: 0, z: -3.45 },
};

// Camera presets for the two Slice-1 states.
export const CAMERA_PRESETS = {
    // Opening shot: sitting at screen level (overridden from the real monitor).
    seated: {
        position: { x: 0, y: 1.3, z: -2.7 },
        lookAt: { x: 0, y: 1.25, z: -3.9 },
    },
    // Where you land when you stand up.
    standing: {
        position: { x: 0, y: 1.62, z: -2.0 },
        lookAt: { x: 0, y: 1.5, z: -3.9 },
    },
    // Diving into the screen — the monitor fills the view.
    monitorFocus: {
        position: { x: 0, y: MONITOR.position.y, z: MONITOR.position.z + 0.55 },
        lookAt: { x: 0, y: MONITOR.position.y, z: MONITOR.position.z },
    },
};

// Simple axis-aligned obstacles the walker can't pass through.
// (Slice 1 keeps this minimal — just the desk block.)
export const OBSTACLES = [
    {
        minX: DESK.position.x - DESK.size.w / 2,
        maxX: DESK.position.x + DESK.size.w / 2,
        minZ: DESK.position.z - DESK.size.d / 2,
        maxZ: DESK.position.z + DESK.size.d / 2,
    },
];
