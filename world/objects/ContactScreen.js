// ===================================
// WORLD — CONTACT SCREEN TEXTURE
// Draws a "PC boot / id card" onto a canvas and returns it as a CanvasTexture
// for the monitor's screen, so the desk display shows who this is instead of a
// blank glow. The avatar loads async and triggers a redraw. This is the static
// stand-in for the interactive desktop OS (Slice 5).
// ===================================

import { PROFILE } from '../config/profile.js';

const THREE = window.THREE;

export function createScreenTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 536;
    const ctx = canvas.getContext('2d');

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    if ('sRGBEncoding' in THREE) texture.encoding = THREE.sRGBEncoding;

    const state = { avatar: null };

    const dot = (x, y, r, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    };

    const initials = (name) =>
        name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

    function draw() {
        const w = canvas.width;
        const h = canvas.height;

        const bg = ctx.createLinearGradient(0, 0, w, h);
        bg.addColorStop(0, '#0a0a12');
        bg.addColorStop(1, '#161228');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(0,240,255,0.55)';
        ctx.lineWidth = 6;
        ctx.strokeRect(14, 14, w - 28, h - 28);

        // window chrome
        dot(48, 50, 9, '#ff5f56');
        dot(78, 50, 9, '#ffbd2e');
        dot(108, 50, 9, '#27c93f');
        ctx.fillStyle = 'rgba(184,184,209,0.85)';
        ctx.font = "500 22px 'Share Tech Mono', monospace";
        ctx.textAlign = 'right';
        ctx.fillText('~/hitesh — id_card', w - 44, 58);

        // avatar
        const cx = 180;
        const cy = 270;
        const r = 96;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        if (state.avatar) {
            ctx.drawImage(state.avatar, cx - r, cy - r, r * 2, r * 2);
        } else {
            ctx.fillStyle = '#5200ff';
            ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.font = "700 82px 'Orbitron', sans-serif";
            ctx.fillText(initials(PROFILE.name), cx, cy + 28);
        }
        ctx.restore();
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.stroke();

        // text block
        const tx = 320;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = "700 58px 'Orbitron', sans-serif";
        ctx.fillText(PROFILE.name, tx, 200);
        ctx.fillStyle = '#00f0ff';
        ctx.font = "600 30px 'Rajdhani', sans-serif";
        ctx.fillText(PROFILE.role, tx, 246);
        ctx.fillStyle = 'rgba(184,184,209,0.95)';
        ctx.font = "400 24px 'Rajdhani', sans-serif";
        ctx.fillText(PROFILE.tagline, tx, 284);

        ctx.font = "400 25px 'Share Tech Mono', monospace";
        ctx.fillStyle = '#cfe9ff';
        const lines = [
            `email:    ${PROFILE.email}`,
            `phone:    ${PROFILE.phone}`,
            `location: ${PROFILE.location}`,
        ];
        lines.forEach((t, i) => ctx.fillText(t, tx, 350 + i * 40));

        texture.needsUpdate = true;
    }

    draw();

    // Redraw once web fonts are ready (canvas may have used fallbacks first).
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(draw).catch(() => {});
    }

    // Load the avatar, then redraw with the photo.
    const img = new Image();
    img.onload = () => {
        state.avatar = img;
        draw();
    };
    img.src = PROFILE.avatar;

    return texture;
}
