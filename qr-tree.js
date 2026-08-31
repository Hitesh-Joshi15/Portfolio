// ===================================
// QR TREE (3D) — contact-card feature, inspired by tree.icqr.com
// An isometric voxel tree on a small island: the plaza TILES ARE THE QR
// CODE, and the leaves share the QR's own colors — the code is literally
// the tree seen from above. Clicking flies the camera to a top-down view
// (the tree fades) and the crisp qr-code.png crossfades on top so
// scanning always works. No JS / no WebGL → the plain <img> stays.
// ===================================

(function () {
    const CSS_SIZE = 220;       // rendered square, CSS px
    const PLAZA = 10;           // world size of the QR plaza
    const VIEW_MS = 1300;       // camera flight duration

    function mulberry32(a) {
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // Read the QR png into an N×N boolean module grid (dark = true) and
    // sample the QR's own colors — the tree wears whatever the code wears.
    function qrToGrid(img) {
        const w = img.naturalWidth, h = img.naturalHeight;
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, w, h);
        const darkAt = (x, y) => {
            const i = (y * w + x) * 4;
            return data[i + 3] > 128 && (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) < 150;
        };
        // Estimate module size from the shortest dark run on sample rows.
        let minRun = Infinity;
        for (const y of [Math.floor(h * 0.5), Math.floor(h * 0.33)]) {
            let run = 0;
            for (let x = 0; x < w; x++) {
                if (darkAt(x, y)) { run++; }
                else { if (run > 2 && run < minRun) minRun = run; run = 0; }
            }
        }
        if (!isFinite(minRun)) return null;
        let n = Math.round(w / minRun);
        n = Math.max(21, Math.min(61, n));
        const grid = [];
        for (let gy = 0; gy < n; gy++) {
            const row = [];
            const py = Math.floor(((gy + 0.5) / n) * h);
            for (let gx = 0; gx < n; gx++) {
                row.push(darkAt(Math.floor(((gx + 0.5) / n) * w), py));
            }
            grid.push(row);
        }
        // Crop the empty quiet-zone margin — the plaza should be pure code.
        let top = n, bottom = -1, left = n, right = -1;
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                if (grid[y][x]) {
                    if (y < top) top = y;
                    if (y > bottom) bottom = y;
                    if (x < left) left = x;
                    if (x > right) right = x;
                }
            }
        }
        const cropped = bottom >= top
            ? grid.slice(top, bottom + 1).map(r => r.slice(left, right + 1))
            : grid;
        // Dominant dark-module colors (quantized histogram, top 5).
        const buckets = new Map();
        for (let y = 0; y < h; y += 3) {
            for (let x = 0; x < w; x += 3) {
                if (!darkAt(x, y)) continue;
                const i = (y * w + x) * 4;
                const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
                const b = buckets.get(key);
                if (b) { b.n++; b.r += data[i]; b.g += data[i + 1]; b.b += data[i + 2]; }
                else buckets.set(key, { n: 1, r: data[i], g: data[i + 1], b: data[i + 2] });
            }
        }
        const colors = [...buckets.values()]
            .sort((a, b) => b.n - a.n)
            .slice(0, 5)
            .map(b => [b.r / b.n / 255, b.g / b.n / 255, b.b / b.n / 255]);
        // Centre-logo color (the pink 'H'): saturated warm pixels near the middle.
        let lr = 0, lg = 0, lb = 0, ln = 0;
        const c0 = Math.floor(w * 0.38), c1 = Math.ceil(w * 0.62);
        for (let y = c0; y < c1; y += 2) {
            for (let x = c0; x < c1; x += 2) {
                const i = (y * w + x) * 4;
                if (data[i + 3] > 128 && data[i] > 100 && data[i] > data[i + 1] + 30 && data[i] > data[i + 2] + 10) {
                    lr += data[i]; lg += data[i + 1]; lb += data[i + 2]; ln++;
                }
            }
        }
        const logo = ln > 8 ? [lr / ln / 255, lg / ln / 255, lb / ln / 255] : null;
        // Average light-region color (the QR's background/edge tint).
        let hr = 0, hg = 0, hb = 0, hn = 0;
        for (let y = 0; y < h; y += 4) {
            for (let x = 0; x < w; x += 4) {
                const i = (y * w + x) * 4;
                if (data[i + 3] > 128 && !darkAt(x, y)) { hr += data[i]; hg += data[i + 1]; hb += data[i + 2]; hn++; }
            }
        }
        const light = hn ? [hr / hn / 255, hg / hn / 255, hb / hn / 255] : null;
        return { grid: cropped, colors, logo, light };
    }

    class QrTree3D {
        constructor(card) {
            this.card = card;
            this.box = card.querySelector('.qr-code');
            this.img = this.box?.querySelector('img');
            this.caption = card.querySelector('p');
            if (!this.box || !this.img || !window.THREE) return;

            this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            this.state = 'tree';         // tree | toQR | qr | toTree
            this.animStart = 0;
            this.visible = false;
            this.raf = null;

            const src = new Image();
            src.onload = () => { try { this._build(src); } catch (e) { console.warn('QR tree disabled:', e); } };
            src.src = this.img.currentSrc || this.img.src;
        }

        _build(qrImg) {
            const parsed = qrToGrid(qrImg);
            if (!parsed) return;
            const { grid, colors, logo, light } = parsed;
            const THREE = window.THREE;
            const bases = (colors.length ? colors : [[0.2, 0.45, 0.8]]).map(([r, g, b]) => new THREE.Color(r, g, b));
            // Tiles wear the QR's colors as-is; LEAVES go darker (centre-of-QR
            // shades) and WATER goes lighter (edge-of-QR shade) so they never blend.
            this.palette = [];
            for (const c of bases) {
                this.palette.push(c.clone());
                this.palette.push(c.clone().multiplyScalar(1.35));
                this.palette.push(c.clone().multiplyScalar(0.7));
            }
            this.leafPalette = [];
            for (const c of bases) {
                this.leafPalette.push(c.clone().multiplyScalar(0.9));
                this.leafPalette.push(c.clone().multiplyScalar(0.7));
                this.leafPalette.push(c.clone().multiplyScalar(0.52));
            }
            this.waterColor = bases[0].clone().lerp(new THREE.Color(1, 1, 1), 0.62);
            this.lightTileColor = light ? new THREE.Color(...light) : new THREE.Color(0xe9e7ef);
            this.fruitColor = logo ? new THREE.Color(...logo) : new THREE.Color('#ff4f9a');
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(CSS_SIZE, CSS_SIZE);
            renderer.domElement.style.cssText = 'display:block;width:100%;aspect-ratio:1/1;border-radius:10px;cursor:pointer;';
            renderer.domElement.setAttribute('aria-label', 'Interactive 3D tree — click to reveal the vCard QR code');

            this.renderer = renderer;
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
            this.camRadius = 15.2;
            this.camPolar = { front: 0.96, top: 0.03 }; // radians from vertical
            this.camAzimuth = Math.PI / 4;
            this._placeCamera(this.camPolar.front);

            this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
            this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8a6242, 0.4)); // soft sky/earth depth (water is unlit — unaffected)
            const sun = new THREE.DirectionalLight(0xfff4e0, 0.65);
            sun.position.set(6, 12, 4);
            this.scene.add(sun);

            this._buildPlaza(grid);
            this._buildIslandAndWater();
            this._buildTree();

            // DOM wiring: canvas replaces the img visually; img becomes overlay.
            this.box.style.position = 'relative';
            this.img.style.cssText += ';position:absolute;inset:0;opacity:0;transition:opacity .45s ease;pointer-events:none;';
            this.box.insertBefore(renderer.domElement, this.img);
            renderer.domElement.addEventListener('click', () => this.toggle());
            this._setCaption();

            this.io = new IntersectionObserver((en) => {
                this.visible = en[0].isIntersecting;
                if (this.visible) this._start(); else this._stop();
            }, { threshold: 0.05 });
            this.io.observe(this.box);

            window.__qrTree = this; // debug/test handle
            this._renderOnce();
        }

        // --- plaza: pale tiles + QR modules wearing the QR's own colors ---
        _buildPlaza(grid) {
            const THREE = window.THREE;
            const rand = mulberry32(41);
            const rows = grid.length;
            const cols = grid[0].length;
            const tile = PLAZA / Math.max(rows, cols);
            const spanX = cols * tile, spanZ = rows * tile;
            let dark = 0;
            grid.forEach(r => r.forEach(v => { if (v) dark++; }));

            const lightGeo = new THREE.BoxGeometry(tile * 0.98, tile * 0.35, tile * 0.98);
            const darkGeo = new THREE.BoxGeometry(tile * 0.98, tile * 0.44, tile * 0.98); // subtle relief — tiles, not towers
            const lightMat = new THREE.MeshLambertMaterial({ color: this.lightTileColor });
            const darkMat = new THREE.MeshLambertMaterial({});
            const lights = new THREE.InstancedMesh(lightGeo, lightMat, rows * cols - dark);
            const darks = new THREE.InstancedMesh(darkGeo, darkMat, dark);

            const m = new THREE.Matrix4();
            let li = 0, di = 0;
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const wx = (x + 0.5) * tile - spanX / 2;
                    const wz = (y + 0.5) * tile - spanZ / 2;
                    if (grid[y][x]) {
                        m.makeTranslation(wx, 0.22, wz);
                        darks.setColorAt(di, this.palette[(rand() * this.palette.length) | 0]);
                        darks.setMatrixAt(di++, m);
                    } else {
                        m.makeTranslation(wx, 0.17, wz);
                        lights.setMatrixAt(li++, m);
                    }
                }
            }
            this.scene.add(lights, darks);
        }

        // A single soft leaf sprite; instances tint it with the QR palette.
        _makeLeafTexture() {
            const THREE = window.THREE;
            const c = document.createElement('canvas');
            c.width = c.height = 64;
            const x = c.getContext('2d');
            x.fillStyle = '#fff';
            x.translate(32, 34);
            x.beginPath(); // three overlapping lobes = simple stylised leaf cluster
            x.ellipse(-10, 2, 13, 17, -0.5, 0, Math.PI * 2);
            x.ellipse(10, 2, 13, 17, 0.5, 0, Math.PI * 2);
            x.ellipse(0, -8, 14, 19, 0, 0, Math.PI * 2);
            x.fill();
            return new THREE.CanvasTexture(c);
        }

        // --- around the plaza: nothing but calm water in the QR's light blue ---
        _buildIslandAndWater() {
            const THREE = window.THREE;
            this._waterBase = this.waterColor.clone();
            // Calm = one flat light blue. Movement comes from a few slow ripple
            // rings, not texture noise; nothing here can ever be darker than base.
            const waterMat = new THREE.MeshBasicMaterial({ color: this._waterBase.clone() });
            const water = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), waterMat);
            water.rotation.x = -Math.PI / 2;
            water.position.y = 0.12; // just below the tile tops — the plaza floats in it
            this.scene.add(water);
            this.water = water;

            // Slow expanding rings — the universal 'calm lake' cue (white only).
            this.ripples = [];
            const rrand = mulberry32(11);
            for (let i = 0; i < 5; i++) {
                const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
                const ring = new THREE.Mesh(new THREE.RingGeometry(1, 1.05, 48), mat);
                ring.rotation.x = -Math.PI / 2;
                const ang = (i / 5) * Math.PI * 2 + rrand() * 0.8;
                const dist = 7 + rrand() * 2.2;
                ring.position.set(Math.cos(ang) * dist, 0.121, Math.sin(ang) * dist);
                ring.userData.phase = rrand() * 7;
                this.scene.add(ring);
                this.ripples.push(ring);
            }

            // Foam line where water meets the plaza — white only, gently pulsing.
            const foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
            this.foamMat = foamMat;
            const t = 0.3, L = PLAZA + 0.62;
            const mk = (w, d, px, pz) => {
                const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), foamMat);
                f.rotation.x = -Math.PI / 2;
                f.position.set(px, 0.125, pz);
                this.scene.add(f);
            };
            mk(L, t, 0, (PLAZA + t) / 2);
            mk(L, t, 0, -(PLAZA + t) / 2);
            mk(t, L, (PLAZA + t) / 2, 0);
            mk(t, L, -(PLAZA + t) / 2, 0);

            // Trees don't grow on water: a LOW earth patch only under the canopy
            // (flat and dark so it never reads as part of the trunk).
            const mound = new THREE.Mesh(
                new THREE.CylinderGeometry(2.0, 2.6, 0.5, 10),
                new THREE.MeshLambertMaterial({ color: 0x6e4c31 })
            );
            mound.position.y = 0.7; // sits on the plaza centre
            this.scene.add(mound);
            this.mound = mound;

            // Soft contact shadow on the plaza — grounds the tree (never touches water).
            const sc = document.createElement('canvas');
            sc.width = sc.height = 128;
            const sx = sc.getContext('2d');
            const grad = sx.createRadialGradient(64, 64, 8, 64, 64, 62);
            grad.addColorStop(0, 'rgba(20,25,60,0.55)');
            grad.addColorStop(1, 'rgba(20,25,60,0)');
            sx.fillStyle = grad;
            sx.fillRect(0, 0, 128, 128);
            const shadowTex = new THREE.CanvasTexture(sc);
            this.shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.4, depthWrite: false });
            const shadow = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 6.4), this.shadowMat);
            shadow.rotation.x = -Math.PI / 2;
            shadow.position.y = 0.5; // just above the tiles, well inside the plaza
            this.scene.add(shadow);
            this.shadow = shadow;

            // Lush grass covering the earth mound — top and slopes.
            const rand = mulberry32(77);
            const COUNT = 64;
            const grassMat = new THREE.MeshLambertMaterial({});
            const grass = new THREE.InstancedMesh(new THREE.ConeGeometry(0.07, 0.42, 5), grassMat, COUNT);
            const gm = new THREE.Matrix4();
            const gq = new THREE.Quaternion();
            const gs = new THREE.Vector3();
            const greens = [0x5fbf4a, 0x74d05c, 0x4da83c, 0x8ade6e, 0x3f9c33, 0x9ae87a];
            const moundTop = 0.7 + 0.25;
            for (let i = 0; i < COUNT; i++) {
                const a = rand() * Math.PI * 2;
                const onSlope = rand() < 0.35;
                const d = onSlope ? 2.05 + rand() * 0.45 : 0.5 + rand() * 1.4; // top OR upper slope
                const y = onSlope ? moundTop - 0.14 - rand() * 0.12 : moundTop;
                gq.setFromEuler(new THREE.Euler((rand() - 0.5) * 0.35, rand() * Math.PI, (rand() - 0.5) * 0.35));
                const sc = 0.7 + rand() * 1.0;
                gs.set(sc, sc * (0.8 + rand() * 0.6), sc);
                gm.compose(new THREE.Vector3(Math.cos(a) * d, y + 0.17 * sc, Math.sin(a) * d), gq, gs);
                grass.setMatrixAt(i, gm);
                grass.setColorAt(i, new THREE.Color(greens[(rand() * greens.length) | 0]));
            }
            this.scene.add(grass);
            this.grass = grass;
            this.grassMat = grassMat;
        }

        // --- tree: short trunk + DENSE canopy (leaf blobs on cluster groups for wind) ---
        _buildTree() {
            const THREE = window.THREE;
            const rand = mulberry32(20260831);
            this.tree = new THREE.Group();
            this._fadeMats = [];

            const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5f4128 });
            this._fadeMats.push(trunkMat);
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.27, 1.9, 7), trunkMat);
            trunk.position.y = 1.15;
            this.tree.add(trunk);

            // Canopy: smooth cores give the volume, textured leaf sprites give
            // the detail — no more faceted-pebble look.
            this.clusters = [];
            const centers = [
                [0, 3.35, 0, 1.85], [0.95, 2.9, 0.4, 1.25], [-1.0, 2.95, -0.3, 1.2],
                [0.35, 2.75, -0.95, 1.1], [-0.4, 2.8, 0.95, 1.15], [0.1, 4.15, 0.15, 1.15],
                [-1.05, 3.6, 0.55, 0.95], [1.05, 3.6, -0.5, 0.95],
                [0, 2.45, 0, 1.4], // low centre blob keeps the canopy connected to the trunk
            ];
            const leafTex = this._makeLeafTexture();
            const leafGeo = new THREE.PlaneGeometry(0.4, 0.4);
            const palette = this.leafPalette;
            this.leafMeshes = [];
            const nBases = palette.length / 3;
            for (const [cx, cy, cz, r] of centers) {
                const group = new THREE.Group();
                group.position.set(cx, cy, cz);

                // smooth inner mass in a deep shade fills every gap
                const coreMat = new THREE.MeshLambertMaterial({ color: palette[2] });
                this._fadeMats.push(coreMat);
                const core = new THREE.Mesh(new THREE.SphereGeometry(r * 0.8, 14, 11), coreMat);
                core.scale.y = 0.82;
                group.add(core);

                const perCluster = 170;
                const mat = new THREE.MeshLambertMaterial({ map: leafTex, alphaTest: 0.4, side: THREE.DoubleSide });
                this._fadeMats.push(mat);
                const mesh = new THREE.InstancedMesh(leafGeo, mat, perCluster);
                const m = new THREE.Matrix4();
                const q = new THREE.Quaternion();
                const e = new THREE.Euler();
                const s = new THREE.Vector3();
                const p = new THREE.Vector3();
                for (let i = 0; i < perCluster; i++) {
                    // leaves live on the blob surface, angled outward-ish
                    const th = rand() * Math.PI * 2;
                    const ph = Math.acos(2 * rand() - 1);
                    const rr = r * (0.78 + 0.3 * rand());
                    p.set(rr * Math.sin(ph) * Math.cos(th), rr * Math.cos(ph) * 0.82, rr * Math.sin(ph) * Math.sin(th));
                    e.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
                    q.setFromEuler(e);
                    const sc2 = 0.8 + rand() * 1.0;
                    s.set(sc2, sc2, sc2);
                    m.compose(p, q, s);
                    mesh.setMatrixAt(i, m);
                    // faked depth: sunlit lighter shades on top, darker underneath
                    // (palette = groups of 3 per base color: [light, mid, dark])
                    const band = p.y > r * 0.25 ? 0 : (p.y > -r * 0.25 ? 1 : 2);
                    const base3 = 3 * ((rand() * nBases) | 0);
                    mesh.setColorAt(i, palette[base3 + band]);
                }
                group.userData.phase = rand() * Math.PI * 2;
                group.add(mesh);
                this.tree.add(group);
                this.clusters.push(group);
                this.leafMeshes.push(mesh);
            }

            // Fruits in the QR's logo color — the centre 'H' lives in the canopy.
            const fruitMat = new THREE.MeshLambertMaterial({ color: this.fruitColor });
            this._fadeMats.push(fruitMat);
            const fruitGeo = new THREE.SphereGeometry(0.15, 7, 6);
            const fruits = new THREE.InstancedMesh(fruitGeo, fruitMat, 13);
            const frm = new THREE.Matrix4();
            for (let i = 0; i < 13; i++) {
                const [cx, cy, cz, r] = centers[(rand() * centers.length) | 0];
                const th = rand() * Math.PI * 2;
                const ph = Math.acos(2 * rand() - 1);
                frm.makeTranslation(
                    cx + r * 0.92 * Math.sin(ph) * Math.cos(th),
                    cy + r * 0.75 * Math.cos(ph) - 0.1,
                    cz + r * 0.92 * Math.sin(ph) * Math.sin(th)
                );
                fruits.setMatrixAt(i, frm);
            }
            this.tree.add(fruits);

            this.tree.scale.setScalar(1.32); // reference proportions: canopy dominates the plaza
            this.tree.position.y = 0.68;     // roots on the earth patch, not the tiles
            this.scene.add(this.tree);
        }

        _placeCamera(polar) {
            const r = this.camRadius;
            this.camera.position.set(
                r * Math.sin(polar) * Math.cos(this.camAzimuth),
                r * Math.cos(polar),
                r * Math.sin(polar) * Math.sin(this.camAzimuth)
            );
            this.camera.up.set(0, polar < 0.2 ? 0 : 1, polar < 0.2 ? -1 : 0);
            this.camera.lookAt(0, polar < 0.2 ? 0 : 2.3, 0);
        }

        toggle() {
            if (this.state === 'toQR' || this.state === 'toTree') return;
            if (this.state === 'tree') this.state = 'toQR';
            else { this.img.style.opacity = '0'; this.state = 'toTree'; }
            this.animStart = performance.now();
            if (this.reduced) this.animStart -= VIEW_MS;
            this._setCaption();
            this._start();
        }

        _setCaption() {
            if (!this.caption) return;
            this.caption.textContent = (this.state === 'tree' || this.state === 'toTree')
                ? 'Click the tree for my vCard'
                : 'Scan for vCard · click for the tree';
        }

        _start() { if (this.raf === null) this.raf = requestAnimationFrame((t) => this._tick(t)); }
        _stop() { if (this.raf !== null) { cancelAnimationFrame(this.raf); this.raf = null; } }

        _tick(now) {
            this.raf = null;
            const animating = this.state === 'toQR' || this.state === 'toTree';

            if (animating) {
                const t = Math.min(1, (now - this.animStart) / VIEW_MS);
                const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                const toTop = this.state === 'toQR';
                const from = toTop ? this.camPolar.front : this.camPolar.top;
                const to = toTop ? this.camPolar.top : this.camPolar.front;
                this._placeCamera(from + (to - from) * e);
                const fade = toTop ? 1 - e : e;
                for (const mat of this._fadeMats) { mat.transparent = true; mat.opacity = fade; }
                this.tree.visible = fade > 0.02;
                if (this.mound) {
                    this.mound.material.transparent = true;
                    this.mound.material.opacity = fade;
                    this.mound.visible = fade > 0.02; // the earth patch leaves with its tree
                }
                if (this.grass) {
                    this.grassMat.transparent = true;
                    this.grassMat.opacity = fade;
                    this.grass.visible = fade > 0.02;
                }
                if (this.shadow) {
                    this.shadowMat.opacity = 0.4 * fade; // shadow leaves with its tree
                    this.shadow.visible = fade > 0.02;
                }
                if (t >= 1) {
                    this.state = toTop ? 'qr' : 'tree';
                    if (this.state === 'qr') this.img.style.opacity = '1';
                    this._setCaption();
                }
            } else if (this.state === 'tree' && !this.reduced) {
                // wind: each canopy cluster breathes on its own phase
                const t = now / 1000;
                for (const g of this.clusters) {
                    const ph = g.userData.phase;
                    g.rotation.z = Math.sin(t * 0.9 + ph) * 0.045;
                    g.rotation.x = Math.cos(t * 0.7 + ph) * 0.035;
                }
                this.tree.rotation.y = Math.sin(t * 0.22) * 0.02;
                if (this.ripples) { // slow expanding rings on otherwise still water
                    for (const ring of this.ripples) {
                        const cycle = ((t + ring.userData.phase) % 7) / 7;
                        const sc = 0.5 + cycle * 2.6;
                        ring.scale.set(sc, sc, 1);
                        ring.material.opacity = 0.22 * Math.sin(Math.PI * Math.min(1, cycle * 1.15));
                    }
                }
                if (this.foamMat) this.foamMat.opacity = 0.42 + Math.sin(t * 1.1) * 0.12;
            }

            this.renderer.render(this.scene, this.camera);
            const idle = this.state === 'qr' || (this.state === 'tree' && this.reduced);
            if (this.visible && !idle) this._start();
        }

        _renderOnce() { this.renderer.render(this.scene, this.camera); }
    }

    function boot() {
        const card = document.querySelector('.qr-card');
        if (card) new QrTree3D(card);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
