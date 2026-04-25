// ===================================
// CALM AUDIO SYSTEM (SFX + AMBIENT)
// ===================================

class SoundSystem {
    constructor() {
        this.enabled = true;
        this.volume = 0.08;
        this.sfxGainScale = 0.9;
        this.ambientGainScale = 0.2;

        this.sounds = {};
        this.lastPlayedAt = {};
        this.soundCooldownMs = {
            hover: 90,
            click: 60,
            type: 60,
            whoosh: 200,
            notification: 180,
            success: 120,
            error: 120,
            loaderLogo: 180,
            loaderName: 180,
            loaderMotion: 65,
            loaderDissolve: 300,
            wordComplete: 220
        };

        this.userInteracted = false;
        this.pendingAmbient = false;
        this.ambientMode = 'none';
        this.ambientAudioEl = null;
        this.ambientNodes = null;

        // Optional file path hook if you add a loop later:
        // window.AMBIENT_AUDIO_URL = 'audio/calm-ambient.mp3';
        this.ambientFileUrl = typeof window.AMBIENT_AUDIO_URL === 'string'
            ? window.AMBIENT_AUDIO_URL.trim()
            : '';

        this.unlockHandler = this.unlockAudio.bind(this);
        this.visibilityHandler = this.handleVisibilityChange.bind(this);

        this.init();
    }

    init() {
        this.createAudioContext();
        this.createSounds();
        this.attachUnlockListeners();
        this.attachEventListeners();
        this.createToggleButton();

        const savedState = localStorage.getItem('soundEnabled');
        if (savedState !== null) {
            this.enabled = savedState === 'true';
        }

        this.updateToggleButton();
        document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    createAudioContext() {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            this.audioContext = Ctx ? new Ctx() : null;
        } catch (err) {
            this.audioContext = null;
            console.warn('AudioContext unavailable; sounds disabled.', err);
        }
    }

    attachUnlockListeners() {
        const opts = { passive: true, capture: true };
        document.addEventListener('pointerdown', this.unlockHandler, opts);
        document.addEventListener('touchstart', this.unlockHandler, opts);
        document.addEventListener('pointermove', this.unlockHandler, opts);
        document.addEventListener('wheel', this.unlockHandler, opts);
        document.addEventListener('keydown', this.unlockHandler, opts);
    }

    unlockAudio() {
        this.userInteracted = true;

        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => {});
        }

        if (this.enabled && this.pendingAmbient) {
            this.startLoaderAmbient();
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.stopLoaderAmbient(260, { clearRequest: false });
            return;
        }

        if (this.pendingAmbient && this.enabled) {
            this.startLoaderAmbient();
        }
    }

    createSounds() {
        this.sounds.hover = () => {
            this.playTone(540, 0.045, { type: 'triangle', gainScale: 0.2, attack: 0.004 });
        };

        this.sounds.click = () => {
            this.playTone(290, 0.07, { type: 'sine', gainScale: 0.3, attack: 0.003 });
            setTimeout(() => {
                this.playTone(430, 0.04, { type: 'triangle', gainScale: 0.16, attack: 0.003 });
            }, 26);
        };

        this.sounds.type = () => {
            this.playTone(920, 0.02, { type: 'sine', gainScale: 0.11, attack: 0.002 });
        };

        this.sounds.success = () => {
            this.playChord([440, 554.37, 659.25], 85, 0.08, {
                type: 'sine',
                gainScale: 0.2
            });
        };

        this.sounds.error = () => {
            this.playTone(340, 0.08, { type: 'triangle', gainScale: 0.19, attack: 0.004 });
            setTimeout(() => {
                this.playTone(246.94, 0.1, { type: 'sine', gainScale: 0.16, attack: 0.004 });
            }, 90);
        };

        this.sounds.notification = () => {
            this.playTone(740, 0.05, { type: 'sine', gainScale: 0.2, attack: 0.003 });
            setTimeout(() => {
                this.playTone(880, 0.06, { type: 'sine', gainScale: 0.16, attack: 0.003 });
            }, 55);
        };

        this.sounds.whoosh = () => {
            this.playSoftSweep(260, 140, 0.24, 0.2);
        };

        this.sounds.loaderLogo = () => {
            this.playTone(392, 0.08, { type: 'sine', gainScale: 0.22, attack: 0.004 });
            setTimeout(() => {
                this.playTone(523.25, 0.09, { type: 'triangle', gainScale: 0.16, attack: 0.004 });
            }, 70);
        };

        this.sounds.loaderName = () => {
            this.playChord([349.23, 440, 587.33], 95, 0.09, {
                type: 'sine',
                gainScale: 0.19
            });
        };

        this.sounds.loaderMotion = () => {
            this.playTone(228, 0.095, { type: 'triangle', gainScale: 0.46, attack: 0.004 });
            setTimeout(() => {
                this.playTone(288, 0.085, { type: 'sine', gainScale: 0.3, attack: 0.004 });
            }, 24);
        };

        this.sounds.loaderDissolve = () => {
            this.playSoftSweep(420, 170, 0.34, 0.17);
        };

        this.sounds.wordComplete = () => {
            this.playChord([392, 493.88, 587.33], 90, 0.085, {
                type: 'triangle',
                gainScale: 0.2
            });
        };
    }

    playTone(frequency, duration, options = {}) {
        if (!this.enabled || !this.audioContext || !this.userInteracted) return;

        const {
            type = 'sine',
            gainScale = 0.25,
            attack = 0.004,
            detune = 0
        } = options;

        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;
        oscillator.detune.value = detune;

        const peak = Math.max(0.0001, this.volume * this.sfxGainScale * gainScale);
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(peak, now + attack);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(now);
        oscillator.stop(now + duration + 0.02);
    }

    playChord(frequencies, stepMs, noteDuration, options = {}) {
        for (let i = 0; i < frequencies.length; i++) {
            const f = frequencies[i];
            setTimeout(() => this.playTone(f, noteDuration, options), i * stepMs);
        }
    }

    playSoftSweep(startFreq, endFreq, duration, gainScale) {
        if (!this.enabled || !this.audioContext || !this.userInteracted) return;

        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(startFreq, now);
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(50, endFreq), now + duration);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(280, now + duration);

        const peak = Math.max(0.0001, this.volume * this.sfxGainScale * gainScale);
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(peak, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(now);
        oscillator.stop(now + duration + 0.02);
    }

    attachEventListeners() {
        const hoverElements = document.querySelectorAll('button, a, .nav-link, .project-card, .timeline-card');
        hoverElements.forEach((element) => {
            element.addEventListener('mouseenter', () => this.play('hover'));
        });

        const clickElements = document.querySelectorAll('button, a, .btn');
        clickElements.forEach((element) => {
            element.addEventListener('click', () => this.play('click'));
        });

        const forms = document.querySelectorAll('form');
        forms.forEach((form) => {
            form.addEventListener('submit', () => {
                if (form.checkValidity()) {
                    this.play('success');
                } else {
                    this.play('error');
                }
            });
        });

        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach((input) => {
            input.addEventListener('keydown', () => this.play('type'));
        });

        let lastSection = '';
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.target.id !== lastSection) {
                    if (lastSection) this.play('whoosh');
                    lastSection = entry.target.id;
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('section').forEach((section) => {
            observer.observe(section);
        });
    }

    play(soundName, options = {}) {
        if (!this.enabled || !this.sounds[soundName]) return;

        if (document.body.classList.contains('loading-active') && soundName !== 'loaderMotion') {
            return;
        }

        const now = performance.now();
        const cooldown = options.cooldownMs ?? this.soundCooldownMs[soundName] ?? 0;
        const last = this.lastPlayedAt[soundName] || 0;

        if (!options.force && now - last < cooldown) return;

        this.lastPlayedAt[soundName] = now;
        this.sounds[soundName]();
    }

    requestLoaderAmbient() {
        this.pendingAmbient = true;
        if (!this.enabled) return;
        this.startLoaderAmbient();
    }

    startLoaderAmbient() {
        if (!this.enabled || !this.audioContext) return;
        if (!this.userInteracted && this.audioContext.state !== 'running') return;
        if (this.ambientMode !== 'none') return;

        if (this.ambientFileUrl) {
            this.startAmbientFile();
            return;
        }

        this.startAmbientSynth();
    }

    startAmbientFile() {
        const audioEl = new Audio(this.ambientFileUrl);
        audioEl.loop = true;
        audioEl.preload = 'auto';
        audioEl.volume = Math.max(0.001, this.volume * this.ambientGainScale * 0.6);

        audioEl.addEventListener('error', () => {
            if (this.ambientMode === 'none') {
                this.startAmbientSynth();
            }
        }, { once: true });

        const playPromise = audioEl.play();
        if (playPromise && typeof playPromise.then === 'function') {
            playPromise.then(() => {
                this.ambientAudioEl = audioEl;
                this.ambientMode = 'file';
            }).catch(() => {
                this.startAmbientSynth();
            });
        } else {
            this.ambientAudioEl = audioEl;
            this.ambientMode = 'file';
        }
    }

    startAmbientSynth() {
        if (!this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const master = ctx.createGain();
        master.gain.setValueAtTime(0.0001, now);
        master.connect(ctx.destination);

        const padFilter = ctx.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.value = 900;
        padFilter.Q.value = 0.6;
        padFilter.connect(master);

        const padGain = ctx.createGain();
        padGain.gain.value = 0.18;
        padGain.connect(padFilter);

        const oscillators = [];
        const freqs = [174.61, 220, 261.63];
        for (let i = 0; i < freqs.length; i++) {
            const osc = ctx.createOscillator();
            osc.type = i === 0 ? 'sine' : 'triangle';
            osc.frequency.value = freqs[i];
            osc.detune.value = (i - 1) * 3;
            osc.connect(padGain);
            osc.start(now);
            oscillators.push(osc);
        }

        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const channel = noiseBuffer.getChannelData(0);
        for (let i = 0; i < channel.length; i++) {
            channel[i] = (Math.random() * 2 - 1) * 0.5;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 1700;
        noiseFilter.Q.value = 0.55;

        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.02;

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(master);
        noiseSource.start(now);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.09;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 25;
        lfo.connect(lfoGain);
        lfoGain.connect(padFilter.frequency);
        lfo.start(now);

        const target = Math.max(0.0001, this.volume * this.ambientGainScale);
        master.gain.linearRampToValueAtTime(target, now + 1.3);

        this.ambientNodes = {
            master,
            padFilter,
            padGain,
            oscillators,
            noiseSource,
            noiseFilter,
            noiseGain,
            lfo,
            lfoGain
        };

        this.ambientMode = 'synth';
    }

    stopLoaderAmbient(fadeMs = 900, options = {}) {
        const clearRequest = options.clearRequest !== false;
        if (clearRequest) {
            this.pendingAmbient = false;
        }

        if (this.ambientMode === 'file' && this.ambientAudioEl) {
            const el = this.ambientAudioEl;
            const startVol = el.volume;
            const steps = Math.max(1, Math.floor(fadeMs / 60));
            let step = 0;

            const timer = setInterval(() => {
                step++;
                const ratio = Math.max(0, 1 - step / steps);
                el.volume = startVol * ratio;
                if (step >= steps) {
                    clearInterval(timer);
                    el.pause();
                    el.currentTime = 0;
                    this.ambientAudioEl = null;
                    this.ambientMode = 'none';
                }
            }, Math.max(16, Math.floor(fadeMs / steps)));
            return;
        }

        if (this.ambientMode === 'synth' && this.ambientNodes && this.audioContext) {
            const ctx = this.audioContext;
            const nodes = this.ambientNodes;
            const now = ctx.currentTime;
            const fadeSec = Math.max(0.05, fadeMs / 1000);

            nodes.master.gain.cancelScheduledValues(now);
            nodes.master.gain.setValueAtTime(Math.max(0.0001, nodes.master.gain.value), now);
            nodes.master.gain.linearRampToValueAtTime(0.0001, now + fadeSec);

            window.setTimeout(() => {
                try {
                    nodes.oscillators.forEach((osc) => osc.stop());
                    nodes.noiseSource.stop();
                    nodes.lfo.stop();
                } catch (_) {}

                nodes.master.disconnect();
                nodes.padFilter.disconnect();
                nodes.padGain.disconnect();
                nodes.noiseFilter.disconnect();
                nodes.noiseGain.disconnect();
                nodes.lfoGain.disconnect();

                this.ambientNodes = null;
                this.ambientMode = 'none';
            }, fadeMs + 40);
        }
    }

    toggle() {
        this.unlockAudio();
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        this.updateToggleButton();

        if (!this.enabled) {
            this.stopLoaderAmbient(260, { clearRequest: false });
            return;
        }

        if (this.pendingAmbient) {
            this.startLoaderAmbient();
        }

        if (!document.body.classList.contains('loading-active')) {
            setTimeout(() => this.play('notification', { force: true }), 100);
        }
    }

    createToggleButton() {
        let button = document.getElementById('soundToggle');
        if (button) return;

        button = document.createElement('button');
        button.id = 'soundToggle';
        button.className = 'sound-toggle glass-effect';
        button.type = 'button';
        button.innerHTML = '<i class="fas fa-volume-up"></i>';
        button.title = 'Toggle calming audio';
        button.setAttribute('aria-label', 'Toggle calming audio');
        button.addEventListener('click', () => this.toggle());
        document.body.appendChild(button);
    }

    updateToggleButton() {
        const button = document.getElementById('soundToggle');
        if (!button) return;

        button.innerHTML = this.enabled
            ? '<i class="fas fa-volume-up"></i>'
            : '<i class="fas fa-volume-mute"></i>';
        button.classList.toggle('muted', !this.enabled);
        button.title = this.enabled ? 'Disable calming audio' : 'Enable calming audio';
        button.setAttribute('aria-label', button.title);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.soundSystem = new SoundSystem();
});
