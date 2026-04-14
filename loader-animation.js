// ===================================
// HJ LOGO LOADING ANIMATION
// Image-Sampled 3D Particle Assembly
// ===================================

class LoaderAnimation {
    constructor() {
        this.canvas = document.getElementById('loaderCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.loaderEl = document.getElementById('loader');

        this.particles = [];
        this.logoPoints = [];
        this.ambientParticles = [];
        this.phase = -1; // -1=waiting, 0=gather, 1=assemble, 2=morph, 3=solid3d, 4=dissolve
        this.phaseTime = 0;
        this.startTime = 0;
        this.animFrame = null;
        this.isVisible = true;
        this.done = false;
        this.transitionStarted = false;
        this.imageLoaded = false;
        this.rotationAngle = 0;
        this.rawLogoImage = null;
        this.logoTextureCanvas = null;
        this.logoFaceCanvas = null;
        this.logoSideCanvas = null;
        this.logoSpecCanvas = null;
        this.logoDisplaySize = 0;
        this.logoDrawX = 0;
        this.logoDrawY = 0;

        // Detect theme
        this.isLight = localStorage.getItem('theme') === 'light';

        // Colors
        this.colors = this.isLight
            ? { primary: [0, 153, 255], secondary: [102, 0, 204], bg: [245, 247, 250], bgStr: '#f5f7fa' }
            : { primary: [0, 240, 255], secondary: [82, 0, 255], bg: [10, 10, 15], bgStr: '#0a0a0f' };

        // Phase durations (ms)
        this.phaseDurations = [1200, 1350, 900, 1200, 900];

        this.init();
    }

    init() {
        document.body.classList.add('loading-active');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible && !this.done) {
                if (this.imageLoaded) {
                    this.startTime = performance.now() - this.getElapsed();
                }
                this.animate();
            }
        });

        // Click to skip
        this.loaderEl.addEventListener('click', () => {
            if (!this.transitionStarted) {
                this.startTransition();
            }
        });

        // Create ambient bg particles and START animation loop immediately
        this.createAmbientParticles();
        this.animate(); // Start rendering ambient particles right away

        // Load logo image in parallel
        this.loadLogoImage();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.logoDisplaySize = Math.min(this.canvas.width, this.canvas.height) * 0.45;
        this.logoDrawX = this.centerX - this.logoDisplaySize / 2;
        this.logoDrawY = this.centerY - this.logoDisplaySize / 2;
    }

    getElapsed() {
        let elapsed = 0;
        for (let i = 0; i < Math.max(0, this.phase); i++) elapsed += this.phaseDurations[i];
        return elapsed + Math.max(0, this.phaseTime);
    }

    loadLogoImage() {
        const img = new Image();
        // Don't set crossOrigin for same-origin images — it can cause CORS issues
        img.onload = () => {
            this.rawLogoImage = img;
            this.sampleImagePoints(img);
            this.buildLogoTexture(img);
            // If image sampling found no points, use fallback
            if (this.logoPoints.length === 0) {
                console.warn('Logo image sampling found 0 points, using fallback');
                this.createFallbackPoints();
                this.buildFallbackTexture();
            }
            this.imageLoaded = true;
            this.createLogoParticles();
            this.phase = 0;
            this.startTime = performance.now();
        };
        img.onerror = () => {
            console.warn('Logo image failed to load, using fallback');
            this.createFallbackPoints();
            this.buildFallbackTexture();
            this.imageLoaded = true;
            this.createLogoParticles();
            this.phase = 0;
            this.startTime = performance.now();
        };
        img.src = 'images/apple-touch-icon.png';
    }

    sampleImagePoints(img) {
        // Draw image to offscreen canvas and sample non-transparent pixels
        const sampleCanvas = document.createElement('canvas');
        const sampleSize = 180;
        sampleCanvas.width = sampleSize;
        sampleCanvas.height = sampleSize;
        const sCtx = sampleCanvas.getContext('2d');

        // Fill white first so we can detect the actual logo vs background
        sCtx.fillStyle = '#ffffff';
        sCtx.fillRect(0, 0, sampleSize, sampleSize);
        sCtx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const imageData = sCtx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imageData.data;

        // Logo display size on screen
        const scale = this.logoDisplaySize / sampleSize;
        const offsetX = this.logoDrawX;
        const offsetY = this.logoDrawY;

        this.logoPoints = [];

        // First pass: detect what is "background" by checking corners
        // (corners should be background)
        const corners = [
            0, // top-left
            (sampleSize - 1) * 4, // top-right
            ((sampleSize - 1) * sampleSize) * 4, // bottom-left
            ((sampleSize - 1) * sampleSize + (sampleSize - 1)) * 4 // bottom-right
        ];
        let bgR = 0, bgG = 0, bgB = 0;
        corners.forEach(idx => {
            bgR += data[idx];
            bgG += data[idx + 1];
            bgB += data[idx + 2];
        });
        bgR = Math.round(bgR / 4);
        bgG = Math.round(bgG / 4);
        bgB = Math.round(bgB / 4);

        // Sample pixels — detect anything that differs significantly from the background
        const step = 2;
        const threshold = 50; // Color distance threshold from background
        for (let y = 0; y < sampleSize; y += step) {
            for (let x = 0; x < sampleSize; x += step) {
                const idx = (y * sampleSize + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = data[idx + 3];

                // Calculate color distance from detected background
                const dr = r - bgR;
                const dg = g - bgG;
                const db = b - bgB;
                const colorDist = Math.sqrt(dr * dr + dg * dg + db * db);

                if (a > 50 && colorDist > threshold) {
                    this.logoPoints.push({
                        x: x * scale + offsetX,
                        y: y * scale + offsetY
                    });
                }
            }
        }

        // If too many points, thin them out randomly
        if (this.logoPoints.length > 900) {
            this.logoPoints.sort(() => Math.random() - 0.5);
            this.logoPoints = this.logoPoints.slice(0, 900);
        }

        console.log(`Sampled ${this.logoPoints.length} logo points (bg: rgb(${bgR},${bgG},${bgB}))`);
    }

    buildLogoTexture(img) {
        const texSize = 420;
        const tex = document.createElement('canvas');
        tex.width = texSize;
        tex.height = texSize;
        const tCtx = tex.getContext('2d');

        tCtx.fillStyle = '#ffffff';
        tCtx.fillRect(0, 0, texSize, texSize);
        tCtx.drawImage(img, 0, 0, texSize, texSize);

        const imageData = tCtx.getImageData(0, 0, texSize, texSize);
        const data = imageData.data;

        const corners = [
            0,
            (texSize - 1) * 4,
            ((texSize - 1) * texSize) * 4,
            ((texSize - 1) * texSize + (texSize - 1)) * 4
        ];
        let bgR = 0, bgG = 0, bgB = 0;
        corners.forEach(idx => {
            bgR += data[idx];
            bgG += data[idx + 1];
            bgB += data[idx + 2];
        });
        bgR = Math.round(bgR / 4);
        bgG = Math.round(bgG / 4);
        bgB = Math.round(bgB / 4);

        const threshold = 48;
        for (let i = 0; i < data.length; i += 4) {
            const dr = data[i] - bgR;
            const dg = data[i + 1] - bgG;
            const db = data[i + 2] - bgB;
            const dist = Math.sqrt(dr * dr + dg * dg + db * db);

            if (dist > threshold) {
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
                data[i + 3] = 255;
            } else {
                data[i + 3] = 0;
            }
        }

        tCtx.putImageData(imageData, 0, 0);
        this.logoTextureCanvas = tex;
        this.updateTintedLogoCanvases();
    }

    buildFallbackTexture() {
        const texSize = 420;
        const tex = document.createElement('canvas');
        tex.width = texSize;
        tex.height = texSize;
        const tCtx = tex.getContext('2d');

        tCtx.fillStyle = '#ffffff';
        tCtx.font = 'bold italic 290px Georgia, "Times New Roman", serif';
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        tCtx.fillText('HJ', texSize / 2, texSize / 2 + 15);

        this.logoTextureCanvas = tex;
        this.updateTintedLogoCanvases();
    }

    updateTintedLogoCanvases() {
        if (!this.logoTextureCanvas) return;

        const w = this.logoTextureCanvas.width;
        const h = this.logoTextureCanvas.height;
        const palette = this.isLight
            ? {
                faceStart: [28, 166, 255],
                faceMid: [78, 126, 255],
                faceEnd: [104, 60, 238],
                sideTop: [20, 128, 225],
                sideMid: [40, 92, 182],
                sideBottom: [46, 48, 142]
            }
            : {
                faceStart: [24, 186, 255],
                faceMid: [68, 132, 255],
                faceEnd: [100, 58, 255],
                sideTop: [16, 136, 230],
                sideMid: [34, 95, 190],
                sideBottom: [40, 46, 150]
            };

        const face = document.createElement('canvas');
        face.width = w;
        face.height = h;
        const fCtx = face.getContext('2d');

        fCtx.drawImage(this.logoTextureCanvas, 0, 0);
        fCtx.globalCompositeOperation = 'source-in';
        const faceGrad = fCtx.createLinearGradient(0, 0, w, h);
        // Match site title gradient tone (About Me), but darker for better contrast in loader.
        faceGrad.addColorStop(0, `rgba(${palette.faceStart[0]}, ${palette.faceStart[1]}, ${palette.faceStart[2]}, 1)`);
        faceGrad.addColorStop(0.52, `rgba(${palette.faceMid[0]}, ${palette.faceMid[1]}, ${palette.faceMid[2]}, 1)`);
        faceGrad.addColorStop(1, `rgba(${palette.faceEnd[0]}, ${palette.faceEnd[1]}, ${palette.faceEnd[2]}, 1)`);
        fCtx.fillStyle = faceGrad;
        fCtx.fillRect(0, 0, w, h);

        // Dark coat to avoid washed-out look on light backgrounds.
        fCtx.globalCompositeOperation = 'source-atop';
        const darkCoat = fCtx.createLinearGradient(0, 0, 0, h);
        darkCoat.addColorStop(0, 'rgba(0,0,0,0.03)');
        darkCoat.addColorStop(1, 'rgba(0,0,0,0.1)');
        fCtx.fillStyle = darkCoat;
        fCtx.fillRect(0, 0, w, h);

        // Add a metallic-style highlight band inside the glyph only.
        fCtx.globalCompositeOperation = 'source-atop';
        const sheen = fCtx.createLinearGradient(0, 0, w, h);
        sheen.addColorStop(0.08, 'rgba(255,255,255,0.2)');
        sheen.addColorStop(0.4, 'rgba(255,255,255,0.05)');
        sheen.addColorStop(0.72, 'rgba(255,255,255,0.15)');
        sheen.addColorStop(1, 'rgba(255,255,255,0)');
        fCtx.fillStyle = sheen;
        fCtx.fillRect(0, 0, w, h);
        fCtx.globalCompositeOperation = 'source-over';

        const side = document.createElement('canvas');
        side.width = w;
        side.height = h;
        const sCtx = side.getContext('2d');

        sCtx.drawImage(this.logoTextureCanvas, 0, 0);
        sCtx.globalCompositeOperation = 'source-in';
        const sideGrad = sCtx.createLinearGradient(0, 0, 0, h);
        sideGrad.addColorStop(0, `rgba(${palette.sideTop[0]}, ${palette.sideTop[1]}, ${palette.sideTop[2]}, 0.98)`);
        sideGrad.addColorStop(0.48, `rgba(${palette.sideMid[0]}, ${palette.sideMid[1]}, ${palette.sideMid[2]}, 0.98)`);
        sideGrad.addColorStop(1, `rgba(${palette.sideBottom[0]}, ${palette.sideBottom[1]}, ${palette.sideBottom[2]}, 0.98)`);
        sCtx.fillStyle = sideGrad;
        sCtx.fillRect(0, 0, w, h);

        // Dark rim toward the far extrusion side to improve thickness readability.
        sCtx.globalCompositeOperation = 'source-atop';
        const rim = sCtx.createLinearGradient(0, 0, w, 0);
        rim.addColorStop(0, 'rgba(0,0,0,0.05)');
        rim.addColorStop(0.6, 'rgba(0,0,0,0.18)');
        rim.addColorStop(1, 'rgba(0,0,0,0.36)');
        sCtx.fillStyle = rim;
        sCtx.fillRect(0, 0, w, h);
        sCtx.globalCompositeOperation = 'source-over';

        // Build masked specular texture for animated metallic shine.
        const spec = document.createElement('canvas');
        spec.width = w;
        spec.height = h;
        const pCtx = spec.getContext('2d');
        const specGrad = pCtx.createLinearGradient(0, 0, w, h);
        specGrad.addColorStop(0.22, 'rgba(255,255,255,0)');
        specGrad.addColorStop(0.38, 'rgba(255,255,255,0.08)');
        specGrad.addColorStop(0.5, 'rgba(255,255,255,0.46)');
        specGrad.addColorStop(0.62, 'rgba(255,255,255,0.1)');
        specGrad.addColorStop(0.78, 'rgba(255,255,255,0)');
        pCtx.fillStyle = specGrad;
        pCtx.fillRect(0, 0, w, h);
        pCtx.globalCompositeOperation = 'destination-in';
        pCtx.drawImage(this.logoTextureCanvas, 0, 0);
        pCtx.globalCompositeOperation = 'source-over';

        this.logoFaceCanvas = face;
        this.logoSideCanvas = side;
        this.logoSpecCanvas = spec;
    }

    createFallbackPoints() {
        // Render "HJ" in a calligraphic font as fallback
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 200;
        offCanvas.height = 200;
        const oCtx = offCanvas.getContext('2d');
        oCtx.fillStyle = '#ffffff';
        oCtx.font = 'bold italic 140px Georgia, "Times New Roman", serif';
        oCtx.textAlign = 'center';
        oCtx.textBaseline = 'middle';
        oCtx.fillText('HJ', 100, 105);

        const imageData = oCtx.getImageData(0, 0, 200, 200);
        const scale = Math.min(this.canvas.width, this.canvas.height) * 0.4 / 200;
        const offsetX = this.centerX - 100 * scale;
        const offsetY = this.centerY - 100 * scale;

        this.logoPoints = [];
        for (let y = 0; y < 200; y += 3) {
            for (let x = 0; x < 200; x += 3) {
                if (imageData.data[(y * 200 + x) * 4 + 3] > 128) {
                    this.logoPoints.push({
                        x: x * scale + offsetX,
                        y: y * scale + offsetY
                    });
                }
            }
        }
        if (this.logoPoints.length > 700) {
            this.logoPoints.sort(() => Math.random() - 0.5);
            this.logoPoints = this.logoPoints.slice(0, 700);
        }
    }

    createAmbientParticles() {
        const w = this.canvas.width || window.innerWidth;
        const h = this.canvas.height || window.innerHeight;

        for (let i = 0; i < 100; i++) {
            const [r, g, b] = Math.random() > 0.5 ? this.colors.primary : this.colors.secondary;
            this.ambientParticles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: 1 + Math.random() * 2.5,
                r, g, b,
                alpha: 0.15 + Math.random() * 0.4,
                pulse: Math.random() * Math.PI * 2
            });
        }
    }

    createLogoParticles() {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const maxR = Math.max(this.canvas.width, this.canvas.height) * 0.7;

        const count = this.logoPoints.length;
        const depthLayers = [-0.45, 0, 0.45];

        for (let i = 0; i < count; i++) {
            const target = this.logoPoints[i];
            const [r, g, b] = Math.random() > 0.25 ? this.colors.primary : this.colors.secondary;

            for (let li = 0; li < depthLayers.length; li++) {
                // Keep center layer always; keep front/back sometimes for subtle thickness.
                if (li !== 1 && Math.random() > 0.4) continue;

                // Start scattered far away
                const angle = Math.random() * Math.PI * 2;
                const dist = maxR * (0.4 + Math.random() * 0.6);
                const x = cx + Math.cos(angle) * dist;
                const y = cy + Math.sin(angle) * dist;
                const zLayer = (Math.random() - 0.5) * 2;

                // No XY jitter for crisp logo silhouette.
                const jitterX = 0;
                const jitterY = 0;

                const sizeBoost = li === 1 ? 1.08 : 0.95;

                this.particles.push({
                    x, y, z: zLayer,
                    targetX: target.x + jitterX,
                    targetY: target.y + jitterY,
                    targetZ: depthLayers[li] + (Math.random() - 0.5) * 0.1,
                    size: (2.2 + Math.random() * 1.8) * sizeBoost,
                    r, g, b,
                    alpha: 0,
                    angle,
                    orbitRadius: dist,
                    orbitSpeed: (0.3 + Math.random() * 1.2) * (Math.random() > 0.5 ? 1 : -1),
                    phase: Math.random() * Math.PI * 2,
                    dissolveAngle: Math.random() * Math.PI * 2,
                    dissolveSpeed: 3 + Math.random() * 6,
                    trail: []
                });
            }
        }
    }

    // ---- PHASE 0: Particles spiral inward with trails ----
    updateGather(dt) {
        const progress = Math.min(this.phaseTime / this.phaseDurations[0], 1);

        this.particles.forEach(p => {
            p.orbitRadius *= (1 - 0.0015 * dt);
            p.angle += p.orbitSpeed * 0.0008 * dt;
            const targetR = p.orbitRadius * (1 - progress * 0.65);

            const newX = this.centerX + Math.cos(p.angle) * targetR;
            const newY = this.centerY + Math.sin(p.angle) * targetR;

            // Store trail
            if (p.trail.length > 6) p.trail.shift();
            p.trail.push({ x: p.x, y: p.y });

            p.x = newX;
            p.y = newY;
            p.alpha = Math.min(1, progress * 2.5);
        });
    }

    // ---- PHASE 1: Particles assemble into logo shape ----
    updateAssemble(dt) {
        const rawProgress = Math.min(this.phaseTime / this.phaseDurations[1], 1);
        const progress = this.easeInOutCubic(rawProgress);

        this.particles.forEach(p => {
            const lerpSpeed = 0.04 + progress * 0.08;
            p.x += (p.targetX - p.x) * lerpSpeed;
            p.y += (p.targetY - p.y) * lerpSpeed;
            p.z += (p.targetZ - p.z) * lerpSpeed;
            p.alpha = 1;

            if (p.trail.length > 0 && rawProgress > 0.5) {
                p.trail.shift();
            }
        });
    }

    // ---- PHASE 2/3: 3D rotation + glow pulse ----
    updateGlow3D(dt) {
        const time = this.phaseTime;

        // Slow 3D Y-axis rotation (left-right swing)
        this.rotationAngle = Math.sin(time * 0.002) * 0.32;
        const cosA = Math.cos(this.rotationAngle);
        const sinA = Math.sin(this.rotationAngle);

        // Gentle X-axis tilt (up-down nod)
        const tiltAngle = Math.sin(time * 0.0015 + 1) * 0.18;
        const cosT = Math.cos(tiltAngle);
        const sinT = Math.sin(tiltAngle);

        this.particles.forEach(p => {
            const breathe = Math.sin(time * 0.004 + p.phase) * 1.5;

            let bx = p.targetX - this.centerX;
            let by = p.targetY - this.centerY;
            let bz = p.targetZ * 60;

            // Y-axis rotation
            const rx = bx * cosA + bz * sinA;
            const rz = -bx * sinA + bz * cosA;

            // X-axis tilt
            const ry = by * cosT - rz * sinT;
            const rz2 = by * sinT + rz * cosT;

            // Perspective projection
            const perspective = 620;
            const scale3d = perspective / (perspective + rz2);

            p.x = this.centerX + rx * scale3d + breathe;
            p.y = this.centerY + ry * scale3d + Math.cos(time * 0.003 + p.phase) * 1;
            p.z = rz2;

            p.renderSize = p.size * scale3d;
            p.alpha = 0.6 + 0.4 * scale3d;
        });
    }

    // ---- PHASE 4: Dissolve + transition ----
    updateDissolve(dt) {
        const progress = this.easeInOutCubic(Math.min(this.phaseTime / this.phaseDurations[4], 1));

        this.particles.forEach(p => {
            p.x += Math.cos(p.dissolveAngle) * p.dissolveSpeed * progress * dt * 0.08;
            p.y += Math.sin(p.dissolveAngle) * p.dissolveSpeed * progress * dt * 0.08;
            p.alpha = Math.max(0, 1 - progress * 1.2);
        });

        if (!this.transitionStarted) {
            this.transitionStarted = true;
            this.startTransition();
        }
    }

    startTransition() {
        this.loaderEl.classList.add('loader-dissolving');
        setTimeout(() => {
            this.loaderEl.classList.add('hidden');
            document.body.classList.remove('loading-active');
            this.done = true;
            this.cleanup();
        }, 1000);
    }

    cleanup() {
        if (this.animFrame) {
            cancelAnimationFrame(this.animFrame);
            this.animFrame = null;
        }
        this.particles = [];
        this.logoPoints = [];
        this.ambientParticles = [];
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.remove();
        }
    }

    drawSolidLogo(alpha, time) {
        if (!this.logoFaceCanvas || !this.logoSideCanvas || alpha <= 0) return;

        const ctx = this.ctx;
        const w = this.logoDisplaySize;
        const h = this.logoDisplaySize;

        // Keep a base view angle so the extrusion is always visible.
        const yaw = 0.34 + Math.sin(time * 0.0016) * 0.28;
        const pitch = 0.08 + Math.sin(time * 0.0012 + 0.8) * 0.11;
        const depth = 34;
        const sideX = Math.sin(yaw) * depth;
        const sideY = 8 + Math.cos(time * 0.0011) * 1.5;
        const faceScaleX = 1 - Math.abs(Math.sin(yaw)) * 0.16;
        const faceScaleY = 1 - Math.abs(pitch) * 0.08;

        // Ground shadow for depth anchoring.
        ctx.save();
        ctx.globalAlpha = alpha * 0.18;
        ctx.fillStyle = this.isLight ? 'rgba(0,0,40,0.35)' : 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(this.centerX + sideX * 0.35, this.centerY + h * 0.44, w * 0.24, h * 0.09, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Extruded side layers.
        const layerCount = 18;
        for (let i = layerCount; i >= 1; i--) {
            const t = i / layerCount;
            ctx.save();
            ctx.globalAlpha = alpha * (0.08 + t * 0.09);
            ctx.translate(this.centerX, this.centerY);
            ctx.scale(faceScaleX, faceScaleY);
            ctx.drawImage(
                this.logoSideCanvas,
                -w / 2 + sideX * t,
                -h / 2 + sideY * t,
                w,
                h
            );
            ctx.restore();
        }

        // Front face.
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.centerX, this.centerY);
        ctx.scale(faceScaleX, faceScaleY);
        ctx.drawImage(this.logoFaceCanvas, -w / 2, -h / 2, w, h);

        // Animated metallic sheen sweep across the text face.
        if (this.logoSpecCanvas) {
            const shineShift = Math.sin(time * 0.002) * w * 0.08;
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = alpha * 0.32;
            ctx.drawImage(this.logoSpecCanvas, -w / 2 + shineShift, -h / 2, w, h);
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = alpha;
        }
        ctx.restore();

        // End-only faint glow flash (no permanent strong glow).
        let endFlash = 0;
        if (this.phase === 3) {
            const p = this.getPhaseProgress(3);
            if (p > 0.76) {
                endFlash = Math.sin(((p - 0.76) / 0.24) * Math.PI);
            }
        } else if (this.phase === 4) {
            const p = this.getPhaseProgress(4);
            endFlash = Math.max(0, 1 - p * 4.5);
        }

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = alpha * (0.03 + endFlash * 0.2);
        ctx.filter = 'blur(6px)';
        ctx.shadowColor = this.isLight ? 'rgba(0,110,235,0.65)' : 'rgba(0,220,255,0.75)';
        ctx.shadowBlur = 12 + endFlash * 10;
        ctx.translate(this.centerX, this.centerY);
        ctx.scale(faceScaleX, faceScaleY);
        ctx.drawImage(this.logoFaceCanvas, -w / 2, -h / 2, w, h);

        ctx.globalAlpha = alpha * (0.015 + endFlash * 0.1);
        ctx.shadowColor = this.isLight ? 'rgba(90,50,210,0.65)' : 'rgba(110,55,245,0.75)';
        ctx.shadowBlur = 10 + endFlash * 7;
        ctx.drawImage(this.logoFaceCanvas, -w / 2 + 1.5, -h / 2 + 1.5, w, h);
        ctx.filter = 'none';
        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    }

    // =====================
    //   DRAWING
    // =====================
    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear with background color
        ctx.fillStyle = this.colors.bgStr;
        ctx.fillRect(0, 0, w, h);

        // Subtle radial gradient overlay for atmosphere
        const bgGrad = ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, Math.max(w, h) * 0.6
        );
        if (this.isLight) {
            bgGrad.addColorStop(0, 'rgba(0, 120, 255, 0.05)');
            bgGrad.addColorStop(0.5, 'rgba(102, 0, 204, 0.03)');
            bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
            bgGrad.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
            bgGrad.addColorStop(0.5, 'rgba(82, 0, 255, 0.05)');
            bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Ambient background particles (always visible)
        this.drawAmbientParticles(ctx);

        let solidAlpha = 0;
        let particleAlphaScale = 1;
        if (this.phase === 2) {
            const morph = this.easeInOutCubic(this.getPhaseProgress(2));
            solidAlpha = morph;
            particleAlphaScale = Math.max(0, 1 - morph * 1.05);
        } else if (this.phase === 3) {
            solidAlpha = 1;
            particleAlphaScale = 0;
        } else if (this.phase === 4) {
            const d = this.easeInOutCubic(this.getPhaseProgress(4));
            solidAlpha = 1 - d;
            particleAlphaScale = 0;
        }

        if (solidAlpha > 0.01) {
            this.drawSolidLogo(solidAlpha, performance.now());
        }

        // Logo particles only drawn if image has loaded
        if (this.imageLoaded && this.particles.length > 0 && particleAlphaScale > 0.01) {
            // Connection lines only during assembly to keep morph-to-solid clean.
            if (this.phase === 1) {
                this.drawConnections(ctx);
            }

            // Sort by z for depth ordering
            const sorted = [...this.particles].sort((a, b) => (a.z || 0) - (b.z || 0));

            // Trails (phase 0 and early phase 1)
            if (this.phase === 0 || (this.phase === 1 && this.phaseTime < 500)) {
                ctx.lineWidth = 1.2;
                sorted.forEach(p => {
                    if (p.trail.length < 2 || p.alpha <= 0) return;
                    for (let t = 1; t < p.trail.length; t++) {
                        const opacity = (t / p.trail.length) * 0.35 * p.alpha * particleAlphaScale;
                        ctx.strokeStyle = `rgba(${p.r},${p.g},${p.b},${opacity})`;
                        ctx.beginPath();
                        ctx.moveTo(p.trail[t - 1].x, p.trail[t - 1].y);
                        ctx.lineTo(p.trail[t].x, p.trail[t].y);
                        ctx.stroke();
                    }
                });
            }

            // Shadow layer for 3D depth (phase 2)
            if (this.phase >= 2 && this.phase <= 3) {
                sorted.forEach(p => {
                    if (p.alpha <= 0) return;
                    const shadowOffset = ((p.z || 0) / 50) * 5 + 4;
                    const shadowAlpha = 0.1 * p.alpha * particleAlphaScale;
                    ctx.fillStyle = this.isLight
                        ? `rgba(0,0,50,${shadowAlpha})`
                        : `rgba(0,0,0,${shadowAlpha})`;
                    ctx.beginPath();
                    ctx.arc(p.x + shadowOffset, p.y + shadowOffset, (p.renderSize || p.size) * 1.3, 0, Math.PI * 2);
                    ctx.fill();
                });
            }

            // Draw logo particles
            sorted.forEach(p => {
                if (p.alpha <= 0) return;
                const sz = p.renderSize || p.size;

                ctx.save();
                ctx.globalAlpha = Math.min(1, p.alpha * particleAlphaScale);

                // Outer glow
                const glowSize = sz * 3.2;
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
                gradient.addColorStop(0, `rgba(${p.r},${p.g},${p.b},0.5)`);
                gradient.addColorStop(0.4, `rgba(${p.r},${p.g},${p.b},0.12)`);
                gradient.addColorStop(1, `rgba(${p.r},${p.g},${p.b},0)`);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
                ctx.fill();

                // Core particle
                ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},1)`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
                ctx.fill();

                // White shine center
                ctx.fillStyle = `rgba(255,255,255,0.6)`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, sz * 0.32, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            });
        }
    }

    drawAmbientParticles(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const time = performance.now();

        this.ambientParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            const pulseAlpha = p.alpha * (0.6 + 0.4 * Math.sin(time * 0.001 + p.pulse));

            ctx.save();
            ctx.globalAlpha = pulseAlpha;

            // Glow
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
            grad.addColorStop(0, `rgba(${p.r},${p.g},${p.b},0.4)`);
            grad.addColorStop(1, `rgba(${p.r},${p.g},${p.b},0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},1)`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        // Connection lines between close ambient particles
        ctx.lineWidth = 0.4;
        for (let i = 0; i < this.ambientParticles.length; i++) {
            for (let j = i + 1; j < this.ambientParticles.length; j++) {
                const a = this.ambientParticles[i];
                const b = this.ambientParticles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    const opacity = (1 - dist / 130) * 0.15;
                    ctx.strokeStyle = `rgba(${a.r},${a.g},${a.b},${opacity})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
    }

    drawConnections(ctx) {
        const connectionDist = this.phase === 1 ? 18 : 13;
        ctx.lineWidth = 0.6;

        const len = this.particles.length;
        for (let i = 0; i < len; i++) {
            const pi = this.particles[i];
            if (pi.alpha <= 0) continue;
            for (let j = i + 1; j < len; j++) {
                const pj = this.particles[j];
                if (pj.alpha <= 0) continue;
                const dx = pi.x - pj.x;
                if (Math.abs(dx) > connectionDist) continue;
                const dy = pi.y - pj.y;
                if (Math.abs(dy) > connectionDist) continue;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < connectionDist) {
                    const opacity = (1 - dist / connectionDist) * 0.25 * Math.min(pi.alpha, pj.alpha);
                    ctx.strokeStyle = `rgba(${pi.r},${pi.g},${pi.b},${opacity})`;
                    ctx.beginPath();
                    ctx.moveTo(pi.x, pi.y);
                    ctx.lineTo(pj.x, pj.y);
                    ctx.stroke();
                }
            }
        }
    }

    animate() {
        if (this.done || !this.isVisible) return;

        const now = performance.now();

        // Update phases only if image is loaded
        if (this.imageLoaded && this.phase >= 0) {
            const totalElapsed = now - this.startTime;

            let accumulated = 0;
            let currentPhase = this.phaseDurations.length - 1;
            for (let i = 0; i < this.phaseDurations.length; i++) {
                if (totalElapsed < accumulated + this.phaseDurations[i]) {
                    currentPhase = i;
                    break;
                }
                accumulated += this.phaseDurations[i];
            }

            this.phase = currentPhase;
            this.phaseTime = Math.max(0, totalElapsed - accumulated);

            const dt = 16;

            switch (this.phase) {
                case 0: this.updateGather(dt); break;
                case 1: this.updateAssemble(dt); break;
                case 2: this.updateGlow3D(dt); break;
                case 3: this.updateGlow3D(dt); break;
                case 4: this.updateDissolve(dt); break;
            }
        }

        this.draw();
        this.animFrame = requestAnimationFrame(() => this.animate());
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    getPhaseProgress(phaseIndex) {
        if (this.phase !== phaseIndex) return 0;
        return Math.max(0, Math.min(1, this.phaseTime / this.phaseDurations[phaseIndex]));
    }
}

// Initialize
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
