/**
 * Monthly Daily Challenge Calendar Archive & Milestone Rewards for Mochi Pop!
 * Allows replaying missed seeded boards from the current month (for Fish or Watch Ad)
 * and awards monthly completion milestones.
 */
(function (global) {
  const ARCHIVE_REPLAY_FISH_COST = 15;
  const MONTHLY_MILESTONES = [
    { days: 7, rewardFish: 25, icon: "🌟" },
    { days: 15, rewardFish: 60, icon: "🏅" },
    { days: "full", rewardFish: 150, icon: "👑" }
  ];

  function getMonthInfo(todayKey) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(todayKey || ""));
    if (!m) {
      const now = new Date();
      return getMonthInfo(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
      );
    }
    const year = Number(m[1]);
    const month = Number(m[2]); // 1..12
    const todayDay = Number(m[3]);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstWeekdayMon = (new Date(year, month - 1, 1).getDay() + 6) % 7; // 0=Mon..6=Sun
    const monthPrefix = `${m[1]}-${m[2]}`;
    const label = new Date(year, month - 1, 15).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric"
    });
    return { year, month, todayDay, daysInMonth, firstWeekdayMon, monthPrefix, label };
  }

  function getCompletedInMonth(completedMap, monthPrefix, daysInMonth) {
    const map = completedMap || {};
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${monthPrefix}-${String(d).padStart(2, "0")}`;
      if (map[key] != null) count++;
    }
    return count;
  }

  function claimReadyMilestones(appState, todayKey) {
    const info = getMonthInfo(todayKey);
    const completedCount = getCompletedInMonth(
      appState.dailyCompletedDates,
      info.monthPrefix,
      info.daysInMonth
    );
    appState.claimedArchiveMilestones = appState.claimedArchiveMilestones || [];
    const newlyClaimed = [];
    for (const ms of MONTHLY_MILESTONES) {
      const req = ms.days === "full" ? info.daysInMonth : ms.days;
      const msId = `${info.monthPrefix}:${req}`;
      if (completedCount >= req && !appState.claimedArchiveMilestones.includes(msId)) {
        appState.claimedArchiveMilestones.push(msId);
        appState.treats = (appState.treats || 0) + ms.rewardFish;
        newlyClaimed.push({ id: msId, days: req, rewardFish: ms.rewardFish, icon: ms.icon });
      }
    }
    return newlyClaimed;
  }

  function renderArchivePane({
    container,
    summaryEl,
    milestonesEl,
    appState,
    todayKey,
    i18n,
    onStartDay
  }) {
    if (!container) return;
    const info = getMonthInfo(todayKey);
    const completedMap = appState.dailyCompletedDates || {};
    const doneCount = getCompletedInMonth(completedMap, info.monthPrefix, info.daysInMonth);

    if (summaryEl) {
      summaryEl.textContent = `${info.label} • ${doneCount}/${info.daysInMonth} ✅`;
    }

    if (milestonesEl) {
      milestonesEl.innerHTML = "";
      const claimed = appState.claimedArchiveMilestones || [];
      MONTHLY_MILESTONES.forEach((ms) => {
        const req = ms.days === "full" ? info.daysInMonth : ms.days;
        const msId = `${info.monthPrefix}:${req}`;
        const hit = claimed.includes(msId) || doneCount >= req;
        const pill = document.createElement("span");
        pill.className = `archive-ms-pill${hit ? " is-done" : ""}`;
        pill.textContent = `${ms.icon} ${req}d → +${ms.rewardFish}🐟`;
        milestonesEl.appendChild(pill);
      });
    }

    container.innerHTML = "";
    // Blank leading cells for Monday-first grid alignment
    for (let b = 0; b < info.firstWeekdayMon; b++) {
      const empty = document.createElement("div");
      empty.className = "archive-cell is-pad";
      container.appendChild(empty);
    }

    for (let day = 1; day <= info.daysInMonth; day++) {
      const dateKey = `${info.monthPrefix}-${String(day).padStart(2, "0")}`;
      const bestScore = completedMap[dateKey];
      const isDone = bestScore != null;
      const isToday = day === info.todayDay;
      const isFuture = day > info.todayDay;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `archive-cell${isDone ? " is-done" : ""}${isToday ? " is-today" : ""}${isFuture ? " is-future" : " is-missed"}`;
      btn.disabled = isFuture;
      btn.dataset.dateKey = dateKey;

      const badge = isDone ? "✅" : isToday ? "▶" : isFuture ? "🔒" : "🐟";
      btn.innerHTML = `
        <span class="archive-day-num">${day}</span>
        <span class="archive-day-badge">${badge}</span>
        ${isDone ? `<span class="archive-day-score">${bestScore}</span>` : ""}
      `;

      if (!isFuture) {
        btn.title = isDone
          ? `${dateKey} (${bestScore})`
          : isToday
            ? i18n("archive_play_today")
            : i18n("archive_replay_tip", { cost: ARCHIVE_REPLAY_FISH_COST });
        btn.addEventListener("click", () => {
          if (typeof onStartDay === "function") {
            onStartDay({ dateKey, isToday, isDone, cost: isToday || isDone ? 0 : ARCHIVE_REPLAY_FISH_COST });
          }
        });
      }
      container.appendChild(btn);
    }
  }

  global.MochiDailyArchive = {
    ARCHIVE_REPLAY_FISH_COST,
    MONTHLY_MILESTONES,
    getMonthInfo,
    getCompletedInMonth,
    claimReadyMilestones,
    renderArchivePane
  };
})(window);
