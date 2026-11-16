/**
 * 8x8 Cozy Block Puzzle with Golden Fish Treats, Line-Clear Preview,
 * Smart Piece Generation, and Smooth Drag-and-Drop FX.
 */
(function (global) {
  const GRID_SIZE = 8;

  const COLORS = [
    { name: "strawberry", fill: "#ff6b8b", hi: "#ff9ab0", border: "#d9486a" }, // Strawberry
    { name: "tangerine",  fill: "#ff9f43", hi: "#ffc07f", border: "#d6791f" }, // Tangerine
    { name: "honey",      fill: "#ffd166", hi: "#ffe39e", border: "#d4a32a" }, // Honey
    { name: "mint",       fill: "#2ec4b6", hi: "#72dfd5", border: "#1b968a" }, // Mint
    { name: "blueberry",  fill: "#5f85ff", hi: "#95afff", border: "#3d62d9" }, // Blueberry
    { name: "lavender",   fill: "#b07aff", hi: "#cda8ff", border: "#854ee0" }  // Lavender
  ];

  function createSeededRng(seedStr) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedStr.length; i++) {
      h ^= seedStr.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return function () {
      h += 0x6D2B79F5;
      let t = Math.imul(h ^ (h >>> 15), 1 | h);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Weighted polyomino templates
  const SHAPES = [
    { cells: [[0, 0]], weight: 3 },
    { cells: [[0, 0], [0, 1]], weight: 5 },
    { cells: [[0, 0], [1, 0]], weight: 5 },
    { cells: [[0, 0], [0, 1], [0, 2]], weight: 5 },
    { cells: [[0, 0], [1, 0], [2, 0]], weight: 5 },
    { cells: [[0, 0], [0, 1], [0, 2], [0, 3]], weight: 3 },
    { cells: [[0, 0], [1, 0], [2, 0], [3, 0]], weight: 3 },
    { cells: [[0, 0], [0, 1], [1, 0], [1, 1]], weight: 6 }, // 2x2
    { cells: [[0, 0], [1, 0], [1, 1]], weight: 5 },         // small L
    { cells: [[0, 1], [1, 0], [1, 1]], weight: 5 },
    { cells: [[0, 0], [0, 1], [1, 0]], weight: 5 },
    { cells: [[0, 0], [0, 1], [1, 1]], weight: 5 },
    { cells: [[0, 0], [1, 0], [2, 0], [2, 1]], weight: 3 }, // big L
    { cells: [[0, 1], [1, 1], [2, 0], [2, 1]], weight: 3 },
    { cells: [[0, 0], [0, 1], [0, 2], [1, 1]], weight: 4 }, // T
    { cells: [[0, 1], [1, 0], [1, 1], [1, 2]], weight: 4 },
    { cells: [[0, 0], [0, 1], [1, 1], [1, 2]], weight: 3 }, // Z
    { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]], weight: 2 }, // 2x3
    { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]], weight: 1.5 } // 3x3
  ];

  function createEmptyGrid() {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  }

  function pickWeightedShape(rng = Math.random) {
    const total = SHAPES.reduce((s, item) => s + item.weight, 0);
    let r = rng() * total;
    for (const item of SHAPES) {
      r -= item.weight;
      if (r <= 0) return item.cells;
    }
    return SHAPES[0].cells;
  }

  function makePiece(forceSmall = false, options = {}) {
    const rng = options.rng || Math.random;
    const score = options.score || 0;
    const allowSpecial = options.allowSpecial !== false;

    // Rare 1x1 Paw Bomb piece (~7% chance once score >= 300)
    if (!forceSmall && allowSpecial && score >= 300 && rng() < 0.07) {
      return {
        cells: [[0, 0]],
        rows: 1,
        cols: 1,
        color: { name: "bomb", fill: "#463a5c", hi: "#6e5c8c", border: "#251d33" },
        fishIndex: -1,
        tunaIndex: -1,
        giftIndex: -1,
        rocketIndex: -1,
        rocketAxis: null,
        rainbowIndex: -1,
        iceIndex: -1,
        kind: "bomb"
      };
    }

    const cells = forceSmall
      ? SHAPES[Math.floor(rng() * 5)].cells
      : pickWeightedShape(rng);
    const color = COLORS[Math.floor(rng() * COLORS.length)];
    const usedCells = new Set();

    // ~38% chance one cell carries a Golden Fish treat (~72% during Purr Rush Fever!)
    let fishIndex = -1;
    let tunaIndex = -1;
    const fishBase = options.feverMode ? 0.72 : 0.38;
    const fishChance = Math.min(0.92, fishBase * (options.eventFishMult || 1));
    if (rng() < fishChance) {
      const idx = Math.floor(rng() * cells.length);
      usedCells.add(idx);
      // Big risky pieces (>= 5 cells) have a 40% chance to upgrade Fish -> Golden Tuna (+2 fish!)
      if (allowSpecial && cells.length >= 5 && rng() < 0.4) {
        tunaIndex = idx;
      } else {
        fishIndex = idx;
      }
    }

    const pickFreeCell = () => {
      const free = [];
      for (let i = 0; i < cells.length; i++) {
        if (!usedCells.has(i)) free.push(i);
      }
      if (!free.length) return -1;
      const chosen = free[Math.floor(rng() * free.length)];
      usedCells.add(chosen);
      return chosen;
    };

    // Gift Box Mystery tile (~11% chance after score >= 150)
    let giftIndex = -1;
    if (allowSpecial && score >= 150 && rng() < 0.11) {
      giftIndex = pickFreeCell();
    }

    // Yarn Rocket tile (~9% chance after score >= 350, 2x on Rocket Day)
    let rocketIndex = -1;
    let rocketAxis = null;
    const rocketChance = Math.min(0.28, 0.09 * (options.eventRocketMult || 1));
    if (allowSpecial && score >= 350 && rng() < rocketChance) {
      rocketIndex = pickFreeCell();
      if (rocketIndex >= 0) rocketAxis = rng() < 0.5 ? "row" : "col";
    }

    // Rainbow Color-Clear tile (~7% chance after score >= 550)
    let rainbowIndex = -1;
    if (allowSpecial && score >= 550 && rng() < 0.07) {
      rainbowIndex = pickFreeCell();
    }

    // Ice 2-hit crystal block (~15% chance after score >= 800)
    let iceIndex = -1;
    if (allowSpecial && score >= 800 && cells.length >= 2 && rng() < 0.15) {
      iceIndex = pickFreeCell();
    }

    let maxR = 0;
    let maxC = 0;
    for (const [r, c] of cells) {
      if (r > maxR) maxR = r;
      if (c > maxC) maxC = c;
    }
    return {
      cells,
      rows: maxR + 1,
      cols: maxC + 1,
      color,
      fishIndex,
      tunaIndex,
      giftIndex,
      rocketIndex,
      rocketAxis,
      rainbowIndex,
      iceIndex,
      kind: "normal"
    };
  }

  function rotateCellsClockwise(cells) {
    let maxR = 0;
    for (const [r] of cells) {
      if (r > maxR) maxR = r;
    }
    const rotated = cells.map(([r, c]) => [c, maxR - r]);
    let minR = Infinity;
    let minC = Infinity;
    for (const [r, c] of rotated) {
      if (r < minR) minR = r;
      if (c < minC) minC = c;
    }
    const norm = rotated.map(([r, c]) => [r - minR, c - minC]);
    let rows = 0;
    let cols = 0;
    for (const [r, c] of norm) {
      if (r + 1 > rows) rows = r + 1;
      if (c + 1 > cols) cols = c + 1;
    }
    return { cells: norm, rows, cols };
  }

  class PuzzleEngine {
    constructor(boardCanvas, fxCanvas, slotCanvases, callbacks) {
      this.boardCanvas = boardCanvas;
      this.bCtx = boardCanvas.getContext("2d");
      this.fxCanvas = fxCanvas;
      this.fxCtx = fxCanvas.getContext("2d");
      this.slotCanvases = slotCanvases;
      this.cb = callbacks;

      this.grid = createEmptyGrid();
      this.tray = [null, null, null];
      this.holdPiece = null;
      this.holdSlotCanvas = null;
      this.swappedHoldThisTurn = false;
      this.score = 0;
      this.combo = 0;
      this.comboGraceLeft = 0;
      this.rotateCharges = 3;
      this.linesForRotate = 0;
      this.nextMilestone = 1500;
      this.tileSkin = "classic";
      this.colorblindMode = false;
      this.dragOffsetMode = "normal";
      this.zenMode = false;
      this.runFishEarned = 0;
      this.runLinesCleared = 0;
      this.eventFishMult = 1;
      this.eventRocketMult = 1;
      this.startRotateBonus = 0;

      // Modes & challenges
      this.mode = "classic"; // classic | daily | adventure | challenge
      this.rng = Math.random;
      this.dailyMovesLeft = 0;
      this.dailyFishGoal = 5;
      this.dailyFishCollected = 0;
      this.dailyDateKey = "";
      this.dailyFinished = false;

      this.adventureLevel = null;
      this.adventureMovesLeft = 0;
      this.adventureProgress = 0;
      this.adventureFinished = false;

      this.challengeSeed = "";
      this.challengeTarget = 0;
      this.challengerName = "";
      this.challengeBeaten = false;

      // Drag & Undo state
      this.drag = null;
      this.undoSnapshot = null;
      this.lastPreviewKey = "";

      // FX state
      this.particles = [];
      this.floatingTexts = [];
      this.clearingWaves = []; // { type: "row"|"col", index, life }
      this.flyingFish = [];    // { sx, sy, cx, cy, tx, ty, t }
      this.popStaggers = [];   // { px, py, color, delay }
      this.bowlTarget = { x: 260, y: 110 };
      this.cellBounces = {};
      this.shakeTimer = 0;
      this.fxEnabled = true;
      this.scoreMultiplier = 1.0;
      this.feverMode = false;

      // Offscreen static board cache, Toy Hammer, Smart Hint & keyboard cursor
      this.bgCacheCanvas = null;
      this.hammerCharges = 1;
      this.hammerMode = false;
      this.hammerHoverCell = null;
      this.hintCharges = 1;
      this.hintTarget = null;
      this.blitzTimeLeft = 0;
      this.blitzFinished = false;
      this.blitzLastReportedSec = -1;
      this.currentRunSeed = "";
      this.runMaxCombo = 0;
      this.runSpecialPops = 0;
      this.kbCursor = { active: false, slotIndex: 0, row: 3, col: 3 };

      this._resizeAll();
      window.addEventListener("resize", () => this._resizeAll());
      this._bindKeyboard();
      this._bindBoardPointer();
    }

    setHoldSlotCanvas(canvasEl) {
      this.holdSlotCanvas = canvasEl || null;
      this.renderHoldSlot();
    }

    setTileSkin(skin) {
      this.tileSkin = skin || "classic";
      this.renderTray();
    }

    setColorblindMode(enabled) {
      this.colorblindMode = Boolean(enabled);
      this.renderTray();
      this.renderHoldSlot();
    }

    setDragOffset(mode) {
      this.dragOffsetMode = mode === "low" || mode === "high" ? mode : "normal";
    }

    setZenMode(enabled) {
      this.zenMode = Boolean(enabled);
    }

    setEventModifiers({ fishMult = 1, rocketMult = 1, startRotateBonus = 0 } = {}) {
      this.eventFishMult = Math.max(1, Number(fishMult) || 1);
      this.eventRocketMult = Math.max(1, Number(rocketMult) || 1);
      this.startRotateBonus = Math.max(0, Number(startRotateBonus) || 0);
    }

    addRotateCharges(count = 1) {
      this.rotateCharges = Math.min(99, Math.max(0, (this.rotateCharges || 0) + count));
    }

    rotateTrayPieces() {
      if (this.rotateCharges <= 0) return false;
      let changed = false;
      const rotateOne = (p) => {
        if (!p || p.kind === "bomb" || (p.rows === 1 && p.cols === 1)) return p;
        const rot = rotateCellsClockwise(p.cells);
        changed = true;
        return { ...p, cells: rot.cells, rows: rot.rows, cols: rot.cols };
      };
      this.tray = this.tray.map(rotateOne);
      if (this.holdPiece) this.holdPiece = rotateOne(this.holdPiece);
      if (!changed) return false;
      this.rotateCharges -= 1;
      this.renderTray();
      return true;
    }

    setScoreMultiplier(mult) {
      const m = Number(mult);
      this.scoreMultiplier = Number.isFinite(m) ? Math.max(0.25, Math.min(3.5, m)) : 1.0;
    }

    setFeverMode(on) {
      this.feverMode = !!on;
    }

    _resizeAll() {
      const wrapper = this.boardCanvas.parentElement;
      const availW = Math.max(200, wrapper.clientWidth);
      const availH = Math.max(200, wrapper.clientHeight);
      const boardPx = Math.floor(Math.min(availW, availH) - 4);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.boardPx = boardPx;
      this.cellPx = boardPx / GRID_SIZE;

      this.boardCanvas.style.width = `${boardPx}px`;
      this.boardCanvas.style.height = `${boardPx}px`;
      this.boardCanvas.width = Math.round(boardPx * dpr);
      this.boardCanvas.height = Math.round(boardPx * dpr);
      this.bCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // FX Canvas covers the whole phone shell
      const shell = this.fxCanvas.parentElement;
      this.fxW = shell.clientWidth;
      this.fxH = shell.clientHeight;
      this.fxCanvas.width = Math.round(this.fxW * dpr);
      this.fxCanvas.height = Math.round(this.fxH * dpr);
      this.fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      this._rebuildBoardCache(dpr);
      this.renderTray();
    }

    _rebuildBoardCache(dprOverride) {
      if (typeof document === "undefined" || !this.boardPx) return;
      const dpr = dprOverride || Math.min(window.devicePixelRatio || 1, 2);
      const size = this.boardPx;
      const cs = this.cellPx;
      if (!this.bgCacheCanvas) {
        this.bgCacheCanvas = document.createElement("canvas");
      }
      this.bgCacheCanvas.width = Math.max(1, Math.round(size * dpr));
      this.bgCacheCanvas.height = Math.max(1, Math.round(size * dpr));
      const cctx = this.bgCacheCanvas.getContext("2d");
      if (!cctx) return;
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cctx.clearRect(0, 0, size, size);

      const bgGrad = cctx.createLinearGradient(0, 0, size, size);
      bgGrad.addColorStop(0, "#433558");
      bgGrad.addColorStop(0.55, "#372b4a");
      bgGrad.addColorStop(1, "#2c213c");
      cctx.fillStyle = bgGrad;
      this._roundRect(cctx, 0, 0, size, size, 16);
      cctx.fill();
      cctx.strokeStyle = "rgba(255, 240, 224, 0.16)";
      cctx.lineWidth = 1.5;
      this._roundRect(cctx, 1, 1, size - 2, size - 2, 15.5);
      cctx.stroke();

      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const x = c * cs;
          const y = r * cs;
          const pad = 2.8;
          const slotSz = cs - pad * 2;
          const isAlt = ((r + c) & 1) === 1;

          cctx.fillStyle = isAlt ? "#261c36" : "#2b203c";
          this._roundRect(cctx, x + pad, y + pad, slotSz, slotSz, 7.5);
          cctx.fill();
          const cellGrad = cctx.createLinearGradient(x, y + pad, x, y + pad + slotSz);
          cellGrad.addColorStop(0, isAlt ? "#423456" : "#493a5e");
          cellGrad.addColorStop(1, isAlt ? "#4d3e62" : "#55456c");
          cctx.fillStyle = cellGrad;
          this._roundRect(cctx, x + pad + 0.5, y + pad + 2, slotSz - 1, slotSz - 2.6, 6.8);
          cctx.fill();
          cctx.strokeStyle = "rgba(255, 255, 255, 0.055)";
          cctx.lineWidth = 0.9;
          cctx.beginPath();
          cctx.moveTo(x + pad + 4, y + pad + slotSz - 1.2);
          cctx.lineTo(x + pad + slotSz - 4, y + pad + slotSz - 1.2);
          cctx.stroke();
        }
      }
    }

    _bindKeyboard() {
      if (typeof document === "undefined" || !document.addEventListener) return;
      document.addEventListener("keydown", (e) => {
        if (!this.boardCanvas || !this.boardCanvas.isConnected) return;
        const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        if (document.querySelector(".modal-backdrop:not(.hidden)")) return;

        const key = e.key;
        if (key === "1" || key === "2" || key === "3") {
          const idx = Number(key) - 1;
          if (this.tray[idx]) {
            this.kbCursor.slotIndex = idx;
            this.kbCursor.active = true;
            this.kbCursor.row = Math.min(this.kbCursor.row, GRID_SIZE - this.tray[idx].rows);
            this.kbCursor.col = Math.min(this.kbCursor.col, GRID_SIZE - this.tray[idx].cols);
            if (this.cb.onSnap) this.cb.onSnap();
          }
          return;
        }
        if (key === "Escape") {
          this.kbCursor.active = false;
          return;
        }
        if (key === "r" || key === "R") {
          if (this.cb.onKeyboardRotate) {
            this.cb.onKeyboardRotate();
          } else {
            this.rotateTrayPieces();
          }
          return;
        }
        if (key === "h" || key === "H") {
          const idx = this.kbCursor.active ? this.kbCursor.slotIndex : this.tray.findIndex((p) => p !== null);
          if (idx >= 0) this.swapHoldSlot(idx);
          return;
        }
        if (key === "t" || key === "T") {
          if (this.cb && this.cb.onKeyboardHint) {
            this.cb.onKeyboardHint();
          } else {
            this.triggerHint();
          }
          return;
        }

        let dr = 0;
        let dc = 0;
        if (key === "ArrowUp" || key === "w" || key === "W") dr = -1;
        else if (key === "ArrowDown" || key === "s" || key === "S") dr = 1;
        else if (key === "ArrowLeft" || key === "a" || key === "A") dc = -1;
        else if (key === "ArrowRight" || key === "d" || key === "D") dc = 1;
        else if (key === " " || key === "Enter") {
          if (!this.kbCursor.active) return;
          e.preventDefault();
          const idx = this.kbCursor.slotIndex;
          const piece = this.tray[idx];
          if (!piece) return;
          if (this.placeSlotAt(idx, this.kbCursor.row, this.kbCursor.col) === "placed") {
            const nextIdx = this.tray.findIndex((p) => p !== null);
            if (nextIdx >= 0) {
              this.kbCursor.slotIndex = nextIdx;
            } else {
              this.kbCursor.active = false;
            }
          }
          return;
        } else {
          return;
        }

        e.preventDefault();
        if (!this.tray[this.kbCursor.slotIndex]) {
          const fallback = this.tray.findIndex((p) => p !== null);
          if (fallback < 0) return;
          this.kbCursor.slotIndex = fallback;
        }
        this.kbCursor.active = true;
        const piece = this.tray[this.kbCursor.slotIndex];
        const maxR = Math.max(0, GRID_SIZE - piece.rows);
        const maxC = Math.max(0, GRID_SIZE - piece.cols);
        this.kbCursor.row = Math.max(0, Math.min(maxR, this.kbCursor.row + dr));
        this.kbCursor.col = Math.max(0, Math.min(maxC, this.kbCursor.col + dc));
      });
    }

    _bindBoardPointer() {
      if (!this.boardCanvas || typeof this.boardCanvas.addEventListener !== "function") return;
      const cellFromEvent = (e) => {
        const rect = this.boardCanvas.getBoundingClientRect();
        return {
          col: Math.floor((e.clientX - rect.left) / this.cellPx),
          row: Math.floor((e.clientY - rect.top) / this.cellPx)
        };
      };
      this.boardCanvas.addEventListener("pointermove", (e) => {
        if (!this.hammerMode) return;
        const { row, col } = cellFromEvent(e);
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
          this.hammerHoverCell = { row, col };
        } else {
          this.hammerHoverCell = null;
        }
      });
      this.boardCanvas.addEventListener("pointerleave", () => {
        this.hammerHoverCell = null;
      });
      this.boardCanvas.addEventListener("pointerdown", (e) => {
        if (!this.hammerMode) return;
        const { row, col } = cellFromEvent(e);
        if (this.useHammerAt(row, col)) {
          e.preventDefault();
        }
      });
    }

    setHammerMode(on) {
      this.hammerMode = Boolean(on) && (this.hammerCharges || 0) > 0;
      if (!this.hammerMode) this.hammerHoverCell = null;
      if (this.boardCanvas && this.boardCanvas.style) {
        this.boardCanvas.style.cursor = this.hammerMode ? "crosshair" : "";
      }
      return this.hammerMode;
    }

    addHammerCharges(count = 1) {
      this.hammerCharges = Math.min(99, Math.max(0, (this.hammerCharges || 0) + count));
    }

    useHammerAt(row, col) {
      if (!this.hammerMode || (this.hammerCharges || 0) <= 0) return false;
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return false;
      const cell = this.grid[row][col];
      if (!cell) return false;

      if (this.mode === "classic" || this.mode === "challenge") {
        this.undoSnapshot = {
          grid: this._cloneGrid(this.grid),
          tray: this._cloneTray(this.tray),
          holdPiece: this._clonePiece(this.holdPiece),
          swappedHoldThisTurn: this.swappedHoldThisTurn,
          score: this.score,
          combo: this.combo,
          comboGraceLeft: this.comboGraceLeft
        };
      }

      const rect = this.boardCanvas.getBoundingClientRect();
      const shellRect = this.fxCanvas.getBoundingClientRect();
      const px = (rect.left - shellRect.left) + (col + 0.5) * this.cellPx;
      const py = (rect.top - shellRect.top) + (row + 0.5) * this.cellPx;
      let fishEarned = 0;

      if (cell.ice) {
        cell.ice = false;
        if (this.fxEnabled) {
          this.cellBounces[`${row},${col}`] = 1.0;
          this._spawnBlockBurst(px, py, "#bceeff");
        }
        if (this.cb && this.cb.onIceCrack) this.cb.onIceCrack();
      } else if (cell.crate) {
        cell.crate = false;
        if (this.fxEnabled) {
          this.cellBounces[`${row},${col}`] = 1.0;
          this._spawnBlockBurst(px, py, "#d97706");
        }
        if (this.cb && this.cb.onCrateCrack) this.cb.onCrateCrack();
      } else {
        if (cell.fish) {
          fishEarned += 1;
          this._spawnFlyingFish(px, py);
          if (this.cb && this.cb.onFishCollected) this.cb.onFishCollected(px, py, 1);
        } else if (cell.tuna) {
          fishEarned += 2;
          this._spawnFlyingFish(px, py);
          if (this.cb && this.cb.onFishCollected) this.cb.onFishCollected(px, py, 2);
        }
        if (this.fxEnabled) this._spawnBlockBurst(px, py, (cell.color && cell.color.fill) || "#ff9f43");
        this.grid[row][col] = null;
      }

      this.hammerCharges = Math.max(0, (this.hammerCharges || 0) - 1);
      this.setHammerMode(false);
      const pts = Math.round(45 * (this.scoreMultiplier || 1));
      this.score += pts;
      this.runFishEarned = (this.runFishEarned || 0) + fishEarned;
      if (this.fxEnabled) {
        this.shakeTimer = 0.14;
        this.floatingTexts.push({
          text: `🔨 +${pts}`,
          color: "#ffd166",
          scale: 1.08,
          x: px,
          y: py,
          life: 0.9,
          maxLife: 0.9
        });
      }
      this.runSpecialPops = (this.runSpecialPops || 0) + 1;
      if (this.cb && this.cb.onHammerSmash) this.cb.onHammerSmash();
      if (this.cb && this.cb.onBoardUpdated) {
        this.cb.onBoardUpdated({ linesCleared: 0, fishEarned, combo: this.combo, points: pts, hammered: true });
      }
      return true;
    }

    addHintCharges(count = 1) {
      this.hintCharges = Math.min(99, Math.max(0, (this.hintCharges || 0) + count));
    }

    findBestMoveHint() {
      let best = null;
      const candidates = [];
      for (let slotIdx = 0; slotIdx < this.tray.length; slotIdx++) {
        if (this.tray[slotIdx]) candidates.push({ slotIndex: slotIdx, piece: this.tray[slotIdx] });
      }
      for (const { slotIndex, piece } of candidates) {
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (!this.canPlace(piece, r, c)) continue;
            let evalScore = piece.cells.length * 12;
            if (piece.kind === "bomb") {
              let hits = 0;
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  const rr = r + dr;
                  const cc = c + dc;
                  if (rr < 0 || rr >= GRID_SIZE || cc < 0 || cc >= GRID_SIZE) continue;
                  const cell = this.grid[rr][cc];
                  if (cell) hits += (cell.ice || cell.crate ? 140 : 95) + (cell.fish || cell.tuna ? 75 : 0);
                }
              }
              evalScore += hits;
            } else {
              const preview = this._estimateClearPreview(piece, r, c);
              const linesCount = preview.fullRows.length + preview.fullCols.length;
              evalScore += linesCount * 1200 + preview.previewFish * 90 + preview.previewPts;
              // Neighbor contact bonus encourages compact clusters when no line clear exists
              let touch = 0;
              for (const [dr, dc] of piece.cells) {
                const rr = r + dr;
                const cc = c + dc;
                const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                for (const [ar, ac] of dirs) {
                  const nr = rr + ar;
                  const nc = cc + ac;
                  if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE || this.grid[nr][nc]) touch++;
                }
              }
              evalScore += touch * 8;
            }
            if (!best || evalScore > best.evalScore) {
              best = {
                slotIndex,
                row: r,
                col: c,
                piece,
                evalScore,
                cells: piece.cells.map(([dr, dc]) => [r + dr, c + dc])
              };
            }
          }
        }
      }
      return best;
    }

    triggerHint() {
      if ((this.hintCharges || 0) <= 0) return null;
      const best = this.findBestMoveHint();
      if (!best) return null;
      this.hintCharges = Math.max(0, (this.hintCharges || 0) - 1);
      this.hintTarget = {
        ...best,
        expiresAt: performance.now() + 4500
      };
      this.kbCursor.slotIndex = best.slotIndex;
      this.kbCursor.row = best.row;
      this.kbCursor.col = best.col;
      return best;
    }

    getRunStats() {
      return {
        score: this.score || 0,
        linesCleared: this.runLinesCleared || 0,
        maxCombo: Math.max(this.runMaxCombo || 0, this.combo || 0),
        specialPops: this.runSpecialPops || 0,
        fishEarned: this.runFishEarned || 0
      };
    }

    setFxEnabled(enabled) {
      this.fxEnabled = !!enabled;
      if (!this.fxEnabled) {
        this.particles = [];
        this.floatingTexts = [];
        this.clearingWaves = [];
        this.flyingFish = [];
      }
    }

    setBowlTarget(fxX, fxY) {
      this.bowlTarget = { x: fxX, y: fxY };
    }

    newGame(seedOverride = "") {
      this.mode = "classic";
      this.currentRunSeed = seedOverride ? String(seedOverride) : `m${Math.random().toString(36).slice(2, 8)}`;
      this.rng = seedOverride ? createSeededRng(`mochi-classic-${this.currentRunSeed}`) : createSeededRng(`mochi-classic-${this.currentRunSeed}`);
      this.dailyMovesLeft = 0;
      this.dailyFishCollected = 0;
      this.dailyFinished = false;
      this.adventureLevel = null;
      this.adventureMovesLeft = 0;
      this.adventureProgress = 0;
      this.adventureFinished = false;
      this.challengeSeed = "";
      this.challengeTarget = 0;
      this.challengerName = "";
      this.challengeBeaten = false;
      this.blitzTimeLeft = 0;
      this.blitzFinished = false;
      this.blitzLastReportedSec = -1;
      this.hammerMode = false;
      this.hammerHoverCell = null;
      this.hammerCharges = Math.max(1, this.hammerCharges || 1);
      this.hintTarget = null;
      this.hintCharges = Math.max(1, this.hintCharges || 1);
      this.grid = createEmptyGrid();
      this.holdPiece = null;
      this.swappedHoldThisTurn = false;
      this.score = 0;
      this.combo = 0;
      this.comboGraceLeft = 0;
      this.rotateCharges = 3 + (this.startRotateBonus || 0);
      this.linesForRotate = 0;
      this.nextMilestone = 1500;
      this.runFishEarned = 0;
      this.runLinesCleared = 0;
      this.runMaxCombo = 0;
      this.runSpecialPops = 0;
      this.undoSnapshot = null;
      this.particles = [];
      this.floatingTexts = [];
      this.clearingWaves = [];
      this.flyingFish = [];
      this.popStaggers = [];
      this.dealTray();
    }

    startBlitzMode() {
      this.newGame();
      this.mode = "blitz";
      this.rng = Math.random;
      this.blitzTimeLeft = 90;
      this.blitzFinished = false;
      this.blitzLastReportedSec = 90;
      this.dealTray();
    }

    startAdventureLevel(level) {
      if (!level) return;
      this.newGame();
      this.mode = "adventure";
      this.rng = createSeededRng(`mochi-adv-v1-lv-${level.id}`);
      this.adventureLevel = level;
      this.adventureMovesLeft = level.moves || 15;
      this.adventureProgress = 0;
      this.adventureFinished = false;
      this.rotateCharges = 2;

      const iceSet = new Set((level.iceCells || []).map(([r, c]) => `${r},${c}`));
      const crateSet = new Set((level.crateCells || []).map(([r, c]) => `${r},${c}`));
      const fishSet = new Set((level.fishCells || []).map(([r, c]) => `${r},${c}`));
      for (const [r, c, colorIdx] of (level.preset || [])) {
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
          const key = `${r},${c}`;
          this.grid[r][c] = {
            color: COLORS[colorIdx % COLORS.length],
            fish: fishSet.has(key),
            ice: iceSet.has(key),
            crate: crateSet.has(key)
          };
        }
      }
      this.dealTray();
    }

    startSeededChallenge(seedStr, targetScore = 0, challengerName = "Friend") {
      this.newGame();
      this.mode = "challenge";
      this.challengeSeed = String(seedStr || "mochi");
      this.challengeTarget = Math.max(0, Number(targetScore) || 0);
      this.challengerName = String(challengerName || "Friend").slice(0, 18);
      this.challengeBeaten = false;
      this.rng = createSeededRng(`mochi-chal-${this.challengeSeed}`);
      this.dealTray();
    }

    startDailyChallenge(dateKey) {
      this.mode = "daily";
      this.dailyDateKey = dateKey;
      this.rng = createSeededRng(`mochi-daily-${dateKey}`);
      this.dailyMovesLeft = 12;
      this.dailyFishGoal = 5;
      this.dailyFishCollected = 0;
      this.dailyFinished = false;
      this.adventureLevel = null;
      this.adventureFinished = false;
      this.challengeSeed = "";
      this.challengeTarget = 0;
      this.grid = createEmptyGrid();
      this.holdPiece = null;
      this.swappedHoldThisTurn = false;
      this.score = 0;
      this.combo = 0;
      this.comboGraceLeft = 0;
      this.rotateCharges = 2;
      this.runFishEarned = 0;
      this.runLinesCleared = 0;
      this.undoSnapshot = null;
      this.particles = [];
      this.floatingTexts = [];
      this.clearingWaves = [];
      this.flyingFish = [];
      this.popStaggers = [];

      // Seeded puzzle setup with golden fish ready to clear
      let fishPlaced = 0;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (r >= 2 && r <= 6 && this.rng() < 0.34) {
            const putFish = fishPlaced < 4 && this.rng() < 0.25;
            if (putFish) fishPlaced++;
            this.grid[r][c] = {
              color: COLORS[Math.floor(this.rng() * COLORS.length)],
              fish: putFish,
              ice: false
            };
          }
        }
      }
      if (fishPlaced < 2) {
        this.grid[4][3] = { color: COLORS[2], fish: true, ice: false };
        this.grid[4][4] = { color: COLORS[0], fish: true, ice: false };
      }
      this.dealTray();
    }

    canUndo() {
      return (this.mode === "classic" || this.mode === "challenge") && !!this.undoSnapshot;
    }

    undoLastMove() {
      if (!this.canUndo()) return false;
      const snap = this.undoSnapshot;
      this.grid = snap.grid;
      this.tray = snap.tray;
      this.holdPiece = snap.holdPiece || null;
      this.swappedHoldThisTurn = Boolean(snap.swappedHoldThisTurn);
      this.score = snap.score;
      this.combo = snap.combo;
      this.comboGraceLeft = snap.comboGraceLeft || 0;
      this.undoSnapshot = null;
      this.renderTray();
      this.cb.onBoardUpdated({ linesCleared: 0, fishEarned: 0, combo: this.combo, undone: true });
      return true;
    }

    _cloneGrid(g) {
      return g.map((row) => row.map((c) => (c ? { ...c, color: { ...c.color } } : null)));
    }

    _clonePiece(p) {
      return p ? { ...p, cells: p.cells.map((rc) => [...rc]), color: { ...p.color } } : null;
    }

    _cloneTray(t) {
      return t.map((p) => this._clonePiece(p));
    }

    loadState(state) {
      this.mode = "classic";
      this.rng = Math.random;
      this.undoSnapshot = null;
      if (state && Array.isArray(state.grid) && state.grid.length === GRID_SIZE) {
        this.grid = state.grid;
        this.tray = state.tray || [null, null, null];
        this.holdPiece = state.holdPiece || null;
        this.swappedHoldThisTurn = Boolean(state.swappedHoldThisTurn);
        this.score = state.score || 0;
        this.combo = state.combo || 0;
        this.comboGraceLeft = state.comboGraceLeft || 0;
        this.rotateCharges = Number.isFinite(state.rotateCharges) ? state.rotateCharges : 3;
        this.hammerCharges = Number.isFinite(state.hammerCharges) ? state.hammerCharges : 1;
        this.hintCharges = Number.isFinite(state.hintCharges) ? state.hintCharges : 1;
        this.hintTarget = null;
        this.currentRunSeed = state.currentRunSeed || this.currentRunSeed || `m${Math.random().toString(36).slice(2, 8)}`;
        this.linesForRotate = state.linesForRotate || 0;
        this.nextMilestone = state.nextMilestone || (Math.floor(this.score / 1500) + 1) * 1500;
        this.runFishEarned = state.runFishEarned || 0;
        this.runLinesCleared = state.runLinesCleared || 0;
        this.runMaxCombo = state.runMaxCombo || 0;
        this.runSpecialPops = state.runSpecialPops || 0;
        if (this.tray.every((p) => !p)) {
          this.dealTray();
        } else {
          this.renderTray();
        }
      } else {
        this.newGame();
      }
    }

    exportState() {
      return {
        grid: this.grid,
        tray: this.tray,
        holdPiece: this.holdPiece,
        swappedHoldThisTurn: this.swappedHoldThisTurn,
        score: this.score,
        combo: this.combo,
        comboGraceLeft: this.comboGraceLeft,
        rotateCharges: this.rotateCharges,
        hammerCharges: this.hammerCharges,
        hintCharges: this.hintCharges,
        currentRunSeed: this.currentRunSeed,
        linesForRotate: this.linesForRotate,
        nextMilestone: this.nextMilestone,
        runFishEarned: this.runFishEarned,
        runLinesCleared: this.runLinesCleared,
        runMaxCombo: this.runMaxCombo,
        runSpecialPops: this.runSpecialPops
      };
    }

    dealTray() {
      const advGoalType = (this.mode === "adventure" && this.adventureLevel && this.adventureLevel.goal)
        ? this.adventureLevel.goal.type
        : "";
      const opts = {
        rng: this.rng,
        score: (this.mode === "daily" || this.mode === "adventure") ? 0 : this.score,
        allowSpecial: this.mode === "classic" || this.mode === "challenge",
        feverMode: this.feverMode,
        eventFishMult: advGoalType === "fish" ? Math.max(1.5, this.eventFishMult || 1) : this.eventFishMult,
        eventRocketMult: this.eventRocketMult
      };
      this.tray = [
        makePiece(false, opts),
        makePiece(false, { ...opts, allowSpecial: false }),
        makePiece(false, { ...opts, allowSpecial: false })
      ];
      let tries = 0;
      while (!this.hasAnyValidMove() && tries < 10) {
        this.tray[0] = makePiece(true, { ...opts, allowSpecial: false });
        tries++;
      }
      this.renderTray();
      this._notifySpecialPieces();
    }

    _notifySpecialPieces() {
      if (!this.cb || typeof this.cb.onSpecialSeen !== "function") return;
      for (const p of this.tray) {
        if (!p) continue;
        if (p.kind === "bomb") this.cb.onSpecialSeen("bomb");
        if (p.iceIndex >= 0) this.cb.onSpecialSeen("ice");
        if (p.rocketIndex >= 0) this.cb.onSpecialSeen("rocket");
        if (p.rainbowIndex >= 0) this.cb.onSpecialSeen("rainbow");
        if (p.tunaIndex >= 0) this.cb.onSpecialSeen("tuna");
        if (p.giftIndex >= 0) this.cb.onSpecialSeen("gift");
      }
    }

    refreshTrayWithAd() {
      const opts = { rng: this.rng, score: this.score, allowSpecial: this.mode === "classic", feverMode: this.feverMode };
      this.tray = [makePiece(true, opts), makePiece(false, opts), makePiece(true, opts)];
      if (!this.hasAnyValidMove()) {
        this.tray[0] = { cells: [[0, 0]], rows: 1, cols: 1, color: COLORS[0], fishIndex: 0 };
      }
      this.renderTray();
      this._notifySpecialPieces();
    }

    grantBombPiece() {
      const bomb = {
        cells: [[0, 0]],
        rows: 1,
        cols: 1,
        color: { name: "bomb", fill: "#463a5c", hi: "#6e5c8c", border: "#251d33" },
        fishIndex: -1,
        iceIndex: -1,
        kind: "bomb"
      };
      let slot = this.tray.findIndex((p) => !p);
      if (slot < 0) slot = 0;
      this.tray[slot] = bomb;
      this.renderTray();
      this._notifySpecialPieces();
      return slot;
    }

    clearCenterForRevive() {
      // Clears center 4x4 (rows 2..5, cols 2..5) with particles!
      const rect = this.boardCanvas.getBoundingClientRect();
      const shellRect = this.fxCanvas.getBoundingClientRect();
      const baseX = rect.left - shellRect.left;
      const baseY = rect.top - shellRect.top;

      for (let r = 2; r <= 5; r++) {
        for (let c = 2; c <= 5; c++) {
          if (this.grid[r][c]) {
            this._spawnBlockBurst(
              baseX + (c + 0.5) * this.cellPx,
              baseY + (r + 0.5) * this.cellPx,
              this.grid[r][c].color.fill
            );
            this.grid[r][c] = null;
          }
        }
      }
      if (!this.hasAnyValidMove()) {
        this.dealTray();
      } else {
        this.renderTray();
      }
    }

    fillBoardForLoseTest() {
      // Fill almost everything except 1 isolated cell, and put a 3x3 piece in tray so Game Over triggers
      this.grid = createEmptyGrid();
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if ((r + c) % 3 !== 0 || (r > 1 && c > 1)) {
            this.grid[r][c] = {
              color: COLORS[(r + c) % COLORS.length],
              fish: false
            };
          }
        }
      }
      // Make sure one 3x3 cannot fit anywhere
      this.tray = [
        { cells: SHAPES[SHAPES.length - 1].cells, rows: 3, cols: 3, color: COLORS[0], fishIndex: -1 },
        null,
        null
      ];
      this.renderTray();
      this.cb.onBoardUpdated();
      if (!this.hasAnyValidMove()) {
        this.cb.onGameOver();
      }
    }

    canPlace(piece, startRow, startCol) {
      if (!piece) return false;
      for (const [dr, dc] of piece.cells) {
        const r = startRow + dr;
        const c = startCol + dc;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
        if (piece.kind !== "bomb" && this.grid[r][c] !== null) return false;
      }
      return true;
    }

    hasAnyValidMove() {
      const candidates = [...this.tray, this.holdPiece];
      for (const piece of candidates) {
        if (!piece) continue;
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (this.canPlace(piece, r, c)) return true;
          }
        }
      }
      return false;
    }

    _zenRescueClear() {
      // Cozy Zen fallback: clear the fullest row + column so play continues smoothly
      let bestRow = 0;
      let bestRowCount = -1;
      for (let r = 0; r < GRID_SIZE; r++) {
        const cnt = this.grid[r].filter(Boolean).length;
        if (cnt > bestRowCount) {
          bestRowCount = cnt;
          bestRow = r;
        }
      }
      let bestCol = 0;
      let bestColCount = -1;
      for (let c = 0; c < GRID_SIZE; c++) {
        let cnt = 0;
        for (let r = 0; r < GRID_SIZE; r++) {
          if (this.grid[r][c]) cnt++;
        }
        if (cnt > bestColCount) {
          bestColCount = cnt;
          bestCol = c;
        }
      }
      const rect = this.boardCanvas.getBoundingClientRect();
      const shellRect = this.fxCanvas.getBoundingClientRect();
      const baseX = rect.left - shellRect.left;
      const baseY = rect.top - shellRect.top;
      for (let i = 0; i < GRID_SIZE; i++) {
        const c1 = this.grid[bestRow][i];
        if (c1) {
          this._spawnBlockBurst(baseX + (i + 0.5) * this.cellPx, baseY + (bestRow + 0.5) * this.cellPx, c1.color.fill);
          this.grid[bestRow][i] = null;
        }
        const c2 = this.grid[i][bestCol];
        if (c2) {
          this._spawnBlockBurst(baseX + (bestCol + 0.5) * this.cellPx, baseY + (i + 0.5) * this.cellPx, c2.color.fill);
          this.grid[i][bestCol] = null;
        }
      }
      if (this.fxEnabled) {
        this.clearingWaves.push({ type: "row", index: bestRow, life: 1.0 });
        this.clearingWaves.push({ type: "col", index: bestCol, life: 1.0 });
        this.floatingTexts.push({
          text: "🧘 Mochi made space!",
          x: baseX + this.boardPx * 0.5,
          y: baseY + this.boardPx * 0.45,
          life: 1.35
        });
      }
      if (!this.hasAnyValidMove()) {
        this.clearCenterForRevive();
      } else {
        this.renderTray();
      }
    }

    getBoardFillRatio() {
      let filled = 0;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (this.grid[r][c]) filled++;
        }
      }
      return filled / (GRID_SIZE * GRID_SIZE);
    }

    getLineClearsIfPlaced(piece, startRow, startCol) {
      if (piece.kind === "bomb") return { fullRows: [], fullCols: [] };
      const fullRows = [];
      const fullCols = [];
      const tempCells = new Set();
      for (const [dr, dc] of piece.cells) {
        tempCells.add(`${startRow + dr},${startCol + dc}`);
      }
      for (let r = 0; r < GRID_SIZE; r++) {
        let ok = true;
        for (let c = 0; c < GRID_SIZE; c++) {
          if (!this.grid[r][c] && !tempCells.has(`${r},${c}`)) {
            ok = false;
            break;
          }
        }
        if (ok) fullRows.push(r);
      }
      for (let c = 0; c < GRID_SIZE; c++) {
        let ok = true;
        for (let r = 0; r < GRID_SIZE; r++) {
          if (!this.grid[r][c] && !tempCells.has(`${r},${c}`)) {
            ok = false;
            break;
          }
        }
        if (ok) fullCols.push(c);
      }
      return { fullRows, fullCols };
    }

    startDrag(slotIndex, clientX, clientY, isTouch) {
      const piece = slotIndex === -1 ? this.holdPiece : this.tray[slotIndex];
      if (!piece) return false;

      const offsetTable = {
        low: isTouch ? -38 : -16,
        normal: isTouch ? -64 : -26,
        high: isTouch ? -94 : -38
      };
      this.lastPreviewKey = "";
      this.drag = {
        slotIndex, // -1 means Hold Pocket slot
        piece,
        clientX,
        clientY,
        offsetY: offsetTable[this.dragOffsetMode] || (isTouch ? -64 : -26),
        hoverRow: -1,
        hoverCol: -1,
        valid: false,
        overHold: false,
        clearPreview: { fullRows: [], fullCols: [], previewFish: 0, previewPts: 0 }
      };
      this.updateDrag(clientX, clientY);
      this.renderTray();
      return true;
    }

    _isOverHoldSlot(clientX, clientY) {
      if (!this.holdSlotCanvas) return false;
      const box = this.holdSlotCanvas.parentElement;
      if (!box) return false;
      const r = box.getBoundingClientRect();
      return clientX >= r.left - 8 && clientX <= r.right + 8 && clientY >= r.top - 8 && clientY <= r.bottom + 8;
    }

    _estimateClearPreview(piece, startRow, startCol) {
      const base = this.getLineClearsIfPlaced(piece, startRow, startCol);
      const totalLines = base.fullRows.length + base.fullCols.length;
      if (totalLines === 0) return { ...base, previewFish: 0, previewPts: 0 };

      const rowSet = new Set(base.fullRows);
      const colSet = new Set(base.fullCols);
      let fishCount = 0;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (rowSet.has(r) || colSet.has(c)) {
            const cell = this.grid[r][c];
            if (cell && !cell.ice) {
              if (cell.fish) fishCount += 1;
              if (cell.tuna) fishCount += 2;
            }
          }
        }
      }
      piece.cells.forEach(([dr, dc], idx) => {
        const rr = startRow + dr;
        const cc = startCol + dc;
        if (rowSet.has(rr) || colSet.has(cc)) {
          if (idx === piece.fishIndex) fishCount += 1;
          if (idx === piece.tunaIndex) fishCount += 2;
        }
      });
      const nextCombo = this.combo + 1;
      const estBase = totalLines * 100 * nextCombo + (totalLines > 1 ? totalLines * 50 : 0);
      const estPts = Math.round(estBase * (this.scoreMultiplier || 1));
      return { ...base, previewFish: fishCount, previewPts: estPts };
    }

    updateDrag(clientX, clientY) {
      if (!this.drag) return;
      this.drag.clientX = clientX;
      this.drag.clientY = clientY;
      this.drag.overHold = this.drag.slotIndex !== -1 && !this.swappedHoldThisTurn && this._isOverHoldSlot(clientX, clientY);

      const rect = this.boardCanvas.getBoundingClientRect();
      const piece = this.drag.piece;
      const pieceW = piece.cols * this.cellPx;
      const pieceH = piece.rows * this.cellPx;

      // Center the dragged piece horizontally on pointer, lifted by offsetY
      const topLeftX = clientX - pieceW * 0.5;
      const topLeftY = (clientY + this.drag.offsetY) - pieceH * 0.5;

      const exactCol = (topLeftX - rect.left) / this.cellPx;
      const exactRow = (topLeftY - rect.top) / this.cellPx;
      let col = Math.round(exactCol);
      let row = Math.round(exactRow);
      let valid = !this.drag.overHold && this.canPlace(piece, row, col);

      // Gentle magnetic snap on touch/drag when slightly off an adjacent valid cell
      if (!valid && !this.drag.overHold && exactRow > -1.2 && exactRow < GRID_SIZE && exactCol > -1.2 && exactCol < GRID_SIZE) {
        let bestDist = 0.65;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            if (this.canPlace(piece, nr, nc)) {
              const d = Math.hypot(nr - exactRow, nc - exactCol);
              if (d < bestDist) {
                bestDist = d;
                row = nr;
                col = nc;
                valid = true;
              }
            }
          }
        }
      }

      this.drag.hoverRow = row;
      this.drag.hoverCol = col;
      this.drag.valid = valid;
      this.drag.clearPreview = valid
        ? this._estimateClearPreview(piece, row, col)
        : { fullRows: [], fullCols: [], previewFish: 0, previewPts: 0 };

      const snapKey = valid ? `${row},${col}` : "";
      if (snapKey && snapKey !== this.lastPreviewKey) {
        this.lastPreviewKey = snapKey;
        if (this.cb.onSnap) this.cb.onSnap();
      } else if (!snapKey) {
        this.lastPreviewKey = "";
      }
    }

    swapHoldSlot(slotIndex) {
      if (slotIndex < 0 || this.swappedHoldThisTurn) return false;
      const piece = this.tray[slotIndex];
      if (!piece) return false;
      const prevHold = this.holdPiece;
      this.holdPiece = piece;
      this.tray[slotIndex] = prevHold || null;
      this.swappedHoldThisTurn = true;
      if (this.tray.every((p) => p === null)) {
        this.dealTray();
      } else {
        this.renderTray();
      }
      if (this.cb && this.cb.onSnap) this.cb.onSnap();
      if (this.cb && this.cb.onBoardUpdated) this.cb.onBoardUpdated({ linesCleared: 0, fishEarned: 0, combo: this.combo, held: true });
      return true;
    }

    placeSlotAt(slotIndex, hoverRow, hoverCol) {
      const piece = slotIndex === -1 ? this.holdPiece : this.tray[slotIndex];
      if (!piece || !this.canPlace(piece, hoverRow, hoverCol)) {
        this.renderTray();
        return "invalid";
      }

      // Save Undo snapshot before committing move (Classic mode only)
      if (this.mode === "classic") {
        this.undoSnapshot = {
          grid: this._cloneGrid(this.grid),
          tray: this._cloneTray(this.tray),
          holdPiece: this._clonePiece(this.holdPiece),
          swappedHoldThisTurn: this.swappedHoldThisTurn,
          score: this.score,
          combo: this.combo,
          comboGraceLeft: this.comboGraceLeft
        };
      }

      this.hintTarget = null;
      this.swappedHoldThisTurn = false;
      let cleared;
      if (piece.kind === "bomb") {
        this.runSpecialPops = (this.runSpecialPops || 0) + 1;
        cleared = this._detonateBomb(hoverRow, hoverCol);
      } else {
        // Place piece onto grid with jelly bounce
        piece.cells.forEach(([dr, dc], idx) => {
          const rr = hoverRow + dr;
          const cc = hoverCol + dc;
          this.grid[rr][cc] = {
            color: piece.color,
            fish: idx === piece.fishIndex,
            tuna: idx === piece.tunaIndex,
            gift: idx === piece.giftIndex,
            rocket: idx === piece.rocketIndex ? piece.rocketAxis : null,
            rainbow: idx === piece.rainbowIndex,
            ice: idx === piece.iceIndex
          };
          if (this.fxEnabled) {
            this.cellBounces[`${rr},${cc}`] = 1.0;
          }
        });

        const placePts = Math.round(piece.cells.length * 10 * this.scoreMultiplier);
        this.score += placePts;
        cleared = this._resolveLineClears();
        if (this.fxEnabled && cleared && !cleared.linesCleared && this.boardCanvas && this.fxCanvas) {
          const rect = this.boardCanvas.getBoundingClientRect();
          const shellRect = this.fxCanvas.getBoundingClientRect();
          const cx = (rect.left - shellRect.left) + (hoverCol + piece.cols * 0.5) * this.cellPx;
          const cy = (rect.top - shellRect.top) + (hoverRow + piece.rows * 0.5) * this.cellPx;
          this.floatingTexts.push({
            text: `+${placePts}`,
            color: "#f8fafc",
            scale: 0.78,
            x: Math.max(40, Math.min(this.fxW - 40, cx)),
            y: Math.max(24, cy),
            life: 0.65,
            maxLife: 0.65
          });
        }
      }

      const milestoneReached = this._checkMilestoneWave();
      if (cleared && milestoneReached) {
        cleared.milestoneReached = milestoneReached;
      }
      if (cleared) {
        this.runFishEarned = (this.runFishEarned || 0) + (cleared.fishEarned || 0);
        this.runLinesCleared = (this.runLinesCleared || 0) + (cleared.linesCleared || 0);
        if ((cleared.combo || 0) > (this.runMaxCombo || 0)) {
          this.runMaxCombo = cleared.combo;
        }
      }

      if (slotIndex === -1) {
        this.holdPiece = null;
      } else {
        this.tray[slotIndex] = null;
      }

      if (this.tray.every((p) => p === null)) {
        this.dealTray();
      } else {
        this.renderTray();
      }

      if (this.mode === "daily") {
        this.dailyMovesLeft = Math.max(0, this.dailyMovesLeft - 1);
        this.dailyFishCollected += cleared.fishEarned;
      } else if (this.mode === "adventure" && this.adventureLevel) {
        this.adventureMovesLeft = Math.max(0, this.adventureMovesLeft - 1);
        const goalType = this.adventureLevel.goal ? this.adventureLevel.goal.type : "lines";
        if (goalType === "lines") {
          this.adventureProgress += cleared.linesCleared || 0;
        } else if (goalType === "fish") {
          this.adventureProgress += cleared.fishEarned || 0;
        } else if (goalType === "ice") {
          this.adventureProgress += cleared.iceCracked || 0;
        } else if (goalType === "color") {
          const wantColor = this.adventureLevel.goal.colorName || "strawberry";
          this.adventureProgress += (cleared.colorCounts && cleared.colorCounts[wantColor]) || 0;
        } else if (goalType === "score") {
          this.adventureProgress = this.score;
        }
      } else if (this.mode === "challenge" && !this.challengeBeaten && this.challengeTarget > 0 && this.score > this.challengeTarget) {
        this.challengeBeaten = true;
        if (this.cb.onChallengeBeaten) {
          this.cb.onChallengeBeaten(this.challengerName, this.challengeTarget, this.score);
        }
      }

      if (this.cb && this.cb.onBoardUpdated) this.cb.onBoardUpdated(cleared);
      if (this.cb && this.cb.onCravingProgress) {
        this.cb.onCravingProgress({
          colorName: piece.color.name,
          linesCleared: cleared.linesCleared,
          combo: cleared.combo,
          fishEarned: cleared.fishEarned,
          placedCells: piece.cells.length
        });
      }

      if (this.mode === "daily" && !this.dailyFinished) {
        if (this.dailyFishCollected >= this.dailyFishGoal) {
          this.dailyFinished = true;
          setTimeout(() => this.cb.onDailyComplete && this.cb.onDailyComplete(true), 320);
          return "placed";
        }
        if (this.dailyMovesLeft <= 0) {
          this.dailyFinished = true;
          setTimeout(() => this.cb.onDailyComplete && this.cb.onDailyComplete(false), 320);
          return "placed";
        }
      }

      if (this.mode === "adventure" && !this.adventureFinished && this.adventureLevel) {
        const target = (this.adventureLevel.goal && this.adventureLevel.goal.target) || 1;
        if (this.adventureProgress >= target) {
          this.adventureFinished = true;
          setTimeout(() => this.cb.onAdventureComplete && this.cb.onAdventureComplete(true, this.adventureMovesLeft), 320);
          return "placed";
        }
        if (this.adventureMovesLeft <= 0) {
          this.adventureFinished = true;
          setTimeout(() => this.cb.onAdventureComplete && this.cb.onAdventureComplete(false, 0), 320);
          return "placed";
        }
      }

      if (!this.hasAnyValidMove()) {
        if ((this.zenMode && this.mode === "classic") || (this.mode === "blitz" && !this.blitzFinished)) {
          setTimeout(() => this._zenRescueClear(), 220);
        } else if (this.mode === "adventure" && !this.adventureFinished) {
          this.adventureFinished = true;
          setTimeout(() => this.cb.onAdventureComplete && this.cb.onAdventureComplete(false, 0), 280);
        } else {
          setTimeout(() => {
            if (!this.hasAnyValidMove() && !(this.mode === "daily" && this.dailyFinished) && !(this.mode === "adventure" && this.adventureFinished) && this.mode !== "blitz") {
              this.cb.onGameOver();
            }
          }, 280);
        }
      }
      return "placed";
    }

    endDrag() {
      if (!this.drag) return false;
      const { slotIndex, hoverRow, hoverCol, valid, overHold } = this.drag;
      this.drag = null;
      this.lastPreviewKey = "";

      if (overHold && slotIndex >= 0 && !this.swappedHoldThisTurn) {
        if (this.swapHoldSlot(slotIndex)) return "held";
      }
      if (!valid) {
        this.renderTray();
        return "invalid";
      }
      return this.placeSlotAt(slotIndex, hoverRow, hoverCol);
    }

    _checkMilestoneWave() {
      if (this.mode !== "classic" || this.score < this.nextMilestone) return 0;
      const reached = this.nextMilestone;
      this.nextMilestone += 1500;
      const candidates = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const cell = this.grid[r][c];
          if (cell && !cell.fish && !cell.tuna && !cell.gift && !cell.rocket && !cell.rainbow && !cell.ice) {
            candidates.push([r, c]);
          }
        }
      }
      const rect = this.boardCanvas.getBoundingClientRect();
      const shellRect = this.fxCanvas.getBoundingClientRect();
      const baseX = rect.left - shellRect.left;
      const baseY = rect.top - shellRect.top;

      let blessed = 0;
      while (candidates.length > 0 && blessed < 2) {
        const pickIdx = Math.floor(Math.random() * candidates.length);
        const [r, c] = candidates.splice(pickIdx, 1)[0];
        this.grid[r][c].fish = true;
        blessed++;
        if (this.fxEnabled) {
          this.cellBounces[`${r},${c}`] = 1.0;
          this._spawnBlockBurst(baseX + (c + 0.5) * this.cellPx, baseY + (r + 0.5) * this.cellPx, "#ffd166");
        }
      }
      if (this.fxEnabled) {
        this.floatingTexts.push({
          text: `💎 ${reached} PTS! +${blessed || 1}🐟 wave`,
          x: baseX + this.boardPx * 0.5,
          y: baseY + this.boardPx * 0.25,
          life: 1.4
        });
      }
      return reached;
    }

    _detonateBomb(centerR, centerC) {
      const rect = this.boardCanvas.getBoundingClientRect();
      const shellRect = this.fxCanvas.getBoundingClientRect();
      const baseX = rect.left - shellRect.left;
      const baseY = rect.top - shellRect.top;

      let destroyed = 0;
      let fishEarned = 0;
      let iceCracked = 0;
      const colorCounts = {};
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const r = centerR + dr;
          const c = centerC + dc;
          if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) continue;
          const cell = this.grid[r][c];
          const px = baseX + (c + 0.5) * this.cellPx;
          const py = baseY + (r + 0.5) * this.cellPx;
          if (cell) {
            destroyed++;
            if (cell.color && cell.color.name) {
              colorCounts[cell.color.name] = (colorCounts[cell.color.name] || 0) + 1;
            }
            if (cell.ice || cell.crate) iceCracked++;
            this._spawnBlockBurst(px, py, cell.color.fill);
            if (cell.fish) {
              fishEarned++;
              this._spawnFlyingFish(px, py);
              this.cb.onFishCollected(px, py, 1);
            } else if (cell.tuna) {
              fishEarned += 2;
              this._spawnFlyingFish(px, py);
              this._spawnFlyingFish(px + 8, py - 6);
              this.cb.onFishCollected(px, py, 2);
            }
            this.grid[r][c] = null;
          } else {
            this._spawnBlockBurst(px, py, "#ffd166");
          }
        }
      }

      const mult = this.scoreMultiplier || 1;
      const points = Math.round((80 + destroyed * 25) * mult);
      this.score += points;
      if (this.fxEnabled) {
        this.shakeTimer = 0.28;
        const multTag = mult !== 1 ? ` ×${mult}` : "";
        this.floatingTexts.push({
          text: `💣 +${points}${multTag}`,
          color: "#ff9f43",
          scale: 1.15,
          x: baseX + (centerC + 0.5) * this.cellPx,
          y: baseY + (centerR + 0.5) * this.cellPx,
          life: 1.1,
          maxLife: 1.1
        });
      }
      if (this.cb.onBombBlast) this.cb.onBombBlast();
      return { linesCleared: destroyed > 0 ? 1 : 0, fishEarned, iceCracked, colorCounts, combo: this.combo, points, bomb: true };
    }

    _resolveLineClears() {
      const fullRows = [];
      const fullCols = [];

      for (let r = 0; r < GRID_SIZE; r++) {
        if (this.grid[r].every((cell) => cell !== null)) fullRows.push(r);
      }
      for (let c = 0; c < GRID_SIZE; c++) {
        let ok = true;
        for (let r = 0; r < GRID_SIZE; r++) {
          if (this.grid[r][c] === null) {
            ok = false;
            break;
          }
        }
        if (ok) fullCols.push(c);
      }

      const baseLinesCleared = fullRows.length + fullCols.length;
      if (baseLinesCleared === 0) {
        if (this.combo > 0 && this.comboGraceLeft > 0) {
          this.comboGraceLeft = 0;
        } else {
          this.combo = 0;
          this.comboGraceLeft = 0;
        }
        return { linesCleared: 0, fishEarned: 0, colorCounts: {}, combo: this.combo, points: 0 };
      }

      this.combo += 1;
      this.comboGraceLeft = 1; // 1-turn grace period before combo resets!

      // Check Color Harmony (>= 6 matching color blocks in any cleared row/col)
      let colorHarmony = false;
      const checkHarmony = (cellsList) => {
        const counts = {};
        for (const c of cellsList) {
          if (!c || !c.color) continue;
          const k = c.color.name;
          counts[k] = (counts[k] || 0) + 1;
          if (counts[k] >= 6) return true;
        }
        return false;
      };
      for (const r of fullRows) {
        if (checkHarmony(this.grid[r])) colorHarmony = true;
      }
      for (const c of fullCols) {
        const colCells = [];
        for (let r = 0; r < GRID_SIZE; r++) colCells.push(this.grid[r][c]);
        if (checkHarmony(colCells)) colorHarmony = true;
      }

      const toClear = new Set();
      for (const r of fullRows) {
        if (this.fxEnabled) this.clearingWaves.push({ type: "row", index: r, life: 1.0 });
        for (let c = 0; c < GRID_SIZE; c++) toClear.add(`${r},${c}`);
      }
      for (const c of fullCols) {
        if (this.fxEnabled) this.clearingWaves.push({ type: "col", index: c, life: 1.0 });
        for (let r = 0; r < GRID_SIZE; r++) toClear.add(`${r},${c}`);
      }

      // Chain triggers: Yarn Rocket (clears orthogonal line) & Rainbow (clears all matching color)
      let chainTriggered = 0;
      const rocketExtras = [];
      const rainbowColors = new Set();
      for (const key of toClear) {
        const [r, c] = key.split(",").map(Number);
        const cell = this.grid[r][c];
        if (!cell) continue;
        if (cell.rocket === "row") {
          rocketExtras.push({ type: "col", index: c });
        } else if (cell.rocket === "col") {
          rocketExtras.push({ type: "row", index: r });
        }
        if (cell.rainbow && cell.color) {
          rainbowColors.add(cell.color.name);
        }
      }
      for (const rx of rocketExtras) {
        chainTriggered++;
        if (rx.type === "row") {
          if (this.fxEnabled) this.clearingWaves.push({ type: "row", index: rx.index, life: 1.15 });
          for (let c = 0; c < GRID_SIZE; c++) toClear.add(`${rx.index},${c}`);
        } else {
          if (this.fxEnabled) this.clearingWaves.push({ type: "col", index: rx.index, life: 1.15 });
          for (let r = 0; r < GRID_SIZE; r++) toClear.add(`${r},${rx.index}`);
        }
      }
      if (rainbowColors.size > 0) {
        chainTriggered++;
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            const cell = this.grid[r][c];
            if (cell && cell.color && rainbowColors.has(cell.color.name)) {
              toClear.add(`${r},${c}`);
            }
          }
        }
      }

      const rect = this.boardCanvas.getBoundingClientRect();
      const shellRect = this.fxCanvas.getBoundingClientRect();
      const baseX = rect.left - shellRect.left;
      const baseY = rect.top - shellRect.top;

      let fishEarned = 0;
      let iceCracked = 0;
      let pureIceCracked = 0;
      let crateCracked = 0;
      const colorCounts = {};
      let bonusPoints = 0;
      let bonusRotates = 0;
      let giftsCleared = 0;
      let giftNote = "";
      let sumX = 0;
      let sumY = 0;
      let stepIdx = 0;

      const sortedKeys = Array.from(toClear).sort();
      for (const key of sortedKeys) {
        const [r, c] = key.split(",").map(Number);
        const cell = this.grid[r][c];
        const px = baseX + (c + 0.5) * this.cellPx;
        const py = baseY + (r + 0.5) * this.cellPx;
        sumX += px;
        sumY += py;

        if (cell) {
          if (cell.ice) {
            // 2-hit ice block cracks on first line clear!
            cell.ice = false;
            iceCracked++;
            pureIceCracked++;
            this._spawnBlockBurst(px, py, "#bceeff");
            if (this.fxEnabled) this.cellBounces[`${r},${c}`] = 1.0;
            continue;
          }
          if (cell.crate) {
            // 2-hit wooden berry crate cracks on first line clear!
            cell.crate = false;
            iceCracked++;
            crateCracked++;
            this._spawnBlockBurst(px, py, "#d97706");
            if (this.fxEnabled) this.cellBounces[`${r},${c}`] = 1.0;
            continue;
          }
          if (cell.color && cell.color.name) {
            colorCounts[cell.color.name] = (colorCounts[cell.color.name] || 0) + 1;
          }
          // 15ms cascade pop wave
          if (this.fxEnabled) {
            const delaySec = Math.min(0.24, stepIdx * 0.015);
            if (delaySec <= 0.001) {
              this._spawnBlockBurst(px, py, cell.color.fill);
            } else {
              this.popStaggers.push({ px, py, color: cell.color.fill, delay: delaySec });
            }
            stepIdx++;
          }
          if (cell.fish) {
            fishEarned += 1;
            this._spawnFlyingFish(px, py);
            this.cb.onFishCollected(px, py, 1);
          } else if (cell.tuna) {
            fishEarned += 2;
            this._spawnFlyingFish(px, py);
            this._spawnFlyingFish(px + 9, py - 6);
            this.cb.onFishCollected(px, py, 2);
          }
          if (cell.gift) {
            giftsCleared += 1;
            const roll = Math.random();
            if (roll < 0.42) {
              fishEarned += 2;
              this._spawnFlyingFish(px, py);
              this._spawnFlyingFish(px - 8, py - 5);
              this.cb.onFishCollected(px, py, 2);
              giftNote = "🎁+2🐟";
            } else if (roll < 0.72) {
              bonusPoints += 300;
              giftNote = "🎁+300";
            } else {
              bonusRotates += 1;
              giftNote = "🎁+1↻";
            }
          }
        }
        this.grid[r][c] = null;
      }

      if (bonusRotates > 0) this.addRotateCharges(bonusRotates);
      this.linesForRotate = (this.linesForRotate || 0) + baseLinesCleared;
      while (this.linesForRotate >= 5) {
        this.linesForRotate -= 5;
        this.addRotateCharges(1);
      }

      if (pureIceCracked > 0 && this.cb && this.cb.onIceCrack) {
        this.cb.onIceCrack();
      }
      if (crateCracked > 0 && this.cb && this.cb.onCrateCrack) {
        this.cb.onCrateCrack();
      }
      this.runSpecialPops = (this.runSpecialPops || 0) + chainTriggered + giftsCleared;

      // Check Perfect Full-Board Clear!
      let perfectBoard = true;
      for (let r = 0; r < GRID_SIZE && perfectBoard; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (this.grid[r][c] !== null) {
            perfectBoard = false;
            break;
          }
        }
      }
      if (perfectBoard) {
        bonusPoints += 1000;
        fishEarned += 3;
        this._spawnFlyingFish(baseX + this.boardPx * 0.5, baseY + this.boardPx * 0.5);
        this.cb.onFishCollected(baseX + this.boardPx * 0.5, baseY + this.boardPx * 0.5, 3);
      }

      const mult = (this.scoreMultiplier || 1) * (colorHarmony ? 1.5 : 1);
      const basePoints = baseLinesCleared * 100 * this.combo + (baseLinesCleared > 1 ? baseLinesCleared * 50 : 0) + bonusPoints + chainTriggered * 120;
      const points = Math.round(basePoints * mult);
      this.score += points;
      let blitzTimeGain = 0;
      if (this.mode === "blitz" && !this.blitzFinished && baseLinesCleared > 0) {
        blitzTimeGain = baseLinesCleared >= 2 || this.combo >= 2 ? 5 : 2;
        this.blitzTimeLeft = Math.min(120, (this.blitzTimeLeft || 0) + blitzTimeGain);
      }

      if (this.fxEnabled) {
        this.shakeTimer = (baseLinesCleared >= 2 || this.combo >= 2 || chainTriggered > 0 || perfectBoard) ? 0.28 : 0.12;
        const avgX = sumX / sortedKeys.length;
        const avgY = sumY / sortedKeys.length;
        const safeX = Math.max(85, Math.min(this.fxW - 85, avgX));
        const tags = [];
        if (perfectBoard) tags.push("✨PERFECT!");
        if (colorHarmony) tags.push("🎨COLOR×1.5");
        if (chainTriggered > 0) tags.push("🚀CHAIN!");
        if (blitzTimeGain > 0) tags.push(`⏱️+${blitzTimeGain}s`);
        if (giftNote) tags.push(giftNote);
        if (this.combo > 1) tags.push(`x${this.combo}!`);
        if ((this.scoreMultiplier || 1) !== 1) tags.push(`×${this.scoreMultiplier}⚡`);
        const lifeMain = perfectBoard ? 1.5 : 1.08;
        this.floatingTexts.push({
          text: tags.length ? `+${points} (${tags.join(" ")})` : `+${points}`,
          color: perfectBoard ? "#ffe066" : (this.combo >= 2 ? "#ff7eb6" : "#ffd166"),
          scale: perfectBoard ? 1.28 : (baseLinesCleared >= 2 || this.combo >= 2 ? 1.14 : 1.0),
          x: safeX,
          y: avgY,
          life: lifeMain,
          maxLife: lifeMain
        });
        if (this.combo >= 2 && !perfectBoard) {
          this.floatingTexts.push({
            text: `🔥 COMBO ×${this.combo}!`,
            color: "#fda4af",
            scale: 1.06,
            x: safeX,
            y: Math.max(36, avgY - 26),
            life: 1.15,
            maxLife: 1.15
          });
        }
        if (iceCracked > 0) {
          this.floatingTexts.push({
            text: `❄️ -${iceCracked} ICE`,
            color: "#7dd3fc",
            scale: 0.96,
            x: safeX,
            y: Math.max(40, avgY - 24),
            life: 0.95,
            maxLife: 0.95
          });
        }
      }

      return {
        linesCleared: baseLinesCleared + chainTriggered,
        fishEarned,
        iceCracked,
        giftsCleared,
        colorCounts,
        combo: this.combo,
        points,
        perfectBoard,
        colorHarmony
      };
    }

    _spawnFlyingFish(sx, sy) {
      if (!this.fxEnabled) {
        if (this.cb.onFishArrivedInBowl) this.cb.onFishArrivedInBowl();
        return;
      }
      const tx = this.bowlTarget.x;
      const ty = this.bowlTarget.y;
      const cx = (sx + tx) * 0.5 - 35;
      const cy = Math.min(sy, ty) - 70;
      this.flyingFish.push({ sx, sy, cx, cy, tx, ty, t: 0 });
    }

    _spawnBlockBurst(x, y, color) {
      if (!this.fxEnabled) return;
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 130;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 30,
          size: 5 + Math.random() * 5,
          color,
          life: 0.7 + Math.random() * 0.25
        });
      }
    }

    update(dt) {
      if (this.mode === "blitz" && !this.blitzFinished) {
        this.blitzTimeLeft = Math.max(0, (this.blitzTimeLeft || 0) - dt);
        const ceilSec = Math.ceil(this.blitzTimeLeft);
        if (ceilSec !== this.blitzLastReportedSec) {
          this.blitzLastReportedSec = ceilSec;
          if (this.cb && this.cb.onBlitzTick) this.cb.onBlitzTick(ceilSec);
        }
        if (this.blitzTimeLeft <= 0) {
          this.blitzFinished = true;
          this.drag = null;
          this.hammerMode = false;
          this.hammerHoverCell = null;
          if (this.cb && this.cb.onBlitzComplete) this.cb.onBlitzComplete(this.score);
        }
      }

      if (this.shakeTimer > 0) {
        this.shakeTimer = Math.max(0, this.shakeTimer - dt);
      }

      for (const key of Object.keys(this.cellBounces)) {
        this.cellBounces[key] -= dt * 4.5;
        if (this.cellBounces[key] <= 0) {
          delete this.cellBounces[key];
        }
      }

      for (let i = this.popStaggers.length - 1; i >= 0; i--) {
        const s = this.popStaggers[i];
        s.delay -= dt;
        if (s.delay <= 0) {
          this._spawnBlockBurst(s.px, s.py, s.color);
          this.popStaggers.splice(i, 1);
        }
      }

      for (let i = this.clearingWaves.length - 1; i >= 0; i--) {
        this.clearingWaves[i].life -= dt * 3.1;
        if (this.clearingWaves[i].life <= 0) {
          this.clearingWaves.splice(i, 1);
        }
      }

      for (let i = this.flyingFish.length - 1; i >= 0; i--) {
        const f = this.flyingFish[i];
        f.t += dt * 1.9;
        if (f.t >= 1) {
          this.flyingFish.splice(i, 1);
          if (this.cb.onFishArrivedInBowl) this.cb.onFishArrivedInBowl();
        }
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 260 * dt;
        p.life -= dt * 1.4;
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const t = this.floatingTexts[i];
        t.y -= 38 * dt;
        t.life -= dt * 1.1;
        if (t.life <= 0) this.floatingTexts.splice(i, 1);
      }
    }

    draw() {
      this._drawBoard();
      this._drawFxOverlay();
    }

    _cellFlagsFromPiece(piece, idx) {
      return {
        ice: idx === piece.iceIndex,
        bomb: piece.kind === "bomb",
        tuna: idx === piece.tunaIndex,
        gift: idx === piece.giftIndex,
        rocket: idx === piece.rocketIndex ? piece.rocketAxis : null,
        rainbow: idx === piece.rainbowIndex
      };
    }

    _cellFlagsFromGridCell(cell) {
      return {
        ice: !!cell.ice,
        crate: !!cell.crate,
        bomb: false,
        tuna: !!cell.tuna,
        gift: !!cell.gift,
        rocket: cell.rocket || null,
        rainbow: !!cell.rainbow
      };
    }

    _drawBoard() {
      const ctx = this.bCtx;
      const size = this.boardPx;
      const cs = this.cellPx;

      ctx.clearRect(0, 0, size, size);

      ctx.save();
      if (this.shakeTimer > 0 && this.fxEnabled) {
        const mag = this.shakeTimer * 18;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }

      if (this.bgCacheCanvas && this.bgCacheCanvas.width > 0) {
        ctx.drawImage(this.bgCacheCanvas, 0, 0, size, size);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, size, size);
        bgGrad.addColorStop(0, "#433558");
        bgGrad.addColorStop(0.55, "#372b4a");
        bgGrad.addColorStop(1, "#2c213c");
        ctx.fillStyle = bgGrad;
        this._roundRect(ctx, 0, 0, size, size, 16);
        ctx.fill();
      }

      const previewClearRows = this.drag ? new Set(this.drag.clearPreview.fullRows) : new Set();
      const previewClearCols = this.drag ? new Set(this.drag.clearPreview.fullCols) : new Set();
      const pulse = 0.65 + 0.35 * Math.sin(performance.now() * 0.014);
      const isBombHover = this.drag && this.drag.valid && this.drag.piece.kind === "bomb";

      // Draw dynamic bomb highlights & placed blocks over cached recessed cells
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const x = c * cs;
          const y = r * cs;
          const pad = 2.8;
          const slotSz = cs - pad * 2;

          if (isBombHover && Math.abs(r - this.drag.hoverRow) <= 1 && Math.abs(c - this.drag.hoverCol) <= 1) {
            ctx.fillStyle = `rgba(255, 196, 80, ${0.24 + 0.2 * pulse})`;
            this._roundRect(ctx, x + pad, y + pad, slotSz, slotSz, 7.5);
            ctx.fill();
          }

          const cell = this.grid[r][c];
          if (cell) {
            const willClear = previewClearRows.has(r) || previewClearCols.has(c);
            const bounceT = this.cellBounces[`${r},${c}`] || 0;
            const flags = this._cellFlagsFromGridCell(cell);
            if (bounceT > 0) {
              const s = 1 + Math.sin(bounceT * Math.PI) * 0.16;
              const cx = x + cs * 0.5;
              const cy = y + cs * 0.5;
              ctx.save();
              ctx.translate(cx, cy);
              ctx.scale(s, s);
              ctx.translate(-cx, -cy);
              this._drawBlock(ctx, x + pad, y + pad, slotSz, cell.color, cell.fish, willClear ? pulse : 0, flags);
              ctx.restore();
            } else {
              this._drawBlock(ctx, x + pad, y + pad, slotSz, cell.color, cell.fish, willClear ? pulse : 0, flags);
            }
            if (this.hammerMode) {
              ctx.save();
              ctx.strokeStyle = `rgba(255, 198, 92, ${0.45 + 0.45 * pulse})`;
              ctx.lineWidth = 2.2;
              this._roundRect(ctx, x + pad, y + pad, slotSz, slotSz, 7.5);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }

      // Soft golden laser glow over full rows/cols ready to clear on drop
      if (this.drag && this.drag.valid && (previewClearRows.size > 0 || previewClearCols.size > 0)) {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 224, 112, ${0.42 + 0.35 * pulse})`;
        ctx.lineWidth = 2.4;
        previewClearRows.forEach((r) => {
          ctx.fillStyle = `rgba(255, 220, 110, ${0.12 + 0.08 * pulse})`;
          this._roundRect(ctx, 2, r * cs + 2, size - 4, cs - 4, 8);
          ctx.fill();
          ctx.stroke();
        });
        previewClearCols.forEach((c) => {
          ctx.fillStyle = `rgba(255, 220, 110, ${0.12 + 0.08 * pulse})`;
          this._roundRect(ctx, c * cs + 2, 2, cs - 4, size - 4, 8);
          ctx.fill();
          ctx.stroke();
        });
        ctx.restore();
      }

      // Ghost placement preview
      if (this.drag && this.drag.valid) {
        const { piece, hoverRow, hoverCol } = this.drag;
        ctx.save();
        ctx.globalAlpha = 0.45;
        piece.cells.forEach(([dr, dc], idx) => {
          const x = (hoverCol + dc) * cs + 3;
          const y = (hoverRow + dr) * cs + 3;
          this._drawBlock(
            ctx,
            x,
            y,
            cs - 6,
            piece.color,
            idx === piece.fishIndex,
            0,
            this._cellFlagsFromPiece(piece, idx)
          );
        });
        ctx.restore();

        // Live Ghost Clear Preview badge when hovering over line clears or Bomb 3x3
        const cp = this.drag.clearPreview;
        const totalLines = (cp.fullRows.length || 0) + (cp.fullCols.length || 0);
        if (totalLines > 0 || isBombHover) {
          let badgeText;
          if (isBombHover) {
            let bCount = 0;
            let bIce = 0;
            let bFish = 0;
            for (let br = Math.max(0, hoverRow - 1); br <= Math.min(GRID_SIZE - 1, hoverRow + 1); br++) {
              for (let bc = Math.max(0, hoverCol - 1); bc <= Math.min(GRID_SIZE - 1, hoverCol + 1); bc++) {
                const gc = this.grid[br][bc];
                if (gc) {
                  bCount++;
                  if (gc.ice || gc.crate) bIce++;
                  if (gc.fish || gc.tuna) bFish += gc.tuna ? 2 : 1;
                }
              }
            }
            const parts = [`💣 3×3`];
            if (bCount > 0) parts.push(`${bCount}◼`);
            if (bIce > 0) parts.push(`❄️${bIce}`);
            if (bFish > 0) parts.push(`🐟${bFish}`);
            badgeText = parts.join(" ");
          } else {
            const ptsSuffix = cp.previewPts > 0 ? ` +${cp.previewPts}` : "";
            badgeText = totalLines >= 2
              ? `🔥 ${totalLines} LINES!${ptsSuffix}`
              : `✨ 1 LINE!${ptsSuffix}`;
          }
          const bx = Math.min(size - 48, Math.max(48, (hoverCol + piece.cols * 0.5) * cs));
          const by = Math.max(16, hoverRow * cs - 12);
          ctx.save();
          ctx.font = "800 11px Nunito, sans-serif";
          const tw = ctx.measureText(badgeText).width + 16;
          ctx.fillStyle = "rgba(44, 34, 62, 0.92)";
          this._roundRect(ctx, bx - tw * 0.5, by - 11, tw, 22, 11);
          ctx.fill();
          ctx.strokeStyle = "#ffd166";
          ctx.lineWidth = 1.6;
          this._roundRect(ctx, bx - tw * 0.5, by - 11, tw, 22, 11);
          ctx.stroke();
          ctx.fillStyle = "#ffe596";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(badgeText, bx, by);
          ctx.restore();
        }
      }

      // Smart Move Hint glowing guide
      if (this.hintTarget) {
        if (performance.now() > this.hintTarget.expiresAt) {
          this.hintTarget = null;
        } else if (this.hintTarget.cells) {
          const pulse = 0.55 + 0.45 * Math.sin(performance.now() * 0.008);
          ctx.save();
          ctx.fillStyle = `rgba(255, 225, 102, ${0.22 + pulse * 0.24})`;
          ctx.strokeStyle = `rgba(255, 232, 130, ${0.7 + pulse * 0.3})`;
          ctx.lineWidth = 2.8;
          for (const [hr, hc] of this.hintTarget.cells) {
            const hx = hc * cs + 2;
            const hy = hr * cs + 2;
            this._roundRect(ctx, hx, hy, cs - 4, cs - 4, 8);
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // Toy Hammer hover reticle + target outcome badge
      if (this.hammerMode && this.hammerHoverCell) {
        const { row: hr, col: hc } = this.hammerHoverCell;
        if (hr >= 0 && hr < GRID_SIZE && hc >= 0 && hc < GRID_SIZE) {
          const hCell = this.grid[hr][hc];
          const hx = hc * cs + cs * 0.5;
          const hy = hr * cs + cs * 0.5;
          ctx.save();
          ctx.strokeStyle = hCell ? "#f59e0b" : "rgba(255, 255, 255, 0.55)";
          ctx.lineWidth = 2.6;
          this._roundRect(ctx, hc * cs + 2, hr * cs + 2, cs - 4, cs - 4, 8);
          ctx.stroke();
          if (hCell) {
            ctx.beginPath();
            ctx.arc(hx, hy, cs * 0.24, 0, Math.PI * 2);
            ctx.stroke();
            const hLabel = hCell.ice ? "❄️ CRACK" : (hCell.crate ? "📦 CRACK" : "🔨 SMASH +45");
            ctx.font = "800 10.5px Nunito, sans-serif";
            const htw = ctx.measureText(hLabel).width + 14;
            const lbx = Math.min(size - htw * 0.5 - 4, Math.max(htw * 0.5 + 4, hx));
            const lby = Math.max(14, hr * cs - 10);
            ctx.fillStyle = "rgba(44, 34, 62, 0.92)";
            this._roundRect(ctx, lbx - htw * 0.5, lby - 10, htw, 20, 10);
            ctx.fill();
            ctx.fillStyle = "#fde68a";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(hLabel, lbx, lby);
          }
          ctx.restore();
        }
      }

      // Keyboard cursor preview
      if (!this.drag && this.kbCursor && this.kbCursor.active) {
        const kbPiece = this.tray[this.kbCursor.slotIndex];
        if (kbPiece) {
          const kbValid = this.canPlace(kbPiece, this.kbCursor.row, this.kbCursor.col);
          ctx.save();
          ctx.globalAlpha = kbValid ? 0.55 : 0.3;
          kbPiece.cells.forEach(([dr, dc], idx) => {
            const x = (this.kbCursor.col + dc) * cs + 3;
            const y = (this.kbCursor.row + dr) * cs + 3;
            this._drawBlock(
              ctx,
              x,
              y,
              cs - 6,
              kbPiece.color,
              idx === kbPiece.fishIndex,
              0,
              this._cellFlagsFromPiece(kbPiece, idx)
            );
          });
          ctx.globalAlpha = 1;
          ctx.strokeStyle = kbValid ? "#ffe066" : "#ff6b6b";
          ctx.lineWidth = 2.4;
          kbPiece.cells.forEach(([dr, dc]) => {
            const x = (this.kbCursor.col + dc) * cs + 2;
            const y = (this.kbCursor.row + dr) * cs + 2;
            this._roundRect(ctx, x, y, cs - 4, cs - 4, 8);
            ctx.stroke();
          });
          ctx.restore();
        }
      }

      // Wave light sweep on cleared rows/cols
      for (const w of this.clearingWaves) {
        const alpha = Math.max(0, w.life) * 0.72;
        ctx.save();
        if (w.type === "row") {
          const wy = w.index * cs + 2;
          const grad = ctx.createLinearGradient(0, wy, size, wy);
          grad.addColorStop(0, "rgba(255, 255, 255, 0)");
          grad.addColorStop(0.5, `rgba(255, 240, 175, ${alpha})`);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = grad;
          this._roundRect(ctx, 2, wy, size - 4, cs - 4, 8);
          ctx.fill();
        } else {
          const wx = w.index * cs + 2;
          const grad = ctx.createLinearGradient(wx, 0, wx, size);
          grad.addColorStop(0, "rgba(255, 255, 255, 0)");
          grad.addColorStop(0.5, `rgba(255, 240, 175, ${alpha})`);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = grad;
          this._roundRect(ctx, wx, 2, cs - 4, size - 4, 8);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore();
    }

    _drawFxOverlay() {
      const ctx = this.fxCtx;
      ctx.clearRect(0, 0, this.fxW, this.fxH);

      // Draw dragged piece floating under/above pointer
      if (this.drag) {
        const shellRect = this.fxCanvas.getBoundingClientRect();
        const piece = this.drag.piece;
        const cs = this.cellPx;
        const px = this.drag.clientX - shellRect.left - (piece.cols * cs) * 0.5;
        const py = this.drag.clientY + this.drag.offsetY - shellRect.top - (piece.rows * cs) * 0.5;

        ctx.save();
        ctx.shadowColor = "rgba(25, 10, 40, 0.35)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 8;
        piece.cells.forEach(([dr, dc], idx) => {
          this._drawBlock(
            ctx,
            px + dc * cs + 2,
            py + dr * cs + 2,
            cs - 4,
            piece.color,
            idx === piece.fishIndex,
            0,
            this._cellFlagsFromPiece(piece, idx)
          );
        });
        ctx.restore();

        // Live line-clear / reward preview pill while dragging
        const cp = this.drag.clearPreview;
        if (this.drag.valid && cp && (cp.fullRows.length > 0 || cp.fullCols.length > 0)) {
          const linesCount = cp.fullRows.length + cp.fullCols.length;
          const label = cp.previewFish > 0
            ? `✨ ${linesCount} Line${linesCount > 1 ? "s" : ""}! +${cp.previewPts} • +${cp.previewFish}🐟`
            : `✨ ${linesCount} Line${linesCount > 1 ? "s" : ""}! +${cp.previewPts}`;
          const boardRect = this.boardCanvas.getBoundingClientRect();
          const pillX = Math.max(92, Math.min(this.fxW - 92, boardRect.left - shellRect.left + (this.drag.hoverCol + piece.cols * 0.5) * cs));
          const pillY = Math.max(24, boardRect.top - shellRect.top + this.drag.hoverRow * cs - 14);
          ctx.save();
          ctx.font = "800 12px 'Segoe UI', sans-serif";
          const tw = ctx.measureText(label).width + 18;
          ctx.fillStyle = "rgba(42, 30, 58, 0.9)";
          this._roundRect(ctx, pillX - tw * 0.5, pillY - 12, tw, 24, 12);
          ctx.fill();
          ctx.strokeStyle = "#ffd166";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = "#ffe699";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, pillX, pillY);
          ctx.restore();
        }
      }

      // Draw burst particles
      for (const p of this.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw flying realistic fish arcing into Mochi's bowl!
      for (const f of this.flyingFish) {
        const u = Math.min(1, f.t);
        const inv = 1 - u;
        const x = inv * inv * f.sx + 2 * inv * u * f.cx + u * u * f.tx;
        const y = inv * inv * f.sy + 2 * inv * u * f.cy + u * u * f.ty;
        const dx = 2 * (1 - u) * (f.cx - f.sx) + 2 * u * (f.tx - f.cx);
        const dy = 2 * (1 - u) * (f.cy - f.sy) + 2 * u * (f.ty - f.cy);
        const angle = Math.atan2(dy, dx) + Math.PI;
        const scale = 1.0 + Math.sin(u * Math.PI) * 0.35;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        const drawFn = (window.MochiPet && window.MochiPet.drawFish) || window.drawRealisticFish;
        if (drawFn) {
          drawFn(ctx, 0, 0, 28, angle, { shadow: true });
        } else {
          ctx.shadowColor = "rgba(255, 200, 60, 0.9)";
          ctx.shadowBlur = 12;
          ctx.font = "22px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🐟", 0, 0);
        }
        ctx.restore();
      }

      // Draw floating score texts with pop-in scale animation
      for (const t of this.floatingTexts) {
        const maxLife = t.maxLife || 1.1;
        const age = Math.max(0, maxLife - t.life);
        const popScale = (t.scale || 1) * (age < 0.14 ? 0.72 + (age / 0.14) * 0.42 : 1.0);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, t.life * 1.15));
        ctx.translate(t.x, t.y);
        ctx.scale(popScale, popScale);
        ctx.font = "900 18px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#2f263b";
        ctx.lineWidth = 4.5;
        ctx.strokeText(t.text, 0, 0);
        ctx.fillStyle = t.color || "#ffd166";
        ctx.fillText(t.text, 0, 0);
        ctx.restore();
      }
    }

    renderTray() {
      for (let i = 0; i < 3; i++) {
        const canvas = this.slotCanvases[i];
        const slotEl = canvas.parentElement;
        const piece = this.tray[i];

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(40, slotEl.clientWidth);
        const h = Math.max(40, slotEl.clientHeight);
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        const ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const isDraggingThis = this.drag && this.drag.slotIndex === i;
        if (!piece || isDraggingThis) {
          slotEl.classList.toggle("empty", !piece);
          slotEl.classList.remove("unplayable");
          continue;
        }

        slotEl.classList.remove("empty");

        // Check if this specific piece fits anywhere
        let fits = false;
        for (let r = 0; r < GRID_SIZE && !fits; r++) {
          for (let c = 0; c < GRID_SIZE && !fits; c++) {
            if (this.canPlace(piece, r, c)) fits = true;
          }
        }
        slotEl.classList.toggle("unplayable", !fits);

        const maxDim = Math.max(piece.cols, piece.rows, 3);
        const blockSize = Math.min((w - 16) / maxDim, (h - 14) / maxDim, 20);
        const totalW = piece.cols * blockSize;
        const totalH = piece.rows * blockSize;
        const ox = (w - totalW) * 0.5;
        const oy = (h - totalH) * 0.5;

        piece.cells.forEach(([dr, dc], idx) => {
          this._drawBlock(
            ctx,
            ox + dc * blockSize + 1,
            oy + dr * blockSize + 1,
            blockSize - 2,
            piece.color,
            idx === piece.fishIndex,
            0,
            this._cellFlagsFromPiece(piece, idx)
          );
        });
      }
      this.renderHoldSlot();
    }

    renderHoldSlot() {
      if (!this.holdSlotCanvas) return;
      const canvas = this.holdSlotCanvas;
      const slotEl = canvas.parentElement;
      const piece = this.holdPiece;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(36, slotEl.clientWidth);
      const h = Math.max(36, slotEl.clientHeight);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const isDraggingHold = this.drag && this.drag.slotIndex === -1;
      slotEl.classList.toggle("empty", !piece || isDraggingHold);
      slotEl.classList.toggle("hold-locked", Boolean(this.swappedHoldThisTurn));
      if (!piece || isDraggingHold) return;

      const maxDim = Math.max(piece.cols, piece.rows, 3);
      const blockSize = Math.min((w - 10) / maxDim, (h - 16) / maxDim, 14);
      const totalW = piece.cols * blockSize;
      const totalH = piece.rows * blockSize;
      const ox = (w - totalW) * 0.5;
      const oy = (h - totalH) * 0.5 + 4;

      piece.cells.forEach(([dr, dc], idx) => {
        this._drawBlock(
          ctx,
          ox + dc * blockSize + 0.8,
          oy + dr * blockSize + 0.8,
          blockSize - 1.6,
          piece.color,
          idx === piece.fishIndex,
          0,
          this._cellFlagsFromPiece(piece, idx)
        );
      });
    }

    _drawBlock(ctx, x, y, size, color, hasFish, highlightGlow, flags = null) {
      const r = Math.max(4, size * 0.28);
      const skin = this.tileSkin || "classic";

      // Soft ambient drop-lip + sculpted 3D base cushion
      ctx.fillStyle = "rgba(22, 12, 34, 0.26)";
      this._roundRect(ctx, x, y + 2.4, size, size - 0.5, r);
      ctx.fill();
      ctx.fillStyle = skin === "neon" ? "#161124" : color.border;
      this._roundRect(ctx, x, y + 1.4, size, size - 0.8, r);
      ctx.fill();

      // Main cushion / skin fill
      if (skin === "neon") {
        const neonBg = ctx.createLinearGradient(x, y, x, y + size);
        neonBg.addColorStop(0, "#2b2048");
        neonBg.addColorStop(1, "#19122b");
        ctx.fillStyle = neonBg;
        this._roundRect(ctx, x, y, size, size - 2, r);
        ctx.fill();
        ctx.strokeStyle = color.hi;
        ctx.lineWidth = Math.max(1.8, size * 0.095);
        this._roundRect(ctx, x + 1, y + 1, size - 2, size - 4, r);
        ctx.stroke();
        ctx.fillStyle = color.fill;
        ctx.globalAlpha = 0.34;
        this._roundRect(ctx, x + 3, y + 3, size - 6, size - 8, Math.max(2, r - 2));
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        const grad = ctx.createLinearGradient(x, y, x + size * 0.35, y + size - 1);
        grad.addColorStop(0, color.hi);
        grad.addColorStop(0.42, color.fill);
        grad.addColorStop(1, color.border);
        ctx.fillStyle = grad;
        this._roundRect(ctx, x, y, size, size - 2, r);
        ctx.fill();

        // Crisp translucent inner rim light
        ctx.strokeStyle = "rgba(255, 255, 255, 0.32)";
        ctx.lineWidth = Math.max(0.8, size * 0.042);
        this._roundRect(ctx, x + 0.9, y + 0.9, size - 1.8, size - 3.8, Math.max(3, r - 1));
        ctx.stroke();

        if (skin === "cookies") {
          ctx.strokeStyle = "#fff5e1";
          ctx.lineWidth = Math.max(1.2, size * 0.08);
          this._roundRect(ctx, x + 1.5, y + 1.5, size - 3, size - 5, Math.max(3, r - 1));
          ctx.stroke();
          if (size >= 14) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.beginPath();
            ctx.arc(x + size * 0.29, y + size * 0.31, 1.4, 0, Math.PI * 2);
            ctx.arc(x + size * 0.68, y + size * 0.59, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Glossy candy top glass capsule + specular dot + soft bottom bounce rim
          const glossGrad = ctx.createLinearGradient(x, y + 1.5, x, y + size * 0.36);
          glossGrad.addColorStop(0, "rgba(255, 255, 255, 0.56)");
          glossGrad.addColorStop(1, "rgba(255, 255, 255, 0.06)");
          ctx.fillStyle = glossGrad;
          this._roundRect(ctx, x + size * 0.12, y + 1.9, size * 0.76, size * 0.3, Math.max(2, r * 0.52));
          ctx.fill();

          if (size >= 14) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
            ctx.beginPath();
            ctx.arc(x + size * 0.23, y + size * 0.24, Math.max(1.1, size * 0.055), 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            this._roundRect(ctx, x + size * 0.18, y + size * 0.77, size * 0.64, size * 0.11, Math.max(1.5, r * 0.25));
            ctx.fill();
          }

          if (skin === "paws" && size >= 16 && !hasFish && !(flags && (flags.ice || flags.bomb || flags.tuna || flags.gift || flags.rocket || flags.rainbow))) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.32)";
            ctx.beginPath();
            ctx.ellipse(x + size * 0.5, y + size * 0.62, size * 0.17, size * 0.13, 0, 0, Math.PI * 2);
            ctx.fill();
            const toes = [[-0.17, -0.1], [-0.06, -0.17], [0.06, -0.17], [0.17, -0.1]];
            for (const [tx, ty] of toes) {
              ctx.beginPath();
              ctx.arc(x + size * (0.5 + tx), y + size * (0.56 + ty), size * 0.055, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      if (flags && flags.rainbow) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        this._roundRect(ctx, x + 1, y + 1, size - 2, size - 4, Math.max(3, r - 1));
        ctx.stroke();
      }

      if (flags && flags.ice) {
        // Faceted frosted crystal ice shell (2-hit block)
        const iceGrad = ctx.createLinearGradient(x, y, x + size, y + size);
        iceGrad.addColorStop(0, "rgba(235, 252, 255, 0.62)");
        iceGrad.addColorStop(0.5, "rgba(180, 238, 255, 0.38)");
        iceGrad.addColorStop(1, "rgba(130, 218, 248, 0.55)");
        ctx.fillStyle = iceGrad;
        this._roundRect(ctx, x + 0.8, y + 0.8, size - 1.6, size - 2.6, Math.max(4, r - 1));
        ctx.fill();
        ctx.strokeStyle = "#eefcff";
        ctx.lineWidth = 1.9;
        this._roundRect(ctx, x + 1.4, y + 1.4, size - 2.8, size - 3.8, Math.max(4, r - 1));
        ctx.stroke();
        if (size >= 14) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(x + size * 0.2, y + size * 0.3);
          ctx.lineTo(x + size * 0.44, y + size * 0.5);
          ctx.lineTo(x + size * 0.76, y + size * 0.24);
          ctx.moveTo(x + size * 0.44, y + size * 0.5);
          ctx.lineTo(x + size * 0.62, y + size * 0.72);
          ctx.stroke();
        }
      }

      if (flags && flags.crate) {
        // Warm 2-hit wooden crate border & cross slats
        ctx.save();
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = Math.max(2, size * 0.11);
        this._roundRect(ctx, x + 2, y + 2, size - 4, size - 5, Math.max(3, r - 1));
        ctx.stroke();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.4;
        this._roundRect(ctx, x + 2, y + 2, size - 4, size - 5, Math.max(3, r - 1));
        ctx.stroke();
        if (size >= 14) {
          ctx.strokeStyle = "rgba(180, 83, 9, 0.75)";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(x + size * 0.22, y + size * 0.22);
          ctx.lineTo(x + size * 0.78, y + size * 0.78);
          ctx.moveTo(x + size * 0.78, y + size * 0.22);
          ctx.lineTo(x + size * 0.22, y + size * 0.78);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (highlightGlow > 0) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 + highlightGlow * 0.55})`;
        ctx.lineWidth = 2.6;
        this._roundRect(ctx, x, y, size, size - 1, r);
        ctx.stroke();
      }

      if (size >= 10) {
        let iconKind = "";
        if (flags && flags.bomb) iconKind = "bomb";
        else if (flags && flags.tuna) iconKind = "tuna";
        else if (flags && flags.gift) iconKind = "gift";
        else if (flags && flags.rocket) iconKind = "rocket";
        else if (flags && flags.rainbow) iconKind = "rainbow";
        else if (hasFish) iconKind = "fish";

        if (iconKind) {
          this._drawSpecialEmblem(ctx, x, y, size, iconKind);
        }
        if (this.colorblindMode && size >= 12) {
          this._drawColorblindGlyph(ctx, x, y, size, color && color.name, Boolean(iconKind));
        }
      }
    }

    _drawSpecialEmblem(ctx, x, y, size, kind) {
      const cx = x + size * 0.5;
      const cy = y + size * 0.5;
      const u = size * 0.32;
      ctx.save();
      ctx.translate(cx, cy);

      if (kind === "fish") {
        const drawFn = (window.MochiPet && window.MochiPet.drawFish) || window.drawRealisticFish;
        if (drawFn) {
          drawFn(ctx, 0, 0, size * 0.72, 0, { shadow: false });
        } else {
          // Fallback legacy vector fish
          ctx.fillStyle = "#f59f00";
          ctx.beginPath();
          ctx.moveTo(u * 0.45, 0);
          ctx.lineTo(u * 1.05, -u * 0.55);
          ctx.lineTo(u * 0.9, 0);
          ctx.lineTo(u * 1.05, u * 0.55);
          ctx.closePath();
          ctx.fill();
          const fg = ctx.createLinearGradient(-u, -u * 0.5, u * 0.6, u * 0.5);
          fg.addColorStop(0, "#fff5ad");
          fg.addColorStop(0.55, "#ffca3a");
          fg.addColorStop(1, "#e67e00");
          ctx.fillStyle = fg;
          ctx.beginPath();
          ctx.ellipse(-u * 0.14, 0, u * 0.78, u * 0.46, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (kind === "bomb") {
        // Curved fuse + spark
        ctx.strokeStyle = "#ffd8a8";
        ctx.lineWidth = Math.max(1.2, size * 0.055);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(u * 0.1, -u * 0.65);
        ctx.quadraticCurveTo(u * 0.5, -u * 1.05, u * 0.78, -u * 0.78);
        ctx.stroke();
        ctx.fillStyle = "#ffec66";
        ctx.beginPath();
        ctx.arc(u * 0.82, -u * 0.82, u * 0.24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff595e";
        ctx.beginPath();
        ctx.arc(u * 0.82, -u * 0.82, u * 0.12, 0, Math.PI * 2);
        ctx.fill();
        // Metallic cap & dark charcoal bomb sphere
        ctx.fillStyle = "#a5adc4";
        ctx.fillRect(-u * 0.22, -u * 0.78, u * 0.44, u * 0.24);
        const bg = ctx.createRadialGradient(-u * 0.25, -u * 0.18, u * 0.1, 0, u * 0.06, u * 0.76);
        bg.addColorStop(0, "#6c6887");
        bg.addColorStop(0.45, "#2b253c");
        bg.addColorStop(1, "#120e1c");
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(0, u * 0.08, u * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.beginPath();
        ctx.ellipse(-u * 0.26, -u * 0.14, u * 0.2, u * 0.11, -0.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === "gift") {
        // Box body + satin golden cross ribbons & bow
        const gg = ctx.createLinearGradient(0, -u * 0.6, 0, u * 0.85);
        gg.addColorStop(0, "#ff758f");
        gg.addColorStop(1, "#d92652");
        ctx.fillStyle = gg;
        this._roundRect(ctx, -u * 0.72, -u * 0.48, u * 1.44, u * 1.24, Math.max(2, u * 0.22));
        ctx.fill();
        ctx.fillStyle = "#ff4d73";
        this._roundRect(ctx, -u * 0.8, -u * 0.55, u * 1.6, u * 0.36, Math.max(1.5, u * 0.16));
        ctx.fill();
        // Gold ribbons
        ctx.fillStyle = "#ffe066";
        ctx.fillRect(-u * 0.14, -u * 0.55, u * 0.28, u * 1.31);
        ctx.fillRect(-u * 0.74, u * 0.02, u * 1.48, u * 0.24);
        // Satin bow loops
        ctx.strokeStyle = "#ffd166";
        ctx.lineWidth = Math.max(1.3, size * 0.055);
        ctx.beginPath();
        ctx.ellipse(-u * 0.28, -u * 0.72, u * 0.24, u * 0.14, -0.3, 0, Math.PI * 2);
        ctx.ellipse(u * 0.28, -u * 0.72, u * 0.24, u * 0.14, 0.3, 0, Math.PI * 2);
        ctx.stroke();
      } else if (kind === "rocket") {
        ctx.rotate(-0.65);
        // Flame exhaust
        ctx.fillStyle = "#ff9f1c";
        ctx.beginPath();
        ctx.moveTo(-u * 0.24, u * 0.52);
        ctx.lineTo(0, u * 1.08);
        ctx.lineTo(u * 0.24, u * 0.52);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#fff3b0";
        ctx.beginPath();
        ctx.moveTo(-u * 0.11, u * 0.52);
        ctx.lineTo(0, u * 0.86);
        ctx.lineTo(u * 0.11, u * 0.52);
        ctx.closePath();
        ctx.fill();
        // Side fins
        ctx.fillStyle = "#ff4d6d";
        ctx.beginPath();
        ctx.moveTo(-u * 0.3, u * 0.18);
        ctx.lineTo(-u * 0.62, u * 0.62);
        ctx.lineTo(-u * 0.22, u * 0.55);
        ctx.moveTo(u * 0.3, u * 0.18);
        ctx.lineTo(u * 0.62, u * 0.62);
        ctx.lineTo(u * 0.22, u * 0.55);
        ctx.fill();
        // Rocket fuselage
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(0, 0, u * 0.36, u * 0.74, 0, 0, Math.PI * 2);
        ctx.fill();
        // Red nose cone + blue window
        ctx.fillStyle = "#ff4d6d";
        ctx.beginPath();
        ctx.moveTo(-u * 0.28, -u * 0.38);
        ctx.quadraticCurveTo(0, -u * 0.92, u * 0.28, -u * 0.38);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#3bc9db";
        ctx.beginPath();
        ctx.arc(0, -u * 0.04, u * 0.18, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === "rainbow") {
        // Prismatic crystal star gem
        const hues = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#b565f7"];
        for (let i = 0; i < 5; i++) {
          const a0 = -Math.PI / 2 + (i * Math.PI * 2) / 5;
          const a1 = -Math.PI / 2 + ((i + 1) * Math.PI * 2) / 5;
          ctx.fillStyle = hues[i];
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a0) * u * 0.92, Math.sin(a0) * u * 0.92);
          ctx.lineTo(Math.cos(a1) * u * 0.92, Math.sin(a1) * u * 0.92);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, u * 0.32, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === "tuna") {
        // Shiny blue-silver tuna tin
        const cg = ctx.createLinearGradient(-u * 0.7, 0, u * 0.7, 0);
        cg.addColorStop(0, "#1c7ed6");
        cg.addColorStop(0.5, "#4dabf7");
        cg.addColorStop(1, "#1864ab");
        ctx.fillStyle = cg;
        this._roundRect(ctx, -u * 0.68, -u * 0.32, u * 1.36, u * 0.86, Math.max(2, u * 0.2));
        ctx.fill();
        ctx.fillStyle = "#f1f3f5";
        ctx.beginPath();
        ctx.ellipse(0, -u * 0.32, u * 0.68, u * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#adb5bd";
        ctx.lineWidth = Math.max(0.8, size * 0.03);
        ctx.stroke();
        ctx.fillStyle = "#ffd166";
        ctx.beginPath();
        ctx.ellipse(0, u * 0.14, u * 0.34, u * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    _drawColorblindGlyph(ctx, x, y, size, colorName, cornerOnly) {
      if (!colorName || colorName === "bomb") return;
      const cx = cornerOnly ? x + size * 0.24 : x + size * 0.5;
      const cy = cornerOnly ? y + size * 0.24 : y + size * 0.52;
      const r = Math.max(2.6, size * (cornerOnly ? 0.13 : 0.22));
      if (cornerOnly && size < 18) return;

      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
      ctx.strokeStyle = "rgba(28, 23, 43, 0.55)";
      ctx.lineWidth = Math.max(1, size * 0.045);
      ctx.beginPath();

      if (colorName === "strawberry") {
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
      } else if (colorName === "tangerine") {
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r * 0.96, cy + r * 0.82);
        ctx.lineTo(cx - r * 0.96, cy + r * 0.82);
        ctx.closePath();
      } else if (colorName === "honey") {
        const s = r * 0.82;
        ctx.rect(cx - s, cy - s, s * 2, s * 2);
      } else if (colorName === "mint") {
        ctx.moveTo(cx, cy - r * 1.05);
        ctx.lineTo(cx + r * 1.05, cy);
        ctx.lineTo(cx, cy + r * 1.05);
        ctx.lineTo(cx - r * 1.05, cy);
        ctx.closePath();
      } else if (colorName === "blueberry") {
        const w = r * 0.36;
        ctx.moveTo(cx - w, cy - r);
        ctx.lineTo(cx + w, cy - r);
        ctx.lineTo(cx + w, cy - w);
        ctx.lineTo(cx + r, cy - w);
        ctx.lineTo(cx + r, cy + w);
        ctx.lineTo(cx + w, cy + w);
        ctx.lineTo(cx + w, cy + r);
        ctx.lineTo(cx - w, cy + r);
        ctx.lineTo(cx - w, cy + w);
        ctx.lineTo(cx - r, cy + w);
        ctx.lineTo(cx - r, cy - w);
        ctx.lineTo(cx - w, cy - w);
        ctx.closePath();
      } else {
        // Lavender 4-point star
        const inner = r * 0.4;
        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI) / 4 - Math.PI / 2;
          const rad = i % 2 === 0 ? r * 1.08 : inner;
          const px = cx + Math.cos(ang) * rad;
          const py = cy + Math.sin(ang) * rad;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    _roundRect(ctx, x, y, w, h, r) {
      const rad = Math.min(r, w * 0.5, h * 0.5);
      ctx.beginPath();
      ctx.moveTo(x + rad, y);
      ctx.arcTo(x + w, y, x + w, y + h, rad);
      ctx.arcTo(x + w, y + h, x, y + h, rad);
      ctx.arcTo(x, y + h, x, y, rad);
      ctx.arcTo(x, y, x + w, y, rad);
      ctx.closePath();
    }
  }

  global.PuzzleEngine = PuzzleEngine;
})(window);
