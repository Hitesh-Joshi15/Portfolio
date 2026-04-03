// ===================================
// TEXT REPEL EFFECT - Cursor Proximity
// Characters displace when cursor hovers near them
// + MAGNETIC TEXT - Characters pull toward cursor
// ===================================

class TextRepel {
    constructor() {
        this.mouseX = -1000;
        this.mouseY = -1000;
        this.chars = [];
        this.radius = 80;        // Repel radius in px
        this.strength = 35;      // Max displacement in px
        this.ease = 0.12;        // Return-to-origin easing
        this.rafId = null;

        this.init();
    }

    init() {
        // Split target elements into individual characters
        this.splitTargets();

        // Split magnetic targets
        this.splitMagneticTargets();

        // Use a single mousemove listener (shares with existing cursor.js)
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // On mouse leaving the viewport, reset
        document.addEventListener('mouseleave', () => {
            this.mouseX = -1000;
            this.mouseY = -1000;
        });

        // Start the animation loop
        this.animate();

        // Re-split on window resize (positions change)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => this.recalcPositions(), 200);
        });
    }

    splitTargets() {
        // Target the hero title and all section titles
        const selectors = [
            '.hero-title.glitch',
            '.section-title'
        ];

        const elements = document.querySelectorAll(selectors.join(', '));

        elements.forEach(el => {
            // Skip if already split
            if (el.dataset.repelSplit) return;
            el.dataset.repelSplit = 'true';

            const text = el.textContent;

            // For glitch elements, preserve the data-text attribute for CSS ::before/::after
            const dataText = el.getAttribute('data-text');

            el.innerHTML = '';
            el.classList.add('text-repel-target');

            for (let i = 0; i < text.length; i++) {
                const span = document.createElement('span');
                span.className = 'repel-char';
                span.textContent = text[i] === ' ' ? '\u00A0' : text[i]; // preserve spaces
                span.style.display = 'inline-block';
                span.style.transition = 'none'; // We animate via JS
                el.appendChild(span);

                this.chars.push({
                    el: span,
                    currentX: 0,
                    currentY: 0,
                    targetX: 0,
                    targetY: 0,
                    mode: el.classList.contains('glitch') ? 'repel-hero' : 'repel'
                });
            }

            // Restore data-text so glitch CSS pseudo-elements still work
            if (dataText) {
                el.setAttribute('data-text', dataText);
            }
        });
    }

    recalcPositions() {
        // Positions are recalculated every frame via getBoundingClientRect,
        // so nothing needed here. But we can force a layout refresh if needed.
    }

    splitMagneticTargets() {
        // Target text inside the About Me terminal body
        const terminalBody = document.querySelector('.about-text .terminal-body');
        if (!terminalBody) return;

        // Split text nodes in terminal-output paragraphs and terminal-list items
        const targets = terminalBody.querySelectorAll('.terminal-output, .terminal-list li');

        targets.forEach(el => {
            if (el.dataset.magneticSplit) return;
            el.dataset.magneticSplit = 'true';
            el.classList.add('magnetic-text-target');

            // For list items, preserve the icon
            const icon = el.querySelector('i');
            const text = el.textContent.trim();

            el.innerHTML = '';

            if (icon) {
                el.appendChild(icon);
                const textOnly = text.replace(icon.textContent || '', '').trim();
                this._splitWordsInto(el, textOnly);
            } else {
                this._splitWordsInto(el, text);
            }
        });
    }

    _splitWordsInto(parent, text) {
        // Split by words to preserve natural word wrapping
        const words = text.split(/\s+/);
        words.forEach((word, wi) => {
            const span = document.createElement('span');
            span.className = 'magnetic-char';
            span.textContent = word;
            span.style.display = 'inline-block';
            parent.appendChild(span);

            this.chars.push({
                el: span,
                currentX: 0,
                currentY: 0,
                targetX: 0,
                targetY: 0,
                mode: 'magnetic'
            });

            // Add a real space text node between words (allows natural wrapping)
            if (wi < words.length - 1) {
                parent.appendChild(document.createTextNode(' '));
            }
        });
    }

    animate() {
        this.rafId = requestAnimationFrame(() => this.animate());

        const magneticRadius = 120;
        const magneticStrength = 20;
        const magneticEase = 0.08;

        // Hero title gets stronger repulsion due to larger text size
        const heroRadius = 150;
        const heroStrength = 60;

        for (let i = 0; i < this.chars.length; i++) {
            const char = this.chars[i];
            const rect = char.el.getBoundingClientRect();

            // Center of the character
            const charCenterX = rect.left + rect.width / 2;
            const charCenterY = rect.top + rect.height / 2;

            // Vector from mouse to character
            const dx = charCenterX - this.mouseX;
            const dy = charCenterY - this.mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const isMagnetic = char.mode === 'magnetic';
            const isHero = char.mode === 'repel-hero';
            const radius = isMagnetic ? magneticRadius : (isHero ? heroRadius : this.radius);
            const strength = isMagnetic ? magneticStrength : (isHero ? heroStrength : this.strength);
            const ease = isMagnetic ? magneticEase : this.ease;

            if (dist < radius) {
                const force = (1 - dist / radius) * strength;
                const angle = Math.atan2(dy, dx);

                if (isMagnetic) {
                    // Pull TOWARD cursor (negative direction)
                    char.targetX = -Math.cos(angle) * force;
                    char.targetY = -Math.sin(angle) * force;
                } else {
                    // Push AWAY from cursor
                    char.targetX = Math.cos(angle) * force;
                    char.targetY = Math.sin(angle) * force;
                }
            } else {
                char.targetX = 0;
                char.targetY = 0;
            }

            // Ease toward target
            char.currentX += (char.targetX - char.currentX) * ease;
            char.currentY += (char.targetY - char.currentY) * ease;

            // Snap to zero when close enough (avoid micro-transforms)
            if (Math.abs(char.currentX) < 0.1 && Math.abs(char.currentY) < 0.1 &&
                char.targetX === 0 && char.targetY === 0) {
                char.currentX = 0;
                char.currentY = 0;
                char.el.style.transform = '';
            } else {
                char.el.style.transform = `translate(${char.currentX}px, ${char.currentY}px)`;
            }
        }
    }

    destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }
}

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure other scripts have set up the DOM
    setTimeout(() => {
        window.textRepel = new TextRepel();
    }, 100);
});
