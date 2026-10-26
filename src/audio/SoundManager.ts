/**
 * Retro 16-Bit Web Audio Procedural Synthesizer Engine
 * 100% procedurally synthesized with Web Audio API - Zero external audio files required!
 */

export type BgmType = 'battle' | 'boss' | 'romantic' | 'birthday' | null;

export class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private bgmTimer: number | null = null;
  public currentBgm: BgmType = null;
  public masterVolume: number = 0.8;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  public init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    }
    return this.isMuted;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted) {
      this.stopBGM();
    }
  }

  // --- SOUND EFFECTS ---

  public playShoot() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // White noise burst for muzzle crack
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4 * this.masterVolume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);

    // Low body punch
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    oscGain.gain.setValueAtTime(0.5 * this.masterVolume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playZombieGroan() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';

    const startFreq = 80 + Math.random() * 40;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.linearRampToValueAtTime(startFreq - 25, now + 0.35);

    // Tremolo LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 9;
    lfoGain.gain.value = 15;
    lfo.connect(osc.frequency);
    lfo.start(now);
    lfo.stop(now + 0.35);

    gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playZombieHurt() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);
    gain.gain.setValueAtTime(0.25 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playBossRoar() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.6);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.linearRampToValueAtTime(150, now + 0.6);
    gain.gain.setValueAtTime(0.4 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.65);
  }

  public playBossAttack() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.25);
    gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playPlayerHurt() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
    gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playDodge() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(450, now + 0.12);
    gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playPickup() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = now + idx * 0.05;
      gain.gain.setValueAtTime(0.2 * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  public playRomanticChime() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C E G C E G
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + idx * 0.08;
      gain.gain.setValueAtTime(0.25 * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.85);
    });
  }

  public playHeartbeat() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    [0, 0.15].forEach((delay, idx) => {
      if (!this.ctx) return;
      const t = now + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(70 - idx * 10, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.12);
      gain.gain.setValueAtTime((0.48 - idx * 0.1) * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  public playProposalFanfare() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = now + idx * 0.09;
      gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.95);
    });

    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const t2 = this.ctx.currentTime;
      [1318.51, 1567.98, 2093.00].forEach((freq, i) => {
        if (!this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.25 * this.masterVolume, t2 + i * 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, t2 + i * 0.06 + 1.2);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(t2 + i * 0.06);
        o.stop(t2 + i * 0.06 + 1.25);
      });
    }, 600);
  }

  public playAlarm() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.18;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
      gain.gain.setValueAtTime(0.3 * this.masterVolume, t + 0.1);
      gain.gain.setValueAtTime(0, t + 0.11);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  }

  public playRecordScratch() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.3);
    gain.gain.setValueAtTime(0.4 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playTeleport() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.22);
    gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  public playAcidSizzle() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.15);
    gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playShockwave() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
    gain.gain.setValueAtTime(0.45 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  public playCheer() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 1.5);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.8;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 1.5);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  // --- PROCEDURAL BGM ENGINE ---

  public stopBGM() {
    if (this.bgmTimer) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.currentBgm = null;
  }

  public playBGM(type: BgmType) {
    if (this.currentBgm === type) return;
    this.stopBGM();
    this.currentBgm = type;
    if (this.isMuted || !this.ctx || !type) return;

    let step = 0;
    const noteFreq: Record<string, number> = {
      'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
      'REST': 0
    };

    if (type === 'battle') {
      const bassline = ['C3', 'C3', 'G3', 'C3', 'D#3', 'D#3', 'F3', 'G3', 'C3', 'C3', 'G3', 'C3', 'A#3', 'A#3', 'G3', 'F3'];
      const leadMelody = ['C4', 'REST', 'D#4', 'G4', 'F4', 'D#4', 'C4', 'REST', 'G4', 'F4', 'D#4', 'C4', 'D#4', 'F4', 'G4', 'A#4'];
      const stepDuration = 130;

      this.bgmTimer = window.setInterval(() => {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const bNote = bassline[step % bassline.length];
        const lNote = leadMelody[step % leadMelody.length];

        if (bNote !== 'REST' && noteFreq[bNote]) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.value = noteFreq[bNote];
          gain.gain.setValueAtTime(0.16 * this.masterVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.13);
        }

        if (lNote !== 'REST' && noteFreq[lNote]) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.value = noteFreq[lNote];
          gain.gain.setValueAtTime(0.12 * this.masterVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.11);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
        }

        if (step % 4 === 2) {
          const bSize = Math.floor(this.ctx.sampleRate * 0.05);
          const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
          const d = b.getChannelData(0);
          for (let i = 0; i < bSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.015));
          const n = this.ctx.createBufferSource();
          n.buffer = b;
          const g = this.ctx.createGain();
          g.gain.value = 0.08 * this.masterVolume;
          n.connect(g);
          g.connect(this.ctx.destination);
          n.start(now);
        }
        step++;
      }, stepDuration);
    } else if (type === 'boss') {
      const bassline = ['C3', 'C3', 'C#3', 'C3', 'C3', 'C3', 'D#3', 'D3'];
      const leadMelody = ['G4', 'G#4', 'G4', 'F4', 'D#4', 'D4', 'D#4', 'F4'];
      const stepDuration = 105;

      this.bgmTimer = window.setInterval(() => {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const bNote = bassline[step % bassline.length];
        const lNote = leadMelody[step % leadMelody.length];

        if (noteFreq[bNote]) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.value = noteFreq[bNote];
          gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.1);
        }

        if (noteFreq[lNote]) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.value = noteFreq[lNote];
          gain.gain.setValueAtTime(0.14 * this.masterVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.1);
        }
        step++;
      }, stepDuration);
    } else if (type === 'romantic') {
      const chords = [
        ['F4', 'A4', 'C5', 'E5'],
        ['G4', 'B4', 'D5', 'G5'],
        ['E4', 'G4', 'B4', 'E5'],
        ['A4', 'C5', 'E5', 'A5']
      ];
      const stepDuration = 220;

      this.bgmTimer = window.setInterval(() => {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const chordIdx = Math.floor(step / 4) % chords.length;
        const noteIdx = step % 4;
        const nName = chords[chordIdx][noteIdx];

        if (noteFreq[nName]) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = noteFreq[nName];
          gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.55);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.6);
        }
        step++;
      }, stepDuration);
    } else if (type === 'birthday') {
      const melody = [
        'G4', 'G4', 'A4', 'G4', 'C5', 'B4', 'REST',
        'G4', 'G4', 'A4', 'G4', 'D5', 'C5', 'REST',
        'G4', 'G4', 'G5', 'E5', 'C5', 'B4', 'A4', 'REST',
        'F5', 'F5', 'E5', 'C5', 'D5', 'C5', 'REST'
      ];
      const stepDuration = 260;

      this.bgmTimer = window.setInterval(() => {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const note = melody[step % melody.length];

        if (note !== 'REST' && noteFreq[note]) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = noteFreq[note];
          gain.gain.setValueAtTime(0.24 * this.masterVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.38);

          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          bassOsc.type = 'sine';
          bassOsc.frequency.value = noteFreq[note] / 2;
          bassGain.gain.setValueAtTime(0.18 * this.masterVolume, now);
          bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          bassOsc.connect(bassGain);
          bassGain.connect(this.ctx.destination);
          bassOsc.start(now);
          bassOsc.stop(now + 0.38);
        }
        step++;
      }, stepDuration);
    }
  }

  // --- STUDIO INTRO SOUNDS ---

  public playStudioSpark() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(3400, now + 0.16);
    gain.gain.setValueAtTime(0.22 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playStudioGlitch() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      const t0 = now + i * 0.055;
      osc.frequency.setValueAtTime(350 + Math.random() * 1100, t0);
      gain.gain.setValueAtTime(0.12 * this.masterVolume, t0);
      gain.gain.exponentialRampToValueAtTime(0.005, t0 + 0.045);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.05);
    }
  }

  public playStudioImpact() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(220, now);
    sub.frequency.exponentialRampToValueAtTime(32, now + 0.38);
    subGain.gain.setValueAtTime(0.55 * this.masterVolume, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + 0.45);

    const punch = this.ctx.createOscillator();
    const punchGain = this.ctx.createGain();
    punch.type = 'triangle';
    punch.frequency.setValueAtTime(520, now);
    punch.frequency.exponentialRampToValueAtTime(50, now + 0.08);
    punchGain.gain.setValueAtTime(0.4 * this.masterVolume, now);
    punchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    punch.connect(punchGain);
    punchGain.connect(this.ctx.destination);
    punch.start(now);
    punch.stop(now + 0.09);
  }

  public playStudioShimmer() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(2900, now + 0.22);
    gain.gain.setValueAtTime(0.22 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}

export const soundManager = new SoundManager();
