// ===================================
// WORLD — INTERACTABLES
// Raycasts the pointer against registered objects to drive hover highlight,
// a floating prompt label, and click dispatch. Reads pointer state from the
// InputManager (single source of truth), so it never fights drag-to-look:
//   pointer move (no button) -> hover
//   pointer down+up, no drag  -> click
//   pointer down+drag         -> look (handled by InputManager)
// Only objects whose `states` include the current state are considered.
// ===================================

const THREE = window.THREE;

export class Interactables {
    constructor(camera, container, getState) {
        this.camera = camera;
        this.container = container;
        this.getState = getState;
        this.items = [];
        this.hovered = null;
        this.raycaster = new THREE.Raycaster();

        this._prompt = document.createElement('div');
        this._prompt.className = 'world-interact-prompt';
        this.container.appendChild(this._prompt);
    }

    /**
     * @param {object} cfg { object3D, prompt, states[], onClick, onHoverEnter, onHoverLeave, highlight }
     */
    register(cfg) {
        cfg.highlight = cfg.highlight !== false;
        cfg._baseScale = cfg.object3D.scale.clone();
        this.items.push(cfg);
        return cfg;
    }

    _activeItems(state) {
        return this.items.filter((i) => !i.states || i.states.includes(state));
    }

    _pick(ndc, state) {
        this.raycaster.setFromCamera(ndc, this.camera);
        let nearest = null;
        let nearestDist = Infinity;
        this._pickPoint = null;
        for (const item of this._activeItems(state)) {
            const hits = this.raycaster.intersectObject(item.object3D, true);
            if (hits.length && hits[0].distance < nearestDist) {
                nearestDist = hits[0].distance;
                nearest = item;
                this._pickPoint = hits[0].point;
            }
        }
        return nearest;
    }

    update(input) {
        const state = this.getState();

        // Double-click first (e.g. opening the sliding door).
        const dbl = input.consumeDoubleClick ? input.consumeDoubleClick() : null;
        if (dbl) {
            const hit = this._pick(dbl, state);
            this._setHover(null, input);
            if (hit && hit.onDoubleClick) hit.onDoubleClick(this._pickPoint);
            return;
        }

        // Click takes priority and is resolved at the click point.
        const click = input.consumeClick ? input.consumeClick() : null;
        if (click) {
            const hit = this._pick(click, state);
            this._setHover(null, input);
            if (hit && hit.onClick) hit.onClick();
            return;
        }

        // No hover while dragging (that's a look) or without a pointer (touch).
        if (input.isDragging || !input.hasPointer) {
            this._setHover(null, input);
            return;
        }

        this._setHover(this._pick(input.pointerNDC, state), input);
    }

    _setHover(item, input) {
        if (this.hovered === item) {
            if (item) this._positionPrompt(input);
            return;
        }

        if (this.hovered) {
            if (this.hovered.highlight) this.hovered.object3D.scale.copy(this.hovered._baseScale);
            if (this.hovered.onHoverLeave) this.hovered.onHoverLeave();
        }

        this.hovered = item;

        if (item) {
            if (item.highlight) item.object3D.scale.copy(item._baseScale).multiplyScalar(1.04);
            if (item.onHoverEnter) item.onHoverEnter();
        }
        if (item && item.prompt) {
            this._prompt.textContent = item.prompt;
            this._prompt.classList.add('visible');
            this._positionPrompt(input);
            document.body.classList.add('world-hovering');
        } else {
            this._prompt.classList.remove('visible');
            document.body.classList.remove('world-hovering');
        }
    }

    _positionPrompt(input) {
        const c = input.pointerClient;
        if (!c) return;
        this._prompt.style.left = `${c.x + 18}px`;
        this._prompt.style.top = `${c.y + 18}px`;
    }

    dispose() {
        if (this.hovered && this.hovered.highlight) {
            this.hovered.object3D.scale.copy(this.hovered._baseScale);
        }
        this.hovered = null;
        this._prompt.remove();
        document.body.classList.remove('world-hovering');
        this.items = [];
    }
}
