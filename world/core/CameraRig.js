// ===================================
// WORLD — CAMERA RIG
// Owns the camera's yaw/pitch/position and the sit<->stand tween.
// Two modes:
//   seated  — swivel within a limited arc, no walking
//   walking — full look + WASD movement with simple AABB collision
// Uses the global THREE (r128) already loaded by index.html.
// ===================================

import { TUNING } from '../config/theme.js';
import { BOUNDS, BALCONY, OBSTACLES, CAMERA_PRESETS } from '../config/layout.js';

const THREE = window.THREE;

function shortestAngleDelta(from, to) {
    let d = (to - from) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return d;
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class CameraRig {
    constructor(camera) {
        this.camera = camera;
        this.mode = 'seated';
        this.balconyOpen = false; // the sliding door starts closed
        this.doorGapMinZ = 0;     // world-Z span you can pass while the door is open
        this.doorGapMaxZ = 0;

        this.yaw = 0;    // radians, 0 = facing the monitor (-Z)
        this.pitch = 0;
        this.position = new THREE.Vector3();

        // Seated swivel is measured relative to this base yaw.
        this.seatedBaseYaw = 0;

        this._tween = null;
        this._euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this._fwd = new THREE.Vector3();
        this._right = new THREE.Vector3();

        this._applyPreset(CAMERA_PRESETS.seated);
        this._commit();
    }

    get isTweening() {
        return this._tween !== null;
    }

    // ---- public transitions ----
    sit(onComplete) {
        this._startTween(CAMERA_PRESETS.seated, 'seated', onComplete);
    }

    stand(onComplete) {
        this._startTween(CAMERA_PRESETS.standing, 'walking', onComplete);
    }

    focusMonitor(onComplete) {
        this._startTween(CAMERA_PRESETS.monitorFocus, 'monitor', onComplete);
    }

    /** Snap instantly to the (possibly updated) seated preset. */
    reseat() {
        this._tween = null;
        this._applyPreset(CAMERA_PRESETS.seated);
        this.mode = 'seated';
        this._commit();
    }

    // ---- per-frame ----
    update(dt, input) {
        if (this._tween) {
            this._updateTween(dt);
            this._commit();
            return;
        }
        this._applyLook(input);
        if (this.mode === 'walking') this._applyMove(dt, input);
        this._commit();
    }

    // ---- look ----
    _applyLook(input) {
        const look = input.consumeLook();
        if (this.mode !== 'seated' && this.mode !== 'walking') return;
        if (look.dx === 0 && look.dy === 0) return;

        // LOOK DIRECTION — INVERTED (FPS style, changed by request 2026-08-17):
        //   drag right => you look right   drag down => you look down
        // (the camera follows the cursor; the room moves opposite the drag.)
        this.yaw -= look.dx * TUNING.lookSensitivity;
        this.pitch -= look.dy * TUNING.lookSensitivity;
        this.pitch = THREE.MathUtils.clamp(this.pitch, -TUNING.pitchLimit, TUNING.pitchLimit);

        if (this.mode === 'seated') {
            const min = this.seatedBaseYaw - TUNING.seatedYawLimit;
            const max = this.seatedBaseYaw + TUNING.seatedYawLimit;
            this.yaw = THREE.MathUtils.clamp(this.yaw, min, max);
        }
    }

    // ---- movement ----
    _applyMove(dt, input) {
        const mv = input.getMove();
        if (mv.forward === 0 && mv.right === 0) return;

        this._directions();
        const speed = TUNING.walkSpeed * (input.sprinting ? TUNING.sprintMultiplier : 1) * dt;

        let dx = this._fwd.x * mv.forward + this._right.x * mv.right;
        let dz = this._fwd.z * mv.forward + this._right.z * mv.right;
        const len = Math.hypot(dx, dz);
        if (len > 0) {
            // Analog magnitude: half-tilted joystick walks at half speed
            // (keyboard input is always magnitude >= 1, so it's unaffected).
            const mag = Math.min(1, Math.hypot(mv.forward, mv.right));
            dx = (dx / len) * speed * mag;
            dz = (dz / len) * speed * mag;
        }

        // Axis-separated so you slide along walls/desk; the region test keeps you
        // inside the room OR out on the balcony (through the wall opening).
        const tryX = this.position.x + dx;
        if (this._walkable(tryX, this.position.z) && !this._blocked(tryX, this.position.z)) this.position.x = tryX;
        const tryZ = this.position.z + dz;
        if (this._walkable(this.position.x, tryZ) && !this._blocked(this.position.x, tryZ)) this.position.z = tryZ;
    }

    _directions() {
        this._euler.set(0, this.yaw, 0, 'YXZ'); // horizontal only for movement
        this._fwd.set(0, 0, -1).applyEuler(this._euler);
        this._right.set(1, 0, 0).applyEuler(this._euler);
    }

    _walkable(x, z) {
        const p = TUNING.collisionPadding;
        const inRoom = x >= BOUNDS.minX + p && x <= BOUNDS.maxX - p &&
                       z >= BOUNDS.minZ + p && z <= BOUNDS.maxZ - p;
        if (inRoom) return true;
        // The balcony platform is a physical area (only reachable via the door gap).
        const inBalcony = x > BOUNDS.maxX + p && x <= BALCONY.maxX - p &&
                          z >= BALCONY.minZ + p && z <= BALCONY.maxZ - p;
        if (inBalcony) return true;
        // The doorway threshold only lets you through the OPENED section of the door.
        return this.balconyOpen &&
               x > BOUNDS.maxX - p && x <= BOUNDS.maxX + p &&
               z >= this.doorGapMinZ + p && z <= this.doorGapMaxZ - p;
    }

    /** Open/close the door gap for the walker. gapMin/Max = world-Z of the opening. */
    setBalcony(open, gapMinZ = 0, gapMaxZ = 0) {
        this.balconyOpen = !!open;
        this.doorGapMinZ = gapMinZ;
        this.doorGapMaxZ = gapMaxZ;
    }

    _blocked(x, z) {
        const p = TUNING.collisionPadding;
        for (const o of OBSTACLES) {
            if (x > o.minX - p && x < o.maxX + p && z > o.minZ - p && z < o.maxZ + p) return true;
        }
        return false;
    }

    // ---- tween ----
    _startTween(preset, afterMode, onComplete = null) {
        const target = this._presetToYawPitch(preset);
        this._tween = {
            t: 0,
            duration: TUNING.transitionDuration,
            fromPos: this.position.clone(),
            toPos: new THREE.Vector3(preset.position.x, preset.position.y, preset.position.z),
            fromYaw: this.yaw,
            yawDelta: shortestAngleDelta(this.yaw, target.yaw),
            fromPitch: this.pitch,
            toPitch: target.pitch,
            afterMode,
            onComplete,
        };
    }

    _updateTween(dt) {
        const tw = this._tween;
        tw.t = Math.min(1, tw.t + dt / tw.duration);
        const e = easeInOutCubic(tw.t);

        this.position.lerpVectors(tw.fromPos, tw.toPos, e);
        this.yaw = tw.fromYaw + tw.yawDelta * e;
        this.pitch = tw.fromPitch + (tw.toPitch - tw.fromPitch) * e;

        if (tw.t >= 1) {
            this.mode = tw.afterMode;
            if (tw.afterMode === 'seated') this.seatedBaseYaw = this.yaw;
            const done = tw.onComplete;
            this._tween = null;
            if (done) done();
        }
    }

    // ---- helpers ----
    _applyPreset(preset) {
        this.position.set(preset.position.x, preset.position.y, preset.position.z);
        const yp = this._presetToYawPitch(preset);
        this.yaw = yp.yaw;
        this.pitch = yp.pitch;
        this.seatedBaseYaw = yp.yaw;
    }

    _presetToYawPitch(preset) {
        const dir = new THREE.Vector3(
            preset.lookAt.x - preset.position.x,
            preset.lookAt.y - preset.position.y,
            preset.lookAt.z - preset.position.z,
        ).normalize();
        return {
            yaw: Math.atan2(-dir.x, -dir.z),
            pitch: Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1)),
        };
    }

    _commit() {
        this._euler.set(this.pitch, this.yaw, 0, 'YXZ');
        this.camera.quaternion.setFromEuler(this._euler);
        this.camera.position.copy(this.position);
    }
}
