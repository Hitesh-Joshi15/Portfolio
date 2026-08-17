// ===================================
// WORLD — HUD (persistent overlay UI)
// Exit pill, sit/stand toggle, control hints. Purely DOM; styled by
// world.css. Communicates with WorldApp via callbacks.
// ===================================

import { State } from '../core/StateMachine.js';

export class Hud {
    constructor(container, { onExit, onToggleMode, onToggleLight, onToggleJoystick, isTouch = false }) {
        this.container = container;
        this.onExit = onExit;
        this.onToggleMode = onToggleMode;
        this.onToggleLight = onToggleLight;
        this.onToggleJoystick = onToggleJoystick;
        this.isTouch = isTouch;
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

        // Joystick toggle (top-right, under the light switch).
        this.joystickBtn = document.createElement('button');
        this.joystickBtn.className = 'world-pill world-joystick-btn';
        this.joystickBtn.addEventListener('click', () => this.onToggleJoystick && this.onToggleJoystick());

        // Control legend (bottom-left).
        this.legend = document.createElement('div');
        this.legend.className = 'world-legend';

        // Transient hint (center-top).
        this.hint = document.createElement('div');
        this.hint.className = 'world-hint';

        // Rotate-to-landscape overlay — CSS shows it only on portrait touch devices.
        this.rotate = document.createElement('div');
        this.rotate.className = 'world-rotate';
        this.rotate.innerHTML = `
            <i class="fas fa-mobile-screen-button"></i>
            <p>Rotate your device</p>
            <span>The room plays best in landscape.</span>`;
        const rotateExit = document.createElement('button');
        rotateExit.className = 'world-pill world-rotate-exit';
        rotateExit.innerHTML = '<i class="fas fa-arrow-left"></i><span>Exit 3D</span>';
        rotateExit.addEventListener('click', () => this.onExit && this.onExit());
        this.rotate.appendChild(rotateExit);

        root.appendChild(this.exitBtn);
        root.appendChild(this.modeBtn);
        root.appendChild(this.lightBtn);
        root.appendChild(this.joystickBtn);
        root.appendChild(this.legend);
        root.appendChild(this.hint);
        root.appendChild(this.rotate);
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

    /** Update the joystick-toggle label/state. */
    setJoystickState(on) {
        if (!this.joystickBtn) return;
        this.joystickOn = on;
        this.joystickBtn.innerHTML = on
            ? '<i class="fas fa-gamepad"></i><span>Joystick: On</span>'
            : '<i class="fas fa-gamepad"></i><span>Joystick: Off</span>';
        this.joystickBtn.classList.toggle('is-off', !on);
        if (this._lastState === State.WALKING) this.legend.innerHTML = this._walkingLegend();
    }

    _walkingLegend() {
        if (this.joystickOn) {
            return this.isTouch
                ? '<b>Joystick</b> to walk &nbsp;·&nbsp; drag to look &nbsp;·&nbsp; tap the chair to sit'
                : '<b>W A S D</b> or <b>joystick</b> to move &nbsp;·&nbsp; drag to look &nbsp;·&nbsp; click the chair to sit';
        }
        return this.isTouch
            ? 'Joystick is off — toggle it on (top right) to walk &nbsp;·&nbsp; tap the chair to sit'
            : '<b>W A S D</b> move &nbsp;·&nbsp; <b>Shift</b> sprint &nbsp;·&nbsp; drag to look &nbsp;·&nbsp; click the chair to sit';
    }

    /** Update labels + hints for the current state. */
    setState(state) {
        this._lastState = state;
        if (state === State.SEATED) {
            this.modeBtn.style.display = '';
            this.legend.style.display = '';
            this.joystickBtn.style.display = '';
            this.modeBtn.innerHTML = this.isTouch
                ? '<i class="fas fa-person-walking"></i><span>Stand Up</span>'
                : '<i class="fas fa-person-walking"></i><span>Stand Up (Esc)</span>';
            this.legend.innerHTML = this.isTouch
                ? 'Drag to look around &nbsp;·&nbsp; tap the monitor to use it'
                : 'Drag to look around &nbsp;·&nbsp; click the monitor to use it';
            this.showHint(this.isTouch
                ? 'You\'re seated at the desk — drag to look around, tap the monitor, or stand up to explore.'
                : 'You\'re seated at the desk — drag to look around, click the monitor, or stand up to explore.');
        } else if (state === State.WALKING) {
            this.modeBtn.style.display = 'none';
            this.legend.style.display = '';
            this.joystickBtn.style.display = '';
            this.legend.innerHTML = this._walkingLegend();
            this.showHint(this.isTouch
                ? (this.joystickOn
                    ? 'Use the joystick to walk around. Tap the chair to sit back down.'
                    : 'Tap the Joystick button (top right) to enable walking controls.')
                : 'Walk with W A S D. Click the chair to sit back down at the desk.');
        } else if (state === State.MONITOR) {
            this.modeBtn.style.display = 'none';
            this.legend.style.display = 'none';
            this.joystickBtn.style.display = 'none';
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
