// ===================================
// WORLD — APP ORCHESTRATOR (Slice 1)
// Renderer + scene + placeholder room, wired to CameraRig / InputManager /
// StateMachine / Hud. Opens seated at the desk; Esc or the toggle stands you
// up to walk with WASD. Real models & interactables arrive in later slices.
// ===================================

import { CameraRig } from './CameraRig.js';
import { InputManager } from './InputManager.js';
import { StateMachine, State } from './StateMachine.js';
import { Interactables } from './Interactables.js';
import { AssetLoader } from './AssetLoader.js';
import { PerfMonitor } from './PerfMonitor.js';
import { Hud } from '../ui/Hud.js';
import { ScreenView } from '../ui/ScreenView.js';
import { RoomScene } from '../scenes/RoomScene.js';
import { COLORS, FOV } from '../config/theme.js';
import { CAMERA_PRESETS } from '../config/layout.js';

const THREE = window.THREE;

export class WorldApp {
    constructor(container, { onExit } = {}) {
        this.container = container;
        this.onExit = onExit;
        this._disposables = [];
        this._running = false;
        this._raf = null;

        this._initRenderer();
        this._initScene();

        this.rig = new CameraRig(this.camera);
        this.input = new InputManager(this.renderer.domElement);
        this.state = new StateMachine(State.SEATED);
        this.hud = new Hud(this.container, {
            onExit: () => this._exit(),
            onToggleMode: () => this._toggleMode(),
            onToggleLight: () => {
                if (this.room) this.hud.setLightState(this.room.toggleTubeLight());
            },
        });

        this.interactables = new Interactables(this.camera, this.container, () => this.state.current);
        this.screenView = new ScreenView(this.container, { onBack: () => this._exitMonitor() });

        this.input.onEscape = () => this._onEscape();
        this.state.onChange((next) => this.hud.setState(next));
        this.hud.setState(State.SEATED);

        this._clock = new THREE.Clock();
        this._onResize = this._onResize.bind(this);
        this._onVisibility = this._onVisibility.bind(this);
        window.addEventListener('resize', this._onResize);
        document.addEventListener('visibilitychange', this._onVisibility);

        document.body.classList.add('world-open');
    }

    /**
     * Async setup: load textures + models into the RoomScene, reporting
     * progress (0..1). Call once, right after construction.
     */
    async init(onProgress) {
        this.loader = new AssetLoader();
        this.perf = new PerfMonitor({
            onTier: () => this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.perf.pixelRatioCap)),
        });
        this.room = new RoomScene(this.scene, this.loader, this.interactables, {
            onMonitor: () => this._enterMonitor(),
            onChair: () => this._sitFromWalk(),
            onServer: () => this.hud.showHint('Motherboard City — coming soon.'),
            onBalconyOpen: (gapMin, gapMax) => this.rig.setBalcony(true, gapMin, gapMax),
            onBalconyClose: () => this.rig.setBalcony(false),
        });
        await this.room.build(onProgress);
        this._applySeatedView();
        this.hud.setLightState(this.room.tubeOn);
        this.start();
        requestAnimationFrame(() => this._onResize());
    }

    /** Re-aim the seated camera at the real monitor (loaded model heights vary). */
    _applySeatedView() {
        const sv = this.room && this.room.seatedView;
        if (!sv) return;
        CAMERA_PRESETS.seated.position = { ...sv.eye };
        CAMERA_PRESETS.seated.lookAt = { ...sv.look };
        CAMERA_PRESETS.monitorFocus.position = { x: sv.look.x, y: sv.look.y, z: sv.look.z + 0.8 };
        CAMERA_PRESETS.monitorFocus.lookAt = { ...sv.look };
        this.rig.reseat();
    }

    // ---- setup ----
    _getSize() {
        // Fall back to the viewport if the container has not been laid out yet
        // (guards the very first boot before styles are fully applied).
        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;
        return { w, h };
    }

    _initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        const { w, h } = this._getSize();
        this.renderer.setSize(w, h);
        if ('outputEncoding' in this.renderer) this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.domElement.classList.add('world-canvas');
        this.container.appendChild(this.renderer.domElement);
    }

    _initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(COLORS.bgPrimary);

        const { w, h } = this._getSize();
        this.camera = new THREE.PerspectiveCamera(FOV, w / h, 0.1, 100);

        // Dim base fill so "tube light off" reads as night; the RoomScene adds
        // the bright tube light + dim moon/star lights.
        this.scene.add(new THREE.AmbientLight(0x2a2d3e, 0.35));
        this.scene.add(new THREE.HemisphereLight(0x3a4568, 0x14141c, 0.28));
    }

    // ---- transitions ----
    _toggleMode() {
        if (this.rig.isTweening) return;
        this.input.resetKeys();
        if (this.state.is(State.SEATED)) {
            this.state.transition(State.WALKING);
            this.rig.stand();
        } else if (this.state.is(State.WALKING)) {
            this.state.transition(State.SEATED);
            this.rig.sit();
        }
    }

    _onEscape() {
        if (this.state.is(State.MONITOR)) {
            this._exitMonitor();
            return;
        }
        this._toggleMode();
    }

    _enterMonitor() {
        if (this.rig.isTweening || !this.state.is(State.SEATED)) return;
        this.input.resetKeys();
        this.state.transition(State.MONITOR);
        this.rig.focusMonitor(() => this.screenView.enter());
    }

    _exitMonitor() {
        if (!this.state.is(State.MONITOR)) return;
        this.screenView.exit(() => {
            this.state.back();
            this.rig.sit();
        });
    }

    _sitFromWalk() {
        if (this.rig.isTweening || !this.state.is(State.WALKING)) return;
        this.input.resetKeys();
        this.state.transition(State.SEATED);
        this.rig.sit();
    }

    // ---- loop ----
    start() {
        if (this._running) return;
        this._running = true;
        this._clock.start();
        const animate = () => {
            if (!this._running) return;
            this._raf = requestAnimationFrame(animate);
            const dt = Math.min(this._clock.getDelta(), 0.05);
            this.perf?.sample(dt);
            this.rig.update(dt, this.input);
            this.room?.update?.(dt);
            this.interactables.update(this.input);
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    stop() {
        this._running = false;
        if (this._raf) cancelAnimationFrame(this._raf);
        this._raf = null;
    }

    _onVisibility() {
        if (document.hidden) {
            this.stop();
        } else if (!this._running) {
            this.start();
        }
    }

    _onResize() {
        const { w, h } = this._getSize();
        if (!w || !h) return;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    // ---- teardown ----
    _exit() {
        if (typeof this.onExit === 'function') this.onExit();
    }

    dispose() {
        this.stop();
        window.removeEventListener('resize', this._onResize);
        document.removeEventListener('visibilitychange', this._onVisibility);
        this.input?.dispose();
        this.interactables?.dispose();
        this.screenView?.dispose();
        this.hud?.dispose();
        this.room?.dispose();

        this.scene?.traverse((obj) => {
            if (obj.isMesh) {
                obj.geometry?.dispose?.();
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                mats.forEach((m) => {
                    if (!m) return;
                    m.map?.dispose?.();
                    m.dispose?.();
                });
            }
        });
        this._disposables.forEach((d) => d.dispose?.());
        this._disposables = [];

        this.renderer?.dispose?.();
        this.renderer?.domElement?.remove();
        document.body.classList.remove('world-open');
    }
}
