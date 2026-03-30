// ===================================
// CUSTOM CURSOR WITH MULTIPLE STYLES
// ===================================

class CustomCursor {
    constructor() {
        this.cursor = document.querySelector('.cursor');
        this.follower = document.querySelector('.cursor-follower');
        this.particles = [];
        this.maxParticles = 20;
        this.trailInterval = 0;
        this.currentStyle = 'code'; // Options: 'code', 'terminal', 'pixel', 'brackets', 'binary', 'ai', 'datascience', 'robotics', 'hacker', 'security', 'gamedev', 'database', 'cloud', 'quantum', 'blockchain'
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;
        this.followerX = 0;
        this.followerY = 0;
        this.rotation = 0;
        
        this.init();
    }
    
    init() {
        this.applyCursorStyle(this.currentStyle);
        
        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            // Create trail particles at intervals
            this.trailInterval++;
            if (this.trailInterval % 2 === 0) {
                this.createTrailParticle(e.clientX, e.clientY);
            }
        });
        
        // Hover effects for interactive elements
        const hoverElements = document.querySelectorAll('a, button, .project-card, .social-icon, .nav-link, .timeline-card');
        
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.cursor.classList.add('hover');
                this.follower.classList.add('hover');
            });
            
            element.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('hover');
                this.follower.classList.remove('hover');
            });
        });
        
        // Click effect
        document.addEventListener('mousedown', () => {
            this.cursor.classList.add('click');
            this.createClickEffect(this.mouseX, this.mouseY);
        });
        
        document.addEventListener('mouseup', () => {
            this.cursor.classList.remove('click');
        });
        
        // Animate cursor
        this.animate();
        
        // Add keyboard shortcut to cycle cursor styles (Alt + C)
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'c') {
                e.preventDefault();
                this.cycleCursorStyle();
            }
        });
    }
    
    applyCursorStyle(style) {
        // Remove all style classes
        this.cursor.className = 'cursor';
        this.follower.className = 'cursor-follower';
        
        // Apply new style
        this.cursor.classList.add(`cursor-${style}`);
        this.follower.classList.add(`follower-${style}`);
        this.currentStyle = style;
        
        // Update cursor content based on style
        switch(style) {
            case 'code':
                this.cursor.innerHTML = '<span class="cursor-symbol">&lt;/&gt;</span>';
                break;
            case 'terminal':
                this.cursor.innerHTML = '<span class="cursor-symbol">$</span>';
                break;
            case 'pixel':
                this.cursor.innerHTML = '<div class="pixel-grid"></div>';
                break;
            case 'brackets':
                this.cursor.innerHTML = '<span class="cursor-symbol">{}</span>';
                break;
            case 'binary':
                this.cursor.innerHTML = '<span class="cursor-symbol">01</span>';
                break;
            case 'ai':
                this.cursor.innerHTML = '<span class="cursor-symbol">🧠</span>';
                break;
            case 'datascience':
                this.cursor.innerHTML = '<span class="cursor-symbol">📊</span>';
                break;
            case 'robotics':
                this.cursor.innerHTML = '<span class="cursor-symbol">🤖</span>';
                break;
            case 'hacker':
                this.cursor.innerHTML = '<span class="cursor-symbol">💀</span>';
                break;
            case 'security':
                this.cursor.innerHTML = '<span class="cursor-symbol">🛡️</span>';
                break;
            case 'gamedev':
                this.cursor.innerHTML = '<span class="cursor-symbol">🎮</span>';
                break;
            case 'database':
                this.cursor.innerHTML = '<span class="cursor-symbol">💾</span>';
                break;
            case 'cloud':
                this.cursor.innerHTML = '<span class="cursor-symbol">☁️</span>';
                break;
            case 'quantum':
                this.cursor.innerHTML = '<span class="cursor-symbol">⚛️</span>';
                break;
            case 'blockchain':
                this.cursor.innerHTML = '<span class="cursor-symbol">⛓️</span>';
                break;
        }
    }
    
    cycleCursorStyle() {
        const styles = ['code', 'terminal', 'pixel', 'brackets', 'binary', 'ai', 'datascience', 'robotics', 'hacker', 'security', 'gamedev', 'database', 'cloud', 'quantum', 'blockchain'];
        const currentIndex = styles.indexOf(this.currentStyle);
        const nextIndex = (currentIndex + 1) % styles.length;
        this.applyCursorStyle(styles[nextIndex]);
        
        // Show notification
        this.showNotification(`Cursor: ${styles[nextIndex]}`);
    }
    
    showNotification(text) {
        const notification = document.createElement('div');
        notification.className = 'cursor-notification';
        notification.textContent = text;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    createTrailParticle(x, y) {
        if (this.particles.length >= this.maxParticles) {
            const old = this.particles.shift();
            if (old && old.parentNode) old.remove();
        }
        
        const particle = document.createElement('div');
        particle.className = 'cursor-trail-particle';
        
        // Different particle styles based on cursor type
        let content = '';
        let extraClass = '';
        
        switch(this.currentStyle) {
            case 'code':
                content = ['&lt;', '/', '&gt;', '!', '=', ';'][Math.floor(Math.random() * 6)];
                extraClass = 'code-particle';
                break;
            case 'terminal':
                content = ['$', '#', '>', '~', '*', '_'][Math.floor(Math.random() * 6)];
                extraClass = 'terminal-particle';
                break;
            case 'pixel':
                content = '■';
                extraClass = 'pixel-particle';
                break;
            case 'brackets':
                content = ['{', '}', '[', ']', '(', ')'][Math.floor(Math.random() * 6)];
                extraClass = 'brackets-particle';
                break;
            case 'binary':
                content = Math.random() > 0.5 ? '1' : '0';
                extraClass = 'binary-particle';
                break;
            case 'ai':
                content = ['λ', '∑', 'Σ', 'θ', 'α', '∞'][Math.floor(Math.random() * 6)];
                extraClass = 'ai-particle';
                break;
            case 'datascience':
                content = ['📈', '📉', '🔢', '∑', 'μ', 'σ'][Math.floor(Math.random() * 6)];
                extraClass = 'datascience-particle';
                break;
            case 'robotics':
                content = ['⚙️', '🔧', '⚡', '🔩', '●', '○'][Math.floor(Math.random() * 6)];
                extraClass = 'robotics-particle';
                break;
            case 'hacker':
                content = ['☠', '*', '#', '@', '!', 'X'][Math.floor(Math.random() * 6)];
                extraClass = 'hacker-particle';
                break;
            case 'security':
                content = ['🔒', '🔓', '🔑', '✓', '✗', '▲'][Math.floor(Math.random() * 6)];
                extraClass = 'security-particle';
                break;
            case 'gamedev':
                content = ['★', '♦', '♠', '♥', '♣', '●'][Math.floor(Math.random() * 6)];
                extraClass = 'gamedev-particle';
                break;
            case 'database':
                content = ['█', '▓', '▒', '░', '■', '□'][Math.floor(Math.random() * 6)];
                extraClass = 'database-particle';
                break;
            case 'cloud':
                content = ['☁', '~', '≈', '∿', '◯', '○'][Math.floor(Math.random() * 6)];
                extraClass = 'cloud-particle';
                break;
            case 'quantum':
                content = ['⟩', '⟨', '|', '⊗', '⊕', '∅'][Math.floor(Math.random() * 6)];
                extraClass = 'quantum-particle';
                break;
            case 'blockchain':
                content = ['◆', '◇', '▪', '▫', '■', '□'][Math.floor(Math.random() * 6)];
                extraClass = 'blockchain-particle';
                break;
        }
        
        particle.classList.add(extraClass);
        particle.innerHTML = `<span>${content}</span>`;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        // Random slight offset for more natural look
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;
        particle.style.setProperty('--offset-x', `${offsetX}px`);
        particle.style.setProperty('--offset-y', `${offsetY}px`);
        
        document.body.appendChild(particle);
        this.particles.push(particle);
        
        setTimeout(() => {
            if (particle.parentNode) particle.remove();
            this.particles = this.particles.filter(p => p !== particle);
        }, 1200);
    }
    
    createClickEffect(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'cursor-click-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        document.body.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    animate() {
        // Smooth cursor movement
        this.cursorX += (this.mouseX - this.cursorX) * 0.25;
        this.cursorY += (this.mouseY - this.cursorY) * 0.25;
        
        this.followerX += (this.mouseX - this.followerX) * 0.08;
        this.followerY += (this.mouseY - this.followerY) * 0.08;
        
        // Subtle rotation for dynamic effect
        this.rotation += 0.5;
        
        // Update cursor position
        this.cursor.style.transform = `translate(${this.cursorX}px, ${this.cursorY}px) rotate(${this.rotation}deg)`;
        this.follower.style.transform = `translate(${this.followerX}px, ${this.followerY}px)`;
        
        requestAnimationFrame(() => this.animate());
    }
}

// Add advanced cursor styles
const style = document.createElement('style');
style.textContent = `
    /* Base cursor styles */
    .cursor-symbol {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-family: var(--font-mono);
        font-weight: bold;
        font-size: 12px;
        line-height: 1;
        letter-spacing: -0.5px;
    }
    
    /* Code cursor style */
    .cursor-code {
        width: 18px;
        height: 18px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--bg-primary);
        box-shadow: 0 0 20px var(--primary-color);
        overflow: hidden;
    }
    
    .cursor-code .cursor-symbol {
        font-size: 10px;
    }
    
    /* Terminal cursor style */
    .cursor-terminal {
        width: 18px;
        height: 18px;
        background: var(--primary-color);
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--bg-primary);
        box-shadow: 0 0 20px var(--primary-color);
        animation: terminalBlink 1s ease-in-out infinite;
        overflow: hidden;
    }
    
    .cursor-terminal .cursor-symbol {
        font-size: 14px;
        font-weight: 900;
    }
    
    @keyframes terminalBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    /* Pixel cursor style */
    .cursor-pixel {
        width: 18px;
        height: 18px;
        background: var(--primary-color);
        box-shadow: 
            0 0 0 2px var(--secondary-color),
            0 0 20px var(--primary-color);
    }
    
    /* Brackets cursor style */
    .cursor-brackets {
        width: 18px;
        height: 18px;
        background: transparent;
        border: 2px solid var(--primary-color);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
        box-shadow: 0 0 20px var(--primary-color);
        overflow: hidden;
    }
    
    .cursor-brackets .cursor-symbol {
        font-size: 10px;
        letter-spacing: -1px;
    }
    
    /* Binary cursor style */
    .cursor-binary {
        width: 18px;
        height: 18px;
        background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--bg-primary);
        box-shadow: 0 0 20px var(--accent-color);
        overflow: hidden;
    }
    
    .cursor-binary .cursor-symbol {
        font-size: 10px;
        font-weight: 900;
        letter-spacing: -1px;
    }
    
    /* AI cursor style */
    .cursor-ai {
        width: auto;
        height: auto;
        background: transparent;
        border-radius: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: none;
        font-size: 18px;
    }
    
    .cursor-ai span {
        filter: drop-shadow(0 0 8px #ff00ff) drop-shadow(0 0 16px #00ffff);
    }
    
    /* Data Science cursor style */
    .cursor-datascience {
        width: auto;
        height: auto;
        background: transparent;
        border-radius: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: none;
        font-size: 18px;
    }
    
    .cursor-datascience span {
        filter: drop-shadow(0 0 8px #0066ff);
    }
    
    /* Robotics cursor style */
    .cursor-robotics {
        width: auto;
        height: auto;
        background: transparent;
        border-radius: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: none;
        font-size: 18px;
    }
    
    .cursor-robotics span {
        filter: drop-shadow(0 0 8px #ff6b00);
    }
    
    /* Hacker cursor style */
    .cursor-hacker {
        width: auto;
        height: auto;
        background: transparent;
        border-radius: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: none;
        font-size: 18px;
    }
    
    .cursor-hacker span {
        filter: drop-shadow(0 0 10px #00ff00);
    }
    
    /* Security cursor style */
    .cursor-security {
        width: auto;
        height: auto;
        background: transparent;
        border-radius: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: none;
        font-size: 18px;
    }
    
    .cursor-security span {
        filter: drop-shadow(0 0 8px #ffd700);
    }
    
    /* Game Dev cursor style */
    .cursor-gamedev {
        width: auto;
        height: auto;
        background: transparent;
        border-radius: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: none;
        font-size: 18px;
    }
    
    .cursor-gamedev span {
        filter: drop-shadow(0 0 10px #ff00ff);
    }
    
    /* Database cursor style */
    .cursor-database {
        width: auto;
        height: auto;
        background: transparent;
        border-radius: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: none;
        font-size: 18px;
    }
    
    .cursor-database span {
        filter: drop-shadow(0 0 8px #6633ff);
    }
    
    /* Cloud cursor style */
    .cursor-cloud {
        width: auto;
        height: auto;
        background: transparent;
        border-radius: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: none;
        font-size: 18px;
    }
    
    .cursor-cloud span {
        filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
    }
    
    /* Quantum cursor style */
    .cursor-quantum {
        width: auto;
        height: auto;
        background: transparent;
        border-radius: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: none;
        font-size: 20px;
    }
    
    .cursor-quantum span {
        filter: drop-shadow(0 0 10px #00ffff) drop-shadow(0 0 20px #ff00ff);
    }
    
    /* Blockchain cursor style */
    .cursor-blockchain {
        width: auto;
        height: auto;
        background: transparent;
        border-radius: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: none;
        font-size: 20px;
    }
    
    .cursor-blockchain span {
        filter: drop-shadow(0 0 8px #f7931a);
    }
        transform: rotate(45deg);
    }
    
    .cursor-blockchain .cursor-symbol {
        transform: rotate(-45deg);
    }
    
    /* Hover state */
    .cursor.hover {
        transform: scale(1.5) !important;
    }
    
    /* Click state */
    .cursor.click {
        transform: scale(0.8) !important;
    }
    
    /* Follower styles */
    .cursor-follower {
        border-radius: 50%;
        border: 2px solid var(--primary-color);
        opacity: 0.6;
    }
    
    .follower-code,
    .follower-terminal,
    .follower-binary {
        border-color: var(--primary-color);
    }
    
    .follower-pixel {
        border-color: var(--secondary-color);
        border-style: dashed;
    }
    
    .follower-brackets {
        border-radius: 8px;
        border-color: var(--accent-color);
    }
    
    .follower-ai {
        border-color: #ff00ff;
        border-width: 3px;
        background: radial-gradient(circle, rgba(255,0,255,0.1), transparent);
    }
    
    .follower-datascience {
        border-color: #00d4ff;
        border-style: dotted;
        border-width: 2px;
    }
    
    .follower-robotics {
        border-color: #ff6b00;
        border-radius: 10px;
    }
    
    .follower-hacker {
        border-color: #00ff00;
        border-style: dashed;
        animation: matrixRotate 4s linear infinite;
    }
    
    @keyframes matrixRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .follower-security {
        border-color: #ffd700;
        border-radius: 10px;
        border-width: 3px;
    }
    
    .follower-gamedev {
        border-color: #ff00ff;
        border-width: 3px;
    }
    
    .follower-database {
        border-color: #6633ff;
        border-radius: 8px;
    }
    
    .follower-cloud {
        border-color: #ffffff;
        border-style: dotted;
        opacity: 0.8;
    }
    
    .follower-quantum {
        border-color: #00ffff;
        border-width: 2px;
        background: radial-gradient(circle, rgba(0,255,255,0.1), rgba(255,0,255,0.1));
    }
    
    .follower-blockchain {
        border-color: #f7931a;
        border-radius: 5px;
        transform: rotate(45deg);
    }
    
    /* Enhanced Trail Particles */
    .cursor-trail-particle {
        position: fixed;
        pointer-events: none;
        z-index: 9998;
        font-family: var(--font-mono);
        font-weight: bold;
        transform: translate(-50%, -50%);
        animation: trailFadeEnhanced 1.2s ease-out forwards;
    }
    
    .cursor-trail-particle span {
        display: block;
        font-size: 18px;
        text-shadow: 0 0 10px currentColor;
    }
    
    .code-particle span {
        color: var(--primary-color);
        text-shadow: 0 0 15px var(--primary-color), 0 0 30px var(--primary-color);
    }
    
    .terminal-particle span {
        color: #00ff00;
        text-shadow: 0 0 15px #00ff00, 0 0 30px #00ff00;
    }
    
    .pixel-particle span {
        color: var(--secondary-color);
        font-size: 16px;
        text-shadow: 0 0 15px var(--secondary-color);
    }
    
    .brackets-particle span {
        color: var(--accent-color);
        text-shadow: 0 0 15px var(--accent-color), 0 0 30px var(--accent-color);
    }
    
    .binary-particle span {
        color: #00f0ff;
        text-shadow: 0 0 15px #00f0ff, 0 0 30px #00f0ff;
        font-size: 16px;
    }
    
    .ai-particle span {
        color: #ff00ff;
        text-shadow: 0 0 20px #ff00ff, 0 0 40px #00ffff;
        font-size: 18px;
    }
    
    .datascience-particle span {
        color: #00d4ff;
        text-shadow: 0 0 15px #00d4ff, 0 0 30px #0066ff;
        font-size: 17px;
    }
    
    .robotics-particle span {
        color: #ff6b00;
        text-shadow: 0 0 15px #ff6b00, 0 0 30px #ffa500;
        font-size: 16px;
    }
    
    .hacker-particle span {
        color: #00ff00;
        text-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00;
        font-size: 16px;
        animation: matrixFlicker 0.1s infinite;
    }
    
    @keyframes matrixFlicker {
        0%, 50%, 100% { opacity: 1; }
        25%, 75% { opacity: 0.7; }
    }
    
    .security-particle span {
        color: #ffd700;
        text-shadow: 0 0 15px #ffd700, 0 0 30px #ff6b00;
        font-size: 16px;
    }
    
    .gamedev-particle span {
        color: #ff00ff;
        text-shadow: 0 0 20px #ff00ff, 0 0 40px #ff0066;
        font-size: 18px;
    }
    
    .database-particle span {
        color: #6633ff;
        text-shadow: 0 0 15px #6633ff, 0 0 30px #3300ff;
        font-size: 16px;
    }
    
    .cloud-particle span {
        color: #ffffff;
        text-shadow: 0 0 15px #ffffff, 0 0 30px #ccccff;
        font-size: 17px;
    }
    
    .quantum-particle span {
        color: #00ffff;
        text-shadow: 0 0 20px #00ffff, 0 0 40px #ff00ff;
        font-size: 16px;
        animation: quantumBlink 0.5s ease-in-out infinite;
    }
    
    @keyframes quantumBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
    }
    
    .blockchain-particle span {
        color: #f7931a;
        text-shadow: 0 0 15px #f7931a, 0 0 30px #ffcc00;
        font-size: 16px;
    }
    
    @keyframes trailFadeEnhanced {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
        }
        50% {
            opacity: 0.8;
            transform: translate(calc(-50% + var(--offset-x, 0px)), calc(-50% + var(--offset-y, 0px))) scale(1.2) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--offset-x, 0px)), calc(-50% + var(--offset-y, 0px) - 30px)) scale(0.3) rotate(360deg);
        }
    }
    
    /* Click ripple effect */
    .cursor-click-ripple {
        position: fixed;
        width: 40px;
        height: 40px;
        border: 3px solid var(--primary-color);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9997;
        transform: translate(-50%, -50%);
        animation: rippleEffect 0.6s ease-out forwards;
        box-shadow: 0 0 20px var(--primary-color);
    }
    
    @keyframes rippleEffect {
        0% {
            width: 20px;
            height: 20px;
            opacity: 1;
            border-width: 3px;
        }
        100% {
            width: 100px;
            height: 100px;
            opacity: 0;
            border-width: 1px;
        }
    }
    
    /* Cursor style notification */
    .cursor-notification {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        padding: 1rem 1.5rem;
        border-radius: 10px;
        border: 1px solid var(--glass-border);
        color: var(--primary-color);
        font-family: var(--font-mono);
        font-size: 0.9rem;
        z-index: 10001;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .cursor-notification.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Pixel grid for pixel cursor */
    .pixel-grid {
        width: 100%;
        height: 100%;
        background: 
            linear-gradient(0deg, transparent 40%, var(--bg-primary) 40%, var(--bg-primary) 60%, transparent 60%),
            linear-gradient(90deg, transparent 40%, var(--bg-primary) 40%, var(--bg-primary) 60%, transparent 60%);
    }
`;
document.head.appendChild(style);

// Initialize cursor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const cursor = new CustomCursor();

    // Add hint about cursor switching
    setTimeout(() => {
        cursor.showNotification('Tip: Press Alt+C to change cursor style!');    
    }, 3000);
});    
