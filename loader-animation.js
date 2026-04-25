// ===================================
// NAME LOADER ANIMATION ENGINE
// Edge Scatter -> Logo -> Hitesh Joshi
// ===================================

class LoaderAnimation {
    constructor() {
        this.canvas = document.getElementById('loaderCanvas');
        this.loaderEl = document.getElementById('loader');

        if (!this.canvas || !this.loaderEl) return;

        this.ctx = this.canvas.getContext('2d', { alpha: false }) || this.canvas.getContext('2d');

        if (!this.ctx) {
            return;
        }

        this.done = false;
        this.started = false;
        this.assetsReady = false;
        this.transitionStarted = false;
        this.isVisible = !document.hidden;

        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.dpr = 1;

        this.now = 0;
        this.lastFrameTime = 0;
        this.sequenceStartTime = 0;
        this.elapsed = 0;

        this.rafId = null;
        this.logoImage = null;
        this.initTime = performance.now();
        this.assetHardTimeoutMs = 10000;
        this.logoLoadFailed = false;

        this.phaseDurations = [1500, 700, 760, 7600];
        this.sequenceDuration = this.phaseDurations.reduce((acc, ms) => acc + ms, 0);
        this.transitionDuration = 1300;
        this.logoHoldDuration = this.phaseDurations[1];
        this.finalSettleMs = 520;
        this.normalNameHoldMs = 1500;
        this.reformedNameHoldMs = 500;
        this.finalDissolveMs = 1700;
        this.finalFadeDelayMs = 700;
        this.logoPostFormHoldMs = 1320;
        this.logoFormationThresholdSq = 72;
        this.logoStableFrameTarget = 14;
        this.logoAvgTighten = 0.7;
        this.logoCoverageTarget = 0.94;
        this.logoPointToleranceMultiplier = 1.8;
        this.logoStableFrames = 0;
        this.logoIsStable = false;
        this.logoFullyFormedAt = 0;
        this.finalStageEnteredAt = 0;
        this.nameFullyFormedAt = 0;
        this.nameFormationStableFrames = 0;
        this.nameFormationThresholdSq = 42;
        this.nameIsStable = false;
        this.wasDisruptedInFinalStage = false;
        this.finalHoldAccumMs = 0;
        this.lastHoldUpdateAt = 0;
        this.dissolveStartAt = Infinity;
        this.logoCuePlayed = false;
        this.nameCuePlayed = false;
        this.pointerMotionEnergy = 0;
        this.pointerDown = false;
        this.pointerTravelSinceDown = 0;
        this.motionSoundSuppressUntil = 0;
        this.lastLoaderMotionSoundAt = 0;
        this.prevPointerX = null;
        this.prevPointerY = null;

        this.currentStage = -1;
        this.stageProgress = 0;

        this.primaryColor = [0, 240, 255];
        this.secondaryColor = [82, 0, 255];
        this.bgColor = [10, 10, 15];
        this.textSecondaryColor = [184, 184, 209];

        this.particleCount = 0;
        this.fov = 560;
        this.cameraZ = 700;
        this.repelRadius = 126;
        this.repelRadius2 = this.repelRadius * this.repelRadius;
        this.repelForce = 11.2;
        this.springScatter = 0.02;
        this.springForm = 0.022;
        this.springLogo = 0.046;
        this.particleFriction = 0.82;
        this.logoFriction = 0.66;
        this.mouseX = -9999;
        this.mouseY = -9999;
        this.mouseActive = false;

        this.px = null;
        this.py = null;
        this.pz = null;
        this.vx = null;
        this.vy = null;
        this.vz = null;
        this.size = null;
        this.seedMix = null;
        this.seedPhase = null;
        this.offsetX = null;
        this.offsetY = null;
        this.offsetZ = null;

        this.startX = null;
        this.startY = null;
        this.startZ = null;

        this.targets = {
            logo: null,
            name: null
        };

        this.ambient = [];
        this.webNodes = [];
        this.webSquares = [];

        this.handleResize = this.handleResize.bind(this);
        this.handleVisibility = this.handleVisibility.bind(this);
        this.handleSkipClick = this.handleSkipClick.bind(this);
        this.handleThemeMutation = this.handleThemeMutation.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handlePointerUp = this.handlePointerUp.bind(this);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerLeave = this.handlePointerLeave.bind(this);

        this.init();
    }

    init() {
        this.applyPersistedThemeClass();
        this.refreshThemePalette();

        document.body.classList.add('loading-active');

        this.resizeCanvas();
        this.initParticleBuffers();
        this.initAmbientParticles();
        this.initWebElements();

        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibility);
        this.loaderEl.addEventListener('click', this.handleSkipClick);
        this.canvas.addEventListener('pointerdown', this.handlePointerDown);
        this.canvas.addEventListener('pointerup', this.handlePointerUp);
        this.canvas.addEventListener('pointermove', this.handlePointerMove);
        this.canvas.addEventListener('pointerleave', this.handlePointerLeave);
        this.canvas.addEventListener('pointercancel', this.handlePointerLeave);
        this.loaderEl.addEventListener('pointerdown', this.handlePointerDown);
        this.loaderEl.addEventListener('pointerup', this.handlePointerUp);
        this.loaderEl.addEventListener('pointermove', this.handlePointerMove);
        this.loaderEl.addEventListener('pointerleave', this.handlePointerLeave);

        this.themeObserver = new MutationObserver(this.handleThemeMutation);
        this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        // Start sequence only after logo target is ready (or timeout fallback),
        // so particles do not jump between temporary and final shapes.
        this.loadAssets();

        this.lastFrameTime = performance.now();
        this.animate();
    }

    applyPersistedThemeClass() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }
    }

    refreshThemePalette() {
        const styles = getComputedStyle(document.body);
        this.primaryColor = this.parseColor(styles.getPropertyValue('--primary-color').trim(), [0, 240, 255]);
        this.secondaryColor = this.parseColor(styles.getPropertyValue('--secondary-color').trim(), [82, 0, 255]);
        this.bgColor = this.parseColor(styles.getPropertyValue('--bg-primary').trim(), [10, 10, 15]);
        this.textSecondaryColor = this.parseColor(styles.getPropertyValue('--text-secondary').trim(), [184, 184, 209]);
    }

    parseColor(value, fallback) {
        if (!value) return fallback;

        const hex = value.replace('#', '').trim();
        if (/^[0-9a-fA-F]{3}$/.test(hex)) {
            return [
                parseInt(hex[0] + hex[0], 16),
                parseInt(hex[1] + hex[1], 16),
                parseInt(hex[2] + hex[2], 16)
            ];
        }

        if (/^[0-9a-fA-F]{6}$/.test(hex)) {
            return [
                parseInt(hex.slice(0, 2), 16),
                parseInt(hex.slice(2, 4), 16),
                parseInt(hex.slice(4, 6), 16)
            ];
        }

        const rgbMatch = value.match(/rgba?\(([^)]+)\)/i);
        if (rgbMatch) {
            const parts = rgbMatch[1].split(',').map((n) => parseFloat(n.trim()));
            if (parts.length >= 3) {
                return [
                    Math.max(0, Math.min(255, Math.round(parts[0]))),
                    Math.max(0, Math.min(255, Math.round(parts[1]))),
                    Math.max(0, Math.min(255, Math.round(parts[2])))
                ];
            }
        }

        return fallback;
    }

    mixColor(a, b, t) {
        const clamped = Math.max(0, Math.min(1, t));
        return [
            Math.round(a[0] * (1 - clamped) + b[0] * clamped),
            Math.round(a[1] * (1 - clamped) + b[1] * clamped),
            Math.round(a[2] * (1 - clamped) + b[2] * clamped)
        ];
    }

    handleThemeMutation() {
        this.refreshThemePalette();
    }

    handleResize() {
        this.resizeCanvas();
        this.initParticleBuffers();
        this.initAmbientParticles();
        this.initWebElements();

        if (this.assetsReady) {
            this.buildTargetSets();
        }
    }

    handlePointerDown() {
        this.pointerDown = true;
        this.pointerMotionEnergy = 0;
        this.pointerTravelSinceDown = 0;
        this.motionSoundSuppressUntil = performance.now() + 260;

        // Unlock audio context silently on first user gesture.
        if (window.soundSystem && typeof window.soundSystem.unlockAudio === 'function') {
            window.soundSystem.unlockAudio();
        }
    }

    handlePointerUp() {
        this.pointerDown = false;
        this.pointerTravelSinceDown = 0;
        this.motionSoundSuppressUntil = Math.max(this.motionSoundSuppressUntil || 0, performance.now() + 180);
    }

    handlePointerMove(e) {
        if (this.prevPointerX !== null && this.prevPointerY !== null) {
            const dx = e.clientX - this.prevPointerX;
            const dy = e.clientY - this.prevPointerY;
            const speed = Math.sqrt(dx * dx + dy * dy);
            this.pointerMotionEnergy = Math.min(32, this.pointerMotionEnergy + speed * 0.18);
            if (this.pointerDown) {
                this.pointerTravelSinceDown += speed;
            }

            const now = performance.now();
            const suppressUntil = this.motionSoundSuppressUntil || 0;
            const lastSoundAt = this.lastLoaderMotionSoundAt || 0;
            const meaningfulPointerTravel = !this.pointerDown || this.pointerTravelSinceDown > 14;

            if (!this.transitionStarted && !this.pointerDown && now >= suppressUntil && meaningfulPointerTravel && speed > 0.3 && now - lastSoundAt >= 60 && window.soundSystem) {
                window.soundSystem.play('loaderMotion', { cooldownMs: 60 });
                this.lastLoaderMotionSoundAt = now;
            }
        }

        this.prevPointerX = e.clientX;
        this.prevPointerY = e.clientY;
        this.mouseActive = true;
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    handlePointerLeave() {
        this.mouseActive = false;
        this.pointerDown = false;
        this.pointerTravelSinceDown = 0;
        this.prevPointerX = null;
        this.prevPointerY = null;
        this.mouseX = -9999;
        this.mouseY = -9999;
    }

    handleVisibility() {
        this.isVisible = !document.hidden;

        if (!this.isVisible) {
            return;
        }

        const now = performance.now();
        this.lastFrameTime = now;

        if (this.started) {
            this.sequenceStartTime = now - this.elapsed;
        }

        this.animate();
    }

    handleSkipClick(e) {
        if (this.transitionStarted || this.done) return;

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!this.assetsReady) {
            this.startTransition();
            return;
        }

        const logoPauseEnd = this.phaseDurations[0] + this.phaseDurations[1];
        if (this.elapsed < logoPauseEnd) {
            const jumpTo = logoPauseEnd + this.phaseDurations[2] * 0.65;
            this.sequenceStartTime = performance.now() - jumpTo;
            return;
        }

        this.startTransition();
    }

    resizeCanvas() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.repelRadius = Math.max(96, Math.min(165, Math.min(this.width, this.height) * 0.135));
        this.repelRadius2 = this.repelRadius * this.repelRadius;
        this.logoFormationThresholdSq = this.width < 768 ? 90 : 72;
        this.nameFormationThresholdSq = this.width < 768 ? 54 : 42;

        this.dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        this.canvas.width = Math.floor(this.width * this.dpr);
        this.canvas.height = Math.floor(this.height * this.dpr);
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.particleCount = this.getParticleBudget();
    }

    getParticleBudget() {
        const mobileLike = this.width < 768;

        if (mobileLike) {
            if (this.width * this.height < 400000) return 1800;
            return 2300;
        }

        return 3500;
    }

    initParticleBuffers() {
        const n = this.particleCount;
        const edgePad = Math.max(60, Math.min(140, Math.min(this.width, this.height) * 0.12));

        this.px = new Float32Array(n);
        this.py = new Float32Array(n);
        this.pz = new Float32Array(n);
        this.vx = new Float32Array(n);
        this.vy = new Float32Array(n);
        this.vz = new Float32Array(n);
        this.size = new Float32Array(n);
        this.seedMix = new Float32Array(n);
        this.seedPhase = new Float32Array(n);
        this.offsetX = new Float32Array(n);
        this.offsetY = new Float32Array(n);
        this.offsetZ = new Float32Array(n);

        this.startX = new Float32Array(n);
        this.startY = new Float32Array(n);
        this.startZ = new Float32Array(n);

        for (let i = 0; i < n; i++) {
            let sx = 0;
            let sy = 0;

            // 25% start from corners, rest from edges.
            if (Math.random() < 0.25) {
                const cx = Math.random() < 0.5 ? -edgePad : this.width + edgePad;
                const cy = Math.random() < 0.5 ? -edgePad : this.height + edgePad;
                sx = cx + (Math.random() - 0.5) * edgePad * 0.6;
                sy = cy + (Math.random() - 0.5) * edgePad * 0.6;
            } else {
                const side = Math.floor(Math.random() * 4);
                if (side === 0) {
                    sx = -edgePad;
                    sy = Math.random() * this.height;
                } else if (side === 1) {
                    sx = this.width + edgePad;
                    sy = Math.random() * this.height;
                } else if (side === 2) {
                    sx = Math.random() * this.width;
                    sy = -edgePad;
                } else {
                    sx = Math.random() * this.width;
                    sy = this.height + edgePad;
                }

                sx += (Math.random() - 0.5) * edgePad * 0.4;
                sy += (Math.random() - 0.5) * edgePad * 0.4;
            }

            const sz = (Math.random() - 0.5) * 360;

            this.startX[i] = sx - this.centerX;
            this.startY[i] = sy - this.centerY;
            this.startZ[i] = sz;

            this.px[i] = this.startX[i];
            this.py[i] = this.startY[i];
            this.pz[i] = this.startZ[i];

            this.vx[i] = 0;
            this.vy[i] = 0;
            this.vz[i] = 0;

            this.size[i] = 1.2 + Math.random() * 1.2;
            this.seedMix[i] = Math.random();
            this.seedPhase[i] = Math.random() * Math.PI * 2;
            this.offsetX[i] = 0;
            this.offsetY[i] = 0;
            this.offsetZ[i] = 0;
        }
    }

    initAmbientParticles() {
        this.ambient = [];
        const count = this.width < 768 ? 42 : 70;

        for (let i = 0; i < count; i++) {
            const mix = 0.2 + Math.random() * 0.7;
            const color = this.mixColor(this.primaryColor, this.secondaryColor, mix);
            this.ambient.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.22,
                vy: (Math.random() - 0.5) * 0.22,
                size: 0.8 + Math.random() * 1.7,
                alpha: 0.1 + Math.random() * 0.24,
                pulse: Math.random() * Math.PI * 2,
                color
            });
        }
    }

    initWebElements() {
        this.webNodes = [];
        this.webSquares = [];

        const nodeCount = this.width < 768 ? 22 : 38;
        const squareCount = this.width < 768 ? 24 : 48;

        for (let i = 0; i < nodeCount; i++) {
            const mix = Math.random();
            this.webNodes.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.08,
                vy: (Math.random() - 0.5) * 0.08,
                pulse: Math.random() * Math.PI * 2,
                mix,
                size: 1.6 + Math.random() * 2.4
            });
        }

        for (let i = 0; i < squareCount; i++) {
            const mix = Math.random();
            this.webSquares.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.14,
                vy: (Math.random() - 0.5) * 0.14,
                size: 2 + Math.random() * 4,
                alpha: 0.2 + Math.random() * 0.42,
                mix,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }

    loadAssets() {
        const sources = ['images/loader-logo.png', 'images/apple-touch-icon.png', 'images/favicon-32.png'];
        this.logoLoadFailed = false;

        const tryLoad = (index) => {
            if (index >= sources.length) {
                this.logoLoadFailed = true;
                return;
            }

            const img = new Image();
            img.decoding = 'async';
            img.onload = () => {
                this.logoImage = img;
                this.logoLoadFailed = false;
                if (!this.assetsReady) {
                    this.buildTargetSets();
                    this.startSequence();
                }
            };
            img.onerror = () => {
                tryLoad(index + 1);
            };
            img.src = sources[index];
        };

        tryLoad(0);
    }

    startSequence() {
        if (this.started) return;
        this.assetsReady = true;
        this.started = true;
        this.sequenceStartTime = performance.now();
        this.elapsed = 0;
    }

    buildTargetSets() {
        const logoPoints = this.logoImage
            ? this.sampleLogoPointsFromImage(this.logoImage)
            : this.createFallbackLogoPoints();

        const safeLogoPoints = logoPoints.length > 0 ? logoPoints : this.createFallbackLogoPoints();

        const fullNamePoints = this.sampleTextPoints('Hitesh Joshi', {
            maxWidthRatio: 0.78,
            maxHeightRatio: 0.2,
            weight: 800,
            yOffset: 0
        });

        this.targets.logo = this.buildTargetSet(safeLogoPoints, 3.2);
        this.targets.name = this.buildTargetSet(fullNamePoints, 1.8);

    }

    sampleLogoPointsFromImage(image) {
        const sampleSize = 240;
        const off = document.createElement('canvas');
        off.width = sampleSize;
        off.height = sampleSize;

        const c = off.getContext('2d');
        c.clearRect(0, 0, sampleSize, sampleSize);
        c.drawImage(image, 0, 0, sampleSize, sampleSize);

        const imageData = c.getImageData(0, 0, sampleSize, sampleSize).data;
        const step = this.width < 900 ? 2 : 1;

        const scanAlpha = (alphaThreshold) => {
            const scanned = [];
            for (let y = 0; y < sampleSize; y += step) {
                for (let x = 0; x < sampleSize; x += step) {
                    const idx = (y * sampleSize + x) * 4;
                    if (imageData[idx + 3] >= alphaThreshold) {
                        scanned.push({ x, y });
                    }
                }
            }
            return scanned;
        };

        let points = scanAlpha(24);
        if (points.length < 300) {
            points = scanAlpha(8);
        }

        if (points.length === 0) return [];

        const logoSize = Math.min(this.width, this.height) * 0.44;
        return this.normalizePoints(points, sampleSize, sampleSize, logoSize, logoSize);
    }

    createFallbackLogoPoints() {
        return this.sampleTextPoints('HJ', {
            maxWidthRatio: 0.42,
            maxHeightRatio: 0.3,
            weight: 800,
            family: 'Orbitron, Rajdhani, Arial Black, sans-serif',
            italic: false,
            yOffset: 0
        });
    }

    sampleTextPoints(text, options) {
        const maxWidth = this.width * options.maxWidthRatio;
        const maxHeight = this.height * options.maxHeightRatio;

        const offW = Math.max(320, Math.floor(this.width * 0.9));
        const offH = Math.max(220, Math.floor(this.height * 0.5));

        const off = document.createElement('canvas');
        off.width = offW;
        off.height = offH;
        const c = off.getContext('2d');

        const family = options.family || 'Orbitron, Rajdhani, Arial, sans-serif';
        const style = options.italic ? 'italic ' : '';
        const weight = options.weight || 900;

        let fontSize = Math.min(maxHeight, this.width * 0.23);
        while (fontSize > 16) {
            c.font = `${style}${weight} ${fontSize}px ${family}`;
            const width = c.measureText(text).width;
            if (width <= maxWidth) break;
            fontSize -= 2;
        }

        c.clearRect(0, 0, offW, offH);
        c.fillStyle = '#ffffff';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.font = `${style}${weight} ${fontSize}px ${family}`;
        c.fillText(text, offW / 2, offH / 2 + (options.yOffset || 0));

        const data = c.getImageData(0, 0, offW, offH).data;
        const points = [];
        const step = 1;

        for (let y = 0; y < offH; y += step) {
            for (let x = 0; x < offW; x += step) {
                if (data[(y * offW + x) * 4 + 3] > 90) {
                    points.push({ x, y });
                }
            }
        }

        return this.normalizePoints(points, offW, offH, maxWidth, maxHeight);
    }

    normalizePoints(points, sourceW, sourceH, targetW, targetH) {
        if (!points.length) return [];

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
        }

        const boundsW = Math.max(1, maxX - minX);
        const boundsH = Math.max(1, maxY - minY);
        const scale = Math.min(targetW / boundsW, targetH / boundsH);

        const result = new Array(points.length);
        const cx = (minX + maxX) * 0.5;
        const cy = (minY + maxY) * 0.5;

        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            result[i] = {
                x: (p.x - cx) * scale,
                y: (p.y - cy) * scale
            };
        }

        return result;
    }

    buildTargetSet(points, depthSpan) {
        const n = this.particleCount;
        const outX = new Float32Array(n);
        const outY = new Float32Array(n);
        const outZ = new Float32Array(n);

        const total = Math.max(1, points.length);

        for (let i = 0; i < n; i++) {
            const idx = (i * 73 + (i % 17) * 19) % total;
            const point = points[idx % total] || { x: 0, y: 0 };
            outX[i] = point.x;
            outY[i] = point.y;
            outZ[i] = (this.seedMix[i] - 0.5) * depthSpan;
        }

        return { x: outX, y: outY, z: outZ };
    }

    getStageData(elapsedMs) {
        let consumed = 0;

        for (let i = 0; i < this.phaseDurations.length; i++) {
            const duration = this.phaseDurations[i];
            if (elapsedMs < consumed + duration) {
                return {
                    stage: i,
                    progress: Math.max(0, Math.min(1, (elapsedMs - consumed) / duration))
                };
            }
            consumed += duration;
        }

        return { stage: this.phaseDurations.length - 1, progress: 1 };
    }

    update(dt) {
        if (!this.assetsReady && (this.logoLoadFailed || this.now - this.initTime > this.assetHardTimeoutMs)) {
            try {
                this.logoImage = null;
                this.buildTargetSets();
                this.startSequence();
            } catch (err) {
                console.warn('Loader timed fallback failed', err);
                this.startTransition();
            }
        }

        if (!this.assetsReady) {
            this.updateAmbient(dt);
            return;
        }

        this.elapsed = this.now - this.sequenceStartTime;
        const stageData = this.getStageData(this.elapsed);
        const previousStage = this.currentStage;
        this.currentStage = stageData.stage;
        this.stageProgress = stageData.progress;

        const stage = this.currentStage;
        const progress = this.stageProgress;
        const finalStageIndex = this.phaseDurations.length - 1;
        const interactionStage = stage >= finalStageIndex && this.mouseActive;
        const stepMul = Math.max(0.65, Math.min(1.8, dt / 16.666));
        const spring = stage === 0 ? this.springScatter : (stage === 1 ? this.springLogo : this.springForm);
        const friction = stage === 1 ? this.logoFriction : this.particleFriction;
        const damping = Math.pow(friction, stepMul);

        if (stage === 1 && previousStage !== 1) {
            this.logoStableFrames = 0;
            this.logoIsStable = false;
            this.logoFullyFormedAt = 0;

            // Reduce carry-over momentum so logo can lock quickly and cleanly.
            for (let i = 0; i < this.particleCount; i++) {
                this.vx[i] *= 0.35;
                this.vy[i] *= 0.35;
                this.vz[i] *= 0.35;
            }
        } else if (stage !== 1) {
            this.logoStableFrames = 0;
            this.logoIsStable = false;
            this.logoFullyFormedAt = 0;
        }

        if (stage === finalStageIndex && previousStage !== finalStageIndex) {
            this.finalStageEnteredAt = this.now;
            this.nameFullyFormedAt = 0;
            this.nameFormationStableFrames = 0;
            this.nameIsStable = false;
            this.wasDisruptedInFinalStage = false;
            this.finalHoldAccumMs = 0;
            this.lastHoldUpdateAt = this.now;
            this.dissolveStartAt = Infinity;
        } else if (stage !== finalStageIndex) {
            this.finalStageEnteredAt = 0;
            this.nameFullyFormedAt = 0;
            this.nameFormationStableFrames = 0;
            this.nameIsStable = false;
            this.wasDisruptedInFinalStage = false;
            this.finalHoldAccumMs = 0;
            this.lastHoldUpdateAt = 0;
            this.dissolveStartAt = Infinity;
        }

        const logo = this.targets.logo;
        const name = this.targets.name;
        let repelApplied = false;

        for (let i = 0; i < this.particleCount; i++) {
            let tx = 0;
            let ty = 0;
            let tz = 0;

            if (stage === 0) {
                tx = logo.x[i];
                ty = logo.y[i];
                tz = logo.z[i];
            } else if (stage === 1) {
                tx = logo.x[i];
                ty = logo.y[i];
                tz = logo.z[i];
            } else if (stage === 2) {
                const k = this.easeInOutCubic(progress);
                tx = logo.x[i] * (1 - k) + name.x[i] * k;
                ty = logo.y[i] * (1 - k) + name.y[i] * k;
                tz = logo.z[i] * (1 - k) + name.z[i] * k;
            } else {
                tx = name.x[i];
                ty = name.y[i];
                tz = name.z[i];

                if (Number.isFinite(this.dissolveStartAt) && this.now > this.dissolveStartAt) {
                    const d = Math.min(1, (this.now - this.dissolveStartAt) / Math.max(1, this.finalDissolveMs));
                    const radial = 0.22 + this.seedMix[i] * 0.28;
                    tx += name.x[i] * radial * d;
                    ty += name.y[i] * radial * d;
                    tx += Math.cos(this.seedPhase[i] + d * 8) * 140 * d;
                    ty += Math.sin(this.seedPhase[i] + d * 8) * 110 * d;
                    tz += (this.seedMix[i] - 0.5) * 260 * d + 220 * d * d;
                }
            }

            // ParticleText-style spring attraction toward current target.
            this.vx[i] += (tx - this.px[i]) * spring * stepMul;
            this.vy[i] += (ty - this.py[i]) * spring * stepMul;
            this.vz[i] += (tz - this.pz[i]) * spring * stepMul;

            if (interactionStage) {
                const zPos = this.pz[i] + this.cameraZ;
                if (zPos > 20) {
                    const scale = this.fov / (this.fov + zPos);
                    const sx = this.centerX + this.px[i] * scale;
                    const sy = this.centerY + this.py[i] * scale;

                    const rdx = sx - this.mouseX;
                    const rdy = sy - this.mouseY;
                    const d2 = rdx * rdx + rdy * rdy;

                    if (d2 > 1 && d2 < this.repelRadius2) {
                        const d = Math.sqrt(d2);
                        const mag = this.repelForce * (1 - d / this.repelRadius) * 5;
                        this.vx[i] += (rdx / d) * mag * stepMul;
                        this.vy[i] += (rdy / d) * mag * stepMul;
                        repelApplied = true;
                    }
                }
            }

            this.vx[i] *= damping;
            this.vy[i] *= damping;
            this.vz[i] *= damping;

            this.px[i] += this.vx[i] * stepMul;
            this.py[i] += this.vy[i] * stepMul;
            this.pz[i] += this.vz[i] * stepMul;
        }

        if (stage === 1) {
            this.updateLogoFormationState(logo);

            if (this.logoIsStable) {
                // Snap onto exact logo positions so the mark is unmistakably formed.
                const snap = 0.34;
                for (let i = 0; i < this.particleCount; i++) {
                    this.px[i] += (logo.x[i] - this.px[i]) * snap;
                    this.py[i] += (logo.y[i] - this.py[i]) * snap;
                    this.pz[i] += (logo.z[i] - this.pz[i]) * snap;
                    this.vx[i] *= 0.55;
                    this.vy[i] *= 0.55;
                    this.vz[i] *= 0.55;
                }
            }

            const logoHoldSatisfied = this.logoIsStable && this.logoFullyFormedAt > 0 && (this.now - this.logoFullyFormedAt >= this.logoPostFormHoldMs);
            if (!logoHoldSatisfied) {
                // Freeze timeline until logo is truly formed, then hold briefly before morph.
                this.sequenceStartTime += dt;
            }
        }

        if (stage === finalStageIndex) {
            this.updateNameFormationState(name);

            // If user is actively repelling during final name stage, force a full re-form + hold.
            const disruptedByUser = this.mouseActive && repelApplied;
            if (disruptedByUser) {
                this.wasDisruptedInFinalStage = true;
                this.nameFullyFormedAt = 0;
                this.nameFormationStableFrames = 0;
                this.nameIsStable = false;
                this.nameCuePlayed = false;
                this.finalHoldAccumMs = 0;
                this.lastHoldUpdateAt = this.now;
                this.dissolveStartAt = Infinity;
            }

            if (this.nameIsStable) {
                if (this.lastHoldUpdateAt <= 0) {
                    this.lastHoldUpdateAt = this.now;
                }

                const holdDelta = Math.max(0, this.now - this.lastHoldUpdateAt);
                const activeHoldMs = this.wasDisruptedInFinalStage ? this.reformedNameHoldMs : this.normalNameHoldMs;
                this.finalHoldAccumMs = Math.min(activeHoldMs, this.finalHoldAccumMs + holdDelta);
                this.lastHoldUpdateAt = this.now;

                if (this.finalHoldAccumMs >= activeHoldMs && !Number.isFinite(this.dissolveStartAt)) {
                    this.dissolveStartAt = this.now;
                }
            } else {
                this.finalHoldAccumMs = 0;
                this.lastHoldUpdateAt = this.now;
                this.dissolveStartAt = Infinity;
            }
        }

        // Start loader fade while particles are still dissolving for a smooth handoff.
        if (!this.transitionStarted && stage === finalStageIndex && Number.isFinite(this.dissolveStartAt) && this.now >= this.dissolveStartAt + this.finalFadeDelayMs) {
            this.startTransition();
        }

        this.updateAmbient(dt);
    }

    updateAmbient(dt) {
        const move = dt * 0.04;

        for (let i = 0; i < this.ambient.length; i++) {
            const p = this.ambient[i];
            p.x += p.vx * move;
            p.y += p.vy * move;

            if (p.x < -10) p.x = this.width + 10;
            if (p.x > this.width + 10) p.x = -10;
            if (p.y < -10) p.y = this.height + 10;
            if (p.y > this.height + 10) p.y = -10;
        }

        const webMove = dt * 0.05;
        for (let i = 0; i < this.webNodes.length; i++) {
            const n = this.webNodes[i];
            n.x += n.vx * webMove;
            n.y += n.vy * webMove;

            if (n.x < -20) n.x = this.width + 20;
            if (n.x > this.width + 20) n.x = -20;
            if (n.y < -20) n.y = this.height + 20;
            if (n.y > this.height + 20) n.y = -20;
        }

        const squareMove = dt * 0.08;
        for (let i = 0; i < this.webSquares.length; i++) {
            const s = this.webSquares[i];
            s.x += s.vx * squareMove;
            s.y += s.vy * squareMove;

            if (s.x < -10) s.x = this.width + 10;
            if (s.x > this.width + 10) s.x = -10;
            if (s.y < -10) s.y = this.height + 10;
            if (s.y > this.height + 10) s.y = -10;
        }
    }

    getParticleAlpha() {
        const stage = this.currentStage;
        const t = this.stageProgress;
        const finalStageIndex = this.phaseDurations.length - 1;
        const dissolveStarted = this.now >= this.dissolveStartAt;

        if (stage < 0) return 0.62;
        if (stage === 0) return 0.35 + 0.65 * t;
        if (stage === 1) return 1;
        if (stage === 2) return 0.98;

        if (!dissolveStarted) return 0.98;
        const d = Math.min(1, (this.now - this.dissolveStartAt) / Math.max(1, this.finalDissolveMs));
        // Keep some alpha while the container opacity fades out to avoid abrupt vanish.
        return Math.max(0.28, 0.98 * (1 - d * 0.75));
    }

    updateNameFormationState(nameTarget) {
        if (!nameTarget || !this.px) return;

        const stride = Math.max(1, Math.floor(this.particleCount / 180));
        let sumDistSq = 0;
        let samples = 0;

        for (let i = 0; i < this.particleCount; i += stride) {
            const dx = this.px[i] - nameTarget.x[i];
            const dy = this.py[i] - nameTarget.y[i];
            const dz = this.pz[i] - nameTarget.z[i];
            sumDistSq += dx * dx + dy * dy + dz * dz;
            samples++;
        }

        if (samples === 0) return;

        const avgDistSq = sumDistSq / samples;
        if (avgDistSq <= this.nameFormationThresholdSq) {
            this.nameFormationStableFrames++;
            if (this.nameFormationStableFrames >= 12) {
                this.nameIsStable = true;
            }
            if (!this.nameFullyFormedAt && this.nameIsStable) {
                this.nameFullyFormedAt = this.now;
            }
        } else {
            this.nameFormationStableFrames = Math.max(0, this.nameFormationStableFrames - 1);
            if (this.nameFormationStableFrames < 12) {
                this.nameIsStable = false;
            }
        }
    }

    updateLogoFormationState(logoTarget) {
        if (!logoTarget || !this.px) return;

        const stride = Math.max(1, Math.floor(this.particleCount / 280));
        let sumDistSq = 0;
        let inToleranceCount = 0;
        let samples = 0;

        for (let i = 0; i < this.particleCount; i += stride) {
            const dx = this.px[i] - logoTarget.x[i];
            const dy = this.py[i] - logoTarget.y[i];
            const dz = this.pz[i] - logoTarget.z[i];
            const distSq = dx * dx + dy * dy + dz * dz;
            sumDistSq += distSq;
            if (distSq <= this.logoFormationThresholdSq * this.logoPointToleranceMultiplier) {
                inToleranceCount++;
            }
            samples++;
        }

        if (samples === 0) return;

        const avgDistSq = sumDistSq / samples;
        const avgThresholdSq = this.logoFormationThresholdSq * this.logoAvgTighten;
        const coverage = inToleranceCount / samples;
        const isFullyFormed = avgDistSq <= avgThresholdSq && coverage >= this.logoCoverageTarget;

        if (isFullyFormed) {
            this.logoStableFrames++;
            if (this.logoStableFrames >= this.logoStableFrameTarget) {
                this.logoIsStable = true;
                if (!this.logoFullyFormedAt) {
                    this.logoFullyFormedAt = this.now;
                }
            }
        } else {
            this.logoStableFrames = Math.max(0, this.logoStableFrames - 2);
            if (this.logoStableFrames < this.logoStableFrameTarget) {
                this.logoIsStable = false;
                this.logoFullyFormedAt = 0;
            }
        }
    }

    drawBackground() {
        const ctx = this.ctx;

        ctx.fillStyle = `rgb(${this.bgColor[0]}, ${this.bgColor[1]}, ${this.bgColor[2]})`;
        ctx.fillRect(0, 0, this.width, this.height);

        const gradA = ctx.createRadialGradient(this.width * 0.2, this.height * 0.16, 0, this.width * 0.2, this.height * 0.16, this.width * 0.8);
        gradA.addColorStop(0, `rgba(${this.primaryColor[0]}, ${this.primaryColor[1]}, ${this.primaryColor[2]}, 0.12)`);
        gradA.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradA;
        ctx.fillRect(0, 0, this.width, this.height);

        const gradB = ctx.createRadialGradient(this.width * 0.82, this.height * 0.84, 0, this.width * 0.82, this.height * 0.84, this.width * 0.9);
        gradB.addColorStop(0, `rgba(${this.secondaryColor[0]}, ${this.secondaryColor[1]}, ${this.secondaryColor[2]}, 0.1)`);
        gradB.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradB;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    drawAmbient() {
        const ctx = this.ctx;
        const time = this.now;

        for (let i = 0; i < this.ambient.length; i++) {
            const p = this.ambient[i];
            const pulse = 0.58 + 0.42 * Math.sin(time * 0.001 + p.pulse);
            const alpha = p.alpha * pulse;

            ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawWebElements() {
        const ctx = this.ctx;
        const time = this.now;
        const maxDist = this.width < 768 ? 170 : 240;

        // Link network.
        ctx.lineWidth = 0.9;
        for (let i = 0; i < this.webNodes.length; i++) {
            const a = this.webNodes[i];
            for (let j = i + 1; j < this.webNodes.length; j++) {
                const b = this.webNodes[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d > maxDist) continue;

                const fade = 1 - d / maxDist;
                const mix = (a.mix + b.mix) * 0.5;
                const color = this.mixColor(this.primaryColor, this.secondaryColor, mix);
                const aLine = 0.03 + fade * 0.14;

                ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${aLine})`;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }

        // Node points.
        for (let i = 0; i < this.webNodes.length; i++) {
            const n = this.webNodes[i];
            const pulse = 0.55 + 0.45 * Math.sin(time * 0.0012 + n.pulse);
            const color = this.mixColor(this.primaryColor, this.secondaryColor, n.mix);
            const alpha = 0.16 + pulse * 0.32;

            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Floating square accents.
        for (let i = 0; i < this.webSquares.length; i++) {
            const s = this.webSquares[i];
            const twinkle = 0.65 + 0.35 * Math.sin(time * 0.0015 + s.twinkle);
            const color = this.mixColor(this.primaryColor, this.secondaryColor, s.mix);
            const alpha = s.alpha * twinkle;

            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        }
    }

    drawParticles() {
        if (!this.px) return;

        const ctx = this.ctx;
        const alpha = this.getParticleAlpha();
        if (alpha <= 0.01) return;

        for (let i = 0; i < this.particleCount; i++) {
            const zPos = this.pz[i] + this.cameraZ;
            if (zPos <= 10) continue;

            const scale = this.fov / zPos;
            const sx = this.centerX + this.px[i] * scale;
            const sy = this.centerY + this.py[i] * scale;

            if (sx < -20 || sy < -20 || sx > this.width + 20 || sy > this.height + 20) continue;

            const mixShift = 0.04 * Math.sin(this.now * 0.0011 + this.seedPhase[i]);
            const mix = Math.max(0, Math.min(1, 0.15 + this.seedMix[i] * 0.72 + mixShift));
            const color = this.mixColor(this.primaryColor, this.secondaryColor, mix);

            const size = this.size[i] * Math.max(0.55, scale);
            const glowEvery = (i % 7) === 0;
            const pAlpha = Math.min(1, alpha * (0.68 + scale * 0.4));

            if (glowEvery) {
                const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 2.2);
                glow.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${pAlpha * 0.24})`);
                glow.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(sx, sy, size * 2.2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${pAlpha})`;
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `rgba(255,255,255,${pAlpha * 0.18})`;
            ctx.beginPath();
            ctx.arc(sx, sy, size * 0.28, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawRepelField() {
        if (!this.mouseActive || this.currentStage < 1) return;

        const ctx = this.ctx;
        const r = this.repelRadius;
        const isLight = document.body.classList.contains('light-theme');
        const coreColor = isLight ? 'rgba(8,14,26,0.94)' : 'rgba(255,255,255,0.94)';
        const ringColor = isLight ? 'rgba(8,14,26,0.62)' : 'rgba(255,255,255,0.68)';
        const field = ctx.createRadialGradient(this.mouseX, this.mouseY, 0, this.mouseX, this.mouseY, r);
        field.addColorStop(0, 'rgba(255,255,255,0.05)');
        field.addColorStop(0.35, `rgba(${this.primaryColor[0]},${this.primaryColor[1]},${this.primaryColor[2]},0.08)`);
        field.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = field;
        ctx.beginPath();
        ctx.arc(this.mouseX, this.mouseY, r, 0, Math.PI * 2);
        ctx.fill();

        // High-contrast pointer marker so cursor remains visible in light and dark themes.
        ctx.save();
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = isLight ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.55)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.mouseX, this.mouseY, 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = coreColor;
        ctx.beginPath();
        ctx.arc(this.mouseX, this.mouseY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    draw() {
        this.drawBackground();
        this.drawWebElements();
        this.drawAmbient();
        this.drawParticles();
        this.drawRepelField();
    }

    animate() {
        if (this.done || !this.isVisible) return;

        if (this.loaderEl.classList.contains('hidden')) {
            this.done = true;
            this.cleanup();
            return;
        }

        this.now = performance.now();
        const dt = Math.min(34, Math.max(8, this.now - this.lastFrameTime));
        this.lastFrameTime = this.now;

        this.update(dt);
        this.draw();

        this.rafId = requestAnimationFrame(() => this.animate());
    }

    startTransition() {
        if (this.transitionStarted || this.done) return;

        this.transitionStarted = true;

        this.loaderEl.classList.add('loader-dissolving');

        window.setTimeout(() => {
            this.loaderEl.classList.add('hidden');
            document.body.classList.remove('loading-active');
            this.done = true;
            this.cleanup();
        }, this.transitionDuration);
    }

    cleanup() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibility);

        if (this.loaderEl) {
            this.loaderEl.removeEventListener('click', this.handleSkipClick);
        }

        if (this.canvas) {
            this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
            this.canvas.removeEventListener('pointerup', this.handlePointerUp);
            this.canvas.removeEventListener('pointermove', this.handlePointerMove);
            this.canvas.removeEventListener('pointerleave', this.handlePointerLeave);
            this.canvas.removeEventListener('pointercancel', this.handlePointerLeave);
        }

        if (this.loaderEl) {
            this.loaderEl.removeEventListener('pointerdown', this.handlePointerDown);
            this.loaderEl.removeEventListener('pointerup', this.handlePointerUp);
            this.loaderEl.removeEventListener('pointermove', this.handlePointerMove);
            this.loaderEl.removeEventListener('pointerleave', this.handlePointerLeave);
        }

        if (this.themeObserver) {
            this.themeObserver.disconnect();
            this.themeObserver = null;
        }

        this.ambient = [];
        this.webNodes = [];
        this.webSquares = [];
        this.targets.logo = null;
        this.targets.name = null;

        this.px = null;
        this.py = null;
        this.pz = null;
        this.vx = null;
        this.vy = null;
        this.vz = null;
        this.size = null;
        this.seedMix = null;
        this.seedPhase = null;
        this.offsetX = null;
        this.offsetY = null;
        this.offsetZ = null;
        this.startX = null;
        this.startY = null;
        this.startZ = null;
    }

    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        requestAnimationFrame(() => {
            window.loaderAnimation = new LoaderAnimation();
        });
    });
} else {
    requestAnimationFrame(() => {
        window.loaderAnimation = new LoaderAnimation();
    });
}
