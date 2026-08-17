// ===================================
// WORLD — LAZY ENTRY POINT
// Imported by world.html (the dedicated 3D room page). Nothing here runs
// until bootWorld() is called, so the classic site pays zero cost.
// ===================================

import { WorldApp } from './core/WorldApp.js';

let app = null;
let activeContainer = null;
let cssInjected = false;

function injectCss() {
    if (cssInjected) return Promise.resolve();
    cssInjected = true;
    return new Promise((resolve) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './world/world.css';
        link.dataset.world = 'true';
        link.onload = () => resolve();
        link.onerror = () => resolve(); // never block boot on a CSS failure
        document.head.appendChild(link);
    });
}

function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function showLoader(container) {
    const el = document.createElement('div');
    el.className = 'world-loader';
    el.innerHTML = `
        <div class="world-loader-title">Entering the Room</div>
        <div class="world-loader-bar"><div class="world-loader-fill"></div></div>
        <div class="world-loader-sub">booting scene…</div>`;
    container.appendChild(el);
    return el;
}

function setLoaderProgress(el, frac) {
    if (!el) return;
    const pct = Math.max(0, Math.min(100, Math.round(frac * 100)));
    const fill = el.querySelector('.world-loader-fill');
    const sub = el.querySelector('.world-loader-sub');
    if (fill) fill.style.width = `${pct}%`;
    if (sub) sub.textContent = `loading… ${pct}%`;
}

function hideLoader(el) {
    if (!el) return;
    el.classList.add('hidden');
    setTimeout(() => el.remove(), 700);
}

/**
 * Boot (or focus) the 3D room inside the given container element.
 * @param {HTMLElement} container
 * @param {{ onExit?: () => void }} [opts] - onExit overrides the default overlay
 *   teardown (used by world.html to navigate back to the classic site).
 */
export async function bootWorld(container, opts = {}) {
    if (app) return app; // already open

    if (!window.THREE) {
        console.error('[World] THREE.js is not loaded — cannot start 3D mode.');
        return null;
    }

    activeContainer = container;
    container.style.display = 'block';

    const loader = showLoader(container);
    await injectCss(); // ensure world.css is applied before we size the scene
    await nextFrame(); // let the loader paint before the (sync) scene build

    try {
        app = new WorldApp(container, { onExit: opts.onExit || closeWorld });
        await app.init((frac) => setLoaderProgress(loader, frac));
    } catch (err) {
        console.error('[World] failed to start:', err);
        hideLoader(loader);
        container.style.display = 'none';
        if (app) { app.dispose?.(); app = null; }
        return null;
    }

    setLoaderProgress(loader, 1);
    setTimeout(() => hideLoader(loader), 350);
    window.__worldApp = app; // debug/test handle
    return app;
}

/** Tear everything down and return to the classic site. */
export function closeWorld() {
    if (app) {
        app.dispose();
        app = null;
        delete window.__worldApp;
    }
    if (activeContainer) {
        activeContainer.innerHTML = '';
        activeContainer.style.display = 'none';
    }
}
