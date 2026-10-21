// High-fidelity procedural Web Audio engine for SFX and Ambient Soundscapes

class AudioEngine {
  private ctx: AudioContext | null = null;

  // Soundscape nodes
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;

  private campfireNode: AudioNode | null = null;
  private campfireGain: GainNode | null = null;

  private vinylNode: AudioNode | null = null;
  private vinylGain: GainNode | null = null;

  private droneNodes: OscillatorNode[] = [];
  private droneGain: GainNode | null = null;

  private masterAmbientGain: GainNode | null = null;

  private initCtx(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // --- Sound Effects (SFX) ---

  // Cute bubble pop / purr when headpatting Kokome
  playHeadpatSound(pitchMultiplier = 1) {
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 520 * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Soft UI click
  playClickSound() {
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Uplifting chord chime when focus session starts
  playFocusStartSound() {
    try {
      const ctx = this.initCtx();
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.9);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Gentle zen completion bells
  playTimerFinishSound() {
    try {
      const ctx = this.initCtx();
      const freqs = [880, 1108.73, 1318.51, 1760]; // A5 major chord
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 1.9);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Triumphant RPG level-up fanfare
  playQuestCompleteSound() {
    try {
      const ctx = this.initCtx();
      const notes = [
        { freq: 440, delay: 0 },
        { freq: 554.37, delay: 0.08 },
        { freq: 659.25, delay: 0.16 },
        { freq: 880, delay: 0.28 }
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.delay);

        gain.gain.setValueAtTime(0.14, ctx.currentTime + n.delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.delay + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + n.delay);
        osc.stop(ctx.currentTime + n.delay + 0.65);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // --- Procedural Ambient Soundscapes ---

  private ensureMasterAmbient() {
    const ctx = this.initCtx();
    if (!this.masterAmbientGain) {
      this.masterAmbientGain = ctx.createGain();
      this.masterAmbientGain.gain.setValueAtTime(0.8, ctx.currentTime);
      this.masterAmbientGain.connect(ctx.destination);
    }
    return this.masterAmbientGain;
  }

  // 1. Procedural Rain generator
  setRainVolume(volume: number) {
    const ctx = this.initCtx();
    const master = this.ensureMasterAmbient();

    if (volume <= 0) {
      if (this.rainGain) {
        this.rainGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      }
      return;
    }

    if (!this.rainNode) {
      // 5-second loop of pink-filtered procedural rain
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Filter to sound like soft window rain
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, ctx.currentTime);

      this.rainGain = ctx.createGain();
      this.rainGain.gain.setValueAtTime(0, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(this.rainGain);
      this.rainGain.connect(master);
      noiseSource.start();
      this.rainNode = noiseSource;
    }

    if (this.rainGain) {
      this.rainGain.gain.setTargetAtTime(Math.min(1, volume * 0.35), ctx.currentTime, 0.1);
    }
  }

  // 2. Procedural Campfire crackle
  setCampfireVolume(volume: number) {
    const ctx = this.initCtx();
    const master = this.ensureMasterAmbient();

    if (volume <= 0) {
      if (this.campfireGain) {
        this.campfireGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      }
      return;
    }

    if (!this.campfireNode) {
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Warm brown noise baseline
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 1.5;

        // Random ember micro-crackles
        if (Math.random() < 0.003) {
          data[i] += (Math.random() - 0.5) * 1.2;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(700, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      this.campfireGain = ctx.createGain();
      this.campfireGain.gain.setValueAtTime(0, ctx.currentTime);

      source.connect(filter);
      filter.connect(this.campfireGain);
      this.campfireGain.connect(master);
      source.start();
      this.campfireNode = source;
    }

    if (this.campfireGain) {
      this.campfireGain.gain.setTargetAtTime(Math.min(1, volume * 0.4), ctx.currentTime, 0.1);
    }
  }

  // 3. Procedural Vinyl / Lo-Fi Texture
  setVinylVolume(volume: number) {
    const ctx = this.initCtx();
    const master = this.ensureMasterAmbient();

    if (volume <= 0) {
      if (this.vinylGain) {
        this.vinylGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      }
      return;
    }

    if (!this.vinylNode) {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        let sample = (Math.random() * 2 - 1) * 0.02;
        // Vinyl pop / needle scratch
        if (Math.random() < 0.0015) {
          sample += (Math.random() - 0.5) * 0.8;
        }
        data[i] = sample;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      this.vinylGain = ctx.createGain();
      this.vinylGain.gain.setValueAtTime(0, ctx.currentTime);

      source.connect(filter);
      filter.connect(this.vinylGain);
      this.vinylGain.connect(master);
      source.start();
      this.vinylNode = source;
    }

    if (this.vinylGain) {
      this.vinylGain.gain.setTargetAtTime(Math.min(1, volume * 0.3), ctx.currentTime, 0.1);
    }
  }

  // 4. Binaural Zen 432Hz Focus Drone Chord
  setDroneVolume(volume: number) {
    const ctx = this.initCtx();
    const master = this.ensureMasterAmbient();

    if (volume <= 0) {
      if (this.droneGain) {
        this.droneGain.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      }
      return;
    }

    if (this.droneNodes.length === 0) {
      this.droneGain = ctx.createGain();
      this.droneGain.gain.setValueAtTime(0, ctx.currentTime);
      this.droneGain.connect(master);

      // 432Hz root, minor 7th, 9th, and sub octave
      const chordFreqs = [108, 216, 432, 513.7, 648];

      chordFreqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Gentle chorus vibrato
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.15 + Math.random() * 0.1, ctx.currentTime);
        lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        oscGain.gain.setValueAtTime(0.06, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(this.droneGain!);
        osc.start();

        this.droneNodes.push(osc);
      });
    }

    if (this.droneGain) {
      this.droneGain.gain.setTargetAtTime(Math.min(1, volume * 0.25), ctx.currentTime, 0.2);
    }
  }

  stopAllAmbient() {
    const ctx = this.ctx;
    if (!ctx) return;
    if (this.rainGain) this.rainGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
    if (this.campfireGain) this.campfireGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
    if (this.vinylGain) this.vinylGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
    if (this.droneGain) this.droneGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
  }
}

export const audioEngine = new AudioEngine();
