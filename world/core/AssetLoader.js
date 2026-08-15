// ===================================
// WORLD — ASSET LOADER
// Thin wrapper over the global THREE.GLTFLoader (r128, loaded in index.html)
// and TextureLoader. Adds:
//   - auto-fit + floor/ground alignment for models of unknown scale
//   - progress aggregation across many assets
//   - resilient per-asset loading (a failure resolves to null, never throws)
// ===================================

const THREE = window.THREE;

export class AssetLoader {
    constructor() {
        this.gltf = new THREE.GLTFLoader();
        this.tex = new THREE.TextureLoader();
        this._box = new THREE.Box3();
        this._vec = new THREE.Vector3();
    }

    /** Load a GLB and apply fit/placement. Resolves to a Group (or null on error). */
    loadModel(entry, { groundY = 0 } = {}) {
        return new Promise((resolve) => {
            this.gltf.load(
                entry.url,
                (gltf) => {
                    try {
                        resolve(this._place(gltf.scene, entry, groundY));
                    } catch (err) {
                        console.warn('[World] model place failed:', entry.url, err);
                        resolve(gltf.scene || null);
                    }
                },
                undefined,
                (err) => {
                    console.warn('[World] model load failed:', entry.url, err);
                    resolve(null);
                },
            );
        });
    }

    _place(root, entry, groundY) {
        const group = new THREE.Group();
        group.add(root);

        // Orient first so the footprint accounts for rotation.
        group.rotation.y = entry.rotationY || 0;

        // Auto-scale to the requested dimension(s).
        this._box.setFromObject(group);
        this._box.getSize(this._vec);
        if (entry.fitSize) {
            // Non-uniform scale to explicit target dimensions (e.g. a desk that
            // should be wide but normal-height).
            const s = entry.fitSize;
            group.scale.set(
                s.x ? s.x / (this._vec.x || 1) : 1,
                s.y ? s.y / (this._vec.y || 1) : 1,
                s.z ? s.z / (this._vec.z || 1) : 1,
            );
        } else {
            let scale = 1;
            if (entry.fitWidth) scale = entry.fitWidth / (this._vec.x || 1);
            else if (entry.fitHeight) scale = entry.fitHeight / (this._vec.y || 1);
            else if (entry.fitDepth) scale = entry.fitDepth / (this._vec.z || 1);
            else if (entry.fitMax) scale = entry.fitMax / (Math.max(this._vec.x, this._vec.y, this._vec.z) || 1);
            if (scale !== 1 && isFinite(scale)) group.scale.setScalar(scale);
        }

        // Optional per-axis squash/stretch AFTER the fit (e.g. lower a model's
        // height without touching its footprint). Y is world-up regardless of
        // rotationY, so scaleY reliably changes height.
        if (entry.scaleX) group.scale.x *= entry.scaleX;
        if (entry.scaleY) group.scale.y *= entry.scaleY;
        if (entry.scaleZ) group.scale.z *= entry.scaleZ;

        // Re-measure, then centre on X/Z and place vertically.
        this._box.setFromObject(group);
        const cx = (this._box.min.x + this._box.max.x) / 2;
        const cz = (this._box.min.z + this._box.max.z) / 2;
        group.position.x -= cx;
        group.position.z -= cz;
        if (entry.y !== undefined) {
            // Fixed centre height (wall/ceiling-mounted props).
            const cy = (this._box.min.y + this._box.max.y) / 2;
            group.position.y += entry.y - cy;
        } else {
            group.position.y += groundY - this._box.min.y;
        }

        // Final world position.
        group.position.x += entry.x || 0;
        group.position.z += (entry.z !== undefined ? entry.z : 0);

        group.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = false;
                o.receiveShadow = false;
            }
        });
        return group;
    }

    /** Load a texture with sensible defaults. Resolves to Texture (or null). */
    loadTexture(url, { srgb = false, repeat = 1, wrap = true } = {}) {
        return new Promise((resolve) => {
            this.tex.load(
                url,
                (t) => {
                    if (srgb && 'sRGBEncoding' in THREE) t.encoding = THREE.sRGBEncoding;
                    if (wrap) {
                        t.wrapS = t.wrapT = THREE.RepeatWrapping;
                        t.repeat.set(repeat, repeat);
                    }
                    t.anisotropy = 4;
                    resolve(t);
                },
                undefined,
                (err) => {
                    console.warn('[World] texture load failed:', url, err);
                    resolve(null);
                },
            );
        });
    }

    /**
     * Run a list of async task fns sequentially, reporting fractional progress.
     * @param {Array<() => Promise>} tasks
     * @param {(fraction:number)=>void} onProgress
     */
    async runWithProgress(tasks, onProgress) {
        const total = tasks.length || 1;
        const results = [];
        for (let i = 0; i < tasks.length; i++) {
            results.push(await tasks[i]());
            if (onProgress) onProgress((i + 1) / total);
        }
        return results;
    }
}
