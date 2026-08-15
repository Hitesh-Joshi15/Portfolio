// ===================================
// WORLD — SCREEN VIEW (monitor focus)
// Clicking the monitor dives the camera in, then shows a "PC screen" overlay
// with a contact card (name, photo, contact details). This is the interim
// stand-in for the interactive desktop OS (Slice 5); it deliberately does NOT
// open the classic website. "Back to Room" returns to the seated view.
// ===================================

import { PROFILE } from '../config/profile.js';

export class ScreenView {
    constructor(container, { onBack } = {}) {
        this.container = container; // #world3d
        this.onBack = onBack;
        this._active = false;
        this._overlay = null;
    }

    get isActive() {
        return this._active;
    }

    enter() {
        if (this._active) return;
        this._active = true;
        this._overlay = this._buildOverlay();
        this.container.appendChild(this._overlay);
        requestAnimationFrame(() => this._overlay.classList.add('visible'));
    }

    exit(onDone) {
        if (!this._active) return;
        this._active = false;
        const el = this._overlay;
        this._overlay = null;
        if (el) {
            el.classList.remove('visible');
            setTimeout(() => {
                el.remove();
                if (onDone) onDone();
            }, 360);
        } else if (onDone) {
            onDone();
        }
    }

    _buildOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'world-screen-overlay';

        const card = document.createElement('div');
        card.className = 'world-contact-card';
        card.innerHTML = `
            <div class="wcc-titlebar">
                <span class="wcc-dot red"></span>
                <span class="wcc-dot yellow"></span>
                <span class="wcc-dot green"></span>
                <span class="wcc-title">id_card.exe</span>
            </div>
            <div class="wcc-body">
                <img class="wcc-avatar" src="${PROFILE.avatar}" alt="${PROFILE.name}">
                <div class="wcc-info">
                    <h2 class="wcc-name">${PROFILE.name}</h2>
                    <p class="wcc-role">${PROFILE.role}</p>
                    <p class="wcc-tagline">${PROFILE.tagline}</p>
                    <ul class="wcc-contact">
                        <li><i class="fas fa-envelope"></i> ${PROFILE.email}</li>
                        <li><i class="fas fa-phone"></i> ${PROFILE.phone}</li>
                        <li><i class="fas fa-map-marker-alt"></i> ${PROFILE.location}</li>
                    </ul>
                    <div class="wcc-links">
                        <a href="${PROFILE.github}" target="_blank" rel="noopener"><i class="fab fa-github"></i> GitHub</a>
                        <a href="${PROFILE.linkedin}" target="_blank" rel="noopener"><i class="fab fa-linkedin"></i> LinkedIn</a>
                    </div>
                </div>
            </div>
            <p class="wcc-hint">Full desktop &amp; projects coming soon — this screen becomes an interactive OS.</p>
        `;

        const back = document.createElement('button');
        back.className = 'world-back-to-room';
        back.innerHTML = '<i class="fas fa-arrow-left"></i><span>Back to Room</span>';
        back.addEventListener('click', () => {
            if (this.onBack) this.onBack();
        });

        overlay.appendChild(back);
        overlay.appendChild(card);
        return overlay;
    }

    dispose() {
        if (this._overlay) {
            this._overlay.remove();
            this._overlay = null;
        }
        this._active = false;
    }
}
