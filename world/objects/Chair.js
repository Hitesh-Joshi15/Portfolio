// ===================================
// WORLD — CHAIR (object builder)
// Placeholder desk chair (seat + back + post + base). Clicking it while
// walking (Slice 2) sits you back down at the desk.
// ===================================

import { COLORS } from '../config/theme.js';
import { CHAIR } from '../config/layout.js';

const THREE = window.THREE;

export function createChair() {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.chair, roughness: 0.7, metalness: 0.15 });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.6), mat);
    seat.position.y = 0.5;
    group.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.1), mat);
    back.position.set(0, 0.85, 0.28);
    group.add(back);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 12), mat);
    post.position.y = 0.28;
    group.add(post);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 16), mat);
    base.position.y = 0.06;
    group.add(base);

    group.position.set(CHAIR.position.x, 0, CHAIR.position.z);
    return group;
}
