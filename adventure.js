/**
 * Mochi Pop! Adventure Chapters Module (v0.6.0)
 * 3 Cozy Chapters x 4 Curated Stages = 12 Deterministic Goal Levels
 */
(function (global) {
  const CHAPTERS = [
    { id: "morning", titleKey: "adv_ch_morning", fallbackTitle: "Cozy Morning", icon: "☀️" },
    { id: "frost", titleKey: "adv_ch_frost", fallbackTitle: "Frosty Window", icon: "❄️" },
    { id: "attic", titleKey: "adv_ch_attic", fallbackTitle: "Starry Attic", icon: "🌙" },
    { id: "garden", titleKey: "adv_ch_garden", fallbackTitle: "Garden Terrace", icon: "🌿" },
    { id: "loft", titleKey: "adv_ch_loft", fallbackTitle: "Moonlit Loft", icon: "🌠" }
  ];

  // Pattern helpers keep grids balanced and playable from move 1
  const LEVELS = [
    {
      id: 1,
      chapter: "morning",
      nameKey: "adv_lv_1",
      fallbackName: "Sunny Warmup",
      moves: 12,
      goal: { type: "lines", target: 3 },
      rewardFish: 3,
      preset: [
        [2, 1, 0], [2, 2, 0], [2, 5, 1], [2, 6, 1],
        [5, 0, 2], [5, 1, 2], [5, 3, 3], [5, 4, 3], [5, 6, 4], [5, 7, 4]
      ],
      iceCells: [],
      fishCells: [[5, 3], [2, 5]]
    },
    {
      id: 2,
      chapter: "morning",
      nameKey: "adv_lv_2",
      fallbackName: "Golden Bowl",
      moves: 14,
      goal: { type: "fish", target: 4 },
      rewardFish: 4,
      preset: [
        [3, 1, 1], [3, 2, 1], [3, 5, 2], [3, 6, 2],
        [4, 2, 4], [4, 3, 4], [4, 4, 5], [4, 5, 5]
      ],
      iceCells: [],
      fishCells: [[3, 1], [3, 6], [4, 3], [4, 4]]
    },
    {
      id: 3,
      chapter: "morning",
      nameKey: "adv_lv_3",
      fallbackName: "Crisp Combo",
      moves: 14,
      goal: { type: "score", target: 900 },
      rewardFish: 4,
      preset: [
        [1, 3, 0], [1, 4, 0],
        [3, 0, 3], [3, 1, 3], [3, 6, 3], [3, 7, 3],
        [6, 2, 5], [6, 3, 5], [6, 4, 2], [6, 5, 2]
      ],
      iceCells: [],
      fishCells: [[3, 1], [6, 4]]
    },
    {
      id: 4,
      chapter: "morning",
      nameKey: "adv_lv_4",
      fallbackName: "Morning Feast",
      moves: 15,
      goal: { type: "fish", target: 6 },
      rewardFish: 5,
      preset: [
        [2, 2, 0], [2, 3, 0], [2, 4, 1], [2, 5, 1],
        [4, 1, 2], [4, 6, 2],
        [5, 2, 4], [5, 3, 4], [5, 4, 5], [5, 5, 5]
      ],
      iceCells: [],
      fishCells: [[2, 2], [2, 5], [4, 1], [4, 6], [5, 3], [5, 4]]
    },
    {
      id: 5,
      chapter: "frost",
      nameKey: "adv_lv_5",
      fallbackName: "First Frost",
      moves: 15,
      goal: { type: "ice", target: 4 },
      rewardFish: 5,
      preset: [
        [3, 2, 1], [3, 3, 1], [3, 4, 3], [3, 5, 3],
        [4, 2, 4], [4, 3, 4], [4, 4, 5], [4, 5, 5]
      ],
      iceCells: [[3, 2], [3, 5], [4, 3], [4, 4]],
      fishCells: [[3, 3], [4, 5]]
    },
    {
      id: 6,
      chapter: "frost",
      nameKey: "adv_lv_6",
      fallbackName: "Icebreaker",
      moves: 16,
      goal: { type: "ice", target: 6 },
      rewardFish: 6,
      preset: [
        [2, 1, 0], [2, 2, 0], [2, 5, 2], [2, 6, 2],
        [4, 1, 3], [4, 3, 3], [4, 4, 4], [4, 6, 4],
        [5, 2, 5], [5, 5, 5]
      ],
      iceCells: [[2, 1], [2, 6], [4, 1], [4, 3], [4, 4], [4, 6]],
      fishCells: [[5, 2], [5, 5]]
    },
    {
      id: 7,
      chapter: "frost",
      nameKey: "adv_lv_7",
      fallbackName: "Chilled Tuna",
      moves: 16,
      goal: { type: "fish", target: 6 },
      rewardFish: 6,
      preset: [
        [2, 3, 1], [2, 4, 1],
        [3, 1, 2], [3, 2, 2], [3, 5, 3], [3, 6, 3],
        [5, 2, 4], [5, 3, 4], [5, 4, 5], [5, 5, 5]
      ],
      iceCells: [[2, 3], [2, 4], [5, 3], [5, 4]],
      fishCells: [[3, 1], [3, 2], [3, 5], [3, 6], [5, 2], [5, 5]]
    },
    {
      id: 8,
      chapter: "frost",
      nameKey: "adv_lv_8",
      fallbackName: "Blizzard Clear",
      moves: 16,
      goal: { type: "score", target: 1400 },
      rewardFish: 7,
      preset: [
        [1, 2, 0], [1, 5, 0],
        [3, 2, 3], [3, 3, 3], [3, 4, 4], [3, 5, 4],
        [4, 2, 1], [4, 3, 1], [4, 4, 2], [4, 5, 2],
        [6, 2, 5], [6, 5, 5]
      ],
      iceCells: [[3, 3], [3, 4], [4, 3], [4, 4]],
      fishCells: [[3, 2], [4, 5], [6, 2]]
    },
    {
      id: 9,
      chapter: "attic",
      nameKey: "adv_lv_9",
      fallbackName: "Moonlit Rows",
      moves: 15,
      goal: { type: "lines", target: 6 },
      rewardFish: 7,
      preset: [
        [2, 0, 2], [2, 1, 2], [2, 6, 2], [2, 7, 2],
        [4, 2, 4], [4, 3, 4], [4, 4, 5], [4, 5, 5],
        [6, 1, 1], [6, 6, 1]
      ],
      iceCells: [[4, 3], [4, 4]],
      fishCells: [[2, 1], [2, 6]]
    },
    {
      id: 10,
      chapter: "attic",
      nameKey: "adv_lv_10",
      fallbackName: "Glacier Vault",
      moves: 18,
      goal: { type: "ice", target: 8 },
      rewardFish: 8,
      preset: [
        [2, 2, 1], [2, 3, 1], [2, 4, 3], [2, 5, 3],
        [3, 1, 0], [3, 6, 0],
        [4, 1, 2], [4, 6, 2],
        [5, 2, 4], [5, 3, 4], [5, 4, 5], [5, 5, 5]
      ],
      iceCells: [[2, 2], [2, 3], [2, 4], [2, 5], [5, 2], [5, 3], [5, 4], [5, 5]],
      fishCells: [[3, 1], [3, 6], [4, 1], [4, 6]]
    },
    {
      id: 11,
      chapter: "attic",
      nameKey: "adv_lv_11",
      fallbackName: "Star Catcher",
      moves: 17,
      goal: { type: "fish", target: 8 },
      rewardFish: 9,
      preset: [
        [1, 3, 0], [1, 4, 0],
        [3, 0, 3], [3, 2, 3], [3, 5, 4], [3, 7, 4],
        [5, 1, 1], [5, 3, 1], [5, 4, 5], [5, 6, 5],
        [6, 2, 2], [6, 5, 2]
      ],
      iceCells: [[3, 2], [3, 5], [5, 3], [5, 4]],
      fishCells: [[1, 3], [1, 4], [3, 0], [3, 7], [5, 1], [5, 6], [6, 2], [6, 5]]
    },
    {
      id: 12,
      chapter: "attic",
      nameKey: "adv_lv_12",
      fallbackName: "Attic Finale",
      moves: 18,
      goal: { type: "score", target: 2200 },
      rewardFish: 12,
      preset: [
        [2, 1, 0], [2, 2, 0], [2, 5, 2], [2, 6, 2],
        [3, 3, 3], [3, 4, 3],
        [4, 3, 4], [4, 4, 4],
        [5, 1, 5], [5, 2, 5], [5, 5, 1], [5, 6, 1]
      ],
      iceCells: [[3, 3], [3, 4], [4, 3], [4, 4]],
      fishCells: [[2, 2], [2, 5], [5, 2], [5, 5]]
    },
    {
      id: 13,
      chapter: "garden",
      nameKey: "adv_lv_13",
      fallbackName: "Berry Harvest",
      moves: 16,
      goal: { type: "color", colorName: "strawberry", target: 10 },
      rewardFish: 8,
      preset: [
        [2, 1, 0], [2, 2, 0], [2, 5, 0], [2, 6, 0],
        [4, 2, 3], [4, 3, 0], [4, 4, 0], [4, 5, 3],
        [5, 1, 0], [5, 6, 0]
      ],
      iceCells: [],
      crateCells: [[4, 2], [4, 5]],
      fishCells: [[2, 2], [2, 5]]
    },
    {
      id: 14,
      chapter: "garden",
      nameKey: "adv_lv_14",
      fallbackName: "Crate Cracker",
      moves: 17,
      goal: { type: "ice", target: 8 },
      rewardFish: 9,
      preset: [
        [2, 2, 3], [2, 3, 3], [2, 4, 1], [2, 5, 1],
        [3, 1, 0], [3, 6, 0],
        [4, 2, 4], [4, 3, 4], [4, 4, 5], [4, 5, 5]
      ],
      iceCells: [[2, 2], [2, 5], [4, 2], [4, 5]],
      crateCells: [[2, 3], [2, 4], [4, 3], [4, 4]],
      fishCells: [[3, 1], [3, 6]]
    },
    {
      id: 15,
      chapter: "garden",
      nameKey: "adv_lv_15",
      fallbackName: "Mint Breeze",
      moves: 17,
      goal: { type: "color", colorName: "mint", target: 12 },
      rewardFish: 10,
      preset: [
        [1, 2, 3], [1, 5, 3],
        [3, 1, 3], [3, 2, 3], [3, 5, 3], [3, 6, 3],
        [5, 2, 2], [5, 3, 3], [5, 4, 3], [5, 5, 2]
      ],
      iceCells: [[3, 2], [3, 5]],
      crateCells: [[5, 2], [5, 5]],
      fishCells: [[1, 2], [1, 5]]
    },
    {
      id: 16,
      chapter: "garden",
      nameKey: "adv_lv_16",
      fallbackName: "Garden Finale",
      moves: 18,
      goal: { type: "score", target: 2600 },
      rewardFish: 14,
      preset: [
        [2, 1, 0], [2, 2, 0], [2, 5, 3], [2, 6, 3],
        [3, 3, 4], [3, 4, 4],
        [4, 3, 5], [4, 4, 5],
        [5, 1, 1], [5, 2, 1], [5, 5, 2], [5, 6, 2]
      ],
      iceCells: [[3, 3], [3, 4]],
      crateCells: [[4, 3], [4, 4]],
      fishCells: [[2, 1], [2, 6], [5, 2], [5, 5]]
    },
    {
      id: 17,
      chapter: "loft",
      nameKey: "adv_lv_17",
      fallbackName: "Moonbeam Steps",
      moves: 18,
      goal: { type: "lines", target: 10 },
      rewardFish: 10,
      preset: [
        [1, 1, 4], [1, 2, 4], [1, 5, 5], [1, 6, 5],
        [4, 0, 2], [4, 3, 2], [4, 4, 2], [4, 7, 2],
        [6, 2, 0], [6, 5, 0]
      ],
      iceCells: [[4, 3], [4, 4]],
      crateCells: [[1, 2], [1, 5]],
      fishCells: [[6, 2], [6, 5]]
    },
    {
      id: 18,
      chapter: "loft",
      nameKey: "adv_lv_18",
      fallbackName: "Blueberry Crate",
      moves: 18,
      goal: { type: "color", colorName: "blueberry", target: 14 },
      rewardFish: 11,
      preset: [
        [2, 1, 4], [2, 2, 4], [2, 5, 4], [2, 6, 4],
        [4, 2, 4], [4, 3, 5], [4, 4, 5], [4, 5, 4],
        [6, 1, 4], [6, 6, 4]
      ],
      iceCells: [[4, 3], [4, 4]],
      crateCells: [[2, 2], [2, 5], [4, 2], [4, 5]],
      fishCells: [[2, 1], [2, 6]]
    },
    {
      id: 19,
      chapter: "loft",
      nameKey: "adv_lv_19",
      fallbackName: "Astral Pantry",
      moves: 19,
      goal: { type: "fish", target: 10 },
      rewardFish: 12,
      preset: [
        [1, 2, 2], [1, 5, 2],
        [3, 1, 0], [3, 3, 4], [3, 4, 4], [3, 6, 0],
        [5, 1, 3], [5, 3, 5], [5, 4, 5], [5, 6, 3],
        [6, 2, 1], [6, 5, 1]
      ],
      iceCells: [[3, 3], [3, 4], [5, 3], [5, 4]],
      crateCells: [[3, 1], [3, 6]],
      fishCells: [[1, 2], [1, 5], [3, 3], [3, 4], [5, 1], [5, 6], [6, 2], [6, 5]]
    },
    {
      id: 20,
      chapter: "loft",
      nameKey: "adv_lv_20",
      fallbackName: "Starlight Grand",
      moves: 20,
      goal: { type: "score", target: 3200 },
      rewardFish: 18,
      preset: [
        [1, 1, 5], [1, 6, 5],
        [2, 2, 4], [2, 3, 4], [2, 4, 4], [2, 5, 4],
        [5, 2, 0], [5, 3, 0], [5, 4, 0], [5, 5, 0],
        [6, 1, 2], [6, 6, 2]
      ],
      iceCells: [[2, 3], [2, 4], [5, 3], [5, 4]],
      crateCells: [[2, 2], [2, 5], [5, 2], [5, 5]],
      fishCells: [[1, 1], [1, 6], [6, 1], [6, 6]]
    }
  ];

  function getChapters() {
    return CHAPTERS;
  }

  function getLevels() {
    return LEVELS;
  }

  function getLevelById(id) {
    const num = Number(id) || 1;
    return LEVELS.find((lv) => lv.id === num) || null;
  }

  function computeStars(level, movesRemaining) {
    if (!level) return 1;
    const rem = Math.max(0, Number(movesRemaining) || 0);
    if (rem >= Math.max(3, Math.ceil(level.moves * 0.4))) return 3;
    if (rem >= Math.max(1, Math.ceil(level.moves * 0.2))) return 2;
    return 1;
  }

  function getTotalStars(starsMap) {
    if (!starsMap || typeof starsMap !== "object") return 0;
    return Object.values(starsMap).reduce((sum, s) => sum + (Number(s) || 0), 0);
  }

  function getHighestUnlockedLevelId(starsMap) {
    let highest = 1;
    for (const lv of LEVELS) {
      if (starsMap && Number(starsMap[String(lv.id)] || 0) > 0) {
        highest = Math.max(highest, Math.min(LEVELS.length, lv.id + 1));
      }
    }
    return highest;
  }

  global.MochiAdventure = {
    CHAPTERS,
    LEVELS,
    getChapters,
    getLevels,
    getLevelById,
    computeStars,
    getTotalStars,
    getHighestUnlockedLevelId
  };
})(window);
