// ===================================
// WORLD — MONITOR (object builder)
// The desk monitor: dark bezel + glowing screen + small stand.
// Returns a Group; userData.screen references the screen mesh so the
// interactable can brighten it on hover. Clicking it (Slice 2) dives into
// the portfolio.
// ===================================

import { COLORS } from '../config/theme.js';
import { MONITOR } from '../config/layout.js';
import { createScreenTexture } from './ContactScreen.js';

const THREE = window.THREE;

export function createMonitor() {
    const group = new THREE.Group();

    const bezelMat = new THREE.MeshStandardMaterial({ color: COLORS.monitor, roughness: 0.4, metalness: 0.45 });

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(MONITOR.size.w, MONITOR.size.h, MONITOR.size.d),
        bezelMat,
    );
    group.add(body);

    const screenMat = new THREE.MeshBasicMaterial({ map: createScreenTexture(), color: 0xffffff });
    const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(MONITOR.size.w * 0.92, MONITOR.size.h * 0.86),
        screenMat,
    );
    screen.position.z = MONITOR.size.d / 2 + 0.002;
    group.add(screen);

    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.08), bezelMat);
    stand.position.y = -MONITOR.size.h / 2 - 0.09;
    group.add(stand);

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.03, 0.2), bezelMat);
    base.position.y = -MONITOR.size.h / 2 - 0.18;
    group.add(base);

    group.position.set(MONITOR.position.x, MONITOR.position.y, MONITOR.position.z);
    group.userData.screen = screen;
    return group;
}
