// ===================================
// SOUND EFFECTS SYSTEM
// ===================================

class SoundSystem {
    constructor() {
        this.enabled = true;
        this.volume = 0.1;
        this.sounds = {};
        this.init();
    }
    
    init() {
        // Create Web Audio API context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Generate sounds programmatically
        this.createSounds();
        
        // Add event listeners
        this.attachEventListeners();
        
        // Add toggle button
        this.createToggleButton();
        
        // Check saved preference
        const savedState = localStorage.getItem('soundEnabled');
        if (savedState !== null) {
            this.enabled = savedState === 'true';
            this.updateToggleButton();
        }
    }
    
    createSounds() {
        // Hover sound - soft beep
        this.sounds.hover = () => this.playTone(800, 0.05, 'sine');
        
        // Click sound - deeper beep
        this.sounds.click = () => this.playTone(400, 0.1, 'square');
        
        // Success sound - ascending tones
        this.sounds.success = () => {
            this.playTone(523.25, 0.1, 'sine'); // C
            setTimeout(() => this.playTone(659.25, 0.1, 'sine'), 100); // E
            setTimeout(() => this.playTone(783.99, 0.15, 'sine'), 200); // G
        };
        
        // Error sound - descending tones
        this.sounds.error = () => {
            this.playTone(400, 0.1, 'square');
            setTimeout(() => this.playTone(300, 0.15, 'square'), 100);
        };
        
        // Notification sound - quick chirp
        this.sounds.notification = () => {
            this.playTone(1000, 0.05, 'sine');
            setTimeout(() => this.playTone(1200, 0.05, 'sine'), 50);
        };
        
        // Whoosh sound - for transitions
        this.sounds.whoosh = () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
        
        // Type sound - keyboard click
        this.sounds.type = () => this.playTone(1500, 0.03, 'square');
    }
    
    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    attachEventListeners() {
        // Hover sounds on buttons and links
        const hoverElements = document.querySelectorAll('button, a, .nav-link, .project-card, .timeline-card');
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => this.play('hover'));
        });
        
        // Click sounds
        const clickElements = document.querySelectorAll('button, a, .btn');
        clickElements.forEach(element => {
            element.addEventListener('click', () => this.play('click'));
        });
        
        // Form submit success
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (form.checkValidity()) {
                    this.play('success');
                } else {
                    this.play('error');
                }
            });
        });
        
        // Typing sounds on inputs
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('keydown', () => this.play('type'));
        });
        
        // Section change whoosh
        let lastSection = '';
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.id !== lastSection) {
                    if (lastSection) this.play('whoosh');
                    lastSection = entry.target.id;
                }
            });
        }, { threshold: 0.5 });
        
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    }
    
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        this.updateToggleButton();
        
        // Play notification to confirm
        if (this.enabled) {
            setTimeout(() => this.play('notification'), 100);
        }
    }
    
    createToggleButton() {
        const button = document.createElement('button');
        button.id = 'soundToggle';
        button.className = 'sound-toggle glass-effect';
        button.innerHTML = '<i class="fas fa-volume-up"></i>';
        button.title = 'Toggle sound effects';
        button.addEventListener('click', () => this.toggle());
        document.body.appendChild(button);
    }
    
    updateToggleButton() {
        const button = document.getElementById('soundToggle');
        if (button) {
            button.innerHTML = this.enabled 
                ? '<i class="fas fa-volume-up"></i>' 
                : '<i class="fas fa-volume-mute"></i>';
            button.classList.toggle('muted', !this.enabled);
        }
    }
}

// Initialize sound system
document.addEventListener('DOMContentLoaded', () => {
    window.soundSystem = new SoundSystem();
});
