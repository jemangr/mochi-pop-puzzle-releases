/**
 * Soft-3D Clay Procedural Pet ("Mochi") rendered on HTML5 Canvas at 60 FPS.
 * Inspired by vinyl/clay 3D character shading: smooth radial gradients, ambient occlusion,
 * independent 2.5D head/body/ear/paw/tail rig, and coat skins.
 */
(function (global) {
  const COAT_SKINS = {
    orange: {
      furLight: "#ffb65c",
      furMid: "#ee8228",
      furDark: "#b85012",
      outline: "rgba(128, 48, 10, 0.34)",
      stripe: "#c85110",
      creamLight: "#fff4e6",
      creamMid: "#f2d8bc",
      creamDark: "#c7a37e",
      earInner: "#e98a7d",
      cheek: "rgba(244, 110, 84, 0.48)",
      nose: "#f07c78"
    },
    calico: {
      furLight: "#fffcf7",
      furMid: "#f3e5d4",
      furDark: "#c5af99",
      outline: "rgba(125, 92, 68, 0.3)",
      stripe: "#eb7f2a",
      creamLight: "#ffffff",
      creamMid: "#f6ecdf",
      creamDark: "#d2c1ae",
      earInner: "#f29ba7",
      cheek: "rgba(255, 134, 152, 0.48)",
      nose: "#f48599"
    },
    latte: {
      furLight: "#ebd0b6",
      furMid: "#cfa884",
      furDark: "#8c6140",
      outline: "rgba(92, 56, 30, 0.34)",
      stripe: "#966541",
      creamLight: "#fff8f0",
      creamMid: "#ebd8c3",
      creamDark: "#bfa58b",
      earInner: "#dfa09c",
      cheek: "rgba(235, 135, 130, 0.44)",
      nose: "#c9766f"
    },
    tuxedo: {
      furLight: "#57556d",
      furMid: "#363447",
      furDark: "#1a1826",
      outline: "rgba(16, 14, 24, 0.42)",
      stripe: "#232130",
      creamLight: "#ffffff",
      creamMid: "#e8e6f0",
      creamDark: "#bab6c9",
      earInner: "#e795a4",
      cheek: "rgba(255, 130, 154, 0.48)",
      nose: "#f0859b"
    }
  };

  class MochiPet {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.state = "happy"; // happy | excited | worried | sad | sulking | eating | sleeping | waking
      this.stateTimer = 0;
      this.onWakeDone = null;
      this.isNight = false;
      this.zzzTimer = 0;
      this.accessory = "none";
      this.skin = "orange";
      this.collar = "none";
      this.hunger = 100;
      this.mood = 100;
      this.treatsCount = 3;

      // 2.5D/3D rig targets & springs
      this.lookTargetX = 0;
      this.lookTargetY = 0;
      this.lookX = 0;
      this.lookY = 0;
      this.turnProgress = 0; // 0 = facing player, 1 = turned away sulking
      this.headYaw = 0;      // -1 = full left profile, 0 = front, +1 = full right profile
      this.bodyYaw = 0;
      this.walkDir = 0;
      this.headTilt = 0;
      this.earSpring = 0;

      this.time = 0;
      this.blinkTimer = 2.6;
      this.blinkAmount = 0; // 0 = open, 1 = closed
      this.isBlinking = false;
      this.bounceBoost = 0;
      this.shakeTime = 0;
      this.fxEnabled = true;

      this.particles = [];
      this.flyingSnacks = [];
      this.draggedSnack = null; // { x, y } when dragging fish from bowl to Mochi
      this.bowlScreenPos = { x: 0, y: 0, r: 28 };
      this.yarnScreenPos = { x: 0, y: 0, r: 22 };
      this.toyScreenPos = { x: 0, y: 0, r: 24 };
      this.fountainScreenPos = { x: -999, y: -999, r: 24 };
      this.feederScreenPos = { x: -999, y: -999, r: 24 };
      this.wheelScreenPos = { x: -999, y: -999, r: 26 };
      this.decor = "pink";
      this.toy = "yarn";
      this.roomGadgets = new Set();
      this.bowlBounce = 0;
      this.yarnBounce = 0;
      this.yarnRot = 0;
      this.toyAnimTimer = 0;
      this.mouseDashOffset = 0;
      this.fountainBounce = 0;
      this.feederBounce = 0;
      this.wheelBounce = 0;
      this.wheelSpin = 0;
      this.birdTimer = 4.5;
      this.laserPos = null;
      this.idleSeconds = 0;
      this.drowsyAmount = 0;
      this.walkOffset = 0;
      this.walkTarget = 0;
      this.walkPhase = 0;
      this.isWalking = false;
      this.roamTimer = 3.5 + Math.random() * 3.5;
      this.curiousTimer = 2.0 + Math.random() * 2.5;
      this.earTwitch = 0;
      this.twitchTimer = 2.8 + Math.random() * 3.5;
      this.isLookingByPlayer = false;
      this.lastScale = 1;
      this.anchorXRatio = 0.58;

      // Secondary spring & living micro-behaviors (fluff lag, kneading, grooming, stretch)
      this.fluffSpring = 0;
      this.fluffVel = 0;
      this.lastTotalLift = 0;
      this.kneadTimer = 0;
      this.kneadCooldown = 7 + Math.random() * 6;
      this.groomTimer = 0;
      this.groomCooldown = 12 + Math.random() * 8;
      this.stretchTimer = 0;
      this.stretchCooldown = 16 + Math.random() * 10;
      this.purrTimer = 0;

      // Solution #3 animated sprite-loop atlas support (auto-activates when manifest.enabled = true)
      this.spritePack = { enabled: false, targetHeight: 118, defaultAnchorY: 28, clips: {} };
      this.activeSpriteKey = "idle";
      this.spriteClipTime = 0;
      this.petVariants = ["pet_1", "pet_2", "pet_3"];
      this.petVariant = "pet_1";
      this.sulkVariants = ["sulk", "sulk_2"];
      this.sulkVariant = "sulk";
      this.celebrateKey = "cheer";
      this.dizzyTimer = 0;
      if (global.MOCHI_SPRITE_CLIPS && global.MOCHI_SPRITE_CLIPS.enabled) {
        this.loadSpritePack(global.MOCHI_SPRITE_CLIPS);
      }

      this._resize();
      window.addEventListener("resize", () => this._resize());
    }

    loadSpritePack(manifest) {
      if (!manifest || !manifest.clips) return;
      this.spritePack = {
        enabled: !!manifest.enabled,
        targetHeight: manifest.targetHeight || 118,
        defaultAnchorY: manifest.defaultAnchorY !== undefined ? manifest.defaultAnchorY : 28,
        clips: {}
      };
      if (!this.spritePack.enabled) return;

      Object.keys(manifest.clips).forEach((key) => {
        const spec = manifest.clips[key];
        if (!spec || !spec.src) return;
        const img = new Image();
        img.src = spec.src;
        this.spritePack.clips[key] = Object.assign({}, spec, { img });
      });
    }

    setDecor(id) {
      this.decor = id || "pink";
    }

    setToy(toyId) {
      this.toy = toyId || "yarn";
      this.toyAnimTimer = 0.6;
      this.bounceBoost = Math.max(this.bounceBoost, 0.45);
    }

    setRoomGadgets(list) {
      this.roomGadgets = new Set(Array.isArray(list) ? list : []);
    }

    setCollar(collarId) {
      this.collar = collarId || "none";
      this.bounceBoost = Math.max(this.bounceBoost, 0.5);
    }

    noteActivity() {
      this.idleSeconds = 0;
    }

    triggerBowlBounce() {
      this.bowlBounce = 1;
    }

    getBowlClientPos() {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: rect.left + this.bowlScreenPos.x,
        y: rect.top + this.bowlScreenPos.y
      };
    }

    _hitTestCircle(clientX, clientY, target) {
      if (!target || target.x < -100) return false;
      const rect = this.canvas.getBoundingClientRect();
      const lx = clientX - rect.left;
      const ly = clientY - rect.top;
      const dx = lx - target.x;
      const dy = ly - target.y;
      return (dx * dx + dy * dy) <= (target.r * target.r);
    }

    isPointOverYarn(clientX, clientY) {
      return this._hitTestCircle(clientX, clientY, this.toyScreenPos);
    }

    isPointOverToy(clientX, clientY) {
      return this._hitTestCircle(clientX, clientY, this.toyScreenPos);
    }

    isPointOverFountain(clientX, clientY) {
      return this.roomGadgets.has("fountain") && this._hitTestCircle(clientX, clientY, this.fountainScreenPos);
    }

    isPointOverFeeder(clientX, clientY) {
      return this.roomGadgets.has("feeder") && this._hitTestCircle(clientX, clientY, this.feederScreenPos);
    }

    isPointOverWheel(clientX, clientY) {
      return this.roomGadgets.has("wheel") && this._hitTestCircle(clientX, clientY, this.wheelScreenPos);
    }

    walkToward(propX) {
      if (this.decor === "box") return;
      this.walkTarget = Math.max(-14, Math.min(26, propX));
      this.roamTimer = Math.max(this.roamTimer, 4.2);
    }

    pokeYarn() {
      this.playActiveToy();
    }

    playActiveToy() {
      this.noteActivity();
      this.yarnBounce = 1;
      this.yarnRot += 1.65;
      this.toyAnimTimer = 1.65;
      this.bounceBoost = Math.max(this.bounceBoost, 0.6);
      this.walkToward(-14);
      if (this.toy === "laser") {
        const rx = (Math.random() < 0.5 ? -1 : 1) * (25 + Math.random() * 48);
        const ry = (Math.random() - 0.5) * 18;
        this.laserPos = { dx: rx, dy: ry };
        this.lookTargetX = rx > 0 ? 0.7 : -0.7;
        this.lookTargetY = 0.25;
      } else if (this.toy === "mouse") {
        this.mouseDashOffset = -18;
        this.walkTarget = Math.max(-14, Math.min(26, this.walkOffset + (Math.random() < 0.5 ? -14 : 18)));
      } else if (this.toy === "squeaky") {
        this.toyAnimTimer = 1.85;
        this.bounceBoost = Math.max(this.bounceBoost, 0.72);
      }
      if (this.state === "happy" || this.state === "sleeping" || this.state === "waking") {
        const toyClip = (this.toy === "feather" || this.toy === "laser") ? "track_toy" : "play_pounce";
        this.triggerCelebrate(toyClip, 1.85);
      }
      this.spawnHearts(3);
    }

    triggerFountainSip() {
      this.noteActivity();
      this.fountainBounce = 1;
      this.bounceBoost = Math.max(this.bounceBoost, 0.45);
      this.walkToward(-42);
      if (this.state !== "sulking" && this.state !== "sad" && this.state !== "fainted") {
        this.triggerCelebrate("drink", 2.0);
      }
      if (this.fxEnabled && this.fountainScreenPos.x > 0) {
        for (let i = 0; i < 4; i++) {
          this.particles.push({
            kind: "water",
            x: this.fountainScreenPos.x + (Math.random() - 0.5) * 16,
            y: this.fountainScreenPos.y - 8,
            vx: (Math.random() - 0.5) * 26,
            vy: -32 - Math.random() * 18,
            life: 0.9,
            size: 13
          });
        }
      }
      this.spawnHearts(2);
    }

    triggerFeederDispense() {
      this.noteActivity();
      this.feederBounce = 1;
      this.bowlBounce = 1;
      this.bounceBoost = Math.max(this.bounceBoost, 0.55);
      this.walkToward(38);
      this.spawnHearts(3);
    }

    triggerWheelSpin() {
      this.noteActivity();
      this.wheelBounce = 1.4;
      this.bounceBoost = Math.max(this.bounceBoost, 0.65);
      this.walkToward(42);
      this.triggerCelebrate("play_pounce", 1.8);
      this.spawnHearts(3);
    }

    _resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = Math.max(1, rect.width);
      this.height = Math.max(1, rect.height);
      this.canvas.width = Math.round(this.width * dpr);
      this.canvas.height = Math.round(this.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setLookAt(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      const cx = rect.left + rect.width * this.anchorXRatio + this.walkOffset * this.lastScale;
      const cy = rect.top + rect.height * 0.55;
      const dx = (clientX - cx) / (rect.width * 0.55);
      const dy = (clientY - cy) / (rect.height * 0.75);
      this.lookTargetX = Math.max(-1, Math.min(1, dx));
      this.lookTargetY = Math.max(-1, Math.min(1, dy));
      this.isLookingByPlayer = true;
    }

    resetLook() {
      this.lookTargetX = 0;
      this.lookTargetY = 0;
      this.isLookingByPlayer = false;
    }

    setStats(hunger, mood, treatsCount = this.treatsCount) {
      this.hunger = hunger;
      this.mood = mood;
      this.treatsCount = treatsCount;
    }

    setAccessory(acc) {
      this.accessory = acc || "none";
      this.bounceBoost = 1;
      this.spawnHearts(4);
    }

    setSkin(skinId) {
      this.skin = COAT_SKINS[skinId] ? skinId : "orange";
      this.bounceBoost = 1;
      this.spawnHearts(4);
    }

    setFxEnabled(enabled) {
      this.fxEnabled = !!enabled;
      if (!this.fxEnabled) {
        this.particles = [];
      }
    }

    setNight(isNight) {
      this.isNight = !!isNight;
    }

    _pickNextVariant(list, current) {
      const choices = list.filter((k) => this.spritePack.clips[k]);
      if (!choices.length) return current;
      if (choices.length === 1) return choices[0];
      const others = choices.filter((k) => k !== current);
      return others[Math.floor(Math.random() * others.length)];
    }

    triggerState(newState, duration = 0, onDone = null) {
      this.state = newState;
      this.stateTimer = duration;
      this.onWakeDone = onDone;
      if (newState === "excited" || newState === "eating") {
        this.bounceBoost = 1;
      }
      if (newState === "sulking") {
        this.sulkVariant = this._pickNextVariant(this.sulkVariants, this.sulkVariant);
        this.shakeTime = 0.25;
      }
      if (newState === "tickle" || newState === "fainted") {
        this.spriteClipTime = 0;
        this.purrTimer = 0;
      }
    }

    triggerCelebrate(clipKey = "cheer", duration = 1.8) {
      this.celebrateKey = clipKey || "cheer";
      this.triggerState("excited", duration);
    }

    poke() {
      if (this.state === "fainted") {
        this.shakeTime = 0.22;
        return "fainted";
      }
      if (this.state === "tickle") {
        return "tickle";
      }
      if (this.state === "sulking") {
        this.sulkVariant = this._pickNextVariant(this.sulkVariants, this.sulkVariant);
        this.shakeTime = 0.35;
        this.spawnPuff(2);
        return "sulking";
      }
      if (this.state === "sleeping") {
        return "sleeping";
      }
      if (this.state === "sad") {
        this.shakeTime = 0.25;
        return "sad";
      }
      this.petVariant = this._pickNextVariant(this.petVariants, this.petVariant);
      this.bounceBoost = 1;
      this.spawnHearts(4);
      return "happy";
    }

    spawnHearts(count = 3) {
      if (!this.fxEnabled) return;
      const cx = this.width * this.anchorXRatio + this.walkOffset * this.lastScale;
      const cy = this.height * 0.42;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          kind: "heart",
          x: cx + (Math.random() - 0.5) * 74,
          y: cy - 10 + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 28,
          vy: -42 - Math.random() * 34,
          life: 1.0,
          size: 11 + Math.random() * 6
        });
      }
    }

    spawnPuff(count = 2) {
      if (!this.fxEnabled) return;
      const cx = this.width * this.anchorXRatio + this.walkOffset * this.lastScale + 34;
      const cy = this.height * 0.34;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          kind: "anger",
          x: cx + (Math.random() - 0.5) * 22,
          y: cy + (Math.random() - 0.5) * 14,
          vx: 14 + Math.random() * 14,
          vy: -22 - Math.random() * 14,
          life: 0.9,
          size: 14
        });
      }
    }

    spawnSnackFeed(startX, startY) {
      this.flyingSnacks.push({
        x: startX,
        y: startY,
        tx: this.width * this.anchorXRatio + this.walkOffset * this.lastScale,
        ty: this.height * 0.58,
        t: 0
      });
    }

    isPointOverBowl(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      const lx = clientX - rect.left;
      const ly = clientY - rect.top;
      const dx = lx - this.bowlScreenPos.x;
      const dy = ly - this.bowlScreenPos.y;
      return (dx * dx + dy * dy) <= (this.bowlScreenPos.r * this.bowlScreenPos.r);
    }

    isPointNearMouth(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      const lx = clientX - rect.left;
      const ly = clientY - rect.top;
      const mx = this.width * this.anchorXRatio + this.walkOffset * this.lastScale;
      const my = this.height * 0.54;
      const dx = lx - mx;
      const dy = ly - my;
      return (dx * dx + dy * dy) <= (58 * 58);
    }

    isPointOverCat(clientX, clientY) {
      return this.getPetZone(clientX, clientY) !== null;
    }

    getPetZone(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      const lx = clientX - rect.left;
      const ly = clientY - rect.top;
      const cx = this.width * this.anchorXRatio + this.walkOffset * this.lastScale;
      const cy = this.height * 0.56;
      const rx = 50 * this.lastScale;
      const ry = 48 * this.lastScale;
      const nx = (lx - cx) / rx;
      const ny = (ly - cy) / ry;
      if ((nx * nx + ny * ny) > 1) return null;
      if (ny < -0.35) return "ears";
      if (ny >= 0.08 && Math.abs(nx) < 0.58) return "chin";
      return "body";
    }

    startPurr(duration = 1.0, cycleVariant = false) {
      if (cycleVariant || this.purrTimer <= 0) {
        this.petVariant = this._pickNextVariant(this.petVariants, this.petVariant);
      }
      this.purrTimer = Math.max(this.purrTimer, duration);
      this.bounceBoost = Math.max(this.bounceBoost, 0.25);
      this.spawnHearts(2);
    }

    setDraggedSnack(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      this.draggedSnack = {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
      this.setLookAt(clientX, clientY);
    }

    clearDraggedSnack() {
      this.draggedSnack = null;
      this.resetLook();
    }

    update(dt) {
      this.time += dt;
      this.lookX += (this.lookTargetX - this.lookX) * Math.min(1, dt * 9);
      this.lookY += (this.lookTargetY - this.lookY) * Math.min(1, dt * 9);

      // Smooth 2.5D/3D head tilt & directional yaw interpolation (overlapping action: head leads body!)
      const targetTilt = this.state === "sad"
        ? -0.09
        : this.state === "excited"
          ? Math.sin(this.time * 10) * 0.08
          : this.drowsyAmount > 0.3
            ? Math.sin(this.time * 1.4) * 0.07
            : this.lookX * 0.09;
      this.headTilt += (targetTilt - this.headTilt) * Math.min(1, dt * 8);

      if (this.bounceBoost > 0) {
        this.bounceBoost = Math.max(0, this.bounceBoost - dt * 2.6);
      }
      if (this.shakeTime > 0) {
        this.shakeTime = Math.max(0, this.shakeTime - dt);
      }
      if (this.purrTimer > 0) {
        this.purrTimer = Math.max(0, this.purrTimer - dt);
      }
      this.spriteClipTime += dt;
      if (this.bowlBounce > 0) {
        this.bowlBounce = Math.max(0, this.bowlBounce - dt * 3.8);
      }
      if (this.yarnBounce > 0) {
        this.yarnBounce = Math.max(0, this.yarnBounce - dt * 2.4);
        this.yarnRot += dt * 4.5 * this.yarnBounce;
      }

      if (this.state === "sleeping" || this.state === "waking" || this.state === "eating" || this.state === "fainted" || this.state === "tickle" || this.draggedSnack) {
        this.idleSeconds = 0;
      } else {
        this.idleSeconds += dt;
      }
      const targetDrowsy = (this.state === "happy" && this.idleSeconds > 12) ? 1 : 0;
      this.drowsyAmount += (targetDrowsy - this.drowsyAmount) * Math.min(1, dt * 2.5);

      // Autonomous movement, window curiosity & ear twitches when player pauses 16s+
      if (this.earTwitch > 0) {
        this.earTwitch = Math.max(0, this.earTwitch - dt * 4.5);
      }
      if (this.state !== "sleeping" && this.state !== "sad" && this.state !== "fainted") {
        this.twitchTimer -= dt;
        if (this.twitchTimer <= 0) {
          this.earTwitch = 1;
          this.twitchTimer = 3.2 + Math.random() * 4.5;
        }
        if (this.state === "happy" && this.idleSeconds > 16 && !this.isWalking) {
          this.curiousTimer = (this.curiousTimer ?? 2.0) - dt;
          if (this.curiousTimer <= 0) {
            this.curiousTimer = 18 + Math.random() * 10;
            this.earTwitch = 1;
            this.targetLookX = this.weather === "rain" || this.weather === "snow" ? -0.95 : (Math.random() > 0.5 ? 0.7 : -0.7);
            this.targetLookY = -0.35;
            if (this.idleGlanceCount !== undefined) this.idleGlanceCount++;
            else this.idleGlanceCount = 1;
          }
        }
      }

      if (this.toyAnimTimer > 0) {
        this.toyAnimTimer = Math.max(0, this.toyAnimTimer - dt);
        if (this.toyAnimTimer <= 0) {
          this.laserPos = null;
          this.mouseDashOffset = 0;
        } else if (this.toy === "mouse") {
          this.mouseDashOffset = Math.sin(this.toyAnimTimer * 13) * 20;
        }
      }
      if (this.fountainBounce > 0) {
        this.fountainBounce = Math.max(0, this.fountainBounce - dt * 2.5);
      }
      if (this.feederBounce > 0) {
        this.feederBounce = Math.max(0, this.feederBounce - dt * 2.5);
      }
      if (this.wheelBounce > 0) {
        this.wheelBounce = Math.max(0, this.wheelBounce - dt * 1.15);
        this.wheelSpin += dt * (4.5 + this.wheelBounce * 5.5);
      }
      if (this.roomGadgets.has("bird_feeder")) {
        this.birdTimer -= dt;
        if (this.birdTimer <= 0) {
          this.birdTimer = 5.5 + Math.random() * 5;
          if (this.state === "happy" && !this.isLookingByPlayer) {
            this.lookTargetX = 0.8;
            this.lookTargetY = -0.45;
            this.earTwitch = 1;
          }
        }
      }

      const canRoam = this.state === "happy" && this.drowsyAmount < 0.25 && this.purrTimer <= 0 && !this.draggedSnack;
      if (canRoam) {
        this.roamTimer -= dt;
        if (this.roamTimer <= 0) {
          const minWalk = this.decor === "box" ? -8 : -12;
          const maxWalk = this.decor === "box" ? 10 : 24;
          const spots = [minWalk, minWalk * 0.45, 0, maxWalk * 0.5, maxWalk];
          const next = spots[Math.floor(Math.random() * spots.length)];
          this.walkTarget = Math.abs(next - this.walkOffset) < 6 ? 0 : next;
          this.roamTimer = 4.5 + Math.random() * 4.5;
        }
      } else if (this.state === "sleeping" || this.state === "sad" || this.state === "fainted" || this.state === "tickle" || this.decor === "box") {
        this.walkTarget = 0;
      }

      const walkDiff = this.walkTarget - this.walkOffset;
      if (Math.abs(walkDiff) > 1.2 && (canRoam || this.walkTarget === 0)) {
        const wasWalking = this.isWalking;
        this.isWalking = true;
        const step = Math.sign(walkDiff) * Math.min(Math.abs(walkDiff), 34 * dt);
        this.walkOffset += step;
        this.walkPhase += dt * 13.5;

        if (!this.isLookingByPlayer) {
          this.lookTargetX = walkDiff > 0 ? 0.65 : -0.65;
          this.lookTargetY = 0.08;
        }
        // Playfully nudge the yarn ball when trotting near it!
        if (!wasWalking && this.walkTarget < -26 && this.yarnBounce <= 0) {
          this.yarnBounce = 0.5;
        } else if (this.walkOffset < -30 && this.walkTarget < -30 && this.yarnBounce <= 0 && Math.abs(walkDiff) < 4) {
          this.yarnBounce = 0.72;
        }
      } else {
        if (this.isWalking) {
          this.isWalking = false;
          if (!this.isLookingByPlayer) {
            this.lookTargetX = 0;
            this.lookTargetY = 0;
          }
          if (Math.random() < 0.35) {
            this.bounceBoost = Math.max(this.bounceBoost, 0.5);
          }
        }
        this.walkOffset += walkDiff * Math.min(1, dt * 8);
        this.walkPhase = 0;

        // Curious glances around while resting + spontaneous living behaviors (kneading, grooming, stretch)
        if (canRoam && !this.isLookingByPlayer) {
          this.curiousTimer -= dt;
          if (this.curiousTimer <= 0) {
            this.lookTargetX = (Math.random() - 0.5) * 0.95;
            this.lookTargetY = (Math.random() - 0.45) * 0.5;
            this.curiousTimer = 2.4 + Math.random() * 2.6;
          }
        }
      }

      // Spontaneous living micro-animations while happy & still
      if (canRoam && !this.isWalking) {
        if (this.kneadTimer > 0) {
          this.kneadTimer -= dt;
        } else if (this.groomTimer > 0) {
          this.groomTimer -= dt;
        } else if (this.stretchTimer > 0) {
          this.stretchTimer -= dt;
        } else {
          this.kneadCooldown -= dt;
          this.groomCooldown -= dt;
          this.stretchCooldown -= dt;
          if (this.kneadCooldown <= 0) {
            this.kneadTimer = 2.6;
            this.kneadCooldown = 11 + Math.random() * 8;
          } else if (this.groomCooldown <= 0) {
            this.groomTimer = 2.0;
            this.groomCooldown = 15 + Math.random() * 10;
          } else if (this.stretchCooldown <= 0) {
            this.stretchTimer = 2.1;
            this.stretchCooldown = 18 + Math.random() * 11;
          }
        }
      } else {
        this.kneadTimer = 0;
        this.groomTimer = 0;
        this.stretchTimer = 0;
      }

      // Compute continuous 3D body & head yaw (-1 left profile, 0 front, +1 right profile)
      let targetBodyYaw = this.lookX * 0.22;
      let targetHeadYaw = this.lookX * 0.38;
      if (this.state === "sulking") {
        targetBodyYaw = -0.94;
        targetHeadYaw = -0.96 + this.lookX * 0.1;
      } else if (this.isWalking) {
        this.walkDir = walkDiff >= 0 ? 1 : -1;
        targetBodyYaw = this.walkDir * 0.56;
        targetHeadYaw = this.walkDir * 0.62 + this.lookX * 0.14;
      } else if (this.state === "sleeping" || this.state === "waking" || this.state === "eating") {
        targetBodyYaw = this.lookX * 0.08;
        targetHeadYaw = this.lookX * 0.14;
      }
      targetBodyYaw = Math.max(-1, Math.min(1, targetBodyYaw));
      targetHeadYaw = Math.max(-1, Math.min(1, targetHeadYaw));
      this.bodyYaw += (targetBodyYaw - this.bodyYaw) * Math.min(1, dt * 5.8);
      this.headYaw += (targetHeadYaw - this.headYaw) * Math.min(1, dt * 8.5);
      this.turnProgress = Math.min(1, Math.abs(this.headYaw));

      // Secondary spring physics for fluffy fur, tufts & tail inertia
      const currentLift = Math.sin(this.bounceBoost * Math.PI) * 18 + (this.isWalking ? Math.abs(Math.sin(this.walkPhase)) * 3.8 : 0);
      const liftAccel = (currentLift - this.lastTotalLift) / Math.max(0.008, dt);
      this.lastTotalLift = currentLift;
      this.fluffVel += (-this.fluffSpring * 140 - this.fluffVel * 14 - liftAccel * 0.04) * dt;
      this.fluffSpring = Math.max(-1.6, Math.min(1.6, this.fluffSpring + this.fluffVel * dt));

      if (this.stateTimer > 0) {
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          if (this.onWakeDone) {
            const cb = this.onWakeDone;
            this.onWakeDone = null;
            cb();
          } else {
            this.state = (this.hunger < 35 || this.mood < 35) ? "sulking" : "happy";
          }
        }
      }

      // Floating Zzz & Night Dream bubbles when sleeping, dizzy stars when fainted
      if (this.state === "sleeping") {
        this.zzzTimer -= dt;
        if (this.zzzTimer <= 0) {
          this.zzzTimer = 0.9;
          if (this.fxEnabled) {
            this.particles.push({
              kind: "zzz",
              x: this.width * 0.5 + 24,
              y: this.height * 0.36,
              vx: 10 + Math.random() * 6,
              vy: -24 - Math.random() * 8,
              life: 1.2,
              size: 13
            });
          }
        }
        this.dreamTimer = (this.dreamTimer ?? 2.4) - dt;
        if (this.dreamTimer <= 0) {
          this.dreamTimer = 3.6 + Math.random() * 2.2;
          if (this.isNight && this.fxEnabled) {
            const dreams = ["💭🐟", "💭🧶", "💭👑"];
            this.particles.push({
              kind: "dream",
              text: dreams[Math.floor(Math.random() * dreams.length)],
              x: this.width * this.anchorXRatio - 26,
              y: this.height * 0.34,
              vx: -6 + Math.random() * 12,
              vy: -16,
              life: 1.85,
              size: 15
            });
          }
        }
      } else if (this.state === "fainted") {
        this.dizzyTimer -= dt;
        if (this.dizzyTimer <= 0) {
          this.dizzyTimer = 1.05;
          if (this.fxEnabled) {
            this.particles.push({
              kind: "dizzy",
              x: this.width * this.anchorXRatio + (Math.random() - 0.5) * 34,
              y: this.height * 0.48,
              vx: (Math.random() - 0.5) * 14,
              vy: -22 - Math.random() * 8,
              life: 1.15,
              size: 14
            });
          }
        }
      }

      // Smooth blinking
      this.blinkTimer -= dt;
      if (this.blinkTimer <= 0) {
        if (!this.isBlinking) {
          this.isBlinking = true;
          this.blinkTimer = 0.14;
        } else {
          this.isBlinking = false;
          this.blinkTimer = 2.4 + Math.random() * 2.6;
        }
      }
      const targetBlink = this.isBlinking ? 1 : 0;
      this.blinkAmount += (targetBlink - this.blinkAmount) * Math.min(1, dt * 28);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt * 0.9;
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      for (let i = this.flyingSnacks.length - 1; i >= 0; i--) {
        const s = this.flyingSnacks[i];
        s.t += dt * 2.7;
        if (s.t >= 1) {
          this.flyingSnacks.splice(i, 1);
          this.triggerState("eating", 1.15);
          this.spawnHearts(5);
        }
      }
    }

    draw() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      ctx.clearRect(0, 0, w, h);

      const pal = COAT_SKINS[this.skin] || COAT_SKINS.orange;
      const cx = w * this.anchorXRatio;
      const baseY = h * 0.72;
      const baseScale = Math.min(1.16, Math.max(0.84, h / 176));
      const scale = (w >= 320 && h >= 320)
        ? Math.max(baseScale, Math.min(1.52, w / 280, h / 260))
        : baseScale;
      this.lastScale = scale;

      const breathRate = this.state === "sleeping" ? 1.8 : 3.0;
      const breath = Math.sin(this.time * breathRate);
      const usingSprites = this.spritePack && this.spritePack.enabled && this.spritePack.clips.idle;
      const jump = Math.sin(this.bounceBoost * Math.PI) * (usingSprites ? 8 : 18);
      const excitedHop = (!usingSprites && this.state === "excited") ? Math.abs(Math.sin(this.time * 9)) * 7 : 0;
      const walkHop = (!usingSprites && this.isWalking) ? Math.abs(Math.sin(this.walkPhase)) * 3.8 : 0;
      const walkLean = (!usingSprites && this.isWalking) ? Math.sin(this.walkPhase) * 0.032 : 0;
      const wakeStretch = (!usingSprites && this.state === "waking") ? Math.sin(Math.min(1, this.stateTimer) * Math.PI) * 0.09 : 0;
      const idleStretch = (!usingSprites && this.stretchTimer > 0) ? Math.sin(Math.min(1, (2.1 - this.stretchTimer) / 2.1) * Math.PI) * 0.09 : 0;
      const totalStretch = wakeStretch + idleStretch;
      const totalLift = jump + excitedHop + walkHop;
      const shakeX = this.shakeTime > 0
        ? Math.sin(this.time * 54) * 4
        : (!usingSprites && this.purrTimer > 0)
          ? Math.sin(this.time * 46) * 0.65
          : 0;
      const catX = cx + this.walkOffset * scale;

      // Ambient Room Gadgets (Fairy lights, Bird Feeder, Heated Cushion, Plush Cat Tower, Catnip Plant, Wheel, Fountain, Dispenser)
      if (this.roomGadgets.has("lights")) {
        this._drawFairyLights(ctx, w);
      }
      if (this.roomGadgets.has("bird_feeder")) {
        this._drawBirdFeeder(ctx, Math.min(w - 28 * scale, cx + 106 * scale), 30 * scale, scale);
      }
      if (this.roomGadgets.has("cushion")) {
        this._drawHeatedCushion(ctx, cx, baseY + 21 * scale, scale);
      }
      if (this.roomGadgets.has("tower")) {
        this._drawCatTower(ctx, Math.min(w - 38 * scale, cx + 128 * scale), baseY + 6 * scale, scale);
      }
      if (this.roomGadgets.has("plant")) {
        this._drawCatnipPlant(ctx, Math.max(30 * scale, cx - 134 * scale), baseY + 4 * scale, scale);
      }
      if (this.roomGadgets.has("wheel")) {
        const wx = Math.min(w - 34 * scale, cx + 114 * scale);
        const wy = baseY - 2 * scale;
        this.wheelScreenPos = { x: wx, y: wy, r: 26 * scale };
        this._drawCatWheel(ctx, wx, wy, scale);
      } else {
        this.wheelScreenPos = { x: -999, y: -999, r: 0 };
      }

      if (this.roomGadgets.has("fountain")) {
        const fx = Math.max(36 * scale, cx - 122 * scale);
        const fy = baseY + 18 * scale;
        this.fountainScreenPos = { x: fx, y: fy, r: 24 * scale };
        this._drawWaterFountain(ctx, fx, fy, scale);
      } else {
        this.fountainScreenPos = { x: -999, y: -999, r: 0 };
      }

      // Draw active interactive toy on left & ceramic bowl on right
      const toyX = cx - 70 * scale;
      const toyY = baseY + 25 * scale;
      this.toyScreenPos = { x: toyX, y: toyY, r: 25 * scale };
      this.yarnScreenPos = this.toyScreenPos;
      this._drawActiveToy(ctx, toyX, toyY, scale);

      const bowlX = Math.min(w - 32 * scale, cx + 72 * scale);
      const bowlY = baseY + 26 * scale;
      this.bowlScreenPos = { x: bowlX, y: bowlY, r: 28 * scale };
      this._drawFoodBowl(ctx, bowlX, bowlY, scale);

      if (this.roomGadgets.has("feeder")) {
        const fdrX = Math.min(w - 34 * scale, cx + 126 * scale);
        const fdrY = baseY + 16 * scale;
        this.feederScreenPos = { x: fdrX, y: fdrY, r: 25 * scale };
        this._drawAutoFeeder(ctx, fdrX, fdrY, scale);
      } else {
        this.feederScreenPos = { x: -999, y: -999, r: 0 };
      }

      if (this.decor === "box") {
        this._drawCardboardBox(ctx, cx, baseY, scale);
      }

      ctx.save();
      ctx.translate(catX + shakeX, baseY - totalLift);
      ctx.rotate(walkLean);
      ctx.scale(scale, scale);

      // Soft ambient contact shadow under sitting cat
      const bTurn = Math.min(1, Math.abs(this.bodyYaw));
      const shadowShiftX = -this.bodyYaw * 4;
      const shadowGrad = ctx.createRadialGradient(shadowShiftX, 31 + totalLift * 0.45, 6, shadowShiftX, 31 + totalLift * 0.45, 68);
      shadowGrad.addColorStop(0, this.isNight ? "rgba(20, 12, 32, 0.48)" : "rgba(72, 38, 22, 0.34)");
      shadowGrad.addColorStop(0.65, "rgba(72, 38, 22, 0.14)");
      shadowGrad.addColorStop(1, "rgba(72, 38, 22, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(shadowShiftX, 31 + totalLift * 0.45, (64 + bTurn * 6) - totalLift * 0.25, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Solution #3: Render pre-animated sprite loop when sprite pack is enabled & loaded; fallback cleanly otherwise
      if (!this._drawSpriteMochi(ctx, breath)) {
        // 1. Living multi-segment S-curved cartoon tail (behind body)
        this._drawClayTail(ctx, pal);

        // 2. Sculpted 3D Cartoon Body + Torso + Folded Haunches + Jointed Paws
        const sleepWide = this.state === "sleeping" ? 0.045 : 0;
        const bodySquashX = 1 + breath * 0.015 + sleepWide - (totalLift * 0.004) - totalStretch * 0.5;
        const bodySquashY = 1 - breath * 0.015 - sleepWide * 0.7 + (totalLift * 0.005) + totalStretch;
        ctx.save();
        ctx.scale(bodySquashX, bodySquashY);
        this._drawClayBody(ctx, pal, totalStretch);
        ctx.restore();

        // Cozy tail tip wrapping around front paws when peacefully sleeping!
        if (this.state === "sleeping") {
          this._drawSleepingFrontTail(ctx, pal);
        }

        // Neck wear: Cozy Scarf outfit or Swinging Gold-Bell Collar (follows body yaw!)
        if (this.accessory === "scarf") {
          this._drawScarf(ctx);
        } else if (this.collar !== "none") {
          this._drawCollarAndBell(ctx);
        }

        // 3. Independent Morphing 3D Cartoon Cat Head
        const sleepDrop = this.state === "sleeping" ? 7 : 0;
        const headBob = breath * 1.4 + sleepDrop - totalStretch * 28;
        const headParallaxX = this.lookX * 2.5 + this.bodyYaw * 4.5;
        const headParallaxY = this.lookY * 1.8 + headBob;
        ctx.save();
        ctx.translate(headParallaxX, -20 + headParallaxY);
        ctx.rotate(this.headTilt);
        this._drawClayHead(ctx, pal);
        ctx.restore();
      }

      ctx.restore();

      this._drawParticles(ctx);
      this._drawFlyingSnacks(ctx);

      if (this.draggedSnack) {
        ctx.save();
        ctx.shadowColor = "rgba(255, 180, 60, 0.85)";
        ctx.shadowBlur = 12;
        ctx.font = "28px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🐟", this.draggedSnack.x, this.draggedSnack.y);
        ctx.restore();
      }
    }

    _selectSpriteKey() {
      const clips = this.spritePack.clips;
      if (this.state === "fainted" && clips.fainted) return "fainted";
      if (this.state === "sleeping") return "sleep";
      if (this.state === "sad") return "cry";
      if (this.state === "sulking") return clips[this.sulkVariant] ? this.sulkVariant : "sulk";
      if (this.state === "eating") return "eat";
      if (this.state === "tickle" && clips.tickle) return "tickle";
      if (this.state === "waking") return clips.yawn ? "yawn" : "idle";
      if (this.state === "excited") return clips[this.celebrateKey] ? this.celebrateKey : (clips.cheer ? "cheer" : "idle");
      if (this.state === "worried" && clips.nervous) return "nervous";
      if (this.isWalking) return "walk";
      if (this.purrTimer > 0 && this.state === "happy") {
        return clips[this.petVariant] ? this.petVariant : "idle";
      }
      if (this.groomTimer > 0 && this.state === "happy" && clips.groom) return "groom";
      if (this.stretchTimer > 0 && this.state === "happy" && clips.yawn) return "yawn";
      return "idle";
    }

    _mapSpriteFrame(clip, totalFrames, rawIdx) {
      if (clip.loop === false) {
        return Math.min(totalFrames - 1, Math.max(0, rawIdx));
      }
      if (clip.pingpong && totalFrames > 2) {
        const cycle = totalFrames * 2 - 2;
        const m = ((rawIdx % cycle) + cycle) % cycle;
        return m < totalFrames ? m : cycle - m;
      }
      return ((rawIdx % totalFrames) + totalFrames) % totalFrames;
    }

    _interpSpriteAnchor(anchors, fallback, i0, i1, frac) {
      if (!Array.isArray(anchors) || !anchors.length) return fallback;
      const a = anchors[Math.min(i0, anchors.length - 1)] || fallback;
      const b = anchors[Math.min(i1, anchors.length - 1)] || a;
      const len = Math.max(a.length, b.length, fallback.length);
      const out = new Array(len);
      for (let k = 0; k < len; k++) {
        const va = a[k] !== undefined ? a[k] : (fallback[k] || 0);
        const vb = b[k] !== undefined ? b[k] : va;
        out[k] = va + (vb - va) * frac;
      }
      return out;
    }

    _renderSpriteClipAt(ctx, desiredKey, animTime, opts = {}) {
      if (!this.spritePack || !this.spritePack.enabled) return false;
      const clips = this.spritePack.clips;
      const clip = (clips[desiredKey] && clips[desiredKey].img && clips[desiredKey].img.complete && clips[desiredKey].img.naturalWidth > 0)
        ? clips[desiredKey]
        : (clips.idle && clips.idle.img && clips.idle.img.complete && clips.idle.img.naturalWidth > 0 ? clips.idle : null);

      if (!clip) return false;

      const cols = Math.max(1, clip.cols || 1);
      const rows = Math.max(1, clip.rows || 1);
      const totalFrames = Math.max(1, clip.frames || cols * rows);
      const fps = Math.max(1, clip.fps || 12);
      const rawFloat = Math.max(0, animTime * fps);
      const rawFloor = Math.floor(rawFloat);
      const frac = rawFloat - rawFloor;
      const frameIdx = this._mapSpriteFrame(clip, totalFrames, rawFloor);
      const nextFrameIdx = this._mapSpriteFrame(clip, totalFrames, rawFloor + 1);
      const col = frameIdx % cols;
      const row = Math.floor(frameIdx / cols);
      const fw = clip.img.naturalWidth / cols;
      const fh = clip.img.naturalHeight / rows;

      const drawH = (clip.targetHeight || this.spritePack.targetHeight || 118);
      const drawW = drawH * (fw / fh);
      const anchorY = clip.anchorY !== undefined ? clip.anchorY : (this.spritePack.defaultAnchorY || 28);
      const flipSign = opts.flipSign || 1;

      const skinFilters = {
        orange: "",
        calico: "saturate(0.75) brightness(1.06)",
        latte: "sepia(0.28) brightness(0.95)",
        tuxedo: "saturate(0.18) brightness(0.82)"
      };
      const filterParts = [];
      if (skinFilters[this.skin]) filterParts.push(skinFilters[this.skin]);
      if (opts.applyNight !== false && this.isNight) filterParts.push("brightness(0.92) sepia(0.06)");

      ctx.save();
      ctx.scale(flipSign, 1);
      if (filterParts.length) {
        ctx.filter = filterParts.join(" ");
      }
      ctx.drawImage(clip.img, col * fw, row * fh, fw, fh, -drawW * 0.5, anchorY - drawH, drawW, drawH);
      ctx.restore();

      if (clip.hideAccessories) {
        return true;
      }

      const neckOff = clip.neckOffset || { x: 0, y: 8 };
      const headOff = clip.headOffset || { x: 0, y: -19 };
      const defaultProf = clip.sideProfile ? 1 : 0;
      const [hx, hy, hRot, eyeDy, prof] = this._interpSpriteAnchor(
        clip.frameHeadAnchors,
        [headOff.x, headOff.y, 0, 0, defaultProf],
        frameIdx,
        nextFrameIdx,
        frac
      );
      const [nx, ny] = this._interpSpriteAnchor(
        clip.frameNeckAnchors,
        [neckOff.x, neckOff.y],
        frameIdx,
        nextFrameIdx,
        frac
      );
      const spriteOpts = { spriteMode: true, eyeDy: eyeDy || 0, profile: prof || 0 };

      ctx.save();
      ctx.translate(nx * flipSign, ny);
      ctx.scale(flipSign, 1);
      if (hRot) ctx.rotate(hRot * 0.35);
      if (this.accessory === "scarf") {
        this._drawScarf(ctx, spriteOpts);
      } else if (this.collar !== "none") {
        this._drawCollarAndBell(ctx, spriteOpts);
      }
      ctx.restore();

      ctx.save();
      ctx.translate(hx * flipSign, hy);
      ctx.scale(flipSign, 1);
      if (hRot) ctx.rotate(hRot);
      this._drawAccessory(ctx, spriteOpts);
      ctx.restore();
      return true;
    }

    _drawSpriteMochi(ctx, breath) {
      if (!this.spritePack || !this.spritePack.enabled) return false;
      const desiredKey = this._selectSpriteKey();
      const clip = this.spritePack.clips[desiredKey] || this.spritePack.clips.idle;
      if (!clip) return false;

      if (this.activeSpriteKey !== desiredKey) {
        this.activeSpriteKey = desiredKey;
        this.spriteClipTime = 0;
      }

      const flipWalk = desiredKey === "walk" && (clip.facesRightByDefault ? this.walkDir < 0 : this.walkDir > 0);
      return this._renderSpriteClipAt(ctx, desiredKey, this.spriteClipTime, {
        flipSign: flipWalk ? -1 : 1,
        applyNight: true
      });
    }

    drawPreviewCanvas(canvas, themeId = "peach") {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(120, canvas.clientWidth || 260);
      const h = Math.max(84, canvas.clientHeight || 110);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const themeWalls = {
        peach: ["#fff5ea", "#fde1cf", "#f0cab3"],
        beach: ["#e8f8ff", "#cfefff", "#f4dbb2"],
        winter: ["#eef5ff", "#dbe9fb", "#d2dced"]
      };
      const [skyTop, skyBot, floorCol] = this.isNight
        ? ["#241f3d", "#332a52", "#433454"]
        : (themeWalls[themeId] || themeWalls.peach);

      const wallG = ctx.createLinearGradient(0, 0, 0, h * 0.72);
      wallG.addColorStop(0, skyTop);
      wallG.addColorStop(1, skyBot);
      ctx.fillStyle = wallG;
      ctx.fillRect(0, 0, w, h * 0.72);

      ctx.fillStyle = floorCol;
      ctx.fillRect(0, h * 0.72, w, h * 0.28);

      const rugColors = {
        pink: ["rgba(255, 175, 198, 0.58)", "rgba(255, 128, 165, 0.65)"],
        star: ["rgba(182, 164, 255, 0.55)", "rgba(130, 108, 224, 0.65)"],
        box: ["rgba(222, 184, 135, 0.62)", "rgba(180, 138, 86, 0.72)"]
      };
      const [rFill, rEdge] = rugColors[this.decor] || rugColors.pink;
      ctx.fillStyle = rFill;
      ctx.strokeStyle = rEdge;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.79, 54, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const scale = Math.min(1.05, Math.max(0.76, h / 118));
      const baseY = h * 0.61;
      ctx.save();
      ctx.translate(w * 0.5, baseY);
      ctx.scale(scale, scale);

      ctx.fillStyle = "rgba(45, 25, 35, 0.14)";
      ctx.beginPath();
      ctx.ellipse(0, 26, 30, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      const previewClip = (this.spritePack && this.spritePack.enabled)
        ? (this.state === "sleeping" ? "sleep" : (this.state === "excited" ? "cheer" : "idle"))
        : null;
      if (!previewClip || !this._renderSpriteClipAt(ctx, previewClip, this.time, { applyNight: true })) {
        const pal = COAT_SKINS[this.skin] || COAT_SKINS.orange;
        ctx.fillStyle = pal.furMid;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();
        if (this.accessory === "scarf") this._drawScarf(ctx);
        else if (this.collar !== "none") this._drawCollarAndBell(ctx);
        this._drawAccessory(ctx);
      }
      ctx.restore();
    }

    renderPostcardCanvas(canvas, opts = {}) {
      if (!canvas) return;
      const w = 540;
      const h = 680;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");

      const frame = opts.frame || "cozy";
      const poseKey = opts.pose || "cheer";
      const themeId = opts.theme || "peach";
      const caption = (opts.caption || "Mochi Pop! Cozy Vibes 💕").slice(0, 40);
      const showStats = opts.showStats !== false;

      const bgColors = {
        cozy: ["#fff4e8", "#ffe2ec"],
        polaroid: ["#f6f2eb", "#ebe5dc"],
        starlight: ["#1d1836", "#312457"],
        comic: ["#fff9cc", "#ffe2a8"]
      };
      const [bgA, bgB] = bgColors[frame] || bgColors.cozy;
      const outerG = ctx.createLinearGradient(0, 0, w, h);
      outerG.addColorStop(0, bgA);
      outerG.addColorStop(1, bgB);
      ctx.fillStyle = outerG;
      ctx.fillRect(0, 0, w, h);

      const vx = 34;
      const vy = 34;
      const vw = w - 68;
      const vh = frame === "polaroid" ? 465 : 492;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(vx, vy, vw, vh, frame === "polaroid" ? 8 : 26);
      ctx.clip();

      const sceneWalls = {
        peach: ["#fff5ea", "#ffd9c2", "#f0c6ae"],
        beach: ["#dcf5ff", "#bde7ff", "#f6dcaa"],
        winter: ["#e9f3ff", "#cfe3fb", "#dce6f5"]
      };
      const [sTop, sMid, sFloor] = (frame === "starlight" || this.isNight)
        ? ["#241f3f", "#382c5c", "#4b3860"]
        : (sceneWalls[themeId] || sceneWalls.peach);

      const sGrad = ctx.createLinearGradient(vx, vy, vx, vy + vh * 0.72);
      sGrad.addColorStop(0, sTop);
      sGrad.addColorStop(1, sMid);
      ctx.fillStyle = sGrad;
      ctx.fillRect(vx, vy, vw, vh * 0.72);
      ctx.fillStyle = sFloor;
      ctx.fillRect(vx, vy + vh * 0.72, vw, vh * 0.28);

      for (let i = 0; i < 14; i++) {
        const bx = vx + 40 + ((i * 89) % (vw - 80));
        const by = vy + 36 + ((i * 53) % (vh * 0.56));
        const br = 8 + (i % 4) * 6;
        ctx.fillStyle = frame === "starlight" ? "rgba(255, 230, 140, 0.2)" : "rgba(255, 255, 255, 0.32)";
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(255, 168, 194, 0.45)";
      ctx.strokeStyle = "rgba(255, 122, 160, 0.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(w * 0.5, vy + vh * 0.79, 138, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(42, 22, 36, 0.16)";
      ctx.beginPath();
      ctx.ellipse(w * 0.5, vy + vh * 0.78, 80, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(w * 0.5, vy + vh * 0.61);
      ctx.scale(2.55, 2.55);
      const rendered = this._renderSpriteClipAt(ctx, poseKey, this.time, { applyNight: frame === "starlight" });
      if (!rendered) {
        const pal = COAT_SKINS[this.skin] || COAT_SKINS.orange;
        ctx.fillStyle = pal.furMid;
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        if (this.accessory === "scarf") this._drawScarf(ctx);
        else if (this.collar !== "none") this._drawCollarAndBell(ctx);
        this._drawAccessory(ctx);
      }
      ctx.restore();

      if (frame === "comic") {
        ctx.strokeStyle = "#2f263b";
        ctx.lineWidth = 6;
        ctx.strokeRect(vx + 3, vy + 3, vw - 6, vh - 6);
      }

      if (opts.sticker) {
        ctx.save();
        ctx.translate(vx + vw - 52, vy + 52);
        ctx.rotate(0.14);
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        ctx.strokeStyle = "#ff6b8b";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = "34px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(opts.sticker), 0, 2);
        ctx.restore();
      }
      ctx.restore();

      ctx.strokeStyle = frame === "starlight" ? "rgba(255, 214, 110, 0.55)" : "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = frame === "polaroid" ? 6 : 4;
      ctx.beginPath();
      ctx.roundRect(vx, vy, vw, vh, frame === "polaroid" ? 8 : 26);
      ctx.stroke();

      const textCol = frame === "starlight" ? "#fff6dc" : "#2f263b";
      const subCol = frame === "starlight" ? "#cdb8ff" : "#7e685d";
      ctx.textAlign = "center";
      ctx.fillStyle = textCol;
      ctx.font = "900 26px 'Segoe UI', sans-serif";
      ctx.fillText(caption, w * 0.5, vh + 82);

      if (showStats) {
        ctx.fillStyle = subCol;
        ctx.font = "800 15px 'Segoe UI', sans-serif";
        const bestScore = opts.bestScore || 0;
        const lv = opts.friendLevel || 1;
        const streak = opts.streakDays || 1;
        ctx.fillText(`🏆 Best: ${bestScore}   •   💖 Lv.${lv}   •   🔥 ${streak}d`, w * 0.5, vh + 114);
      }

      ctx.fillStyle = frame === "starlight" ? "#ff9dbb" : "#ff6b8b";
      ctx.font = "800 13px 'Segoe UI', sans-serif";
      ctx.fillText("Mochi Pop! 🐱🧩  •  jemangr.app", w * 0.5, h - 22);
    }

    _drawSleepingFrontTail(ctx, pal) {
      const tipX = -21 + Math.sin(this.time * 1.4) * 1.8;
      const g = ctx.createLinearGradient(tipX, 16, 26, 29);
      g.addColorStop(0, this.skin === "tuxedo" ? pal.creamLight : pal.furLight);
      g.addColorStop(0.55, pal.furMid);
      g.addColorStop(1, pal.furDark);

      ctx.save();
      ctx.fillStyle = g;
      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(26, 22);
      ctx.bezierCurveTo(14, 32, -14, 32, tipX, 24);
      ctx.bezierCurveTo(tipX - 6, 18, 2, 15, 22, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Subtle glossy highlight along sleeping tail curl
      ctx.strokeStyle = this.isNight ? "rgba(255, 224, 132, 0.35)" : "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tipX + 4, 21);
      ctx.quadraticCurveTo(4, 24, 18, 20);
      ctx.stroke();
      ctx.restore();
    }

    _drawStar5(ctx, x, y, outerR, innerR) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = -Math.PI * 0.5 + (i * Math.PI) / 5;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    _drawCollarAndBell(ctx, spriteOpts = null) {
      const isPastel = this.collar === "pastel_bell";
      const isStar = this.collar === "star_bell";
      const bandHi = isStar ? "#ffcf70" : isPastel ? "#cbb8ff" : "#ff7b98";
      const bandColor = isStar ? "#f58f29" : isPastel ? "#9879ff" : "#e63963";
      const bandDark = isStar ? "#9e4d00" : isPastel ? "#5d43b8" : "#8f1837";
      const bellSwing = this.fluffSpring * 0.28 + (this.isWalking ? Math.sin(this.walkPhase) * 0.25 : 0);
      const yw = (spriteOpts && spriteOpts.spriteMode) ? -(spriteOpts.profile || 0) * 0.55 : this.bodyYaw;
      const bTurn = Math.min(1, Math.abs(yw));

      ctx.save();
      ctx.translate(yw * 4, -5);

      const leftX = -20 + Math.max(0, yw) * 10;
      const rightX = 20 + Math.min(0, yw) * 10;
      const midX = yw * 15;
      const dipY = 7.5 - bTurn * 1.5;

      // Soft ambient shadow cast onto chest fur
      ctx.strokeStyle = "rgba(38, 14, 4, 0.34)";
      ctx.lineWidth = 7.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(leftX, -1.6);
      ctx.quadraticCurveTo(midX, dipY + 1.6, rightX, -1.6);
      ctx.stroke();

      // Deep leather edge border
      ctx.strokeStyle = bandDark;
      ctx.lineWidth = 6.6;
      ctx.beginPath();
      ctx.moveTo(leftX, -3);
      ctx.quadraticCurveTo(midX, dipY, rightX, -3);
      ctx.stroke();

      // 3D padded strap body with light-to-shadow gradient
      const strapGrad = ctx.createLinearGradient(0, -4, 0, dipY + 1);
      strapGrad.addColorStop(0, bandHi);
      strapGrad.addColorStop(0.5, bandColor);
      strapGrad.addColorStop(1, bandDark);
      ctx.strokeStyle = strapGrad;
      ctx.lineWidth = 5.0;
      ctx.beginPath();
      ctx.moveTo(leftX, -3.2);
      ctx.quadraticCurveTo(midX, dipY - 0.3, rightX, -3.2);
      ctx.stroke();

      // Top glossy sheen & subtle saddle stitching
      ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(leftX + 2, -4.4);
      ctx.quadraticCurveTo(midX, dipY - 1.8, rightX - 2, -4.4);
      ctx.stroke();

      ctx.save();
      ctx.strokeStyle = isStar ? "rgba(255, 244, 175, 0.72)" : "rgba(255, 255, 255, 0.48)";
      ctx.lineWidth = 0.9;
      ctx.setLineDash([2.2, 2.4]);
      ctx.beginPath();
      ctx.moveTo(leftX + 3, -2.5);
      ctx.quadraticCurveTo(midX, dipY + 0.3, rightX - 3, -2.5);
      ctx.stroke();
      ctx.restore();

      // Metallic D-ring clasp + swinging 3D bell
      ctx.translate(midX, dipY * 0.65);
      ctx.strokeStyle = "#d99b26";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, -0.8, 2.1, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(bellSwing);

      // Bell drop shadow
      ctx.fillStyle = "rgba(40, 16, 4, 0.32)";
      ctx.beginPath();
      ctx.arc(0.6, 5.2, 5.6, 0, Math.PI * 2);
      ctx.fill();

      // Metallic sphere bell
      const bellGrad = ctx.createRadialGradient(-2.0, 1.8, 0.8, 0, 4.2, 6.6);
      if (isPastel) {
        bellGrad.addColorStop(0, "#fff8ff");
        bellGrad.addColorStop(0.35, "#ffe4a8");
        bellGrad.addColorStop(0.75, "#e6a844");
        bellGrad.addColorStop(1, "#8f5512");
      } else {
        bellGrad.addColorStop(0, "#fffbe0");
        bellGrad.addColorStop(0.35, "#ffd54f");
        bellGrad.addColorStop(0.78, "#de8c0d");
        bellGrad.addColorStop(1, "#7c4200");
      }
      ctx.fillStyle = bellGrad;
      ctx.strokeStyle = "#6e3900";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(0, 4.2, 5.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Specular gleam + warm lower bounce reflection
      ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
      ctx.beginPath();
      ctx.ellipse(-2.0, 2.1, 1.7, 1.0, -0.55, 0, Math.PI * 2);
      ctx.fill();

      // Engraved bell slit & keyhole (or mini star detail for star_bell)
      if (isStar) {
        ctx.fillStyle = "#fff8c4";
        this._drawStar5(ctx, 0, 3.6, 2.5, 1.1);
        ctx.fill();
      }
      ctx.strokeStyle = "#613500";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(-2.6, 6.2);
      ctx.quadraticCurveTo(0, 6.8, 2.6, 6.2);
      ctx.stroke();
      ctx.fillStyle = "#4d2700";
      ctx.beginPath();
      ctx.arc(0, 6.1, 1.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    _drawScarf(ctx, spriteOpts = null) {
      const sway = this.fluffSpring * 2.2 + (this.isWalking ? Math.sin(this.walkPhase) * 2.5 : Math.sin(this.time * 2.4) * 1);
      const yw = (spriteOpts && spriteOpts.spriteMode) ? -(spriteOpts.profile || 0) * 0.55 : this.bodyYaw;
      const bTurn = Math.min(1, Math.abs(yw));
      ctx.save();
      ctx.translate(yw * 5, -4);

      const tailX = yw * 14 + 3.5 + sway * 0.4;
      const wrapRx = 25 - bTurn * 4.5;

      // Drop shadow onto fur below wrap & dangling end
      ctx.fillStyle = "rgba(38, 12, 6, 0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 3.2, wrapRx, 7.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(tailX + 0.8, 3.5, 11, 20, 4);
      ctx.fill();

      // Trailing knit scarf tail with fringes
      const tailGrad = ctx.createLinearGradient(tailX, 2, tailX + 11, 22);
      tailGrad.addColorStop(0, "#ff6887");
      tailGrad.addColorStop(0.55, "#de2e55");
      tailGrad.addColorStop(1, "#9c1637");
      ctx.fillStyle = tailGrad;
      ctx.strokeStyle = "#7a102b";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(tailX + 1, 2);
      ctx.lineTo(tailX + 10, 2);
      ctx.quadraticCurveTo(tailX + 11.8 + sway * 0.25, 12, tailX + 11 + sway * 0.35, 20);
      ctx.lineTo(tailX + sway * 0.35, 20);
      ctx.quadraticCurveTo(tailX + 0.5 + sway * 0.2, 12, tailX + 1, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cream & gold knit bands on tail + yarn tassels
      ctx.fillStyle = "#fff3e2";
      ctx.fillRect(tailX + 0.8 + sway * 0.24, 13.5, 9.5, 2.8);
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(tailX + 0.8 + sway * 0.24, 11.4, 9.5, 1.3);
      ctx.strokeStyle = "#fff1dc";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      for (const tx of [2, 5.5, 9]) {
        ctx.beginPath();
        ctx.moveTo(tailX + tx + sway * 0.35, 20.2);
        ctx.lineTo(tailX + tx + sway * 0.45, 23.2);
        ctx.stroke();
      }

      // Cozy sculpted neck wrap (curved torus)
      const scarfGrad = ctx.createLinearGradient(0, -6.5, 0, 9);
      scarfGrad.addColorStop(0, "#ff8ca3");
      scarfGrad.addColorStop(0.45, "#f0436b");
      scarfGrad.addColorStop(1, "#a11c3e");
      ctx.fillStyle = scarfGrad;
      ctx.strokeStyle = "#7a102b";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(0, 1, wrapRx, 7.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Knit ribbing creases + cream stripes across wrap
      ctx.strokeStyle = "rgba(110, 10, 35, 0.26)";
      ctx.lineWidth = 1.2;
      for (let gx = -16; gx <= 16; gx += 6) {
        ctx.beginPath();
        ctx.moveTo(gx + yw * 4, -5.2);
        ctx.quadraticCurveTo(gx + 1 + yw * 5, 1, gx + yw * 4, 7.4);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(255, 243, 226, 0.88)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-10 + yw * 6, -5.2);
      ctx.quadraticCurveTo(-8.5 + yw * 6, 1, -7.5 + yw * 6, 7.2);
      ctx.moveTo(9.5 + yw * 4, -5.2);
      ctx.quadraticCurveTo(11 + yw * 4, 1, 11.8 + yw * 4, 7.2);
      ctx.stroke();

      // Soft top rim highlight + front folded knot
      ctx.strokeStyle = "rgba(255, 255, 255, 0.38)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(0, -1.2, wrapRx * 0.72, 3.2, 0, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();

      const knotX = tailX + 1.5 - sway * 0.18;
      const knotGrad = ctx.createRadialGradient(knotX + 1, 1.5, 1, knotX + 3, 3, 7);
      knotGrad.addColorStop(0, "#ff93a9");
      knotGrad.addColorStop(0.6, "#ed3b64");
      knotGrad.addColorStop(1, "#9c1637");
      ctx.fillStyle = knotGrad;
      ctx.strokeStyle = "#7a102b";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.roundRect(knotX - 1.5, -1.5, 10, 8.2, 4);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    _drawFoodBowl(ctx, x, y, scale) {
      const bounce = this.bowlBounce > 0 ? Math.sin(this.bowlBounce * Math.PI) : 0;
      const sx = scale * (1 + bounce * 0.16);
      const sy = scale * (1 - bounce * 0.12);

      ctx.save();
      ctx.translate(x, y - bounce * 4 * scale);
      ctx.scale(sx, sy);

      // Soft ambient contact shadow
      ctx.fillStyle = "rgba(58, 28, 16, 0.28)";
      ctx.beginPath();
      ctx.ellipse(0, 8.8, 22.5, 6.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glazed 3D ceramic bowl body with deep shading & rim shadow
      const bowlGrad = ctx.createLinearGradient(-19, -4, 19, 11);
      bowlGrad.addColorStop(0, "#ffb3c6");
      bowlGrad.addColorStop(0.32, "#ff7d9d");
      bowlGrad.addColorStop(0.76, "#e64972");
      bowlGrad.addColorStop(1, "#a8294c");
      ctx.fillStyle = bowlGrad;
      ctx.beginPath();
      ctx.moveTo(-19, -2);
      ctx.quadraticCurveTo(-16.5, 11.5, 0, 11.5);
      ctx.quadraticCurveTo(16.5, 11.5, 19, -2);
      ctx.closePath();
      ctx.fill();

      // Ceramic outer rim contour
      ctx.strokeStyle = "rgba(130, 26, 56, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glossy specular sheen on front-left of bowl
      ctx.fillStyle = "rgba(255, 255, 255, 0.36)";
      ctx.beginPath();
      ctx.ellipse(-9.5, 4.5, 4.2, 2.1, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Tiny cream paw motif on front ceramic wall
      ctx.fillStyle = "rgba(255, 244, 246, 0.78)";
      ctx.beginPath();
      ctx.ellipse(1.5, 5.2, 2.3, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      for (const [px, py] of [[-0.5, 2.8], [1.5, 2.2], [3.5, 2.8]]) {
        ctx.beginPath();
        ctx.arc(px, py, 0.85, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glazed cream outer & inner rim bevel
      const rimGrad = ctx.createLinearGradient(0, -8, 0, 4);
      rimGrad.addColorStop(0, "#ffffff");
      rimGrad.addColorStop(1, "#ffe6d9");
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.ellipse(0, -2.2, 19, 5.8, 0, 0, Math.PI * 2);
      ctx.fill();

      const wellGrad = ctx.createRadialGradient(0, -2.8, 2, 0, -1.6, 15);
      wellGrad.addColorStop(0, "#f2dfd3");
      wellGrad.addColorStop(1, "#c9a894");
      ctx.fillStyle = wellGrad;
      ctx.beginPath();
      ctx.ellipse(0, -1.7, 14.5, 4.0, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crisp 3D vector golden fish treat inside bowl
      if (this.treatsCount > 0) {
        ctx.save();
        ctx.translate(-0.5, -1.9);
        // Subtle fish contact shadow in bowl
        ctx.fillStyle = "rgba(110, 62, 26, 0.25)";
        ctx.beginPath();
        ctx.ellipse(0, 1.8, 7.5, 2.1, 0, 0, Math.PI * 2);
        ctx.fill();
        // Tail fin
        ctx.fillStyle = "#f59f00";
        ctx.beginPath();
        ctx.moveTo(4.2, 0);
        ctx.lineTo(8.8, -3.2);
        ctx.lineTo(8.0, 0);
        ctx.lineTo(8.8, 3.2);
        ctx.closePath();
        ctx.fill();
        // Golden fish body
        const fishGrad = ctx.createLinearGradient(-7, -3.5, 5, 3.5);
        fishGrad.addColorStop(0, "#fff099");
        fishGrad.addColorStop(0.55, "#ffbe3b");
        fishGrad.addColorStop(1, "#e67e00");
        ctx.fillStyle = fishGrad;
        ctx.beginPath();
        ctx.ellipse(-0.6, 0, 6.2, 3.3, -0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(160, 82, 0, 0.45)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
        // Glossy dorsal catchlight & eye
        ctx.fillStyle = "rgba(255, 255, 255, 0.68)";
        ctx.beginPath();
        ctx.ellipse(-1.8, -1.4, 2.8, 0.9, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2b1d2e";
        ctx.beginPath();
        ctx.arc(-4.2, -0.4, 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    _drawYarnBall(ctx, x, y, scale) {
      const hop = this.yarnBounce > 0 ? Math.abs(Math.sin(this.yarnBounce * Math.PI)) * 12 : 0;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Soft contact shadow
      ctx.fillStyle = "rgba(58, 28, 16, 0.24)";
      ctx.beginPath();
      ctx.ellipse(0, 8.6, 15.5 - hop * 0.2, 4.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Yarn sphere
      ctx.translate(0, -hop);
      ctx.rotate(this.yarnRot);
      const grad = ctx.createRadialGradient(-4.5, -5.5, 2, 0, 0, 14.5);
      grad.addColorStop(0, "#d4f5ff");
      grad.addColorStop(0.45, "#69cfff");
      grad.addColorStop(0.85, "#2b9fd9");
      grad.addColorStop(1, "#186da3");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 13.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(18, 82, 130, 0.45)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Layered woven yarn strands (dark under-groove + cream wool highlight)
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(16, 86, 134, 0.35)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-10.5, -2.5);
      ctx.quadraticCurveTo(0, -8.8, 10.5, -1);
      ctx.moveTo(-9.5, 4.8);
      ctx.quadraticCurveTo(1, -0.4, 9.5, 5.5);
      ctx.moveTo(-3, -11.5);
      ctx.quadraticCurveTo(5, 0, -2, 11.5);
      ctx.stroke();

      ctx.strokeStyle = "rgba(235, 251, 255, 0.72)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 10.4, -0.5, 2.25);
      ctx.moveTo(-10.5, -3);
      ctx.quadraticCurveTo(0, -9.2, 10.5, -1.5);
      ctx.moveTo(-9.5, 4.4);
      ctx.quadraticCurveTo(1, -0.8, 9.5, 5);
      ctx.moveTo(-3.4, -11.5);
      ctx.quadraticCurveTo(4.6, 0, -2.4, 11.5);
      ctx.stroke();

      // Specular fuzz sheen
      ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
      ctx.beginPath();
      ctx.ellipse(-4.5, -5.2, 3.6, 2.0, -0.5, 0, Math.PI * 2);
      ctx.fill();

      // Curled loose tail thread
      ctx.strokeStyle = "#3baee6";
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.moveTo(9.2, 8.2);
      ctx.bezierCurveTo(15, 11.5, 18.5, 8.5, 21.5, 5.5);
      ctx.stroke();
      ctx.restore();
    }

    _drawActiveToy(ctx, x, y, scale) {
      if (this.toy === "mouse") {
        const hop = this.toyAnimTimer > 0 ? Math.abs(Math.sin(this.toyAnimTimer * 14)) * 6 : 0;
        ctx.save();
        ctx.translate(x + this.mouseDashOffset * scale, y - hop * scale);
        ctx.scale(scale, scale);
        ctx.fillStyle = "rgba(58, 28, 16, 0.22)";
        ctx.beginPath();
        ctx.ellipse(0, 7.8 + hop, 14.5, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Curly bouncy pink tail
        ctx.strokeStyle = "#ff759f";
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-11, 2);
        ctx.bezierCurveTo(-18, -1, -21, -7, -15, -10.5);
        ctx.stroke();
        // Metallic brushed-gold wind-up key on back
        ctx.strokeStyle = "#d99a00";
        ctx.fillStyle = "#ffe066";
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.arc(-2, -10.5, 3.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-2, -6.8);
        ctx.lineTo(-2, -3.5);
        ctx.stroke();
        // Shaded plush mouse body
        const mGrad = ctx.createRadialGradient(2, -4, 2, 0, 1, 14);
        mGrad.addColorStop(0, "#ebebf2");
        mGrad.addColorStop(0.55, "#b8bac9");
        mGrad.addColorStop(1, "#7c7e91");
        ctx.fillStyle = mGrad;
        ctx.beginPath();
        ctx.ellipse(0, 1, 13.5, 8.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(70, 68, 92, 0.35)";
        ctx.lineWidth = 0.9;
        ctx.stroke();
        // Two plush ears with pink inner lining
        ctx.fillStyle = "#9d9fb2";
        ctx.beginPath();
        ctx.arc(6.5, -6.5, 4.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff8fb1";
        ctx.beginPath();
        ctx.arc(6.8, -6.2, 2.8, 0, Math.PI * 2);
        ctx.fill();
        // Glossy eye + catchlight + pink nose + whiskers
        ctx.fillStyle = "#261d30";
        ctx.beginPath();
        ctx.arc(9.5, -0.5, 1.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(9.0, -1.0, 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff6b98";
        ctx.beginPath();
        ctx.arc(13.2, 1.2, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(65, 58, 82, 0.45)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(12, 1.5);
        ctx.lineTo(16.5, -0.2);
        ctx.moveTo(12, 2.2);
        ctx.lineTo(16.5, 3.6);
        ctx.stroke();
        ctx.restore();
      } else if (this.toy === "feather") {
        const swing = this.toyAnimTimer > 0 ? Math.sin(this.toyAnimTimer * 12) * 0.45 : Math.sin(this.time * 2.2) * 0.08;
        ctx.save();
        ctx.translate(x, y + 6 * scale);
        ctx.scale(scale, scale);
        // Wand ground shadow
        ctx.fillStyle = "rgba(58, 28, 16, 0.16)";
        ctx.beginPath();
        ctx.ellipse(-2, 3, 12, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.rotate(swing);
        // Polished wood wand stick with highlight
        const stickGrad = ctx.createLinearGradient(-8, 6, 10, -24);
        stickGrad.addColorStop(0, "#d97b29");
        stickGrad.addColorStop(1, "#ffcb77");
        ctx.strokeStyle = stickGrad;
        ctx.lineWidth = 3.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-8, 6);
        ctx.lineTo(10, -24);
        ctx.stroke();
        // Golden bell collar at wand tip
        ctx.fillStyle = "#ffd166";
        ctx.beginPath();
        ctx.arc(10.5, -24, 2.6, 0, Math.PI * 2);
        ctx.fill();
        // Dangling coral & teal layered feathers with quills
        ctx.save();
        ctx.translate(12, -17);
        ctx.rotate(0.35);
        const f1 = ctx.createLinearGradient(0, -9, 0, 9);
        f1.addColorStop(0, "#ff9bb5");
        f1.addColorStop(1, "#e6396b");
        ctx.fillStyle = f1;
        ctx.beginPath();
        ctx.ellipse(0, 0, 4.3, 9.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(0, 7);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.translate(17, -14);
        ctx.rotate(0.68);
        const f2 = ctx.createLinearGradient(0, -8, 0, 8);
        f2.addColorStop(0, "#7ae7dd");
        f2.addColorStop(1, "#1aa89b");
        ctx.fillStyle = f2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 3.8, 8.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(0, 6);
        ctx.stroke();
        ctx.restore();
        ctx.restore();
      } else if (this.toy === "laser") {
        ctx.save();
        ctx.translate(x, y + 2 * scale);
        ctx.scale(scale, scale);
        ctx.fillStyle = "rgba(58, 28, 16, 0.2)";
        ctx.beginPath();
        ctx.ellipse(0, 6.5, 13.5, 3.8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Sleek brushed metallic laser pen body
        ctx.rotate(-0.25);
        const penGrad = ctx.createLinearGradient(0, -4.5, 0, 4.5);
        penGrad.addColorStop(0, "#ffffff");
        penGrad.addColorStop(0.5, "#d8dbe8");
        penGrad.addColorStop(1, "#9aa0b8");
        ctx.fillStyle = penGrad;
        ctx.beginPath();
        ctx.roundRect(-12, -4.2, 22, 8.4, 4.2);
        ctx.fill();
        ctx.strokeStyle = "rgba(82, 88, 112, 0.4)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // Pink anodized collar & tactile trigger button
        ctx.fillStyle = "#ff5c8a";
        ctx.beginPath();
        ctx.roundRect(-3, -2.5, 5.2, 5, 1.5);
        ctx.fill();
        ctx.fillStyle = "#ff1e4d";
        ctx.beginPath();
        ctx.arc(10.8, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (this.toyAnimTimer > 0 && this.laserPos) {
          const lx = x + (85 + this.laserPos.dx + Math.sin(this.time * 14) * 16) * scale;
          const ly = y + (this.laserPos.dy * 0.4 + Math.cos(this.time * 11) * 5) * scale;
          ctx.save();
          // Faint laser beam trajectory
          ctx.strokeStyle = "rgba(255, 45, 90, 0.24)";
          ctx.lineWidth = 1.6 * scale;
          ctx.beginPath();
          ctx.moveTo(x + 9 * scale, y - 1 * scale);
          ctx.lineTo(lx, ly);
          ctx.stroke();
          ctx.fillStyle = "rgba(255, 40, 80, 0.35)";
          ctx.beginPath();
          ctx.arc(lx, ly, 10 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ff1e4d";
          ctx.beginPath();
          ctx.arc(lx, ly, 4 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff5f7";
          ctx.beginPath();
          ctx.arc(lx, ly, 1.5 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else if (this.toy === "squeaky") {
        this._drawSqueezyBall(ctx, x, y, scale);
      } else {
        this._drawYarnBall(ctx, x, y, scale);
      }
    }

    _drawSqueezyBall(ctx, x, y, scale) {
      const b = this.yarnBounce;
      const hop = b > 0 ? Math.abs(Math.sin(b * Math.PI * 2)) * 14 : 0;
      const sqWave = b > 0 ? Math.cos(b * Math.PI * 4) : 0;
      const sx = b > 0 ? 1 - sqWave * 0.22 * b : 1 + Math.sin(this.time * 2.6) * 0.02;
      const sy = b > 0 ? 1 + sqWave * 0.22 * b : 1 - Math.sin(this.time * 2.6) * 0.02;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Soft rubber floor shadow
      ctx.fillStyle = "rgba(85, 42, 20, 0.19)";
      ctx.beginPath();
      ctx.ellipse(0, 8.5, (14 + (sx - 1) * 16 - hop * 0.15), 4.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bouncing & squishing rubber body
      ctx.translate(0, -hop);
      ctx.scale(sx, sy);
      ctx.rotate(Math.sin(this.yarnRot) * 0.25);

      const grad = ctx.createRadialGradient(-4.5, -5.5, 2, 0, 0, 14);
      grad.addColorStop(0, "#fff8b8");
      grad.addColorStop(0.5, "#ffd43b");
      grad.addColorStop(1, "#f08c00");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 13.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(180, 92, 0, 0.45)";
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Specular glossy highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.68)";
      ctx.beginPath();
      ctx.ellipse(-4.8, -5.8, 3.8, 2.2, -0.55, 0, Math.PI * 2);
      ctx.fill();

      // Cute coral rubber paw/polka dimples
      ctx.fillStyle = "#ff6b6b";
      [
        [-5, 3, 2.1],
        [5.2, 4, 2.2],
        [6, -3.5, 1.8],
        [0, 5.2, 2.5]
      ].forEach(([dx, dy, r]) => {
        ctx.beginPath();
        ctx.arc(dx, dy, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Top rubber squeaker valve nozzle
      ctx.fillStyle = "#ff5c8a";
      ctx.beginPath();
      ctx.ellipse(0, -12.6, 3.6, 1.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3b234a";
      ctx.beginPath();
      ctx.ellipse(0, -12.8, 1.4, 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Visual squeak waves radiating when squeezed!
      if (b > 0.12) {
        ctx.strokeStyle = `rgba(255, 92, 138, ${Math.min(0.95, b * 1.1)})`;
        ctx.lineWidth = 1.7;
        ctx.lineCap = "round";
        for (let i = 0; i < 2; i++) {
          const rWave = 6 + i * 4.5 + (1 - b) * 6;
          ctx.beginPath();
          ctx.arc(0, -14, rWave, -Math.PI * 0.78, -Math.PI * 0.22);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    _drawWaterFountain(ctx, x, y, scale) {
      const b = this.fountainBounce > 0 ? Math.sin(this.fountainBounce * Math.PI) * 0.12 : 0;
      const bubble = Math.sin(this.time * 7) * 1.4;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale * (1 + b), scale * (1 - b * 0.8));
      // Base contact shadow
      ctx.fillStyle = "rgba(35, 58, 86, 0.22)";
      ctx.beginPath();
      ctx.ellipse(0, 12.5, 20.5, 5.8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ceramic fountain basin with 3D porcelain shading
      const fGrad = ctx.createLinearGradient(-17, -4, 17, 12);
      fGrad.addColorStop(0, "#ffffff");
      fGrad.addColorStop(0.42, "#d8f3ff");
      fGrad.addColorStop(0.85, "#83cef0");
      fGrad.addColorStop(1, "#4ea5d1");
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.roundRect(-17.5, -3, 35, 15.5, 8);
      ctx.fill();
      ctx.strokeStyle = "rgba(44, 118, 160, 0.35)";
      ctx.lineWidth = 0.9;
      ctx.stroke();
      // Shimmering water pool
      const poolGrad = ctx.createRadialGradient(-2, -3.5, 1, 0, -3, 14.5);
      poolGrad.addColorStop(0, "#a8ecff");
      poolGrad.addColorStop(1, "#3eb9f0");
      ctx.fillStyle = poolGrad;
      ctx.beginPath();
      ctx.ellipse(0, -3, 14.5, 4.6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Daisy spout flower center + petals
      ctx.fillStyle = "#fff6cf";
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 4.2, -11 + Math.sin(a) * 2.5, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.arc(0, -11, 3.2, 0, Math.PI * 2);
      ctx.fill();
      // Animated water arcs & sparkle droplets
      ctx.strokeStyle = "rgba(210, 248, 255, 0.94)";
      ctx.lineWidth = 1.9;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-2, -10);
      ctx.quadraticCurveTo(-8.5, -14.5 + bubble, -10.5, -4);
      ctx.moveTo(2, -10);
      ctx.quadraticCurveTo(8.5, -14.5 - bubble, 10.5, -4);
      ctx.stroke();
      ctx.restore();
    }

    _drawAutoFeeder(ctx, x, y, scale) {
      const b = this.feederBounce > 0 ? Math.sin(this.feederBounce * Math.PI) * 0.12 : 0;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale * (1 + b), scale * (1 - b * 0.8));
      ctx.fillStyle = "rgba(62, 34, 16, 0.22)";
      ctx.beginPath();
      ctx.ellipse(0, 13.5, 19, 5.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Sculpted kitty ears on top
      const earGrad = ctx.createLinearGradient(0, -28, 0, -17);
      earGrad.addColorStop(0, "#ffe48f");
      earGrad.addColorStop(1, "#f2a93b");
      ctx.fillStyle = earGrad;
      ctx.beginPath();
      ctx.moveTo(-11, -18);
      ctx.lineTo(-14.5, -27.5);
      ctx.lineTo(-4, -21);
      ctx.moveTo(11, -18);
      ctx.lineTo(14.5, -27.5);
      ctx.lineTo(4, -21);
      ctx.fill();
      // Pearl-cream dispenser body with soft bevel
      const bodyGrad = ctx.createLinearGradient(-15, -21, 15, 12);
      bodyGrad.addColorStop(0, "#ffffff");
      bodyGrad.addColorStop(0.55, "#fff3e6");
      bodyGrad.addColorStop(1, "#e8c3a0");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(-15.5, -21, 31, 32, 9);
      ctx.fill();
      ctx.strokeStyle = "rgba(155, 102, 58, 0.35)";
      ctx.lineWidth = 0.9;
      ctx.stroke();
      // Tinted translucent hopper window + kibble pellets + glass gleam
      ctx.fillStyle = "#c97c44";
      ctx.beginPath();
      ctx.roundRect(-9.5, -15, 19, 12.5, 4.5);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
      ctx.beginPath();
      ctx.roundRect(-8, -14, 5.5, 10, 2.5);
      ctx.fill();
      // Glowing green ready LED
      ctx.fillStyle = "#38d399";
      ctx.beginPath();
      ctx.arc(0, 1.2, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#b8ffe5";
      ctx.beginPath();
      ctx.arc(-0.7, 0.6, 0.85, 0, Math.PI * 2);
      ctx.fill();
      // Coral dispenser tray
      const trayGrad = ctx.createLinearGradient(0, 5, 0, 13);
      trayGrad.addColorStop(0, "#ffa6b8");
      trayGrad.addColorStop(1, "#e05b7a");
      ctx.fillStyle = trayGrad;
      ctx.beginPath();
      ctx.roundRect(-17.5, 6, 35, 7.5, 4);
      ctx.fill();
      ctx.restore();
    }

    _drawCatnipPlant(ctx, x, y, scale) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = "rgba(62, 30, 14, 0.19)";
      ctx.beginPath();
      ctx.ellipse(0, 10.5, 16.5, 4.8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Shaded terracotta pot + lip
      const potGrad = ctx.createLinearGradient(-12, -8, 12, 10);
      potGrad.addColorStop(0, "#f29b82");
      potGrad.addColorStop(0.55, "#e07a5f");
      potGrad.addColorStop(1, "#b24d34");
      ctx.fillStyle = potGrad;
      ctx.beginPath();
      ctx.moveTo(-12, -8);
      ctx.lineTo(12, -8);
      ctx.lineTo(9, 10);
      ctx.lineTo(-9, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f7b29c";
      ctx.beginPath();
      ctx.roundRect(-14.5, -11.5, 29, 5.2, 2.6);
      ctx.fill();
      // Swaying lush emerald catnip leaves with midrib highlight
      const sway = Math.sin(this.time * 1.9) * 2;
      ctx.fillStyle = "#40916c";
      ctx.beginPath();
      ctx.ellipse(-7.5 + sway * 0.4, -22, 6.2, 13, -0.36, 0, Math.PI * 2);
      ctx.ellipse(6.5 + sway * 0.5, -21, 6.2, 12, 0.36, 0, Math.PI * 2);
      ctx.fill();
      const leafGrad = ctx.createLinearGradient(0, -40, 0, -10);
      leafGrad.addColorStop(0, "#95d5b2");
      leafGrad.addColorStop(1, "#52b788");
      ctx.fillStyle = leafGrad;
      ctx.beginPath();
      ctx.ellipse(sway * 0.6, -26, 5.8, 15.5, 0.04, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    _drawCatTower(ctx, x, y, scale) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = "rgba(62, 30, 14, 0.18)";
      ctx.beginPath();
      ctx.ellipse(0, 12.5, 22.5, 5.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Rope-wrapped sisal post gradient + texture rings
      const postGrad = ctx.createLinearGradient(-5.5, 0, 5.5, 0);
      postGrad.addColorStop(0, "#eec592");
      postGrad.addColorStop(0.55, "#d9a973");
      postGrad.addColorStop(1, "#b07d48");
      ctx.fillStyle = postGrad;
      ctx.fillRect(-5.5, -42, 11, 52);
      ctx.strokeStyle = "rgba(130, 82, 38, 0.3)";
      ctx.lineWidth = 1;
      for (let ry = -38; ry < 6; ry += 5) {
        ctx.beginPath();
        ctx.moveTo(-5.5, ry);
        ctx.lineTo(5.5, ry + 1.5);
        ctx.stroke();
      }
      // Plush cream base & upper perch with pink bottom bevel
      const plushGrad = ctx.createLinearGradient(0, -47, 0, 12);
      plushGrad.addColorStop(0, "#fff5f8");
      plushGrad.addColorStop(1, "#ffd4e0");
      ctx.fillStyle = plushGrad;
      ctx.beginPath();
      ctx.roundRect(-20.5, 4, 41, 8.5, 4.2);
      ctx.roundRect(-18.5, -46.5, 37, 9.5, 4.8);
      ctx.fill();
      ctx.fillStyle = "#ff9ebb";
      ctx.beginPath();
      ctx.roundRect(-15.5, -22, 25, 6.5, 3.2);
      ctx.fill();
      ctx.restore();
    }

    _drawHeatedCushion(ctx, x, y, scale) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      const glow = 0.25 + Math.sin(this.time * 2.2) * 0.1;
      ctx.fillStyle = `rgba(255, 138, 101, ${glow})`;
      ctx.beginPath();
      ctx.ellipse(0, 6, 66, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      const grad = ctx.createLinearGradient(0, -8, 0, 16);
      grad.addColorStop(0, "#ffd6e0");
      grad.addColorStop(1, "#ff9ebb");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 4, 56, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    _drawBirdFeeder(ctx, x, y, scale) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      const houseGrad = ctx.createLinearGradient(-13, -10, 13, 12);
      houseGrad.addColorStop(0, "#d8a477");
      houseGrad.addColorStop(1, "#9c663b");
      ctx.fillStyle = houseGrad;
      ctx.beginPath();
      ctx.roundRect(-13.5, -10, 27, 22, 5.5);
      ctx.fill();
      ctx.fillStyle = "#e07a5f";
      ctx.beginPath();
      ctx.moveTo(-18, -9);
      ctx.lineTo(0, -22);
      ctx.lineTo(18, -9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.arc(0, 2, 5.2, 0, Math.PI * 2);
      ctx.fill();
      // Cute custom vector songbird hopping above roof
      const hop = Math.abs(Math.sin(this.time * 3.1)) * 4;
      ctx.save();
      ctx.translate(0, -25 - hop);
      // Bluebird body & wing
      ctx.fillStyle = "#4ea8de";
      ctx.beginPath();
      ctx.ellipse(-1, 0, 6.2, 4.4, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#72efdd";
      ctx.beginPath();
      ctx.ellipse(-2.5, 0.5, 3.6, 2.1, 0.15, 0, Math.PI * 2);
      ctx.fill();
      // Beak & eye
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.moveTo(4.8, -1.2);
      ctx.lineTo(8.2, 0.2);
      ctx.lineTo(4.8, 1.4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#1d1a2f";
      ctx.beginPath();
      ctx.arc(2.8, -1.2, 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
    }

    _drawCatWheel(ctx, x, y, scale) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = "rgba(62, 30, 14, 0.18)";
      ctx.beginPath();
      ctx.ellipse(0, 20.5, 22.5, 5.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wood A-frame stand
      const standGrad = ctx.createLinearGradient(0, 4, 0, 18);
      standGrad.addColorStop(0, "#dfa068");
      standGrad.addColorStop(1, "#a86936");
      ctx.fillStyle = standGrad;
      ctx.beginPath();
      ctx.moveTo(-14.5, 18.5);
      ctx.lineTo(-4.5, 4);
      ctx.lineTo(4.5, 4);
      ctx.lineTo(14.5, 18.5);
      ctx.closePath();
      ctx.fill();
      // Rotating wheel rim with cork lining
      ctx.save();
      ctx.translate(0, -4);
      ctx.rotate(this.wheelSpin);
      ctx.strokeStyle = "#f2a65a";
      ctx.lineWidth = 5.4;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#ffe6eb";
      ctx.lineWidth = 2.1;
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * -17, Math.sin(a) * -17);
        ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 17);
        ctx.stroke();
      }
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.arc(0, 0, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
    }

    _drawFairyLights(ctx, width) {
      const count = 9;
      const colors = ["#ffe066", "#ff8fab", "#a0e7e5", "#ffd166", "#cdb4db"];
      ctx.save();
      ctx.strokeStyle = "rgba(120, 95, 130, 0.42)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, 8);
      ctx.quadraticCurveTo(width * 0.5, 28, width - 8, 8);
      ctx.stroke();
      for (let i = 1; i < count; i++) {
        const t = i / count;
        const lx = 8 + (width - 16) * t;
        const ly = 8 + Math.sin(t * Math.PI) * 10;
        const pulse = 0.65 + Math.sin(this.time * 3.5 + i * 1.1) * 0.35;
        const col = colors[i % colors.length];
        ctx.globalAlpha = pulse * 0.4;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(lx, ly + 4, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.arc(lx, ly + 4, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    _drawCardboardBox(ctx, cx, baseY, scale) {
      ctx.save();
      ctx.translate(cx - 2, baseY + 12 * scale);
      ctx.scale(scale, scale);

      // Back flap & interior
      ctx.fillStyle = "#c98b52";
      ctx.beginPath();
      ctx.roundRect(-64, -22, 128, 36, 8);
      ctx.fill();

      ctx.fillStyle = "#9b6434";
      ctx.beginPath();
      ctx.roundRect(-58, -16, 116, 26, 5);
      ctx.fill();

      // Front cardboard wall + open flap
      const boxGrad = ctx.createLinearGradient(0, -4, 0, 26);
      boxGrad.addColorStop(0, "#e3aa71");
      boxGrad.addColorStop(1, "#c28046");
      ctx.fillStyle = boxGrad;
      ctx.beginPath();
      ctx.roundRect(-64, 0, 128, 25, 6);
      ctx.fill();

      ctx.fillStyle = "#f2c18c";
      ctx.beginPath();
      ctx.roundRect(-52, 2, 104, 7, 3);
      ctx.fill();
      ctx.restore();
    }

    _drawClayTail(ctx, pal) {
      const angry = this.state === "sulking";
      const sleeping = this.state === "sleeping";
      const eating = this.state === "eating";
      const excited = this.state === "excited";

      const rightTurn = Math.max(0, Math.min(1, (this.bodyYaw - 0.05) / 0.35));
      const tailSide = 1 - rightTurn * 2; // +1 on right (front/left-facing), -1 on left (right-facing)
      const speed = angry ? 10.5 : eating ? 12.5 : excited ? 9.5 : sleeping ? 1.4 : 2.9;
      const amp = angry ? 9.0 : eating ? 7.5 : excited ? 8.0 : sleeping ? 1.5 : 5.2;

      // 6-node articulated traveling-wave cartoon cat tail
      const basePts = [
        { x: 22 * tailSide, y: 19, r: 7.2 },
        { x: 34 * tailSide, y: sleeping ? 22 : 14, r: 6.8 },
        { x: 45 * tailSide, y: sleeping ? 20 : 2, r: 6.5 },
        { x: 46 * tailSide, y: sleeping ? 14 : -13, r: 6.2 },
        { x: 41 * tailSide, y: sleeping ? 8 : -27, r: 5.8 },
        { x: 48 * tailSide, y: sleeping ? 4 : -37, r: 5.0 }
      ];

      const pts = basePts.map((p, i) => {
        const ratio = i / (basePts.length - 1);
        const wave = Math.sin(this.time * speed - i * 0.7) * amp * ratio;
        const whip = this.fluffSpring * 2.4 * ratio;
        return {
          x: p.x + (wave * 0.85 + whip) * tailSide,
          y: p.y + Math.cos(this.time * speed - i * 0.7) * amp * 0.28 * ratio,
          r: p.r
        };
      });

      const leftSide = [];
      const rightSide = [];
      for (let i = 0; i < pts.length; i++) {
        const prev = pts[Math.max(0, i - 1)];
        const next = pts[Math.min(pts.length - 1, i + 1)];
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        leftSide.push({ x: pts[i].x + nx * pts[i].r, y: pts[i].y + ny * pts[i].r });
        rightSide.push({ x: pts[i].x - nx * pts[i].r, y: pts[i].y - ny * pts[i].r });
      }

      const tip = pts[pts.length - 1];
      const prevTip = pts[pts.length - 2];
      const tdx = tip.x - prevTip.x;
      const tdy = tip.y - prevTip.y;
      const tlen = Math.hypot(tdx, tdy) || 1;
      const tipCapX = tip.x + (tdx / tlen) * tip.r * 1.15;
      const tipCapY = tip.y + (tdy / tlen) * tip.r * 1.15;

      const traceTail = () => {
        ctx.beginPath();
        ctx.moveTo(leftSide[0].x, leftSide[0].y);
        for (let i = 0; i < leftSide.length - 1; i++) {
          const mx = (leftSide[i].x + leftSide[i + 1].x) * 0.5;
          const my = (leftSide[i].y + leftSide[i + 1].y) * 0.5;
          ctx.quadraticCurveTo(leftSide[i].x, leftSide[i].y, mx, my);
        }
        const lastL = leftSide[leftSide.length - 1];
        const lastR = rightSide[rightSide.length - 1];
        ctx.lineTo(lastL.x, lastL.y);
        ctx.quadraticCurveTo(tipCapX, tipCapY, lastR.x, lastR.y);
        for (let i = rightSide.length - 1; i > 0; i--) {
          const mx = (rightSide[i].x + rightSide[i - 1].x) * 0.5;
          const my = (rightSide[i].y + rightSide[i - 1].y) * 0.5;
          ctx.quadraticCurveTo(rightSide[i].x, rightSide[i].y, mx, my);
        }
        ctx.lineTo(rightSide[0].x, rightSide[0].y);
        ctx.closePath();
      };

      ctx.save();
      const tailGrad = ctx.createLinearGradient(pts[0].x, pts[0].y, tip.x, tip.y);
      tailGrad.addColorStop(0, pal.furDark);
      tailGrad.addColorStop(0.45, pal.furMid);
      tailGrad.addColorStop(1, pal.furLight);

      ctx.fillStyle = tailGrad;
      traceTail();
      ctx.fill();

      // Clipped 3D fur details: tabby tail rings or tuxedo cream tip + glossy upper highlight
      ctx.save();
      traceTail();
      ctx.clip();

      if (this.skin === "tuxedo") {
        ctx.fillStyle = pal.creamLight;
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 11.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.skin === "orange" || this.skin === "latte") {
        ctx.strokeStyle = pal.stripe;
        ctx.lineWidth = 3.2;
        ctx.lineCap = "round";
        ctx.globalAlpha = 0.55;
        [2, 3, 4].forEach((idx) => {
          const p = pts[idx];
          ctx.beginPath();
          ctx.arc(p.x, p.y, 7.2, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }

      // Glossy 3D top rim along tail
      ctx.strokeStyle = this.isNight ? "rgba(255, 224, 132, 0.52)" : "rgba(255, 250, 240, 0.34)";
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(leftSide[1].x * 0.9 + pts[1].x * 0.1, leftSide[1].y * 0.9 + pts[1].y * 0.1);
      for (let i = 2; i < pts.length; i++) {
        ctx.lineTo(leftSide[i].x * 0.72 + pts[i].x * 0.28, leftSide[i].y * 0.72 + pts[i].y * 0.28);
      }
      ctx.stroke();
      ctx.restore();

      // Soft 3D contour outline
      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 1.25;
      traceTail();
      ctx.stroke();
      ctx.restore();
    }

    _drawClayBody(ctx, pal, stretch = 0) {
      const yw = this.bodyYaw;
      const bTurn = Math.min(1, Math.abs(yw));
      const bf = yw >= 0 ? 1 : -1; // -1 = facing left, +1 = facing right
      const bx = (xFront, xSide) => bf * (xFront * (1 - bTurn) + xSide * bTurn);
      const lerp = (a, b, t) => a + (b - a) * t;

      const stepFL = this.isWalking ? Math.sin(this.walkPhase) * 4.5 : 0;
      const stepYL = this.isWalking ? -Math.max(0, Math.cos(this.walkPhase)) * 5.0 : 0;
      const stepFR = this.isWalking ? Math.sin(this.walkPhase + Math.PI) * 4.5 : 0;
      const stepYR = this.isWalking ? -Math.max(0, Math.cos(this.walkPhase + Math.PI)) * 5.0 : 0;
      const strideTiltF = this.isWalking ? Math.cos(this.walkPhase) * 0.22 : 0;
      const strideTiltN = this.isWalking ? Math.cos(this.walkPhase + Math.PI) * 0.22 : 0;

      // 1. Far Hind Haunch (behind torso, tucks behind body cleanly in side profile)
      const farHaunchVis = Math.max(0, 1 - Math.max(0, bTurn - 0.35) / 0.45);
      if (farHaunchVis > 0.04) {
        ctx.save();
        ctx.globalAlpha = farHaunchVis;
        this._drawHindHaunch(
          ctx,
          bx(22, 10) + stepFR * 0.65,
          13 + stepYR * 0.65,
          -bf,
          pal,
          true,
          bTurn
        );
        ctx.restore();
      }

      // 2. Far Front Leg (behind torso in 3/4 & side profile)
      const farLegX = bx(10.5, 15) + stepFL;
      const farLegVis = Math.max(0.28, 1 - bTurn * 0.55);
      ctx.save();
      ctx.globalAlpha = farLegVis;
      this._drawFrontLeg(
        ctx,
        farLegX,
        14 + stepYL - stretch * 14,
        pal,
        false,
        strideTiltF,
        bf,
        bTurn,
        true
      );
      ctx.restore();

      // 3. Sculpted 3D Cat Torso (morphs smoothly from chubby sitting chest -> sleek arched side profile!)
      const traceTorso = () => {
        ctx.beginPath();
        ctx.moveTo(bx(15, 13), -20);
        // Chest swell & tummy base
        ctx.bezierCurveTo(
          bx(30, 32 + stretch * 8),
          lerp(-8, -4, bTurn),
          bx(34, 24),
          lerp(14, 18, bTurn),
          bx(16, 12),
          lerp(27, 25, bTurn)
        );
        // Lower belly to sitting rump
        ctx.bezierCurveTo(
          bx(4, 2),
          29,
          bx(-14, -14),
          29,
          bx(-26, -33),
          lerp(25, 24, bTurn)
        );
        // Rump sweeping up graceful feline S-curve back to shoulder
        ctx.bezierCurveTo(
          bx(-38, -44),
          lerp(16, 13, bTurn),
          bx(-38, -41),
          lerp(-8, -5 - stretch * 10, bTurn),
          bx(-23, -25),
          lerp(-18, -14 - stretch * 8, bTurn)
        );
        ctx.bezierCurveTo(
          bx(-15, -16),
          lerp(-22, -20, bTurn),
          bx(-5, -8),
          -22,
          bx(15, 13),
          -20
        );
        ctx.closePath();
      };

      const bodyGrad = ctx.createRadialGradient(-12, -4, 6, 4, 8, 56);
      bodyGrad.addColorStop(0, pal.furLight);
      bodyGrad.addColorStop(0.56, pal.furMid);
      bodyGrad.addColorStop(1, pal.furDark);

      ctx.fillStyle = bodyGrad;
      traceTorso();
      ctx.fill();

      // Clipped 3D fur volume: warm bounce light, creamy chest bib, coat markings, chin AO, rim highlight
      ctx.save();
      traceTorso();
      ctx.clip();

      // Warm floor bounce fill along lower belly/haunches
      const bounceGrad = ctx.createLinearGradient(0, 12, 0, 31);
      bounceGrad.addColorStop(0, "rgba(255, 224, 180, 0)");
      bounceGrad.addColorStop(1, "rgba(255, 224, 180, 0.22)");
      ctx.fillStyle = bounceGrad;
      ctx.fillRect(-50, 12, 100, 22);

      // Smooth Creamy Chest Bib (rotates toward front chest profile cleanly!)
      const chestCenterX = bx(0, 23);
      const chestGrad = ctx.createRadialGradient(chestCenterX - 3, 2, 3, chestCenterX, 10, 28);
      chestGrad.addColorStop(0, pal.creamLight);
      chestGrad.addColorStop(0.7, pal.creamMid);
      chestGrad.addColorStop(1, pal.creamDark);
      ctx.fillStyle = chestGrad;
      ctx.beginPath();
      ctx.ellipse(chestCenterX, 10, 21 - bTurn * 6, 18, yw * 0.28, 0, Math.PI * 2);
      ctx.fill();

      // Subtle calico hip spot or dorsal tabby saddle stripes clipped to back curve
      if (this.skin === "calico") {
        ctx.fillStyle = "#ee8228";
        ctx.beginPath();
        ctx.ellipse(bx(-22, -24), 4, 13, 15, -bf * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.skin === "orange" || this.skin === "latte") {
        ctx.strokeStyle = pal.stripe;
        ctx.lineCap = "round";
        ctx.lineWidth = 3.2;
        ctx.globalAlpha = 0.45 * (0.35 + bTurn * 0.65);
        [-6, 3, 12].forEach((sy, idx) => {
          const sx = bx(-26, -34) + bf * idx * 2;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(sx + bf * 9, sy + 2, sx + bf * 14, sy + 6);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }

      // Soft ambient occlusion shadow under the chin onto chest/shoulders
      const neckShadow = ctx.createRadialGradient(yw * 5, -14, 4, yw * 4, -9, 32);
      neckShadow.addColorStop(0, "rgba(92, 36, 12, 0.36)");
      neckShadow.addColorStop(1, "rgba(92, 36, 12, 0)");
      ctx.fillStyle = neckShadow;
      ctx.beginPath();
      ctx.ellipse(yw * 4, -9, 30, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Overhead lamp golden rim (night) or crisp daytime rim along upper back
      if (this.isNight || bTurn > 0.2) {
        ctx.strokeStyle = this.isNight ? "rgba(255, 224, 128, 0.48)" : "rgba(255, 250, 240, 0.24)";
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(bx(-22, -24), -16);
        ctx.quadraticCurveTo(bx(-34, -39), -4, bx(-35, -39), 12);
        ctx.stroke();
      }
      ctx.restore();

      // Soft sculpted outline around torso
      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 1.25;
      traceTorso();
      ctx.stroke();

      // 4. Near Folded Hind Haunch (sculpted cat thigh + ankle + resting hind paw)
      const walkBackX = this.isWalking ? Math.sin(this.walkPhase) * 3.4 : 0;
      const walkBackY = this.isWalking ? -Math.max(0, Math.cos(this.walkPhase)) * 3.6 : 0;
      this._drawHindHaunch(
        ctx,
        bx(-22, -16) + walkBackX,
        13 + walkBackY,
        bf,
        pal,
        false,
        bTurn
      );

      // 5. Near Front Leg + Paw (reaching for fish, kneading, grooming, or walking stride)
      const isReaching = Boolean(this.draggedSnack);
      const isKneading = this.kneadTimer > 0;
      const isGrooming = this.groomTimer > 0;
      const pawHop = isReaching
        ? (-7 + Math.sin(this.time * 16) * 2.2)
        : this.state === "excited"
          ? -5
          : 0;
      const kneadL = isKneading ? -Math.max(0, Math.sin(this.time * 8.5)) * 6 : 0;
      const kneadR = isKneading ? -Math.max(0, Math.sin(this.time * 8.5 + Math.PI)) * 6 : 0;

      if (isGrooming) {
        const rubX = Math.cos(this.time * 11) * 3.5;
        const rubY = Math.sin(this.time * 11) * 3.5;
        this._drawFrontLeg(ctx, bx(-18, 6) + rubX, -8 + rubY, pal, true, -0.35 * bf, bf, bTurn, false);
      } else {
        const nearLegX = bx(-10.5, 5.5) + stepFR;
        const farInFront = bTurn < 0.35;
        if (farInFront) {
          // Draw second symmetrical front paw cleanly beside near paw when facing front
          this._drawFrontLeg(
            ctx,
            bx(10.5, 13) + stepFL,
            15 + pawHop * 0.75 + stepYL + kneadL - stretch * 14,
            pal,
            isReaching || this.state === "excited" || kneadL < -2.2,
            strideTiltF,
            bf,
            bTurn,
            false
          );
        }
        this._drawFrontLeg(
          ctx,
          nearLegX,
          15 + pawHop + stepYR + kneadR - stretch * 14,
          pal,
          isReaching || this.state === "excited" || kneadR < -2.2,
          strideTiltN,
          bf,
          bTurn,
          false
        );
      }
    }

    _drawHindHaunch(ctx, x, y, facingSign, pal, isFar, turnAmt) {
      // Sculpted folded cat thigh ("drumstick" haunch) + ankle + tucked forward paw
      ctx.save();
      ctx.translate(x, y);

      const thighDir = facingSign; // +1 if cat faces right (thigh sits behind to the left), -1 if facing left (thigh behind to right)
      // Thigh crease shadow separating haunch from body
      if (!isFar) {
        ctx.strokeStyle = "rgba(88, 34, 12, 0.28)";
        ctx.lineWidth = 2.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(0, -1, 13.5, thighDir < 0 ? -Math.PI * 0.75 : Math.PI * 0.25, thighDir < 0 ? -Math.PI * 0.15 : Math.PI * 0.85);
        ctx.stroke();
      }

      const thighGrad = ctx.createRadialGradient(-3, -4, 2, 0, 2, 16);
      thighGrad.addColorStop(0, pal.furLight);
      thighGrad.addColorStop(0.65, pal.furMid);
      thighGrad.addColorStop(1, pal.furDark);

      ctx.fillStyle = thighGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 12.2 + turnAmt * 2.5, 13.2, thighDir * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Forward-pointing tucked hind foot resting neatly at mat level (y = +12 in haunch space)
      const pawDir = isFar ? -thighDir : thighDir;
      const footX = pawDir * (4 + turnAmt * 8);
      this._drawPaw(ctx, footX, 11.5, 8.8 + turnAmt * 1.6, 5.2, pal, isFar);
      ctx.restore();
    }

    _drawFrontLeg(ctx, x, y, pal, showBeans = false, swingAngle = 0, facingSign = -1, turnAmt = 0, isFar = false) {
      ctx.save();
      ctx.translate(x, y - 14);
      ctx.rotate(swingAngle);
      ctx.translate(0, 14);

      const topW = 6.8;
      const wristW = 5.6;
      const pawShift = facingSign * turnAmt * 3.5;

      const legGrad = ctx.createLinearGradient(-7, -14, 7, 13);
      legGrad.addColorStop(0, pal.furMid);
      legGrad.addColorStop(0.32, isFar ? pal.creamDark : pal.creamMid);
      legGrad.addColorStop(0.7, isFar ? pal.creamMid : pal.creamLight);
      legGrad.addColorStop(1, pal.creamDark);

      const traceLeg = () => {
        ctx.beginPath();
        ctx.moveTo(-topW, -15);
        ctx.bezierCurveTo(-topW - 1.5, -2, -wristW + pawShift * 0.4, 5, -7.2 + pawShift, 10);
        ctx.quadraticCurveTo(pawShift, 15.5, 7.2 + pawShift, 10);
        ctx.bezierCurveTo(wristW + pawShift * 0.4, 5, topW + 1.5, -2, topW, -15);
        ctx.closePath();
      };

      ctx.fillStyle = legGrad;
      traceLeg();
      ctx.fill();

      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(-topW * 0.9, -4);
      ctx.quadraticCurveTo(-7.2 + pawShift, 6, -7.2 + pawShift, 10);
      ctx.quadraticCurveTo(pawShift, 15.5, 7.2 + pawShift, 10);
      ctx.quadraticCurveTo(topW * 0.9, 6, topW * 0.9, -4);
      ctx.stroke();

      // Cute pink toe beans peek when paws lift!
      if (showBeans) {
        ctx.fillStyle = "#ff9fb5";
        ctx.beginPath();
        ctx.ellipse(pawShift, 9.2, 2.5, 1.8, 0, 0, Math.PI * 2);
        ctx.arc(pawShift - 3.1, 6.8, 1.15, 0, Math.PI * 2);
        ctx.arc(pawShift, 6.2, 1.15, 0, Math.PI * 2);
        ctx.arc(pawShift + 3.1, 6.8, 1.15, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Subtle feline paw toe creases
        ctx.strokeStyle = "rgba(130, 88, 56, 0.36)";
        ctx.lineWidth = 1.1;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(pawShift - 2.2, 8.2);
        ctx.lineTo(pawShift - 2.2, 12.2);
        ctx.moveTo(pawShift + 2.2, 8.2);
        ctx.lineTo(pawShift + 2.2, 12.2);
        ctx.stroke();
      }
      ctx.restore();
    }

    _drawPaw(ctx, x, y, rx, ry, pal, isBack) {
      ctx.save();
      ctx.translate(x, y);
      const grad = ctx.createRadialGradient(-2, -2, 1, 0, 1, rx * 1.2);
      grad.addColorStop(0, pal.creamLight);
      grad.addColorStop(0.65, pal.creamMid);
      grad.addColorStop(1, isBack ? pal.creamDark : "#bfa184");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 0.95;
      ctx.stroke();

      // Subtle toe dimples
      ctx.strokeStyle = "rgba(130, 88, 56, 0.38)";
      ctx.lineWidth = 1.15;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-rx * 0.28, ry * 0.22);
      ctx.lineTo(-rx * 0.28, ry * 0.86);
      ctx.moveTo(rx * 0.22, ry * 0.24);
      ctx.lineTo(rx * 0.22, ry * 0.86);
      ctx.stroke();
      ctx.restore();
    }

    _drawClayHead(ctx, pal) {
      const yw = this.headYaw;
      const hTurn = Math.min(1, Math.abs(yw)); // 0 -> 1
      const hf = yw >= 0 ? 1 : -1;             // -1 = facing left, +1 = facing right
      const hx = (xFront, xSide) => hf * (xFront * (1 - hTurn) + xSide * hTurn);
      const lerp = (a, b, t) => a + (b - a) * t;

      // Ear animation angles (droop on worry/sad/sleep/sulk + lively twitch)
      let earDroop = 0;
      if (this.state === "worried") earDroop = 0.24;
      if (this.state === "sad") earDroop = 0.45;
      if (this.state === "sleeping") earDroop = 0.16;
      if (this.state === "sulking") earDroop = 0.24;
      const earTwitch = this.state === "sleeping" ? 0 : Math.sin(this.time * 4.2) * 0.03;
      const flick = Math.sin(this.earTwitch * Math.PI) * 0.24;

      // 3D perspective ear placement tracking headYaw
      const farEarX = hx(25, 16);
      const farEarY = -34 - hTurn * 2;
      const farEarScaleX = 1 - hTurn * 0.34;
      const farEarAngle = hf * (0.24 + earDroop * (1 - hTurn * 0.45) - hTurn * 0.18) + earTwitch;

      const nearEarX = hx(-25, -13);
      const nearEarY = -34 + hTurn * 3;
      const nearEarScaleX = 1 - hTurn * 0.1;
      const nearEarAngle = -hf * (0.24 + earDroop + hTurn * 0.18) - earTwitch + flick;

      // Far ear always sits behind cranium
      this._drawClayEar(ctx, farEarX, farEarY, farEarAngle, pal, farEarScaleX, 1 - hTurn * 0.72, false);
      if (hTurn < 0.3) {
        this._drawClayEar(ctx, nearEarX, nearEarY, nearEarAngle, pal, nearEarScaleX, 1 - hTurn * 0.35, false);
      }

      // Morphing 3D Cartoon Cat Cranium + Forehead Brow + Protruding Snout + Rounded Jawline
      const traceHead = () => {
        ctx.beginPath();
        ctx.moveTo(hx(0, -4), lerp(-37, -36, hTurn));
        // Crown -> Forehead / Temple
        ctx.bezierCurveTo(
          hx(24, 19), lerp(-37, -35, hTurn),
          hx(38, 33), lerp(-27, -23, hTurn),
          hx(39, 32), lerp(-14, -13, hTurn)
        );
        // Brow dip -> Protruding Feline Snout / Nose Tip
        ctx.bezierCurveTo(
          hx(40, 34), lerp(-6, -8, hTurn),
          hx(42, 46), lerp(1, -5, hTurn),
          hx(41, 46), lerp(7, 2, hTurn)
        );
        // Snout Upper Lip / Whisker Pad -> Tucked Chin
        ctx.bezierCurveTo(
          hx(39, 45), lerp(17, 11, hTurn),
          hx(22, 31), lerp(23, 19, hTurn),
          hx(0, 10), lerp(23, 21, hTurn)
        );
        // Under-chin -> Back Jawline -> Back of Skull
        ctx.bezierCurveTo(
          hx(-22, -16), lerp(23, 23, hTurn),
          hx(-39, -34), lerp(18, 13, hTurn),
          hx(-40, -37), lerp(2, -4, hTurn)
        );
        // Back of Skull -> Crown
        ctx.bezierCurveTo(
          hx(-39, -36), lerp(-22, -24, hTurn),
          hx(-24, -20), lerp(-37, -36, hTurn),
          hx(0, -4), lerp(-37, -36, hTurn)
        );
        ctx.closePath();
      };

      const headGrad = ctx.createRadialGradient(-12 + yw * 12, -20, 6, 0, -6, 54);
      headGrad.addColorStop(0, pal.furLight);
      headGrad.addColorStop(0.6, pal.furMid);
      headGrad.addColorStop(1, pal.furDark);

      ctx.fillStyle = headGrad;
      traceHead();
      ctx.fill();

      // Clipped 3D head details: warm lower bounce, face markings, glossy forehead, rim light!
      ctx.save();
      traceHead();
      ctx.clip();

      // Subtle warm bounce along lower jaw
      const jawBounce = ctx.createLinearGradient(0, 10, 0, 26);
      jawBounce.addColorStop(0, "rgba(255, 224, 180, 0)");
      jawBounce.addColorStop(1, "rgba(255, 224, 180, 0.2)");
      ctx.fillStyle = jawBounce;
      ctx.fillRect(-52, 10, 104, 18);

      // Coat markings clipped inside 3D head curvature (muzzle blaze, tabby "M" crown, cheeks)
      this._drawFaceMarkings(ctx, pal, hTurn, hf);

      // Overhead specular sheen / night lamp rim light
      ctx.fillStyle = this.isNight ? "rgba(255, 226, 130, 0.24)" : "rgba(255, 255, 255, 0.14)";
      ctx.beginPath();
      ctx.ellipse(this.isNight ? yw * 4 : -9 + yw * 6, -30, 21, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Eyes, brows, 3D snout nose, mouth, & unclipped flexible whiskers
      this._drawFaceFeatures(ctx, pal, hTurn, hf);

      // Soft sculpted outline around cat head & protruding snout
      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 1.25;
      traceHead();
      ctx.stroke();

      // Warm night lamp rim light arc over the crown & nose bridge
      if (this.isNight) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 224, 128, 0.62)";
        ctx.shadowColor = "rgba(255, 212, 96, 0.72)";
        ctx.shadowBlur = 9;
        ctx.lineWidth = 2.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(hx(-28, -24), -27);
        ctx.quadraticCurveTo(hx(0, 4), -40, hx(28, 29), lerp(-27, -23, hTurn));
        ctx.stroke();
        ctx.restore();
      }

      // Near ear melts onto side temple when turned > 0.3 for true 3D depth!
      if (hTurn >= 0.3) {
        this._drawClayEar(ctx, nearEarX, nearEarY, nearEarAngle, pal, nearEarScaleX, 1 - hTurn * 0.35, true);
      }

      // Bouncy crown tuft between ears
      const tuftLean = this.headTilt * 2.1 + this.fluffSpring * 0.18;
      ctx.save();
      ctx.translate(hx(-2, -3), -37);
      ctx.rotate(tuftLean);
      ctx.fillStyle = pal.furLight;
      ctx.beginPath();
      ctx.moveTo(-6, 3);
      ctx.quadraticCurveTo(-5, -9, 1, -11);
      ctx.quadraticCurveTo(0, -4, 3, -1);
      ctx.quadraticCurveTo(7, -7, 10, -6);
      ctx.quadraticCurveTo(8, 2, 4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Accessory sits cleanly on head
      this._drawAccessory(ctx);
    }

    _drawClayEar(ctx, x, y, angle, pal, scaleX = 1, innerVisibility = 1, blendBase = false) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(scaleX, 1);

      const earGrad = ctx.createLinearGradient(0, -24, 0, 12);
      earGrad.addColorStop(0, pal.furLight);
      earGrad.addColorStop(0.65, pal.furMid);
      earGrad.addColorStop(1, blendBase ? pal.furMid : pal.furDark);

      // Sculpted fleshy cartoon cat ear
      const traceEar = () => {
        ctx.beginPath();
        ctx.moveTo(-14.5, 11);
        ctx.bezierCurveTo(-13.5, -10, -6, -25, 0, -25.5);
        ctx.bezierCurveTo(6, -25, 13.5, -10, 14.5, 11);
        ctx.quadraticCurveTo(0, 14, -14.5, 11);
        ctx.closePath();
      };

      ctx.fillStyle = earGrad;
      traceEar();
      ctx.fill();

      // Soft outline along upper ear silhouette (open at base if blending onto temple)
      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 1.15;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-13.8, 7);
      ctx.bezierCurveTo(-13, -10, -6, -25, 0, -25.5);
      ctx.bezierCurveTo(6, -25, 13, -10, 13.8, 7);
      ctx.stroke();

      // Sculpted clay rim highlight along outer edge
      ctx.strokeStyle = this.isNight ? "rgba(255, 226, 128, 0.65)" : "rgba(255, 245, 232, 0.42)";
      ctx.lineWidth = this.isNight ? 2.0 : 1.5;
      ctx.beginPath();
      ctx.moveTo(-11.8, 5);
      ctx.bezierCurveTo(-10.8, -9, -5, -22, 0, -22.8);
      if (this.isNight) {
        ctx.bezierCurveTo(5, -22, 10.8, -9, 11.8, 5);
      }
      ctx.stroke();

      // Inner soft pink ear cavity + delicate ear furnishings
      if (innerVisibility > 0.15) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, innerVisibility);
        const innerGrad = ctx.createLinearGradient(0, -15, 0, 8);
        innerGrad.addColorStop(0, "#b96158");
        innerGrad.addColorStop(1, pal.earInner);
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.moveTo(-7.8, 7);
        ctx.bezierCurveTo(-6.8, -5, -3, -15, 0, -15);
        ctx.bezierCurveTo(3, -15, 6.8, -5, 7.8, 7);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = pal.creamLight;
        ctx.beginPath();
        ctx.moveTo(-5.5, 8);
        ctx.quadraticCurveTo(-2.5, 0, -0.5, 3);
        ctx.quadraticCurveTo(1.5, -2, 4.5, 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    _drawFaceMarkings(ctx, pal, hTurn, hf) {
      const yw = this.headYaw;
      const fx = this.lookX * 3.5;
      const fy = this.lookY * 2.0;
      const nosePhi = yw * 1.48;
      const rNose = 36 + 9 * hTurn;
      const muzzleX = rNose * Math.sin(nosePhi);

      // 1. Creamy cat blaze & protruding muzzle bridge (smoothly follows snout in side profile!)
      const blazeGrad = ctx.createLinearGradient(muzzleX - 10, -22, muzzleX + 10, 24);
      blazeGrad.addColorStop(0, pal.creamLight);
      blazeGrad.addColorStop(0.72, pal.creamMid);
      blazeGrad.addColorStop(1, pal.creamDark);

      ctx.fillStyle = blazeGrad;
      ctx.beginPath();
      ctx.moveTo(muzzleX * 0.72, -23 + hTurn * 9);
      ctx.quadraticCurveTo(muzzleX - 14 * (1 - hTurn * 0.3), -2, muzzleX - hf * 20, 12);
      ctx.bezierCurveTo(muzzleX - hf * 16, 25, muzzleX + hf * 18, 25, muzzleX + hf * 18 * (1 - hTurn * 0.45), 11);
      ctx.quadraticCurveTo(muzzleX + hf * 10 * (1 - hTurn * 0.45), -2, muzzleX * 0.72, -23 + hTurn * 9);
      ctx.closePath();
      ctx.fill();

      // 2. Classic tabby "M" forehead stripes (follow 3D dome rotation!)
      ctx.strokeStyle = pal.stripe;
      ctx.lineCap = "round";
      ctx.lineWidth = 2.5;
      const browCenterX = yw * 20;
      [-7, 0, 7].forEach((offset, i) => {
        const sx = browCenterX + offset * (1 - hTurn * 0.35) + fx * 0.15;
        ctx.beginPath();
        ctx.moveTo(sx, -35 + Math.abs(i - 1) * 1.6);
        ctx.quadraticCurveTo(sx + yw * 3, -30, sx + (i - 1) * 1.2, -25);
        ctx.stroke();
      });

      // 3. Curved cheek tabby markings on visible side(s)
      ctx.lineWidth = 2.3;
      [-1, 1].forEach((side) => {
        const vis = side === -hf ? 1 : (1 - hTurn * 0.9);
        if (vis < 0.12) return;
        ctx.save();
        ctx.globalAlpha = vis * 0.85;
        const cx = side * (29 - (side === -hf ? hTurn * 18 : 0)) + yw * 6;
        ctx.beginPath();
        ctx.moveTo(cx, -4);
        ctx.quadraticCurveTo(cx + side * 7, -6, cx + side * 13, -3);
        ctx.moveTo(cx + side, 2);
        ctx.quadraticCurveTo(cx + side * 8, 1, cx + side * 14, 4);
        ctx.stroke();
        ctx.restore();
      });

      // 4. Soft rosy peach cheek blush under the eye(s)
      ctx.fillStyle = pal.cheek;
      [-0.55, 0.55].forEach((theta0) => {
        const phi = theta0 + yw * 1.12;
        const cosP = Math.cos(phi);
        if (cosP < 0.15) return;
        const bx = 34 * Math.sin(phi) + fx * 0.25;
        ctx.save();
        ctx.globalAlpha = Math.min(1, cosP * 1.15);
        ctx.beginPath();
        ctx.ellipse(bx, 3.5 + fy * 0.25, 7.6 * (0.65 + cosP * 0.35), 4.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    _drawFaceFeatures(ctx, pal, hTurn, hf) {
      const yw = this.headYaw;
      const fx = this.lookX * 4.0;
      const fy = this.lookY * 2.2;
      const nosePhi = yw * 1.48;
      const rNose = 36 + 9 * hTurn;
      const noseX = rNose * Math.sin(nosePhi) + fx * (0.45 - hTurn * 0.22);
      const noseY = 1.5 - hTurn * 2.2 + fy * 0.35;

      // 1. 3D Spherical Big Anime Eyes (both eyes at front/3-4, natural side-profile anime eye at full turn!)
      const eyeY = -7.5 + fy * 0.4;
      const dilated = Boolean(this.draggedSnack) || this.yarnBounce > 0 || this.kneadTimer > 0;
      const browTilt = (this.state === "sad" || this.state === "worried" || this.state === "sulking") ? 0.36 : 0;

      [-0.46, 0.46].forEach((theta0, eyeIdx) => {
        const phi = theta0 + yw * 1.12;
        const cosP = Math.cos(phi);
        if (cosP <= 0.16) return; // Smoothly hides far eye behind nose bridge in side profile!

        const ex = 34 * Math.sin(phi) + fx * (0.5 * cosP);
        const foreshorten = Math.min(1.04, cosP / 0.896);
        const eyeAlpha = Math.min(1, (cosP - 0.16) / 0.22);
        const sideDir = theta0 < 0 ? -1 : 1;

        ctx.save();
        ctx.globalAlpha = eyeAlpha;

        // Cute expressive eyebrow
        ctx.strokeStyle = pal.stripe;
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.save();
        ctx.translate(ex, eyeY - 15.2);
        ctx.rotate(this.state === "sulking" ? hf * -0.34 : sideDir * browTilt);
        ctx.beginPath();
        ctx.moveTo(-3.2 * foreshorten, 0);
        ctx.lineTo(3.2 * foreshorten, 0);
        ctx.stroke();
        ctx.restore();

        if (this.state === "sleeping") {
          ctx.strokeStyle = "#4d352a";
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          ctx.ellipse(ex, eyeY - 1, 7.5 * foreshorten, 4.2, 0, 0.2, Math.PI - 0.2);
          ctx.stroke();
        } else if (this.state === "eating" || this.state === "excited" || (this.purrTimer > 0 && this.state === "happy")) {
          ctx.strokeStyle = "#33221a";
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.ellipse(ex, eyeY + 2, 7.8 * foreshorten, 5.4, 0, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
        } else if (this.groomTimer > 0 && eyeIdx === 0) {
          ctx.strokeStyle = "#33221a";
          ctx.lineWidth = 3.0;
          ctx.beginPath();
          ctx.ellipse(ex, eyeY + 1, 7.2 * foreshorten, 4.8, 0, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
        } else {
          const sulkSquint = this.state === "sulking" ? 0.66 : 1;
          const openScale = Math.max(0.08, (1 - this.blinkAmount) * sulkSquint);
          const eyeRx = 9.0 * foreshorten;
          const eyeRy = this.state === "sad" ? 11.2 : 10.6;

          ctx.save();
          ctx.translate(ex, eyeY);
          ctx.scale(1, openScale);

          // Multi-tone Anime Iris Gradient (deep chocolate top -> amber-honey bottom)
          const irisGrad = ctx.createLinearGradient(0, -eyeRy, 0, eyeRy);
          irisGrad.addColorStop(0, "#24130a");
          irisGrad.addColorStop(0.42, "#8c4213");
          irisGrad.addColorStop(0.78, "#d9822b");
          irisGrad.addColorStop(1, "#ffd269");
          ctx.fillStyle = irisGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, eyeRx, eyeRy, 0, 0, Math.PI * 2);
          ctx.fill();

          // Thick dark anime upper eyelash framing
          ctx.strokeStyle = "#22120b";
          ctx.lineWidth = 2.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.ellipse(0, 0, eyeRx, eyeRy, 0, Math.PI * 1.08, Math.PI * 1.92);
          ctx.stroke();

          // Dilating dark pupil
          const pupilScale = dilated ? 0.68 : 0.56;
          ctx.fillStyle = "#120a07";
          ctx.beginPath();
          ctx.ellipse(fx * 0.14, fy * 0.14 - 0.5, eyeRx * pupilScale, eyeRy * pupilScale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Anime catchlights + lower honey iris shimmer
          if (openScale > 0.35) {
            const shimmer = 0.45 + 0.2 * Math.sin(this.time * 4.5 + eyeIdx);
            ctx.strokeStyle = `rgba(255, 240, 175, ${shimmer})`;
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.ellipse(0, 1.8, 6.4 * foreshorten, 6.4, 0, 0.32, Math.PI - 0.32);
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.ellipse((-3.0 * foreshorten) + fx * 0.18, -3.8 + fy * 0.18, 3.1 * foreshorten, 3.7, -0.22, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 0.92 * eyeAlpha;
            ctx.beginPath();
            ctx.ellipse(3.0 * foreshorten, 4.1, 1.6 * foreshorten, 1.6, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(-4.0 * foreshorten, 3.3, 0.95 * foreshorten, 0.95, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = eyeAlpha;
          }

          // Sleepy drowsy eyelid droop when idle > 12s
          if (this.drowsyAmount > 0.05 && this.state === "happy") {
            const lidH = this.drowsyAmount * 11.2;
            ctx.fillStyle = pal.furMid;
            ctx.beginPath();
            ctx.ellipse(0, -8 + lidH * 0.38, eyeRx + 1, Math.max(2, lidH), 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          if (this.state === "sad") {
            const tearPulse = (Math.sin(this.time * 6) + 1) * 0.5;
            ctx.fillStyle = "rgba(118, 215, 255, 0.92)";
            ctx.beginPath();
            ctx.ellipse(ex, eyeY + 10 + tearPulse * 3, 3.8 * foreshorten, 5.2, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      });

      // Worried sweat drop
      if (this.state === "worried") {
        const dropY = -28 + ((this.time * 18) % 10);
        ctx.fillStyle = "#7ad7ff";
        ctx.beginPath();
        ctx.moveTo(28 - hTurn * 10, dropY - 6);
        ctx.quadraticCurveTo(34 - hTurn * 10, dropY + 4, 28 - hTurn * 10, dropY + 7);
        ctx.quadraticCurveTo(22 - hTurn * 10, dropY + 4, 28 - hTurn * 10, dropY - 6);
        ctx.fill();
      }

      // 2. Sculpted 3D Cat Nose (sits naturally between eyes in front, right on protruding snout tip in profile!)
      ctx.save();
      ctx.translate(noseX, noseY);
      ctx.fillStyle = pal.nose;
      ctx.beginPath();
      const nw = 3.6 - hTurn * 0.7;
      ctx.moveTo(-nw, -1.6);
      ctx.quadraticCurveTo(0, -2.5, nw, -1.6);
      ctx.quadraticCurveTo(nw * 0.6, 2.2, 0, 2.6);
      ctx.quadraticCurveTo(-nw * 0.6, 2.2, -nw, -1.6);
      ctx.closePath();
      ctx.fill();

      // Tiny glossy nose highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.68)";
      ctx.beginPath();
      ctx.ellipse(-nw * 0.35 + hf * 0.5, -1.0, 1.1, 0.6, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Expressive Mouth (:3 front smile smoothly morphing into side-profile muzzle line!)
      const mx = noseX;
      const my = noseY + 3.2;
      ctx.strokeStyle = "#4d352a";
      ctx.lineWidth = 2.0;
      ctx.lineCap = "round";

      if (hTurn > 0.55) {
        // Side-profile cat muzzle mouth curving gently back from snout tip under the nose
        const lipEnd = mx - hf * 13;
        ctx.beginPath();
        ctx.moveTo(mx - hf * 1.5, my + 2);
        if (this.state === "sulking") {
          ctx.quadraticCurveTo(mx - hf * 7, my - 0.5, lipEnd, my + 3.5);
        } else {
          ctx.quadraticCurveTo(mx - hf * 7, my + 4.8, lipEnd, my + 1.2);
        }
        ctx.stroke();
      } else if (this.state === "sleeping") {
        ctx.beginPath();
        ctx.arc(mx, my + 1, 3.2, 0.2, Math.PI - 0.2);
        ctx.stroke();
      } else if (this.state === "waking") {
        ctx.fillStyle = "#f2748b";
        ctx.beginPath();
        ctx.ellipse(mx, my + 4, 4.6, 5.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (this.draggedSnack) {
        ctx.fillStyle = "#f2748b";
        ctx.beginPath();
        ctx.ellipse(mx, my + 3.4, 5.2, 4.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (this.state === "sad") {
        const quiver = Math.sin(this.time * 24) * 0.7;
        ctx.beginPath();
        ctx.arc(mx, my + 5 + quiver, 5.5, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      } else if (this.state === "worried") {
        ctx.beginPath();
        ctx.moveTo(mx - 6, my + 3);
        ctx.quadraticCurveTo(mx - 2, my, mx, my + 3);
        ctx.quadraticCurveTo(mx + 2, my + 6, mx + 6, my + 3);
        ctx.stroke();
      } else if (this.state === "eating") {
        const chew = Math.abs(Math.sin(this.time * 14));
        ctx.fillStyle = "#f2748b";
        ctx.beginPath();
        ctx.ellipse(mx, my + 3, 5, 2.2 + chew * 3.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        const mScale = 1 - hTurn * 0.45;
        ctx.beginPath();
        ctx.ellipse(mx - 4.1 * mScale, my, 4.1 * mScale, 4.0, 0, 0.15, Math.PI - 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(mx + 4.1 * mScale, my, 4.1 * mScale, 4.0, 0, 0.15, Math.PI - 0.15);
        ctx.stroke();
      }

      // 4. Fine flexible springy cat whiskers anchored cleanly to muzzle pads
      const wWave = Math.sin(this.time * 3.4) * 0.8 + this.fluffSpring * 1.4;
      ctx.strokeStyle = "rgba(70, 46, 36, 0.72)";
      ctx.lineWidth = 1.35;
      [-1, 1].forEach((side) => {
        const isFar = side === hf && hTurn > 0.45;
        const wLen = isFar ? (1 - (hTurn - 0.45) * 0.85) : 1;
        if (wLen <= 0.15) return;
        const startX = noseX + side * (16 - hTurn * 7);
        const startY = noseY + 1.5;
        const sweep = side === -hf ? (1 + hTurn * 0.25) : (1 - hTurn * 0.65);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX + side * 9 * sweep, startY - 2.5, startX + side * 19 * sweep * wLen, startY - 1.5 + wWave);
        ctx.moveTo(startX, startY + 3.5);
        ctx.quadraticCurveTo(startX + side * 9 * sweep, startY + 4, startX + side * 18 * sweep * wLen, startY + 5.5 + wWave * 0.7);
        ctx.stroke();
      });
    }

    _drawAccessory(ctx, spriteOpts = null) {
      if (this.accessory === "none") return;
      const spriteMode = !!(spriteOpts && spriteOpts.spriteMode);
      const prof = spriteMode ? (spriteOpts.profile || 0) : 0;
      const eyeDy = spriteMode ? (spriteOpts.eyeDy || 0) : 0;
      const yw = spriteMode ? -prof * 0.45 : this.headYaw;
      const hTurn = Math.min(1, Math.abs(yw));
      const hf = yw >= 0 ? 1 : -1;
      ctx.save();
      if (this.accessory === "bow") {
        if (spriteMode) {
          ctx.translate(-17 + prof * 21, -39);
          ctx.rotate(-0.22 + prof * 0.14);
        } else {
          ctx.translate(-17 * (1 - hTurn * 0.5) + yw * 10, -39);
          ctx.rotate(-0.22 + yw * 0.15);
          ctx.scale(1 - hTurn * 0.25, 1);
        }
        // Soft fur cast shadow
        ctx.fillStyle = "rgba(55, 12, 22, 0.28)";
        ctx.beginPath();
        ctx.ellipse(0.6, 2.2, 14, 7.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trailing satin tails with notched ends
        ctx.fillStyle = "#c91e52";
        ctx.strokeStyle = "#8a1137";
        ctx.lineWidth = 0.9;
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(s * 1.5, 1.5);
          ctx.quadraticCurveTo(s * 5.5, 6.5, s * 8.2, 11.8);
          ctx.lineTo(s * 4.8, 9.6);
          ctx.lineTo(s * 2.5, 12.2);
          ctx.quadraticCurveTo(s * 1.2, 7.0, s * 0.5, 2.0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Sculpted 3D puffy satin bow loops
        for (const s of [-1, 1]) {
          const loopGrad = ctx.createRadialGradient(s * 6, -1.8, 1, s * 7.5, 0, 12);
          loopGrad.addColorStop(0, "#ffb3cb");
          loopGrad.addColorStop(0.45, "#ff4d84");
          loopGrad.addColorStop(1, "#b51748");
          ctx.fillStyle = loopGrad;
          ctx.strokeStyle = "#8a1137";
          ctx.lineWidth = 1.05;
          ctx.beginPath();
          ctx.moveTo(s * 1.8, -0.5);
          ctx.bezierCurveTo(s * 7.5, -10.5, s * 16.5, -8.5, s * 15.2, 0);
          ctx.bezierCurveTo(s * 16.5, 8.5, s * 7.5, 10.5, s * 1.8, 0.8);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Satin fold pinch crease + upper highlight
          ctx.strokeStyle = "rgba(115, 8, 42, 0.45)";
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(s * 3.2, 0);
          ctx.quadraticCurveTo(s * 7.5, -1.6, s * 10.5, -2.5);
          ctx.moveTo(s * 3.2, 0.4);
          ctx.quadraticCurveTo(s * 7.5, 2.0, s * 10.2, 2.8);
          ctx.stroke();

          ctx.fillStyle = "rgba(255, 255, 255, 0.36)";
          ctx.beginPath();
          ctx.ellipse(s * 8.2, -3.4, 3.6, 1.5, s * -0.22, 0, Math.PI * 2);
          ctx.fill();
        }

        // Puffy wrapped center knot
        const knotGrad = ctx.createRadialGradient(-1.2, -1.5, 0.8, 0, 0, 5.5);
        knotGrad.addColorStop(0, "#ffd1e0");
        knotGrad.addColorStop(0.5, "#ff5c8a");
        knotGrad.addColorStop(1, "#a81442");
        ctx.fillStyle = knotGrad;
        ctx.strokeStyle = "#8a1137";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.roundRect(-3.8, -4.5, 7.6, 9, 3.6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.beginPath();
        ctx.ellipse(-1.0, -2.0, 1.5, 0.9, -0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.accessory === "crown") {
        ctx.translate(spriteMode ? -prof * 2 : yw * 5, -43);
        ctx.scale(1 - hTurn * 0.22, 1);

        // Forehead cast shadow
        ctx.fillStyle = "rgba(45, 20, 5, 0.3)";
        ctx.beginPath();
        ctx.ellipse(0, 7.2, 15.5, 3.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner crimson velvet cushion dome visible behind crown points
        const velvetGrad = ctx.createRadialGradient(-2, -6, 2, 0, -2, 16);
        velvetGrad.addColorStop(0, "#d6285f");
        velvetGrad.addColorStop(0.6, "#8f133b");
        velvetGrad.addColorStop(1, "#4f071f");
        ctx.fillStyle = velvetGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0.5, 12.2, 8.8, 0, Math.PI, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // Sculpted 3D Royal Gold Crown body
        const crownGrad = ctx.createLinearGradient(-15, -13, 15, 7);
        crownGrad.addColorStop(0, "#fff6b0");
        crownGrad.addColorStop(0.35, "#ffd147");
        crownGrad.addColorStop(0.75, "#e59819");
        crownGrad.addColorStop(1, "#9c5905");
        ctx.fillStyle = crownGrad;
        ctx.strokeStyle = "#7a4400";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-14.2, 6);
        ctx.lineTo(-16.8, -9.5);
        ctx.quadraticCurveTo(-10.5, -2.5, -7.2, -3.5);
        ctx.lineTo(0, -14.8);
        ctx.lineTo(7.2, -3.5);
        ctx.quadraticCurveTo(10.5, -2.5, 16.8, -9.5);
        ctx.lineTo(14.2, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Molded lower rim band
        const rimGrad = ctx.createLinearGradient(0, 1.5, 0, 7);
        rimGrad.addColorStop(0, "#ffe88c");
        rimGrad.addColorStop(0.55, "#efb028");
        rimGrad.addColorStop(1, "#9c5905");
        ctx.fillStyle = rimGrad;
        ctx.beginPath();
        ctx.roundRect(-14.8, 2.0, 29.6, 4.8, 2.2);
        ctx.fill();
        ctx.stroke();

        // Golden orb tips on peaks
        for (const [px, py, pr] of [[-16.8, -9.8, 2.3], [0, -15.2, 2.7], [16.8, -9.8, 2.3]]) {
          const orbG = ctx.createRadialGradient(px - 0.8, py - 0.8, 0.3, px, py, pr + 0.5);
          orbG.addColorStop(0, "#fffbe0");
          orbG.addColorStop(0.55, "#ffd24c");
          orbG.addColorStop(1, "#9c5905");
          ctx.fillStyle = orbG;
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Faceted gemstones (ruby center + sapphire & emerald side gems)
        const gems = [
          { x: 0, y: 1.5, rx: 2.8, ry: 3.3, c1: "#ff7597", c2: "#d9043d" },
          { x: -8.5, y: 3.4, rx: 2.0, ry: 2.0, c1: "#72efdd", c2: "#0077b6" },
          { x: 8.5, y: 3.4, rx: 2.0, ry: 2.0, c1: "#80ed99", c2: "#1b8a4b" }
        ];
        for (const g of gems) {
          const gg = ctx.createRadialGradient(g.x - 0.7, g.y - 0.8, 0.3, g.x, g.y, g.ry + 0.8);
          gg.addColorStop(0, g.c1);
          gg.addColorStop(1, g.c2);
          ctx.fillStyle = gg;
          ctx.strokeStyle = "#6e3d00";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(g.x, g.y, g.rx, g.ry, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.beginPath();
          ctx.arc(g.x - g.rx * 0.32, g.y - g.ry * 0.32, 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (this.accessory === "strawberry") {
        ctx.translate(spriteMode ? -prof * 2 : yw * 5, -43);

        // Cast shadow
        ctx.fillStyle = "rgba(45, 15, 10, 0.28)";
        ctx.beginPath();
        ctx.ellipse(0, 7.5, 11.5, 3.0, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tapered heart-berry body
        const berryGrad = ctx.createRadialGradient(-4, -5, 1.5, 0, 0, 14);
        berryGrad.addColorStop(0, "#ff8ca3");
        berryGrad.addColorStop(0.45, "#e61c46");
        berryGrad.addColorStop(1, "#8c0823");
        ctx.fillStyle = berryGrad;
        ctx.strokeStyle = "#6e041a";
        ctx.lineWidth = 1.05;
        ctx.beginPath();
        ctx.moveTo(0, -10.5);
        ctx.bezierCurveTo(12.5, -10.5, 13.5, -0.5, 8.5, 5.5);
        ctx.quadraticCurveTo(3.5, 9.8, 0, 9.8);
        ctx.quadraticCurveTo(-3.5, 9.8, -8.5, 5.5);
        ctx.bezierCurveTo(-13.5, -0.5, -12.5, -10.5, 0, -10.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Golden seeds + juicy specular highlight
        ctx.fillStyle = "#ffe58f";
        for (const [sx, sy] of [[-5.5, -4], [0, -3], [5.5, -4], [-7, 0.5], [-2.5, 1.2], [2.5, 1.2], [7, 0.5], [-3.2, 5.2], [3.2, 5.2]]) {
          ctx.beginPath();
          ctx.ellipse(sx, sy, 0.8, 1.35, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
        ctx.beginPath();
        ctx.ellipse(-5.2, -5.2, 2.2, 3.8, 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Sculpted 5-leaf green calyx + stem
        const leafGrad = ctx.createLinearGradient(0, -14, 0, -7);
        leafGrad.addColorStop(0, "#80ed99");
        leafGrad.addColorStop(1, "#2d6a4f");
        ctx.fillStyle = leafGrad;
        ctx.strokeStyle = "#1b4332";
        ctx.lineWidth = 0.85;
        for (const [ang, len] of [[-1.15, 9.5], [-0.55, 8.5], [0, 7.5], [0.55, 8.5], [1.15, 9.5]]) {
          ctx.save();
          ctx.translate(0, -9.8);
          ctx.rotate(ang);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(2.4, 3.5, 0, len * 0.52);
          ctx.quadraticCurveTo(-2.4, 3.5, 0, 0);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        ctx.strokeStyle = "#2d6a4f";
        ctx.lineWidth = 2.0;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, -10.2);
        ctx.quadraticCurveTo(1.5, -14.5, 3.5, -15);
        ctx.stroke();
      } else if (this.accessory === "shades" && (spriteMode || hTurn < 0.72)) {
        const drawGlossLens = (lx, ly, lw, lh, bevel = 4.2) => {
          // Outer sculpted frame
          const frameG = ctx.createLinearGradient(lx, ly, lx, ly + lh);
          frameG.addColorStop(0, "#433e57");
          frameG.addColorStop(0.5, "#232030");
          frameG.addColorStop(1, "#12101a");
          ctx.fillStyle = frameG;
          ctx.strokeStyle = "#0b0a12";
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.roundRect(lx, ly, lw, lh, bevel);
          ctx.fill();
          ctx.stroke();

          // Glossy tinted lens inset
          const lensG = ctx.createLinearGradient(lx, ly + 1.5, lx + lw, ly + lh - 1.5);
          lensG.addColorStop(0, "#3b4973");
          lensG.addColorStop(0.45, "#191c30");
          lensG.addColorStop(1, "#0d0f1a");
          ctx.fillStyle = lensG;
          ctx.beginPath();
          ctx.roundRect(lx + 1.5, ly + 1.5, Math.max(4, lw - 3), lh - 3, Math.max(2, bevel - 1.2));
          ctx.fill();

          // Diagonal studio glass gleam
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(lx + 1.8, ly + 1.8, Math.max(4, lw - 3.6), lh - 3.6, Math.max(1.5, bevel - 1.4));
          ctx.clip();
          ctx.fillStyle = "rgba(255, 255, 255, 0.34)";
          ctx.beginPath();
          ctx.moveTo(lx + lw * 0.16, ly + 1);
          ctx.lineTo(lx + lw * 0.42, ly + 1);
          ctx.lineTo(lx + lw * 0.2, ly + lh - 1);
          ctx.lineTo(lx - lw * 0.04, ly + lh - 1);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "rgba(180, 235, 255, 0.2)";
          ctx.beginPath();
          ctx.moveTo(lx + lw * 0.5, ly + 1);
          ctx.lineTo(lx + lw * 0.62, ly + 1);
          ctx.lineTo(lx + lw * 0.4, ly + lh - 1);
          ctx.lineTo(lx + lw * 0.28, ly + lh - 1);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        };

        if (spriteMode && prof >= 0.5) {
          // Profile sunglasses: drop shadow + temple arm + glossy side lens + gold hinge pin
          ctx.fillStyle = "rgba(30, 12, 5, 0.28)";
          ctx.beginPath();
          ctx.roundRect(-21.5, -11.5 + eyeDy, 16.5, 11.5, 4);
          ctx.fill();

          ctx.strokeStyle = "#191724";
          ctx.lineWidth = 3.0;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(-6, -9.2 + eyeDy);
          ctx.quadraticCurveTo(3, -9.8 + eyeDy, 10, -7.2 + eyeDy);
          ctx.stroke();

          drawGlossLens(-21.5, -13 + eyeDy, 16.5, 11.5, 4);
          ctx.fillStyle = "#ffd166";
          ctx.beginPath();
          ctx.arc(-6.8, -9.6 + eyeDy, 1.0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const fx = spriteMode ? -prof * 10 : (this.lookX * 2.5 + yw * 14);
          const lwL = 19 * (1 - Math.max(0, yw) * 0.35);
          const lwR = 19 * (1 - Math.max(0, -yw) * 0.35);

          // Cast shadow on face fur
          ctx.fillStyle = "rgba(30, 12, 5, 0.25)";
          ctx.beginPath();
          ctx.roundRect(-24.5 + fx, -11.2 + eyeDy, lwL, 12.2, 4.2);
          ctx.roundRect(3.5 + fx, -11.2 + eyeDy, lwR, 12.2, 4.2);
          ctx.fill();

          // Contoured nose bridge
          ctx.fillStyle = "#262333";
          ctx.beginPath();
          ctx.moveTo(-6.5 + fx, -11 + eyeDy);
          ctx.quadraticCurveTo(-1 + fx, -12.6 + eyeDy, 4.5 + fx, -11 + eyeDy);
          ctx.lineTo(4.5 + fx, -7.8 + eyeDy);
          ctx.quadraticCurveTo(-1 + fx, -9.4 + eyeDy, -6.5 + fx, -7.8 + eyeDy);
          ctx.closePath();
          ctx.fill();

          drawGlossLens(-24.5 + fx, -13 + eyeDy, lwL, 12.2, 4.2);
          drawGlossLens(3.5 + fx, -13 + eyeDy, lwR, 12.2, 4.2);

          // Corner gold frame rivets
          ctx.fillStyle = "#ffd166";
          ctx.beginPath();
          ctx.arc(-22.2 + fx, -10.5 + eyeDy, 0.9, 0, Math.PI * 2);
          ctx.arc(3.5 + lwR - 2.3 + fx, -10.5 + eyeDy, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (this.accessory === "chef") {
        ctx.translate(spriteMode ? -prof * 2 : yw * 4, -39);
        ctx.scale(1 - hTurn * 0.15, 1);

        // Soft shadow onto forehead
        ctx.fillStyle = "rgba(45, 22, 10, 0.26)";
        ctx.beginPath();
        ctx.ellipse(0, 3.2, 18.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Puffy pleated toque crown
        const toqueGrad = ctx.createRadialGradient(-5, -19, 3, 0, -14, 24);
        toqueGrad.addColorStop(0, "#ffffff");
        toqueGrad.addColorStop(0.68, "#f3ece4");
        toqueGrad.addColorStop(1, "#d9cec2");
        ctx.fillStyle = toqueGrad;
        ctx.strokeStyle = "#a6988a";
        ctx.lineWidth = 1.05;
        ctx.beginPath();
        ctx.arc(-11.5, -14.5, 9.2, Math.PI * 0.55, Math.PI * 1.85);
        ctx.arc(-5, -20.5, 9.5, Math.PI * 0.95, Math.PI * 1.9);
        ctx.arc(4.5, -20.5, 9.5, Math.PI * 1.1, Math.PI * 2.05);
        ctx.arc(11.5, -14.5, 9.2, Math.PI * 1.15, Math.PI * 0.45);
        ctx.lineTo(15.5, -6);
        ctx.lineTo(-15.5, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Vertical pleat folds converging into the band
        ctx.strokeStyle = "rgba(155, 140, 125, 0.42)";
        ctx.lineWidth = 1.1;
        for (const [topX, botX] of [[-8.5, -6.5], [-2.5, -2.0], [2.5, 2.0], [8.5, 6.5]]) {
          ctx.beginPath();
          ctx.moveTo(topX, -20);
          ctx.quadraticCurveTo(topX * 0.85, -13, botX, -7);
          ctx.stroke();
        }

        // Tailored double-stitched linen cuff band
        const bandGrad = ctx.createLinearGradient(-17, -7, 17, 2);
        bandGrad.addColorStop(0, "#e8dfd5");
        bandGrad.addColorStop(0.35, "#ffffff");
        bandGrad.addColorStop(1, "#d9cfc4");
        ctx.fillStyle = bandGrad;
        ctx.strokeStyle = "#a6988a";
        ctx.lineWidth = 1.05;
        ctx.beginPath();
        ctx.roundRect(-17.5, -7, 35, 9.2, 4);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(150, 136, 122, 0.4)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-15, -4.6);
        ctx.lineTo(15, -4.6);
        ctx.stroke();
      } else if (this.accessory === "bear") {
        if (spriteMode && prof > 0) ctx.scale(1 - prof * 0.36, 1);
        const shiftX = spriteMode ? prof * 4 : (-hf * hTurn * 4);

        // Cast shadow under headband
        ctx.strokeStyle = "rgba(45, 20, 8, 0.25)";
        ctx.lineWidth = 8.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-34 + shiftX, -13.5);
        ctx.bezierCurveTo(-28 + shiftX, -40.5, 28 + shiftX, -40.5, 34 + shiftX, -13.5);
        ctx.stroke();

        // Plush fur bear ears + cupped cream inner ears
        for (const ex of [-24 + shiftX, 24 + shiftX]) {
          const outerG = ctx.createRadialGradient(ex - 2.5, -39, 1.5, ex, -36, 12);
          outerG.addColorStop(0, "#b87a52");
          outerG.addColorStop(0.55, "#875030");
          outerG.addColorStop(1, "#542d16");
          ctx.fillStyle = outerG;
          ctx.strokeStyle = "#42210e";
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.arc(ex, -36, 11.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          const innerG = ctx.createRadialGradient(ex, -35, 1, ex, -35.5, 6.5);
          innerG.addColorStop(0, "#ffe4c4");
          innerG.addColorStop(0.7, "#e3b386");
          innerG.addColorStop(1, "#bd7c4d");
          ctx.fillStyle = innerG;
          ctx.beginPath();
          ctx.arc(ex, -35.5, 6.0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fabric-wrapped headband with top gloss highlight
        ctx.strokeStyle = "#472512";
        ctx.lineWidth = 7.4;
        ctx.beginPath();
        ctx.moveTo(-34 + shiftX, -15);
        ctx.bezierCurveTo(-28 + shiftX, -42, 28 + shiftX, -42, 34 + shiftX, -15);
        ctx.stroke();

        const hbGrad = ctx.createLinearGradient(0, -40, 0, -14);
        hbGrad.addColorStop(0, "#b57a52");
        hbGrad.addColorStop(0.6, "#854e2e");
        hbGrad.addColorStop(1, "#5c3219");
        ctx.strokeStyle = hbGrad;
        ctx.lineWidth = 5.6;
        ctx.beginPath();
        ctx.moveTo(-34 + shiftX, -15);
        ctx.bezierCurveTo(-28 + shiftX, -42, 28 + shiftX, -42, 34 + shiftX, -15);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 232, 208, 0.35)";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(-24 + shiftX, -29);
        ctx.quadraticCurveTo(shiftX, -37.5, 24 + shiftX, -29);
        ctx.stroke();
      } else if (this.accessory === "blossom") {
        if (spriteMode) {
          ctx.translate(-19 + prof * 23, -35);
        } else {
          ctx.translate(-19 * (1 - hTurn * 0.4) + yw * 11, -35);
        }
        // Subtle fur shadow
        ctx.fillStyle = "rgba(65, 18, 30, 0.25)";
        ctx.beginPath();
        ctx.arc(0.8, 1.5, 10.5, 0, Math.PI * 2);
        ctx.fill();

        // 5 notched sakura petals
        for (let i = 0; i < 5; i++) {
          ctx.save();
          ctx.rotate((i / 5) * Math.PI * 2 - Math.PI * 0.5);
          const pGrad = ctx.createRadialGradient(0, 0, 1, 0, -7, 10);
          pGrad.addColorStop(0, "#ff5c93");
          pGrad.addColorStop(0.5, "#ffb3cc");
          pGrad.addColorStop(1, "#fff2f6");
          ctx.fillStyle = pGrad;
          ctx.strokeStyle = "#c94b78";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(0, -1);
          ctx.bezierCurveTo(-6.2, -3.5, -5.8, -11.5, -1.6, -11.8);
          ctx.lineTo(0, -9.8);
          ctx.lineTo(1.6, -11.8);
          ctx.bezierCurveTo(5.8, -11.5, 6.2, -3.5, 0, -1);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // Delicate stamen filaments + faceted amber-gold pollen cluster
        ctx.strokeStyle = "#d6336c";
        ctx.lineWidth = 0.85;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 - Math.PI * 0.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * 4.5, Math.sin(a) * 4.5);
          ctx.stroke();
        }
        const coreGrad = ctx.createRadialGradient(-0.8, -0.8, 0.4, 0, 0, 3.6);
        coreGrad.addColorStop(0, "#fff8b8");
        coreGrad.addColorStop(0.6, "#ffd147");
        coreGrad.addColorStop(1, "#d97706");
        ctx.fillStyle = coreGrad;
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (this.accessory === "headphones") {
        ctx.translate(spriteMode ? 0 : yw * 4, -8);
        if (spriteMode && prof > 0) ctx.scale(1 - prof * 0.42, 1);

        // Cushioned glossy headband
        ctx.strokeStyle = "#0e5a75";
        ctx.lineWidth = 6.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(0, -10, 32, Math.PI * 1.06, Math.PI * 1.94);
        ctx.stroke();

        const hbG = ctx.createLinearGradient(-32, -42, 32, -10);
        hbG.addColorStop(0, "#72efdd");
        hbG.addColorStop(0.5, "#38bdf8");
        hbG.addColorStop(1, "#0284c7");
        ctx.strokeStyle = hbG;
        ctx.lineWidth = 4.8;
        ctx.beginPath();
        ctx.arc(0, -10, 32, Math.PI * 1.06, Math.PI * 1.94);
        ctx.stroke();

        // Top gloss highlight + soft underside foam pad
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, -10, 33.2, Math.PI * 1.24, Math.PI * 1.76);
        ctx.stroke();

        ctx.strokeStyle = "#2b2d42";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(0, -10, 29.8, Math.PI * 1.25, Math.PI * 1.75);
        ctx.stroke();

        // Memory-foam cushions + glossy 3D coral-pink ear shells
        for (const [cxCup, cushionOffset] of [[-36.5, 2.2], [25.5, -2.2]]) {
          // Cast shadow + dark ear pad
          ctx.fillStyle = "rgba(20, 12, 24, 0.3)";
          ctx.beginPath();
          ctx.roundRect(cxCup + 0.5, -13, 11.5, 20, 5.5);
          ctx.fill();

          ctx.fillStyle = "#232536";
          ctx.beginPath();
          ctx.roundRect(cxCup + cushionOffset, -13.5, 9.5, 19.5, 4.5);
          ctx.fill();

          // Outer metallic/glossy cup
          const cupGrad = ctx.createLinearGradient(cxCup, -14, cxCup + 11, 6);
          cupGrad.addColorStop(0, "#ffb3c6");
          cupGrad.addColorStop(0.45, "#ff4d79");
          cupGrad.addColorStop(1, "#a4133c");
          ctx.fillStyle = cupGrad;
          ctx.strokeStyle = "#7a0e2c";
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.roundRect(cxCup, -14, 10.5, 20, 5.2);
          ctx.fill();
          ctx.stroke();

          // Gloss highlight & silver trim ring
          ctx.strokeStyle = "rgba(255, 255, 255, 0.52)";
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(cxCup + 2.8, -10.5);
          ctx.lineTo(cxCup + 2.8, -1.5);
          ctx.stroke();
        }
      } else if (this.accessory === "wizard") {
        ctx.translate(spriteMode ? -prof * 2 : yw * 5, -40);
        ctx.scale(1 - hTurn * 0.16, 1);

        // Forehead drop shadow
        ctx.fillStyle = "rgba(25, 12, 50, 0.32)";
        ctx.beginPath();
        ctx.ellipse(0, 6.0, 24.5, 5.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sculpted velvet hat brim
        const brimGrad = ctx.createLinearGradient(-24, 0, 24, 9);
        brimGrad.addColorStop(0, "#7c55e0");
        brimGrad.addColorStop(0.5, "#5a32b5");
        brimGrad.addColorStop(1, "#321773");
        ctx.fillStyle = brimGrad;
        ctx.strokeStyle = "#240e57";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(0, 4, 24.5, 6.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Drooping curved velvet cone
        const coneGrad = ctx.createLinearGradient(-15, -28, 15, 5);
        coneGrad.addColorStop(0, "#a07af5");
        coneGrad.addColorStop(0.55, "#673cc7");
        coneGrad.addColorStop(1, "#371b7a");
        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(-15.2, 4);
        ctx.bezierCurveTo(-11, -12, -2, -26, 9.5, -29.5);
        ctx.bezierCurveTo(6.5, -20, 11.5, -8, 14.8, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Metallic gold ribbon band + brass buckle
        const goldGrad = ctx.createLinearGradient(-14, -2, 14, 4);
        goldGrad.addColorStop(0, "#ffea85");
        goldGrad.addColorStop(0.5, "#ffd147");
        goldGrad.addColorStop(1, "#c98512");
        ctx.fillStyle = goldGrad;
        ctx.strokeStyle = "#7a4e05";
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.roundRect(-13.8, -1.6, 27.6, 4.6, 1.5);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#fff4b8";
        ctx.lineWidth = 1.4;
        ctx.strokeRect(-3.2, -2.0, 6.4, 5.4);

        // Crisp 5-point golden stars + tip starlight orb
        ctx.fillStyle = "#ffe875";
        this._drawStar5(ctx, -2.5, -12, 4.2, 1.8);
        ctx.fill();
        this._drawStar5(ctx, 4.2, -19, 2.6, 1.1);
        ctx.fill();
        ctx.fillStyle = "#fff9cc";
        ctx.beginPath();
        ctx.arc(9.8, -29.8, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    _drawParticles(ctx) {
      for (const p of this.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.font = `700 ${Math.round(p.size)}px sans-serif`;
        ctx.textAlign = "center";
        if (p.kind === "zzz") {
          ctx.fillStyle = this.isNight ? "#ffe885" : "#7b6d8d";
          ctx.fillText("Zzz", p.x, p.y);
        } else if (p.kind === "dream") {
          ctx.fillText(p.text || "💭🐟", p.x, p.y);
        } else if (p.kind === "dizzy") {
          ctx.fillText("💫", p.x, p.y);
        } else if (p.kind === "water") {
          ctx.fillText("💧", p.x, p.y);
        } else {
          ctx.fillText(p.kind === "heart" ? "💖" : "💢", p.x, p.y);
        }
        ctx.restore();
      }
    }

    _drawFlyingSnacks(ctx) {
      for (const s of this.flyingSnacks) {
        const ease = 1 - Math.pow(1 - s.t, 2);
        const x = s.x + (s.tx - s.x) * ease;
        const arc = Math.sin(s.t * Math.PI) * 35;
        const y = s.y + (s.ty - s.y) * ease - arc;
        ctx.save();
        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🐟", x, y);
        ctx.restore();
      }
    }
  }

  global.MochiPet = MochiPet;
  global.COAT_SKINS = COAT_SKINS;
})(window);
