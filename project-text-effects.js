// ===================================
// PROJECT TEXT EFFECTS
// 1. Text Reveal on Scroll - per-letter stagger
// 2. Text Morphing - project tags cycle keywords
// ===================================

class ProjectTextEffects {
    constructor() {
        this.revealed = new Set();
        this.morphIntervals = [];
        this.init();
    }

    init() {
        this.setupScrollReveal();
        this.setupTextMorph();
    }

    // =========================================
    // 1. TEXT REVEAL ON SCROLL
    // Descriptions + titles reveal letter by letter
    // =========================================
    setupScrollReveal() {
        const cards = document.querySelectorAll('.project-card');

        cards.forEach(card => {
            const title = card.querySelector('.project-title');
            const desc = card.querySelector('.project-description');
            const tags = card.querySelectorAll('.tag');

            // Split title into chars
            if (title) this.prepRevealElement(title, 'char');
            // Split description into words (chars would be too slow for long text)
            if (desc) this.prepRevealElement(desc, 'word');
            // Tags reveal as whole items
            tags.forEach(tag => tag.classList.add('scroll-reveal-item'));
        });

        // Observe cards
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.revealed.has(entry.target)) {
                    this.revealed.add(entry.target);
                    this.revealCard(entry.target);
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

        cards.forEach(card => observer.observe(card));
    }

    prepRevealElement(el, mode) {
        const text = el.textContent.trim();
        el.innerHTML = '';
        el.classList.add('scroll-reveal-container');

        if (mode === 'char') {
            for (let i = 0; i < text.length; i++) {
                const span = document.createElement('span');
                span.className = 'reveal-unit reveal-char';
                span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
                el.appendChild(span);
            }
        } else {
            // Word mode
            const words = text.split(/\s+/);
            words.forEach((word, wi) => {
                const span = document.createElement('span');
                span.className = 'reveal-unit reveal-word';
                span.textContent = word;
                el.appendChild(span);
                if (wi < words.length - 1) {
                    el.appendChild(document.createTextNode(' '));
                }
            });
        }
    }

    revealCard(card) {
        const units = card.querySelectorAll('.reveal-unit');
        const tags = card.querySelectorAll('.scroll-reveal-item');

        // Stagger reveal chars/words
        units.forEach((unit, i) => {
            const delay = unit.classList.contains('reveal-char')
                ? i * 30   // 30ms per character for titles
                : i * 40;  // 40ms per word for descriptions
            setTimeout(() => unit.classList.add('revealed'), delay);
        });

        // Tags pop in after text
        const tagDelay = units.length * 30 + 100;
        tags.forEach((tag, i) => {
            setTimeout(() => tag.classList.add('revealed'), tagDelay + i * 80);
        });
    }

    // =========================================
    // 2. TEXT MORPHING
    // Each project title morphs between the title
    // and a short tagline when hovered
    // =========================================
    setupTextMorph() {
        const morphData = [
            { sel: 0, alt: 'AI-Powered Recognition' },
            { sel: 1, alt: 'Immersive VR Experience' },
            { sel: 2, alt: '3D Virtual Collaboration' },
            { sel: 3, alt: 'Smart Parking Solution' },
            { sel: 4, alt: 'Creative Web Showcase' },
            { sel: 5, alt: 'Online Shopping Platform' }
        ];

        const titles = document.querySelectorAll('.project-title');

        titles.forEach((title, index) => {
            if (index >= morphData.length) return;

            const original = title.textContent.trim();
            const alternate = morphData[index].alt;
            title.dataset.original = original;
            title.dataset.alternate = alternate;
            title.classList.add('morph-target');

            // Morph on hover
            const card = title.closest('.project-card');
            if (!card) return;

            card.addEventListener('mouseenter', () => {
                this.morphText(title, alternate);
            });

            card.addEventListener('mouseleave', () => {
                this.morphText(title, original);
            });
        });
    }

    morphText(el, newText) {
        // Cancel existing morph
        if (el._morphTimeout) {
            el._morphTimeout.forEach(t => clearTimeout(t));
        }
        el._morphTimeout = [];

        const spans = el.querySelectorAll('.reveal-unit, .morph-char');
        const currentText = Array.from(spans).map(s =>
            s.textContent === '\u00A0' ? ' ' : s.textContent
        ).join('');

        // If already showing this text, skip
        if (currentText.replace(/\s+/g, ' ').trim() === newText.trim()) return;

        // Clear and rebuild with per-char morph
        el.innerHTML = '';
        el.classList.add('morphing');

        const maxLen = Math.max(newText.length, currentText.length);

        for (let i = 0; i < newText.length; i++) {
            const span = document.createElement('span');
            span.className = 'morph-char reveal-unit revealed';
            span.style.display = 'inline-block';

            if (i < currentText.length) {
                // Morph from old char to new char
                span.textContent = currentText[i] === ' ' ? '\u00A0' : currentText[i];
                const t = setTimeout(() => {
                    span.classList.add('morph-flip');
                    const t2 = setTimeout(() => {
                        span.textContent = newText[i] === ' ' ? '\u00A0' : newText[i];
                        span.classList.remove('morph-flip');
                    }, 150);
                    el._morphTimeout.push(t2);
                }, i * 20);
                el._morphTimeout.push(t);
            } else {
                // New chars fade in
                span.textContent = newText[i] === ' ' ? '\u00A0' : newText[i];
                span.style.opacity = '0';
                span.style.transform = 'translateY(10px)';
                const t = setTimeout(() => {
                    span.style.transition = 'opacity 0.3s, transform 0.3s';
                    span.style.opacity = '1';
                    span.style.transform = 'translateY(0)';
                }, i * 20);
                el._morphTimeout.push(t);
            }
            el.appendChild(span);
        }

        // Clean up morphing class
        const done = setTimeout(() => el.classList.remove('morphing'), maxLen * 20 + 300);
        el._morphTimeout.push(done);
    }
}

// Initialize after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.projectTextEffects = new ProjectTextEffects();
    }, 200);
});
