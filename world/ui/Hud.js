// ===================================
// WORLD — HUD (persistent overlay UI)
// Exit pill, sit/stand toggle, control hints. Purely DOM; styled by
// world.css. Communicates with WorldApp via callbacks.
// ===================================

import { State } from '../core/StateMachine.js';

export class Hud {
    constructor(container, { onExit, onToggleMode, onToggleLight }) {
        this.container = container;
        this.onExit = onExit;
        this.onToggleMode = onToggleMode;
        this.onToggleLight = onToggleLight;
        this._hintTimer = null;
        this._build();
    }

    _build() {
        const root = document.createElement('div');
        root.className = 'world-hud';

        // Exit (top-left) — always visible, never trap the user.
        this.exitBtn = document.createElement('button');
        this.exitBtn.className = 'world-pill world-exit';
        this.exitBtn.innerHTML = '<i class="fas fa-arrow-left"></i><span>Exit 3D</span>';
        this.exitBtn.addEventListener('click', () => this.onExit && this.onExit());

        // Mode toggle (bottom-center).
        this.modeBtn = document.createElement('button');
        this.modeBtn.className = 'world-pill world-mode-btn';
        this.modeBtn.addEventListener('click', () => this.onToggleMode && this.onToggleMode());

        // Light switch (top-right).
        this.lightBtn = document.createElement('button');
        this.lightBtn.className = 'world-pill world-light-btn';
        this.lightBtn.addEventListener('click', () => this.onToggleLight && this.onToggleLight());

        // Control legend (bottom-left).
        this.legend = document.createElement('div');
        this.legend.className = 'world-legend';

        // Transient hint (center-top).
        this.hint = document.createElement('div');
        this.hint.className = 'world-hint';

        root.appendChild(this.exitBtn);
        root.appendChild(this.modeBtn);
        root.appendChild(this.lightBtn);
        root.appendChild(this.legend);
        root.appendChild(this.hint);
        this.container.appendChild(root);
        this.root = root;
    }

    /** Update the light-switch label/state. */
    setLightState(on) {
        if (!this.lightBtn) return;
        this.lightBtn.innerHTML = on
            ? '<i class="fas fa-lightbulb"></i><span>Light: On</span>'
            : '<i class="far fa-lightbulb"></i><span>Light: Off</span>';
        this.lightBtn.classList.toggle('is-off', !on);
    }

    /** Update labels + hints for the current state. */
    setState(state) {
        if (state === State.SEATED) {
            this.modeBtn.style.display = '';
            this.legend.style.display = '';
            this.modeBtn.innerHTML = '<i class="fas fa-person-walking"></i><span>Stand Up (Esc)</span>';
            this.legend.innerHTML = 'Drag to look around &nbsp;·&nbsp; click the monitor to use it';
            this.showHint('You\'re seated at the desk — drag to look around, click the monitor, or stand up to explore.');
        } else if (state === State.WALKING) {
            this.modeBtn.style.display = 'none';
            this.legend.style.display = '';
            this.legend.innerHTML = '<b>W A S D</b> move &nbsp;·&nbsp; <b>Shift</b> sprint &nbsp;·&nbsp; drag to look &nbsp;·&nbsp; click the chair to sit';
            this.showHint('Walk with W A S D. Click the chair to sit back down at the desk.');
        } else if (state === State.MONITOR) {
            this.modeBtn.style.display = 'none';
            this.legend.style.display = 'none';
        }
    }

    showHint(text, duration = 4200) {
        this.hint.textContent = text;
        this.hint.classList.add('visible');
        clearTimeout(this._hintTimer);
        this._hintTimer = setTimeout(() => this.hint.classList.remove('visible'), duration);
    }

    dispose() {
        clearTimeout(this._hintTimer);
        this.root?.remove();
    }
}
