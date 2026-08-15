// ===================================
// WORLD — ROOM SCENE (Slice 3)
// Builds the real room: tiled floor, lavender + white walls with LED cove,
// night-sky dome + moon + tube light, and the desk area loaded from the models
// manifest. Everything lives under one group for easy disposal. Model
// placement numbers come from config/models.js and are meant to be tuned.
// ===================================

import { COLORS } from '../config/theme.js';
import { ROOM, DESK, OPENING } from '../config/layout.js';
import { MODELS, TEXTURES, PROPS, EXTRAS } from '../config/models.js';
import { State } from '../core/StateMachine.js';
import { createScreenTexture } from '../objects/ContactScreen.js';
import { createCurvedScreen } from '../objects/CurvedScreen.js';

const THREE = window.THREE;

export class RoomScene {
    constructor(scene, loader, interactables, handlers = {}) {
        this.scene = scene;
        this.loader = loader;
        this.interactables = interactables;
        this.handlers = handlers;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.deskTopY = DESK.size.h; // fallback until the desk model loads
        this.deskFrontZ = DESK.position.z + 0.6; // fallback
        this.monitorScreen = null;
        this.seatedView = null;
        this.tubeLight = null;
        this.tubeOn = true;
    }

    async build(onProgress) {
        this._buildWalls();
        this._buildLights();

        const M = MODELS;
        const tasks = [
            () => this._buildFloor(),
            () => this._buildCeiling(),
            () => this._loadTubeLight(),
            () => this._loadFloorModel('desk', M.desk),
            () => this._loadFloorModel('chair', { ...M.chair, z: this.deskFrontZ + 0.22 }),
            () => this._loadDeskModel('server', M.server),
            () => this._loadDeskModel('monitor', M.monitor),
            () => this._loadDeskModel('monitor2', M.monitor2),
            () => this._loadDeskModel('keyboard', M.keyboard),
            () => this._loadDeskModel('mousepad', M.mousepad),
            () => this._loadDeskModel('mouse', M.mouse),
            () => this._loadDeskModel('mug', M.mug),
            () => this._loadDeskModel('cube', M.cube),
            () => this._loadExtras(),
        ];
        await this.loader.runWithProgress(tasks, onProgress);
    }

    // ---- static geometry ----
    _buildWalls() {
        const { width, depth, height } = ROOM;
        const white = new THREE.MeshStandardMaterial({ color: COLORS.wallWhite, roughness: 0.95, metalness: 0.0, side: THREE.DoubleSide });
        const lav = new THREE.MeshStandardMaterial({ color: COLORS.wallLavender, roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide });

        const mkWall = (w, h, mat, x, y, z, ry) => {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
            m.position.set(x, y, z);
            m.rotation.y = ry;
            this.group.add(m);
        };
        // Back (-Z) = lavender feature wall behind the desk; others off-white.
        mkWall(width, height, lav, 0, height / 2, -depth / 2, 0);
        mkWall(width, height, white, 0, height / 2, depth / 2, Math.PI);
        mkWall(depth, height, white, -width / 2, height / 2, 0, Math.PI / 2);

        // Right (+X) wall has a large opening onto the OUTDOOR balcony:
        // two side panels + a header above the doorway (see OPENING in layout.js).
        const oZ0 = OPENING.z0, oZ1 = OPENING.z1, oTop = OPENING.top;
        mkWall(oZ0 + depth / 2, height, white, width / 2, height / 2, (-depth / 2 + oZ0) / 2, -Math.PI / 2);
        mkWall(depth / 2 - oZ1, height, white, width / 2, height / 2, (oZ1 + depth / 2) / 2, -Math.PI / 2);
        mkWall(oZ1 - oZ0, height - oTop, white, width / 2, (oTop + height) / 2, (oZ0 + oZ1) / 2, -Math.PI / 2);

        this._buildCove();
        this._buildExterior();
        this._buildSlidingDoor();
        this._buildCurtains();
    }

    // Just outside the balcony opening: a plain overhead cover, plus a distant
    // outdoor scene beyond the railing. (The floor is tiled in _buildFloor; the
    // visible ceiling-light fixture is a model placed via EXTRAS.balconyLight.
    // Per user: NO point light here — the balcony reads better unlit.)
    _buildExterior() {
        const { width, height } = ROOM;
        const cz = (OPENING.z0 + OPENING.z1) / 2;
        const bW = OPENING.z1 - OPENING.z0;

        // Plain overhead cover over the balcony (a soft grey).
        const ceil = new THREE.Mesh(
            new THREE.PlaneGeometry(2.3, bW),
            new THREE.MeshStandardMaterial({ color: 0xccd0da, roughness: 0.95, side: THREE.DoubleSide }),
        );
        ceil.rotation.x = Math.PI / 2; // face down onto the balcony
        ceil.position.set(width / 2 + 1.15, height, cz);
        this.group.add(ceil);

        this._buildOutside(cz, bW);
    }

    // Real 360° environment photo (equirectangular) on an inside-out sky dome, so
    // the balcony overlooks a landscape (ground + horizon + sky) instead of floating.
    // Clicking the view 5x swaps environments — a hidden easter egg (no hint).
    _buildOutside(cz, bW) {
        const { width, height } = ROOM;
        this.envList = TEXTURES.environments;
        this.envCache = {};
        this.envIndex = 0;
        this.balconyClicks = 0;

        // Inside-out sphere; starts a plain sky colour, then the photo loads in.
        this.skyMat = new THREE.MeshBasicMaterial({ color: 0x9fc0e0, side: THREE.BackSide, fog: false });
        const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 48, 32), this.skyMat);
        sky.position.set(0, 1.5, 0);              // horizon sits near eye level
        this.group.add(sky);
        this._applyEnv(0);

        // Invisible catcher out past the railing collects the easter-egg clicks.
        const catcher = new THREE.Mesh(
            new THREE.PlaneGeometry(bW + 3, height + 3),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),
        );
        catcher.rotation.y = -Math.PI / 2;
        catcher.position.set(width / 2 + 2.6, height / 2, cz);
        this.group.add(catcher);

        this.interactables.register({
            object3D: catcher,
            prompt: null,                         // easter egg: no hint shown
            states: [State.WALKING],
            onClick: () => this._tapOutside(),
            highlight: false,
        });
    }

    async _applyEnv(i) {
        const env = this.envList[i];
        let tex = this.envCache[i];
        if (!tex) {
            tex = await this.loader.loadTexture(env.url, { srgb: true, wrap: true, repeat: 1 });
            if (!tex) return;
            this.envCache[i] = tex;
        }
        tex.offset.x = env.offset || 0;           // horizontal rotation of the panorama
        tex.needsUpdate = true;
        if (!this.skyMat) return;
        this.skyMat.map = tex;
        this.skyMat.color.setHex(0xffffff);       // show the photo unmodified
        this.skyMat.needsUpdate = true;
    }

    _tapOutside() {
        if (++this.balconyClicks < 5) return;      // hidden: 5 clicks -> next environment
        this.balconyClicks = 0;
        this.envIndex = (this.envIndex + 1) % this.envList.length;
        this._applyEnv(this.envIndex);
    }

    // Cloth curtains on the room side of the opening; a single click opens/closes.
    _buildCurtains() {
        const cz = (OPENING.z0 + OPENING.z1) / 2;
        const W = OPENING.z1 - OPENING.z0;
        const H = OPENING.top + 0.15;
        const x = ROOM.width / 2 - 0.18;          // just inside the room

        const rodMat = new THREE.MeshStandardMaterial({ color: 0x2a2a30, metalness: 0.7, roughness: 0.3 });
        const clothMat = new THREE.MeshStandardMaterial({ color: 0x6b3f5b, roughness: 0.92, metalness: 0.0, side: THREE.DoubleSide });

        const curtains = new THREE.Group();
        curtains.position.set(x, 0, cz);

        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, W + 0.3, 10), rodMat);
        rod.rotation.x = Math.PI / 2;             // lie along Z
        rod.position.set(0, H, 0);
        curtains.add(rod);

        const panelW = W / 2;
        const panelH = H - 0.05;
        // Pleated (folding) panel: a corrugated plane; scaling its width compresses
        // the folds like a real curtain gathering.
        const mkPanel = () => {
            const geo = new THREE.PlaneGeometry(panelW, panelH, 28, 1);
            const pos = geo.attributes.position;
            const amp = 0.07, pleats = 14;
            for (let i = 0; i < pos.count; i++) {
                const u = pos.getX(i) / panelW + 0.5;                 // 0..1 across width
                const zig = Math.abs(((u * pleats) % 1) - 0.5) * 4 - 1; // triangle wave -1..1
                pos.setZ(i, zig * amp);
            }
            pos.needsUpdate = true;
            geo.computeVertexNormals();
            const p = new THREE.Mesh(geo, clothMat);
            p.rotation.y = -Math.PI / 2;          // face into the room (-X); width runs along Z
            p.position.y = panelH / 2;
            return p;
        };
        this.curtainL = mkPanel();
        this.curtainR = mkPanel();
        this.curtainL.position.z = -W / 4;
        this.curtainR.position.z = W / 4;
        curtains.add(this.curtainL, this.curtainR);

        this._curtainClosedZ = [-W / 4, W / 4];
        this._curtainOpenZ = [-W / 2 + 0.25, W / 2 - 0.25];
        this.curtainsOpen = false;
        this.curtainAnim = null;
        this.group.add(curtains);

        this.interactables.register({
            object3D: curtains,
            prompt: 'Click to open / close the curtains',
            states: [State.WALKING],
            onClick: () => this._toggleCurtains(),
            highlight: false,
        });
    }

    _toggleCurtains() {
        if (this.curtainAnim) return;
        this.curtainsOpen = !this.curtainsOpen;
        this.curtainAnim = { t: 0, dur: 0.8 };
    }

    _buildCove() {
        const { width, depth, height } = ROOM;
        const cyan = new THREE.MeshBasicMaterial({ color: COLORS.coveCyan });
        const mag = new THREE.MeshBasicMaterial({ color: COLORS.coveMagenta });
        const t = 0.04;
        const yBot = 0.06;
        const yTop = height - 0.06;
        const strip = (len, mat, x, y, z, ry) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(len, t, t), mat);
            m.position.set(x, y, z);
            m.rotation.y = ry;
            this.group.add(m);
        };
        // floor-edge cove (cyan) + top-edge cove (magenta)
        strip(width, cyan, 0, yBot, -depth / 2 + 0.03, 0);
        strip(width, cyan, 0, yBot, depth / 2 - 0.03, 0);
        strip(width, mag, 0, yTop, -depth / 2 + 0.03, 0);
        strip(width, mag, 0, yTop, depth / 2 - 0.03, 0);
        strip(depth, cyan, -width / 2 + 0.03, yBot, 0, Math.PI / 2);
        // (no cyan floor cove on the +X wall — it would glow under the sliding door)
        strip(depth, mag, -width / 2 + 0.03, yTop, 0, Math.PI / 2);
        strip(depth, mag, width / 2 - 0.03, yTop, 0, Math.PI / 2);
    }

    _buildLights() {
        // Tube light = the main, bright, toggle-able source, mounted on the LEFT wall.
        this.tubeLight = new THREE.PointLight(0xeaf1ff, 2.4, 42, 2);
        this.tubeLight.position.set(-4.3, 2.4, 0);
        this.group.add(this.tubeLight);

        // Subtle cyan desk accent.
        const accent = new THREE.PointLight(COLORS.coveCyan, 0.25, 4.5, 2);
        accent.position.set(0, DESK.size.h + 0.7, DESK.position.z + 0.7);
        this.group.add(accent);
    }

    setTubeLight(on) {
        this.tubeOn = on;
        if (this.tubeLight) this.tubeLight.intensity = on ? 2.4 : 0;
        return this.tubeOn;
    }

    toggleTubeLight() {
        return this.setTubeLight(!this.tubeOn);
    }

    // ---- textured async parts ----
    async _buildFloor() {
        const T = TEXTURES.floor;
        const [color, normal, rough, ao] = await Promise.all([
            this.loader.loadTexture(T.color, { srgb: true, repeat: T.repeat }),
            this.loader.loadTexture(T.normal, { repeat: T.repeat }),
            this.loader.loadTexture(T.roughness, { repeat: T.repeat }),
            this.loader.loadTexture(T.ao, { repeat: T.repeat }),
        ]);
        const mat = new THREE.MeshStandardMaterial({
            map: color,
            normalMap: normal,
            roughnessMap: rough,
            aoMap: ao,
            roughness: 1.0,
            metalness: 0.0,
            color: color ? 0xffffff : COLORS.floor,
        });
        const geo = new THREE.PlaneGeometry(ROOM.width, ROOM.depth);
        geo.setAttribute('uv2', geo.attributes.uv); // aoMap requires uv2
        const floor = new THREE.Mesh(geo, mat);
        floor.rotation.x = -Math.PI / 2;
        this.group.add(floor);

        // Balcony floor outside the +X opening, using the same room tiles.
        const bW = OPENING.z1 - OPENING.z0;
        const bGeo = new THREE.PlaneGeometry(2.3, bW);
        bGeo.setAttribute('uv2', bGeo.attributes.uv);
        const bFloor = new THREE.Mesh(bGeo, mat);
        bFloor.rotation.x = -Math.PI / 2;
        bFloor.position.set(ROOM.width / 2 + 1.15, 0, (OPENING.z0 + OPENING.z1) / 2);
        this.group.add(bFloor);
    }

    async _buildCeiling() {
        const { width, depth, height } = ROOM;

        // Night sky is PAINTED on a flat, closed ceiling (fixed). MeshBasic is
        // unlit, so the stars read as glowing regardless of room lighting.
        const sky = await this.loader.loadTexture(TEXTURES.nightSky, { srgb: true, wrap: false });
        const skyMat = new THREE.MeshBasicMaterial({ map: sky || null, side: THREE.DoubleSide, fog: false });
        if (!sky) skyMat.color = new THREE.Color(0x06070f);
        const ceil = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), skyMat);
        ceil.rotation.x = Math.PI / 2; // face down into the room
        ceil.position.y = height;
        this.group.add(ceil);

        // Fixed moon, flush on the ceiling.
        const moonTex = await this.loader.loadTexture(TEXTURES.moon, { wrap: false });
        const moonMat = new THREE.MeshBasicMaterial({ map: moonTex || null, transparent: true, depthWrite: false, fog: false });
        if (!moonTex) moonMat.color = new THREE.Color(0xdfe6ff);
        const moon = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), moonMat);
        moon.rotation.x = Math.PI / 2;
        moon.position.set(-2.4, height - 0.02, -2.2);
        this.group.add(moon);

        // Dim light 'cast' by the moon + a few stars = the night ambience.
        const moonLight = new THREE.PointLight(0xbcd0ff, 0.5, 13, 2);
        moonLight.position.set(-2.4, height - 0.5, -2.2);
        this.group.add(moonLight);

        const starSpots = [[3.5, 3.5], [-3.5, 3.5], [3.5, -3.5], [3.2, 0.5], [-3.2, -1], [0.5, 3.6]];
        for (const [sx, sz] of starSpots) {
            const s = new THREE.PointLight(0xaac4ff, 0.12, 7, 2);
            s.position.set(sx, height - 0.35, sz);
            this.group.add(s);
        }
    }

    async _loadTubeLight() {
        const g = await this.loader.loadModel(
            { url: PROPS.tubeLight, fitDepth: 1.8, x: -4.9, z: 0, y: 2.4, rotationY: Math.PI / 2 },
        );
        if (g) this.group.add(g);
    }

    /** Load every remaining prop for a full-room preview (rough positions). */
    async _loadExtras() {
        for (const key of Object.keys(EXTRAS)) {
            const entry = EXTRAS[key];
            const g = await this.loader.loadModel(entry, { groundY: entry.groundY ?? 0 });
            if (!g) continue;
            this.group.add(g);
        }
    }

    // Procedural sliding door filling the wall opening: FOUR glass segments on
    // two depth tracks [A,B,B,A] so any pair can overlap another. The double-
    // click position decides which panels move:
    //   left third  -> the 2 left panels slide right   (opens the left)
    //   right third -> the 2 right panels slide left    (opens the right)
    //   centre      -> the inner 2 split apart          (opens the centre)
    _buildSlidingDoor() {
        const x = ROOM.width / 2;                 // the +X wall plane
        const z0 = OPENING.z0, z1 = OPENING.z1;
        const W = z1 - z0;                        // opening width
        const cz = (z0 + z1) / 2;                 // opening centre (z)
        const H = OPENING.top + 0.1;              // door height (overlaps the header to hide the top gap)

        const frameMat = new THREE.MeshStandardMaterial({ color: 0x1b2036, metalness: 0.6, roughness: 0.35 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x9fb4d8, metalness: 0.0, roughness: 0.05, transparent: true, opacity: 0.26 });

        const door = new THREE.Group();
        door.position.set(x, 0, cz);
        const TX = 0.08;                          // frame is thin in X (sits in the Y-Z plane)
        const rail = (sy, sz, y, z) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(TX, sy, sz), frameMat);
            m.position.set(0, y, z);
            door.add(m);
        };
        rail(0.1, W + 0.12, H - 0.05, 0);         // top
        rail(0.08, W + 0.12, 0.04, 0);            // bottom
        rail(H, 0.12, H / 2, -W / 2);             // left jamb
        rail(H, 0.12, H / 2, W / 2);              // right jamb

        const w = W / 4;
        const panelW = w - 0.02;
        const panelH = H - 0.16;
        const dx = 0.04;                          // depth-track separation
        const tracks = [dx, -dx, -dx, dx];        // [A,B,B,A] so overlaps never collide
        const closed = [-3 * W / 8, -W / 8, W / 8, 3 * W / 8];
        this._doorW = W;
        this.doorClosedZ = closed.slice();
        this.doorTargetZ = closed.slice();
        this.doorFromZ = closed.slice();
        this.doorPanels = [];
        for (let i = 0; i < 4; i++) {
            const p = this._makeDoorPanel(panelW, panelH, frameMat, glassMat);
            p.position.set(tracks[i], panelH / 2 + 0.06, closed[i]);
            door.add(p);
            this.doorPanels.push(p);
        }

        this.slidingDoor = door;
        this.slidingDoorAnim = null;
        this.slidingDoorOpen = false;
        this.group.add(door);

        this.slidingDoorItem = this.interactables.register({
            object3D: door,
            prompt: 'Double-click to open (again to close)',
            states: [State.WALKING],
            onDoubleClick: (point) => this._slideDoor(point),
            highlight: false,
        });
    }

    _makeDoorPanel(w, h, frameMat, glassMat) {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.BoxGeometry(0.03, h, w), glassMat));
        const b = 0.05;
        const bar = (sy, sz, y, z) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(0.045, sy, sz), frameMat);
            m.position.set(0, y, z);
            g.add(m);
        };
        bar(b, w, h / 2, 0);     // top
        bar(b, w, -h / 2, 0);    // bottom
        bar(h, b, 0, -w / 2);    // left
        bar(h, b, 0, w / 2);     // right
        return g;
    }

    // Double-click toggles the door: open by click zone (which panels move) or close.
    _slideDoor(point) {
        if (this.slidingDoorAnim) return;
        const W = this._doorW, w = W / 4;
        const c = this.doorClosedZ;
        this.doorFromZ = this.doorPanels.map((p) => p.position.z);

        if (this.slidingDoorOpen) {                 // OPEN -> close every panel
            this.doorTargetZ = c.slice();
            this.slidingDoorAnim = { t: 0, dur: 1.0 };
            this.slidingDoorOpen = false;
            if (this.handlers.onBalconyClose) this.handlers.onBalconyClose();
            return;
        }

        const cz = this.slidingDoor.position.z;     // CLOSED -> open by click zone
        const lz = point ? point.z - cz : 0;
        let targets, gapMin, gapMax;
        if (lz < -W / 6) {            // left third  -> 2 left panels slide right (opens LEFT)
            targets = [c[0] + 2 * w, c[1] + 2 * w, c[2], c[3]];
            gapMin = cz - W / 2; gapMax = cz;
        } else if (lz > W / 6) {      // right third -> 2 right panels slide left (opens RIGHT)
            targets = [c[0], c[1], c[2] - 2 * w, c[3] - 2 * w];
            gapMin = cz; gapMax = cz + W / 2;
        } else {                      // centre      -> inner 2 split apart (opens CENTRE)
            targets = [c[0], c[1] - w, c[2] + w, c[3]];
            gapMin = cz - W / 4; gapMax = cz + W / 4;
        }
        this.doorTargetZ = targets;
        this.slidingDoorAnim = { t: 0, dur: 1.0 };
        this.slidingDoorOpen = true;
        if (this.handlers.onBalconyOpen) this.handlers.onBalconyOpen(gapMin, gapMax);
    }

    /** Per-frame hook (called from WorldApp): drives the door + curtain animations. */
    update(dt) {
        this._updateDoor(dt);
        this._updateCurtains(dt);
    }

    _updateDoor(dt) {
        const a = this.slidingDoorAnim;
        if (!a || !this.doorPanels) return;
        a.t = Math.min(1, a.t + dt / a.dur);
        const e = a.t < 0.5 ? 2 * a.t * a.t : 1 - Math.pow(-2 * a.t + 2, 2) / 2; // easeInOutQuad
        for (let i = 0; i < this.doorPanels.length; i++) {
            const from = this.doorFromZ[i];
            this.doorPanels[i].position.z = from + (this.doorTargetZ[i] - from) * e;
        }
        if (a.t >= 1) this.slidingDoorAnim = null;
    }

    _updateCurtains(dt) {
        const a = this.curtainAnim;
        if (!a || !this.curtainL) return;
        a.t = Math.min(1, a.t + dt / a.dur);
        const e = a.t < 0.5 ? 2 * a.t * a.t : 1 - Math.pow(-2 * a.t + 2, 2) / 2;
        const f = this.curtainsOpen ? e : 1 - e;  // 0 = closed .. 1 = open
        const bunch = 1 - 0.62 * f;                // panels gather as they open
        this.curtainL.position.z = this._curtainClosedZ[0] + (this._curtainOpenZ[0] - this._curtainClosedZ[0]) * f;
        this.curtainR.position.z = this._curtainClosedZ[1] + (this._curtainOpenZ[1] - this._curtainClosedZ[1]) * f;
        this.curtainL.scale.x = bunch;
        this.curtainR.scale.x = bunch;
        if (a.t >= 1) this.curtainAnim = null;
    }

    // ---- models ----
    async _loadFloorModel(name, entry) {
        const g = await this.loader.loadModel(entry, { groundY: 0 });
        if (!g) return;
        this.group.add(g);
        if (name === 'desk') {
            const box = new THREE.Box3().setFromObject(g);
            this.deskTopY = box.max.y;
            this.deskFrontZ = box.max.z;
        }
        this._registerInteractable(entry, g);
    }

    async _loadDeskModel(name, entry) {
        const z = DESK.position.z + (entry.deskZOffset || 0);
        const g = await this.loader.loadModel({ ...entry, z }, { groundY: this.deskTopY });
        if (!g) return;
        this.group.add(g);
        if (name === 'monitor') {
            this._addCurvedScreen(g);
            this._computeSeatedView(g);
        }
        this._registerInteractable(entry, g);
    }

    _computeSeatedView(monitorGroup) {
        const box = new THREE.Box3().setFromObject(monitorGroup);
        const c = box.getCenter(new THREE.Vector3());
        this.seatedView = {
            eye: { x: c.x, y: c.y + 0.05, z: box.max.z + 0.95 },
            look: { x: c.x, y: c.y, z: c.z },
        };
    }

    _addCurvedScreen(monitorGroup) {
        const box = new THREE.Box3().setFromObject(monitorGroup);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const screen = createCurvedScreen(size.x * 0.9, size.y * 0.82, createScreenTexture(), 0.04);
        screen.position.set(center.x, center.y, box.max.z + 0.012);
        this.group.add(screen);
        this.monitorScreen = screen;
    }

    _registerInteractable(entry, group) {
        if (!entry.interactable) return;
        const map = {
            monitor: { prompt: 'Click to use the computer', states: [State.SEATED], onClick: this.handlers.onMonitor },
            chair: { prompt: 'Click to sit down', states: [State.WALKING], onClick: this.handlers.onChair },
            server: { prompt: 'Click to enter the machine', states: [State.SEATED, State.WALKING], onClick: this.handlers.onServer },
        };
        const cfg = map[entry.interactable];
        if (cfg && cfg.onClick) {
            this.interactables.register({
                object3D: group,
                prompt: cfg.prompt,
                states: cfg.states,
                onClick: cfg.onClick,
            });
        }
    }

    dispose() {
        this.scene.remove(this.group);
        this.group.traverse((o) => {
            if (!o.isMesh) return;
            o.geometry?.dispose?.();
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach((m) => {
                if (!m) return;
                m.map?.dispose?.();
                m.normalMap?.dispose?.();
                m.roughnessMap?.dispose?.();
                m.aoMap?.dispose?.();
                m.dispose?.();
            });
        });
    }
}
