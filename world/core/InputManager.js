// ===================================
// WORLD — INPUT MANAGER
// Unified keyboard + pointer (mouse & touch) input.
// Slice 1: WASD movement, drag-to-look, Shift sprint, Esc to stand.
// A dedicated mobile joystick arrives in a later polish slice; drag-look
// already works with touch here.
// ===================================

export class InputManager {
    constructor(domElement) {
        this.dom = domElement;
        this.enabled = true;

        this.keys = new Set();
        this._look = { dx: 0, dy: 0 };   // accumulated since last consumeLook()
        this._dragging = false;
        this._lastX = 0;
        this._lastY = 0;

        // Pointer position (hover) + click detection.
        this.pointerNDC = { x: 0, y: 0 };
        this.pointerClient = { x: 0, y: 0 };
        this.hasPointer = false;
        this._downX = 0;
        this._downY = 0;
        this._downT = 0;
        this._moved = false;
        this._downValid = false;
        this._pendingClick = null;
        this._pendingDoubleClick = null;
        this._lastClickT = 0;
        this._lastClickPos = { x: 0, y: 0 };

        this.onEscape = null;            // set by WorldApp

        // Bind once so add/removeEventListener match.
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);

        this._attach();
    }

    _attach() {
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
        this.dom.addEventListener('pointerdown', this._onPointerDown);
        window.addEventListener('pointermove', this._onPointerMove);
        window.addEventListener('pointerup', this._onPointerUp);
        this.dom.style.touchAction = 'none'; // stop touch scrolling over the canvas
    }

    dispose() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        this.dom.removeEventListener('pointerdown', this._onPointerDown);
        window.removeEventListener('pointermove', this._onPointerMove);
        window.removeEventListener('pointerup', this._onPointerUp);
    }

    // ---- keyboard ----
    _onKeyDown(e) {
        if (!this.enabled) return;
        const k = e.key.toLowerCase();
        if (k === 'escape') {
            if (typeof this.onEscape === 'function') this.onEscape();
            return;
        }
        this.keys.add(k);
    }

    _onKeyUp(e) {
        this.keys.delete(e.key.toLowerCase());
    }

    // ---- pointer (look) ----
    _onPointerDown(e) {
        if (!this.enabled) return;
        this._dragging = true;
        this._lastX = e.clientX;
        this._lastY = e.clientY;
        this._downX = e.clientX;
        this._downY = e.clientY;
        this._downT = performance.now();
        this._moved = false;
        this._downValid = true;
        this.dom.classList.add('world-grabbing');
    }

    _onPointerMove(e) {
        this.pointerClient.x = e.clientX;
        this.pointerClient.y = e.clientY;
        const ndc = this._toNDC(e.clientX, e.clientY);
        this.pointerNDC.x = ndc.x;
        this.pointerNDC.y = ndc.y;
        this.hasPointer = true;

        if (!this._dragging || !this.enabled) return;
        if (Math.abs(e.clientX - this._downX) > 6 || Math.abs(e.clientY - this._downY) > 6) {
            this._moved = true;
        }
        this._look.dx += e.clientX - this._lastX;
        this._look.dy += e.clientY - this._lastY;
        this._lastX = e.clientX;
        this._lastY = e.clientY;
    }

    _onPointerUp(e) {
        this._dragging = false;
        this.dom.classList.remove('world-grabbing');
        if (!this.enabled || !this._downValid) return;
        this._downValid = false;
        const dt = performance.now() - this._downT;
        if (!this._moved && dt < 450) {
            const ndc = this._toNDC(e.clientX, e.clientY);
            const now = performance.now();
            const isDouble = now - this._lastClickT < 350 &&
                Math.abs(e.clientX - this._lastClickPos.x) < 14 &&
                Math.abs(e.clientY - this._lastClickPos.y) < 14;
            if (isDouble) {
                this._pendingDoubleClick = { x: ndc.x, y: ndc.y };
                this._pendingClick = null; // 2nd click of a double: don't also fire a single
                this._lastClickT = 0;
            } else {
                this._pendingClick = { x: ndc.x, y: ndc.y };
                this._lastClickT = now;
                this._lastClickPos = { x: e.clientX, y: e.clientY };
            }
        }
    }

    // ---- per-frame reads ----

    /** Returns accumulated look delta in pixels and resets it. */
    consumeLook() {
        const out = { dx: this._look.dx, dy: this._look.dy };
        this._look.dx = 0;
        this._look.dy = 0;
        return out;
    }

    /** Returns {x,y} NDC of a click since last frame, or null. */
    consumeClick() {
        const c = this._pendingClick;
        this._pendingClick = null;
        return c;
    }

    /** Returns {x,y} NDC of a double-click since last frame, or null. */
    consumeDoubleClick() {
        const c = this._pendingDoubleClick;
        this._pendingDoubleClick = null;
        return c;
    }

    get isDragging() {
        return this._dragging;
    }

    _toNDC(clientX, clientY) {
        const rect = this.dom.getBoundingClientRect();
        return {
            x: ((clientX - rect.left) / rect.width) * 2 - 1,
            y: -((clientY - rect.top) / rect.height) * 2 + 1,
        };
    }

    /** Normalised movement intent from WASD / arrow keys. */
    getMove() {
        let forward = 0;
        let right = 0;
        if (this.keys.has('w') || this.keys.has('arrowup')) forward += 1;
        if (this.keys.has('s') || this.keys.has('arrowdown')) forward -= 1;
        if (this.keys.has('d') || this.keys.has('arrowright')) right += 1;
        if (this.keys.has('a') || this.keys.has('arrowleft')) right -= 1;
        return { forward, right };
    }

    get sprinting() {
        return this.keys.has('shift');
    }

    /** Clear any held keys (e.g. when switching modes). */
    resetKeys() {
        this.keys.clear();
    }
}
