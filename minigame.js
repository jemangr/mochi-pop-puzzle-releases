/**
 * Mochi Pop! Care Mini-Game: Catch the Laser & Golden Treats (v0.6.0)
 * 15-second interactive reflex mini-game that boosts Mochi Mood, Friend XP & Fish!
 */
(function (global) {
  class MochiLaserMiniGame {
    constructor(canvas, callbacks = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.cb = callbacks;
      this.running = false;
      this.rafId = 0;
      this.lastTs = 0;
      this.timeLeft = 15;
      this.duration = 15;
      this.score = 0;
      this.catches = 0;
      this.streak = 0;
      this.bestStreak = 0;
      this.targets = [];
      this.bursts = [];
      this.spawnCooldown = 0;
      this.catPos = { x: 160, y: 195, tx: 160, ty: 195, bounce: 0 };
      this.mode = "laser"; // laser | bakery
      this.bakeryIngredients = [
        { kind: "strawberry", icon: "🍓" },
        { kind: "honey", icon: "🍯" },
        { kind: "matcha", icon: "🍵" },
        { kind: "fish", icon: "🐟" }
      ];
      this.bakeryTarget = this.bakeryIngredients[0];
      this.width = 320;
      this.height = 250;

      this._onPointerDown = (e) => this.handleTap(e);
      this._onPointerMove = (e) => {
        if (!this.running || this.mode !== "rain" || !this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        this.catPos.tx = Math.max(24, Math.min(this.width - 24, e.clientX - rect.left));
      };
      if (this.canvas) {
        this.canvas.addEventListener("pointerdown", this._onPointerDown);
        this.canvas.addEventListener("pointermove", this._onPointerMove);
      }
    }

    _resize() {
      if (!this.canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(260, this.canvas.clientWidth || 320);
      const h = Math.max(210, this.canvas.clientHeight || 240);
      this.width = w;
      this.height = h;
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    start(durationSec = 15, mode = "laser") {
      this.stop();
      this._resize();
      this.mode = mode === "bakery" ? "bakery" : (mode === "rain" ? "rain" : "laser");
      this.duration = durationSec;
      this.timeLeft = durationSec;
      this.score = 0;
      this.catches = 0;
      this.streak = 0;
      this.bestStreak = 0;
      this.targets = [];
      this.bursts = [];
      this.spawnCooldown = 0.05;
      if (this.mode === "bakery") {
        this._pickNextBakeryTarget();
      }
      const startY = this.mode === "rain" ? Math.max(120, this.height - 36) : this.height * 0.78;
      this.catPos = {
        x: this.width * 0.5,
        y: startY,
        tx: this.width * 0.5,
        ty: startY,
        bounce: 0
      };
      this.running = true;
      this.lastTs = performance.now();
      this._spawnTarget(true);
      this._spawnTarget(false);
      if (this.mode === "bakery") this._spawnTarget(false);
      if (this.cb.onTick) this.cb.onTick(this.getSnapshot());
      this.rafId = requestAnimationFrame((ts) => this._loop(ts));
    }

    _pickNextBakeryTarget() {
      const pool = this.bakeryIngredients;
      this.bakeryTarget = pool[Math.floor(Math.random() * pool.length)];
    }

    stop() {
      this.running = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
      }
    }

    getSnapshot() {
      return {
        timeLeft: Math.max(0, this.timeLeft),
        score: this.score,
        catches: this.catches,
        streak: this.streak,
        bestStreak: this.bestStreak
      };
    }

    _spawnTarget(forceGood = false) {
      const pad = 28;
      if (this.mode === "rain") {
        const roll = forceGood ? Math.random() * 0.78 : Math.random();
        let kind = "fish";
        let pts = 18;
        if (roll >= 0.82) {
          kind = "cloud";
          pts = -10;
        } else if (roll >= 0.66) {
          kind = "tuna";
          pts = 30;
        } else if (roll >= 0.5) {
          kind = "star";
          pts = 24;
        }
        this.targets.push({
          kind,
          pts,
          r: 20,
          x: pad + Math.random() * Math.max(40, this.width - pad * 2),
          y: -14,
          vx: (Math.random() - 0.5) * 18,
          vy: 92 + Math.random() * 48,
          life: 4.5,
          maxLife: 4.5,
          pulse: Math.random() * 6
        });
        return;
      }
      if (this.mode === "bakery") {
        const want = this.bakeryTarget || this.bakeryIngredients[0];
        const useTarget = forceGood || Math.random() < 0.45;
        const chosen = useTarget
          ? want
          : this.bakeryIngredients[Math.floor(Math.random() * this.bakeryIngredients.length)];
        const x = pad + Math.random() * Math.max(40, this.width - pad * 2);
        const y = 52 + Math.random() * Math.max(40, this.height - 96);
        const ang = Math.random() * Math.PI * 2;
        this.targets.push({
          kind: "ing",
          ingKind: chosen.kind,
          icon: chosen.icon,
          pts: chosen.kind === want.kind ? 28 : -10,
          r: 23,
          x,
          y,
          vx: Math.cos(ang) * 32,
          vy: Math.sin(ang) * 26,
          life: 2.0,
          maxLife: 2.0,
          pulse: Math.random() * 6
        });
        return;
      }
      const roll = forceGood ? Math.random() * 0.82 : Math.random();
      let kind = "laser";
      let pts = 15;
      let r = 21;
      let life = 1.65;
      if (roll < 0.52) {
        kind = "laser";
        pts = 15;
        r = 21;
        life = 1.55;
      } else if (roll < 0.78) {
        kind = "fish";
        pts = 25;
        r = 22;
        life = 1.75;
      } else if (roll < 0.89) {
        kind = "star";
        pts = 40;
        r = 19;
        life = 1.3;
      } else {
        kind = "cloud";
        pts = -10;
        r = 20;
        life = 1.8;
      }

      const x = pad + Math.random() * Math.max(40, this.width - pad * 2);
      const y = pad + Math.random() * Math.max(40, this.height - pad * 2 - 22);
      const ang = Math.random() * Math.PI * 2;
      const speed = kind === "laser" ? 72 : (kind === "star" ? 86 : 44);
      this.targets.push({
        kind,
        pts,
        r,
        x,
        y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        life,
        maxLife: life,
        pulse: Math.random() * 6
      });
    }

    handleTap(e) {
      if (!this.running || !this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      this.catPos.tx = Math.max(24, Math.min(this.width - 24, px));
      if (this.mode !== "rain") {
        this.catPos.ty = Math.max(28, Math.min(this.height - 20, py));
      }
      this.catPos.bounce = 1;
      if (this.mode === "rain") return;

      let hitIdx = -1;
      let bestDist = Infinity;
      for (let i = 0; i < this.targets.length; i++) {
        const t = this.targets[i];
        const d = Math.hypot(t.x - px, t.y - py);
        if (d <= t.r + 12 && d < bestDist) {
          bestDist = d;
          hitIdx = i;
        }
      }

      if (hitIdx >= 0) {
        const hit = this.targets.splice(hitIdx, 1)[0];
        if (hit.kind === "ing") {
          const isMatch = this.bakeryTarget && hit.ingKind === this.bakeryTarget.kind;
          if (isMatch) {
            this.catches += 1;
            this.streak += 1;
            this.bestStreak = Math.max(this.bestStreak, this.streak);
            const mult = this.streak >= 5 ? 2 : (this.streak >= 3 ? 1.5 : 1);
            const gain = Math.round(30 * mult);
            this.score += gain;
            this._spawnBurst(hit.x, hit.y, `🍪 +${gain}`, "#d97706");
            this._pickNextBakeryTarget();
            if (this.cb.onHit) this.cb.onHit("fish", gain, this.streak);
          } else {
            this.streak = 0;
            this.score = Math.max(0, this.score - 10);
            this._spawnBurst(hit.x, hit.y, "-10 🙅", "#94a3b8");
            if (this.cb.onMiss) this.cb.onMiss();
          }
        } else if (hit.kind === "cloud") {
          this.streak = 0;
          this.score = Math.max(0, this.score + hit.pts);
          this._spawnBurst(hit.x, hit.y, "-10 💤", "#94a3b8");
          if (this.cb.onMiss) this.cb.onMiss();
        } else {
          this.catches += 1;
          this.streak += 1;
          this.bestStreak = Math.max(this.bestStreak, this.streak);
          const mult = this.streak >= 6 ? 2 : (this.streak >= 3 ? 1.5 : 1);
          const gain = Math.round(hit.pts * mult);
          this.score += gain;
          const color = hit.kind === "fish" ? "#f59e0b" : (hit.kind === "star" ? "#a855f7" : "#ef4444");
          const txt = mult > 1 ? `+${gain} ×${mult}` : `+${gain}`;
          this._spawnBurst(hit.x, hit.y, txt, color);
          if (this.cb.onHit) this.cb.onHit(hit.kind, gain, this.streak);
        }
        if (this.cb.onTick) this.cb.onTick(this.getSnapshot());
      } else {
        this.streak = 0;
        this._spawnBurst(px, py, "🐾", "#cbd5e1", true);
        if (this.cb.onTick) this.cb.onTick(this.getSnapshot());
      }
    }

    _spawnBurst(x, y, text, color, small = false) {
      this.bursts.push({ x, y, text, color, life: small ? 0.45 : 0.75, maxLife: small ? 0.45 : 0.75 });
      const count = small ? 3 : 7;
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const sp = 45 + Math.random() * 75;
        this.bursts.push({
          particle: true,
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          r: 2.8 + Math.random() * 2.5,
          color,
          life: 0.48,
          maxLife: 0.48
        });
      }
    }

    _loop(ts) {
      if (!this.running) return;
      const dt = Math.min(0.05, Math.max(0.001, (ts - this.lastTs) / 1000));
      this.lastTs = ts;
      this.update(dt);
      this.draw();
      if (this.running) {
        this.rafId = requestAnimationFrame((nextTs) => this._loop(nextTs));
      }
    }

    update(dt) {
      this.timeLeft = Math.max(0, this.timeLeft - dt);
      if (this.cb.onTick) this.cb.onTick(this.getSnapshot());

      this.catPos.x += (this.catPos.tx - this.catPos.x) * Math.min(1, dt * 11);
      this.catPos.y += (this.catPos.ty - this.catPos.y) * Math.min(1, dt * 11);
      this.catPos.bounce = Math.max(0, this.catPos.bounce - dt * 4);

      this.spawnCooldown -= dt;
      if (this.spawnCooldown <= 0 && this.targets.length < 4) {
        this._spawnTarget(this.targets.every((t) => t.kind === "cloud"));
        this.spawnCooldown = 0.42 + Math.random() * 0.28;
      }

      const pad = 22;
      for (let i = this.targets.length - 1; i >= 0; i--) {
        const t = this.targets[i];
        t.life -= dt;
        t.pulse += dt * 7;
        t.x += t.vx * dt;
        t.y += t.vy * dt;
        if (this.mode === "rain") {
          if (Math.hypot(t.x - this.catPos.x, t.y - this.catPos.y) <= 34) {
            this.targets.splice(i, 1);
            this.catPos.bounce = 1;
            if (t.kind === "cloud") {
              this.streak = 0;
              this.score = Math.max(0, this.score + t.pts);
              this._spawnBurst(this.catPos.x, this.catPos.y - 16, "-10 💤", "#94a3b8");
              if (this.cb.onMiss) this.cb.onMiss();
            } else {
              this.catches += 1;
              this.streak += 1;
              this.bestStreak = Math.max(this.bestStreak, this.streak);
              const mult = this.streak >= 5 ? 2 : (this.streak >= 3 ? 1.5 : 1);
              const gain = Math.round(t.pts * mult);
              this.score += gain;
              this._spawnBurst(this.catPos.x, this.catPos.y - 18, `+${gain}`, "#0284c7");
              if (this.cb.onHit) this.cb.onHit("fish", gain, this.streak);
            }
            if (this.cb.onTick) this.cb.onTick(this.getSnapshot());
            continue;
          }
          if (t.y > this.height + 24 || t.life <= 0) {
            this.targets.splice(i, 1);
          }
          continue;
        }
        if (t.x < pad || t.x > this.width - pad) {
          t.vx *= -1;
          t.x = Math.max(pad, Math.min(this.width - pad, t.x));
        }
        if (t.y < pad || t.y > this.height - pad) {
          t.vy *= -1;
          t.y = Math.max(pad, Math.min(this.height - pad, t.y));
        }
        if (t.life <= 0) {
          this.targets.splice(i, 1);
        }
      }

      for (let i = this.bursts.length - 1; i >= 0; i--) {
        const b = this.bursts[i];
        b.life -= dt;
        if (b.particle) {
          b.x += b.vx * dt;
          b.y += b.vy * dt;
        } else {
          b.y -= 28 * dt;
        }
        if (b.life <= 0) {
          this.bursts.splice(i, 1);
        }
      }

      if (this.timeLeft <= 0) {
        this.running = false;
        if (this.cb.onFinish) this.cb.onFinish(this.getSnapshot());
      }
    }

    draw() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      ctx.clearRect(0, 0, w, h);

      // Cozy room playmat backdrop
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      if (this.mode === "rain") {
        bg.addColorStop(0, "#e0f2fe");
        bg.addColorStop(1, "#bae6fd");
      } else {
        bg.addColorStop(0, "#fff2e5");
        bg.addColorStop(1, "#ffe0d2");
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Soft play rug oval
      ctx.save();
      ctx.fillStyle = this.mode === "bakery" ? "rgba(251, 191, 36, 0.2)" : (this.mode === "rain" ? "rgba(56, 189, 248, 0.18)" : "rgba(255, 168, 192, 0.28)");
      ctx.strokeStyle = this.mode === "bakery" ? "rgba(217, 119, 6, 0.35)" : (this.mode === "rain" ? "rgba(2, 132, 199, 0.28)" : "rgba(255, 128, 160, 0.35)");
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.56, w * 0.38, h * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      if (this.mode === "bakery" && this.bakeryTarget) {
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(w * 0.5 - 64, 8, 128, 30, 15);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#92400e";
        ctx.font = "900 14px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`🍪 Need: ${this.bakeryTarget.icon}`, w * 0.5, 23);
        ctx.restore();
      }

      // Mochi runner chasing taps
      ctx.save();
      const catLift = Math.sin(this.catPos.bounce * Math.PI) * 10;
      ctx.translate(this.catPos.x, this.catPos.y - catLift);
      ctx.fillStyle = "rgba(90, 50, 40, 0.14)";
      ctx.beginPath();
      ctx.ellipse(0, 14 + catLift * 0.5, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "28px 'Segoe UI Emoji', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🐱", 0, 0);
      ctx.restore();

      // Targets
      for (const t of this.targets) {
        const fade = Math.min(1, t.life * 2.5);
        const s = 1 + Math.sin(t.pulse) * 0.08;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(t.x, t.y);
        ctx.scale(s, s);
        if (t.kind === "laser") {
          const rg = ctx.createRadialGradient(0, 0, 2, 0, 0, t.r + 6);
          rg.addColorStop(0, "rgba(255, 70, 90, 0.95)");
          rg.addColorStop(0.55, "rgba(255, 50, 80, 0.4)");
          rg.addColorStop(1, "rgba(255, 50, 80, 0)");
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.arc(0, 0, t.r + 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ff2e55";
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffd6df";
          ctx.beginPath();
          ctx.arc(-2.5, -2.5, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = t.kind === "cloud" ? "rgba(148, 163, 184, 0.25)" : "rgba(255, 255, 255, 0.85)";
          ctx.beginPath();
          ctx.arc(0, 0, t.r, 0, Math.PI * 2);
          ctx.fill();
          if (t.kind === "ing" && this.bakeryTarget && t.ingKind === this.bakeryTarget.kind) {
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          }
          if (t.kind === "fish") {
            const drawFn = (window.MochiPet && window.MochiPet.drawFish) || window.drawRealisticFish;
            if (drawFn) {
              drawFn(ctx, 0, 0, t.r * 1.85, 0, { shadow: false });
            } else {
              ctx.font = "22px 'Segoe UI Emoji', sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("🐟", 0, 1);
            }
          } else {
            ctx.font = "22px 'Segoe UI Emoji', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(t.kind === "ing" ? t.icon : (t.kind === "tuna" ? "🥫" : (t.kind === "star" ? "⭐" : "💤")), 0, 1);
          }
        }
        ctx.restore();
      }

      // Bursts & floating scores
      for (const b of this.bursts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, b.life / b.maxLife);
        if (b.particle) {
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.font = "900 15px 'Segoe UI', sans-serif";
          ctx.textAlign = "center";
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 3.5;
          ctx.strokeText(b.text, b.x, b.y);
          ctx.fillStyle = b.color;
          ctx.fillText(b.text, b.x, b.y);
        }
        ctx.restore();
      }
    }
  }

  global.MochiMiniGame = { MochiLaserMiniGame };
})(window);
