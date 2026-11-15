/**
 * Weekly Purr League Season Rewards helper for Mochi Pop!
 * Tracks ISO week participation, fetches prior-week placement from Cloudflare D1
 * (or offline tier fallback), and lets players claim end-of-season Fish & Trophy rewards.
 */
(function (global) {
  function getPreviousWeekKey(todayKey) {
    const d = todayKey ? new Date(`${todayKey}T12:00:00Z`) : new Date();
    if (Number.isNaN(d.getTime())) return "2026-W01";
    d.setUTCDate(d.getUTCDate() - 7);
    const Mon = global.MochiMonetization;
    if (Mon && typeof Mon.getWeekKey === "function") {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return Mon.getWeekKey(`${y}-${m}-${day}`);
    }
    return `${d.getUTCFullYear()}-W01`;
  }

  function computeSeasonReward(rank, score) {
    const r = Number(rank || 0);
    if (r === 1) return { fish: 60, trophy: true, label: "🥇 #1 Champion" };
    if (r >= 2 && r <= 3) return { fish: 40, trophy: true, label: `🥈 #${r} Podium` };
    if (r >= 4 && r <= 10) return { fish: 25, trophy: false, label: `🏅 #${r} Top 10` };

    const s = Number(score || 0);
    if (s >= 2500) return { fish: 24, trophy: false, label: "💎 Diamond Tier" };
    if (s >= 1500) return { fish: 18, trophy: false, label: "🥇 Gold Tier" };
    if (s >= 700) return { fish: 14, trophy: false, label: "🥈 Silver Tier" };
    return { fish: 10, trophy: false, label: "🥉 Bronze Tier" };
  }

  function recordWeeklyParticipation(appState, weekKey, score) {
    if (!appState || !weekKey || !score || score <= 0) return;
    appState.leagueWeeklyBest = appState.leagueWeeklyBest || {};
    appState.leagueWeeklyBest[weekKey] = Math.max(appState.leagueWeeklyBest[weekKey] || 0, Math.floor(score));
  }

  async function checkClaimableSeason(appState, todayKey) {
    const prevWeek = getPreviousWeekKey(todayKey);
    const claimed = appState.claimedLeagueWeeks || [];
    if (claimed.includes(prevWeek)) return null;

    const localScore = (appState.leagueWeeklyBest && appState.leagueWeeklyBest[prevWeek]) || 0;
    const Mon = global.MochiMonetization;
    let rank = 0;
    let score = localScore;

    if (Mon && Mon.MochiCloud && Mon.MochiCloud.getMeta().playerId) {
      try {
        const res = await Mon.MochiCloud.fetchLeaderboard({ mode: "weekly", dateKey: prevWeek });
        if (res && res.myEntry && res.myEntry.score > 0) {
          rank = res.myEntry.rank || 0;
          score = Math.max(score, res.myEntry.score || 0);
        }
      } catch (_) {}
    }

    if (score <= 0) return null;
    const reward = computeSeasonReward(rank, score);
    return { weekKey: prevWeek, rank, score, ...reward };
  }

  function applySeasonClaim(appState, seasonInfo) {
    if (!appState || !seasonInfo || !seasonInfo.weekKey) return false;
    appState.claimedLeagueWeeks = appState.claimedLeagueWeeks || [];
    if (appState.claimedLeagueWeeks.includes(seasonInfo.weekKey)) return false;
    appState.claimedLeagueWeeks.push(seasonInfo.weekKey);
    appState.treats = (appState.treats || 0) + (seasonInfo.fish || 0);
    if (seasonInfo.trophy) {
      appState.seasonTrophies = (appState.seasonTrophies || 0) + 1;
    }
    return true;
  }

  global.MochiLeagueRewards = {
    getPreviousWeekKey,
    computeSeasonReward,
    recordWeeklyParticipation,
    checkClaimableSeason,
    applySeasonClaim
  };
})(window);
