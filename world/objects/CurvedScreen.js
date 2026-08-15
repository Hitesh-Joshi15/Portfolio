// ===================================
// WORLD — CURVED SCREEN
// A gently concave screen surface (a bent plane) with UVs we control, so the
// contact-card texture (and later the OS) maps cleanly onto the curve. Used in
// front of the curved-monitor model.
// ===================================

const THREE = window.THREE;

export function createCurvedScreen(width, height, texture, curvature = 0.05) {
    const geo = new THREE.PlaneGeometry(width, height, 48, 1);
    const pos = geo.attributes.position;
    const half = width / 2 || 1;
    for (let i = 0; i < pos.count; i++) {
        const nx = pos.getX(i) / half; // -1 .. 1
        pos.setZ(i, curvature * nx * nx); // edges bulge toward the viewer (concave)
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    const mat = new THREE.MeshBasicMaterial({
        map: texture || null,
        color: 0xffffff,
        side: THREE.FrontSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.isScreen = true;
    return mesh;
}
