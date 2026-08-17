// ===================================
// WORLD — TOUCH JOYSTICK
// Virtual analog stick for touch devices (movement while WALKING).
// Owns its DOM + pointer capture; InputManager merges .vector into getMove().
// stopPropagation keeps the joystick finger invisible to the look-drag
// handlers on window, so a second finger can drag-look simultaneously.
// ===================================

export class TouchJoystick {
    constructor(container) {
        this.vector = { forward: 0, right: 0 }; // analog, each in [-1, 1]
        this.active = false;
        this._pid = null;
        this._travel = 22; // knob travel radius in px (matches the 64px base)

        this._down = this._down.bind(this);
        this._move = this._move.bind(this);
        this._up = this._up.bind(this);

        this.base = document.createElement('div');
        this.base.className = 'world-joystick';
        this.knob = document.createElement('div');
        this.knob.className = 'world-joystick-knob';
        this.base.appendChild(this.knob);
        container.appendChild(this.base);

        this.base.addEventListener('pointerdown', this._down);
        this.base.addEventListener('pointermove', this._move);
        this.base.addEventListener('pointerup', this._up);
        this.base.addEventListener('pointercancel', this._up);
    }

    _down(e) {
        if (this._pid !== null) return; // one finger owns the stick
        this._pid = e.pointerId;
        this.active = true;
        this.base.classList.add('engaged');
        try { this.base.setPointerCapture(e.pointerId); } catch { /* older browsers */ }
        this._apply(e);
        e.stopPropagation();
        e.preventDefault();
    }

    _move(e) {
        if (e.pointerId !== this._pid) return;
        this._apply(e);
        e.stopPropagation();
    }

    _up(e) {
        if (e.pointerId !== this._pid) return;
        e.stopPropagation();
        this._release();
    }

    _release() {
        this._pid = null;
        this.active = false;
        this.base.classList.remove('engaged');
        this.vector.forward = 0;
        this.vector.right = 0;
        this.knob.style.transform = 'translate(-50%, -50%)';
    }

    _apply(e) {
        const r = this.base.getBoundingClientRect();
        let dx = e.clientX - (r.left + r.width / 2);
        let dy = e.clientY - (r.top + r.height / 2);
        const len = Math.hypot(dx, dy);
        if (len > this._travel) {
            dx = (dx / len) * this._travel;
            dy = (dy / len) * this._travel;
        }
        this.knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

        const nx = dx / this._travel;
        const ny = dy / this._travel;
        if (Math.hypot(nx, ny) < 0.18) { // dead zone — resting finger doesn't drift
            this.vector.forward = 0;
            this.vector.right = 0;
            return;
        }
        this.vector.right = nx;
        this.vector.forward = -ny; // push up = walk forward
    }

    setVisible(v) {
        this.base.classList.toggle('visible', !!v);
        if (!v) this._release(); // never leave a hidden stick "stuck on"
    }

    dispose() {
        this.base.removeEventListener('pointerdown', this._down);
        this.base.removeEventListener('pointermove', this._move);
        this.base.removeEventListener('pointerup', this._up);
        this.base.removeEventListener('pointercancel', this._up);
        this.base.remove();
    }
}
