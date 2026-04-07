// ===================================
// PHILOSOPHY SECTION
// 3D Avatar + Floating Tech Objects + Pretext Text Reflow
// ===================================

import {
    prepareWithSegments,
    layoutNextLine
} from 'https://esm.sh/@chenglou/pretext@0.0.4';

// ===================================
// PHILOSOPHY TEXT
// ===================================
const PHILOSOPHY_TEXT = `Code is more than syntax — it is the language through which we shape digital reality. Every line I write carries intention, precision, and a vision for what technology can become when crafted with care.

I believe in building software that breathes — systems that respond, adapt, and evolve alongside the people who use them. From the first algorithm I wrote to the production systems I maintain today, my approach has remained constant: understand deeply, build thoughtfully, and never stop iterating.

My journey began with curiosity — taking apart code to see how it worked, rebuilding it to see how it could work better. That curiosity led me through machine learning research, where I trained neural networks to recognize handwritten digits, through virtual reality experiments that won competitions, and into the heart of healthcare technology.

Today I work at the intersection of legacy systems and modern innovation. I write MUMPS routines that power critical healthcare workflows, design REST APIs that bridge decades-old databases with contemporary web interfaces, and integrate artificial intelligence into platforms that serve thousands of healthcare professionals daily.

The tools change — from Python to JavaScript, from Cache Studio to VS Code, from traditional algorithms to large language models — but the craft remains the same. Write code that humans can read. Build systems that fail gracefully. Ship features that solve real problems for real people.

I am drawn to the edges where disciplines meet. Web development meets 3D graphics. Backend engineering meets AI. Established healthcare systems meet cutting-edge automation. These intersections are where the most interesting problems live, and where the most meaningful solutions are born.

The future of software is not just functional — it is experiential. Every pixel rendered on this screen, every particle that drifts across this page, every word that flows around the figure beside it — these are not decorations. They are demonstrations of what becomes possible when engineering meets imagination.

I want to be part of building that future, one thoughtful commit at a time.`;

// ===================================
// MAIN CLASS
// ===================================
class PhilosophySection {
    constructor() {
        this.container = document.getElementById('philosophyContainer');
        this.avatarCanvas = document.getElementById('avatarCanvas');
        this.textCanvas = document.getElementById('textFlowCanvas');
        this.loadingEl = document.getElementById('philosophyLoading');

        if (!this.container || !this.avatarCanvas || !this.textCanvas) return;

        // State
        this.mouseX = -1000;
        this.mouseY = -1000;
        this.isVisible = false;
        this.wasVisible = false; // track scroll-away-and-back
        this.rafId = null;
        this.clock = new THREE.Clock();

        // Avatar state
        this.avatar = null;
        this.mixer = null;
        this.skeleton = null;
        this.rightArmBone = null;
        this.headBone = null;
        this.spineBone = null;
        this.avatarTargetX = 0;
        this.isWalking = false;
        this.avatarGroup = null;

        // Animation state machine
        // States: idle, walk, jump, wave, bow, dance, backflip,
        //         lookAround, yawn, sitDown, dodge, entrance, welcomeBack
        this.animState = 'idle';
        this.animActions = {};     // keyed by state name → THREE.AnimationAction
        this.activeAction = null;
        this.animLocked = false;   // true while a one-shot plays (no interrupts)
        this.animLockTimer = null;

        // Idle timer system
        this.lastInteractionTime = Date.now();
        this.idleStage = 0;        // 0=normal, 1=lookAround/yawn, 2=sitDown
        this.idleTriggerTimes = [5000, 15000]; // ms thresholds

        // Click tracking (for rapid-click detection + character click)
        this.recentClicks = [];    // timestamps of recent clicks
        this.rapidClickThreshold = 3; // clicks within window
        this.rapidClickWindow = 1200; // ms

        // Procedural animation state (fallbacks when no FBX loaded)
        this.proceduralAnim = {
            jumpPhase: -1,     // -1=inactive, 0..1=progress
            wavePhase: -1,
            dancePhase: -1,
            dodgePhase: -1,
            bowPhase: -1,
            lookAroundPhase: -1,
            yawnPhase: -1,
            entrancePhase: -1,
            welcomePhase: -1,
            backflipPhase: -1,
            sitPhase: -1,
        };

        // Floating objects
        this.floatingObjects = [];

        // Reusable objects to avoid per-frame allocations
        this._tmpBox3 = new THREE.Box3();
        this._tmpVec3 = new THREE.Vector3();
        this._containerLeft = 0;
        this._containerTop = 0;

        // Pretext state
        this.preparedText = null;
        this.textCtx = this.textCanvas.getContext('2d');

        // Theme
        this.isLightTheme = document.body.classList.contains('light-theme');

        this.init();
    }

    async init() {
        this.setupSizes();
        this.setupThreeScene();
        this.createFloatingObjects();
        this.setupEventListeners();
        this.setupIntersectionObserver();

        // Load avatar
        await this.loadAvatar();

        // Prepare pretext after fonts are ready
        await document.fonts.ready;
        this.prepareText();

        // Resize container to fit all text
        this.resizeToFitText();

        // Hide loading
        if (this.loadingEl) this.loadingEl.classList.add('hidden');

        // Start render loop
        this.animate();
    }

    // ===================================
    // SIZING
    // ===================================
    setupSizes() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this._containerLeft = rect.left;
        this._containerTop = rect.top;

        // Set canvas pixel sizes
        const dpr = Math.min(window.devicePixelRatio, 2);

        this.avatarCanvas.width = this.width * dpr;
        this.avatarCanvas.height = this.height * dpr;
        this.textCanvas.width = this.width * dpr;
        this.textCanvas.height = this.height * dpr;

        this.dpr = dpr;
    }

    // ===================================
    // THREE.JS SCENE
    // ===================================
    setupThreeScene() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.avatarCanvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // Scene
        this.scene = new THREE.Scene();

        // Camera - straight at face/eye level of avatar at starting position
        // Avatar feet at Y=7.5, eyes at ~Y=8.7 (1.2m above feet at 0.75 scale)
        this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 8.7, 5);
        this.camera.lookAt(0, 8.7, 0);

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(2, 3, 4);
        this.scene.add(dirLight);

        // Accent light matching theme
        this.accentLight = new THREE.PointLight(
            this.isLightTheme ? 0x0099ff : 0x00f0ff, 0.5, 10
        );
        this.accentLight.position.set(-2, 2, 2);
        this.scene.add(this.accentLight);

        // Avatar group (for positioning/moving)
        this.avatarGroup = new THREE.Group();
        this.avatarGroup.position.set(-1.2, 7.5, 0); // Start top-left
        this.scene.add(this.avatarGroup);

        // Compute visible bounds at Z=0 for clamping
        this.computeVisibleBounds();
    }

    // Compute the visible 3D bounds at the Z=0 plane
    computeVisibleBounds() {
        const raycaster = new THREE.Raycaster();
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

        // Cast rays from each corner of the screen to Z=0
        const corners = [
            new THREE.Vector2(-1, -1), // bottom-left
            new THREE.Vector2(1, -1),  // bottom-right
            new THREE.Vector2(-1, 1),  // top-left
            new THREE.Vector2(1, 1),   // top-right
        ];

        const points = corners.map(ndc => {
            raycaster.setFromCamera(ndc, this.camera);
            const pt = new THREE.Vector3();
            raycaster.ray.intersectPlane(plane, pt);
            return pt;
        });

        this.visibleBounds = {
            left: Math.min(...points.map(p => p.x)),
            right: Math.max(...points.map(p => p.x)),
            bottom: Math.min(...points.map(p => p.y)),
            top: Math.max(...points.map(p => p.y)),
        };

        console.log('[Scene] Visible bounds at Z=0:', this.visibleBounds);
    }

    // ===================================
    // FLOATING TECH OBJECTS
    // ===================================
    createFloatingObjects() {
        const objects = [
            this.createCodeBrackets(),
            this.createNeuralNetwork(),
            this.createDatabaseStack(),
            this.createGear(),
            this.createSparkle(),
            this.createTerminalPlane(),
            this.createAtom(),
            this.createDataCube(),
            this.createCircuitBoard(),
            this.createHashSymbol(),
        ];

        objects.forEach((obj, i) => {
            // Free-moving physics: random velocity + bouncing off walls
            const speed = 0.3 + Math.random() * 0.3;
            const angle = Math.random() * Math.PI * 2;
            obj.userData.vx = Math.cos(angle) * speed;
            obj.userData.vy = Math.sin(angle) * speed;
            obj.userData.spinSpeed = 0.3 + (i * 0.1);
            obj.userData.radius = 0.2; // approximate collision radius

            // Start at random positions within bounds (will be set after bounds computed)
            obj.userData.needsInitPos = true;

            obj.position.z = -0.5; // behind avatar plane
            this.scene.add(obj);
            this.floatingObjects.push(obj);
        });
    }

    createCodeBrackets() {
        // </> made from simple geometry
        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({
            color: this.isLightTheme ? 0x0099ff : 0x00f0ff,
            emissive: this.isLightTheme ? 0x004488 : 0x003344,
            metalness: 0.8,
            roughness: 0.2
        });

        // Left bracket <
        const leftShape = new THREE.Shape();
        leftShape.moveTo(0.15, 0.3);
        leftShape.lineTo(0, 0);
        leftShape.lineTo(0.15, -0.3);
        leftShape.lineTo(0.18, -0.27);
        leftShape.lineTo(0.05, 0);
        leftShape.lineTo(0.18, 0.27);
        const leftGeo = new THREE.ExtrudeGeometry(leftShape, { depth: 0.05, bevelEnabled: false });
        const leftMesh = new THREE.Mesh(leftGeo, mat);
        leftMesh.position.x = -0.2;
        group.add(leftMesh);

        // Right bracket >
        const rightMesh = leftMesh.clone();
        rightMesh.rotation.y = Math.PI;
        rightMesh.position.x = 0.2;
        group.add(rightMesh);

        // Slash /
        const slashShape = new THREE.Shape();
        slashShape.moveTo(-0.03, -0.25);
        slashShape.lineTo(0.03, -0.25);
        slashShape.lineTo(0.08, 0.25);
        slashShape.lineTo(0.02, 0.25);
        const slashGeo = new THREE.ExtrudeGeometry(slashShape, { depth: 0.05, bevelEnabled: false });
        const slashMesh = new THREE.Mesh(slashGeo, mat);
        group.add(slashMesh);

        group.scale.set(0.6, 0.6, 0.6);
        group.userData.type = 'brackets';
        return group;
    }

    createNeuralNetwork() {
        const group = new THREE.Group();
        const nodeMat = new THREE.MeshStandardMaterial({
            color: this.isLightTheme ? 0x6600cc : 0xaa00ff,
            emissive: this.isLightTheme ? 0x330066 : 0x440088,
            metalness: 0.6,
            roughness: 0.3
        });
        const lineMat = new THREE.LineBasicMaterial({
            color: this.isLightTheme ? 0x6600cc : 0x8800cc,
            transparent: true,
            opacity: 0.5
        });

        // Create node positions in 3 layers
        const layers = [
            [{ x: -0.15, y: 0.15 }, { x: -0.15, y: -0.15 }],
            [{ x: 0, y: 0.2 }, { x: 0, y: 0 }, { x: 0, y: -0.2 }],
            [{ x: 0.15, y: 0.1 }, { x: 0.15, y: -0.1 }]
        ];

        const nodeGeo = new THREE.SphereGeometry(0.035, 8, 8);
        const allNodes = [];

        layers.forEach(layer => {
            layer.forEach(pos => {
                const node = new THREE.Mesh(nodeGeo, nodeMat);
                node.position.set(pos.x, pos.y, 0);
                group.add(node);
                allNodes.push(pos);
            });
        });

        // Connect layers with lines
        for (let l = 0; l < layers.length - 1; l++) {
            layers[l].forEach(from => {
                layers[l + 1].forEach(to => {
                    const points = [
                        new THREE.Vector3(from.x, from.y, 0),
                        new THREE.Vector3(to.x, to.y, 0)
                    ];
                    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(lineGeo, lineMat);
                    group.add(line);
                });
            });
        }

        group.scale.set(1.2, 1.2, 1.2);
        group.userData.type = 'neural';
        return group;
    }

    createDatabaseStack() {
        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({
            color: this.isLightTheme ? 0x009966 : 0x00ff88,
            emissive: this.isLightTheme ? 0x004422 : 0x003322,
            metalness: 0.5,
            roughness: 0.4
        });

        const cylGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16);
        for (let i = 0; i < 3; i++) {
            const cyl = new THREE.Mesh(cylGeo, mat);
            cyl.position.y = i * 0.1 - 0.1;
            group.add(cyl);
        }

        group.scale.set(0.8, 0.8, 0.8);
        group.userData.type = 'database';
        return group;
    }

    createGear() {
        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({
            color: this.isLightTheme ? 0x666666 : 0xaaaaaa,
            emissive: this.isLightTheme ? 0x222222 : 0x333333,
            metalness: 0.9,
            roughness: 0.1
        });

        // Ring
        const torusGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 24);
        const torus = new THREE.Mesh(torusGeo, mat);
        group.add(torus);

        // Teeth
        const toothGeo = new THREE.BoxGeometry(0.03, 0.06, 0.03);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const tooth = new THREE.Mesh(toothGeo, mat);
            tooth.position.x = Math.cos(angle) * 0.14;
            tooth.position.y = Math.sin(angle) * 0.14;
            tooth.rotation.z = angle;
            group.add(tooth);
        }

        // Center hub
        const hubGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8);
        const hub = new THREE.Mesh(hubGeo, mat);
        hub.rotation.x = Math.PI / 2;
        group.add(hub);

        group.scale.set(0.7, 0.7, 0.7);
        group.userData.type = 'gear';
        return group;
    }

    createSparkle() {
        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({
            color: this.isLightTheme ? 0xffaa00 : 0xffdd00,
            emissive: this.isLightTheme ? 0xff6600 : 0xffaa00,
            emissiveIntensity: 0.8
        });

        const sphereGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const sphere = new THREE.Mesh(sphereGeo, mat);
        group.add(sphere);

        // Point light attached
        const light = new THREE.PointLight(
            this.isLightTheme ? 0xffaa00 : 0xffdd00, 0.3, 3
        );
        group.add(light);

        group.scale.set(0.6, 0.6, 0.6);
        group.userData.type = 'sparkle';
        return group;
    }

    createTerminalPlane() {
        // A small floating "screen" with code texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Draw terminal background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, 256, 128);

        // Draw code lines
        ctx.font = '10px monospace';
        const lines = [
            '$ cat philosophy.txt',
            '> building the future',
            '> one commit at a time',
            '$ _'
        ];
        lines.forEach((line, i) => {
            ctx.fillStyle = i === 0 || i === 3 ? '#00f0ff' : '#888';
            ctx.fillText(line, 8, 20 + i * 24);
        });

        const texture = new THREE.CanvasTexture(canvas);
        const geo = new THREE.PlaneGeometry(0.4, 0.2);
        const mat = new THREE.MeshStandardMaterial({
            map: texture,
            emissive: new THREE.Color(0x001122),
            emissiveIntensity: 0.3,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData.type = 'terminal';
        mesh.scale.set(0.8, 0.8, 0.8);
        return mesh;
    }

    createAtom() {
        // Atom: central sphere + 3 orbit rings
        const group = new THREE.Group();
        const coreMat = new THREE.MeshStandardMaterial({
            color: this.isLightTheme ? 0xff6600 : 0xff4444,
            emissive: this.isLightTheme ? 0x662200 : 0x441111,
            metalness: 0.6,
            roughness: 0.3
        });
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), coreMat);
        group.add(core);

        const ringMat = new THREE.MeshStandardMaterial({
            color: this.isLightTheme ? 0xff9900 : 0xff6666,
            emissive: this.isLightTheme ? 0x442200 : 0x331111,
            metalness: 0.5,
            roughness: 0.4
        });
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.01, 8, 32), ringMat);
            ring.rotation.x = (i * Math.PI) / 3;
            ring.rotation.z = (i * Math.PI) / 6;
            group.add(ring);
        }

        group.scale.set(1.2, 1.2, 1.2);
        group.userData.type = 'atom';
        return group;
    }

    createDataCube() {
        // Wireframe cube with glowing edges
        const group = new THREE.Group();
        const edgeMat = new THREE.MeshStandardMaterial({
            color: this.isLightTheme ? 0x0066cc : 0x00ccff,
            emissive: this.isLightTheme ? 0x002244 : 0x004466,
            metalness: 0.7,
            roughness: 0.2
        });

        const size = 0.14;
        const r = 0.008;
        // 12 edges of a cube
        const edges = [
            [[-1,-1,-1],[1,-1,-1]], [[-1,1,-1],[1,1,-1]],
            [[-1,-1,1],[1,-1,1]], [[-1,1,1],[1,1,1]],
            [[-1,-1,-1],[-1,1,-1]], [[1,-1,-1],[1,1,-1]],
            [[-1,-1,1],[-1,1,1]], [[1,-1,1],[1,1,1]],
            [[-1,-1,-1],[-1,-1,1]], [[1,-1,-1],[1,-1,1]],
            [[-1,1,-1],[-1,1,1]], [[1,1,-1],[1,1,1]]
        ];
        edges.forEach(([a, b]) => {
            const dx = (b[0]-a[0])*size, dy = (b[1]-a[1])*size, dz = (b[2]-a[2])*size;
            const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 4), edgeMat);
            bar.position.set((a[0]+b[0])*size/2, (a[1]+b[1])*size/2, (a[2]+b[2])*size/2);
            bar.lookAt(new THREE.Vector3(b[0]*size, b[1]*size, b[2]*size));
            bar.rotateX(Math.PI/2);
            group.add(bar);
        });

        group.scale.set(1.3, 1.3, 1.3);
        group.userData.type = 'datacube';
        return group;
    }

    createCircuitBoard() {
        // Small circuit board with traces
        const group = new THREE.Group();
        const boardMat = new THREE.MeshStandardMaterial({
            color: this.isLightTheme ? 0x006633 : 0x00aa44,
            emissive: this.isLightTheme ? 0x002211 : 0x003311,
            metalness: 0.3,
            roughness: 0.6
        });
        const board = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.01), boardMat);
        group.add(board);

        // Traces (small lines on board)
        const traceMat = new THREE.MeshStandardMaterial({
            color: 0xccaa00,
            emissive: 0x443300,
            metalness: 0.9,
            roughness: 0.1
        });
        for (let i = 0; i < 4; i++) {
            const trace = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.005, 0.012), traceMat);
            trace.position.set(0, -0.05 + i * 0.035, 0);
            group.add(trace);
        }
        // Chip
        const chipMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.5, roughness: 0.4 });
        const chip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.015), chipMat);
        chip.position.set(0.05, 0, 0.005);
        group.add(chip);

        group.scale.set(1.0, 1.0, 1.0);
        group.userData.type = 'circuit';
        return group;
    }

    createHashSymbol() {
        // # symbol from bars
        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({
            color: this.isLightTheme ? 0x9933cc : 0xcc66ff,
            emissive: this.isLightTheme ? 0x330066 : 0x441188,
            metalness: 0.6,
            roughness: 0.3
        });
        const barGeo = new THREE.BoxGeometry(0.02, 0.2, 0.02);
        const hBarGeo = new THREE.BoxGeometry(0.2, 0.02, 0.02);

        // Vertical bars
        const v1 = new THREE.Mesh(barGeo, mat); v1.position.x = -0.04; group.add(v1);
        const v2 = new THREE.Mesh(barGeo, mat); v2.position.x = 0.04; group.add(v2);
        // Horizontal bars
        const h1 = new THREE.Mesh(hBarGeo, mat); h1.position.y = -0.04; group.add(h1);
        const h2 = new THREE.Mesh(hBarGeo, mat); h2.position.y = 0.04; group.add(h2);

        group.scale.set(1.2, 1.2, 1.2);
        group.userData.type = 'hash';
        return group;
    }

    // ===================================
    // AVATAR LOADING + ANIMATION SLOTS
    // ===================================
    async loadAvatar() {
        console.log('[Avatar] Starting load... GLTFLoader available:', typeof THREE.GLTFLoader !== 'undefined');
        if (typeof THREE.GLTFLoader === 'undefined') {
            console.warn('[Avatar] GLTFLoader not available — creating placeholder');
            this.createAvatarPlaceholder();
            return;
        }

        const loader = new THREE.GLTFLoader();
        const modelPath = this.isLightTheme
            ? 'images/avatars/formal_model.glb'
            : 'images/avatars/casual_model.glb';

        console.log('[Avatar] Loading model:', modelPath);

        try {
            const gltf = await new Promise((resolve, reject) => {
                loader.load(
                    modelPath,
                    resolve,
                    (progress) => {
                        if (progress.total) console.log('[Avatar] Loading:', Math.round(progress.loaded / progress.total * 100) + '%');
                    },
                    reject
                );
            });

            console.log('[Avatar] Model loaded!', 'Children:', gltf.scene.children.length, 'Animations:', gltf.animations.length);

            this.avatar = gltf.scene;
            this.avatar.scale.set(0.75, 0.75, 0.75);
            this.avatarGroup.add(this.avatar);

            // Force material updates and ensure proper rendering
            let meshCount = 0;
            this.boneNames = [];
            this.avatar.traverse(node => {
                if (node.isBone) {
                    this.boneNames.push(node.name);
                    const n = node.name.toLowerCase();
                    if ((n.includes('rightarm') || n.includes('rightupperarm')) && !this.rightArmBone) {
                        this.rightArmBone = node;
                    }
                    if ((n.includes('leftarm') || n.includes('leftupperarm')) && !this.leftArmBone) {
                        this.leftArmBone = node;
                    }
                    if (n.includes('head') && !this.headBone) {
                        this.headBone = node;
                    }
                    if ((n === 'spine' || n === 'spine1' || n.includes('spine')) && !this.spineBone) {
                        this.spineBone = node;
                    }
                    if (n.includes('hips') && !this.hipsBone) {
                        this.hipsBone = node;
                    }
                    if (n.includes('rightforearm') && !this.rightForeArmBone) {
                        this.rightForeArmBone = node;
                    }
                    if (n.includes('leftforearm') && !this.leftForeArmBone) {
                        this.leftForeArmBone = node;
                    }
                }
                if (node.isSkinnedMesh || node.isMesh) {
                    node.frustumCulled = false;
                    meshCount++;
                    // Ensure materials render properly
                    const mats = Array.isArray(node.material) ? node.material : [node.material];
                    mats.forEach(mat => {
                        mat.needsUpdate = true;
                        // Ensure proper encoding on texture maps
                        if (mat.map) mat.map.encoding = THREE.sRGBEncoding;
                        if (mat.emissiveMap) mat.emissiveMap.encoding = THREE.sRGBEncoding;
                    });
                }
            });

            console.log('[Avatar] Bones found:', this.boneNames.length, 'Meshes:', meshCount);

            // Store default bone rotations for procedural reset
            this.defaultBoneRotations = {};
            if (this.rightArmBone) this.defaultBoneRotations.rightArm = this.rightArmBone.rotation.clone();
            if (this.leftArmBone) this.defaultBoneRotations.leftArm = this.leftArmBone.rotation.clone();
            if (this.headBone) this.defaultBoneRotations.head = this.headBone.rotation.clone();
            if (this.spineBone) this.defaultBoneRotations.spine = this.spineBone.rotation.clone();
            if (this.hipsBone) this.defaultBoneRotations.hips = this.hipsBone.position.clone();

            // Log avatar world-space bounding box for debugging
            const box = new THREE.Box3().setFromObject(this.avatarGroup);
            console.log('[Avatar] Bounding box:', 'min:', box.min.toArray(), 'max:', box.max.toArray());

            // Add invisible hitbox for click detection
            // (SkinnedMesh raycasting is not supported in Three.js r128)
            // Use a cylinder hitbox — rotation-invariant around Y axis
            const hitboxGeom = new THREE.CylinderGeometry(0.5, 0.5, 1.6, 8);
            const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
            this.avatarHitbox = new THREE.Mesh(hitboxGeom, hitboxMat);
            this.avatarHitbox.position.y = 0.8; // center of character at 0.75 scale
            this.avatarGroup.add(this.avatarHitbox);

            // Setup animation mixer
            this.mixer = new THREE.AnimationMixer(this.avatar);

            // If the model has embedded animations, use first as idle
            if (gltf.animations && gltf.animations.length > 0) {
                this.animActions.idle = this.mixer.clipAction(gltf.animations[0]);
                this.animActions.idle.play();
                this.activeAction = this.animActions.idle;
            }

            // Try loading external animation FBX files
            await this.loadAnimations();

        } catch (err) {
            console.error('[Avatar] Load FAILED:', err);
            this.createAvatarPlaceholder();
        }
    }

    // Creates a visible placeholder when avatar GLB fails to load
    createAvatarPlaceholder() {
        const group = new THREE.Group();

        // Body (capsule-like)
        const bodyGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 12);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: this.isLightTheme ? 0x3a4a6b : 0x5eead4,
            roughness: 0.6,
            metalness: 0.2
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.9;
        group.add(body);

        // Head
        const headGeo = new THREE.SphereGeometry(0.2, 16, 12);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.y = 1.55;
        group.add(head);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
        const leftLeg = new THREE.Mesh(legGeo, bodyMat);
        leftLeg.position.set(-0.12, 0.25, 0);
        group.add(leftLeg);
        const rightLeg = new THREE.Mesh(legGeo, bodyMat);
        rightLeg.position.set(0.12, 0.25, 0);
        group.add(rightLeg);

        this.avatarGroup.add(group);
        this.avatar = group; // So obstacle detection still works
        console.log('[Avatar] Placeholder created (GLB failed to load)');
    }

    async loadAnimations() {
        if (typeof THREE.FBXLoader === 'undefined' || !this.mixer) return;

        const fbxLoader = new THREE.FBXLoader();
        const isCasual = !this.isLightTheme;

        // Animation file map: state → path
        // Mixamo FBX (without skin) files in images/avatars/
        const animMap = {
            idle: 'images/avatars/Idle.fbx',
            walk: isCasual ? 'images/avatars/Walk-casual.fbx' : 'images/avatars/walk-formal.fbx',
            walkUp: 'images/avatars/Ascending-Stairs.fbx',
            jump: 'images/avatars/Jump.fbx',
            wave: 'images/avatars/wave.fbx',
            bow: 'images/avatars/bow.fbx',
            dance: 'images/avatars/dance.fbx',
            backflip: 'images/avatars/Backflip.fbx',
            lookAround: 'images/avatars/look-around.fbx',
            yawn: 'images/avatars/Yawn.fbx',
            sitDown: 'images/avatars/sit-down.fbx',
            dodge: 'images/avatars/dodge.fbx',
            entrance: isCasual ? 'images/avatars/entrance-casual.fbx' : 'images/avatars/entrance-formal.fbx',
        };

        // Build bone name mapping: Mixamo uses "mixamorig:BoneName"
        // Avaturn uses plain bone names. Build a lookup map.
        const boneMap = {};
        for (const name of this.boneNames) {
            // Map "mixamorig:BoneName" → actual bone name in GLB
            // Mixamo prefix is "mixamorig:" — strip it to get the base
            const base = name.replace(/^mixamorig[:\.]?/i, '');
            boneMap[base.toLowerCase()] = name;
        }

        for (const [state, path] of Object.entries(animMap)) {
            try {
                const fbx = await new Promise((resolve, reject) => {
                    fbxLoader.load(path, resolve, undefined, reject);
                });
                if (fbx.animations && fbx.animations.length > 0) {
                    const clip = fbx.animations[0];

                    // Retarget: rename tracks from Mixamo's naming to GLB's naming
                    const retargetedClip = this.retargetClip(clip, boneMap);
                    retargetedClip.name = state;

                    this.animActions[state] = this.mixer.clipAction(retargetedClip);

                    // One-shot animations should not loop
                    const oneShots = ['jump', 'wave', 'bow', 'dance', 'backflip', 'dodge', 'entrance', 'yawn'];
                    if (oneShots.includes(state)) {
                        this.animActions[state].setLoop(THREE.LoopOnce);
                        this.animActions[state].clampWhenFinished = true;
                    }

                    console.log(`Loaded animation: ${state} (${retargetedClip.tracks.length} tracks)`);
                }
            } catch (e) {
                // File not found — procedural fallback will be used
                console.log(`Animation not found: ${state} — using procedural fallback`);
            }
        }

        // Play idle animation immediately if loaded
        if (this.animActions.idle) {
            this.animActions.idle.play();
            this.activeAction = this.animActions.idle;
            this.animState = 'idle';
            console.log('Idle animation started');
        }
    }

    // Retarget a Mixamo FBX clip to work with Avaturn GLB skeleton
    retargetClip(clip, boneMap) {
        const newTracks = [];

        for (const track of clip.tracks) {
            // Track names look like: "mixamorig:Hips.position" or "mixamorig:Spine.quaternion"
            const dotIndex = track.name.indexOf('.');
            if (dotIndex === -1) {
                newTracks.push(track);
                continue;
            }

            const bonePart = track.name.substring(0, dotIndex);
            const propPart = track.name.substring(dotIndex); // e.g. ".quaternion", ".position"

            // Strip mixamorig prefix to get base name
            const baseName = bonePart.replace(/^mixamorig[:\.]?/i, '');

            // Try to find matching bone in GLB
            let targetBone = boneMap[baseName.toLowerCase()];

            if (!targetBone) {
                // Try without the prefix — maybe the names already match
                // Also try common Avaturn naming patterns
                const altNames = [
                    baseName,
                    baseName.replace('Left', 'Left_'),
                    baseName.replace('Right', 'Right_'),
                ];
                for (const alt of altNames) {
                    if (boneMap[alt.toLowerCase()]) {
                        targetBone = boneMap[alt.toLowerCase()];
                        break;
                    }
                }
            }

            if (targetBone) {
                // Clone track with new name targeting our skeleton
                const newTrack = track.clone();
                newTrack.name = targetBone + propPart;

                // Mixamo FBX uses centimeters, Avaturn GLB uses meters.
                // Scale all position tracks by 0.01 to convert cm → m.
                if (propPart === '.position') {
                    const vals = newTrack.values;
                    const isHips = baseName.toLowerCase() === 'hips';
                    // First pass: scale cm → m
                    for (let i = 0; i < vals.length; i++) {
                        vals[i] *= 0.01;
                    }
                    // Second pass: strip forward root motion from Hips
                    // Lock Z to first-frame value (prevents forward drift)
                    // Keep X (natural walking sway) and Y (vertical bobbing)
                    if (isHips && vals.length >= 3) {
                        const baseZ = vals[2];
                        for (let i = 0; i < vals.length; i += 3) {
                            vals[i + 2] = baseZ;   // Lock Z (no forward drift)
                        }
                    }
                }

                newTracks.push(newTrack);
            }
            // Skip tracks we can't map — partial animation is fine
        }

        return new THREE.AnimationClip(clip.name, clip.duration, newTracks);
    }

    // Crossfade between animation actions
    switchAnimation(newState, fadeDuration = 0.3) {
        if (this.animLocked && newState !== 'idle') return;

        // Reset procedural animations when switching to FBX-based one
        if (this.defaultBoneRotations) {
            this.resetProceduralAnims();
        }

        const newAction = this.animActions[newState];

        // If we have an FBX-based action, use it
        if (newAction && newAction !== this.activeAction) {
            if (this.activeAction) this.activeAction.fadeOut(fadeDuration);
            newAction.reset().fadeIn(fadeDuration).play();
            this.activeAction = newAction;
            this.animState = newState;
            return true;
        }

        // No FBX action → trigger procedural fallback
        this.animState = newState;
        this.startProceduralAnim(newState);
        return false;
    }

    // Lock animations for one-shot duration, then return to idle
    playOneShotAnim(state, durationMs) {
        if (this.animLocked) return;
        // Switch animation FIRST, then lock (switchAnimation checks animLocked)
        this.switchAnimation(state, 0.2);
        this.animLocked = true;

        // Show chair when sitting down
        if (state === 'sitDown') {
            this.showChair();
        }

        clearTimeout(this.animLockTimer);
        this.animLockTimer = setTimeout(() => {
            this.animLocked = false;
            if (state === 'sitDown') {
                this.hideChair();
            }
            this.switchAnimation('idle', 0.4);
        }, durationMs);
        console.log('[Anim] Playing one-shot:', state, 'for', durationMs, 'ms');
    }

    // ===================================
    // PROCEDURAL FALLBACK ANIMATIONS
    // (used when Mixamo FBX not available)
    // ===================================
    startProceduralAnim(state) {
        // Reset all
        for (const key of Object.keys(this.proceduralAnim)) {
            this.proceduralAnim[key] = -1;
        }

        const map = {
            jump: 'jumpPhase',
            wave: 'wavePhase',
            dance: 'dancePhase',
            dodge: 'dodgePhase',
            bow: 'bowPhase',
            lookAround: 'lookAroundPhase',
            yawn: 'yawnPhase',
            entrance: 'entrancePhase',
            welcomeBack: 'welcomePhase',
            backflip: 'backflipPhase',
            sitDown: 'sitPhase',
        };

        if (map[state]) this.proceduralAnim[map[state]] = 0;
    }

    updateProceduralAnimations(delta) {
        // Skip if an FBX-based animation is active (FBX handles bones via mixer)
        const hasActiveFBX = this.activeAction && this.animActions[this.animState] === this.activeAction;
        if (hasActiveFBX && this.animState !== 'idle') return;

        const p = this.proceduralAnim;
        // Check if any procedural anim is actually running
        const anyActive = Object.values(p).some(v => v >= 0);
        if (!anyActive) return;

        const speed = delta * 1.5; // animation speed multiplier

        // Helper: reset bones to defaults smoothly
        const resetBone = (bone, defaultRot, ease = 0.08) => {
            if (!bone || !defaultRot) return;
            if (defaultRot.isEuler || defaultRot.x !== undefined) {
                bone.rotation.x += (defaultRot.x - bone.rotation.x) * ease;
                bone.rotation.y += (defaultRot.y - bone.rotation.y) * ease;
                bone.rotation.z += (defaultRot.z - bone.rotation.z) * ease;
            }
        };

        // === JUMP (arc up then down) ===
        if (p.jumpPhase >= 0 && p.jumpPhase < 1) {
            if (p.jumpPhase < 0.01) this._animBaseY = this.avatarGroup.position.y;
            p.jumpPhase += speed * 0.8;
            const t = p.jumpPhase;
            // Parabolic: peak at t=0.5
            const jumpHeight = Math.sin(t * Math.PI) * 0.6;
            this.avatarGroup.position.y = (this._animBaseY || 0) + jumpHeight;
            // Tuck legs slightly at peak
            if (this.spineBone) {
                this.spineBone.rotation.x = -Math.sin(t * Math.PI) * 0.15;
            }
            if (t >= 1) {
                p.jumpPhase = -1;
                this.avatarGroup.position.y = this._animBaseY || 0;
                if (this.spineBone) resetBone(this.spineBone, this.defaultBoneRotations.spine);
            }
        }

        // === WAVE (right arm swings side to side) ===
        if (p.wavePhase >= 0 && p.wavePhase < 1) {
            p.wavePhase += speed * 0.5;
            const t = p.wavePhase;
            if (this.rightArmBone) {
                // Raise arm up
                this.rightArmBone.rotation.z = -2.5; // arm up
                this.rightArmBone.rotation.x = 0;
                // Wave back and forth
                if (this.rightForeArmBone) {
                    this.rightForeArmBone.rotation.z = Math.sin(t * Math.PI * 6) * 0.4;
                }
            }
            if (t >= 1) {
                p.wavePhase = -1;
                if (this.rightArmBone) resetBone(this.rightArmBone, this.defaultBoneRotations.rightArm);
                if (this.rightForeArmBone) this.rightForeArmBone.rotation.set(0, 0, 0);
            }
        }

        // === DANCE (rhythmic body bounce + arm moves) ===
        if (p.dancePhase >= 0 && p.dancePhase < 1) {
            if (p.dancePhase < 0.01) this._animBaseY = this.avatarGroup.position.y;
            p.dancePhase += speed * 0.35;
            const t = p.dancePhase;
            const bounce = Math.sin(t * Math.PI * 8) * 0.1;
            this.avatarGroup.position.y = (this._animBaseY || 0) + Math.abs(bounce);
            if (this.rightArmBone) {
                this.rightArmBone.rotation.z = -1.5 + Math.sin(t * Math.PI * 8) * 0.5;
            }
            if (this.leftArmBone) {
                this.leftArmBone.rotation.z = 1.5 - Math.sin(t * Math.PI * 8 + Math.PI) * 0.5;
            }
            if (this.hipsBone) {
                this.hipsBone.rotation.y = Math.sin(t * Math.PI * 4) * 0.15;
            }
            if (t >= 1) {
                p.dancePhase = -1;
                this.avatarGroup.position.y = this._animBaseY || 0;
                if (this.rightArmBone) resetBone(this.rightArmBone, this.defaultBoneRotations.rightArm);
                if (this.leftArmBone) resetBone(this.leftArmBone, this.defaultBoneRotations.leftArm);
            }
        }

        // === BOW (formal bend forward) ===
        if (p.bowPhase >= 0 && p.bowPhase < 1) {
            p.bowPhase += speed * 0.6;
            const t = p.bowPhase;
            // Bend forward then up: sine curve
            const bendAngle = Math.sin(t * Math.PI) * 0.5;
            if (this.spineBone) this.spineBone.rotation.x = -bendAngle;
            if (this.headBone) this.headBone.rotation.x = -bendAngle * 0.3;
            if (t >= 1) {
                p.bowPhase = -1;
                if (this.spineBone) resetBone(this.spineBone, this.defaultBoneRotations.spine);
                if (this.headBone) resetBone(this.headBone, this.defaultBoneRotations.head);
            }
        }

        // === BACKFLIP (rotate entire avatar group) ===
        if (p.backflipPhase >= 0 && p.backflipPhase < 1) {
            p.backflipPhase += speed * 1.0;
            const t = p.backflipPhase;
            // Jump arc
            const jumpH = Math.sin(t * Math.PI) * 1.0;
            this.avatarGroup.position.y = jumpH;
            // Full backflip rotation
            this.avatarGroup.rotation.x = -t * Math.PI * 2;
            if (t >= 1) {
                p.backflipPhase = -1;
                this.avatarGroup.position.y = 0;
                this.avatarGroup.rotation.x = 0;
            }
        }

        // === DODGE (quick side step) ===
        if (p.dodgePhase >= 0 && p.dodgePhase < 1) {
            p.dodgePhase += speed * 2.0;
            const t = p.dodgePhase;
            // Quick lean back and to the side
            const lean = Math.sin(t * Math.PI) * 0.3;
            if (this.spineBone) {
                this.spineBone.rotation.x = lean;
                this.spineBone.rotation.z = Math.sin(t * Math.PI) * 0.2;
            }
            // Duck head
            if (this.headBone) {
                this.headBone.rotation.x = Math.sin(t * Math.PI) * 0.3;
            }
            // Raise arms defensively
            if (this.rightArmBone) this.rightArmBone.rotation.z = -1.2 * Math.sin(t * Math.PI);
            if (this.leftArmBone) this.leftArmBone.rotation.z = 1.2 * Math.sin(t * Math.PI);

            if (t >= 1) {
                p.dodgePhase = -1;
                if (this.spineBone) resetBone(this.spineBone, this.defaultBoneRotations.spine);
                if (this.headBone) resetBone(this.headBone, this.defaultBoneRotations.head);
                if (this.rightArmBone) resetBone(this.rightArmBone, this.defaultBoneRotations.rightArm);
                if (this.leftArmBone) resetBone(this.leftArmBone, this.defaultBoneRotations.leftArm);
            }
        }

        // === LOOK AROUND (head turns left-right-center) ===
        if (p.lookAroundPhase >= 0 && p.lookAroundPhase < 1) {
            p.lookAroundPhase += speed * 0.3;
            const t = p.lookAroundPhase;
            if (this.headBone) {
                this.headBone.rotation.y = Math.sin(t * Math.PI * 3) * 0.5;
                this.headBone.rotation.x = Math.sin(t * Math.PI * 1.5) * 0.1;
            }
            if (t >= 1) {
                p.lookAroundPhase = -1;
                if (this.headBone) resetBone(this.headBone, this.defaultBoneRotations.head);
            }
        }

        // === YAWN (stretch arms up, tilt head back) ===
        if (p.yawnPhase >= 0 && p.yawnPhase < 1) {
            p.yawnPhase += speed * 0.25;
            const t = p.yawnPhase;
            const stretch = Math.sin(t * Math.PI);
            if (this.rightArmBone) this.rightArmBone.rotation.z = -2.8 * stretch;
            if (this.leftArmBone) this.leftArmBone.rotation.z = 2.8 * stretch;
            if (this.headBone) this.headBone.rotation.x = 0.3 * stretch;
            if (this.spineBone) this.spineBone.rotation.x = 0.1 * stretch;
            if (t >= 1) {
                p.yawnPhase = -1;
                if (this.rightArmBone) resetBone(this.rightArmBone, this.defaultBoneRotations.rightArm);
                if (this.leftArmBone) resetBone(this.leftArmBone, this.defaultBoneRotations.leftArm);
                if (this.headBone) resetBone(this.headBone, this.defaultBoneRotations.head);
                if (this.spineBone) resetBone(this.spineBone, this.defaultBoneRotations.spine);
            }
        }

        // === ENTRANCE (slide in from side with flair) ===
        if (p.entrancePhase >= 0 && p.entrancePhase < 1) {
            p.entrancePhase += speed * 0.6;
            const t = p.entrancePhase;
            // Slide from far left
            this.avatarGroup.position.x = -3 + t * 1.8; // → -1.2
            // Slight bounce at end
            if (t > 0.7) {
                const bouncet = (t - 0.7) / 0.3;
                this.avatarGroup.position.y = Math.sin(bouncet * Math.PI) * 0.15;
            }
            if (t >= 1) {
                p.entrancePhase = -1;
                this.avatarGroup.position.x = -1.2;
                this.avatarGroup.position.y = 0;
            }
        }

        // === WELCOME BACK (quick head nod + small wave) ===
        if (p.welcomePhase >= 0 && p.welcomePhase < 1) {
            p.welcomePhase += speed * 0.8;
            const t = p.welcomePhase;
            // Head nod
            if (this.headBone) {
                this.headBone.rotation.x = -Math.sin(t * Math.PI * 2) * 0.2;
            }
            // Small wave
            if (this.rightArmBone) {
                this.rightArmBone.rotation.z = -Math.sin(t * Math.PI) * 1.5;
            }
            if (t >= 1) {
                p.welcomePhase = -1;
                if (this.headBone) resetBone(this.headBone, this.defaultBoneRotations.head);
                if (this.rightArmBone) resetBone(this.rightArmBone, this.defaultBoneRotations.rightArm);
            }
        }

        // === SIT DOWN (lower hips, bend knees) ===
        if (p.sitPhase >= 0) {
            if (p.sitPhase < 0.01) {
                // Store base Y at start of sit
                this._sitBaseY = this.avatarGroup.position.y;
                // Show chair behind avatar
                this.showChair();
            }
            if (p.sitPhase < 1) p.sitPhase += speed * 0.4;
            const t = Math.min(p.sitPhase, 1);
            // Lower hips relative to where we started
            this.avatarGroup.position.y = (this._sitBaseY || 0) - t * 0.35;
            if (this.spineBone) this.spineBone.rotation.x = -t * 0.15;
            // Stays seated (no auto-reset) until next interaction
        }
    }

    resetProceduralAnims() {
        for (const key of Object.keys(this.proceduralAnim)) {
            this.proceduralAnim[key] = -1;
        }
        // Restore position.y to base (undo sit-down offset)
        if (this._sitBaseY !== undefined) {
            this.avatarGroup.position.y = this._sitBaseY;
            this._sitBaseY = undefined;
        }
        this.avatarGroup.rotation.x = 0;

        // Hide chair when standing up
        this.hideChair();

        // Reset bones
        const d = this.defaultBoneRotations;
        if (this.rightArmBone && d.rightArm) this.rightArmBone.rotation.copy(d.rightArm);
        if (this.leftArmBone && d.leftArm) this.leftArmBone.rotation.copy(d.leftArm);
        if (this.headBone && d.head) this.headBone.rotation.copy(d.head);
        if (this.spineBone && d.spine) this.spineBone.rotation.copy(d.spine);
    }

    // ===================================
    // CHAIR FOR SIT-DOWN
    // ===================================
    createChair() {
        const group = new THREE.Group();
        const isLight = this.isLightTheme;

        // Modern office chair - metal frame + padded seat/back
        const frameMat = new THREE.MeshStandardMaterial({
            color: isLight ? 0x666666 : 0x888888,
            metalness: 0.8,
            roughness: 0.3
        });
        const cushionMat = new THREE.MeshStandardMaterial({
            color: isLight ? 0x2a2a3a : 0x1a1a2a,
            emissive: isLight ? 0x111118 : 0x0a0a15,
            roughness: 0.9,
            metalness: 0.0
        });

        // Seat cushion
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.38), cushionMat);
        seat.position.set(0, 0.4, 0);
        group.add(seat);

        // Backrest cushion — at -Z (behind character, away from camera)
        const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.4, 0.04), cushionMat);
        backrest.position.set(0, 0.625, -0.2);
        group.add(backrest);

        // Backrest frame
        const backFrame = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.02), frameMat);
        backFrame.position.set(0, 0.625, -0.22);
        group.add(backFrame);

        // 4 legs — metal tubes (short)
        const legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6);
        [[-0.16, 0.275, 0.14], [0.16, 0.275, 0.14],
         [-0.16, 0.275, -0.14], [0.16, 0.275, -0.14]].forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeo, frameMat);
            leg.position.set(x, y, z);
            group.add(leg);
        });

        // Cross bars between legs for stability
        const barGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.28, 4);
        const leftBar = new THREE.Mesh(barGeo, frameMat);
        leftBar.position.set(-0.16, 0.2, 0);
        leftBar.rotation.x = Math.PI / 2;
        group.add(leftBar);
        const rightBar = new THREE.Mesh(barGeo, frameMat);
        rightBar.position.set(0.16, 0.2, 0);
        rightBar.rotation.x = Math.PI / 2;
        group.add(rightBar);

        group.visible = false;
        return group;
    }

    showChair() {
        if (!this.chairMesh) {
            this.chairMesh = this.createChair();
            this.avatarGroup.add(this.chairMesh);
        }
        this.chairMesh.position.set(0, -0.1, -0.05);
        this.chairMesh.visible = true;
    }

    hideChair() {
        if (this.chairMesh) {
            this.chairMesh.visible = false;
        }
    }

    // ===================================
    // PRETEXT
    // ===================================
    prepareText() {
        const fontSize = this.width < 500 ? 13 : this.width < 800 ? 15 : 17;
        this.fontSize = fontSize;
        this.lineHeight = Math.round(fontSize * 1.7);
        this.fontString = `${fontSize}px 'Share Tech Mono', monospace`;

        try {
            this.preparedText = prepareWithSegments(PHILOSOPHY_TEXT, this.fontString);
        } catch (e) {
            console.warn('Pretext prepare failed:', e);
            this.preparedText = null;
        }
    }

    // Compute needed height for all text and resize container + canvases
    resizeToFitText() {
        if (!this.preparedText) return;

        const textPadding = 30;
        const fullWidth = this.width - textPadding * 2;
        // Dry-run layout using half width to simulate worst-case obstacle compression
        const simWidth = Math.max(fullWidth * 0.45, 120);

        let cursor = { segmentIndex: 0, graphemeIndex: 0 };
        let y = textPadding + this.lineHeight;

        while (true) {
            const line = layoutNextLine(this.preparedText, cursor, simWidth);
            if (line === null) break;
            cursor = line.end;
            y += this.lineHeight;
        }

        const neededHeight = y + textPadding + 40; // add bottom padding + buffer

        if (neededHeight > this.height) {
            const originalHeight = this.height;

            this.container.style.height = neededHeight + 'px';
            this.height = neededHeight;

            const dpr = this.dpr;
            this.textCanvas.width = this.width * dpr;
            this.textCanvas.height = this.height * dpr;

            this.renderer.setSize(this.width, this.height);

            const oldAspect = this.width / originalHeight;
            const newAspect = this.width / this.height;
            this.camera.aspect = newAspect;

            // Preserve horizontal FOV: increase vertical FOV to compensate
            // for the narrower aspect ratio (portrait container)
            const origVFovRad = 35 * Math.PI / 180; // original FOV in radians
            const hFovRad = 2 * Math.atan(Math.tan(origVFovRad / 2) * oldAspect);
            const newVFovRad = 2 * Math.atan(Math.tan(hFovRad / 2) / newAspect);
            this.camera.fov = newVFovRad * 180 / Math.PI;

            this.camera.updateProjectionMatrix();

            // Recompute visible bounds with new camera
            this.computeVisibleBounds();

            console.log('[Text] Resized container to', neededHeight + 'px', '(was ' + originalHeight + 'px)', 'Camera FOV:', this.camera.fov.toFixed(1) + '°');
        }
    }

    // ===================================
    // PROJECT 3D → 2D BOUNDING BOXES
    // ===================================
    getObstacleRects() {
        const rects = [];
        const padding = 15;
        const box = this._tmpBox3;

        // Avatar bounding box → 2D
        if (this.avatar) {
            box.setFromObject(this.avatarGroup);
            const rect = this.projectBoxToScreen(box);
            if (rect) {
                rects.push({
                    left: rect.left - padding,
                    right: rect.right + padding,
                    top: rect.top - padding,
                    bottom: rect.bottom + padding
                });
            }
        }

        // Floating objects → 2D
        this.floatingObjects.forEach(obj => {
            box.setFromObject(obj);
            const rect = this.projectBoxToScreen(box);
            if (rect && rect.right - rect.left > 5 && rect.bottom - rect.top > 5) {
                rects.push({
                    left: rect.left - padding * 0.6,
                    right: rect.right + padding * 0.6,
                    top: rect.top - padding * 0.6,
                    bottom: rect.bottom + padding * 0.6
                });
            }
        });

        return rects;
    }

    projectBoxToScreen(box) {
        const v = this._tmpVec3;
        const coords = [
            [box.min.x, box.min.y, box.min.z],
            [box.max.x, box.min.y, box.min.z],
            [box.min.x, box.max.y, box.min.z],
            [box.max.x, box.max.y, box.min.z],
            [box.min.x, box.min.y, box.max.z],
            [box.max.x, box.min.y, box.max.z],
            [box.min.x, box.max.y, box.max.z],
            [box.max.x, box.max.y, box.max.z],
        ];

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (const c of coords) {
            v.set(c[0], c[1], c[2]).project(this.camera);

            // Convert from NDC [-1,1] to canvas pixel coords
            const x = (v.x * 0.5 + 0.5) * this.width;
            const y = (-v.y * 0.5 + 0.5) * this.height;

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        // Off-screen check
        if (maxX < 0 || minX > this.width || maxY < 0 || minY > this.height) return null;

        return {
            left: Math.max(0, minX),
            right: Math.min(this.width, maxX),
            top: Math.max(0, minY),
            bottom: Math.min(this.height, maxY)
        };
    }

    // ===================================
    // TEXT REFLOW + RENDER
    // ===================================
    renderText() {
        if (!this.preparedText) return;

        const ctx = this.textCtx;
        const dpr = this.dpr;
        const w = this.width;
        const h = this.height;

        ctx.clearRect(0, 0, w * dpr, h * dpr);
        ctx.save();
        ctx.scale(dpr, dpr);

        // Text appearance
        const isLight = this.isLightTheme;
        ctx.font = this.fontString;
        ctx.fillStyle = isLight ? '#1a1a2e' : '#c8c8e0';
        ctx.shadowColor = isLight ? 'transparent' : 'rgba(0, 240, 255, 0.15)';
        ctx.shadowBlur = isLight ? 0 : 6;

        const obstacles = this.getObstacleRects();
        const textPadding = 30; // Edge padding
        const fullWidth = w - textPadding * 2;

        let cursor = { segmentIndex: 0, graphemeIndex: 0 };
        let y = textPadding + this.lineHeight;

        while (y < h - textPadding) {
            const lineTop = y - this.fontSize;
            const lineBot = y + 4; // small descender buffer

            // Find width available at this Y, accounting for obstacles
            let lineX = textPadding;
            let lineWidth = fullWidth;

            for (const rect of obstacles) {
                // Does this obstacle overlap this line vertically?
                if (rect.bottom < lineTop || rect.top > lineBot) continue;

                const obsLeft = rect.left;
                const obsRight = rect.right;

                // Obstacle on the left side
                if (obsLeft <= textPadding + fullWidth * 0.5) {
                    const newLeft = Math.max(lineX, obsRight);
                    lineWidth -= (newLeft - lineX);
                    lineX = newLeft;
                }

                // Obstacle on the right side
                if (obsRight >= textPadding + fullWidth * 0.5) {
                    const newRight = Math.min(textPadding + fullWidth, obsLeft);
                    lineWidth = Math.min(lineWidth, newRight - lineX);
                }
            }

            // Ensure minimum width
            if (lineWidth < 60) {
                y += this.lineHeight;
                continue;
            }

            const line = layoutNextLine(this.preparedText, cursor, lineWidth);
            if (line === null) break;

            ctx.fillText(line.text, lineX, y);
            cursor = line.end;
            y += this.lineHeight;
        }

        ctx.restore();
    }

    // ===================================
    // FLOATING OBJECTS ANIMATION
    // ===================================
    // ===================================
    updateFloatingObjects(time) {
        if (!this.visibleBounds) return;
        const b = this.visibleBounds;
        const margin = 0.3;
        const dt = 0.016; // ~60fps timestep

        const localMouseX = this.mouseX - this._containerLeft;
        const localMouseY = this.mouseY - this._containerTop;

        this.floatingObjects.forEach(obj => {
            const ud = obj.userData;

            // Initialize position within bounds on first frame
            if (ud.needsInitPos) {
                obj.position.x = b.left + margin + Math.random() * (b.right - b.left - margin * 2);
                obj.position.y = b.bottom + margin + Math.random() * (b.top - b.bottom - margin * 2);
                ud.needsInitPos = false;
            }

            // Cursor repel
            if (localMouseX > 0 && localMouseX < this.width &&
                localMouseY > 0 && localMouseY < this.height) {
                const mx = ((localMouseX / this.width) * 2 - 1) * (b.right - b.left) / 2;
                const my = -((localMouseY / this.height) * 2 - 1) * (b.top - b.bottom) / 2 + (b.top + b.bottom) / 2;
                const dx = obj.position.x - mx;
                const dy = obj.position.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 1.2 && dist > 0.01) {
                    const force = (1 - dist / 1.2) * 0.8;
                    ud.vx += (dx / dist) * force * dt;
                    ud.vy += (dy / dist) * force * dt;
                }
            }

            // Move
            obj.position.x += ud.vx * dt;
            obj.position.y += ud.vy * dt;

            // Bounce off walls
            if (obj.position.x < b.left + margin) {
                obj.position.x = b.left + margin;
                ud.vx = Math.abs(ud.vx);
            } else if (obj.position.x > b.right - margin) {
                obj.position.x = b.right - margin;
                ud.vx = -Math.abs(ud.vx);
            }
            if (obj.position.y < b.bottom + margin) {
                obj.position.y = b.bottom + margin;
                ud.vy = Math.abs(ud.vy);
            } else if (obj.position.y > b.top - margin) {
                obj.position.y = b.top - margin;
                ud.vy = -Math.abs(ud.vy);
            }

            // Gentle speed limit so they don't go crazy
            const speed = Math.sqrt(ud.vx * ud.vx + ud.vy * ud.vy);
            const maxSpeed = 0.6;
            if (speed > maxSpeed) {
                ud.vx = (ud.vx / speed) * maxSpeed;
                ud.vy = (ud.vy / speed) * maxSpeed;
            }

            // Spin
            obj.rotation.y += ud.spinSpeed * 0.01;
            obj.rotation.x += ud.spinSpeed * 0.005;
            if (ud.type === 'gear') obj.rotation.z += 0.005;
        });

        // Inter-object collisions — bounce off each other
        for (let i = 0; i < this.floatingObjects.length; i++) {
            for (let j = i + 1; j < this.floatingObjects.length; j++) {
                const a = this.floatingObjects[i];
                const bObj = this.floatingObjects[j];
                const dx = bObj.position.x - a.position.x;
                const dy = bObj.position.y - a.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = (a.userData.radius || 0.2) + (bObj.userData.radius || 0.2);

                if (dist < minDist && dist > 0.01) {
                    // Push apart
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const overlap = minDist - dist;
                    a.position.x -= nx * overlap * 0.5;
                    a.position.y -= ny * overlap * 0.5;
                    bObj.position.x += nx * overlap * 0.5;
                    bObj.position.y += ny * overlap * 0.5;

                    // Swap velocity components along collision normal
                    const aVn = a.userData.vx * nx + a.userData.vy * ny;
                    const bVn = bObj.userData.vx * nx + bObj.userData.vy * ny;
                    a.userData.vx += (bVn - aVn) * nx * 0.8;
                    a.userData.vy += (bVn - aVn) * ny * 0.8;
                    bObj.userData.vx += (aVn - bVn) * nx * 0.8;
                    bObj.userData.vy += (aVn - bVn) * ny * 0.8;
                }
            }
        }
    }



    // ===================================
    // CLICK DETECTION — CHARACTER vs GROUND
    // ===================================
    isClickOnCharacter(e) {
        if (!this.avatar) return false;

        const containerRect = this.container.getBoundingClientRect();
        const clickX = e.clientX - containerRect.left;
        const clickY = e.clientY - containerRect.top;

        const ndcX = (clickX / this.width) * 2 - 1;
        const ndcY = -(clickY / this.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);

        // Raycast against invisible hitbox (SkinnedMesh raycasting not supported in r128)
        if (this.avatarHitbox) {
            // Force world matrix update so hitbox position is current
            this.avatarGroup.updateMatrixWorld(true);
            const intersects = raycaster.intersectObject(this.avatarHitbox, false);
            console.log('[Click] Hitbox raycast:', intersects.length, 'hits, NDC:', ndcX.toFixed(2), ndcY.toFixed(2));
            if (intersects.length > 0) {
                console.log('[Click] Hit avatar hitbox!');
                return true;
            }
        }

        // Fallback: screen-space distance to avatar center
        const avatarWorldPos = new THREE.Vector3();
        this.avatarGroup.getWorldPosition(avatarWorldPos);
        avatarWorldPos.y += 0.7; // offset to chest height
        avatarWorldPos.project(this.camera);

        const screenX = (avatarWorldPos.x * 0.5 + 0.5) * this.width;
        const screenY = (-avatarWorldPos.y * 0.5 + 0.5) * this.height;

        const dx = clickX - screenX;
        const dy = clickY - screenY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const hit = dist <= 120;
        console.log('[Click] Fallback - click:', clickX.toFixed(0), clickY.toFixed(0),
            'avatar screen:', screenX.toFixed(0), screenY.toFixed(0),
            'dist:', dist.toFixed(0), 'hit:', hit);
        return hit;
    }

    // ===================================
    // MASTER CLICK HANDLER
    // ===================================
    handleClick(e) {
        this.lastInteractionTime = Date.now();
        this.idleStage = 0;

        // Wake up from sitting
        if (this.proceduralAnim.sitPhase >= 0) {
            this.resetProceduralAnims();
            this.animLocked = false;
            this.switchAnimation('idle', 0.3);
        }

        // Hide chair if sitting (FBX-based sit)
        if (this.animState === 'sitDown') {
            this.hideChair();
        }

        // Track rapid clicks
        const now = Date.now();
        this.recentClicks.push(now);
        this.recentClicks = this.recentClicks.filter(t => now - t < this.rapidClickWindow);

        // === CHECK CHARACTER CLICK FIRST ===
        const onChar = this.isClickOnCharacter(e);
        console.log('[Click] onCharacter:', onChar, 'animLocked:', this.animLocked, 'rapidClicks:', this.recentClicks.length);

        if (onChar) {
            // === RAPID CLICKS on character → Dodge / Startled ===
            if (this.recentClicks.length >= this.rapidClickThreshold) {
                this.recentClicks = [];
                this.animLocked = false;
                clearTimeout(this.animLockTimer);
                this.playOneShotAnim('dodge', 800);
                return;
            }

            // === SINGLE CLICK ON CHARACTER ===
            // Always interrupt current animation for character clicks
            this.animLocked = false;
            clearTimeout(this.animLockTimer);
            this.handleCharacterClick();
            return;
        }

        // === CLICK ON GROUND → Walk ===
        // Interrupt current animation to walk
        this.animLocked = false;
        clearTimeout(this.animLockTimer);
        this.handleGroundClick(e);
    }

    handleCharacterClick() {
        if (this.isLightTheme) {
            // Formal: polite wave
            this.playOneShotAnim('wave', 2000);
        } else {
            // Casual: random between dance or dab
            const actions = ['dance', 'wave'];
            const pick = actions[Math.floor(Math.random() * actions.length)];
            this.playOneShotAnim(pick, pick === 'dance' ? 3000 : 2000);
        }
    }

    handleDoubleClick(e) {
        this.lastInteractionTime = Date.now();
        this.idleStage = 0;

        if (!this.isClickOnCharacter(e)) return;

        // Force unlock for double-click actions
        this.animLocked = false;
        clearTimeout(this.animLockTimer);

        if (this.isLightTheme) {
            this.playOneShotAnim('bow', 1800);
        } else {
            this.playOneShotAnim('backflip', 1200);
        }
    }

    handleGroundClick(e) {
        const containerRect = this.container.getBoundingClientRect();
        const localX = e.clientX - containerRect.left;
        const localY = e.clientY - containerRect.top;

        // Map click to 3D position on a Z=0 plane (facing camera)
        const ndcX = (localX / this.width) * 2 - 1;
        const ndcY = -(localY / this.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);

        // Intersect with a vertical plane at Z=0 (facing camera)
        const screenPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const target3D = new THREE.Vector3();
        raycaster.ray.intersectPlane(screenPlane, target3D);

        if (!target3D) return;

        // Clamp to visible screen bounds with margin for avatar size
        const b = this.visibleBounds;
        const margin = 0.5;
        const targetX = Math.max(b.left + margin, Math.min(b.right - margin, target3D.x));
        const targetY = Math.max(b.bottom + margin, Math.min(b.top - 1.5, target3D.y));

        const dx = targetX - this.avatarGroup.position.x;
        const dy = targetY - this.avatarGroup.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Casual mode + long distance → Jump toward target, then walk remainder
        if (!this.isLightTheme && distance > 2.5) {
            // Move 70% of the distance during the jump
            const jumpFraction = 0.7;
            const jumpTargetX = this.avatarGroup.position.x + dx * jumpFraction;
            const jumpTargetY = this.avatarGroup.position.y + dy * jumpFraction;

            this.playOneShotAnim('jump', 700);

            // Smoothly move avatar during the jump
            const startX = this.avatarGroup.position.x;
            const startY = this.avatarGroup.position.y;
            const jumpStart = performance.now();
            const jumpDuration = 500; // ms

            const animateJump = () => {
                const elapsed = performance.now() - jumpStart;
                const t = Math.min(elapsed / jumpDuration, 1);
                // Ease-out for smooth landing
                const ease = 1 - Math.pow(1 - t, 2);
                this.avatarGroup.position.x = startX + (jumpTargetX - startX) * ease;
                this.avatarGroup.position.y = startY + (jumpTargetY - startY) * ease;
                if (t < 1) requestAnimationFrame(animateJump);
            };
            animateJump();

            setTimeout(() => {
                this.animLocked = false;
                this.startWalkTo(targetX, targetY);
            }, 600);
            return;
        }

        this.startWalkTo(targetX, targetY);
    }

    startWalkTo(targetX, targetY) {
        this.walkTarget = { x: targetX, y: targetY };
        this.isWalking = true;

        const dx = targetX - this.avatarGroup.position.x;
        const dy = targetY - this.avatarGroup.position.y;

        // Pick animation based on dominant direction
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        let walkAnim = 'walk';
        if (absDy > absDx * 0.6 && dy > 0) {
            // Mostly upward movement — use stair climb if available
            walkAnim = 'walkUp';
        }

        // Rotate avatar to face the direction of movement
        // Model default faces -Z (into screen) at rotation.y = 0
        // rotation.y = PI/2 faces +X (right), -PI/2 faces -X (left)
        if (absDx > 0.1) {
            this.avatarGroup.rotation.y = dx > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
            // Mostly vertical — face camera while walking
            this.avatarGroup.rotation.y = 0;
        }

        // Use fallback walk if stair anim not loaded
        if (!this.animActions[walkAnim]) walkAnim = 'walk';

        this.switchAnimation(walkAnim, 0.3);
    }

    updateWalk() {
        if (!this.isWalking || !this.walkTarget) return;

        const speed = 0.025;
        const dx = this.walkTarget.x - this.avatarGroup.position.x;
        const dy = this.walkTarget.y - this.avatarGroup.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Check if we've hit a boundary — stop walking if clamped
        const atBoundary = this.visibleBounds && (
            (this.avatarGroup.position.x <= this.visibleBounds.left + 0.35 && dx < 0) ||
            (this.avatarGroup.position.x >= this.visibleBounds.right - 0.35 && dx > 0) ||
            (this.avatarGroup.position.y <= this.visibleBounds.bottom + 0.35 && dy < 0) ||
            (this.avatarGroup.position.y >= this.visibleBounds.top - 1.55 && dy > 0)
        );

        if (dist < 0.05 || atBoundary) {
            this.isWalking = false;
            if (!atBoundary) {
                this.avatarGroup.position.x = this.walkTarget.x;
                this.avatarGroup.position.y = this.walkTarget.y;
            }

            // Reset idle timer so idle actions don't trigger immediately after walking
            this.lastInteractionTime = Date.now();
            this.idleStage = 0;

            // Switch back to idle, face camera
            this.switchAnimation('idle', 0.3);
            this.avatarGroup.rotation.y = 0;
        } else {
            // Move toward target
            const moveX = (dx / dist) * speed;
            const moveY = (dy / dist) * speed;
            this.avatarGroup.position.x += moveX;
            this.avatarGroup.position.y += moveY;

            // Clamp avatar within visible bounds
            if (this.visibleBounds) {
                const b = this.visibleBounds;
                const m = 0.3;
                this.avatarGroup.position.x = Math.max(b.left + m, Math.min(b.right - m, this.avatarGroup.position.x));
                this.avatarGroup.position.y = Math.max(b.bottom + m, Math.min(b.top - 1.5, this.avatarGroup.position.y));
            }
        }
    }

    // ===================================
    // IDLE TIMER SYSTEM
    // ===================================
    updateIdleTimers() {
        if (this.animLocked || this.isWalking) return;

        const idleTime = Date.now() - this.lastInteractionTime;

        // Stage 1: Yawn / Look around (after 5 seconds)
        if (this.idleStage === 0 && idleTime > this.idleTriggerTimes[0]) {
            this.idleStage = 1;
            if (this.isLightTheme) {
                // Formal: composed look around
                this.playOneShotAnim('lookAround', 3000);
            } else {
                // Casual: spontaneous little dance
                this.playOneShotAnim('dance', 3000);
            }
            // After animation, bump the timer so we don't immediately trigger stage 2
            this.lastInteractionTime = Date.now() - this.idleTriggerTimes[0] + 1000;
        }

        // Stage 2: Sit down (after 15 seconds cumulative idle)
        if (this.idleStage === 1 && idleTime > this.idleTriggerTimes[1]) {
            this.idleStage = 2;
            this.playOneShotAnim('sitDown', 999999); // stays until interrupted
            // sitDown is special — the lock timer is huge, but any click will break out
        }
    }

    // ===================================
    // SCROLL AWAY & BACK DETECTION
    // ===================================
    onVisibilityChange(nowVisible) {
        if (nowVisible && !this.wasVisible && this.avatar) {
            // User scrolled back! Welcome back animation
            this.lastInteractionTime = Date.now();
            this.idleStage = 0;

            // Clear any sitting
            if (this.proceduralAnim.sitPhase >= 0) {
                this.resetProceduralAnims();
            }
            this.animLocked = false;
            clearTimeout(this.animLockTimer);
            this.playOneShotAnim('welcomeBack', 1200);
        }
        this.wasVisible = nowVisible;
    }

    // ===================================
    // THEME TOGGLE
    // ===================================
    async onThemeChange() {
        this.isLightTheme = document.body.classList.contains('light-theme');

        // Update accent light
        if (this.accentLight) {
            this.accentLight.color.set(this.isLightTheme ? 0x0099ff : 0x00f0ff);
        }

        // Preserve camera position and settings
        const camPos = this.camera.position.clone();
        const camFov = this.camera.fov;
        const camAspect = this.camera.aspect;

        // Reset animation state
        this.animLocked = false;
        clearTimeout(this.animLockTimer);
        this.resetProceduralAnims();

        // Reload avatar for correct outfit
        if (this.avatar) {
            this.avatarGroup.remove(this.avatar);
            this.avatar = null;
            this.rightArmBone = null;
            this.leftArmBone = null;
            this.headBone = null;
            this.spineBone = null;
            this.hipsBone = null;
            this.rightForeArmBone = null;
            this.leftForeArmBone = null;
            this.mixer = null;
            this.animActions = {};
            this.activeAction = null;
        }
        await this.loadAvatar();

        // Restore camera position and settings
        this.camera.position.copy(camPos);
        this.camera.lookAt(camPos.x, camPos.y, 0);
        this.camera.fov = camFov;
        this.camera.aspect = camAspect;
        this.camera.updateProjectionMatrix();

        // Entrance animation for new character
        this.playOneShotAnim('entrance', 1800);

        // Update floating object materials
        this.floatingObjects.forEach(obj => {
            obj.traverse(child => {
                if (child.isMesh && child.material) {
                    if (child.material.emissive) {
                        const intensity = this.isLightTheme ? 0.3 : 0.5;
                        child.material.emissiveIntensity = intensity;
                    }
                }
            });
        });
    }

    // ===================================
    // EVENT LISTENERS
    // ===================================
    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            // mousemove does NOT reset idle timer — only clicks and scrolls do
        }, { passive: true });

        // Single click → walk / character interaction / rapid-click dodge
        this.container.addEventListener('click', (e) => this.handleClick(e));

        // Double-click → bow (formal) / backflip (casual)
        this.container.addEventListener('dblclick', (e) => {
            e.preventDefault();
            this.handleDoubleClick(e);
        });

        // Resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.setupSizes();
                this.renderer.setSize(this.width, this.height);
                this.camera.aspect = this.width / this.height;
                this.camera.updateProjectionMatrix();
                this.computeVisibleBounds();
                this.prepareText();
            }, 200);
        });

        // Theme toggle hook
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                setTimeout(() => this.onThemeChange(), 50);
            });
        }
    }

    // ===================================
    // VISIBILITY OBSERVER
    // ===================================
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const nowVisible = entry.isIntersecting;
                this.onVisibilityChange(nowVisible);
                this.isVisible = nowVisible;
            });
        }, { threshold: 0.05 });

        observer.observe(this.container);
    }

    // ===================================
    // MAIN ANIMATION LOOP
    // ===================================
    animate() {
        this.rafId = requestAnimationFrame(() => this.animate());

        if (!this.isVisible) return;

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // Update animation mixer (FBX-based)
        if (this.mixer) this.mixer.update(delta);

        // Update procedural animations (bone-level fallbacks)
        this.updateProceduralAnimations(delta);

        // Update floating objects
        this.updateFloatingObjects(time);

        // Update walk
        this.updateWalk();

        // Check idle timers
        this.updateIdleTimers();

        // Render 3D scene
        this.renderer.render(this.scene, this.camera);

        // Render text reflow
        this.renderText();
    }
}

// ===================================
// INITIALIZE
// ===================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.philosophySection = new PhilosophySection();
        }, 300);
    });
} else {
    setTimeout(() => {
        window.philosophySection = new PhilosophySection();
    }, 300);
}
