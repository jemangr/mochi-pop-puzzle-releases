/**
 * Synthesized cozy sound effects + gentle pentatonic Kalimba background loop
 * using the Web Audio API. Zero external audio assets needed.
 */
(function (global) {
  const KALIMBA_NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
  const MELODY_PATTERN = [0, 2, 4, 5, 4, 2, 3, 1, 0, 4, 5, 7, 5, 4, 2, 1];

  const VOICE_CLIPS = {
    meow_1: "assets/sounds/meow_1.mp3",
    meow_2: "assets/sounds/meow_2.mp3",
    purr: "assets/sounds/purr.mp3",
    eat: "assets/sounds/eat.mp3",
    cry: "assets/sounds/cry.mp3",
    sulk: "assets/sounds/sulk.mp3",
    yawn: "assets/sounds/yawn.mp3",
    fainted: "assets/sounds/fainted.mp3",
    sneeze: "assets/sounds/sneeze.mp3",
    water_lap: "assets/sounds/water_lap.mp3",
    kibble_pour: "assets/sounds/kibble_pour.mp3",
    toy_squeak: "assets/sounds/toy_squeak.mp3",
    bell_jingle: "assets/sounds/bell_jingle.mp3"
  };

  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.musicEnabled = true;
      this.sfxEnabled = true;
      this.catEnabled = true;
      this.musicVolume = 0.7;
      this.sfxVolume = 0.85;
      this.catVolume = 0.9;
      this.musicTimer = null;
      this.melodyStep = 0;
      this.nightMode = false;
      this.roomTheme = "peach";
      this.miniGameMode = null;
      this.lastPurrAt = 0;
      this.voiceMap = {};
      this.activeVoiceEl = null;
      this.activePurrEl = null;
      this.activeSfxEl = null;
      this.backgrounded = typeof document !== "undefined" ? !!document.hidden : false;
      this._preloadVoices();
      this._bindLifecycleListeners();
    }

    _bindLifecycleListeners() {
      if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
        document.addEventListener("visibilitychange", () => {
          if (document.hidden) {
            this.pauseForBackground();
          } else {
            this.resumeFromBackground();
          }
        });
      }
      if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
        window.addEventListener("pagehide", () => this.pauseForBackground());
        window.addEventListener("freeze", () => this.pauseForBackground());
        window.addEventListener("pageshow", () => {
          if (typeof document === "undefined" || !document.hidden) {
            this.resumeFromBackground();
          }
        });
      }
    }

    pauseForBackground() {
      this.backgrounded = true;
      this._stopMusicLoop();
      this._stopActiveVoice();
      this._stopPurr();
      this._stopActiveSfx();
      Object.values(this.voiceMap).forEach((el) => {
        try {
          if (el && !el.paused) {
            el.pause();
            el.currentTime = 0;
          }
        } catch (_) {}
      });
      if (this.ctx && this.ctx.state === "running") {
        this.ctx.suspend().catch(() => {});
      }
    }

    resumeFromBackground() {
      if (typeof document !== "undefined" && document.hidden) return;
      this.backgrounded = false;
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      if (!this.muted && this.musicEnabled && this.musicVolume > 0.005 && this.ctx && !this.musicTimer) {
        this._startMusicLoop();
      }
    }

    _preloadVoices() {
      if (typeof Audio === "undefined") return;
      Object.keys(VOICE_CLIPS).forEach((key) => {
        try {
          const el = new Audio(VOICE_CLIPS[key]);
          el.preload = "auto";
          el.load();
          this.voiceMap[key] = el;
        } catch (_) {}
      });
    }

    _stopSlot(prop) {
      const el = this[prop];
      if (el) {
        try {
          el.pause();
          el.currentTime = 0;
        } catch (_) {}
        this[prop] = null;
      }
    }

    _stopActiveVoice() {
      this._stopSlot("activeVoiceEl");
    }

    _stopPurr() {
      this._stopSlot("activePurrEl");
    }

    _stopActiveSfx() {
      this._stopSlot("activeSfxEl");
    }

    _clampVol(v) {
      const n = Number(v);
      if (!Number.isFinite(n)) return 1;
      return Math.max(0, Math.min(1, n));
    }

    _isChannelActive(channel) {
      if (this.muted || this.backgrounded) return false;
      if (typeof document !== "undefined" && document.hidden) return false;
      if (channel === "music") return this.musicEnabled && this.musicVolume > 0.005;
      if (channel === "cat") return this.catEnabled && this.catVolume > 0.005;
      return this.sfxEnabled && this.sfxVolume > 0.005;
    }

    _channelVolume(channel) {
      if (channel === "music") return this.musicVolume;
      if (channel === "cat") return this.catVolume;
      return this.sfxVolume;
    }

    _playClip(channel, keys, volume = 0.72, fallbackFn = null, isPurr = false) {
      if (!this._isChannelActive(channel)) return;
      const list = Array.isArray(keys) ? keys : [keys];
      const ready = list
        .map((k) => this.voiceMap[k])
        .filter((el) => el && el.readyState >= 2);
      if (!ready.length) {
        if (fallbackFn) fallbackFn();
        return;
      }
      const el = ready[Math.floor(Math.random() * ready.length)];
      const slot = channel === "sfx" ? "activeSfxEl" : (isPurr ? "activePurrEl" : "activeVoiceEl");
      try {
        this._stopSlot(slot);
        this[slot] = el;
        el.currentTime = 0;
        el._baseVolume = volume;
        el.volume = Math.max(0, Math.min(1, volume * this._channelVolume(channel)));
        const p = el.play();
        if (p && typeof p.catch === "function") {
          p.catch(() => {
            if (fallbackFn) fallbackFn();
          });
        }
      } catch (_) {
        if (fallbackFn) fallbackFn();
      }
    }

    _playVoice(keys, volume = 0.72, fallbackFn = null, isPurr = false) {
      this._playClip("cat", keys, volume, fallbackFn, isPurr);
    }

    unlock() {
      if (this.backgrounded || (typeof document !== "undefined" && document.hidden)) return;
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      if (this._isChannelActive("music") && !this.musicTimer) {
        this._startMusicLoop();
      }
    }

    setMuted(muted) {
      this.muted = !!muted;
      if (this.muted) {
        this._stopMusicLoop();
        this._stopActiveVoice();
        this._stopPurr();
        this._stopActiveSfx();
      } else if (this._isChannelActive("music")) {
        this._startMusicLoop();
      }
    }

    setMusicEnabled(enabled) {
      this.musicEnabled = !!enabled;
      if (this._isChannelActive("music")) {
        this._startMusicLoop();
      } else {
        this._stopMusicLoop();
      }
    }

    setMusicVolume(vol) {
      this.musicVolume = this._clampVol(vol);
      if (this._isChannelActive("music")) {
        this._startMusicLoop();
      } else {
        this._stopMusicLoop();
      }
    }

    setSfxEnabled(enabled) {
      this.sfxEnabled = !!enabled;
      if (!this.sfxEnabled) {
        this._stopActiveSfx();
      }
    }

    setSfxVolume(vol) {
      this.sfxVolume = this._clampVol(vol);
      if (!this._isChannelActive("sfx")) {
        this._stopActiveSfx();
        return;
      }
      if (this.activeSfxEl && !this.activeSfxEl.paused) {
        const base = this.activeSfxEl._baseVolume !== undefined ? this.activeSfxEl._baseVolume : 0.72;
        try {
          this.activeSfxEl.volume = Math.max(0, Math.min(1, base * this.sfxVolume));
        } catch (_) {}
      }
    }

    setCatEnabled(enabled) {
      this.catEnabled = !!enabled;
      if (!this.catEnabled) {
        this._stopActiveVoice();
        this._stopPurr();
      }
    }

    setCatVolume(vol) {
      this.catVolume = this._clampVol(vol);
      if (!this._isChannelActive("cat")) {
        this._stopActiveVoice();
        this._stopPurr();
        return;
      }
      [this.activeVoiceEl, this.activePurrEl].forEach((el) => {
        if (el && !el.paused) {
          const base = el._baseVolume !== undefined ? el._baseVolume : 0.72;
          try {
            el.volume = Math.max(0, Math.min(1, base * this.catVolume));
          } catch (_) {}
        }
      });
    }

    setNightMode(isNight) {
      const next = !!isNight;
      if (this.nightMode === next) return;
      this.nightMode = next;
      if (this.musicTimer && !this.miniGameMode) {
        this._stopMusicLoop();
        if (this._isChannelActive("music")) {
          this._startMusicLoop();
        }
      }
    }

    setMiniGameMode(mode) {
      const next = mode === "laser" || mode === "bakery" || mode === "rain" ? mode : null;
      if (this.miniGameMode === next) return;
      this.miniGameMode = next;
      if (this.musicTimer) {
        this._stopMusicLoop();
        if (this._isChannelActive("music")) {
          this._startMusicLoop();
        }
      }
    }

    setRoomTheme(themeId) {
      const next = themeId === "beach" || themeId === "winter" ? themeId : "peach";
      if (this.roomTheme === next) return;
      this.roomTheme = next;
      if (this.musicTimer && !this.miniGameMode && !this.nightMode) {
        this._stopMusicLoop();
        if (this._isChannelActive("music")) {
          this._startMusicLoop();
        }
      }
    }

    _startMusicLoop() {
      if (this.musicTimer || !this.ctx) return;
      const intervalMs = this.miniGameMode ? 240 : (this.nightMode ? 680 : 520);
      const nightNotes = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];
      const nightPattern = [0, 3, 4, 2, 1, 4, 5, 3, 0, 2, 4, 6, 4, 3, 1, 2];
      const arcadeNotes = [392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 783.99, 880.0];
      const arcadePattern = [0, 2, 4, 5, 4, 2, 3, 6, 4, 5, 7, 5, 3, 2, 4, 1];

      const beachNotes = [329.63, 392.0, 440.0, 493.88, 587.33, 659.25, 783.99, 880.0];
      const beachPattern = [0, 2, 4, 3, 5, 4, 2, 1, 0, 3, 5, 6, 5, 4, 2, 3];
      const winterNotes = [392.0, 440.0, 493.88, 587.33, 659.25, 783.99, 880.0, 987.77];
      const winterPattern = [0, 4, 2, 5, 3, 6, 4, 2, 1, 5, 3, 7, 6, 4, 2, 0];

      this.musicTimer = setInterval(() => {
        if (!this._isChannelActive("music") || !this.ctx || this.ctx.state !== "running") return;
        if (this.miniGameMode) {
          const noteIdx = arcadePattern[this.melodyStep % arcadePattern.length];
          const freq = arcadeNotes[noteIdx];
          this._tone(freq, 0.19, this.miniGameMode === "bakery" ? "triangle" : "sine", 0.038, null, 0, "music");
          if (this.melodyStep % 2 === 0) {
            this._tone(freq * 0.5, 0.16, "triangle", 0.024, null, 0, "music");
          }
        } else if (this.nightMode) {
          const noteIdx = nightPattern[this.melodyStep % nightPattern.length];
          const freq = nightNotes[noteIdx];
          this._tone(freq, 0.85, "sine", 0.032, null, 0, "music");
          if (this.melodyStep % 4 === 0) {
            this._tone(freq * 0.5, 1.1, "sine", 0.022, null, 0.02, "music");
          }
          if (this.melodyStep % 2 === 1) {
            const sparkle = nightNotes[(noteIdx + 3) % nightNotes.length] * 2;
            this._tone(sparkle, 0.25, "sine", 0.011, null, 0.24, "music");
          }
        } else if (this.roomTheme === "beach") {
          const noteIdx = beachPattern[this.melodyStep % beachPattern.length];
          const freq = beachNotes[noteIdx];
          this._tone(freq, 0.36, "triangle", 0.034, null, 0, "music");
          if (this.melodyStep % 4 === 0) {
            this._tone(freq * 0.5, 0.55, "sine", 0.024, null, 0.02, "music");
          }
        } else if (this.roomTheme === "winter") {
          const noteIdx = winterPattern[this.melodyStep % winterPattern.length];
          const freq = winterNotes[noteIdx];
          this._tone(freq, 0.62, "sine", 0.028, null, 0, "music");
          if (this.melodyStep % 3 === 0) {
            this._tone(freq * 1.5, 0.22, "sine", 0.01, null, 0.16, "music");
          }
        } else {
          const noteIdx = MELODY_PATTERN[this.melodyStep % MELODY_PATTERN.length];
          const freq = KALIMBA_NOTES[noteIdx];
          this._tone(freq, 0.55, "sine", 0.036, null, 0, "music");
          if (this.melodyStep % 4 === 0) {
            this._tone(freq * 0.5, 0.75, "triangle", 0.025, null, 0, "music");
          }
        }
        this.melodyStep += 1;
      }, intervalMs);
    }

    _stopMusicLoop() {
      if (this.musicTimer) {
        clearInterval(this.musicTimer);
        this.musicTimer = null;
      }
    }

    _tone(freq, duration, type = "sine", volume = 0.14, slideTo = null, delay = 0, channel = "sfx") {
      if (!this._isChannelActive(channel)) return;
      this.unlock();
      if (!this.ctx) return;

      const scaledVol = Math.max(0.0001, volume * this._channelVolume(channel));
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
      }

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(scaledVol, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    }

    playPickup() {
      this._tone(380, 0.07, "sine", 0.1, 520);
    }

    playSnap() {
      this._tone(620, 0.035, "sine", 0.045, 700);
    }

    playPlace() {
      this._tone(190, 0.09, "triangle", 0.16, 110);
    }

    playInvalid() {
      this._tone(160, 0.11, "sawtooth", 0.06, 120);
    }

    playClear(combo = 1) {
      const base = 440 * Math.pow(1.12, Math.min(combo - 1, 7));
      this._tone(base, 0.13, "sine", 0.14, base * 1.25, 0);
      this._tone(base * 1.25, 0.15, "triangle", 0.12, base * 1.5, 0.06);
      if (combo >= 2) {
        this._tone(base * 1.5, 0.22, "sine", 0.14, base * 2, 0.12);
      }
    }

    playIceCrack() {
      this._tone(1100, 0.08, "triangle", 0.12, 760, 0);
      this._tone(1480, 0.1, "sine", 0.1, 1020, 0.04);
    }

    playCrateCrack() {
      this._tone(210, 0.075, "triangle", 0.16, 105, 0);
      this._tone(340, 0.05, "square", 0.055, 190, 0.02);
    }

    playHammerSmash() {
      this._tone(180, 0.09, "triangle", 0.17, 70, 0);
      this._tone(580, 0.11, "sine", 0.11, 840, 0.04);
    }

    playAchievement() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        this._tone(f, 0.18, "sine", 0.13, null, idx * 0.075);
      });
    }

    playBomb() {
      this._tone(150, 0.26, "sawtooth", 0.14, 48, 0);
      this._tone(320, 0.18, "triangle", 0.12, 90, 0.03);
    }

    playCravingWin() {
      this._tone(523.25, 0.12, "sine", 0.13, null, 0);
      this._tone(659.25, 0.12, "sine", 0.13, null, 0.09);
      this._tone(783.99, 0.22, "sine", 0.14, null, 0.18);
    }

    playToySqueak() {
      this._playClip("sfx", "toy_squeak", 0.72, () => {
        this._tone(720, 0.07, "sine", 0.11, 1080, 0, "sfx");
        this._tone(960, 0.08, "triangle", 0.09, 680, 0.07, "sfx");
      });
    }

    playYarnTap() {
      this._tone(165, 0.075, "triangle", 0.11, 82, 0, "sfx");
      this._tone(310, 0.06, "sine", 0.045, 220, 0.03, "sfx");
    }

    playMouseWindup() {
      [0, 0.048, 0.096, 0.144].forEach((t, idx) => {
        this._tone(idx % 2 === 0 ? 1120 : 940, 0.022, "square", 0.045, 760, t, "sfx");
      });
      this._tone(440, 0.055, "triangle", 0.06, 620, 0.21, "sfx");
      this._tone(520, 0.055, "triangle", 0.05, 710, 0.27, "sfx");
    }

    playFeatherSwish() {
      if (this._isChannelActive("sfx")) {
        this.unlock();
        if (this.ctx) {
          try {
            const len = Math.floor(this.ctx.sampleRate * 0.16);
            const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < len; i++) {
              const env = Math.sin((i / len) * Math.PI);
              data[i] = (Math.random() * 2 - 1) * env * 0.35;
            }
            const src = this.ctx.createBufferSource();
            src.buffer = buf;
            const filter = this.ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(1600, this.ctx.currentTime);
            filter.Q.setValueAtTime(1.4, this.ctx.currentTime);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0.12 * this._channelVolume("sfx"), this.ctx.currentTime);
            src.connect(filter);
            filter.connect(g);
            g.connect(this.ctx.destination);
            src.start();
          } catch (_) {}
        }
      }
      this._tone(580, 0.08, "sine", 0.05, 860, 0.03, "sfx");
    }

    playLaserClick() {
      this._tone(1820, 0.022, "square", 0.05, 960, 0, "sfx");
      this._tone(1340, 0.055, "sine", 0.055, 1780, 0.035, "sfx");
    }

    playWheelSpin() {
      [0, 0.055, 0.115, 0.185, 0.27].forEach((t, idx) => {
        this._tone(240 + idx * 55, 0.038, "triangle", 0.075, 180 + idx * 45, t, "sfx");
      });
    }

    playToySound(toyId) {
      if (toyId === "squeaky") {
        this.playToySqueak();
      } else if (toyId === "mouse") {
        this.playMouseWindup();
      } else if (toyId === "feather") {
        this.playFeatherSwish();
      } else if (toyId === "laser") {
        this.playLaserClick();
      } else {
        this.playYarnTap();
      }
    }

    playWaterSip() {
      this._playClip("cat", "water_lap", 0.78, () => {
        this._tone(520, 0.06, "sine", 0.08, 760, 0, "cat");
        this._tone(640, 0.07, "sine", 0.08, 920, 0.08, "cat");
        this._tone(780, 0.09, "sine", 0.07, 1060, 0.16, "cat");
      });
    }

    playFeederDrop() {
      this._playClip("sfx", "kibble_pour", 0.75, () => {
        this._tone(880, 0.07, "triangle", 0.1, 660, 0, "sfx");
        this._tone(420, 0.08, "sine", 0.12, 260, 0.08, "sfx");
        this._tone(560, 0.11, "sine", 0.11, 780, 0.16, "sfx");
      });
    }

    playBellJingle() {
      this._playClip("sfx", "bell_jingle", 0.65, () => {
        this._tone(1320, 0.09, "sine", 0.08, 1560, 0, "sfx");
        this._tone(1760, 0.11, "sine", 0.06, 1320, 0.06, "sfx");
      });
    }

    playMilestoneUnlock() {
      this._tone(523.25, 0.11, "sine", 0.12, null, 0, "sfx");
      this._tone(659.25, 0.11, "sine", 0.12, null, 0.09, "sfx");
      this._tone(783.99, 0.12, "sine", 0.12, null, 0.18, "sfx");
      this._tone(1046.5, 0.24, "sine", 0.14, null, 0.27, "sfx");
    }

    playMusicPreview() {
      this.unlock();
      this._tone(523.25, 0.25, "sine", 0.045, null, 0, "music");
      this._tone(659.25, 0.3, "sine", 0.04, null, 0.1, "music");
    }

    playMeowHappy() {
      this._playVoice(["meow_1", "meow_2"], 0.72, () => {
        this._tone(580, 0.14, "sine", 0.12, 820, 0, "cat");
        this._tone(820, 0.16, "sine", 0.1, 660, 0.11, "cat");
      });
    }

    playMeowGrumpy() {
      this._playVoice("sulk", 0.72, () => {
        this._tone(310, 0.14, "triangle", 0.12, 230, 0, "cat");
        this._tone(240, 0.16, "triangle", 0.1, 180, 0.12, "cat");
      });
    }

    playEat() {
      this._playVoice("eat", 0.78, () => {
        this._tone(420, 0.06, "triangle", 0.12, 300, 0, "cat");
        this._tone(480, 0.06, "triangle", 0.12, 340, 0.09, "cat");
        this._tone(640, 0.16, "sine", 0.13, 860, 0.18, "cat");
      });
    }

    playPurr(duration = 0.95) {
      if (!this._isChannelActive("cat")) return;
      this.unlock();
      const perfNow = performance.now();
      if (perfNow - this.lastPurrAt < 1200) return;
      this.lastPurrAt = perfNow;

      this._playVoice("purr", 0.65, () => {
        if (!this._isChannelActive("cat") || !this.ctx || this.ctx.state !== "running") return;
        const now = this.ctx.currentTime;
        const catGain = Math.max(0.001, 0.068 * this.catVolume);
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(195, now);

        const carrierLow = this.ctx.createOscillator();
        carrierLow.type = "triangle";
        carrierLow.frequency.setValueAtTime(54, now);

        const carrierHarm = this.ctx.createOscillator();
        carrierHarm.type = "sine";
        carrierHarm.frequency.setValueAtTime(108, now);

        const lfo = this.ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(24, now);

        const lfoDepth = this.ctx.createGain();
        lfoDepth.gain.setValueAtTime(0.032 * this.catVolume, now);

        const masterGain = this.ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(catGain, now + 0.09);
        masterGain.gain.setValueAtTime(catGain, now + Math.max(0.12, duration - 0.2));
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        const harmGain = this.ctx.createGain();
        harmGain.gain.setValueAtTime(0.45, now);

        lfo.connect(lfoDepth);
        lfoDepth.connect(masterGain.gain);
        carrierLow.connect(filter);
        carrierHarm.connect(harmGain);
        harmGain.connect(filter);
        filter.connect(masterGain);
        masterGain.connect(this.ctx.destination);

        carrierLow.start(now);
        carrierHarm.start(now);
        lfo.start(now);
        carrierLow.stop(now + duration + 0.03);
        carrierHarm.stop(now + duration + 0.03);
        lfo.stop(now + duration + 0.03);
      }, true);
    }

    playCry() {
      this._playVoice("cry", 0.72, () => {
        this._tone(460, 0.22, "sine", 0.11, 320, 0, "cat");
        this._tone(360, 0.28, "sine", 0.11, 240, 0.2, "cat");
      });
    }

    playYawn() {
      this._playVoice("yawn", 0.7, () => {
        this._tone(360, 0.24, "sine", 0.09, 620, 0, "cat");
        this._tone(620, 0.26, "sine", 0.08, 410, 0.2, "cat");
      });
    }

    playFainted() {
      this._playVoice("fainted", 0.72, () => {
        this._tone(620, 0.18, "sine", 0.11, 220, 0, "cat");
        this._tone(420, 0.22, "triangle", 0.09, 140, 0.16, "cat");
      });
    }

    playTickle() {
      this._playVoice("sneeze", 0.78, () => {
        if (!this._isChannelActive("cat")) return;
        this._tone(740, 0.05, "triangle", 0.08, 1180, 0, "cat");
        setTimeout(() => this.playMeowHappy(), 130);
      });
    }
  }

  global.SoundEngine = SoundEngine;
})(window);
