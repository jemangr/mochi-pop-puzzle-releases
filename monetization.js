/**
 * Mochi Pop! Monetization, Retention, Remote Config & Analytics Engine (v0.4.0)
 * - Smart Interstitial Gate (D0 Grace Period + Rewarded Immunity + Frequency Cap)
 * - Remote Config with sensible defaults & optional JSON override
 * - Privacy-safe Local Funnel Analytics (ready for Firebase/GA4 native bridge)
 * - Mochi Friendship XP / Level curve (Lv. 1-50)
 * - 12-Card Sticker Photo Album (3 Sets x 4 Cards)
 * - Weekly Purr League & Daily Challenge Seeded Standings
 * - Weekend / Midweek Mini-Events
 */
(function (global) {
  const ANALYTICS_KEY = "mochi_pop_analytics_v1";
  const REMOTE_CFG_KEY = "mochi_pop_remote_cfg_v1";
  const CLOUD_META_KEY = "mochi_pop_cloud_v1";

  const DEFAULT_REMOTE_CONFIG = {
    interstitialCooldownSec: 210, // 3.5 min min spacing
    interstitialMinRuns: 3,       // never before 3 completed runs
    d0GracePeriod: true,          // 0 forced interstitials on install day
    rewardedImmunitySec: 120,     // skip interstitials for 2m after any rewarded ad
    wheelMaxAdSpinsPerDay: 3,     // 1 free + up to 3 rewarded spins/day
    giftAdBonusFish: 4,           // +4 extra fish on Mystery Gift Ad Upgrade
    weekendEventMode: "auto",     // auto | fish_frenzy | rocket_surge | none
    leaderboardApiUrl: "https://api.jemangr.app",
    leaderboardStarsLive: false,
    leaderboardBlitzLive: false
  };

  const ALBUM_SETS = [
    {
      id: "cozy_home",
      titleKey: "album_set_home",
      fallbackTitle: "Cozy Morning",
      rewardFish: 5,
      cards: [
        { id: "c_tea", icon: "🍵", name: "Teacup Nap", rarity: "common" },
        { id: "c_sun", icon: "☀️", name: "Sunbeam Stretch", rarity: "common" },
        { id: "c_yarn", icon: "🧶", name: "Tangled Yarn", rarity: "rare" },
        { id: "c_chef", icon: "👨‍🍳", name: "Pancake Chef", rarity: "epic" }
      ]
    },
    {
      id: "playtime",
      titleKey: "album_set_play",
      fallbackTitle: "Playtime Madness",
      rewardFish: 6,
      cards: [
        { id: "c_box", icon: "📦", name: "Box Fortress", rarity: "common" },
        { id: "c_laser", icon: "🔴", name: "Laser Ninja", rarity: "common" },
        { id: "c_dj", icon: "🎧", name: "DJ Purr", rarity: "rare" },
        { id: "c_sneeze", icon: "🤧", name: "6-Tap Sneeze", rarity: "epic" }
      ]
    },
    {
      id: "dreamland",
      titleKey: "album_set_dream",
      fallbackTitle: "Starry Dreams",
      rewardFish: 8,
      cards: [
        { id: "c_moon", icon: "🌙", name: "Window Gazing", rarity: "common" },
        { id: "c_fish", icon: "🐟", name: "Golden Dream", rarity: "rare" },
        { id: "c_astro", icon: "🚀", name: "Astro Mochi", rarity: "epic" },
        { id: "c_king", icon: "👑", name: "King of Cozy", rarity: "legend" }
      ]
    }
  ];

  const WHEEL_WEDGES = [
    { id: "fish2", label: "+2 🐟", fish: 2, color: "#ffd8a8" },
    { id: "rot1", label: "+1 ↻", rotate: 1, color: "#d0ebff" },
    { id: "fish4", label: "+4 🐟", fish: 4, color: "#ffe066" },
    { id: "sticker", label: "📸 Card", albumCard: true, color: "#f3d9fa" },
    { id: "rot2", label: "+2 ↻", rotate: 2, color: "#c3fae8" },
    { id: "jackpot", label: "+8 🐟!", fish: 8, color: "#ffc9c9" }
  ];

  const RIVAL_NAMES = [
    "NekoMaster", "WhiskerPro", "YukiChan", "PixelPaw", "CaramelCat",
    "LunaPop", "Kibo88", "TunaKing", "SunnyTail", "MatchaMew",
    "BobaPaws", "NovaKitten", "SakuraFox", "GatoVerde", "Zeytin"
  ];

  function safeParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function loadRemoteConfig() {
    const saved = safeParse(localStorage.getItem(REMOTE_CFG_KEY), {});
    const cfg = Object.assign({}, DEFAULT_REMOTE_CONFIG, saved);
    if (!cfg.leaderboardApiUrl) {
      cfg.leaderboardApiUrl = DEFAULT_REMOTE_CONFIG.leaderboardApiUrl;
    }
    return cfg;
  }

  function mergeRemoteConfig(patch) {
    if (!patch || typeof patch !== "object") return loadRemoteConfig();
    const merged = Object.assign({}, DEFAULT_REMOTE_CONFIG, loadRemoteConfig(), patch);
    if (!merged.leaderboardApiUrl) {
      merged.leaderboardApiUrl = DEFAULT_REMOTE_CONFIG.leaderboardApiUrl;
    }
    try {
      localStorage.setItem(REMOTE_CFG_KEY, JSON.stringify(merged));
    } catch (_) {}
    return merged;
  }

  function loadAnalytics() {
    const today = new Date().toISOString().slice(0, 10);
    const base = {
      firstInstallDate: today,
      activeDays: [today],
      sessions: 0,
      runsStarted: 0,
      runsCompleted: 0,
      linesTotal: 0,
      fishEarnedTotal: 0,
      rewardedAdsWatched: 0,
      interstitialsShown: 0,
      interstitialsSkipped: 0,
      lastRewardedAt: 0,
      lastInterstitialAt: 0,
      recentEvents: []
    };
    const saved = safeParse(localStorage.getItem(ANALYTICS_KEY), null);
    if (!saved) return base;
    const out = Object.assign({}, base, saved);
    if (!Array.isArray(out.activeDays)) out.activeDays = [today];
    if (!out.activeDays.includes(today)) out.activeDays.push(today);
    if (!Array.isArray(out.recentEvents)) out.recentEvents = [];
    return out;
  }

  function saveAnalytics(data) {
    try {
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  const MochiAnalytics = {
    track(name, params = {}) {
      const a = loadAnalytics();
      const now = Date.now();
      if (name === "session_start") a.sessions += 1;
      else if (name === "run_start") a.runsStarted += 1;
      else if (name === "run_complete") a.runsCompleted += 1;
      else if (name === "lines_cleared") a.linesTotal += Number(params.count || 0);
      else if (name === "fish_earned") a.fishEarnedTotal += Number(params.count || 0);
      else if (name === "rewarded_ad_complete") {
        a.rewardedAdsWatched += 1;
        a.lastRewardedAt = now;
      } else if (name === "interstitial_shown") {
        a.interstitialsShown += 1;
        a.lastInterstitialAt = now;
      } else if (name === "interstitial_skipped") {
        a.interstitialsSkipped += 1;
      }

      a.recentEvents.push({ t: now, e: name, p: params });
      if (a.recentEvents.length > 25) a.recentEvents = a.recentEvents.slice(-25);
      saveAnalytics(a);

      try {
        if (global.MochiNativeAnalytics && typeof global.MochiNativeAnalytics.logEvent === "function") {
          global.MochiNativeAnalytics.logEvent(name, JSON.stringify(params));
        }
      } catch (_) {}
      return a;
    },
    getSummary() {
      const a = loadAnalytics();
      const today = new Date().toISOString().slice(0, 10);
      return {
        ...a,
        daysActiveCount: a.activeDays.length,
        isD0: a.firstInstallDate === today
      };
    },
    reset() {
      try {
        localStorage.removeItem(ANALYTICS_KEY);
      } catch (_) {}
    }
  };

  function canShowInterstitial() {
    const cfg = loadRemoteConfig();
    const stats = MochiAnalytics.getSummary();
    const now = Date.now();

    if (cfg.d0GracePeriod && stats.isD0) {
      return { allowed: false, reason: "d0_grace" };
    }
    if ((stats.runsCompleted || 0) < (cfg.interstitialMinRuns || 3)) {
      return { allowed: false, reason: "min_runs_grace" };
    }
    if (stats.lastRewardedAt && now - stats.lastRewardedAt < (cfg.rewardedImmunitySec || 120) * 1000) {
      return { allowed: false, reason: "rewarded_immunity" };
    }
    if (stats.lastInterstitialAt && now - stats.lastInterstitialAt < (cfg.interstitialCooldownSec || 210) * 1000) {
      return { allowed: false, reason: "cooldown" };
    }
    return { allowed: true, reason: "ready" };
  }

  function computeFriendLevel(totalXp) {
    const xp = Math.max(0, Math.floor(totalXp || 0));
    let level = 1;
    let remaining = xp;
    let need = 60;
    while (level < 50 && remaining >= need) {
      remaining -= need;
      level += 1;
      need = 60 + (level - 1) * 25;
    }
    const startRotateBonus = level >= 12 ? 2 : level >= 3 ? 1 : 0;
    const milestoneFishBonus = level >= 35 ? 2 : level >= 6 ? 1 : 0;
    const hungerDecayMult = level >= 18 ? 0.85 : 1;
    const bonusWheelSpin = level >= 25 ? 1 : 0;
    const scorePerkMult = level >= 50 ? 1.15 : level >= 35 ? 1.10 : level >= 15 ? 1.05 : 1;
    return {
      level,
      xpInLevel: remaining,
      xpForNext: need,
      pct: Math.min(100, Math.round((remaining / Math.max(1, need)) * 100)),
      startRotateBonus,
      milestoneFishBonus,
      hungerDecayMult,
      bonusWheelSpin,
      scorePerkMult
    };
  }

  function getActiveMiniEvent(dateObj = new Date()) {
    const cfg = loadRemoteConfig();
    const mode = cfg.weekendEventMode || "auto";
    if (mode === "none") return null;
    const day = dateObj.getDay(); // 0=Sun, 3=Wed, 6=Sat
    if (mode === "fish_frenzy" || (mode === "auto" && (day === 0 || day === 6))) {
      return {
        id: "fish_frenzy",
        icon: "🐟",
        i18nKey: "event_fish_frenzy",
        fallbackLabel: "Fish Frenzy Weekend: 2× Golden Fish!",
        fishMult: 2,
        rocketMult: 1
      };
    }
    if (mode === "rocket_surge" || (mode === "auto" && day === 3)) {
      return {
        id: "rocket_surge",
        icon: "🚀",
        i18nKey: "event_rocket_surge",
        fallbackLabel: "Rocket Wednesday: 2× Yarn Rockets!",
        fishMult: 1,
        rocketMult: 2
      };
    }
    return null;
  }

  function pickRandomAlbumCard(ownedIds = []) {
    const all = [];
    for (const set of ALBUM_SETS) {
      for (const c of set.cards) all.push({ ...c, setId: set.id });
    }
    const missing = all.filter((c) => !ownedIds.includes(c.id));
    if (missing.length > 0) {
      return { card: missing[Math.floor(Math.random() * missing.length)], isDuplicate: false };
    }
    return { card: all[Math.floor(Math.random() * all.length)], isDuplicate: true };
  }

  function pickAlbumCardWithPity(ownedIds = [], dupStreak = 0) {
    const all = [];
    for (const set of ALBUM_SETS) {
      for (const c of set.cards) all.push({ ...c, setId: set.id });
    }
    const missing = all.filter((c) => !ownedIds.includes(c.id));
    if (missing.length > 0) {
      // Guarantee new card after 2 consecutive duplicates (or when starter collection < 4 cards)
      const ownedPool = all.filter((c) => ownedIds.includes(c.id));
      const allowDuplicate = ownedPool.length >= 4 && dupStreak < 2 && Math.random() < 0.25;
      if (allowDuplicate) {
        return {
          card: ownedPool[Math.floor(Math.random() * ownedPool.length)],
          isDuplicate: true,
          nextDupStreak: dupStreak + 1,
          pityTriggered: false
        };
      }
      return {
        card: missing[Math.floor(Math.random() * missing.length)],
        isDuplicate: false,
        nextDupStreak: 0,
        pityTriggered: dupStreak >= 2
      };
    }
    return {
      card: all[Math.floor(Math.random() * all.length)],
      isDuplicate: true,
      nextDupStreak: 0,
      pityTriggered: false
    };
  }

  function hashSeed(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function getLeagueTier(bestScore) {
    if (bestScore >= 12000) return { id: "diamond", name: "Diamond Purr", icon: "💎", color: "#3b82f6" };
    if (bestScore >= 6000) return { id: "gold", name: "Gold Whisker", icon: "🥇", color: "#d97706" };
    if (bestScore >= 2500) return { id: "silver", name: "Silver Bell", icon: "🥈", color: "#64748b" };
    return { id: "bronze", name: "Cozy Bronze", icon: "🥉", color: "#b45309" };
  }

  function generateLeaderboardRows({ dateKey, nickname, playerBest, playerDailyBest, playerBlitzBest = 0, mode = "daily" }) {
    const seedBase = mode === "daily" ? `daily-${dateKey}` : (mode === "blitz" ? `blitz-${dateKey.slice(0, 7)}` : `weekly-${dateKey.slice(0, 7)}`);
    let seed = hashSeed(seedBase);
    const nextRand = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const maxScale = mode === "daily"
      ? 3600
      : (mode === "blitz"
        ? Math.max(2600, Math.round((playerBlitzBest || 900) * 1.4))
        : Math.max(4500, Math.round((playerBest || 1200) * 1.45)));
    const minScale = mode === "daily" ? 350 : (mode === "blitz" ? 280 : 600);
    const rows = [];
    const pool = RIVAL_NAMES.slice();

    for (let i = 0; i < 9; i++) {
      const idx = Math.floor(nextRand() * pool.length);
      const name = pool.splice(idx, 1)[0] || `CatFan${i + 1}`;
      const rScore = Math.round((minScale + Math.pow(nextRand(), 1.35) * (maxScale - minScale)) / 10) * 10;
      rows.push({
        name,
        score: rScore,
        isPlayer: false,
        tier: getLeagueTier(rScore)
      });
    }

    const myScore = mode === "daily" ? (playerDailyBest || 0) : (mode === "blitz" ? (playerBlitzBest || 0) : (playerBest || 0));
    rows.push({
      name: (nickname && nickname.trim()) || "You (MochiFan)",
      score: myScore,
      isPlayer: true,
      tier: getLeagueTier(myScore)
    });

    rows.sort((a, b) => b.score - a.score);
    rows.forEach((r, idx) => {
      r.rank = idx + 1;
    });
    return rows;
  }

  function getWeekKey(dateKey) {
    const d = dateKey ? new Date(`${dateKey}T12:00:00Z`) : new Date();
    if (Number.isNaN(d.getTime())) return "2026-W01";
    const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
    return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  }

  const TIER_MAP = {
    Crown: { id: "diamond", name: "Diamond Purr", icon: "💎", color: "#3b82f6" },
    Gold: { id: "gold", name: "Gold Whisker", icon: "🥇", color: "#d97706" },
    Silver: { id: "silver", name: "Silver Bell", icon: "🥈", color: "#64748b" },
    Bronze: { id: "bronze", name: "Cozy Bronze", icon: "🥉", color: "#b45309" },
    Kitten: { id: "bronze", name: "Cozy Bronze", icon: "🐾", color: "#b45309" }
  };

  function resolveServerTier(tierName, score) {
    return TIER_MAP[tierName] || getLeagueTier(score || 0);
  }

  function readCloudMeta() {
    const base = { playerId: "", deviceToken: "", syncCode: "", lastSyncAt: 0 };
    const saved = safeParse(localStorage.getItem(CLOUD_META_KEY), null);
    return saved && typeof saved === "object" ? Object.assign(base, saved) : base;
  }

  function writeCloudMeta(meta) {
    try {
      localStorage.setItem(CLOUD_META_KEY, JSON.stringify(meta));
    } catch (_) {}
  }

  function getApiBase() {
    const raw = (loadRemoteConfig().leaderboardApiUrl || "").trim();
    return raw.replace(/\/+$/, "");
  }

  let registerInFlight = null;

  async function apiCall(path, { method = "GET", body = null, timeoutMs = 6500 } = {}) {
    const base = getApiBase();
    if (!base) throw new Error("Cloud API disabled");
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
    try {
      const opts = {
        method,
        headers: { "Content-Type": "application/json" },
        signal: ctrl ? ctrl.signal : undefined
      };
      if (body !== null) opts.body = JSON.stringify(body);
      const res = await fetch(`${base}${path}`, opts);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      return data;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  const MochiCloud = {
    getMeta: readCloudMeta,

    async ensureRegistered(nickname = "") {
      const meta = readCloudMeta();
      if (meta.playerId && meta.deviceToken) return meta;
      if (registerInFlight) return registerInFlight;

      registerInFlight = (async () => {
        const res = await apiCall("/v1/register", {
          method: "POST",
          body: { nickname }
        });
        const next = {
          playerId: res.playerId || "",
          deviceToken: res.deviceToken || "",
          syncCode: res.syncCode || "",
          lastSyncAt: readCloudMeta().lastSyncAt || 0
        };
        writeCloudMeta(next);
        return next;
      })();

      try {
        return await registerInFlight;
      } finally {
        registerInFlight = null;
      }
    },

    async submitScore({ mode, dateKey, score, nickname = "", runDurationSec = 30 }) {
      const meta = await MochiCloud.ensureRegistered(nickname);
      return apiCall("/v1/score", {
        method: "POST",
        body: {
          playerId: meta.playerId,
          deviceToken: meta.deviceToken,
          nickname,
          mode,
          dateKey,
          score: Math.max(0, Math.floor(score || 0)),
          runDurationSec: Math.max(1, Math.floor(runDurationSec || 30))
        }
      });
    },

    async fetchLeaderboard({ mode = "daily", dateKey = "all" } = {}) {
      const meta = readCloudMeta();
      const params = new URLSearchParams({ mode, dateKey });
      if (meta.playerId) params.set("playerId", meta.playerId);
      const res = await apiCall(`/v1/leaderboard?${params.toString()}`, { method: "GET" });
      const rows = (res.rows || []).map((r) => ({
        rank: r.rank,
        playerId: r.playerId,
        name: r.name || "MochiFan",
        score: r.score || 0,
        isPlayer: Boolean(meta.playerId && r.playerId === meta.playerId),
        tier: resolveServerTier(r.tier, r.score)
      }));
      return {
        rows,
        myEntry: res.myEntry
          ? {
              rank: res.myEntry.rank,
              score: res.myEntry.score,
              tier: resolveServerTier(res.myEntry.tier, res.myEntry.score)
            }
          : null,
        playerId: meta.playerId
      };
    },

    async syncSave(savePayload, nickname = "") {
      const meta = await MochiCloud.ensureRegistered(nickname);
      const res = await apiCall("/v1/save", {
        method: "POST",
        body: {
          playerId: meta.playerId,
          deviceToken: meta.deviceToken,
          clientTs: Date.now(),
          saveData: savePayload
        }
      });
      const updated = Object.assign({}, readCloudMeta(), {
        lastSyncAt: res.updatedAt || Date.now()
      });
      writeCloudMeta(updated);
      return updated;
    },

    async restoreByCode(syncCode) {
      const clean = String(syncCode || "").trim().toUpperCase();
      const res = await apiCall("/v1/restore", {
        method: "POST",
        body: { syncCode: clean }
      });
      const next = {
        playerId: res.playerId || "",
        deviceToken: res.deviceToken || "",
        syncCode: res.syncCode || clean,
        lastSyncAt: res.saveUpdatedAt || Date.now()
      };
      writeCloudMeta(next);
      return {
        meta: next,
        nickname: res.nickname || "",
        saveData: res.saveData || null
      };
    },

    async updateNickname(nickname, cacheDateKeys = []) {
      const meta = readCloudMeta();
      if (!meta.playerId || !meta.deviceToken) return { ok: false, skipped: true };
      return apiCall("/v1/profile", {
        method: "POST",
        body: {
          playerId: meta.playerId,
          deviceToken: meta.deviceToken,
          nickname,
          cacheDateKeys
        }
      });
    },

    async checkHealth() {
      const t0 = Date.now();
      const res = await apiCall("/v1/health", { method: "GET" }, 5000);
      return {
        ok: Boolean(res && res.ok),
        service: (res && res.service) || "mochi-pop-api",
        latencyMs: Math.max(1, Date.now() - t0)
      };
    },

    async deleteCloudAccount(cacheDateKeys = []) {
      const meta = readCloudMeta();
      if (meta.playerId && meta.deviceToken) {
        await apiCall("/v1/account/delete", {
          method: "POST",
          body: {
            playerId: meta.playerId,
            deviceToken: meta.deviceToken,
            cacheDateKeys
          }
        });
      }
      try {
        localStorage.removeItem(CLOUD_META_KEY);
      } catch (_) {}
      return { ok: true, deleted: true };
    }
  };

  global.MochiMonetization = {
    ALBUM_SETS,
    WHEEL_WEDGES,
    loadRemoteConfig,
    mergeRemoteConfig,
    MochiAnalytics,
    canShowInterstitial,
    computeFriendLevel,
    getActiveMiniEvent,
    pickRandomAlbumCard,
    pickAlbumCardWithPity,
    getLeagueTier,
    getWeekKey,
    generateLeaderboardRows,
    MochiCloud
  };
})(window);
