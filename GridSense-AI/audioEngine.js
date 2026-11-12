/**
 * GridSense AI - Web Audio Synthesizer Engine
 * Generates dynamic audio cues for microgrid operational alerts.
 */

export class AudioSynthesizer {
    constructor() {
        this.audioCtx = null;
        this.isMuted = false;
        this.lastShedState = false;
        this.lastCriticalState = false;
    }

    // Initialize Web Audio Context on first user interaction
    init() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    /**
     * Low-Frequency Pulse (150 Hz -> 80 Hz)
     * Triggers when Low Solar Auto-Shed (< 25 kW) activates
     */
    playAutoShedPulse() {
        if (this.isMuted) return;
        this.init();

        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    /**
     * Two-Tone Alarm (880 Hz / 440 Hz)
     * Triggers when SoC drops to <= 5% (Clinic Shutdown)
     */
    playCriticalAlarm() {
        if (this.isMuted) return;
        this.init();

        const now = this.audioCtx.currentTime;
        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        gain.connect(this.audioCtx.destination);

        // First high tone
        const osc1 = this.audioCtx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(880, now);
        osc1.connect(gain);
        osc1.start(now);
        osc1.stop(now + 0.2);

        // Second low tone
        const osc2 = this.audioCtx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(440, now + 0.2);
        osc2.connect(gain);
        osc2.start(now + 0.2);
        osc2.stop(now + 0.45);
    }

    /**
     * State transition monitor to avoid repeating sounds every second
     */
    checkAlertStates(solarKW, isSecondaryOn, soc) {
        const isShedding = solarKW < 25.0 && isSecondaryOn;
        const isCritical = soc <= 5.0;

        // Trigger pulse on secondary load-shedding transition
        if (isShedding && !this.lastShedState) {
            this.playAutoShedPulse();
        }

        // Trigger alarm on critical clinic cutoff transition
        if (isCritical && !this.lastCriticalState) {
            this.playCriticalAlarm();
        }

        this.lastShedState = isShedding;
        this.lastCriticalState = isCritical;
    }
}