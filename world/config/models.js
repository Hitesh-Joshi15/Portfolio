// ===================================
// WORLD — MODELS MANIFEST
// One entry per GLB with placement info. These numbers are meant to be TUNED
// after seeing the room (models come in unknown scale/orientation), so keep
// them here in one place.
//
// Placement:
//   fitWidth / fitHeight / fitMax — auto-scale so that dimension matches (metres)
//   x, z            — floor position (metres). y is derived (sits on floor).
//   onDesk: true    — sits on the desk top; z is DESK.position.z + deskZOffset
//   rotationY       — yaw in radians
// ===================================

import { DESK } from './layout.js';

const deskZ = DESK.position.z;

export const MODELS = {
    // --- floor-standing ---
    desk: {
        url: 'world/objects/table.glb',
        fitSize: { x: 3.6, y: 0.78, z: 0.95 }, x: 0, z: deskZ, rotationY: 0,
        interactable: false,
    },
    chair: {
        url: 'world/objects/gaming_chair.glb',
        fitHeight: 1.3, x: 0, z: deskZ + 1.2, rotationY: Math.PI, // z gets overridden to the desk front
        interactable: 'chair',
    },

    // --- on the desk: left -> right = [server, curved monitor, two monitors] ---
    server: {
        url: 'world/objects/CPU_Server.glb',
        fitHeight: 0.62, x: -1.55, deskZOffset: -0.25, onDesk: true, rotationY: 0,
        interactable: 'server',
    },
    monitor: {
        url: 'world/objects/curved_monitor.glb',
        fitWidth: 1.3, x: -0.3, deskZOffset: -0.3, onDesk: true, rotationY: -Math.PI / 2,
        interactable: 'monitor', // click -> contact card / (later) OS
    },
    monitor2: {
        url: 'world/objects/two_monitors.glb',
        fitWidth: 1.0, x: 1.25, deskZOffset: -0.28, onDesk: true, rotationY: 0,
        interactable: false,
    },

    // front row: keyboard/mouse in front of the curved monitor; mug/cube in front of the two monitors
    keyboard: {
        url: 'world/objects/keyboard.glb',
        fitWidth: 0.58, x: -0.3, deskZOffset: 0.34, onDesk: true, rotationY: 0,
        interactable: false,
    },
    mousepad: {
        url: 'world/objects/mousepad.glb',
        fitWidth: 0.34, x: 0.38, deskZOffset: 0.34, onDesk: true, rotationY: 0,
        interactable: false,
    },
    mouse: {
        url: 'world/objects/mouse.glb',
        fitWidth: 0.12, x: 0.4, deskZOffset: 0.32, onDesk: true, rotationY: 0,
        interactable: false,
    },
    mug: {
        url: 'world/objects/coffee_mug.glb',
        fitHeight: 0.14, x: 1.15, deskZOffset: 0.34, onDesk: true, rotationY: 0.4,
        interactable: false,
    },
    cube: {
        url: 'world/objects/rubiks_cube.glb',
        fitMax: 0.085, x: 1.5, deskZOffset: 0.3, onDesk: true, rotationY: 0.3,
        interactable: false,
    },
};

// All the remaining room props, dropped in for a full-room preview. Positions
// are rough — meant to be nudged. Floor items sit on the floor; items with a
// `y` are mounted at that centre height (wall / ceiling).
export const EXTRAS = {
    // bed.glb includes the two nightstands + lamps, so the fit size covers the
    // whole set — the mattress is roughly the middle third of this width.
    bed:          { url: 'world/objects/bed.glb',          fitWidth: 3.0,   x: -3.0, z: 4.0,  rotationY: Math.PI },
    bookshelf1:   { url: 'world/objects/bookshelf_1.glb',  fitHeight: 1.8,  x: -4.6, z: -2.4, rotationY: Math.PI / 2 },
    bookshelf2:   { url: 'world/objects/bookshelf_2.glb',  fitHeight: 1.8,  x: -4.6, z: 0.4,  rotationY: Math.PI / 2 },
    // Gym cluster in the front-right corner (kept clear of the balcony opening).
    // NOTE: gym/sports gear uses fitMax (caps the LARGEST dimension). fitHeight on a
    // flat/wide model scales the whole thing up massively — that's what made these giant.
    homeGym1:     { url: 'world/objects/home_gym_1.glb',   fitMax: 1.4,  x: 3.6,  z: 3.7,  rotationY: -0.4 },
    homeGym2:     { url: 'world/objects/home_gym_2.glb',   fitMax: 1.1,  x: 4.4,  z: 3.0,  rotationY: -Math.PI / 2 },
    pullUps:      { url: 'world/objects/pull_ups.glb',     fitMax: 2.1,  x: 4.4,  z: 4.3,  rotationY: -Math.PI / 2 },
    cricketBat:   { url: 'world/objects/cricket_bat.glb',  fitMax: 0.85, x: -4.4, z: 2.6,  rotationY: 0.3 },
    balls:        { url: 'world/objects/balls.glb',        fitMax: 0.22, x: -4.0, z: 3.2,  rotationY: 0 },
    badminton:    { url: 'world/objects/badminton.glb',    fitMax: 0.66, x: -4.4, z: 2.0,  rotationY: -0.3 },
    shuttlecock:  { url: 'world/objects/shuttlecock.glb',  fitMax: 0.12,    x: -4.1, z: 2.4,  rotationY: 0 },
    wallTv:       { url: 'world/objects/wall_tv.glb',      fitWidth: 1.7,   x: 0,    z: 4.85, y: 2.0, rotationY: Math.PI },
    xbox:         { url: 'world/objects/xbox.glb',         fitWidth: 0.4,   x: -0.7, z: 4.5,  rotationY: Math.PI },
    playstation:  { url: 'world/objects/playstation_5.glb', fitHeight: 0.34, x: 0.7, z: 4.5,  rotationY: Math.PI },
    xboxSeries:   { url: 'world/objects/xbox_series_x.glb', fitHeight: 0.32, x: 1.4, z: 4.5,  rotationY: Math.PI },
    ac:           { url: 'world/objects/ac.glb',           fitWidth: 0.55,  x: 4.72, z: 0,    y: 3.2, rotationY: -Math.PI / 2 },
    ceilingFan:   { url: 'world/objects/ceiling_fan.glb',  fitWidth: 1.3,   x: 0,    z: 0,    y: 3.5, rotationY: 0 },
    frame1:       { url: 'world/objects/picture_frame_1.glb', fitHeight: 0.6, x: -4.9, z: -1.0, y: 2.2, rotationY: Math.PI / 2 },
    frame2:       { url: 'world/objects/picture_frame_2.glb', fitHeight: 0.6, x: -4.9, z: 1.5,  y: 2.2, rotationY: Math.PI / 2 },
    frame3:       { url: 'world/objects/picture_frame_3.glb', fitHeight: 0.6, x: -3.0, z: 4.9,  y: 2.4, rotationY: Math.PI },
    plant:        { url: 'world/objects/small_plant.glb',  fitHeight: 0.5,  x: -4.2, z: 3.6,  rotationY: 0 },
    trophy1:      { url: 'world/objects/trophy_1.glb',     fitHeight: 0.26, x: -4.5, z: -3.4, rotationY: 0 },
    trophy2:      { url: 'world/objects/trophy_2.glb',     fitHeight: 0.24, x: -4.2, z: -3.4, rotationY: 0 },
    book:         { url: 'world/objects/book.glb',         fitMax: 0.24,    x: -4.4, z: -3.0, rotationY: 0.4 },
    // Balcony lives OUTSIDE, seen through the opening in the right (+X) wall.
    //   scaleY  = squash HEIGHT only (length/depth stay from fitWidth)
    //   groundY = sink it so the walkable floor lines up with the room floor
    //   rotationY flipped so the railing faces OUT, away from the room
    //   scaleX  = stretch LENGTH along the wall (world Z) to span the opening
    balcony:      { url: 'world/objects/balcony.glb',      fitWidth: 3.2,   x: 6.6,  z: 0,    rotationY: Math.PI / 2, groundY: -0.7, scaleY: 0.25, scaleX: 1.1 },
    door:         { url: 'world/objects/door.glb',         fitHeight: 2.15, x: 2.6,  z: 4.85, rotationY: Math.PI },
    // (the sliding door is built procedurally in RoomScene._buildSlidingDoor)
    ceilingLight: { url: 'world/objects/ceiling_light.glb', fitWidth: 0.5, x: 2, z: 2, y: 4.05, rotationY: 0 },
    // Balcony overhead light fixture, mounted just under the white cover.
    balconyLight: { url: 'world/objects/modern_interior_ceiling_light.glb', fitWidth: 0.95, x: 6.15, z: 0, y: 3.55, rotationY: 0 },
};

// Textures for the room surfaces.
export const TEXTURES = {
    floor: {
        color: 'world/objects/Tiles028_1K-JPG/Tiles028_1K-JPG_Color.jpg',
        normal: 'world/objects/Tiles028_1K-JPG/Tiles028_1K-JPG_NormalGL.jpg',
        roughness: 'world/objects/Tiles028_1K-JPG/Tiles028_1K-JPG_Roughness.jpg',
        ao: 'world/objects/Tiles028_1K-JPG/Tiles028_1K-JPG_AmbientOcclusion.jpg',
        repeat: 6, // tile count across the floor
    },
    nightSky: 'world/objects/NightSkyHDRI002_2K/NightSkyHDRI002_2K_TONEMAPPED.jpg',
    moon: 'world/objects/moon.png',
    // 360° equirectangular environments for the balcony sky dome (ground + horizon + sky).
    // offset = horizontal rotation of the panorama (0..1 = a full turn; negative = other way).
    environments: [
        { url: 'world/objects/Mountain_2K/DaySkyHDRI009A_2K_TONEMAPPED.jpg', offset: 0.45 }, // turn the village to the front
        { url: 'world/objects/Coast_2K/DayEnvironmentHDRI070_2K_TONEMAPPED.jpg', offset: 0 },
        { url: 'world/objects/NightSkyHDRI002_2K/NightSkyHDRI002_2K_TONEMAPPED.jpg', offset: 0 },
    ],
};

// Extra prop models used by the room (lighting).
export const PROPS = {
    tubeLight: 'world/objects/tube_light.glb',
};
