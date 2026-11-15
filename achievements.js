/**
 * Mochi Pop! Achievements & Trophy Room Module (v0.7.0)
 * Evaluates permanent player milestones and awards claimable Fish medals!
 */
(function (global) {
  const ACHIEVEMENTS = [
    {
      id: "lines_50",
      icon: "🧱",
      titleKey: "ach_lines_50_t",
      fallbackTitle: "Line Apprentice",
      descKey: "ach_lines_50_d",
      fallbackDesc: "Clear 50 lines total",
      target: 50,
      rewardFish: 4,
      measure: (s) => Number(s.statsTotalLines || 0)
    },
    {
      id: "lines_250",
      icon: "🏗️",
      titleKey: "ach_lines_250_t",
      fallbackTitle: "Grid Architect",
      descKey: "ach_lines_250_d",
      fallbackDesc: "Clear 250 lines total",
      target: 250,
      rewardFish: 8,
      measure: (s) => Number(s.statsTotalLines || 0)
    },
    {
      id: "score_1500",
      icon: "🌟",
      titleKey: "ach_score_1500_t",
      fallbackTitle: "Rising Star",
      descKey: "ach_score_1500_d",
      fallbackDesc: "Reach 1,500 score in Classic",
      target: 1500,
      rewardFish: 4,
      measure: (s) => Number(s.bestScore || 0)
    },
    {
      id: "score_5000",
      icon: "👑",
      titleKey: "ach_score_5000_t",
      fallbackTitle: "Cozy Grandmaster",
      descKey: "ach_score_5000_d",
      fallbackDesc: "Reach 5,000 score in Classic",
      target: 5000,
      rewardFish: 10,
      measure: (s) => Number(s.bestScore || 0)
    },
    {
      id: "combo_4",
      icon: "🔥",
      titleKey: "ach_combo_4_t",
      fallbackTitle: "Combo Whiskers",
      descKey: "ach_combo_4_d",
      fallbackDesc: "Land a 4x Combo streak",
      target: 4,
      rewardFish: 5,
      measure: (s) => Number(s.statsMaxCombo || 0)
    },
    {
      id: "adv_18",
      icon: "🗺️",
      titleKey: "ach_adv_18_t",
      fallbackTitle: "Cozy Explorer",
      descKey: "ach_adv_18_d",
      fallbackDesc: "Earn 18 Story Stars",
      target: 18,
      rewardFish: 6,
      measure: (s) => Object.values(s.adventureStars || {}).reduce((a, b) => a + (Number(b) || 0), 0)
    },
    {
      id: "adv_36",
      icon: "🌠",
      titleKey: "ach_adv_36_t",
      fallbackTitle: "Story Legend",
      descKey: "ach_adv_36_d",
      fallbackDesc: "Earn 36 Story Stars",
      target: 36,
      rewardFish: 10,
      measure: (s) => Object.values(s.adventureStars || {}).reduce((a, b) => a + (Number(b) || 0), 0)
    },
    {
      id: "closet_10",
      icon: "🛍️",
      titleKey: "ach_closet_10_t",
      fallbackTitle: "Fashion Kitty",
      descKey: "ach_closet_10_d",
      fallbackDesc: "Unlock 10 Closet & Room items",
      target: 10,
      rewardFish: 5,
      measure: (s) =>
        Math.max(0, (s.unlockedAcc || []).filter((x) => x !== "none").length) +
        Math.max(0, (s.unlockedSkins || []).length - 1) +
        Math.max(0, (s.unlockedCollars || []).filter((x) => x !== "none" && x !== "red_bell").length) +
        Math.max(0, (s.unlockedToys || []).length - 1) +
        (s.unlockedGadgets || []).length +
        Math.max(0, (s.unlockedThemes || []).length - 1) +
        Math.max(0, (s.unlockedTileSkins || []).length - 1) +
        Math.max(0, (s.unlockedDecors || []).length - 1)
    },
    {
      id: "album_6",
      icon: "📸",
      titleKey: "ach_album_6_t",
      fallbackTitle: "Memory Keeper",
      descKey: "ach_album_6_d",
      fallbackDesc: "Collect 6 Sticker Album cards",
      target: 6,
      rewardFish: 5,
      measure: (s) => (s.albumCards || []).length
    },
    {
      id: "friend_15",
      icon: "💖",
      titleKey: "ach_friend_15_t",
      fallbackTitle: "Soulmates",
      descKey: "ach_friend_15_d",
      fallbackDesc: "Reach Friendship Lv.15",
      target: 15,
      rewardFish: 8,
      measure: (s) => {
        if (global.MochiMonetization && typeof global.MochiMonetization.computeFriendLevel === "function") {
          return global.MochiMonetization.computeFriendLevel(s.friendXp || 0).level;
        }
        return 1;
      }
    }
  ];

  function evaluate(appState) {
    const claimed = new Set((appState && appState.claimedAchievements) || []);
    return ACHIEVEMENTS.map((a) => {
      const val = Math.max(0, Math.floor(a.measure(appState || {}) || 0));
      const completed = val >= a.target;
      const isClaimed = claimed.has(a.id);
      return {
        ...a,
        progress: Math.min(a.target, val),
        completed,
        claimed: isClaimed,
        claimable: completed && !isClaimed
      };
    });
  }

  function countClaimable(appState) {
    return evaluate(appState).filter((a) => a.claimable).length;
  }

  function claim(appState, achId) {
    if (!appState) return null;
    const list = evaluate(appState);
    const target = list.find((a) => a.id === achId && a.claimable);
    if (!target) return null;
    appState.claimedAchievements = appState.claimedAchievements || [];
    appState.claimedAchievements.push(target.id);
    appState.treats = (appState.treats || 0) + target.rewardFish;
    return target;
  }

  global.MochiAchievements = {
    ACHIEVEMENTS,
    evaluate,
    countClaimable,
    claim
  };
})(window);
