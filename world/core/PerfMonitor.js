// ===================================
// WORLD — PERF MONITOR
// Samples FPS over the first couple of seconds and classifies a device tier.
// WorldApp uses the tier to cap pixel ratio (and, later, to toggle heavy
// effects). Lightweight — just an averaging window.
// ===================================

export class PerfMonitor {
    constructor({ onTier } = {}) {
        this.onTier = onTier;
        this.tier = 'high';         // 'high' | 'medium' | 'low'
        this._samples = [];
        this._settled = false;
        this._startTime = performance.now();
    }

    /** Call once per frame with the frame delta (seconds). */
    sample(dt) {
        if (this._settled || dt <= 0) return;
        this._samples.push(1 / dt);

        // Decide after ~1.5s of runtime (skip the first few warm-up frames).
        if (performance.now() - this._startTime > 1500 && this._samples.length > 20) {
            this._settle();
        }
    }

    _settle() {
        this._settled = true;
        const usable = this._samples.slice(5); // drop warm-up frames
        const avg = usable.reduce((a, b) => a + b, 0) / (usable.length || 1);
        if (avg < 25) this.tier = 'low';
        else if (avg < 50) this.tier = 'medium';
        else this.tier = 'high';
        if (this.onTier) this.onTier(this.tier, avg);
    }

    get pixelRatioCap() {
        if (this.tier === 'low') return 1;
        if (this.tier === 'medium') return 1.5;
        return 2;
    }
}
