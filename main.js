/**
 * Game Controller: Links MochiPet, PuzzleEngine, SoundEngine, Offline Hunger/Sulking,
 * Wardrobe Cosmetics, and Simulated AdMob Rewarded Ads.
 */
(function () {
  const SAVE_KEY = "mochi_pop_save_v1";
  const UPDATE_META_KEY = "mochi_pop_update_meta_v1";
  const ONBOARD_KEY = "mochi_pop_onboarded_v030";
  const APP_VERSION = "1.0.1";
  const SUPPORT_EMAIL = "support@jemangr.app";
  const UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
  const RELEASES_API_URL = "https://api.github.com/repos/jemangr/mochi-pop-puzzle-releases/releases/latest";
  const VERSION_JSON_FALLBACK_URL = "https://raw.githubusercontent.com/jemangr/mochi-pop-puzzle-releases/main/version.json";
  const FALLBACK_APK_URL = "https://github.com/jemangr/mochi-pop-puzzle-releases/releases/latest/download/mochi-pop-puzzle.apk";

  const errorLog = [];
  function recordError(source, msg) {
    const entry = `[${new Date().toISOString()}] (${source}) ${msg}`;
    errorLog.push(entry);
    if (errorLog.length > 12) errorLog.shift();
  }
  window.addEventListener("error", (e) => {
    recordError("onerror", e.message || "Unknown error");
  });
  window.addEventListener("unhandledrejection", (e) => {
    recordError("promise", String(e.reason || "Unhandled rejection"));
  });

  const SKINS = [
    { id: "orange", name: "Orange Tabby", icon: "🧡", cost: 0 },
    { id: "calico", name: "Calico", icon: "🤍", cost: 6 },
    { id: "latte", name: "Latte", icon: "🤎", cost: 10 },
    { id: "tuxedo", name: "Tuxedo", icon: "🖤", cost: 14 }
  ];

  const ACCESSORIES = [
    { id: "none", name: "No Hat", icon: "🐱", cost: 0 },
    { id: "bow", name: "Pink Bow", icon: "🎀", cost: 4 },
    { id: "blossom", name: "Sakura Clip", icon: "🌸", cost: 7 },
    { id: "strawberry", name: "Berry Hat", icon: "🍓", cost: 8 },
    { id: "scarf", name: "Cozy Scarf", icon: "🧣", cost: 10 },
    { id: "headphones", name: "Cozy Beats", icon: "🎧", cost: 0, unlockType: "ad", desc: "Free with Ad" },
    { id: "shades", name: "Cool Shades", icon: "🕶️", cost: 12, unlockAltAd: 3 },
    { id: "chef", name: "Chef Hat", icon: "👨‍🍳", cost: 14 },
    { id: "bear", name: "Bear Hood", icon: "🧸", cost: 18 },
    { id: "crown", name: "King Crown", icon: "👑", cost: 20, unlockAltAd: 4 },
    { id: "wizard", name: "Star Wizard", icon: "🧙", cost: 0, unlockType: "streak", reqStreak: 7, desc: "7-Day Streak Goal" }
  ];

  const COLLARS = [
    { id: "red_bell", name: "Red Bell", icon: "🔔", cost: 0 },
    { id: "pastel_bell", name: "Pastel Bell", icon: "💜", cost: 6 },
    { id: "star_bell", name: "Star Bell", icon: "⭐", cost: 0, unlockType: "streak", reqStreak: 3, desc: "3-Day Streak Goal" },
    { id: "none", name: "No Collar", icon: "✨", cost: 0 }
  ];

  const TOYS = [
    { id: "yarn", name: "Yarn Ball", icon: "🧶", cost: 0, moodGain: 4, desc: "Classic cozy yarn" },
    { id: "mouse", name: "Wind-Up Mouse", icon: "🐁", cost: 8, moodGain: 6, desc: "Darts across floor" },
    { id: "squeaky", nameKey: "toy_squeaky_name", name: "Squeezy Ball", icon: "🟡", cost: 10, unlockAltAd: 2, moodGain: 7, descKey: "toy_squeaky_desc", desc: "Bouncy rubber squeaker" },
    { id: "feather", name: "Feather Wand", icon: "🪶", cost: 0, unlockType: "ad", moodGain: 8, desc: "Free Ad toy" },
    { id: "laser", name: "Laser Pointer", icon: "🔴", cost: 14, moodGain: 8, desc: "Chases red dot" }
  ];

  const DECORS = [
    { id: "pink", name: "Pink Rug", icon: "🌸", cost: 0 },
    { id: "star", name: "Starry Rug", icon: "🌟", cost: 8 },
    { id: "box", name: "Cozy Box", icon: "📦", cost: 12 }
  ];

  const GADGETS = [
    { id: "fountain", name: "Water Fountain", icon: "⛲", cost: 0, unlockType: "ad", desc: "-30% decay • Tap sip" },
    { id: "feeder", name: "Snack Dispenser", icon: "🥣", cost: 0, unlockType: "multi_ad", reqAds: 3, desc: "Day 5 or 3 Ads • Daily snack" },
    { id: "bird_feeder", name: "Window Bird Feeder", icon: "🐦", cost: 0, unlockType: "multi_ad", reqAds: 2, desc: "Chirping mood boost" },
    { id: "cushion", name: "Heated Cushion", icon: "🛏️", cost: 16, desc: "Warm cozy nap spot" },
    { id: "wheel", name: "Scratching Wheel", icon: "🎡", cost: 0, unlockType: "multi_ad", reqAds: 3, desc: "Spin for mood!" },
    { id: "plant", name: "Catnip Plant", icon: "🪴", cost: 10, desc: "Fresh room vibe" },
    { id: "lights", name: "Fairy Lights", icon: "💡", cost: 12, desc: "Warm ceiling glow" },
    { id: "tower", name: "Cat Tower", icon: "🏰", cost: 0, unlockType: "streak", reqStreak: 7, desc: "7-Day Streak Goal" }
  ];

  const THEMES = [
    { id: "peach", name: "Peach Cozy", icon: "🍑", cost: 0, desc: "Warm pastel room" },
    { id: "beach", name: "Sunny Beach", icon: "🏖️", cost: 15, unlockAltAd: 3, desc: "Ocean breeze glow" },
    { id: "winter", name: "Snowy Cozy", icon: "❄️", cost: 15, desc: "Crisp winter warmth" }
  ];

  const TILE_SKINS = [
    { id: "classic", name: "Jelly Gloss", icon: "🍬", cost: 0, desc: "Glossy pastel blocks" },
    { id: "paws", name: "Cat Paws", icon: "🐾", cost: 6, desc: "Cute paw prints on tiles" },
    { id: "cookies", name: "Choco Cookies", icon: "🍪", cost: 10, desc: "Baked frosting & sprinkles" },
    { id: "neon", name: "Cyber Neon", icon: "✨", cost: 12, unlockAltAd: 3, desc: "Glowing arcade blocks" }
  ];

  const DAILY_REWARDS = [
    { day: 1, title: "Cozy Start", fish: 2, adFish: 2, label: "+2 🐟", adLabel: "+2 🐟" },
    { day: 2, title: "Second Day", fish: 3, adFish: 3, label: "+3 🐟", adLabel: "+3 🐟" },
    { day: 3, title: "Star Bell Day", fish: 3, adFish: 3, collar: "star_bell", label: "+3 🐟 + ⭐ Collar", adLabel: "+3 🐟" },
    { day: 4, title: "Midweek Treat", fish: 4, adFish: 4, label: "+4 🐟", adLabel: "+4 🐟" },
    { day: 5, title: "Snack Dispenser!", fish: 4, adFish: 4, gadget: "feeder", label: "+4 🐟 + 🥣 Dispenser", adLabel: "+4 🐟" },
    { day: 6, title: "Almost There!", fish: 5, adFish: 4, label: "+5 🐟", adLabel: "+4 🐟" },
    { day: 7, title: "Grand Prize!", fish: 8, adFish: 6, acc: "wizard", gadget: "tower", label: "+8 🐟 + 🧙 & 🏰!", adLabel: "+6 🐟" }
  ];

  const QUEST_DEFS = [
    { id: "pets", titleKey: "quest_pets", title: "Pet Mochi 5 times", target: 5, reward: 2, sticker: "👑" },
    { id: "plays", titleKey: "quest_plays", title: "Play with Toys 3 times", target: 3, reward: 2, sticker: "🌟" },
    { id: "lines", titleKey: "quest_lines", title: "Clear 5 Puzzle Lines", target: 5, reward: 3, sticker: "💖" },
    { id: "combos", titleKey: "quest_combos", title: "Score 2 Combos", target: 2, reward: 3, sticker: null }
  ];

  const WALL_STICKERS = [
    { id: "🐾", nameKey: "sticker_paw", name: "Paw", reqQuest: null },
    { id: "👑", nameKey: "sticker_crown", name: "Crown", reqQuest: "pets" },
    { id: "🌟", nameKey: "sticker_star", name: "Star", reqQuest: "plays" },
    { id: "💖", nameKey: "sticker_heart", name: "Heart", reqQuest: "lines" }
  ];

  const CRAVINGS = [
    { kind: "lines", target: 2, reward: 2, labelKey: "craving_lines" },
    { kind: "color", color: "strawberry", target: 2, reward: 2, labelKey: "craving_pink" },
    { kind: "combo", target: 2, reward: 3, labelKey: "craving_combo" },
    { kind: "fish", target: 2, reward: 2, labelKey: "craving_fish" },
    { kind: "color", color: "mint", target: 2, reward: 2, labelKey: "craving_mint" }
  ];

  // DOM References
  const scoreVal = document.getElementById("scoreVal");
  const bestVal = document.getElementById("bestVal");
  const streakVal = document.getElementById("streakVal");
  const btnDailyCalendar = document.getElementById("btnDailyCalendar");
  const dailyBadgeDot = document.getElementById("dailyBadgeDot");
  const treatsVal = document.getElementById("treatsVal");
  const feedHint = document.getElementById("feedHint");
  const btnFeed = document.getElementById("btnFeed");
  const btnWardrobe = document.getElementById("btnWardrobe");
  const btnAudio = document.getElementById("btnAudio");
  const btnSettings = document.getElementById("btnSettings");
  const hungerBar = document.getElementById("hungerBar");
  const moodBar = document.getElementById("moodBar");
  const hungerPct = document.getElementById("hungerPct");
  const moodPct = document.getElementById("moodPct");
  const moodIcon = document.getElementById("moodIcon");
  const energyMultPill = document.getElementById("energyMultPill");
  const friendLevelPill = document.getElementById("friendLevelPill");
  const purrRushBadge = document.getElementById("purrRushBadge");
  const btnOverdriveAd = document.getElementById("btnOverdriveAd");
  const btnPlayToy = document.getElementById("btnPlayToy");
  const playToyIcon = document.getElementById("playToyIcon");
  const btnLuckyWheel = document.getElementById("btnLuckyWheel");
  const wheelBadgeDot = document.getElementById("wheelBadgeDot");
  const btnLeague = document.getElementById("btnLeague");
  const btnTrophies = document.getElementById("btnTrophies");
  const trophyBadgeDot = document.getElementById("trophyBadgeDot");
  const eventBannerPill = document.getElementById("eventBannerPill");
  const btnGiftUpgradeAd = document.getElementById("btnGiftUpgradeAd");
  const wallStickerIcon = document.getElementById("wallStickerIcon");
  const petBubble = document.getElementById("petBubble");
  const btnSnackAd = document.getElementById("btnSnackAd");
  const btnReviveFaintedAd = document.getElementById("btnReviveFaintedAd");
  const comboToast = document.getElementById("comboToast");

  const petCanvas = document.getElementById("petCanvas");
  const petStage = document.getElementById("petStage");
  const topHud = document.querySelector(".top-hud");
  const windowCelestial = document.getElementById("windowCelestial");
  const roomRug = document.getElementById("roomRug");
  const boardCanvas = document.getElementById("boardCanvas");
  const fxCanvas = document.getElementById("fxCanvas");
  const slotCanvases = Array.from(document.querySelectorAll(".tray-slot .slot-canvas"));
  const traySlots = Array.from(document.querySelectorAll(".tray-slot"));
  const btnUndoAd = document.getElementById("btnUndoAd");
  const btnRefreshAd = document.getElementById("btnRefreshAd");
  const btnBombAd = document.getElementById("btnBombAd");
  const btnHammer = document.getElementById("btnHammer");
  const hammerCountBadge = document.getElementById("hammerCountBadge");
  const btnHint = document.getElementById("btnHint");
  const hintCountBadge = document.getElementById("hintCountBadge");
  const btnKeyLegend = document.getElementById("btnKeyLegend");
  const cravingPill = document.getElementById("cravingPill");
  const cravingText = document.getElementById("cravingText");
  const boardWrapper = document.getElementById("boardWrapper");
  const btnZenMode = document.getElementById("btnZenMode");
  const btnAdventureMode = document.getElementById("btnAdventureMode");
  const btnDailyMode = document.getElementById("btnDailyMode");
  const btnBlitzMode = document.getElementById("btnBlitzMode");
  const hangingLamp = document.getElementById("hangingLamp");
  const roomWindow = document.getElementById("roomWindow");
  const btnMiniGame = document.getElementById("btnMiniGame");
  const btnPhotoMode = document.getElementById("btnPhotoMode");
  const btnDiary = document.getElementById("btnDiary");
  const btnQuickMiniGame = document.getElementById("btnQuickMiniGame");
  const btnQuickTrophies = document.getElementById("btnQuickTrophies");
  const btnQuickPhoto = document.getElementById("btnQuickPhoto");
  const btnQuickDiary = document.getElementById("btnQuickDiary");
  const holdSlot = document.getElementById("holdSlot");
  const holdCanvas = document.getElementById("holdCanvas");
  const btnRotatePieces = document.getElementById("btnRotatePieces");
  const rotateCountBadge = document.getElementById("rotateCountBadge");

  // Modals
  const gameOverModal = document.getElementById("gameOverModal");
  const goEmoji = document.getElementById("goEmoji");
  const goTitle = document.getElementById("goTitle");
  const goSubtitle = document.getElementById("goSubtitle");
  const goScore = document.getElementById("goScore");
  const goBest = document.getElementById("goBest");
  const goRunSummary = document.getElementById("goRunSummary");
  const runBreakdownCard = document.getElementById("runBreakdownCard");
  const bdLines = document.getElementById("bdLines");
  const bdCombo = document.getElementById("bdCombo");
  const bdSpecials = document.getElementById("bdSpecials");
  const bdGap = document.getElementById("bdGap");
  const btnDoubleRunFishAd = document.getElementById("btnDoubleRunFishAd");
  const goDoubleFishLabel = document.getElementById("goDoubleFishLabel");
  const btnReviveAd = document.getElementById("btnReviveAd");
  const btnRescuePackAd = document.getElementById("btnRescuePackAd");
  const btnShareCard = document.getElementById("btnShareCard");
  const btnChallengeFriend = document.getElementById("btnChallengeFriend");
  const btnRematchSeed = document.getElementById("btnRematchSeed");
  const btnPlayAgain = document.getElementById("btnPlayAgain");

  const wardrobeModal = document.getElementById("wardrobeModal");
  const closetPreviewCanvas = document.getElementById("closetPreviewCanvas");
  const btnClosetPhoto = document.getElementById("btnClosetPhoto");
  const closetSetBanner = document.getElementById("closetSetBanner");
  const closetTabs = document.getElementById("closetTabs");
  const closetFilterChips = document.getElementById("closetFilterChips");
  const closetGrid = document.getElementById("closetGrid");
  const btnCloseWardrobe = document.getElementById("btnCloseWardrobe");

  const adventureModal = document.getElementById("adventureModal");
  const advStarsSummary = document.getElementById("advStarsSummary");
  const adventureList = document.getElementById("adventureList");
  const btnCloseAdventure = document.getElementById("btnCloseAdventure");

  const miniGameModal = document.getElementById("miniGameModal");
  const mgModeChips = document.getElementById("mgModeChips");
  const mgSubText = document.getElementById("mgSubText");
  const mgTimerBadge = document.getElementById("mgTimerBadge");
  const mgScoreBadge = document.getElementById("mgScoreBadge");
  const mgStreakBadge = document.getElementById("mgStreakBadge");
  const miniGameCanvas = document.getElementById("miniGameCanvas");
  const mgResultText = document.getElementById("mgResultText");
  const btnStartMiniGame = document.getElementById("btnStartMiniGame");
  const btnCloseMiniGame = document.getElementById("btnCloseMiniGame");

  const trophyModal = document.getElementById("trophyModal");
  const trophySummary = document.getElementById("trophySummary");
  const achievementsList = document.getElementById("achievementsList");
  const btnCloseTrophy = document.getElementById("btnCloseTrophy");

  const photoModal = document.getElementById("photoModal");
  const photoStudioCanvas = document.getElementById("photoStudioCanvas");
  const photoPoseChips = document.getElementById("photoPoseChips");
  const photoFrameChips = document.getElementById("photoFrameChips");
  const photoStickerChips = document.getElementById("photoStickerChips");
  const inputPhotoCaption = document.getElementById("inputPhotoCaption");
  const togglePhotoStats = document.getElementById("togglePhotoStats");
  const btnSharePhotoCard = document.getElementById("btnSharePhotoCard");
  const btnClosePhoto = document.getElementById("btnClosePhoto");

  const diaryModal = document.getElementById("diaryModal");
  const diaryList = document.getElementById("diaryList");
  const btnCloseDiary = document.getElementById("btnCloseDiary");
  const keyLegendModal = document.getElementById("keyLegendModal");
  const btnCloseKeyLegend = document.getElementById("btnCloseKeyLegend");
  const pwaUpdateToast = document.getElementById("pwaUpdateToast");
  const btnPwaRefresh = document.getElementById("btnPwaRefresh");

  const inputChallengeCode = document.getElementById("inputChallengeCode");
  const btnPlayChallengeCode = document.getElementById("btnPlayChallengeCode");
  const btnShareChallengeFromLeague = document.getElementById("btnShareChallengeFromLeague");

  const adModal = document.getElementById("adModal");
  const adTimer = document.getElementById("adTimer");
  const adRewardText = document.getElementById("adRewardText");
  const btnClaimAd = document.getElementById("btnClaimAd");

  const audioModal = document.getElementById("audioModal");
  const toggleMusic = document.getElementById("toggleMusic");
  const toggleSfx = document.getElementById("toggleSfx");
  const toggleCat = document.getElementById("toggleCat");
  const sliderMusicVol = document.getElementById("sliderMusicVol");
  const sliderSfxVol = document.getElementById("sliderSfxVol");
  const sliderCatVol = document.getElementById("sliderCatVol");
  const valMusicVol = document.getElementById("valMusicVol");
  const valSfxVol = document.getElementById("valSfxVol");
  const valCatVol = document.getElementById("valCatVol");
  const btnCloseAudio = document.getElementById("btnCloseAudio");

  const settingsModal = document.getElementById("settingsModal");
  const settingsBadgeDot = document.getElementById("settingsBadgeDot");
  const selectLanguage = document.getElementById("selectLanguage");
  const inputSettingsNickname = document.getElementById("inputSettingsNickname");
  const btnOpenAudioFromSettings = document.getElementById("btnOpenAudioFromSettings");
  const toggleFx = document.getElementById("toggleFx");
  const toggleHaptics = document.getElementById("toggleHaptics");
  const toggleColorblind = document.getElementById("toggleColorblind");
  const togglePowerSaver = document.getElementById("togglePowerSaver");
  const selectDragOffset = document.getElementById("selectDragOffset");
  const windowWeather = document.getElementById("windowWeather");
  const btnQuickPet = document.getElementById("btnQuickPet");
  const btnQuickToy = document.getElementById("btnQuickToy");
  const btnQuickHat = document.getElementById("btnQuickHat");
  const btnQuickTheme = document.getElementById("btnQuickTheme");
  const btnExportSaveJson = document.getElementById("btnExportSaveJson");
  const btnImportSaveJson = document.getElementById("btnImportSaveJson");
  const inputImportSaveJson = document.getElementById("inputImportSaveJson");
  const btnOpenGuide = document.getElementById("btnOpenGuide");
  const btnOpenStats = document.getElementById("btnOpenStats");
  const btnCheckUpdates = document.getElementById("btnCheckUpdates");
  const updateStatusText = document.getElementById("updateStatusText");
  const btnMoreApps = document.getElementById("btnMoreApps");
  const btnOpenBugReport = document.getElementById("btnOpenBugReport");
  const btnOpenCloudSync = document.getElementById("btnOpenCloudSync");
  const settingsCloudSub = document.getElementById("settingsCloudSub");
  const cloudModal = document.getElementById("cloudModal");
  const cloudStatusBadge = document.getElementById("cloudStatusBadge");
  const btnTestCloudHealth = document.getElementById("btnTestCloudHealth");
  const cloudHealthText = document.getElementById("cloudHealthText");
  const cloudSyncCodeText = document.getElementById("cloudSyncCodeText");
  const btnCopySyncCode = document.getElementById("btnCopySyncCode");
  const btnCloudSyncNow = document.getElementById("btnCloudSyncNow");
  const inputRestoreCode = document.getElementById("inputRestoreCode");
  const btnRestoreByCode = document.getElementById("btnRestoreByCode");
  const btnDeleteCloudData = document.getElementById("btnDeleteCloudData");
  const cloudFeedbackText = document.getElementById("cloudFeedbackText");
  const btnCloseCloud = document.getElementById("btnCloseCloud");
  const btnPrivacyPolicy = document.getElementById("btnPrivacyPolicy");
  const privacyModal = document.getElementById("privacyModal");
  const privacyFrame = document.getElementById("privacyFrame");
  const btnClosePrivacy = document.getElementById("btnClosePrivacy");
  const btnCloseSettings = document.getElementById("btnCloseSettings");
  const settingsTabs = document.getElementById("settingsTabs");
  const settingsPaneGeneral = document.getElementById("settingsPaneGeneral");
  const settingsPaneVip = document.getElementById("settingsPaneVip");
  const settingsPaneApp = document.getElementById("settingsPaneApp");

  const luckyWheelModal = document.getElementById("luckyWheelModal");
  const wheelCanvas = document.getElementById("wheelCanvas");
  const wheelResultText = document.getElementById("wheelResultText");
  const btnSpinWheel = document.getElementById("btnSpinWheel");
  const btnCloseWheel = document.getElementById("btnCloseWheel");

  const leaderboardModal = document.getElementById("leaderboardModal");
  const leagueTierBanner = document.getElementById("leagueTierBanner");
  const leagueSeasonBox = document.getElementById("leagueSeasonBox");
  const leagueSeasonTitle = document.getElementById("leagueSeasonTitle");
  const leagueSeasonSub = document.getElementById("leagueSeasonSub");
  const btnClaimSeasonReward = document.getElementById("btnClaimSeasonReward");
  const leagueNickBox = document.getElementById("leagueNickBox");
  const inputLeagueNick = document.getElementById("inputLeagueNick");
  const btnSaveLeagueNick = document.getElementById("btnSaveLeagueNick");
  const leagueTabs = document.getElementById("leagueTabs");
  const leagueList = document.getElementById("leagueList");
  const leagueNoteText = document.getElementById("leagueNoteText");
  const btnCloseLeague = document.getElementById("btnCloseLeague");

  const statsModal = document.getElementById("statsModal");
  const statsGrid = document.getElementById("statsGrid");
  const remoteConfigPreview = document.getElementById("remoteConfigPreview");
  const btnCloseStats = document.getElementById("btnCloseStats");

  const interstitialModal = document.getElementById("interstitialModal");
  const interstitialTimer = document.getElementById("interstitialTimer");
  const btnSkipInterstitial = document.getElementById("btnSkipInterstitial");

  const welcomeGuideModal = document.getElementById("welcomeGuideModal");
  const guideStepBadge = document.getElementById("guideStepBadge");
  const guideBodyScroll = document.getElementById("guideBodyScroll");
  const guideLangGrid = document.getElementById("guideLangGrid");
  const inputGuideNickname = document.getElementById("inputGuideNickname");
  const btnGuideSkip = document.getElementById("btnGuideSkip");
  const btnGuideBack = document.getElementById("btnGuideBack");
  const btnGuideNext = document.getElementById("btnGuideNext");
  const guideDots = document.getElementById("guideDots");
  const btnPermNotif = document.getElementById("btnPermNotif");
  const btnPermVibrate = document.getElementById("btnPermVibrate");

  const bugReportModal = document.getElementById("bugReportModal");
  const bugNoteInput = document.getElementById("bugNoteInput");
  const bugDiagPreview = document.getElementById("bugDiagPreview");
  const btnSendBugEmail = document.getElementById("btnSendBugEmail");
  const btnCopyBugDiag = document.getElementById("btnCopyBugDiag");
  const btnCloseBugReport = document.getElementById("btnCloseBugReport");

  const dailyModal = document.getElementById("dailyModal");
  const dailyStreakTag = document.getElementById("dailyStreakTag");
  const dailyTabs = document.getElementById("dailyTabs");
  const dailyCalendarPane = document.getElementById("dailyCalendarPane");
  const dailyArchivePane = document.getElementById("dailyArchivePane");
  const archiveMonthSummary = document.getElementById("archiveMonthSummary");
  const archiveMilestonesRow = document.getElementById("archiveMilestonesRow");
  const archiveMonthGrid = document.getElementById("archiveMonthGrid");
  const archiveReplayChoice = document.getElementById("archiveReplayChoice");
  const archiveChoiceLabel = document.getElementById("archiveChoiceLabel");
  const btnArchivePayFish = document.getElementById("btnArchivePayFish");
  const btnArchiveWatchAd = document.getElementById("btnArchiveWatchAd");
  const dailyQuestsPane = document.getElementById("dailyQuestsPane");
  const dailyAlbumPane = document.getElementById("dailyAlbumPane");
  const albumSetsList = document.getElementById("albumSetsList");
  const albumSummaryNote = document.getElementById("albumSummaryNote");
  const albumTokensText = document.getElementById("albumTokensText");
  const btnTradeTokenHammer = document.getElementById("btnTradeTokenHammer");
  const btnTradeTokenRotate = document.getElementById("btnTradeTokenRotate");
  const streakSaverBanner = document.getElementById("streakSaverBanner");
  const streakSaverSub = document.getElementById("streakSaverSub");
  const btnStreakSaverAd = document.getElementById("btnStreakSaverAd");
  const dailyGrid = document.getElementById("dailyGrid");
  const questsList = document.getElementById("questsList");
  const stickerRow = document.getElementById("stickerRow");
  const btnCloseDaily = document.getElementById("btnCloseDaily");

  // Demo bar buttons
  const btnSim6h = document.getElementById("btnSim6h");
  const btnSim14h = document.getElementById("btnSim14h");
  const btnSim48h = document.getElementById("btnSim48h");
  const btnSimNextDay = document.getElementById("btnSimNextDay");
  const btnToggleDayNight = document.getElementById("btnToggleDayNight");
  const btnTestWake = document.getElementById("btnTestWake");
  const btnSimLose = document.getElementById("btnSimLose");
  const btnAddTreats = document.getElementById("btnAddTreats");
  const btnReset = document.getElementById("btnReset");

  // Core Engines
  const sound = new window.SoundEngine();
  const pet = new window.MochiPet(petCanvas);

  let appState = {
    bestScore: 0,
    treats: 3,
    hunger: 92,
    mood: 95,
    unlockedAcc: ["none"],
    equippedAcc: "none",
    unlockedCollars: ["red_bell", "none"],
    equippedCollar: "none",
    unlockedSkins: ["orange"],
    equippedSkin: "orange",
    unlockedDecors: ["pink"],
    equippedDecor: "pink",
    unlockedToys: ["yarn"],
    equippedToy: "yarn",
    unlockedGadgets: [],
    equippedGadgets: [],
    unlockedThemes: ["peach"],
    equippedTheme: "peach",
    unlockedTileSkins: ["classic"],
    equippedTileSkin: "classic",
    zenMode: false,
    language: window.MochiI18n ? window.MochiI18n.getLanguage() : "en",
    nickname: "",
    friendXp: 0,
    albumCards: [],
    claimedAlbumSets: [],
    albumTokens: 0,
    albumDupPity: 0,
    blitzBestScore: 0,
    wheelDayKey: null,
    wheelFreeUsed: false,
    wheelAdSpinsUsed: 0,
    dailyBestScore: 0,
    dailyBestDate: null,
    dailyCompletedDates: {},
    claimedArchiveMilestones: [],
    adventureStars: {},
    miniGameDayKey: null,
    miniGamePlaysToday: 0,
    beatenChallengeCodes: [],
    leagueWeeklyBest: {},
    claimedLeagueWeeks: [],
    seasonTrophies: 0,
    claimedAchievements: [],
    statsTotalLines: 0,
    statsMaxCombo: 0,
    diaryLog: [],
    lastBackupRemindAt: 0,
    adUnlockProgress: {},
    dispenserFreeLeft: 0,
    dispenserDayKey: null,
    dailyClaimedDate: null,
    dailyAdClaimedDate: null,
    missedStreakPrev: 0,
    simDayOffset: 0,
    quests: { pets: 0, plays: 0, lines: 0, combos: 0 },
    claimedQuests: [],
    equippedSticker: "🐾",
    streakDays: 1,
    lastPlayDate: null,
    dailyCompletedDate: null,
    cravingIndex: 0,
    cravingProgress: 0,
    lastTimestamp: Date.now(),
    muted: false,
    musicEnabled: true,
    musicVolume: 0.7,
    sfxEnabled: true,
    sfxVolume: 0.85,
    catEnabled: true,
    catVolume: 0.9,
    fxEnabled: true,
    hapticsEnabled: true,
    colorblindMode: false,
    powerSaver: false,
    dragOffset: "normal",
    seenSpecialTips: []
  };

  const AUDIO_CHANNELS = [
    {
      enabledKey: "musicEnabled",
      volKey: "musicVolume",
      defaultVol: 0.7,
      toggle: toggleMusic,
      slider: sliderMusicVol,
      valEl: valMusicVol,
      applyEnabled: (v) => sound.setMusicEnabled(v),
      applyVol: (v) => sound.setMusicVolume(v),
      preview: () => sound.playMusicPreview()
    },
    {
      enabledKey: "sfxEnabled",
      volKey: "sfxVolume",
      defaultVol: 0.85,
      toggle: toggleSfx,
      slider: sliderSfxVol,
      valEl: valSfxVol,
      applyEnabled: (v) => sound.setSfxEnabled(v),
      applyVol: (v) => sound.setSfxVolume(v),
      preview: () => sound.playPickup()
    },
    {
      enabledKey: "catEnabled",
      volKey: "catVolume",
      defaultVol: 0.9,
      toggle: toggleCat,
      slider: sliderCatVol,
      valEl: valCatVol,
      applyEnabled: (v) => sound.setCatEnabled(v),
      applyVol: (v) => sound.setCatVolume(v),
      preview: () => sound.playMeowHappy()
    }
  ];

  function applyAudioSettings() {
    sound.setMuted(false);
    let anyActive = false;
    AUDIO_CHANNELS.forEach((ch) => {
      const enabled = appState[ch.enabledKey] !== false;
      const vol = typeof appState[ch.volKey] === "number" ? appState[ch.volKey] : ch.defaultVol;
      ch.applyEnabled(enabled);
      ch.applyVol(vol);
      if (enabled && vol > 0.005) anyActive = true;
      if (ch.toggle) ch.toggle.checked = enabled;
      const pct = Math.round(vol * 100);
      if (ch.slider) ch.slider.value = String(pct);
      if (ch.valEl) ch.valEl.textContent = `${pct}%`;
      const card = ch.toggle && ch.toggle.closest(".audio-channel");
      if (card) card.classList.toggle("is-off", !enabled || vol <= 0.005);
    });
    if (btnAudio) {
      btnAudio.textContent = anyActive ? "🔊" : "🔇";
      btnAudio.classList.toggle("is-muted", !anyActive);
    }
  }

  function unlockAudio() {
    sound.unlock();
    sound.setMusicEnabled(appState.musicEnabled !== false);
  }

  function vibrate(ms) {
    if (!appState.hapticsEnabled) return;
    if (window.MochiAndroid) {
      try {
        if (Array.isArray(ms) && typeof window.MochiAndroid.vibratePattern === "function") {
          window.MochiAndroid.vibratePattern(ms.join(","));
          return;
        }
        if (!Array.isArray(ms) && typeof window.MochiAndroid.vibrate === "function") {
          window.MochiAndroid.vibrate(Math.max(5, Number(ms) || 15));
          return;
        }
      } catch (_) {}
    }
    if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) {
      try {
        navigator.vibrate(ms);
      } catch (_) {}
    }
  }

  let puzzle;
  let pendingAdReward = null;
  let bubbleTimeout = null;
  let comboTimeout = null;
  let wakeTimer = null;
  let isNightMode = false;
  let draggingSnack = false;
  let streakBanner = null;
  let savedClassicState = null;
  let audioUnlocked = false;
  let activeClosetTab = "all";
  let activeClosetFilter = "all";
  let movesSinceHungerTick = 0;
  let lastToyMoodAt = 0;
  let lastFountainSipAt = 0;
  let lastFeederUseAt = 0;
  let lastWheelSpinAt = 0;
  let overdriveMovesLeft = 0;
  let purrRushEndsAt = 0;
  let activeDailyTab = "calendar";
  let activeLeagueTab = "daily";
  let activeMiniGameMode = "laser";
  let giftUpgradeUsedThisRun = false;
  let runFishDoubledThisRun = false;
  let giftUpgradeHideTimer = null;
  let wheelAngle = 0;
  let wheelSpinning = false;
  let pendingInterstitialDone = null;
  let runStartMs = Date.now();
  let cloudSyncTimer = null;
  let cloudSyncInFlight = false;
  let leagueFetchNonce = 0;

  const Mon = window.MochiMonetization || null;

  // Hide Playtest Demo Bar on production domains unless ?demo=1 is present (allow ?prod=1 preview)
  (function syncDemoBarVisibility() {
    const host = window.location.hostname || "";
    const forceProd = window.location.search.includes("prod=1");
    const isDev = !host || host === "localhost" || host === "127.0.0.1" || window.location.protocol === "file:" || window.location.search.includes("demo=1");
    if (forceProd || !isDev) {
      document.body.classList.add("prod-mode");
    }
  })();

  function updateNotificationSchedule() {
    try {
      const now = Date.now();
      const plan = {
        updatedAt: now,
        hungryAt: now + 10 * 3600000,
        faintedAt: now + 24 * 3600000
      };
      localStorage.setItem("mochi_pop_notif_plan", JSON.stringify(plan));
      if (window.MochiAndroid && typeof window.MochiAndroid.scheduleNotifications === "function") {
        // 5h snack alert, 14h streak-risk reminder, 24h fainted alert (max gentle schedule)
        const lang = appState.language || "en";
        window.MochiAndroid.scheduleNotifications(5 * 3600, 14 * 3600, 24 * 3600, lang);
      }
    } catch (_) {}
  }

  function refreshDailyWheelState(today) {
    if (appState.wheelDayKey !== today) {
      appState.wheelDayKey = today;
      appState.wheelFreeUsed = false;
      appState.wheelAdSpinsUsed = 0;
    }
  }

  function applyEventAndLevelModifiers() {
    if (!puzzle || typeof puzzle.setEventModifiers !== "function" || !Mon) return;
    const lv = Mon.computeFriendLevel(appState.friendXp || 0);
    const ev = Mon.getActiveMiniEvent();
    puzzle.setEventModifiers({
      fishMult: ev ? ev.fishMult : 1,
      rocketMult: ev ? ev.rocketMult : 1,
      startRotateBonus: lv.startRotateBonus || 0
    });
    if (eventBannerPill) {
      if (ev) {
        eventBannerPill.textContent = i18n(ev.i18nKey);
        eventBannerPill.classList.remove("hidden");
      } else {
        eventBannerPill.classList.add("hidden");
      }
    }
  }

  function getActiveOutfitSet() {
    const acc = appState.equippedAcc || "none";
    const collar = appState.equippedCollar || "red_bell";
    const decor = appState.equippedDecor || "pink";
    const skin = appState.equippedSkin || "orange";
    if (acc === "crown" && (collar === "star_bell" || decor === "star")) {
      return { id: "royal", name: "👑 Royal Party" };
    }
    if ((acc === "blossom" || acc === "bow") && (collar === "pastel_bell" || decor === "pink")) {
      return { id: "sakura", name: "🌸 Cozy Sakura" };
    }
    if ((acc === "headphones" || acc === "shades" || acc === "chef") && (skin === "latte" || skin === "tuxedo")) {
      return { id: "chill", name: "🎧 Cool Café" };
    }
    if ((acc === "bear" || acc === "scarf" || acc === "wizard") && (decor === "box" || collar === "red_bell")) {
      return { id: "cozy", name: "🧸 Cozy Knit" };
    }
    return null;
  }

  function grantFriendXp(amount) {
    if (!Mon || !amount || puzzle.mode === "daily") return;
    const outfitBonus = getActiveOutfitSet() ? 1.1 : 1;
    const xpGain = Math.max(1, Math.round(amount * outfitBonus));
    const before = Mon.computeFriendLevel(appState.friendXp || 0).level;
    appState.friendXp = (appState.friendXp || 0) + xpGain;
    const afterInfo = Mon.computeFriendLevel(appState.friendXp);
    if (afterInfo.level > before) {
      appState.treats += 2;
      sound.playMilestoneUnlock();
      pet.triggerCelebrate("dance", 2.0);
      pet.spawnHearts(6);
      showBubble(i18n("msg_friend_up", { lv: afterInfo.level }), 2600);
      applyEventAndLevelModifiers();
    }
  }

  function grantAlbumCardRoll(source = "gift") {
    if (!Mon) return null;
    appState.albumCards = appState.albumCards || [];
    const pickFn = typeof Mon.pickAlbumCardWithPity === "function" ? Mon.pickAlbumCardWithPity : Mon.pickRandomAlbumCard;
    const res = pickFn(appState.albumCards, appState.albumDupPity || 0);
    const { card, isDuplicate } = res;
    if (typeof res.nextDupStreak === "number") {
      appState.albumDupPity = res.nextDupStreak;
    }
    if (isDuplicate) {
      appState.treats += 2;
      appState.albumTokens = (appState.albumTokens || 0) + 1;
      showBubble(i18n("msg_album_dup", { icon: card.icon }), 2200);
    } else {
      appState.albumCards.push(card.id);
      appState.albumDupPity = 0;
      sound.playMilestoneUnlock();
      showBubble(i18n("msg_album_new", { icon: card.icon, name: card.name }), 2600);
    }
    return { card, isDuplicate, source };
  }

  function applyRoomTheme(themeId) {
    const id = themeId || "peach";
    petStage.classList.toggle("theme-beach", id === "beach");
    petStage.classList.toggle("theme-winter", id === "winter");
    if (sound && typeof sound.setRoomTheme === "function") {
      sound.setRoomTheme(id);
    }
  }

  function applyWallSticker(sticker) {
    if (wallStickerIcon) {
      wallStickerIcon.textContent = sticker || "🐾";
    }
  }

  function isPurrRushActive() {
    return purrRushEndsAt > Date.now();
  }

  function startPurrRush() {
    const already = isPurrRushActive();
    purrRushEndsAt = Date.now() + 30000;
    puzzle.setFeverMode(true);
    petStage.classList.add("is-fever");
    if (!already) {
      sound.playCravingWin();
      pet.triggerCelebrate("fever_party", 2.4);
      pet.spawnHearts(6);
      showBubble(i18n("msg_purr_rush"), 2600);
    }
    updateHUD();
  }

  function syncPurrRushState() {
    const active = isPurrRushActive();
    puzzle.setFeverMode(active);
    petStage.classList.toggle("is-fever", active);
    if (boardWrapper) boardWrapper.classList.toggle("fever-active", active);
    if (purrRushBadge) {
      if (active) {
        const secs = Math.max(1, Math.ceil((purrRushEndsAt - Date.now()) / 1000));
        purrRushBadge.textContent = `🔥 PURR RUSH ${secs}s`;
        purrRushBadge.classList.remove("hidden");
      } else {
        purrRushBadge.classList.add("hidden");
      }
    }
  }

  function syncStreakUnlocks(announce = false) {
    const streak = appState.streakDays || 1;
    const newlyUnlocked = [];
    const groups = [
      { items: ACCESSORIES, key: "unlockedAcc" },
      { items: COLLARS, key: "unlockedCollars" },
      { items: TOYS, key: "unlockedToys" },
      { items: GADGETS, key: "unlockedGadgets" }
    ];
    groups.forEach(({ items, key }) => {
      appState[key] = appState[key] || [];
      items.forEach((item) => {
        if (item.unlockType === "streak" && streak >= (item.reqStreak || 7) && !appState[key].includes(item.id)) {
          appState[key].push(item.id);
          newlyUnlocked.push(item.name);
        }
      });
    });
    if (newlyUnlocked.length && announce) {
      sound.playMilestoneUnlock();
      streakBanner = `🏆 ${streak}-Day Goal! Unlocked ${newlyUnlocked[0]}!`;
    }
  }

  function getMochiEnergy() {
    return Math.round((appState.hunger + appState.mood) / 2);
  }

  function getScoreMultiplier() {
    const lvPerk = Mon ? (Mon.computeFriendLevel(appState.friendXp || 0).scorePerkMult || 1) : 1;
    if (overdriveMovesLeft > 0) {
      return isPurrRushActive() ? 3.5 : 3.0;
    }
    if (isMochiFainted() || pet.state === "fainted") return 0.5;
    const energy = getMochiEnergy();
    let mult = 0.75;
    if (energy >= 90) mult = 2.0;
    else if (energy >= 70) mult = 1.5;
    else if (energy >= 35) mult = 1.0;
    if (isPurrRushActive()) mult = Math.min(3.5, mult + 0.5);
    return Math.min(3.5, Math.round(mult * lvPerk * 100) / 100);
  }

  function getDateKey(dateObj = new Date()) {
    const shifted = new Date(dateObj.getTime());
    const offset = appState.simDayOffset || 0;
    if (offset !== 0) {
      shifted.setDate(shifted.getDate() + offset);
    }
    const y = shifted.getFullYear();
    const m = String(shifted.getMonth() + 1).padStart(2, "0");
    const d = String(shifted.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function refreshDailyDispenserCharge(today) {
    if (appState.dispenserDayKey !== today) {
      appState.dispenserDayKey = today;
      appState.dispenserFreeLeft = 1;
    }
    refreshDailyWheelState(today);
  }

  function checkDailyStreak() {
    const today = getDateKey();
    refreshDailyDispenserCharge(today);
    if (!appState.lastPlayDate) {
      appState.streakDays = 1;
      appState.lastPlayDate = today;
      return;
    }
    if (appState.lastPlayDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = getDateKey(yesterday);

    if (appState.lastPlayDate === yKey) {
      appState.streakDays = (appState.streakDays || 1) + 1;
      appState.missedStreakPrev = 0;
      streakBanner = `🔥 Day ${appState.streakDays} Ready! Tap STREAK to claim!`;
      syncStreakUnlocks(true);
    } else {
      const prev = appState.streakDays || 1;
      appState.missedStreakPrev = prev > 1 ? prev : 0;
      appState.streakDays = 1;
      streakBanner = prev > 1 ? i18n("msg_missed_streak") : i18n("msg_welcome_back");
    }
    appState.lastPlayDate = today;
    saveGame();
  }

  let activeSeason = "spring";
  function applySeasonalWeather(monthNum = null) {
    const m = monthNum != null ? monthNum : new Date().getMonth() + 1;
    let glyphs = ["🌸", "🌷", "🌸"];
    if (m === 12 || m <= 2) {
      activeSeason = "winter";
      glyphs = ["❄️", "🌨️", "❄️"];
    } else if (m >= 6 && m <= 8) {
      activeSeason = "summer";
      glyphs = ["☀️", "✨", "🌤️"];
    } else if (m >= 9 && m <= 11) {
      activeSeason = "autumn";
      glyphs = ["🍂", "🍁", "🍂"];
    } else {
      activeSeason = "spring";
    }
    if (windowWeather) {
      windowWeather.innerHTML = glyphs.map((g) => `<span>${g}</span>`).join("");
    }
  }

  function applyTimeOfDayLighting(forceNight = null) {
    if (forceNight === null) {
      const hour = new Date().getHours();
      isNightMode = hour >= 19 || hour < 6;
    } else {
      isNightMode = !!forceNight;
    }
    petStage.classList.toggle("is-night", isNightMode);
    topHud.classList.toggle("is-night", isNightMode);
    windowCelestial.textContent = isNightMode ? "🌙" : "☀️";
    applySeasonalWeather();
    pet.setNight(isNightMode);
    if (sound && typeof sound.setNightMode === "function") {
      sound.setNightMode(isNightMode);
    }
  }

  function runWakeUpSequence() {
    clearTimeout(wakeTimer);
    pet.triggerState("sleeping", 0);
    showBubble("Zzz... 💤", 1100);
    wakeTimer = setTimeout(() => {
      triggerWakeUpNow();
    }, 1050);
  }

  function triggerWakeUpNow() {
    clearTimeout(wakeTimer);
    if (pet.state !== "sleeping") return;
    sound.playYawn();
    showBubble(i18n(appState.hunger < 35 ? "msg_yawn_hungry" : "msg_yawn_hi"), 2200);
    pet.triggerState("waking", 1.55, () => {
      refreshPetRestingState();
    });
  }

  function showBubble(text, duration = 2600) {
    petBubble.textContent = text;
    petBubble.classList.remove("hidden");
    clearTimeout(bubbleTimeout);
    if (duration > 0) {
      bubbleTimeout = setTimeout(() => {
        if (pet.state !== "sulking" && pet.state !== "sad" && pet.state !== "fainted") {
          petBubble.classList.add("hidden");
        }
      }, duration);
    }
  }

  function isMochiFainted() {
    return appState.hunger <= 0 && appState.mood <= 0;
  }

  function reviveFaintedMochi(sourceLabel = "Ad") {
    appState.hunger = Math.max(65, appState.hunger);
    appState.mood = Math.max(70, appState.mood);
    pet.triggerCelebrate("dance", 2.1);
    pet.spawnHearts(7);
    sound.playCravingWin();
    sound.playMeowHappy();
    showBubble(i18n(sourceLabel === "fish" ? "msg_revive_fish" : "msg_revive_ad"), 2600);
    updateHUD();
    saveGame();
  }

  function promptFaintedReviveAd() {
    openRewardedAd(i18n("ad_lbl_faint"), () => {
      reviveFaintedMochi("ad");
    });
  }

  function applyOfflineDecay(hoursElapsed) {
    if (hoursElapsed <= 0.05) return;
    const equippedGadgets = appState.equippedGadgets || [];
    const hasFountain = equippedGadgets.includes("fountain");
    const lvDecayMult = Mon ? (Mon.computeFriendLevel(appState.friendXp || 0).hungerDecayMult || 1) : 1;
    const decayFactor = (hasFountain ? 0.7 : 1.0) * lvDecayMult;

    // ~8.5% hunger & ~6.5% mood drop per hour away; Fountain slows decay by 30%. Dispenser requires active login tap!
    const hungerLoss = hoursElapsed * 8.5 * decayFactor;
    const moodLoss = hoursElapsed * 6.5 * decayFactor;
    appState.hunger = Math.max(0, Math.round(appState.hunger - hungerLoss));
    appState.mood = Math.max(0, Math.round(appState.mood - moodLoss));

    if (hoursElapsed >= 24 || isMochiFainted()) {
      appState.hunger = 0;
      appState.mood = 0;
      pet.triggerState("fainted", 0);
      showBubble(i18n("msg_fainted"), 0);
    } else if (appState.hunger < 35 || appState.mood < 35) {
      pet.triggerState("sulking", 0);
      showBubble(i18n("msg_sulking"), 0);
    } else if (appState.hunger < 65) {
      showBubble(i18n("msg_hungry_warn"), 3200);
    }
  }

  function ensureAudioUnlocked() {
    sound.unlock();
    if (!audioUnlocked) {
      audioUnlocked = true;
      applyAudioSettings();
    }
  }

  function applyDecor(id) {
    const decorId = id || "pink";
    roomRug.className = "room-rug" + (decorId === "star" ? " decor-star" : decorId === "box" ? " decor-box" : "");
    pet.setDecor(decorId);
  }

  function syncBowlTarget() {
    const b = pet.getBowlClientPos();
    const fr = fxCanvas.getBoundingClientRect();
    if (fr.width > 0 && b.x > 0) {
      puzzle.setBowlTarget(b.x - fr.left, b.y - fr.top);
    }
  }

  function getActiveCraving() {
    const idx = (appState.cravingIndex || 0) % CRAVINGS.length;
    return CRAVINGS[idx];
  }

  function i18n(key, vars) {
    return window.MochiI18n ? window.MochiI18n.t(key, vars) : key;
  }

  function renderRunBreakdown(score, bestScore) {
    if (!runBreakdownCard) return;
    const stats = typeof puzzle.getRunStats === "function"
      ? puzzle.getRunStats()
      : { linesCleared: puzzle.runLinesCleared || 0, maxCombo: puzzle.combo || 0, specialPops: 0 };
    if (bdLines) bdLines.textContent = String(stats.linesCleared || 0);
    if (bdCombo) bdCombo.textContent = `${stats.maxCombo || 0}×`;
    if (bdSpecials) bdSpecials.textContent = String(stats.specialPops || 0);
    if (bdGap) {
      if ((bestScore || 0) <= 0 || score >= bestScore) {
        bdGap.textContent = score > 0 ? "🏆 NEW!" : "—";
      } else {
        bdGap.textContent = `-${bestScore - score}`;
      }
    }
    runBreakdownCard.classList.remove("hidden");
  }

  function updateChallengeUI() {
    if (btnAdventureMode) {
      btnAdventureMode.classList.toggle("active", puzzle.mode === "adventure");
      btnAdventureMode.textContent = i18n(puzzle.mode === "adventure" ? "btn_adventure_exit" : "btn_adventure");
    }
    if (btnBlitzMode) {
      btnBlitzMode.classList.toggle("active", puzzle.mode === "blitz");
    }
    if (puzzle.mode === "blitz") {
      btnDailyMode.classList.remove("active");
      btnDailyMode.textContent = i18n("btn_daily");
      cravingPill.classList.remove("completed");
      const secLeft = Math.max(0, Math.ceil(puzzle.blitzTimeLeft || 0));
      cravingPill.classList.toggle("is-urgent", secLeft > 0 && secLeft <= 10);
      cravingText.textContent = i18n("blitz_hud_label", {
        sec: secLeft,
        best: appState.blitzBestScore || 0
      });
    } else if (puzzle.mode === "daily") {
      cravingPill.classList.remove("is-urgent");
      btnDailyMode.classList.add("active");
      btnDailyMode.textContent = i18n("btn_daily_exit");
      cravingPill.classList.remove("completed");
      cravingText.textContent = i18n("daily_challenge_hud", {
        done: puzzle.dailyFishCollected,
        goal: puzzle.dailyFishGoal,
        moves: puzzle.dailyMovesLeft
      });
    } else if (puzzle.mode === "adventure" && puzzle.adventureLevel) {
      btnDailyMode.classList.remove("active");
      btnDailyMode.textContent = i18n("btn_daily");
      cravingPill.classList.remove("completed");
      const g = puzzle.adventureLevel.goal || { type: "lines", target: 1 };
      let goalStr;
      if (g.type === "color") {
        goalStr = i18n("adv_goal_color", { n: `${Math.min(g.target, puzzle.adventureProgress || 0)}/${g.target}`, color: g.colorName || "strawberry" });
      } else {
        const goalKey = g.type === "fish" ? "adv_goal_fish" : (g.type === "ice" ? "adv_goal_ice" : (g.type === "score" ? "adv_goal_score" : "adv_goal_lines"));
        goalStr = i18n(goalKey, { cur: Math.min(g.target, puzzle.adventureProgress || 0), target: g.target });
      }
      cravingText.textContent = i18n("adv_hud", {
        lv: puzzle.adventureLevel.id,
        goal: goalStr,
        moves: puzzle.adventureMovesLeft
      });
    } else if (puzzle.mode === "challenge" && puzzle.challengeTarget > 0) {
      btnDailyMode.classList.remove("active");
      btnDailyMode.textContent = i18n("btn_daily");
      cravingPill.classList.toggle("completed", Boolean(puzzle.challengeBeaten));
      cravingText.textContent = i18n("chal_hud", {
        name: puzzle.challengerName || "Friend",
        target: puzzle.challengeTarget
      });
    } else {
      btnDailyMode.classList.remove("active");
      btnDailyMode.textContent = i18n("btn_daily");
      const c = getActiveCraving();
      const prog = Math.min(c.target, appState.cravingProgress || 0);
      cravingText.textContent = `${i18n(c.labelKey)} (${prog}/${c.target}) • +${c.reward}🐟`;
    }
    if (btnZenMode) {
      btnZenMode.classList.toggle("active", Boolean(appState.zenMode));
      btnZenMode.textContent = i18n(appState.zenMode ? "btn_zen_on" : "btn_zen_off");
    }
  }

  function updateHUD() {
    scoreVal.textContent = puzzle.score;
    if (puzzle.mode === "classic" && puzzle.score > appState.bestScore) {
      appState.bestScore = puzzle.score;
    }
    bestVal.textContent = appState.bestScore;
    streakVal.textContent = `🔥${appState.streakDays || 1}`;
    treatsVal.textContent = appState.treats;

    hungerBar.style.width = `${appState.hunger}%`;
    moodBar.style.width = `${appState.mood}%`;
    hungerPct.textContent = `${appState.hunger}%`;
    moodPct.textContent = `${appState.mood}%`;

    hungerBar.style.backgroundColor = appState.hunger < 35 ? "#ff5277" : "#ff9f43";
    moodBar.style.backgroundColor = appState.mood < 35 ? "#ff5277" : "#ff6b8b";
    moodIcon.textContent = appState.mood < 35 ? "😿" : "💖";

    const fainted = isMochiFainted() || pet.state === "fainted";
    const isHungryOrSulking = !fainted && (appState.hunger < 35 || appState.mood < 35);
    btnFeed.classList.toggle("pulse", (isHungryOrSulking || fainted) && appState.treats > 0);
    feedHint.textContent = appState.treats > 0 ? i18n("hud_feed") : `+${i18n("ad_tag")}`;
    btnSnackAd.classList.toggle("hidden", !isHungryOrSulking);
    if (btnReviveFaintedAd) {
      btnReviveFaintedAd.classList.toggle("hidden", !fainted);
    }
    btnUndoAd.disabled = !puzzle.canUndo();
    if (rotateCountBadge) {
      const charges = puzzle.rotateCharges || 0;
      rotateCountBadge.textContent = charges > 0 ? String(charges) : `+${i18n("ad_tag")}`;
    }
    if (hammerCountBadge && btnHammer) {
      const hCharges = puzzle.hammerCharges || 0;
      hammerCountBadge.textContent = hCharges > 0 ? String(hCharges) : `+${i18n("ad_tag")}`;
      btnHammer.classList.toggle("is-active", !!puzzle.hammerMode);
    }
    if (hintCountBadge) {
      const hintCh = puzzle.hintCharges || 0;
      hintCountBadge.textContent = hintCh > 0 ? String(hintCh) : `+${i18n("ad_tag")}`;
    }
    syncPurrRushState();

    const mult = getScoreMultiplier();
    if (typeof puzzle.setScoreMultiplier === "function") {
      puzzle.setScoreMultiplier(mult);
    }
    if (energyMultPill) {
      const multStr = mult % 1 === 0 ? `${mult}.0` : String(mult);
      const ptsWord = i18n("pts_short");
      energyMultPill.textContent = mult < 1 ? `😤 ×${multStr} ${ptsWord}` : `⚡ ×${multStr} ${ptsWord}`;
      energyMultPill.classList.toggle("mult-max", mult >= 1.5);
      energyMultPill.classList.toggle("mult-low", mult < 1);
    }
    if (btnOverdriveAd) {
      const activeOd = overdriveMovesLeft > 0;
      btnOverdriveAd.textContent = activeOd ? `⚡×3 (${overdriveMovesLeft})` : i18n("overdrive_ad_btn");
      btnOverdriveAd.classList.toggle("is-active", activeOd);
    }
    if (dailyBadgeDot) {
      const todayKey = getDateKey();
      const questReady = QUEST_DEFS.some((q) => ((appState.quests && appState.quests[q.id]) || 0) >= q.target && !(appState.claimedQuests || []).includes(q.id));
      const dailyAvailable = appState.dailyClaimedDate !== todayKey || appState.dailyAdClaimedDate !== todayKey || (appState.missedStreakPrev || 0) > 1;
      dailyBadgeDot.classList.toggle("hidden", !(questReady || dailyAvailable));
    }
    if (wheelBadgeDot) {
      const todayKey = getDateKey();
      refreshDailyWheelState(todayKey);
      wheelBadgeDot.classList.toggle("hidden", Boolean(appState.wheelFreeUsed));
    }
    if (trophyBadgeDot && window.MochiAchievements) {
      trophyBadgeDot.classList.toggle("hidden", window.MochiAchievements.countClaimable(appState) === 0);
    }
    if (friendLevelPill && Mon) {
      const lv = Mon.computeFriendLevel(appState.friendXp || 0);
      friendLevelPill.textContent = `💖 ${i18n("lv_short")}${lv.level}`;
      friendLevelPill.title = i18n("msg_friend_tip", { lv: lv.level, xp: lv.xpInLevel, next: lv.xpForNext, perk: lv.startRotateBonus });
    }
    const activeToy = TOYS.find((t) => t.id === (appState.equippedToy || "yarn")) || TOYS[0];
    if (playToyIcon) playToyIcon.textContent = activeToy.icon;

    pet.setStats(appState.hunger, appState.mood, appState.treats);
    pet.setFxEnabled(appState.fxEnabled !== false);
    puzzle.setFxEnabled(appState.fxEnabled !== false);
    if (typeof puzzle.setColorblindMode === "function") {
      puzzle.setColorblindMode(Boolean(appState.colorblindMode));
    }
    if (typeof puzzle.setDragOffset === "function") {
      puzzle.setDragOffset(appState.dragOffset || "normal");
    }
    document.body.classList.toggle("power-saver", Boolean(appState.powerSaver));
    applyAudioSettings();
    toggleFx.checked = appState.fxEnabled !== false;
    toggleHaptics.checked = appState.hapticsEnabled !== false;
    if (toggleColorblind) toggleColorblind.checked = Boolean(appState.colorblindMode);
    if (togglePowerSaver) togglePowerSaver.checked = Boolean(appState.powerSaver);
    if (selectDragOffset) selectDragOffset.value = appState.dragOffset || "normal";
    updateChallengeUI();
  }

  function refreshPetRestingState() {
    if (!gameOverModal.classList.contains("hidden")) {
      pet.triggerState("sad", 0);
      return;
    }
    if (isMochiFainted()) {
      pet.triggerState("fainted", 0);
      showBubble(i18n("msg_fainted"), 0);
      return;
    }
    if (appState.hunger < 35 || appState.mood < 35) {
      pet.triggerState("sulking", 0);
      showBubble(i18n("msg_sulking_feed"), 0);
    } else if (puzzle.getBoardFillRatio() >= 0.68) {
      pet.triggerState("worried", 0);
    } else {
      pet.triggerState("happy", 0);
    }
  }

  function buildSavePayload() {
    appState.lastTimestamp = Date.now();
    const puzzleState = puzzle.mode === "classic"
      ? puzzle.exportState()
      : (savedClassicState || puzzle.exportState());
    return { appState, puzzleState };
  }

  function formatCloudTime(ts) {
    if (!ts) return "";
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  function updateCloudUiSummary() {
    if (!Mon || !Mon.MochiCloud) return;
    const meta = Mon.MochiCloud.getMeta();
    const hasSync = Boolean(meta.playerId && meta.syncCode);
    if (cloudSyncCodeText) {
      cloudSyncCodeText.textContent = hasSync ? meta.syncCode : "MOCHI-••••-••••";
    }
    if (cloudStatusBadge) {
      if (cloudSyncInFlight) {
        cloudStatusBadge.textContent = "⏳ Syncing with api.jemangr.app...";
      } else if (meta.lastSyncAt) {
        cloudStatusBadge.textContent = `☁️ Synced • ${formatCloudTime(meta.lastSyncAt)}`;
      } else if (hasSync) {
        cloudStatusBadge.textContent = "✅ Connected • Ready to sync";
      } else {
        cloudStatusBadge.textContent = "☁️ Tap Sync to create backup code";
      }
    }
    if (settingsCloudSub) {
      if (meta.syncCode) {
        settingsCloudSub.textContent = meta.lastSyncAt
          ? `${meta.syncCode} • ${formatCloudTime(meta.lastSyncAt)}`
          : meta.syncCode;
      } else {
        settingsCloudSub.textContent = i18n("settings_cloud_sub");
      }
    }
  }

  async function performCloudSyncNow(showFeedback = false) {
    if (!Mon || !Mon.MochiCloud || cloudSyncInFlight) return false;
    cloudSyncInFlight = true;
    updateCloudUiSummary();
    try {
      const payload = buildSavePayload();
      const updated = await Mon.MochiCloud.syncSave(payload, appState.nickname || "");
      cloudSyncInFlight = false;
      updateCloudUiSummary();
      if (showFeedback && cloudFeedbackText) {
        cloudFeedbackText.textContent = `✅ Backed up! Code: ${updated.syncCode}`;
        cloudFeedbackText.classList.remove("hidden", "is-error");
      }
      return true;
    } catch (err) {
      cloudSyncInFlight = false;
      updateCloudUiSummary();
      if (showFeedback && cloudFeedbackText) {
        cloudFeedbackText.textContent = `⚠️ Cloud sync offline (${err && err.message ? err.message : "offline"})`;
        cloudFeedbackText.classList.remove("hidden");
        cloudFeedbackText.classList.add("is-error");
      }
      return false;
    }
  }

  function scheduleCloudSave(soon = false) {
    if (!Mon || !Mon.MochiCloud) return;
    const meta = Mon.MochiCloud.getMeta();
    if (!meta.playerId && !soon) return;
    clearTimeout(cloudSyncTimer);
    cloudSyncTimer = setTimeout(() => {
      performCloudSyncNow(false);
    }, soon ? 1200 : 30000);
  }

  function getLeagueDateKey(mode, today) {
    if (mode === "daily") return today;
    if (mode === "weekly") {
      return Mon && typeof Mon.getWeekKey === "function" ? Mon.getWeekKey(today) : today.slice(0, 7);
    }
    return "all";
  }

  async function pushScoresToCloud(triggerMode = "classic") {
    const today = getDateKey();
    const weekKey = getLeagueDateKey("weekly", today);
    const best = appState.bestScore || 0;
    if (best > 0 && window.MochiLeagueRewards) {
      window.MochiLeagueRewards.recordWeeklyParticipation(appState, weekKey, best);
    }
    if (!Mon || !Mon.MochiCloud) return;
    const nick = (appState.nickname && appState.nickname.trim()) || "MochiFan";
    const durSec = Math.max(5, Math.round((Date.now() - runStartMs) / 1000));
    try {
      if (triggerMode === "daily") {
        const myDaily = appState.dailyBestDate === today ? (appState.dailyBestScore || 0) : 0;
        if (myDaily > 0) {
          await Mon.MochiCloud.submitScore({
            mode: "daily",
            dateKey: today,
            score: myDaily,
            nickname: nick,
            runDurationSec: durSec
          });
        }
      }
      if (best > 0) {
        await Mon.MochiCloud.submitScore({
          mode: "weekly",
          dateKey: weekKey,
          score: best,
          nickname: nick,
          runDurationSec: durSec
        });
        await Mon.MochiCloud.submitScore({
          mode: "alltime",
          dateKey: "all",
          score: best,
          nickname: nick,
          runDurationSec: durSec
        });
      }
      const advStarsTotal = window.MochiAdventure
        ? window.MochiAdventure.getTotalStars(appState.adventureStars || {})
        : Object.values(appState.adventureStars || {}).reduce((a, b) => a + (Number(b) || 0), 0);
      const starsLive = Boolean(Mon.loadRemoteConfig().leaderboardStarsLive);
      if (starsLive && advStarsTotal > 0) {
        await Mon.MochiCloud.submitScore({
          mode: "stars",
          dateKey: "all",
          score: advStarsTotal,
          nickname: nick,
          runDurationSec: durSec
        });
      }
      const blitzLive = Boolean(Mon.loadRemoteConfig().leaderboardBlitzLive);
      const myBlitz = appState.blitzBestScore || 0;
      if (blitzLive && myBlitz > 0) {
        await Mon.MochiCloud.submitScore({
          mode: "blitz",
          dateKey: "all",
          score: myBlitz,
          nickname: nick,
          runDurationSec: 90
        });
      }
    } catch (_) {
      /* Offline mode: local best remains safely stored on device */
    }
  }

  function hydrateFromSavePayload(saved, skipOfflineDecay = false) {
    if (saved && saved.appState) {
      const legacyMuted = saved.appState.muted === true &&
        saved.appState.sfxEnabled === undefined &&
        saved.appState.catEnabled === undefined;
      appState = { ...appState, ...saved.appState };
      if (legacyMuted) {
        appState.sfxEnabled = false;
        appState.catEnabled = false;
        appState.muted = false;
      }
      applyAudioSettings();
      syncStreakUnlocks(false);
      pet.setAccessory(appState.equippedAcc);
      pet.setCollar(appState.equippedCollar || "none");
      pet.setSkin(appState.equippedSkin || "orange");
      pet.setToy(appState.equippedToy || "yarn");
      pet.setRoomGadgets(appState.equippedGadgets || []);
      applyDecor(appState.equippedDecor || "pink");
      applyRoomTheme(appState.equippedTheme || "peach");
      applyWallSticker(appState.equippedSticker || "🐾");
      puzzle.setTileSkin(appState.equippedTileSkin || "classic");
      puzzle.setColorblindMode(Boolean(appState.colorblindMode));
      puzzle.setDragOffset(appState.dragOffset || "normal");
      puzzle.setZenMode(Boolean(appState.zenMode));
      if (saved.puzzleState) {
        puzzle.loadState(saved.puzzleState);
      }
      if (!skipOfflineDecay) {
        const hoursAway = (Date.now() - (appState.lastTimestamp || Date.now())) / 3600000;
        applyOfflineDecay(hoursAway);
      }
    } else {
      applyAudioSettings();
      pet.setToy("yarn");
      pet.setRoomGadgets([]);
      applyDecor("pink");
      applyRoomTheme("peach");
      applyWallSticker("🐾");
      puzzle.setTileSkin("classic");
      puzzle.setZenMode(false);
      puzzle.newGame();
    }

    if (window.MochiI18n) {
      const lang = appState.language || window.MochiI18n.getLanguage();
      appState.language = window.MochiI18n.setLanguage(lang);
      if (selectLanguage) selectLanguage.value = appState.language;
    }
    if (inputSettingsNickname) inputSettingsNickname.value = appState.nickname || "";
    if (inputGuideNickname) inputGuideNickname.value = appState.nickname || "";

    applyTimeOfDayLighting();
    checkDailyStreak();
    applyEventAndLevelModifiers();
    updateHUD();
  }

  function saveGame() {
    const payload = buildSavePayload();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch (_) {
      // Ignore storage errors in private mode
    }
    updateNotificationSchedule();
    scheduleCloudSave(false);
  }

  function maybeShowBackupReminder() {
    if (!Mon || !Mon.MochiCloud) return;
    const meta = Mon.MochiCloud.getMeta();
    if (meta && meta.lastSyncAt) return;
    const totalStars = Object.values(appState.adventureStars || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    if ((appState.bestScore || 0) < 500 && totalStars < 6) return;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (now - (appState.lastBackupRemindAt || 0) < sevenDaysMs) return;
    appState.lastBackupRemindAt = now;
    saveGame();
    setTimeout(() => showBubble(i18n("msg_backup_remind"), 3600), 3200);
  }

  function loadGame() {
    let saved = null;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch (_) {
      saved = null;
    }

    hydrateFromSavePayload(saved, false);
    if (Mon) Mon.MochiAnalytics.track("session_start", { ver: APP_VERSION });
    updateCloudUiSummary();
    runWakeUpSequence();
    if (streakBanner) {
      setTimeout(() => showBubble(streakBanner, 2800), 2100);
      streakBanner = null;
    } else {
      maybeShowBackupReminder();
    }

    let isOnboarded = false;
    try {
      isOnboarded = localStorage.getItem(ONBOARD_KEY) === "1";
    } catch (_) {}
    if (!isOnboarded && !window.location.search.includes("noguide=1") && typeof openWelcomeGuide === "function") {
      setTimeout(() => openWelcomeGuide(0), 650);
    }
  }

  function addDiaryEntry(icon, text) {
    appState.diaryLog = Array.isArray(appState.diaryLog) ? appState.diaryLog : [];
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    appState.diaryLog.unshift({
      icon: icon || "🐾",
      text: String(text || ""),
      time: `${getDateKey()} ${hh}:${mm}`
    });
    if (appState.diaryLog.length > 30) appState.diaryLog.length = 30;
  }

  function renderDiaryModal() {
    if (!diaryList) return;
    const entries = Array.isArray(appState.diaryLog) ? appState.diaryLog : [];
    diaryList.innerHTML = "";
    if (entries.length === 0) {
      const empty = document.createElement("p");
      empty.className = "small-note";
      empty.textContent = i18n("diary_empty");
      diaryList.appendChild(empty);
      return;
    }
    for (const item of entries) {
      const row = document.createElement("div");
      row.className = "diary-entry";
      const ic = document.createElement("span");
      ic.className = "diary-entry-icon";
      ic.textContent = item.icon || "🐾";
      const body = document.createElement("div");
      body.className = "diary-entry-body";
      const txt = document.createElement("span");
      txt.textContent = item.text || "";
      const tm = document.createElement("span");
      tm.className = "diary-entry-time";
      tm.textContent = item.time || "";
      body.appendChild(txt);
      body.appendChild(tm);
      row.appendChild(ic);
      row.appendChild(body);
      diaryList.appendChild(row);
    }
  }

  function triggerHintFlow() {
    ensureAudioUnlocked();
    pet.noteActivity();
    if ((puzzle.hintCharges || 0) <= 0) {
      openRewardedAd(i18n("hint_title"), () => {
        puzzle.addHintCharges(2);
        const h = puzzle.triggerHint();
        if (h) {
          sound.playMilestoneUnlock();
          showBubble(i18n("msg_hint_shown"), 2200);
        } else {
          sound.playInvalid();
          showBubble(i18n("msg_hint_none"), 1800);
        }
        updateHUD();
        saveGame();
      });
      return;
    }
    const hint = puzzle.triggerHint();
    if (hint) {
      sound.playSnap();
      showBubble(i18n("msg_hint_shown"), 2200);
    } else {
      sound.playInvalid();
      showBubble(i18n("msg_hint_none"), 1800);
    }
    updateHUD();
    saveGame();
  }

  puzzle = new window.PuzzleEngine(boardCanvas, fxCanvas, slotCanvases, {
    onSnap: () => {
      sound.playSnap();
    },
    onKeyboardHint: () => {
      triggerHintFlow();
    },
    onIceCrack: () => {
      sound.playIceCrack();
      vibrate([15, 20]);
    },
    onCrateCrack: () => {
      sound.playCrateCrack();
      vibrate([15, 20]);
    },
    onHammerSmash: () => {
      sound.playHammerSmash();
      vibrate(30);
      showBubble(i18n("msg_hammer_empty"), 1600);
    },
    onBlitzTick: (sec) => {
      if (puzzle.mode !== "blitz" || !cravingText) return;
      const safeSec = Math.max(0, sec);
      cravingText.textContent = i18n("blitz_hud_label", {
        sec: safeSec,
        best: appState.blitzBestScore || 0
      });
      if (cravingPill) {
        cravingPill.classList.toggle("is-urgent", safeSec > 0 && safeSec <= 10);
      }
      if (safeSec > 0 && safeSec <= 10 && !appState.powerSaver && typeof sound.playBlitzTick === "function") {
        sound.playBlitzTick(safeSec);
      }
    },
    onBlitzComplete: (finalScore) => {
      const prevBest = appState.blitzBestScore || 0;
      if (finalScore > prevBest) {
        appState.blitzBestScore = finalScore;
      }
      if (cravingPill) cravingPill.classList.remove("is-urgent");
      const rewardFish = Math.max(1, Math.min(8, Math.floor(finalScore / 250)));
      appState.treats += rewardFish;
      grantFriendXp(20 + Math.min(30, Math.floor(finalScore / 150)));
      addDiaryEntry("⏱️", `Blitz 90s: ${finalScore} pts (+${rewardFish} 🐟)`);
      sound.playCravingWin();
      pet.triggerCelebrate("dance", 2.0);
      pet.spawnHearts(5);
      goEmoji.textContent = "⏱️";
      goTitle.textContent = i18n("blitz_win_t");
      goSubtitle.textContent = i18n("blitz_win_s", { score: finalScore, fish: rewardFish });
      if (goRunSummary) goRunSummary.classList.add("hidden");
      renderRunBreakdown(finalScore, prevBest);
      if (btnDoubleRunFishAd) btnDoubleRunFishAd.classList.add("hidden");
      if (btnRescuePackAd) btnRescuePackAd.classList.add("hidden");
      if (btnRematchSeed) btnRematchSeed.classList.add("hidden");
      btnReviveAd.classList.add("hidden");
      goScore.textContent = finalScore;
      goBest.textContent = appState.blitzBestScore || finalScore;
      gameOverModal.classList.remove("hidden");
      updateHUD();
      saveGame();
      pushScoresToCloud("blitz");
    },
    onBombBlast: () => {
      sound.playBomb();
      vibrate([35, 25, 45]);
    },
    onFishArrivedInBowl: () => {
      pet.triggerBowlBounce();
      pet.spawnHearts(2);
    },
    onCravingProgress: (info) => {
      if (puzzle.mode !== "classic") return;
      const c = getActiveCraving();
      let delta = 0;
      if (c.kind === "lines") delta = info.linesCleared || 0;
      else if (c.kind === "fish") delta = info.fishEarned || 0;
      else if (c.kind === "combo" && (info.combo || 0) >= c.target) delta = c.target;
      else if (c.kind === "color" && info.colorName === c.color) delta = 1;

      if (delta <= 0) return;
      appState.cravingProgress = Math.min(c.target, (appState.cravingProgress || 0) + delta);
      if (appState.cravingProgress >= c.target) {
        appState.treats += c.reward;
        sound.playCravingWin();
        cravingPill.classList.add("completed");
        pet.triggerCelebrate("dance", 2.1);
        showBubble(i18n("craving_win", { reward: c.reward }), 2400);
        appState.cravingIndex = ((appState.cravingIndex || 0) + 1) % CRAVINGS.length;
        appState.cravingProgress = 0;
        setTimeout(() => cravingPill.classList.remove("completed"), 1300);
      }
      updateHUD();
      saveGame();
    },
    onDailyComplete: (won) => {
      goScore.textContent = puzzle.score;
      goBest.textContent = appState.bestScore;
      const today = getDateKey();
      const playedKey = puzzle.dailyDateKey || today;
      if (playedKey === today && (appState.dailyBestDate !== today || puzzle.score > (appState.dailyBestScore || 0))) {
        appState.dailyBestDate = today;
        appState.dailyBestScore = puzzle.score;
      }
      if (goRunSummary) goRunSummary.classList.add("hidden");
      if (runBreakdownCard) runBreakdownCard.classList.add("hidden");
      if (btnDoubleRunFishAd) btnDoubleRunFishAd.classList.add("hidden");
      if (btnRescuePackAd) btnRescuePackAd.classList.add("hidden");
      if (btnRematchSeed) btnRematchSeed.classList.add("hidden");
      btnReviveAd.classList.add("hidden");
      if (won) {
        sound.playCravingWin();
        appState.dailyCompletedDates = appState.dailyCompletedDates || {};
        appState.dailyCompletedDates[playedKey] = Math.max(appState.dailyCompletedDates[playedKey] || 0, puzzle.score);
        if (playedKey === today && appState.dailyCompletedDate !== today) {
          appState.dailyCompletedDate = today;
          appState.treats += 5;
          grantFriendXp(30);
        }
        if (window.MochiDailyArchive) {
          const hitMilestones = window.MochiDailyArchive.claimReadyMilestones(appState, playedKey);
          if (hitMilestones.length > 0) {
            const top = hitMilestones[hitMilestones.length - 1];
            showBubble(i18n("archive_ms_win", { days: top.days, fish: top.rewardFish }), 2600);
          }
        }
        pet.triggerCelebrate("dance", 2.2);
        pet.spawnHearts(7);
        goEmoji.textContent = "🏆";
        goTitle.textContent = i18n("go_daily_win_t");
        goSubtitle.textContent = i18n("go_daily_win_s");
      } else {
        sound.playCry();
        pet.triggerState("sad", 0);
        goEmoji.textContent = "😿";
        goTitle.textContent = i18n("go_daily_lose_t");
        goSubtitle.textContent = i18n("go_daily_lose_s");
      }
      if (Mon) Mon.MochiAnalytics.track("run_complete", { mode: "daily", score: puzzle.score, won });
      gameOverModal.classList.remove("hidden");
      updateHUD();
      saveGame();
      pushScoresToCloud("daily");
      scheduleCloudSave(true);
    },
    onAdventureComplete: (won, movesRemaining) => {
      const lv = puzzle.adventureLevel;
      if (!lv || !window.MochiAdventure) return;
      goScore.textContent = puzzle.score;
      goBest.textContent = appState.bestScore;
      if (goRunSummary) goRunSummary.classList.add("hidden");
      if (runBreakdownCard) runBreakdownCard.classList.add("hidden");
      if (btnDoubleRunFishAd) btnDoubleRunFishAd.classList.add("hidden");
      if (btnRescuePackAd) btnRescuePackAd.classList.add("hidden");
      if (btnRematchSeed) btnRematchSeed.classList.add("hidden");
      btnReviveAd.classList.add("hidden");
      if (won) {
        const stars = window.MochiAdventure.computeStars(lv, movesRemaining);
        appState.adventureStars = appState.adventureStars || {};
        const prevStars = Number(appState.adventureStars[String(lv.id)] || 0);
        appState.adventureStars[String(lv.id)] = Math.max(prevStars, stars);
        const reward = prevStars === 0 ? (lv.rewardFish || 4) : Math.max(1, Math.floor((lv.rewardFish || 4) / 2));
        appState.treats += reward;
        grantFriendXp(25 + stars * 10);
        addDiaryEntry("🗺️", `Story Lv.${lv.id}: ${stars}⭐ (+${reward} 🐟)`);
        sound.playCravingWin();
        pet.triggerCelebrate("dance", 2.2);
        pet.spawnHearts(6);
        goEmoji.textContent = "⭐";
        goTitle.textContent = i18n("adv_win_t", { lv: lv.id });
        goSubtitle.textContent = i18n("adv_win_s", { stars, fish: reward });
      } else {
        sound.playCry();
        pet.triggerState("sad", 0);
        goEmoji.textContent = "😿";
        goTitle.textContent = i18n("adv_lose_t");
        goSubtitle.textContent = i18n("adv_lose_s");
      }
      if (Mon) Mon.MochiAnalytics.track("run_complete", { mode: "adventure", level: lv.id, won });
      gameOverModal.classList.remove("hidden");
      updateHUD();
      saveGame();
      scheduleCloudSave(true);
    },
    onChallengeBeaten: (name, targetScore) => {
      const codeKey = `${puzzle.challengeSeed}:${targetScore}`;
      appState.beatenChallengeCodes = appState.beatenChallengeCodes || [];
      if (!appState.beatenChallengeCodes.includes(codeKey)) {
        appState.beatenChallengeCodes.push(codeKey);
        if (appState.beatenChallengeCodes.length > 40) appState.beatenChallengeCodes.shift();
        appState.treats += 5;
        grantFriendXp(30);
      }
      sound.playCravingWin();
      pet.triggerCelebrate("dance", 2.0);
      pet.spawnHearts(6);
      showBubble(i18n("chal_beaten_t", { name: name || "Friend", target: targetScore }), 3000);
      updateHUD();
      saveGame();
    },
    onBoardUpdated: (clearInfo) => {
      syncBowlTarget();
      if (clearInfo && clearInfo.undone) {
        sound.playPickup();
        refreshPetRestingState();
      } else {
        if (overdriveMovesLeft > 0) {
          overdriveMovesLeft = Math.max(0, overdriveMovesLeft - 1);
          if (overdriveMovesLeft === 0) {
            showBubble(i18n("msg_overdrive_end"), 1600);
          }
        }
        if (clearInfo && clearInfo.linesCleared > 0) {
          sound.playClear(clearInfo.combo);
          vibrate(clearInfo.combo >= 2 ? [25, 25, 35] : 25);
          const hasWinterWarmth = activeSeason === "winter" && (appState.equippedGadgets || []).includes("heater");
          const moodMult = hasWinterWarmth ? 1.15 : 1;
          appState.mood = Math.min(100, appState.mood + Math.round(clearInfo.linesCleared * 6 * moodMult));
          appState.quests = appState.quests || { pets: 0, plays: 0, lines: 0, combos: 0 };
          appState.quests.lines += clearInfo.linesCleared;
          appState.statsTotalLines = (appState.statsTotalLines || 0) + clearInfo.linesCleared;
          appState.statsMaxCombo = Math.max(appState.statsMaxCombo || 0, clearInfo.combo || 0);
          if (clearInfo.combo >= 2) {
            appState.quests.combos += 1;
          }
          grantFriendXp(clearInfo.linesCleared * 10);
          if (Mon) {
            Mon.MochiAnalytics.track("lines_cleared", { count: clearInfo.linesCleared });
            if (clearInfo.fishEarned > 0) Mon.MochiAnalytics.track("fish_earned", { count: clearInfo.fishEarned });
          }
          pet.triggerCelebrate(clearInfo.combo >= 3 ? "dance" : "cheer", 1.6);
          pet.spawnHearts(2 + clearInfo.linesCleared);

          if (clearInfo.combo >= 3 && getMochiEnergy() >= 90) {
            startPurrRush();
          } else if (clearInfo.combo >= 2) {
            comboToast.textContent = `COMBO x${clearInfo.combo}!`;
            comboToast.classList.remove("hidden");
            clearTimeout(comboTimeout);
            comboTimeout = setTimeout(() => comboToast.classList.add("hidden"), 1300);
          }
          if (clearInfo.fishEarned > 0) {
            showBubble(i18n("msg_fish_clear", { n: clearInfo.fishEarned }), 1800);
          }
          if (clearInfo.giftsCleared > 0 && !giftUpgradeUsedThisRun && btnGiftUpgradeAd) {
            const cfg = Mon ? Mon.loadRemoteConfig() : { giftAdBonusFish: 4 };
            const bonusF = cfg.giftAdBonusFish || 4;
            btnGiftUpgradeAd.textContent = i18n("msg_gift_up_pill", { n: bonusF });
            btnGiftUpgradeAd.classList.remove("hidden");
            clearTimeout(giftUpgradeHideTimer);
            giftUpgradeHideTimer = setTimeout(() => {
              if (btnGiftUpgradeAd) btnGiftUpgradeAd.classList.add("hidden");
            }, 9500);
          }
          if (clearInfo.milestoneReached) {
            const lv = Mon ? Mon.computeFriendLevel(appState.friendXp || 0) : { milestoneFishBonus: 0 };
            if (lv.milestoneFishBonus > 0) appState.treats += lv.milestoneFishBonus;
            if (Math.random() < 0.6) {
              grantAlbumCardRoll("milestone");
            }
          }
        } else {
          sound.playPlace();
          vibrate(10);
          movesSinceHungerTick += 1;
          if (movesSinceHungerTick >= 2) {
            movesSinceHungerTick = 0;
            if (appState.hunger > 15) {
              appState.hunger = Math.max(15, appState.hunger - 2);
            }
          }
          refreshPetRestingState();
        }
      }
      updateHUD();
      saveGame();
    },
    onFishCollected: (px, py, amount = 1) => {
      syncBowlTarget();
      appState.treats += Math.max(1, amount || 1);
      updateHUD();
    },
    onGameOver: () => {
      sound.playCry();
      appState.mood = Math.max(10, appState.mood - 18);
      pet.triggerState("sad", 0);
      showBubble(i18n("msg_no_moves"), 0);
      goEmoji.textContent = "😿";
      goTitle.textContent = i18n("go_classic_lose_t");
      goSubtitle.textContent = i18n("go_classic_lose_s");
      btnReviveAd.classList.remove("hidden");
      if (btnRescuePackAd) btnRescuePackAd.classList.remove("hidden");
      if (btnRematchSeed) btnRematchSeed.classList.toggle("hidden", puzzle.mode !== "classic");
      const runFish = puzzle.runFishEarned || 0;
      const runLines = puzzle.runLinesCleared || 0;
      if (puzzle.score > 0 && puzzle.score >= (appState.bestScore || 0)) {
        addDiaryEntry("🏆", `New Best Score: ${puzzle.score} pts!`);
      }
      if (goRunSummary) {
        goRunSummary.textContent = i18n("go_run_summary", { lines: runLines, fish: runFish });
        goRunSummary.classList.remove("hidden");
      }
      renderRunBreakdown(puzzle.score, appState.bestScore || 0);
      if (btnDoubleRunFishAd) {
        const showDouble = runFish > 0 && !runFishDoubledThisRun;
        btnDoubleRunFishAd.classList.toggle("hidden", !showDouble);
        if (goDoubleFishLabel && showDouble) {
          goDoubleFishLabel.textContent = `${i18n("go_double_fish")} (+${runFish} 🐟)`;
        }
      }
      goScore.textContent = puzzle.score;
      goBest.textContent = appState.bestScore;
      if (Mon) Mon.MochiAnalytics.track("run_complete", { mode: "classic", score: puzzle.score, fish: runFish });
      gameOverModal.classList.remove("hidden");
      updateHUD();
      saveGame();
      pushScoresToCloud("classic");
      scheduleCloudSave(true);
    },
    onSpecialSeen: (kind) => {
      appState.seenSpecialTips = appState.seenSpecialTips || [];
      if (appState.seenSpecialTips.includes(kind)) return;
      appState.seenSpecialTips.push(kind);
      const tipKey = `tip_special_${kind}`;
      const msg = i18n(tipKey);
      if (msg && msg !== tipKey) {
        showBubble(msg, 3400);
      }
      saveGame();
    }
  });

  // Feeding Mochi (either via button or dragging fish from bowl!)
  function feedMochi(directFromDrag = false) {
    ensureAudioUnlocked();
    pet.noteActivity();
    if (appState.treats <= 0) {
      openRewardedAd(i18n("ad_lbl_feed"), () => {
        appState.treats += 3;
        updateHUD();
        saveGame();
        feedMochi(false);
      });
      return;
    }

    const wasFainted = isMochiFainted() || pet.state === "fainted";
    appState.treats -= 1;
    if (wasFainted) {
      reviveFaintedMochi("fish");
      return;
    }

    appState.hunger = Math.min(100, appState.hunger + 28);
    appState.mood = Math.min(100, appState.mood + 30);
    grantFriendXp(15);
    sound.playEat();
    setTimeout(() => sound.playPurr(1.15), 220);
    pet.startPurr(1.25);
    vibrate(25);

    if (directFromDrag) {
      pet.triggerState("eating", 1.8);
      pet.spawnHearts(5);
    } else {
      pet.spawnSnackFeed(pet.width * 0.78, 22);
    }
    showBubble(i18n("msg_feed_yay"), 2400);
    addDiaryEntry("🐟", "Fed Mochi a tasty fish treat!");
    updateHUD();
    saveGame();
  }

  btnFeed.addEventListener("click", () => feedMochi(false));
  if (btnReviveFaintedAd) {
    btnReviveFaintedAd.addEventListener("click", () => {
      ensureAudioUnlocked();
      promptFaintedReviveAd();
    });
  }
  btnSnackAd.addEventListener("click", () => {
    ensureAudioUnlocked();
    openRewardedAd(i18n("ad_lbl_snack"), () => {
      appState.treats += 3;
      updateHUD();
      saveGame();
      showBubble(i18n("msg_snack_yay"), 2200);
    });
  });

  function triggerInteractiveToy() {
    ensureAudioUnlocked();
    if (pet.state === "fainted") {
      sound.playFainted();
      promptFaintedReviveAd();
      return;
    }
    if (pet.state === "sleeping") triggerWakeUpNow();
    const activeToy = TOYS.find((t) => t.id === (appState.equippedToy || "yarn")) || TOYS[0];
    pet.playActiveToy();
    sound.playToySound(activeToy.id);
    setTimeout(() => sound.playMeowHappy(), 420);
    appState.quests = appState.quests || { pets: 0, plays: 0, lines: 0, combos: 0 };
    appState.quests.plays += 1;
    const now = performance.now();
    if (now - lastToyMoodAt > 1800) {
      lastToyMoodAt = now;
      appState.mood = Math.min(100, appState.mood + (activeToy.moodGain || 5));
      grantFriendXp(8);
    }
    showBubble(i18n("msg_playtime", { icon: activeToy.icon }), 1600);
    updateHUD();
    saveGame();
  }

  function triggerFountainInteract() {
    ensureAudioUnlocked();
    if (pet.state === "fainted") {
      promptFaintedReviveAd();
      return;
    }
    const now = performance.now();
    pet.triggerFountainSip();
    sound.playWaterSip();
    if (now - lastFountainSipAt > 25000) {
      lastFountainSipAt = now;
      appState.hunger = Math.min(100, appState.hunger + 6);
      appState.mood = Math.min(100, appState.mood + 6);
      showBubble(i18n("msg_fountain_sip"), 1700);
      refreshPetRestingState();
    } else {
      showBubble(i18n("msg_fountain_splash"), 1200);
    }
    updateHUD();
    saveGame();
  }

  function triggerFeederInteract() {
    ensureAudioUnlocked();
    if (pet.state === "fainted") {
      promptFaintedReviveAd();
      return;
    }
    refreshDailyDispenserCharge(getDateKey());
    if ((appState.dispenserFreeLeft || 0) > 0) {
      appState.dispenserFreeLeft -= 1;
      pet.triggerFeederDispense();
      sound.playFeederDrop();
      appState.hunger = Math.min(100, appState.hunger + 16);
      appState.mood = Math.min(100, appState.mood + 10);
      showBubble(i18n("msg_dispenser_daily"), 1900);
      refreshPetRestingState();
      updateHUD();
      saveGame();
    } else {
      openRewardedAd(i18n("ad_lbl_dispenser"), () => {
        pet.triggerFeederDispense();
        sound.playFeederDrop();
        appState.hunger = Math.min(100, appState.hunger + 16);
        appState.mood = Math.min(100, appState.mood + 10);
        showBubble(i18n("msg_dispenser_refill"), 1900);
        refreshPetRestingState();
        updateHUD();
        saveGame();
      });
    }
  }

  function triggerWheelInteract() {
    ensureAudioUnlocked();
    if (pet.state === "fainted") {
      promptFaintedReviveAd();
      return;
    }
    pet.triggerWheelSpin();
    sound.playWheelSpin();
    const now = performance.now();
    if (now - lastWheelSpinAt > 12000) {
      lastWheelSpinAt = now;
      appState.mood = Math.min(100, appState.mood + 7);
    }
    showBubble(i18n("msg_wheel_zoomies"), 1700);
    updateHUD();
    saveGame();
  }

  if (btnPlayToy) btnPlayToy.addEventListener("click", triggerInteractiveToy);
  if (btnOverdriveAd) {
    btnOverdriveAd.addEventListener("click", () => {
      ensureAudioUnlocked();
      if (overdriveMovesLeft > 0) {
        showBubble(i18n("msg_overdrive_left", { n: overdriveMovesLeft }), 1800);
        return;
      }
      openRewardedAd(i18n("ad_lbl_overdrive"), () => {
        overdriveMovesLeft = 15;
        sound.playMilestoneUnlock();
        pet.triggerCelebrate("fever_party", 2.1);
        showBubble(i18n("msg_overdrive_on"), 2400);
        updateHUD();
      });
    });
  }
  if (energyMultPill) {
    energyMultPill.addEventListener("click", () => {
      const e = getMochiEnergy();
      const m = getScoreMultiplier();
      showBubble(i18n("msg_energy_tip", { e, m }), 2300);
    });
  }

  // Petting Mochi, 6-tap Tickle sneeze Easter Egg, Interactive Toys, Fountain/Feeder, or Dragging Fish
  const rapidTapTimes = [];
  let pendingPurrTimer = null;
  petCanvas.addEventListener("pointerdown", (e) => {
    ensureAudioUnlocked();
    pet.noteActivity();
    if (pet.state === "tickle") {
      return;
    }
    if (pet.state === "sleeping") {
      triggerWakeUpNow();
      return;
    }
    if (pet.state === "fainted") {
      sound.playFainted();
      promptFaintedReviveAd();
      return;
    }
    if (pet.isPointOverFountain(e.clientX, e.clientY)) {
      triggerFountainInteract();
      return;
    }
    if (pet.isPointOverFeeder(e.clientX, e.clientY)) {
      triggerFeederInteract();
      return;
    }
    if (pet.isPointOverWheel(e.clientX, e.clientY)) {
      triggerWheelInteract();
      return;
    }
    if (pet.isPointOverToy(e.clientX, e.clientY)) {
      triggerInteractiveToy();
      return;
    }
    if (appState.treats > 0 && pet.isPointOverBowl(e.clientX, e.clientY)) {
      draggingSnack = true;
      pet.setDraggedSnack(e.clientX, e.clientY);
      sound.playPickup();
      e.preventDefault();
      return;
    }
    const petZone = typeof pet.getPetZone === "function" ? pet.getPetZone(e.clientX, e.clientY) : null;
    const res = pet.poke();
    if (res === "tickle") {
      return;
    }
    if (res === "sulking") {
      sound.playMeowGrumpy();
      showBubble(i18n("msg_no_pets_sulk"), 2000);
    } else if (res === "sad") {
      sound.playCry();
      showBubble(i18n("msg_please_revive"), 2000);
    } else {
      const nowMs = performance.now();
      rapidTapTimes.push(nowMs);
      while (rapidTapTimes.length > 0 && nowMs - rapidTapTimes[0] > 2400) {
        rapidTapTimes.shift();
      }
      if (rapidTapTimes.length >= 6) {
        rapidTapTimes.length = 0;
        clearTimeout(pendingPurrTimer);
        pendingPurrTimer = null;
        pet.triggerState("tickle", 1.9);
        sound.playTickle();
        vibrate([15, 25, 20]);
        appState.mood = Math.min(100, appState.mood + 3);
        showBubble(i18n("msg_achoo"), 1900);
        updateHUD();
        return;
      }

      sound.playMeowHappy();
      clearTimeout(pendingPurrTimer);
      pendingPurrTimer = setTimeout(() => {
        if (pet.state !== "tickle") {
          sound.playPurr(1.5);
        }
      }, petZone === "chin" ? 80 : 350);
      pet.startPurr(1.5, true);
      if (petZone === "ears" || petZone === "chin") {
        pet.spawnHearts(petZone === "chin" ? 4 : 3);
      }
      appState.mood = Math.min(100, appState.mood + (petZone === "chin" ? 3 : 2));
      appState.quests = appState.quests || { pets: 0, plays: 0, lines: 0, combos: 0 };
      appState.quests.pets += 1;
      showBubble(petZone === "chin" ? i18n("msg_chin_purr") : i18n("msg_purr"), 1600);
      updateHUD();
    }
  });

  // Stroking / moving finger or cursor over Mochi makes him purr!
  let lastStrokePurrAt = 0;
  petCanvas.addEventListener("pointermove", (e) => {
    if (draggingSnack || puzzle.drag) return;
    pet.noteActivity();
    pet.setLookAt(e.clientX, e.clientY);

    if (pet.state === "sleeping" || pet.state === "sad" || pet.state === "sulking" || pet.state === "fainted" || pet.state === "tickle") return;
    if (!pet.isPointOverCat(e.clientX, e.clientY)) return;

    const now = performance.now();
    if (now - lastStrokePurrAt < 900) return;
    lastStrokePurrAt = now;

    ensureAudioUnlocked();
    sound.playPurr(0.95);
    pet.startPurr(1.0);
    if (e.pointerType === "touch") vibrate(12);
    appState.mood = Math.min(100, appState.mood + 1);
    showBubble(i18n("msg_purr"), 1400);
    updateHUD();
  });

  petCanvas.addEventListener("pointerleave", () => {
    if (!draggingSnack && !puzzle.drag) {
      pet.resetLook();
    }
  });

  // Dragging pieces from Tray & Hold Pocket
  if (holdCanvas) {
    puzzle.setHoldSlotCanvas(holdCanvas);
  }
  if (holdSlot) {
    holdSlot.addEventListener("pointerdown", (e) => {
      ensureAudioUnlocked();
      pet.noteActivity();
      if (pet.state === "sleeping") triggerWakeUpNow();
      const isTouch = e.pointerType === "touch";
      if (puzzle.startDrag(-1, e.clientX, e.clientY, isTouch)) {
        sound.playPickup();
        pet.setLookAt(e.clientX, e.clientY);
        e.preventDefault();
      }
    });
  }

  traySlots.forEach((slotEl) => {
    slotEl.addEventListener("pointerdown", (e) => {
      ensureAudioUnlocked();
      pet.noteActivity();
      if (pet.state === "sleeping") triggerWakeUpNow();
      const idx = Number(slotEl.dataset.slot);
      const isTouch = e.pointerType === "touch";
      if (puzzle.startDrag(idx, e.clientX, e.clientY, isTouch)) {
        sound.playPickup();
        pet.setLookAt(e.clientX, e.clientY);
        e.preventDefault();
      }
    });
  });

  window.addEventListener("pointermove", (e) => {
    if (draggingSnack) {
      pet.noteActivity();
      pet.setDraggedSnack(e.clientX, e.clientY);
      return;
    }
    if (!puzzle.drag) return;
    pet.noteActivity();
    puzzle.updateDrag(e.clientX, e.clientY);
    pet.setLookAt(e.clientX, e.clientY);
  });

  function finishPointerDrag(e) {
    if (draggingSnack) {
      draggingSnack = false;
      const fed = e && e.clientX !== undefined && pet.isPointNearMouth(e.clientX, e.clientY);
      pet.clearDraggedSnack();
      if (fed) {
        feedMochi(true);
      } else {
        sound.playInvalid();
      }
      return;
    }
    if (!puzzle.drag) return;
    const result = puzzle.endDrag();
    pet.resetLook();
    if (result === "invalid") {
      sound.playInvalid();
    }
  }

  window.addEventListener("pointerup", finishPointerDrag);
  window.addEventListener("pointercancel", finishPointerDrag);

  // Settings & Bug Report Modals
  function buildDiagnosticsText() {
    const lines = [
      `App: Mochi Pop! v${APP_VERSION}`,
      `Player: ${appState.nickname || "Guest"} | Lang: ${appState.language || "en"} | Zen: ${Boolean(appState.zenMode)}`,
      `Platform: ${navigator.userAgent}`,
      `Screen: ${window.innerWidth}x${window.innerHeight}`,
      `Score: ${puzzle.score} | Best: ${appState.bestScore} | Fish: ${appState.treats}`,
      `Pet State: ${pet.state} | Hunger: ${appState.hunger}% | Mood: ${appState.mood}%`,
      `Settings: music=${appState.musicEnabled}(${Math.round((appState.musicVolume ?? 0.7) * 100)}%), sfx=${appState.sfxEnabled}(${Math.round((appState.sfxVolume ?? 0.85) * 100)}%), cat=${appState.catEnabled}(${Math.round((appState.catVolume ?? 0.9) * 100)}%), fx=${appState.fxEnabled}, haptics=${appState.hapticsEnabled}`,
      `Errors (${errorLog.length}):`,
      errorLog.length ? errorLog.join("\n") : "None recorded"
    ];
    return lines.join("\n");
  }

  function openAudioModal() {
    ensureAudioUnlocked();
    applyAudioSettings();
    audioModal.classList.remove("hidden");
  }

  btnAudio.addEventListener("click", openAudioModal);
  btnOpenAudioFromSettings.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
    openAudioModal();
  });
  btnCloseAudio.addEventListener("click", () => audioModal.classList.add("hidden"));
  audioModal.addEventListener("click", (e) => {
    if (e.target === audioModal) audioModal.classList.add("hidden");
  });

  AUDIO_CHANNELS.forEach((ch) => {
    if (ch.toggle) {
      ch.toggle.addEventListener("change", () => {
        ensureAudioUnlocked();
        appState[ch.enabledKey] = ch.toggle.checked;
        if (ch.toggle.checked && (appState[ch.volKey] || 0) <= 0.01) {
          appState[ch.volKey] = ch.defaultVol;
        }
        applyAudioSettings();
        if (ch.toggle.checked) ch.preview();
        saveGame();
      });
    }
    if (ch.slider) {
      ch.slider.addEventListener("input", () => {
        ensureAudioUnlocked();
        const vol = Math.max(0, Math.min(1, Number(ch.slider.value) / 100));
        appState[ch.volKey] = vol;
        if (vol > 0.005 && appState[ch.enabledKey] === false) {
          appState[ch.enabledKey] = true;
        }
        applyAudioSettings();
      });
      ch.slider.addEventListener("change", () => {
        if (appState[ch.enabledKey] !== false && appState[ch.volKey] > 0.005) {
          ch.preview();
        }
        saveGame();
      });
    }
  });

  function getInstalledAppVersion() {
    try {
      if (window.MochiAndroid && typeof window.MochiAndroid.getAppVersion === "function") {
        const v = String(window.MochiAndroid.getAppVersion() || "").trim();
        if (v) return v.replace(/^v/i, "");
      }
    } catch (_) {}
    return APP_VERSION;
  }

  function compareSemver(a, b) {
    const pa = String(a || "0").replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
    const pb = String(b || "0").replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
    const len = Math.max(pa.length, pb.length, 3);
    for (let i = 0; i < len; i++) {
      const da = pa[i] || 0;
      const db = pb[i] || 0;
      if (da !== db) return da > db ? 1 : -1;
    }
    return 0;
  }

  function loadUpdateMeta() {
    try {
      const raw = localStorage.getItem(UPDATE_META_KEY);
      if (raw) return Object.assign({ lastCheckAt: 0, latestVersion: "", apkUrl: "", autoDownloadedVersion: "" }, JSON.parse(raw));
    } catch (_) {}
    return { lastCheckAt: 0, latestVersion: "", apkUrl: "", autoDownloadedVersion: "" };
  }

  function saveUpdateMeta(meta) {
    try {
      localStorage.setItem(UPDATE_META_KEY, JSON.stringify(meta));
    } catch (_) {}
  }

  function formatShortTime(ts) {
    if (!ts) return "never";
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  let updateCheckInFlight = false;
  function renderUpdateStatus(customText, highlightUpdate = false) {
    if (!updateStatusText) return;
    const currentVer = getInstalledAppVersion();
    const meta = loadUpdateMeta();
    const hasUpdate = Boolean(meta.latestVersion && compareSemver(meta.latestVersion, currentVer) > 0);
    if (settingsBadgeDot) settingsBadgeDot.classList.toggle("hidden", !hasUpdate);

    if (customText) {
      updateStatusText.textContent = customText;
      updateStatusText.classList.toggle("has-update", Boolean(highlightUpdate || hasUpdate));
      return;
    }

    if (hasUpdate) {
      updateStatusText.textContent = `🎉 Update v${meta.latestVersion} available (current v${currentVer})`;
      updateStatusText.classList.add("has-update");
    } else if (meta.lastCheckAt) {
      updateStatusText.textContent = `✅ Up to date (v${currentVer}) • Checked ${formatShortTime(meta.lastCheckAt)} (auto 6h)`;
      updateStatusText.classList.remove("has-update");
    } else {
      updateStatusText.textContent = `Auto-checks every 6 hours • v${currentVer}`;
      updateStatusText.classList.remove("has-update");
    }
  }

  async function fetchLatestReleaseInfo() {
    try {
      const res = await fetch(RELEASES_API_URL, {
        cache: "no-store",
        headers: { Accept: "application/vnd.github+json" },
      });
      if (res.ok) {
        const data = await res.json();
        const ver = String(data.tag_name || "").replace(/^v/i, "").trim();
        const assets = Array.isArray(data.assets) ? data.assets : [];
        const apkAsset =
          assets.find((a) => a && a.name === "mochi-pop-puzzle.apk") ||
          assets.find((a) => a && typeof a.name === "string" && a.name.endsWith(".apk"));
        if (ver) {
          return {
            version: ver,
            apkUrl: (apkAsset && apkAsset.browser_download_url) || FALLBACK_APK_URL,
          };
        }
      }
    } catch (_) {}

    const fbRes = await fetch(`${VERSION_JSON_FALLBACK_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!fbRes.ok) {
      throw new Error(`HTTP ${fbRes.status}`);
    }
    const fb = await fbRes.json();
    if (fb && fb.remoteConfig && Mon) {
      Mon.mergeRemoteConfig(fb.remoteConfig);
      applyEventAndLevelModifiers();
    }
    const fbVer = String(fb.version || fb.tag || "").replace(/^v/i, "").trim();
    if (!fbVer) throw new Error("Missing version field");
    return {
      version: fbVer,
      apkUrl: fb.apkUrl || FALLBACK_APK_URL,
    };
  }

  function openUpdatePageInBrowser(apkUrl, latestVersion, isManual) {
    if (!isManual) return false;
    if (window.MochiAndroid && typeof window.MochiAndroid.openExternalUrl === "function") {
      window.MochiAndroid.openExternalUrl(apkUrl || FALLBACK_APK_URL);
      renderUpdateStatus(`🌐 Opening v${latestVersion} download in browser...`, true);
      if (pet && typeof pet.showSpeech === "function") {
        pet.showSpeech(`Update v${latestVersion} ready! 📦`);
      }
      return true;
    }

    const a = document.createElement("a");
    a.href = apkUrl || FALLBACK_APK_URL;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    renderUpdateStatus(`📥 Opening Mochi Pop! v${latestVersion} download`, true);
    return true;
  }

  async function checkForAppUpdate(options = {}) {
    const manual = Boolean(options.manual);
    if (updateCheckInFlight) return;
    updateCheckInFlight = true;
    if (btnCheckUpdates) btnCheckUpdates.disabled = true;
    if (manual) renderUpdateStatus("⏳ Checking for new release...");

    const meta = loadUpdateMeta();
    const currentVer = getInstalledAppVersion();

    try {
      const info = await fetchLatestReleaseInfo();
      meta.lastCheckAt = Date.now();
      meta.latestVersion = info.version;
      meta.apkUrl = info.apkUrl;

      if (compareSemver(info.version, currentVer) > 0) {
        if (settingsBadgeDot) settingsBadgeDot.classList.remove("hidden");
        saveUpdateMeta(meta);
        if (manual) {
          openUpdatePageInBrowser(info.apkUrl, info.version, true);
        } else {
          renderUpdateStatus(`🎉 Update v${info.version} available — tap Check Update`, true);
        }
      } else {
        meta.autoDownloadedVersion = "";
        saveUpdateMeta(meta);
        if (settingsBadgeDot) settingsBadgeDot.classList.add("hidden");
        renderUpdateStatus(null, false);
      }
    } catch (err) {
      recordError("update-check", err && err.message ? err.message : "Failed");
      if (manual) {
        renderUpdateStatus("⚠️ Could not reach update server. Try again shortly.", false);
      }
    } finally {
      updateCheckInFlight = false;
      if (btnCheckUpdates) btnCheckUpdates.disabled = false;
    }
  }

  function maybeAutoCheckForUpdate() {
    if (window.location.search.includes("noupdate=1")) return;
    const meta = loadUpdateMeta();
    if (!meta.lastCheckAt || Date.now() - meta.lastCheckAt >= UPDATE_CHECK_INTERVAL_MS) {
      checkForAppUpdate({ manual: false });
    }
  }

  // Language, Nickname & 5-Step Welcome Onboarding Guide + Permissions
  let currentGuideStep = 0;
  const TOTAL_GUIDE_STEPS = 5;

  function applyLanguageChoice(lang) {
    if (!window.MochiI18n) return;
    const chosen = window.MochiI18n.setLanguage(lang);
    appState.language = chosen;
    if (selectLanguage) selectLanguage.value = chosen;
    syncGuideLangButtons();
    renderGuideStep();
    renderPermButtons();
    applyEventAndLevelModifiers();
    updateWheelUi();
    updateHUD();
    saveGame();
  }

  let profileSyncTimer = null;
  function updateNickname(rawVal) {
    const clean = String(rawVal || "").replace(/[<>]/g, "").slice(0, 18);
    appState.nickname = clean;
    if (inputSettingsNickname && inputSettingsNickname.value !== clean) {
      inputSettingsNickname.value = clean;
    }
    if (inputGuideNickname && inputGuideNickname.value !== clean) {
      inputGuideNickname.value = clean;
    }
    if (inputLeagueNick && inputLeagueNick.value !== clean) {
      inputLeagueNick.value = clean;
    }
    saveGame();
    if (Mon && Mon.MochiCloud && Mon.MochiCloud.getMeta().playerId) {
      clearTimeout(profileSyncTimer);
      profileSyncTimer = setTimeout(() => {
        const today = getDateKey();
        Mon.MochiCloud.updateNickname(clean, [today, getLeagueDateKey("weekly", today)]).catch(() => {});
      }, 900);
    }
  }

  function syncGuideLangButtons() {
    if (!guideLangGrid || !window.MochiI18n) return;
    const active = window.MochiI18n.getLanguage();
    guideLangGrid.querySelectorAll(".guide-lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === active);
    });
  }

  function renderPermButtons() {
    if (btnPermNotif) {
      let granted = false;
      try {
        if (window.MochiAndroid && typeof window.MochiAndroid.getNotificationPermissionState === "function") {
          granted = window.MochiAndroid.getNotificationPermissionState() === "granted";
        } else if (typeof Notification !== "undefined") {
          granted = Notification.permission === "granted";
        }
      } catch (_) {}
      btnPermNotif.textContent = i18n(granted ? "p_notif_ok" : "p_notif_btn");
      btnPermNotif.classList.toggle("is-granted", granted);
    }
  }

  function renderGuideStep() {
    if (!welcomeGuideModal) return;
    const steps = welcomeGuideModal.querySelectorAll(".guide-step");
    steps.forEach((el) => {
      const idx = Number(el.dataset.step);
      el.classList.toggle("hidden", idx !== currentGuideStep);
    });
    if (guideDots) {
      const dots = guideDots.querySelectorAll(".guide-dot");
      dots.forEach((d, idx) => d.classList.toggle("active", idx === currentGuideStep));
    }
    if (guideStepBadge) {
      guideStepBadge.textContent = i18n("guide_step_tag", { n: currentGuideStep + 1, total: TOTAL_GUIDE_STEPS });
    }
    if (btnGuideBack) {
      btnGuideBack.classList.toggle("hidden", currentGuideStep === 0);
    }
    if (btnGuideNext) {
      btnGuideNext.textContent = i18n(currentGuideStep >= TOTAL_GUIDE_STEPS - 1 ? "guide_start" : "guide_next");
    }
    if (guideBodyScroll) guideBodyScroll.scrollTop = 0;
  }

  function openWelcomeGuide(startStep = 0) {
    if (!welcomeGuideModal) return;
    currentGuideStep = Math.max(0, Math.min(TOTAL_GUIDE_STEPS - 1, startStep));
    syncGuideLangButtons();
    if (inputGuideNickname) inputGuideNickname.value = appState.nickname || "";
    renderPermButtons();
    renderGuideStep();
    welcomeGuideModal.classList.remove("hidden");
  }

  function closeWelcomeGuide() {
    if (!welcomeGuideModal) return;
    welcomeGuideModal.classList.add("hidden");
    try {
      localStorage.setItem(ONBOARD_KEY, "1");
    } catch (_) {}
    saveGame();
  }

  window.onMochiPermissionUpdate = function () {
    renderPermButtons();
  };

  if (guideLangGrid) {
    guideLangGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".guide-lang-btn");
      if (!btn || !btn.dataset.lang) return;
      ensureAudioUnlocked();
      sound.playSnap();
      applyLanguageChoice(btn.dataset.lang);
    });
  }

  if (selectLanguage) {
    selectLanguage.addEventListener("change", () => {
      applyLanguageChoice(selectLanguage.value);
    });
  }

  if (inputGuideNickname) {
    inputGuideNickname.addEventListener("input", () => updateNickname(inputGuideNickname.value));
  }
  if (inputSettingsNickname) {
    inputSettingsNickname.addEventListener("input", () => updateNickname(inputSettingsNickname.value));
  }

  if (btnGuideNext) {
    btnGuideNext.addEventListener("click", () => {
      ensureAudioUnlocked();
      sound.playSnap();
      if (currentGuideStep >= TOTAL_GUIDE_STEPS - 1) {
        closeWelcomeGuide();
        showBubble(i18n("msg_welcome_guide", { name: appState.nickname ? " " + appState.nickname : "" }), 2200);
      } else {
        currentGuideStep += 1;
        renderGuideStep();
      }
    });
  }
  if (btnGuideBack) {
    btnGuideBack.addEventListener("click", () => {
      if (currentGuideStep > 0) {
        currentGuideStep -= 1;
        renderGuideStep();
      }
    });
  }
  if (btnGuideSkip) {
    btnGuideSkip.addEventListener("click", closeWelcomeGuide);
  }
  if (btnOpenGuide) {
    btnOpenGuide.addEventListener("click", () => {
      settingsModal.classList.add("hidden");
      openWelcomeGuide(0);
    });
  }

  if (btnPermNotif) {
    btnPermNotif.addEventListener("click", async () => {
      try {
        if (window.MochiAndroid && typeof window.MochiAndroid.requestNotificationPermission === "function") {
          window.MochiAndroid.requestNotificationPermission();
        } else if (typeof Notification !== "undefined" && typeof Notification.requestPermission === "function") {
          await Notification.requestPermission();
        }
      } catch (_) {}
      renderPermButtons();
    });
  }
  if (btnPermVibrate) {
    btnPermVibrate.addEventListener("click", () => {
      vibrate([30, 35, 30]);
      btnPermVibrate.classList.add("is-granted");
    });
  }

  window.onMochiAppPause = function () {
    if (sound && typeof sound.pauseForBackground === "function") {
      sound.pauseForBackground();
    }
  };
  window.onMochiAppResume = function () {
    if (sound && typeof sound.resumeFromBackground === "function") {
      sound.resumeFromBackground();
    }
  };
  window.onMochiForegroundCheck = function () {
    renderPermButtons();
    maybeAutoCheckForUpdate();
  };

  function switchSettingsTab(tabKey) {
    const map = {
      general: settingsPaneGeneral,
      vip: settingsPaneVip,
      app: settingsPaneApp
    };
    if (settingsTabs) {
      settingsTabs.querySelectorAll("[data-settings-tab]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.settingsTab === tabKey);
      });
    }
    Object.keys(map).forEach((k) => {
      if (map[k]) map[k].classList.toggle("hidden", k !== tabKey);
    });
  }

  if (settingsTabs) {
    settingsTabs.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-settings-tab]");
      if (!btn) return;
      switchSettingsTab(btn.dataset.settingsTab || "general");
    });
  }

  if (btnMoreApps) {
    btnMoreApps.addEventListener("click", () => {
      const url = "https://jemangr.app";
      if (window.MochiAndroid && typeof window.MochiAndroid.openExternalUrl === "function") {
        window.MochiAndroid.openExternalUrl(url);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    });
  }

  if (btnPrivacyPolicy && privacyModal) {
    btnPrivacyPolicy.addEventListener("click", () => {
      if (privacyFrame) {
        const langParam = appState.language === "el" ? "el" : "en";
        privacyFrame.src = `privacy.html?lang=${langParam}`;
      }
      privacyModal.classList.remove("hidden");
    });
  }
  if (btnClosePrivacy && privacyModal) {
    btnClosePrivacy.addEventListener("click", () => privacyModal.classList.add("hidden"));
  }

  if (btnOpenCloudSync && cloudModal) {
    btnOpenCloudSync.addEventListener("click", async () => {
      settingsModal.classList.add("hidden");
      if (cloudFeedbackText) cloudFeedbackText.classList.add("hidden");
      if (inputRestoreCode) inputRestoreCode.value = "";
      updateCloudUiSummary();
      cloudModal.classList.remove("hidden");
      if (Mon && Mon.MochiCloud) {
        try {
          await Mon.MochiCloud.ensureRegistered(appState.nickname || "");
          updateCloudUiSummary();
        } catch (_) {
          if (cloudStatusBadge) cloudStatusBadge.textContent = "📴 Offline — try again with internet";
        }
      }
    });
  }
  if (btnCloseCloud && cloudModal) {
    btnCloseCloud.addEventListener("click", () => cloudModal.classList.add("hidden"));
  }
  if (btnCopySyncCode) {
    btnCopySyncCode.addEventListener("click", async () => {
      const code = cloudSyncCodeText ? cloudSyncCodeText.textContent.trim() : "";
      if (!code || code.includes("•")) return;
      try {
        await navigator.clipboard.writeText(code);
        if (cloudFeedbackText) {
          cloudFeedbackText.textContent = `📋 Copied: ${code}`;
          cloudFeedbackText.classList.remove("hidden", "is-error");
        }
      } catch (_) {}
    });
  }
  if (btnCloudSyncNow) {
    btnCloudSyncNow.addEventListener("click", () => performCloudSyncNow(true));
  }
  if (btnTestCloudHealth && cloudHealthText) {
    btnTestCloudHealth.addEventListener("click", async () => {
      if (!Mon || !Mon.MochiCloud || typeof Mon.MochiCloud.checkHealth !== "function") return;
      cloudHealthText.textContent = "⏳ ...";
      cloudHealthText.classList.remove("ok", "err");
      try {
        const res = await Mon.MochiCloud.checkHealth();
        cloudHealthText.textContent = `✅ Online (${res.latencyMs} ms)`;
        cloudHealthText.classList.add("ok");
      } catch (_) {
        cloudHealthText.textContent = "📴 Offline / Deploy pending";
        cloudHealthText.classList.add("err");
      }
    });
  }
  if (btnExportSaveJson) {
    btnExportSaveJson.addEventListener("click", () => {
      try {
        const payload = buildSavePayload();
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mochi-pop-save-${getDateKey()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        if (cloudFeedbackText) {
          cloudFeedbackText.textContent = i18n("cloud_json_exported");
          cloudFeedbackText.classList.remove("hidden", "is-error");
        }
      } catch (_) {}
    });
  }
  if (btnImportSaveJson && inputImportSaveJson) {
    btnImportSaveJson.addEventListener("click", () => inputImportSaveJson.click());
    inputImportSaveJson.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      inputImportSaveJson.value = "";
      if (!file) return;
      try {
        const raw = await file.text();
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.appState || typeof parsed.appState !== "object") {
          throw new Error("bad_save");
        }
        hydrateFromSavePayload(parsed, true);
        saveGame();
        if (cloudFeedbackText) {
          cloudFeedbackText.textContent = i18n("cloud_json_imported");
          cloudFeedbackText.classList.remove("hidden", "is-error");
        }
        showBubble(i18n("cloud_json_imported"), 2400);
      } catch (_) {
        if (cloudFeedbackText) {
          cloudFeedbackText.textContent = i18n("cloud_json_bad");
          cloudFeedbackText.classList.remove("hidden");
          cloudFeedbackText.classList.add("is-error");
        }
      }
    });
  }
  if (btnRestoreByCode) {
    btnRestoreByCode.addEventListener("click", async () => {
      if (!Mon || !Mon.MochiCloud || !inputRestoreCode) return;
      const code = inputRestoreCode.value.trim().toUpperCase();
      if (!/^MOCHI-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
        if (cloudFeedbackText) {
          cloudFeedbackText.textContent = "⚠️ Format: MOCHI-XXXX-XXXX";
          cloudFeedbackText.classList.remove("hidden");
          cloudFeedbackText.classList.add("is-error");
        }
        return;
      }
      btnRestoreByCode.disabled = true;
      try {
        const res = await Mon.MochiCloud.restoreByCode(code);
        if (res.saveData && res.saveData.appState) {
          hydrateFromSavePayload(res.saveData, true);
          if (res.nickname && !appState.nickname) appState.nickname = res.nickname;
          try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(buildSavePayload()));
          } catch (_) {}
          updateCloudUiSummary();
          if (cloudFeedbackText) {
            cloudFeedbackText.textContent = "✅ Progress restored! Mochi & items loaded.";
            cloudFeedbackText.classList.remove("hidden", "is-error");
          }
          showBubble("☁️ Cloud Save Restored!", 2500);
        } else {
          updateCloudUiSummary();
          if (cloudFeedbackText) {
            cloudFeedbackText.textContent = "⚠️ Account linked, but no cloud backup saved on it yet.";
            cloudFeedbackText.classList.remove("hidden");
            cloudFeedbackText.classList.add("is-error");
          }
        }
      } catch (err) {
        if (cloudFeedbackText) {
          cloudFeedbackText.textContent = `⚠️ ${err && err.message ? err.message : "Could not restore code"}`;
          cloudFeedbackText.classList.remove("hidden");
          cloudFeedbackText.classList.add("is-error");
        }
      } finally {
        btnRestoreByCode.disabled = false;
      }
    });
  }
  if (btnDeleteCloudData) {
    let deleteArmTimer = null;
    btnDeleteCloudData.addEventListener("click", async () => {
      if (!Mon || !Mon.MochiCloud) return;
      if (btnDeleteCloudData.dataset.armed !== "1") {
        btnDeleteCloudData.dataset.armed = "1";
        btnDeleteCloudData.textContent = i18n("cloud_delete_confirm");
        clearTimeout(deleteArmTimer);
        deleteArmTimer = setTimeout(() => {
          btnDeleteCloudData.dataset.armed = "";
          btnDeleteCloudData.textContent = i18n("cloud_delete_btn");
        }, 5000);
        return;
      }
      clearTimeout(deleteArmTimer);
      btnDeleteCloudData.dataset.armed = "";
      btnDeleteCloudData.disabled = true;
      try {
        const today = getDateKey();
        await Mon.MochiCloud.deleteCloudAccount([today, getLeagueDateKey("weekly", today)]);
        updateCloudUiSummary();
        if (cloudFeedbackText) {
          cloudFeedbackText.textContent = i18n("cloud_deleted_msg");
          cloudFeedbackText.classList.remove("hidden", "is-error");
        }
      } catch (err) {
        if (cloudFeedbackText) {
          cloudFeedbackText.textContent = `⚠️ ${err && err.message ? err.message : "Delete failed"}`;
          cloudFeedbackText.classList.remove("hidden");
          cloudFeedbackText.classList.add("is-error");
        }
      } finally {
        btnDeleteCloudData.disabled = false;
        btnDeleteCloudData.textContent = i18n("cloud_delete_btn");
      }
    });
  }

  btnSettings.addEventListener("click", () => {
    updateHUD();
    renderUpdateStatus();
    switchSettingsTab("general");
    settingsModal.classList.remove("hidden");
  });
  btnCloseSettings.addEventListener("click", () => settingsModal.classList.add("hidden"));

  if (btnCheckUpdates) {
    btnCheckUpdates.addEventListener("click", () => checkForAppUpdate({ manual: true }));
  }

  toggleFx.addEventListener("change", () => {
    appState.fxEnabled = toggleFx.checked;
    pet.setFxEnabled(appState.fxEnabled);
    puzzle.setFxEnabled(appState.fxEnabled);
    if (appState.fxEnabled) pet.spawnHearts(3);
    saveGame();
  });

  toggleHaptics.addEventListener("change", () => {
    appState.hapticsEnabled = toggleHaptics.checked;
    if (appState.hapticsEnabled) vibrate(20);
    saveGame();
  });

  if (toggleColorblind) {
    toggleColorblind.addEventListener("change", () => {
      appState.colorblindMode = toggleColorblind.checked;
      if (typeof puzzle.setColorblindMode === "function") {
        puzzle.setColorblindMode(appState.colorblindMode);
      }
      saveGame();
    });
  }

  if (togglePowerSaver) {
    togglePowerSaver.addEventListener("change", () => {
      appState.powerSaver = togglePowerSaver.checked;
      document.body.classList.toggle("power-saver", Boolean(appState.powerSaver));
      saveGame();
    });
  }

  if (selectDragOffset) {
    selectDragOffset.addEventListener("change", () => {
      appState.dragOffset = selectDragOffset.value || "normal";
      if (typeof puzzle.setDragOffset === "function") {
        puzzle.setDragOffset(appState.dragOffset);
      }
      saveGame();
    });
  }

  // Tablet Quick-Care Strip actions
  if (btnQuickPet) {
    btnQuickPet.addEventListener("click", () => petMochiReaction());
  }
  if (btnQuickToy) {
    btnQuickToy.addEventListener("click", () => {
      const unlocked = appState.unlockedToys || ["yarn"];
      if (!unlocked.length) return;
      const idx = unlocked.indexOf(appState.equippedToy || "yarn");
      appState.equippedToy = unlocked[(idx + 1) % unlocked.length];
      pet.setToy(appState.equippedToy);
      playToyAction();
      updateHUD();
      saveGame();
    });
  }
  if (btnQuickHat) {
    btnQuickHat.addEventListener("click", () => {
      const unlocked = appState.unlockedAcc || ["none"];
      if (!unlocked.length) return;
      const idx = unlocked.indexOf(appState.equippedAcc || "none");
      appState.equippedAcc = unlocked[(idx + 1) % unlocked.length];
      pet.setAccessory(appState.equippedAcc);
      sound.playMeowHappy();
      updateHUD();
      saveGame();
    });
  }
  if (btnQuickTheme) {
    btnQuickTheme.addEventListener("click", () => {
      const unlocked = appState.unlockedThemes || ["peach"];
      if (!unlocked.length) return;
      const idx = unlocked.indexOf(appState.equippedTheme || "peach");
      appState.equippedTheme = unlocked[(idx + 1) % unlocked.length];
      applyRoomTheme(appState.equippedTheme);
      sound.playPickup();
      saveGame();
    });
  }

  btnOpenBugReport.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
    bugNoteInput.value = "";
    bugDiagPreview.textContent = buildDiagnosticsText();
    bugReportModal.classList.remove("hidden");
  });

  btnCloseBugReport.addEventListener("click", () => bugReportModal.classList.add("hidden"));

  btnSendBugEmail.addEventListener("click", () => {
    const note = bugNoteInput.value.trim() || "(No description provided)";
    const subject = encodeURIComponent(`Mochi Pop! v${APP_VERSION} Error Report`);
    const body = encodeURIComponent(`Description:\n${note}\n\n---\n${buildDiagnosticsText()}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  });

  btnCopyBugDiag.addEventListener("click", async () => {
    const note = bugNoteInput.value.trim();
    const text = `To: ${SUPPORT_EMAIL}\n${note ? `Description: ${note}\n\n` : ""}${buildDiagnosticsText()}`;
    try {
      await navigator.clipboard.writeText(text);
      btnCopyBugDiag.textContent = i18n("bug_copied");
    } catch (_) {
      btnCopyBugDiag.textContent = i18n("bug_copy_manual");
    }
    setTimeout(() => {
      btnCopyBugDiag.textContent = i18n("bug_copy");
    }, 2000);
  });

  // Wardrobe Modal (Coat Skins + Accessories + Interactive Toys + Smart Gadgets + Room Decor)
  function renderClosetSection(title, items, unlockedList, equippedIdOrList, onEquipOrBuy) {
    const filteredItems = items.filter((item) => {
      const unlocked = unlockedList.includes(item.id);
      if (activeClosetFilter === "owned") return unlocked;
      if (activeClosetFilter === "locked") return !unlocked;
      return true;
    });
    if (filteredItems.length === 0) return;

    const heading = document.createElement("div");
    heading.className = "closet-section-title";
    heading.textContent = title;
    closetGrid.appendChild(heading);

    const streak = appState.streakDays || 1;
    const isMulti = Array.isArray(equippedIdOrList);

    for (const item of filteredItems) {
      const unlocked = unlockedList.includes(item.id);
      const equipped = isMulti ? equippedIdOrList.includes(item.id) : equippedIdOrList === item.id;
      const card = document.createElement("button");
      card.type = "button";
      card.className = `closet-item${equipped ? " equipped" : ""}`;

      let priceLabel = "";
      let priceClass = "";
      if (equipped) {
        priceLabel = i18n(isMulti ? "closet_active" : "closet_equipped");
      } else if (unlocked) {
        priceLabel = i18n(isMulti ? "closet_tap_place" : "closet_tap_equip");
      } else if (item.unlockType === "ad") {
        priceLabel = i18n("closet_unlock_ad");
        priceClass = " price-ad";
      } else if (item.unlockType === "multi_ad") {
        const req = item.reqAds || 2;
        const done = (appState.adUnlockProgress && appState.adUnlockProgress[item.id]) || 0;
        priceLabel = i18n("closet_ad_prog", { done, req });
        priceClass = " price-ad";
      } else if (item.unlockType === "streak") {
        const req = item.reqStreak || 7;
        priceLabel = i18n("closet_streak_req", { cur: Math.min(streak, req), req });
        priceClass = " price-streak";
      } else {
        priceLabel = `${item.cost} 🐟`;
      }

      const labelName = item.nameKey ? i18n(item.nameKey) : item.name;
      const labelDesc = item.descKey ? i18n(item.descKey) : item.desc;
      card.innerHTML = `
        <span class="item-icon">${item.icon}</span>
        <span class="item-name">${labelName}</span>
        ${labelDesc ? `<span class="item-sub">${labelDesc}</span>` : ""}
        <span class="item-price${priceClass}">${priceLabel}</span>
      `;
      if (!unlocked && item.unlockAltAd) {
        const doneAlt = (appState.adUnlockProgress && appState.adUnlockProgress[item.id]) || 0;
        const altChip = document.createElement("span");
        altChip.className = "alt-ad-chip";
        altChip.textContent = i18n("closet_ad_prog", { done: doneAlt, req: item.unlockAltAd });
        altChip.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const isTheme = item.id === "beach" || item.id === "winter";
          const isTile = TILE_SKINS.some((t) => t.id === item.id);
          const isToy = TOYS.some((t) => t.id === item.id);
          handleClosetItemClick({ ...item, unlockType: "multi_ad", reqAds: item.unlockAltAd }, false, {
            unlockedKey: isTheme ? "unlockedThemes" : (isTile ? "unlockedTileSkins" : (isToy ? "unlockedToys" : "unlockedAcc")),
            equippedKey: isTheme ? "equippedTheme" : (isTile ? "equippedTileSkin" : (isToy ? "equippedToy" : "equippedAcc")),
            onApply: (id) => {
              if (isTheme) applyRoomTheme(id);
              else if (isTile) puzzle.setTileSkin(id);
              else if (isToy) pet.setToy(id);
              else pet.setAccessory(id);
            }
          });
        });
        card.appendChild(altChip);
      }
      card.addEventListener("click", () => onEquipOrBuy(item, unlocked));
      closetGrid.appendChild(card);
    }
  }

  function handleClosetItemClick(item, unlocked, { unlockedKey, equippedKey, isMulti = false, onApply }) {
    ensureAudioUnlocked();
    appState[unlockedKey] = appState[unlockedKey] || [];
    const applyAndSave = () => {
      onApply(appState[equippedKey]);
      updateHUD();
      renderCloset();
      saveGame();
    };

    if (unlocked) {
      if (isMulti) {
        const list = appState[equippedKey] || [];
        const idx = list.indexOf(item.id);
        if (idx >= 0) list.splice(idx, 1);
        else list.push(item.id);
        appState[equippedKey] = list;
      } else {
        appState[equippedKey] = item.id;
      }
      sound.playMeowHappy();
      applyAndSave();
      return;
    }

    if (item.unlockType === "streak") {
      const req = item.reqStreak || 7;
      sound.playInvalid();
      showBubble(i18n("msg_streak_req", { req, cur: appState.streakDays || 1 }), 2400);
      return;
    }

    const completeUnlock = () => {
      if (!appState[unlockedKey].includes(item.id)) {
        appState[unlockedKey].push(item.id);
      }
      if (isMulti) {
        appState[equippedKey] = appState[equippedKey] || [];
        if (!appState[equippedKey].includes(item.id)) appState[equippedKey].push(item.id);
      } else {
        appState[equippedKey] = item.id;
      }
      sound.playMilestoneUnlock();
      showBubble(i18n("msg_unlocked", { name: item.name, icon: item.icon }), 2200);
      applyAndSave();
    };

    if (item.unlockType === "ad") {
      wardrobeModal.classList.add("hidden");
      openRewardedAd(i18n("ad_lbl_unlock_item", { name: item.name, icon: item.icon }), () => {
        completeUnlock();
        wardrobeModal.classList.remove("hidden");
      });
      return;
    }

    if (item.unlockType === "multi_ad") {
      const req = item.reqAds || 2;
      appState.adUnlockProgress = appState.adUnlockProgress || {};
      const current = appState.adUnlockProgress[item.id] || 0;
      wardrobeModal.classList.add("hidden");
      openRewardedAd(i18n("ad_lbl_prog_item", { name: item.name, icon: item.icon, cur: current + 1, req }), () => {
        const nextCount = (appState.adUnlockProgress[item.id] || 0) + 1;
        appState.adUnlockProgress[item.id] = nextCount;
        if (nextCount >= req) {
          completeUnlock();
        } else {
          sound.playSnap();
          showBubble(i18n("msg_ad_progress", { icon: item.icon, cur: nextCount, req }), 2000);
          saveGame();
        }
        renderCloset();
        wardrobeModal.classList.remove("hidden");
      });
      return;
    }

    if (appState.treats >= item.cost) {
      appState.treats -= item.cost;
      completeUnlock();
    } else {
      sound.playInvalid();
      showBubble(i18n("msg_need_fish", { n: item.cost }), 1800);
    }
  }

  function renderCloset() {
    closetGrid.innerHTML = "";
    if (closetSetBanner) {
      const setBonus = getActiveOutfitSet();
      if (setBonus) {
        closetSetBanner.textContent = i18n("closet_set_active", { name: setBonus.name });
        closetSetBanner.classList.remove("hidden");
      } else {
        closetSetBanner.classList.add("hidden");
      }
    }
    const showStyle = activeClosetTab === "all" || activeClosetTab === "style";
    const showToys = activeClosetTab === "all" || activeClosetTab === "toys";
    const showRoom = activeClosetTab === "all" || activeClosetTab === "room";

    if (showStyle) {
      renderClosetSection(
        i18n("closet_sec_coats"),
        SKINS,
        appState.unlockedSkins || ["orange"],
        appState.equippedSkin || "orange",
        (item, unlocked) => handleClosetItemClick(item, unlocked, {
          unlockedKey: "unlockedSkins",
          equippedKey: "equippedSkin",
          onApply: (id) => pet.setSkin(id)
        })
      );

      renderClosetSection(
        i18n("closet_sec_acc"),
        ACCESSORIES,
        appState.unlockedAcc || ["none"],
        appState.equippedAcc || "none",
        (item, unlocked) => handleClosetItemClick(item, unlocked, {
          unlockedKey: "unlockedAcc",
          equippedKey: "equippedAcc",
          onApply: (id) => pet.setAccessory(id)
        })
      );

      renderClosetSection(
        i18n("closet_sec_collars"),
        COLLARS,
        appState.unlockedCollars || ["red_bell", "none"],
        appState.equippedCollar || "none",
        (item, unlocked) => handleClosetItemClick(item, unlocked, {
          unlockedKey: "unlockedCollars",
          equippedKey: "equippedCollar",
          onApply: (id) => {
            pet.setCollar(id);
            if (id && id !== "none") {
              setTimeout(() => sound.playBellJingle(), 120);
            }
          }
        })
      );

      renderClosetSection(
        i18n("closet_sec_tiles"),
        TILE_SKINS,
        appState.unlockedTileSkins || ["classic"],
        appState.equippedTileSkin || "classic",
        (item, unlocked) => handleClosetItemClick(item, unlocked, {
          unlockedKey: "unlockedTileSkins",
          equippedKey: "equippedTileSkin",
          onApply: (id) => puzzle.setTileSkin(id)
        })
      );
    }

    if (showToys) {
      renderClosetSection(
        i18n("closet_sec_toys"),
        TOYS,
        appState.unlockedToys || ["yarn"],
        appState.equippedToy || "yarn",
        (item, unlocked) => handleClosetItemClick(item, unlocked, {
          unlockedKey: "unlockedToys",
          equippedKey: "equippedToy",
          onApply: (id) => pet.setToy(id)
        })
      );
    }

    if (showRoom) {
      renderClosetSection(
        i18n("closet_sec_gadgets"),
        GADGETS,
        appState.unlockedGadgets || [],
        appState.equippedGadgets || [],
        (item, unlocked) => handleClosetItemClick(item, unlocked, {
          unlockedKey: "unlockedGadgets",
          equippedKey: "equippedGadgets",
          isMulti: true,
          onApply: (list) => pet.setRoomGadgets(list)
        })
      );

      renderClosetSection(
        i18n("closet_sec_decor"),
        DECORS,
        appState.unlockedDecors || ["pink"],
        appState.equippedDecor || "pink",
        (item, unlocked) => handleClosetItemClick(item, unlocked, {
          unlockedKey: "unlockedDecors",
          equippedKey: "equippedDecor",
          onApply: (id) => applyDecor(id)
        })
      );

      renderClosetSection(
        i18n("closet_sec_themes"),
        THEMES,
        appState.unlockedThemes || ["peach"],
        appState.equippedTheme || "peach",
        (item, unlocked) => handleClosetItemClick(item, unlocked, {
          unlockedKey: "unlockedThemes",
          equippedKey: "equippedTheme",
          onApply: (id) => applyRoomTheme(id)
        })
      );
    }
  }

  if (closetTabs) {
    closetTabs.addEventListener("click", (e) => {
      const btn = e.target.closest(".closet-tab");
      if (!btn) return;
      activeClosetTab = btn.dataset.tab || "all";
      closetTabs.querySelectorAll(".closet-tab").forEach((el) => {
        el.classList.toggle("active", el === btn);
      });
      renderCloset();
    });
  }
  if (closetFilterChips) {
    closetFilterChips.addEventListener("click", (e) => {
      const btn = e.target.closest(".closet-filter-btn");
      if (!btn) return;
      activeClosetFilter = btn.dataset.filter || "all";
      closetFilterChips.querySelectorAll(".closet-filter-btn").forEach((el) => {
        el.classList.toggle("active", el === btn);
      });
      renderCloset();
    });
  }

  btnWardrobe.addEventListener("click", () => {
    renderCloset();
    wardrobeModal.classList.remove("hidden");
    if (closetPreviewCanvas) {
      pet.drawPreviewCanvas(closetPreviewCanvas, appState.equippedTheme || "peach");
    }
  });
  btnCloseWardrobe.addEventListener("click", () => wardrobeModal.classList.add("hidden"));
  if (closetPreviewCanvas) {
    closetPreviewCanvas.addEventListener("click", () => {
      ensureAudioUnlocked();
      pet.bounceBoost = 1;
      pet.spawnHearts(3);
      if (pet.collar && pet.collar !== "none") sound.playBellJingle();
      else sound.playMeowHappy();
    });
  }
  if (btnClosetPhoto) {
    btnClosetPhoto.addEventListener("click", () => {
      wardrobeModal.classList.add("hidden");
      openPhotoModal();
    });
  }

  // Adventure Mode Modal & Level Launcher
  function renderAdventureModal() {
    if (!adventureList || !window.MochiAdventure) return;
    const adv = window.MochiAdventure;
    const starsMap = appState.adventureStars || {};
    const totalStars = adv.getTotalStars(starsMap);
    const maxStars = adv.LEVELS.length * 3;
    if (advStarsSummary) advStarsSummary.textContent = `⭐ ${totalStars} / ${maxStars}`;

    const unlockedUpTo = adv.getHighestUnlockedLevelId(starsMap);
    adventureList.innerHTML = "";
    for (const ch of adv.CHAPTERS) {
      const hdr = document.createElement("div");
      hdr.className = "adv-chapter-hdr";
      hdr.textContent = i18n(ch.titleKey) || `${ch.icon} ${ch.fallbackTitle}`;
      adventureList.appendChild(hdr);

      const grid = document.createElement("div");
      grid.className = "adv-levels-grid";
      const chLevels = adv.LEVELS.filter((lv) => lv.chapter === ch.id);
      for (const lv of chLevels) {
        const earned = Number(starsMap[String(lv.id)] || 0);
        const locked = lv.id > unlockedUpTo;
        const card = document.createElement("button");
        card.type = "button";
        card.className = `adv-lv-card${earned > 0 ? " cleared" : ""}${locked ? " locked" : ""}`;
        card.disabled = locked;
        const starStr = locked ? "🔒" : `${"⭐".repeat(earned)}${"☆".repeat(3 - earned)}`;
        let goalTxt;
        if (lv.goal.type === "color") {
          goalTxt = i18n("adv_goal_color", { n: lv.goal.target, color: lv.goal.colorName || "strawberry" });
        } else {
          const goalKey = lv.goal.type === "fish" ? "adv_goal_fish" : (lv.goal.type === "ice" ? "adv_goal_ice" : (lv.goal.type === "score" ? "adv_goal_score" : "adv_goal_lines"));
          goalTxt = i18n(goalKey, { cur: 0, target: lv.goal.target });
        }
        card.innerHTML = `
          <div class="adv-lv-top"><span>Lv.${lv.id}</span><span>${starStr}</span></div>
          <div class="adv-lv-goal">${goalTxt} • ${lv.moves}m</div>
          <div class="adv-lv-reward">+${lv.rewardFish} 🐟</div>
        `;
        if (!locked) {
          card.addEventListener("click", () => {
            ensureAudioUnlocked();
            adventureModal.classList.add("hidden");
            if (puzzle.mode === "classic") savedClassicState = puzzle.exportState();
            runStartMs = Date.now();
            puzzle.startAdventureLevel(lv);
            sound.playPickup();
            updateHUD();
          });
        }
        grid.appendChild(card);
      }
      adventureList.appendChild(grid);
    }
  }

  if (btnAdventureMode) {
    btnAdventureMode.addEventListener("click", () => {
      ensureAudioUnlocked();
      pet.noteActivity();
      if (puzzle.mode === "adventure") {
        puzzle.loadState(savedClassicState);
        savedClassicState = null;
        sound.playPickup();
        showBubble(i18n("msg_classic_back"), 1800);
        updateHUD();
        return;
      }
      renderAdventureModal();
      if (adventureModal) adventureModal.classList.remove("hidden");
    });
  }
  if (btnCloseAdventure) {
    btnCloseAdventure.addEventListener("click", () => adventureModal.classList.add("hidden"));
  }

  // Interactive Care Mini-Game Modal (Catch the Laser & Golden Treats)
  let miniGameCtrl = null;
  function updateMiniGameHud(snap) {
    if (mgTimerBadge) mgTimerBadge.textContent = `⏱️ ${snap.timeLeft.toFixed(1)}s`;
    if (mgScoreBadge) mgScoreBadge.textContent = `⭐ ${snap.score}`;
    if (mgStreakBadge) mgStreakBadge.textContent = `🔥 ×${Math.max(1, snap.streak)}`;
  }

  function finishMiniGame(snap) {
    const today = getDateKey();
    if (appState.miniGameDayKey !== today) {
      appState.miniGameDayKey = today;
      appState.miniGamePlaysToday = 0;
    }
    const catches = snap.catches || 0;
    const moodGain = Math.min(25, 6 + catches * 2);
    appState.mood = Math.min(100, (appState.mood || 0) + moodGain);
    grantFriendXp(10 + catches * 2);

    let fishAward = 0;
    if ((appState.miniGamePlaysToday || 0) < 3 && catches >= 3) {
      appState.miniGamePlaysToday = (appState.miniGamePlaysToday || 0) + 1;
      fishAward = Math.min(4, Math.max(1, Math.floor(snap.score / 75)));
      appState.treats += fishAward;
    }
    if (fishAward > 0) {
      sound.playCravingWin();
      pet.triggerCelebrate("cheer", 1.8);
      if (mgResultText) mgResultText.textContent = i18n("mg_result_fish", { catches, pts: snap.score, fish: fishAward, mood: moodGain });
    } else {
      sound.playMeowHappy();
      pet.triggerCelebrate("idle", 1.2);
      if (mgResultText) mgResultText.textContent = i18n("mg_result_fun", { catches, pts: snap.score, mood: moodGain });
    }
    addDiaryEntry("🎮", `Mini-game (${activeMiniGameMode}): ${snap.score} pts${fishAward > 0 ? ` (+${fishAward} 🐟)` : ""}`);
    if (mgResultText) mgResultText.classList.remove("hidden");
    if (btnStartMiniGame) btnStartMiniGame.disabled = false;
    updateHUD();
    saveGame();
  }

  function syncMiniGameModeUi() {
    if (mgModeChips) {
      mgModeChips.querySelectorAll("[data-mg-mode]").forEach((el) => {
        el.classList.toggle("active", el.dataset.mgMode === activeMiniGameMode);
      });
    }
    if (mgSubText) {
      const subKey = activeMiniGameMode === "bakery" ? "mg_sub_bakery" : (activeMiniGameMode === "rain" ? "mg_sub_rain" : "mg_sub");
      mgSubText.textContent = i18n(subKey);
    }
  }

  function openMiniGameModal() {
    ensureAudioUnlocked();
    if (!miniGameModal || !miniGameCanvas || !window.MochiMiniGame) return;
    if (!miniGameCtrl) {
      miniGameCtrl = new window.MochiMiniGame.MochiLaserMiniGame(miniGameCanvas, {
        onTick: (snap) => updateMiniGameHud(snap),
        onHit: (kind) => {
          if (kind === "fish" || kind === "bakery_ok") sound.playFishCatch();
          else sound.playPop();
          vibrate(12);
        },
        onMiss: () => sound.playInvalid(),
        onFinish: (snap) => finishMiniGame(snap)
      });
    }
    if (mgResultText) mgResultText.classList.add("hidden");
    if (btnStartMiniGame) btnStartMiniGame.disabled = false;
    syncMiniGameModeUi();
    updateMiniGameHud({ timeLeft: 15, score: 0, streak: 1 });
    miniGameModal.classList.remove("hidden");
    miniGameCtrl._resize();
    miniGameCtrl.draw();
    if (typeof sound.setMiniGameMode === "function") sound.setMiniGameMode(activeMiniGameMode);
  }

  function closeMiniGameModal() {
    if (miniGameCtrl) miniGameCtrl.stop();
    if (miniGameModal) miniGameModal.classList.add("hidden");
    if (typeof sound.setMiniGameMode === "function") sound.setMiniGameMode(null);
  }

  if (mgModeChips) {
    mgModeChips.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-mg-mode]");
      if (!btn) return;
      const m = btn.dataset.mgMode;
      activeMiniGameMode = m === "bakery" ? "bakery" : (m === "rain" ? "rain" : "laser");
      if (miniGameCtrl && miniGameCtrl.running) miniGameCtrl.stop();
      if (btnStartMiniGame) btnStartMiniGame.disabled = false;
      syncMiniGameModeUi();
      if (typeof sound.setMiniGameMode === "function") sound.setMiniGameMode(activeMiniGameMode);
    });
  }
  if (btnStartMiniGame) {
    btnStartMiniGame.addEventListener("click", () => {
      ensureAudioUnlocked();
      if (!miniGameCtrl) return;
      if (mgResultText) mgResultText.classList.add("hidden");
      btnStartMiniGame.disabled = true;
      miniGameCtrl.start(15, activeMiniGameMode);
    });
  }
  if (btnCloseMiniGame) btnCloseMiniGame.addEventListener("click", closeMiniGameModal);
  if (btnMiniGame) btnMiniGame.addEventListener("click", openMiniGameModal);
  if (btnQuickMiniGame) btnQuickMiniGame.addEventListener("click", openMiniGameModal);

  // Trophy Room & Long-Term Achievements Modal
  function renderTrophyModal() {
    if (!achievementsList || !window.MochiAchievements) return;
    const list = window.MochiAchievements.evaluate(appState);
    const completedCount = list.filter((a) => a.completed).length;
    if (trophySummary) trophySummary.textContent = `🏅 ${completedCount} / ${list.length}`;
    achievementsList.innerHTML = "";
    for (const ach of list) {
      const card = document.createElement("div");
      card.className = `ach-card${ach.claimable ? " is-ready" : ""}${ach.claimed ? " is-claimed" : ""}`;
      const pct = Math.min(100, Math.round((ach.progress / Math.max(1, ach.target)) * 100));
      const title = i18n(ach.titleKey) || ach.fallbackTitle;
      const desc = `${i18n(ach.descKey) || ach.fallbackDesc} (${ach.progress}/${ach.target})`;
      let btnLabel;
      let btnCls = "ach-claim-btn";
      if (ach.claimed) {
        btnLabel = i18n("trophy_claimed");
        btnCls += " claimed";
      } else if (ach.claimable) {
        btnLabel = i18n("trophy_claim", { n: ach.rewardFish });
        btnCls += " ready";
      } else {
        btnLabel = `+${ach.rewardFish} 🐟`;
      }
      card.innerHTML = `
        <div class="ach-left">
          <span class="ach-icon">${ach.icon}</span>
          <div class="ach-meta">
            <span class="ach-title">${title}</span>
            <span class="ach-desc">${desc}</span>
            <div class="ach-bar"><div class="ach-bar-fill" style="width:${pct}%"></div></div>
          </div>
        </div>
        <button type="button" class="${btnCls}"${ach.claimable ? "" : " disabled"}>${btnLabel}</button>
      `;
      if (ach.claimable) {
        const claimBtn = card.querySelector("button");
        claimBtn.addEventListener("click", () => {
          ensureAudioUnlocked();
          const claimed = window.MochiAchievements.claim(appState, ach.id);
          if (claimed) {
            if (typeof sound.playAchievement === "function") sound.playAchievement();
            else sound.playMilestoneUnlock();
            pet.triggerCelebrate("dance", 1.8);
            pet.spawnHearts(5);
            addDiaryEntry(ach.icon || "🏅", `Claimed medal: ${title} (+${ach.rewardFish} 🐟)`);
            updateHUD();
            saveGame();
            renderTrophyModal();
          }
        });
      }
      achievementsList.appendChild(card);
    }
  }

  function openTrophyModal() {
    ensureAudioUnlocked();
    pet.noteActivity();
    renderTrophyModal();
    if (trophyModal) trophyModal.classList.remove("hidden");
  }
  if (btnTrophies) btnTrophies.addEventListener("click", openTrophyModal);
  if (btnQuickTrophies) btnQuickTrophies.addEventListener("click", openTrophyModal);
  if (btnCloseTrophy) {
    btnCloseTrophy.addEventListener("click", () => trophyModal && trophyModal.classList.add("hidden"));
  }

  // Photo Studio / Postcard Modal
  let activePhotoPose = "cheer";
  let activePhotoFrame = "cozy";
  let activePhotoSticker = "none";
  function renderPhotoStickerChips() {
    if (!photoStickerChips) return;
    const stickers = ["none", "🐾", "🎀", "🐟"];
    if (Mon && Array.isArray(Mon.ALBUM_SETS) && Array.isArray(appState.albumCards)) {
      for (const s of Mon.ALBUM_SETS) {
        for (const c of s.cards) {
          if (appState.albumCards.includes(c.id) && c.icon && !stickers.includes(c.icon)) {
            stickers.push(c.icon);
          }
        }
      }
    }
    if (!stickers.includes(activePhotoSticker)) activePhotoSticker = "none";
    photoStickerChips.innerHTML = "";
    for (const st of stickers) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `photo-chip${st === activePhotoSticker ? " active" : ""}`;
      btn.dataset.sticker = st;
      btn.textContent = st === "none" ? "∅" : st;
      photoStickerChips.appendChild(btn);
    }
  }
  function renderPhotoStudio() {
    if (!photoStudioCanvas || !pet) return;
    const lv = Mon ? Mon.computeFriendLevel(appState.friendXp || 0).level : 1;
    pet.renderPostcardCanvas(photoStudioCanvas, {
      pose: activePhotoPose,
      frame: activePhotoFrame,
      sticker: activePhotoSticker === "none" ? "" : activePhotoSticker,
      theme: appState.equippedTheme || "peach",
      caption: inputPhotoCaption ? inputPhotoCaption.value : "Mochi Pop! Cozy Vibes 💕",
      showStats: togglePhotoStats ? togglePhotoStats.checked : true,
      bestScore: appState.bestScore || 0,
      friendLevel: lv,
      streakDays: appState.streakDays || 1
    });
  }

  function openPhotoModal() {
    if (!photoModal) return;
    renderPhotoStickerChips();
    photoModal.classList.remove("hidden");
    renderPhotoStudio();
  }

  if (btnPhotoMode) btnPhotoMode.addEventListener("click", openPhotoModal);
  if (btnQuickPhoto) btnQuickPhoto.addEventListener("click", openPhotoModal);
  if (btnClosePhoto) btnClosePhoto.addEventListener("click", () => photoModal.classList.add("hidden"));
  if (photoPoseChips) {
    photoPoseChips.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-pose]");
      if (!btn) return;
      activePhotoPose = btn.dataset.pose || "cheer";
      photoPoseChips.querySelectorAll(".photo-chip").forEach((el) => el.classList.toggle("active", el === btn));
      renderPhotoStudio();
    });
  }
  if (photoFrameChips) {
    photoFrameChips.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-frame]");
      if (!btn) return;
      activePhotoFrame = btn.dataset.frame || "cozy";
      photoFrameChips.querySelectorAll(".photo-chip").forEach((el) => el.classList.toggle("active", el === btn));
      renderPhotoStudio();
    });
  }
  if (photoStickerChips) {
    photoStickerChips.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-sticker]");
      if (!btn) return;
      activePhotoSticker = btn.dataset.sticker || "none";
      photoStickerChips.querySelectorAll(".photo-chip").forEach((el) => el.classList.toggle("active", el === btn));
      renderPhotoStudio();
    });
  }
  if (inputPhotoCaption) inputPhotoCaption.addEventListener("input", renderPhotoStudio);
  if (togglePhotoStats) togglePhotoStats.addEventListener("change", renderPhotoStudio);
  if (btnSharePhotoCard) {
    btnSharePhotoCard.addEventListener("click", () => {
      if (!photoStudioCanvas) return;
      renderPhotoStudio();
      const dataUrl = photoStudioCanvas.toDataURL("image/png");
      const captionTxt = (inputPhotoCaption && inputPhotoCaption.value.trim()) || "Mochi Pop! 💕";
      addDiaryEntry("📸", `Saved postcard: ${captionTxt}`);
      saveGame();
      if (window.MochiAndroid && typeof window.MochiAndroid.shareScoreCard === "function") {
        window.MochiAndroid.shareScoreCard(dataUrl, `${captionTxt} • Mochi Pop!`);
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `mochi-postcard-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      btnSharePhotoCard.textContent = i18n("photo_saved");
      setTimeout(() => {
        btnSharePhotoCard.textContent = i18n("photo_save_btn");
      }, 2000);
    });
  }

  // Friend Seeded Challenge Helpers
  function buildChallengeCode(seedStr, scoreVal, nameStr) {
    const cleanName = String(nameStr || appState.nickname || "MochiFan").replace(/[^a-zA-Z0-9_\- ]/g, "").trim().slice(0, 14) || "MochiFan";
    const s = seedStr || `${getDateKey()}-${Math.floor(100 + Math.random() * 900)}`;
    const sc = Math.max(100, Number(scoreVal) || puzzle.score || appState.bestScore || 500);
    return `MCH:${s}:${sc}:${cleanName}`;
  }

  function buildChallengeUrl(seedStr, scoreVal, nameStr) {
    const cleanName = String(nameStr || appState.nickname || "MochiFan").trim().slice(0, 14) || "MochiFan";
    const s = seedStr || `${getDateKey()}-${Math.floor(100 + Math.random() * 900)}`;
    const sc = Math.max(100, Number(scoreVal) || puzzle.score || appState.bestScore || 500);
    return `https://jemangr.app/mochi-pop/?challenge=${encodeURIComponent(s)}&target=${sc}&by=${encodeURIComponent(cleanName)}`;
  }

  function parseChallengeInput(rawText) {
    const raw = String(rawText || "").trim();
    if (!raw) return null;
    if (raw.toUpperCase().startsWith("MCH:")) {
      const parts = raw.split(":");
      if (parts.length >= 3 && parts[1]) {
        return {
          seed: parts[1].trim(),
          target: Math.max(50, parseInt(parts[2], 10) || 500),
          name: (parts.slice(3).join(":") || "Friend").trim()
        };
      }
    }
    try {
      const urlObj = new URL(raw.includes("://") ? raw : `https://jemangr.app/${raw.replace(/^\?/, "?")}`);
      const cSeed = urlObj.searchParams.get("challenge");
      if (cSeed) {
        return {
          seed: cSeed,
          target: Math.max(50, parseInt(urlObj.searchParams.get("target") || "500", 10) || 500),
          name: urlObj.searchParams.get("by") || "Friend"
        };
      }
    } catch (_) {}
    return null;
  }

  function shareFriendChallenge(btnEl) {
    const seed = puzzle.mode === "challenge" && puzzle.challengeSeed
      ? puzzle.challengeSeed
      : `${getDateKey().replace(/-/g, "")}-${(Date.now() % 10000).toString(36)}`;
    const score = Math.max(200, puzzle.score || appState.bestScore || 500);
    const code = buildChallengeCode(seed, score, appState.nickname);
    const url = buildChallengeUrl(seed, score, appState.nickname);
    const msg = `Beat my Mochi Pop! score (${score} pts) on the exact same board! 🧩🐱\n${url}\nCode: ${code}`;
    if (navigator.share && typeof navigator.share === "function") {
      navigator.share({ title: "Mochi Pop! Friend Challenge", text: msg, url }).catch(() => {});
    } else if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(msg).catch(() => {});
    }
    if (btnEl) {
      const prev = btnEl.textContent;
      btnEl.textContent = i18n("chal_copied");
      setTimeout(() => { btnEl.textContent = prev; }, 2000);
    }
    showBubble(i18n("chal_copied"), 2000);
  }

  if (btnChallengeFriend) btnChallengeFriend.addEventListener("click", () => shareFriendChallenge(btnChallengeFriend));
  if (btnShareChallengeFromLeague) btnShareChallengeFromLeague.addEventListener("click", () => shareFriendChallenge(btnShareChallengeFromLeague));
  if (btnPlayChallengeCode) {
    btnPlayChallengeCode.addEventListener("click", () => {
      const parsed = parseChallengeInput(inputChallengeCode ? inputChallengeCode.value : "");
      if (!parsed) {
        sound.playInvalid();
        showBubble(i18n("chal_invalid"), 2200);
        return;
      }
      if (leaderboardModal) leaderboardModal.classList.add("hidden");
      if (puzzle.mode === "classic") savedClassicState = puzzle.exportState();
      runStartMs = Date.now();
      puzzle.startSeededChallenge(parsed.seed, parsed.target, parsed.name);
      sound.playPickup();
      updateHUD();
    });
  }

  // Daily Rewards Calendar & Quests Modal
  function grantDailyTierRewards(tier) {
    appState.treats += tier.fish;
    if (tier.collar) {
      appState.unlockedCollars = appState.unlockedCollars || ["red_bell", "none"];
      if (!appState.unlockedCollars.includes(tier.collar)) {
        appState.unlockedCollars.push(tier.collar);
      }
      appState.equippedCollar = tier.collar;
      pet.setCollar(tier.collar);
    }
    if (tier.gadget) {
      appState.unlockedGadgets = appState.unlockedGadgets || [];
      if (!appState.unlockedGadgets.includes(tier.gadget)) {
        appState.unlockedGadgets.push(tier.gadget);
      }
      appState.equippedGadgets = appState.equippedGadgets || [];
      if (!appState.equippedGadgets.includes(tier.gadget)) {
        appState.equippedGadgets.push(tier.gadget);
      }
      pet.setRoomGadgets(appState.equippedGadgets);
      if (tier.gadget === "feeder") {
        refreshDailyDispenserCharge(getDateKey());
      }
    }
    if (tier.acc) {
      appState.unlockedAcc = appState.unlockedAcc || ["none"];
      if (!appState.unlockedAcc.includes(tier.acc)) {
        appState.unlockedAcc.push(tier.acc);
      }
      appState.equippedAcc = tier.acc;
      pet.setAccessory(tier.acc);
    }
  }

  function renderDailyModal() {
    if (!dailyModal) return;
    const todayKey = getDateKey();
    const streak = appState.streakDays || 1;
    const cycleDay = ((streak - 1) % 7) + 1;
    const freeDone = appState.dailyClaimedDate === todayKey;
    const adDone = appState.dailyAdClaimedDate === todayKey;

    if (dailyStreakTag) dailyStreakTag.textContent = i18n("day_tag", { n: streak });
    if (streakSaverBanner) {
      const missedPrev = appState.missedStreakPrev || 0;
      streakSaverBanner.classList.toggle("hidden", missedPrev <= 1);
      if (missedPrev > 1 && streakSaverSub) {
        streakSaverSub.textContent = i18n("streak_saver_sub", { n: missedPrev });
      }
    }

    if (dailyCalendarPane && dailyQuestsPane) {
      dailyCalendarPane.classList.toggle("hidden", activeDailyTab !== "calendar");
      dailyQuestsPane.classList.toggle("hidden", activeDailyTab !== "quests");
    }
    if (dailyArchivePane) {
      dailyArchivePane.classList.toggle("hidden", activeDailyTab !== "archive");
      if (archiveReplayChoice) archiveReplayChoice.classList.add("hidden");
      if (activeDailyTab === "archive" && window.MochiDailyArchive) {
        const launchArchiveChallenge = (targetDateKey) => {
          if (puzzle.mode === "classic") {
            savedClassicState = puzzle.exportState();
          }
          runStartMs = Date.now();
          dailyModal.classList.add("hidden");
          if (archiveReplayChoice) archiveReplayChoice.classList.add("hidden");
          puzzle.startDailyChallenge(targetDateKey);
          sound.playPickup();
          showBubble(i18n("msg_daily_start"), 2200);
          updateHUD();
          saveGame();
        };

        window.MochiDailyArchive.renderArchivePane({
          container: archiveMonthGrid,
          summaryEl: archiveMonthSummary,
          milestonesEl: archiveMilestonesRow,
          appState,
          todayKey,
          i18n,
          onStartDay: ({ dateKey, cost }) => {
            ensureAudioUnlocked();
            if (cost <= 0) {
              launchArchiveChallenge(dateKey);
              return;
            }
            if (archiveReplayChoice && archiveChoiceLabel && btnArchivePayFish && btnArchiveWatchAd) {
              archiveChoiceLabel.textContent = `📅 ${dateKey}`;
              btnArchivePayFish.textContent = `🐟 ${cost}`;
              btnArchivePayFish.disabled = (appState.treats || 0) < cost;
              archiveReplayChoice.classList.remove("hidden");
              btnArchivePayFish.onclick = () => {
                if ((appState.treats || 0) < cost) return;
                appState.treats -= cost;
                launchArchiveChallenge(dateKey);
              };
              btnArchiveWatchAd.onclick = () => {
                dailyModal.classList.add("hidden");
                openRewardedAd(i18n("ad_lbl_archive_replay", { date: dateKey }), () => {
                  launchArchiveChallenge(dateKey);
                });
              };
            }
          }
        });
      }
    }
    if (dailyAlbumPane) {
      dailyAlbumPane.classList.toggle("hidden", activeDailyTab !== "album");
      if (activeDailyTab === "album") {
        renderAlbumPane();
      }
    }

    if (dailyGrid) {
      dailyGrid.innerHTML = "";
      DAILY_REWARDS.forEach((tier) => {
        const isPast = tier.day < cycleDay;
        const isToday = tier.day === cycleDay;
        const card = document.createElement("div");
        card.className = `daily-card${tier.day === 7 ? " is-day7" : ""}${isToday ? " is-today" : isPast ? " is-claimed" : " is-locked"}`;
        const statusTxt = isPast
          ? i18n("daily_status_claimed")
          : isToday
            ? i18n("daily_status_today")
            : i18n("daily_status_preview", { n: tier.day });

        card.innerHTML = `
          <div class="daily-card-top">
            <span>${i18n("daily_day_n", { n: tier.day })}${tier.day === 7 ? " 🏆" : ""}</span>
            <span>${statusTxt}</span>
          </div>
          <div class="daily-card-reward">${tier.label}</div>
        `;

        if (isToday) {
          const actions = document.createElement("div");
          actions.className = "daily-card-actions";

          const btnFree = document.createElement("button");
          btnFree.type = "button";
          btnFree.className = "daily-card-btn";
          btnFree.disabled = freeDone;
          btnFree.textContent = freeDone ? i18n("daily_status_claimed") : i18n("daily_free_claim");
          btnFree.addEventListener("click", () => {
            ensureAudioUnlocked();
            appState.dailyClaimedDate = getDateKey();
            grantDailyTierRewards(tier);
            sound.playMilestoneUnlock();
            pet.triggerCelebrate("dance", 1.8);
            pet.spawnHearts(5);
            showBubble(i18n("daily_claim_bubble", { n: tier.day, reward: tier.label }), 2400);
            updateHUD();
            saveGame();
            renderDailyModal();
          });

          const btnAdBonus = document.createElement("button");
          btnAdBonus.type = "button";
          btnAdBonus.className = "daily-card-btn ad-bonus";
          btnAdBonus.disabled = adDone;
          btnAdBonus.textContent = adDone ? i18n("daily_ad_done") : `📺 ${tier.adLabel}`;
          btnAdBonus.addEventListener("click", () => {
            ensureAudioUnlocked();
            dailyModal.classList.add("hidden");
            openRewardedAd(i18n("ad_lbl_day_bonus", { n: tier.day, reward: tier.adLabel }), () => {
              appState.dailyAdClaimedDate = getDateKey();
              appState.treats += tier.adFish;
              sound.playCravingWin();
              pet.triggerCelebrate("cheer", 1.6);
              showBubble(i18n("daily_super_bubble", { n: tier.adFish }), 2200);
              updateHUD();
              saveGame();
              renderDailyModal();
              dailyModal.classList.remove("hidden");
            });
          });

          actions.appendChild(btnFree);
          actions.appendChild(btnAdBonus);
          card.appendChild(actions);
        }

        dailyGrid.appendChild(card);
      });
    }

    if (questsList) {
      questsList.innerHTML = "";
      const qProg = appState.quests || { pets: 0, plays: 0, lines: 0, combos: 0 };
      const claimed = appState.claimedQuests || [];

      QUEST_DEFS.forEach((q) => {
        const cur = Math.min(q.target, qProg[q.id] || 0);
        const isDone = cur >= q.target;
        const isClaimed = claimed.includes(q.id);

        const row = document.createElement("div");
        row.className = "quest-card";
        const stickerNote = q.sticker ? i18n("quest_sticker_tag", { sticker: q.sticker }) : "";
        row.innerHTML = `
          <div>
            <strong>${i18n(q.titleKey)}</strong>
            <small>${i18n("quest_progress", { cur, target: q.target, reward: q.reward, sticker: stickerNote })}</small>
          </div>
        `;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quest-claim-btn";
        btn.disabled = !isDone || isClaimed;
        btn.textContent = isClaimed ? i18n("claimed_btn") : isDone ? i18n("claim_btn") : `${cur}/${q.target}`;
        btn.addEventListener("click", () => {
          ensureAudioUnlocked();
          appState.claimedQuests = appState.claimedQuests || [];
          if (!appState.claimedQuests.includes(q.id)) {
            appState.claimedQuests.push(q.id);
            appState.treats += q.reward;
            if (q.sticker) {
              appState.equippedSticker = q.sticker;
              applyWallSticker(q.sticker);
            }
            sound.playMilestoneUnlock();
            showBubble(i18n("quest_win_bubble", { reward: q.reward, sticker: q.sticker ? " & " + q.sticker : "" }), 2200);
            updateHUD();
            saveGame();
            renderDailyModal();
          }
        });
        row.appendChild(btn);
        questsList.appendChild(row);
      });
    }

    if (stickerRow) {
      stickerRow.innerHTML = "";
      const claimed = appState.claimedQuests || [];
      WALL_STICKERS.forEach((s) => {
        const unlocked = !s.reqQuest || claimed.includes(s.reqQuest);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `sticker-btn${(appState.equippedSticker || "🐾") === s.id ? " is-active" : ""}`;
        btn.disabled = !unlocked;
        btn.textContent = `${s.id} ${i18n(s.nameKey)}`;
        btn.addEventListener("click", () => {
          appState.equippedSticker = s.id;
          applyWallSticker(s.id);
          saveGame();
          renderDailyModal();
        });
        stickerRow.appendChild(btn);
      });
    }
  }

  function renderAlbumPane() {
    if (!albumSetsList || !Mon) return;
    const owned = appState.albumCards || [];
    const claimedSets = appState.claimedAlbumSets || [];
    const totalCards = Mon.ALBUM_SETS.reduce((acc, s) => acc + s.cards.length, 0);
    if (albumSummaryNote) {
      albumSummaryNote.textContent = i18n("album_summary", { owned: owned.length, total: totalCards });
    }
    const tokens = appState.albumTokens || 0;
    const pity = appState.albumDupPity || 0;
    if (albumTokensText) {
      albumTokensText.textContent = i18n("album_tokens_txt", { tokens, pity });
    }
    if (btnTradeTokenHammer) btnTradeTokenHammer.disabled = tokens < 2;
    if (btnTradeTokenRotate) btnTradeTokenRotate.disabled = tokens < 2;
    albumSetsList.innerHTML = "";
    Mon.ALBUM_SETS.forEach((set) => {
      const setOwnedCount = set.cards.filter((c) => owned.includes(c.id)).length;
      const isComplete = setOwnedCount === set.cards.length;
      const isClaimed = claimedSets.includes(set.id);

      const box = document.createElement("div");
      box.className = "album-set-card";

      const head = document.createElement("div");
      head.className = "album-set-head";
      head.innerHTML = `<span>${i18n(set.titleKey)} (${setOwnedCount}/${set.cards.length})</span>`;

      const claimBtn = document.createElement("button");
      claimBtn.type = "button";
      claimBtn.className = "album-claim-btn";
      claimBtn.disabled = !isComplete || isClaimed;
      claimBtn.textContent = isClaimed ? i18n("claimed_btn") : `+${set.rewardFish} 🐟`;
      claimBtn.addEventListener("click", () => {
        if (!isComplete || isClaimed) return;
        appState.claimedAlbumSets = appState.claimedAlbumSets || [];
        appState.claimedAlbumSets.push(set.id);
        appState.treats += set.rewardFish;
        grantFriendXp(40);
        sound.playMilestoneUnlock();
        pet.triggerCelebrate("dance", 2.0);
        showBubble(i18n("msg_album_set_done", { n: set.rewardFish }), 2400);
        updateHUD();
        saveGame();
        renderAlbumPane();
      });
      head.appendChild(claimBtn);
      box.appendChild(head);

      const grid = document.createElement("div");
      grid.className = "album-card-grid";
      set.cards.forEach((card) => {
        const has = owned.includes(card.id);
        const item = document.createElement("div");
        item.className = `album-mini-card${has ? " owned" : ""}`;
        item.innerHTML = `<span>${has ? card.icon : "❔"}</span><small>${has ? card.name : i18n("locked_label")}</small>`;
        grid.appendChild(item);
      });
      box.appendChild(grid);
      albumSetsList.appendChild(box);
    });
  }

  if (btnDailyCalendar) {
    btnDailyCalendar.addEventListener("click", () => {
      ensureAudioUnlocked();
      renderDailyModal();
      dailyModal.classList.remove("hidden");
    });
  }
  if (btnCloseDaily) {
    btnCloseDaily.addEventListener("click", () => dailyModal.classList.add("hidden"));
  }
  if (dailyTabs) {
    dailyTabs.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-daily-tab]");
      if (!btn) return;
      activeDailyTab = btn.dataset.dailyTab || "calendar";
      dailyTabs.querySelectorAll(".closet-tab").forEach((el) => {
        el.classList.toggle("active", el === btn);
      });
      renderDailyModal();
    });
  }
  if (btnStreakSaverAd) {
    btnStreakSaverAd.addEventListener("click", () => {
      ensureAudioUnlocked();
      const restoreVal = appState.missedStreakPrev || 2;
      dailyModal.classList.add("hidden");
      openRewardedAd(i18n("ad_lbl_streak_save", { n: restoreVal }), () => {
        appState.streakDays = restoreVal;
        appState.missedStreakPrev = 0;
        syncStreakUnlocks(true);
        sound.playMilestoneUnlock();
        showBubble(i18n("msg_streak_restored", { n: restoreVal }), 2400);
        updateHUD();
        saveGame();
        renderDailyModal();
        dailyModal.classList.remove("hidden");
      });
    });
  }

  if (btnBombAd) {
    btnBombAd.addEventListener("click", () => {
      ensureAudioUnlocked();
      openRewardedAd(i18n("ad_lbl_bomb"), () => {
        puzzle.grantBombPiece();
        sound.playMilestoneUnlock();
        showBubble(i18n("msg_bomb_ready"), 2000);
        saveGame();
      });
    });
  }

  if (btnHammer) {
    btnHammer.addEventListener("click", () => {
      ensureAudioUnlocked();
      pet.noteActivity();
      if ((puzzle.hammerCharges || 0) <= 0) {
        openRewardedAd(i18n("hammer_title"), () => {
          puzzle.addHammerCharges(2);
          puzzle.setHammerMode(true);
          sound.playMilestoneUnlock();
          showBubble(i18n("msg_hammer_ready"), 2200);
          updateHUD();
          saveGame();
        });
        return;
      }
      const next = !puzzle.hammerMode;
      puzzle.setHammerMode(next);
      sound.playPickup();
      if (next) showBubble(i18n("msg_hammer_ready"), 2200);
      updateHUD();
    });
  }
  if (btnHint) {
    btnHint.addEventListener("click", triggerHintFlow);
  }

  function openDiaryModal() {
    ensureAudioUnlocked();
    pet.noteActivity();
    renderDiaryModal();
    if (diaryModal) diaryModal.classList.remove("hidden");
  }
  if (btnDiary) btnDiary.addEventListener("click", openDiaryModal);
  if (btnQuickDiary) btnQuickDiary.addEventListener("click", openDiaryModal);
  if (btnCloseDiary) {
    btnCloseDiary.addEventListener("click", () => diaryModal && diaryModal.classList.add("hidden"));
  }
  if (btnKeyLegend && keyLegendModal) {
    btnKeyLegend.addEventListener("click", () => {
      ensureAudioUnlocked();
      keyLegendModal.classList.remove("hidden");
    });
  }
  if (btnCloseKeyLegend && keyLegendModal) {
    btnCloseKeyLegend.addEventListener("click", () => keyLegendModal.classList.add("hidden"));
  }

  if (btnTradeTokenHammer) {
    btnTradeTokenHammer.addEventListener("click", () => {
      if ((appState.albumTokens || 0) < 2) return;
      ensureAudioUnlocked();
      appState.albumTokens -= 2;
      puzzle.addHammerCharges(1);
      sound.playMilestoneUnlock();
      showBubble(i18n("msg_token_traded", { item: "🔨" }), 2000);
      updateHUD();
      saveGame();
      renderAlbumPane();
    });
  }
  if (btnTradeTokenRotate) {
    btnTradeTokenRotate.addEventListener("click", () => {
      if ((appState.albumTokens || 0) < 2) return;
      ensureAudioUnlocked();
      appState.albumTokens -= 2;
      puzzle.addRotateCharges(1);
      sound.playMilestoneUnlock();
      showBubble(i18n("msg_token_traded", { item: "↻" }), 2000);
      updateHUD();
      saveGame();
      renderAlbumPane();
    });
  }

  // Daily Challenge Mode Switcher
  btnDailyMode.addEventListener("click", () => {
    ensureAudioUnlocked();
    pet.noteActivity();
    if (puzzle.mode === "classic") {
      savedClassicState = puzzle.exportState();
      runStartMs = Date.now();
      puzzle.startDailyChallenge(getDateKey());
      showBubble(i18n("msg_daily_start"), 2600);
    } else {
      puzzle.loadState(savedClassicState);
      savedClassicState = null;
      showBubble(i18n("msg_classic_back"), 1800);
    }
    sound.playPickup();
    updateHUD();
  });

  if (btnBlitzMode) {
    btnBlitzMode.addEventListener("click", () => {
      ensureAudioUnlocked();
      pet.noteActivity();
      if (puzzle.mode !== "blitz") {
        if (puzzle.mode === "classic") savedClassicState = puzzle.exportState();
        runStartMs = Date.now();
        puzzle.startBlitzMode();
        showBubble(i18n("msg_blitz_start"), 2400);
      } else {
        puzzle.loadState(savedClassicState);
        savedClassicState = null;
        showBubble(i18n("msg_classic_back"), 1800);
      }
      sound.playPickup();
      updateHUD();
    });
  }

  if (hangingLamp) {
    const toggleLamp = () => {
      ensureAudioUnlocked();
      pet.noteActivity();
      applyTimeOfDayLighting(!isNightMode);
      sound.playPickup();
      vibrate(14);
      showBubble(i18n(isNightMode ? "msg_lamp_on" : "msg_lamp_off"), 1800);
    };
    hangingLamp.addEventListener("click", toggleLamp);
    hangingLamp.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleLamp();
      }
    });
  }

  if (roomWindow) {
    const peekWindow = () => {
      ensureAudioUnlocked();
      pet.noteActivity();
      sound.playMeowHappy();
      pet.triggerCelebrate("cheer", 1.5);
      pet.spawnHearts(4);
      appState.mood = Math.min(100, (appState.mood || 0) + 1);
      showBubble(i18n("msg_window_peek"), 2000);
      updateHUD();
    };
    roomWindow.addEventListener("click", peekWindow);
    roomWindow.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        peekWindow();
      }
    });
  }

  // Hybrid AdMob/Bridge + Simulated Rewarded Ad Flow
  function openRewardedAd(label, onReward) {
    if (window.MochiAdBridge && typeof window.MochiAdBridge.showRewarded === "function") {
      window.MochiAdBridge.showRewarded(label, () => {
        if (Mon) Mon.MochiAnalytics.track("rewarded_ad_complete", { label, native: true });
        onReward();
      });
      return;
    }
    pendingAdReward = onReward;
    adRewardText.textContent = label;
    btnClaimAd.classList.add("hidden");
    adModal.classList.remove("hidden");

    let left = 3;
    adTimer.textContent = `${left}s`;
    const timer = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(timer);
        adTimer.textContent = i18n("ad_ready");
        btnClaimAd.classList.remove("hidden");
      } else {
        adTimer.textContent = `${left}s`;
      }
    }, 1000);
  }

  btnClaimAd.addEventListener("click", () => {
    adModal.classList.add("hidden");
    if (Mon) Mon.MochiAnalytics.track("rewarded_ad_complete", { native: false });
    if (pendingAdReward) {
      const fn = pendingAdReward;
      pendingAdReward = null;
      fn();
    }
  });

  function openInterstitialIfAllowed(onDone) {
    if (!Mon) {
      onDone();
      return;
    }
    const gate = Mon.canShowInterstitial();
    if (!gate.allowed) {
      Mon.MochiAnalytics.track("interstitial_skipped", { reason: gate.reason });
      onDone();
      return;
    }
    if (window.MochiAdBridge && typeof window.MochiAdBridge.showInterstitial === "function") {
      Mon.MochiAnalytics.track("interstitial_shown", { native: true });
      window.MochiAdBridge.showInterstitial(onDone);
      return;
    }
    Mon.MochiAnalytics.track("interstitial_shown", { native: false });
    if (!interstitialModal) {
      onDone();
      return;
    }
    pendingInterstitialDone = onDone;
    btnSkipInterstitial.disabled = true;
    btnSkipInterstitial.textContent = i18n("inter_wait");
    interstitialModal.classList.remove("hidden");

    let left = 3;
    interstitialTimer.textContent = `${left}s`;
    const timer = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(timer);
        interstitialTimer.textContent = i18n("inter_done");
        btnSkipInterstitial.disabled = false;
        btnSkipInterstitial.textContent = i18n("inter_continue");
      } else {
        interstitialTimer.textContent = `${left}s`;
      }
    }, 1000);
  }

  if (btnSkipInterstitial) {
    btnSkipInterstitial.addEventListener("click", () => {
      interstitialModal.classList.add("hidden");
      const fn = pendingInterstitialDone;
      pendingInterstitialDone = null;
      if (fn) fn();
    });
  }

  // Lucky Tuna Wheel
  function drawLuckyWheel(angleRad = 0) {
    if (!wheelCanvas || !Mon) return;
    const ctx = wheelCanvas.getContext("2d");
    const size = wheelCanvas.width;
    const r = size * 0.46;
    const cx = size * 0.5;
    const cy = size * 0.5;
    const wedges = Mon.WHEEL_WEDGES;
    const slice = (Math.PI * 2) / wedges.length;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleRad);

    wedges.forEach((w, idx) => {
      const a0 = idx * slice - Math.PI / 2 - slice / 2;
      const a1 = a0 + slice;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, a0, a1);
      ctx.closePath();
      ctx.fillStyle = w.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.save();
      ctx.rotate(a0 + slice / 2);
      ctx.fillStyle = "#2f263b";
      ctx.font = "900 13px 'Segoe UI', sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(w.label, r - 14, 0);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6b8b";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.restore();
  }

  function updateWheelUi() {
    if (!btnSpinWheel || !Mon) return;
    refreshDailyWheelState(getDateKey());
    const cfg = Mon.loadRemoteConfig();
    const lv = Mon.computeFriendLevel(appState.friendXp || 0);
    const maxAd = (cfg.wheelMaxAdSpinsPerDay || 3) + (lv.bonusWheelSpin || 0);
    if (!appState.wheelFreeUsed) {
      btnSpinWheel.disabled = wheelSpinning;
      btnSpinWheel.textContent = i18n("wheel_spin_free");
    } else if ((appState.wheelAdSpinsUsed || 0) < maxAd) {
      btnSpinWheel.disabled = wheelSpinning;
      btnSpinWheel.textContent = `${i18n("wheel_spin_ad")} (${appState.wheelAdSpinsUsed || 0}/${maxAd})`;
    } else {
      btnSpinWheel.disabled = true;
      btnSpinWheel.textContent = i18n("wheel_spins_done");
    }
    drawLuckyWheel(wheelAngle);
  }

  function performWheelSpin() {
    if (wheelSpinning || !Mon) return;
    wheelSpinning = true;
    updateWheelUi();
    const wedges = Mon.WHEEL_WEDGES;
    const winIdx = Math.floor(Math.random() * wedges.length);
    const slice = (Math.PI * 2) / wedges.length;
    const startAngle = wheelAngle;
    const targetMod = (-winIdx * slice) % (Math.PI * 2);
    const extraSpins = Math.PI * 2 * 5;
    const endAngle = startAngle + extraSpins + ((targetMod - (startAngle % (Math.PI * 2)) + Math.PI * 4) % (Math.PI * 2));
    const started = performance.now();
    const dur = 2400;

    function tick(now) {
      const p = Math.min(1, (now - started) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      wheelAngle = startAngle + (endAngle - startAngle) * ease;
      drawLuckyWheel(wheelAngle);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        wheelSpinning = false;
        const prize = wedges[winIdx];
        if (prize.fish) appState.treats += prize.fish;
        if (prize.rotate) puzzle.addRotateCharges(prize.rotate);
        if (prize.albumCard) grantAlbumCardRoll("wheel");
        grantFriendXp(12);
        sound.playMilestoneUnlock();
        vibrate([20, 30, 20]);
        if (wheelResultText) wheelResultText.textContent = i18n("wheel_won", { prize: prize.label });
        updateHUD();
        updateWheelUi();
        saveGame();
      }
    }
    requestAnimationFrame(tick);
  }

  if (btnLuckyWheel) {
    btnLuckyWheel.addEventListener("click", () => {
      ensureAudioUnlocked();
      updateWheelUi();
      luckyWheelModal.classList.remove("hidden");
    });
  }
  if (btnCloseWheel) {
    btnCloseWheel.addEventListener("click", () => {
      if (!wheelSpinning) luckyWheelModal.classList.add("hidden");
    });
  }
  if (btnSpinWheel) {
    btnSpinWheel.addEventListener("click", () => {
      ensureAudioUnlocked();
      if (wheelSpinning || !Mon) return;
      refreshDailyWheelState(getDateKey());
      const cfg = Mon.loadRemoteConfig();
      const lv = Mon.computeFriendLevel(appState.friendXp || 0);
      const maxAd = (cfg.wheelMaxAdSpinsPerDay || 3) + (lv.bonusWheelSpin || 0);
      if (!appState.wheelFreeUsed) {
        appState.wheelFreeUsed = true;
        performWheelSpin();
      } else if ((appState.wheelAdSpinsUsed || 0) < maxAd) {
        luckyWheelModal.classList.add("hidden");
        openRewardedAd(i18n("ad_lbl_wheel"), () => {
          appState.wheelAdSpinsUsed = (appState.wheelAdSpinsUsed || 0) + 1;
          luckyWheelModal.classList.remove("hidden");
          performWheelSpin();
        });
      }
    });
  }

  function paintLeagueRows(rows, isStarsMode = false) {
    if (!leagueList) return;
    leagueList.innerHTML = "";
    rows.forEach((r) => {
      const el = document.createElement("div");
      el.className = `league-row${r.isPlayer ? " is-me" : ""}`;
      const left = document.createElement("span");
      left.textContent = `#${r.rank} ${r.tier.icon} ${r.name}`;
      const right = document.createElement("strong");
      right.textContent = isStarsMode ? `${r.score} ⭐` : String(r.score);
      el.appendChild(left);
      el.appendChild(right);
      leagueList.appendChild(el);
    });
  }

  let pendingSeasonReward = null;

  // Daily, Weekly, All-Time & Adventure Stars Purr League Leaderboard (Live Cloudflare D1 + Offline Fallback)
  async function renderLeaderboardModal() {
    if (!leaderboardModal || !Mon || !leagueList) return;
    const myNonce = ++leagueFetchNonce;
    const today = getDateKey();
    const myDaily = appState.dailyBestDate === today ? (appState.dailyBestScore || 0) : 0;
    const totalAdvStars = window.MochiAdventure
      ? window.MochiAdventure.getTotalStars(appState.adventureStars || {})
      : Object.values(appState.adventureStars || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    const isStarsTab = activeLeagueTab === "stars";
    const isBlitzTab = activeLeagueTab === "blitz";
    const myScore = isStarsTab
      ? totalAdvStars
      : (isBlitzTab ? (appState.blitzBestScore || 0) : (activeLeagueTab === "daily" ? myDaily : (appState.bestScore || 0)));
    const tier = Mon.getLeagueTier(appState.bestScore || 0);
    const nick = (appState.nickname && appState.nickname.trim()) || "MochiFan";
    if (leagueTierBanner) {
      const trophyBadge = (appState.seasonTrophies || 0) > 0 ? ` • 🏆×${appState.seasonTrophies}` : "";
      leagueTierBanner.textContent = `${tier.icon} ${tier.name} • ${nick}${trophyBadge}`;
    }
    if (leagueSeasonBox && window.MochiLeagueRewards) {
      leagueSeasonBox.classList.add("hidden");
      pendingSeasonReward = null;
      window.MochiLeagueRewards.checkClaimableSeason(appState, today).then((season) => {
        if (myNonce !== leagueFetchNonce || !season) return;
        pendingSeasonReward = season;
        if (leagueSeasonSub) {
          leagueSeasonSub.textContent = `${season.weekKey} • ${season.label} (+${season.fish} 🐟)`;
        }
        leagueSeasonBox.classList.remove("hidden");
      }).catch(() => {});
    }
    if (leagueNickBox) {
      const needsNick = !appState.nickname || !appState.nickname.trim() || appState.nickname.trim() === "MochiFan";
      leagueNickBox.classList.toggle("hidden", !needsNick);
      if (needsNick && inputLeagueNick) inputLeagueNick.value = appState.nickname || "";
    }

    const fallbackRows = isStarsTab
      ? [
          { name: nick, score: totalAdvStars, isPlayer: true, tier },
          { name: "LunaPaws", score: 42, isPlayer: false, tier: { icon: "🥇" } },
          { name: "YuzuCat", score: 33, isPlayer: false, tier: { icon: "🥈" } },
          { name: "MatchaBean", score: 24, isPlayer: false, tier: { icon: "🥉" } }
        ]
          .sort((a, b) => b.score - a.score)
          .map((r, idx) => ({ ...r, rank: idx + 1 }))
      : Mon.generateLeaderboardRows({
          dateKey: today,
          nickname: nick,
          playerBest: appState.bestScore || 0,
          playerDailyBest: myDaily,
          playerBlitzBest: appState.blitzBestScore || 0,
          mode: activeLeagueTab === "daily" ? "daily" : (isBlitzTab ? "blitz" : "weekly")
        });
    paintLeagueRows(fallbackRows, isStarsTab);
    if (isStarsTab && !Mon.loadRemoteConfig().leaderboardStarsLive) {
      if (leagueNoteText) leagueNoteText.textContent = "⭐ Adventure Story Stars Standings";
      return;
    }
    if (isBlitzTab && !Mon.loadRemoteConfig().leaderboardBlitzLive) {
      if (leagueNoteText) leagueNoteText.textContent = "⏱️ 90s Blitz Rush Standings";
      return;
    }
    if (leagueNoteText) leagueNoteText.textContent = "⏳ Connecting to api.jemangr.app...";

    if (!Mon.MochiCloud) return;
    try {
      const dateKey = getLeagueDateKey(activeLeagueTab, today);
      let live = await Mon.MochiCloud.fetchLeaderboard({ mode: activeLeagueTab, dateKey });
      if (myScore > 0 && (!live.myEntry || myScore > live.myEntry.score)) {
        await Mon.MochiCloud.submitScore({
          mode: activeLeagueTab,
          dateKey,
          score: myScore,
          nickname: nick,
          runDurationSec: Math.max(15, Math.round((Date.now() - runStartMs) / 1000))
        });
        live = await Mon.MochiCloud.fetchLeaderboard({ mode: activeLeagueTab, dateKey });
      }
      if (myNonce !== leagueFetchNonce) return;

      const rows = live.rows.slice();
      if (rows.length > 0) {
        if (live.myEntry && !rows.some((r) => r.isPlayer)) {
          rows.push({
            rank: live.myEntry.rank,
            name: nick,
            score: live.myEntry.score,
            isPlayer: true,
            tier: live.myEntry.tier
          });
        }
        paintLeagueRows(rows, isStarsTab);
        if (leagueNoteText) {
          leagueNoteText.textContent = `🌐 Live • api.jemangr.app (${rows.length} player${rows.length === 1 ? "" : "s"})`;
        }
      } else {
        const soloRow = [{
          rank: 1,
          name: nick,
          score: myScore,
          isPlayer: true,
          tier: Mon.getLeagueTier(isStarsTab ? (appState.bestScore || 0) : myScore)
        }];
        paintLeagueRows(soloRow, isStarsTab);
        if (leagueNoteText) {
          leagueNoteText.textContent = "🌐 Live • api.jemangr.app — Play a round to claim #1!";
        }
      }
    } catch (_) {
      if (myNonce !== leagueFetchNonce) return;
      if (leagueNoteText) {
        leagueNoteText.textContent = "📴 Offline mode • Showing local League rivals";
      }
    }
  }

  if (btnLeague) {
    btnLeague.addEventListener("click", () => {
      ensureAudioUnlocked();
      renderLeaderboardModal();
      leaderboardModal.classList.remove("hidden");
    });
  }
  if (btnCloseLeague) {
    btnCloseLeague.addEventListener("click", () => leaderboardModal.classList.add("hidden"));
  }
  if (btnClaimSeasonReward) {
    btnClaimSeasonReward.addEventListener("click", () => {
      if (!pendingSeasonReward || !window.MochiLeagueRewards) return;
      ensureAudioUnlocked();
      const s = pendingSeasonReward;
      if (window.MochiLeagueRewards.applySeasonClaim(appState, s)) {
        pendingSeasonReward = null;
        if (leagueSeasonBox) leagueSeasonBox.classList.add("hidden");
        sound.playMilestoneUnlock();
        pet.triggerCelebrate("dance", 2.0);
        pet.spawnHearts(6);
        showBubble(i18n("season_claimed_msg", { week: s.weekKey, fish: s.fish, label: s.label }), 2600);
        updateHUD();
        saveGame();
        renderLeaderboardModal();
      }
    });
  }
  if (btnSaveLeagueNick && inputLeagueNick) {
    btnSaveLeagueNick.addEventListener("click", async () => {
      const chosen = inputLeagueNick.value.trim();
      if (!chosen || chosen === "MochiFan") return;
      updateNickname(chosen);
      if (Mon && Mon.MochiCloud && Mon.MochiCloud.getMeta().playerId) {
        const today = getDateKey();
        try {
          await Mon.MochiCloud.updateNickname(chosen, [today, getLeagueDateKey("weekly", today)]);
        } catch (_) {}
      }
      if (leagueNickBox) leagueNickBox.classList.add("hidden");
      renderLeaderboardModal();
    });
  }
  if (leagueTabs) {
    leagueTabs.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-league-tab]");
      if (!btn) return;
      activeLeagueTab = btn.dataset.leagueTab || "daily";
      leagueTabs.querySelectorAll(".closet-tab").forEach((el) => el.classList.toggle("active", el === btn));
      renderLeaderboardModal();
    });
  }

  // Friend Level Pill & Analytics Stats Inspector
  if (friendLevelPill) {
    friendLevelPill.addEventListener("click", () => {
      if (!Mon) return;
      const lv = Mon.computeFriendLevel(appState.friendXp || 0);
      showBubble(i18n("msg_friend_tip", { lv: lv.level, xp: lv.xpInLevel, next: lv.xpForNext, perk: lv.startRotateBonus }), 2600);
    });
  }
  if (btnOpenStats) {
    btnOpenStats.addEventListener("click", () => {
      if (!Mon || !statsGrid) return;
      settingsModal.classList.add("hidden");
      const s = Mon.MochiAnalytics.getSummary();
      const cfg = Mon.loadRemoteConfig();
      const cards = [
        [i18n("stats_sessions"), s.sessions || 0],
        [i18n("stats_runs"), s.runsCompleted || 0],
        [i18n("stats_lines"), s.linesTotal || 0],
        [i18n("stats_rewarded"), s.rewardedAdsWatched || 0],
        [i18n("stats_inter_shown"), s.interstitialsShown || 0],
        [i18n("stats_inter_skip"), s.interstitialsSkipped || 0]
      ];
      statsGrid.innerHTML = cards.map(([k, v]) => `<div class="stat-card-mini"><span>${k}</span><strong>${v}</strong></div>`).join("");
      if (remoteConfigPreview) {
        remoteConfigPreview.textContent = JSON.stringify({ friendXp: appState.friendXp || 0, remoteConfig: cfg }, null, 2);
      }
      statsModal.classList.remove("hidden");
    });
  }
  if (btnCloseStats) {
    btnCloseStats.addEventListener("click", () => statsModal.classList.add("hidden"));
  }

  // Mystery Gift Once-per-Run Upgrade Ad Pill
  if (btnGiftUpgradeAd) {
    btnGiftUpgradeAd.addEventListener("click", () => {
      ensureAudioUnlocked();
      if (giftUpgradeUsedThisRun) return;
      const cfg = Mon ? Mon.loadRemoteConfig() : { giftAdBonusFish: 4 };
      const bonusF = cfg.giftAdBonusFish || 4;
      openRewardedAd(i18n("ad_lbl_gift_up", { n: bonusF }), () => {
        giftUpgradeUsedThisRun = true;
        btnGiftUpgradeAd.classList.add("hidden");
        appState.treats += bonusF;
        grantAlbumCardRoll("gift_upgrade");
        sound.playCravingWin();
        updateHUD();
        saveGame();
      });
    });
  }

  // Rotate Tray Pieces (90° clockwise) & Zen Mode Toggle
  if (btnRotatePieces) {
    btnRotatePieces.addEventListener("click", () => {
      ensureAudioUnlocked();
      pet.noteActivity();
      if ((puzzle.rotateCharges || 0) <= 0) {
        openRewardedAd(i18n("ad_lbl_rotate"), () => {
          puzzle.addRotateCharges(3);
          sound.playCravingWin();
          updateHUD();
          saveGame();
        });
        return;
      }
      if (puzzle.rotateTrayPieces()) {
        sound.playPickup();
        vibrate(14);
        updateHUD();
        saveGame();
      }
    });
  }

  if (btnZenMode) {
    btnZenMode.addEventListener("click", () => {
      ensureAudioUnlocked();
      pet.noteActivity();
      if (puzzle.mode === "daily") {
        puzzle.loadState(savedClassicState);
      }
      appState.zenMode = !appState.zenMode;
      puzzle.setZenMode(appState.zenMode);
      sound.playSnap();
      showBubble(i18n(appState.zenMode ? "msg_zen_on" : "msg_zen_off"), 2100);
      updateHUD();
      saveGame();
    });
  }

  // Undo Last Move Ad
  btnUndoAd.addEventListener("click", () => {
    ensureAudioUnlocked();
    if (!puzzle.canUndo()) return;
    openRewardedAd(i18n("ad_lbl_undo"), () => {
      puzzle.undoLastMove();
      updateHUD();
      saveGame();
    });
  });

  // Tray Refresh Ad
  btnRefreshAd.addEventListener("click", () => {
    ensureAudioUnlocked();
    openRewardedAd(i18n("ad_lbl_refresh"), () => {
      puzzle.refreshTrayWithAd();
      sound.playClear(1);
      saveGame();
    });
  });

  // Shareable PNG Score Card
  function exportScoreCardPng() {
    const card = document.createElement("canvas");
    card.width = 540;
    card.height = 680;
    const ctx = card.getContext("2d");

    const bg = ctx.createLinearGradient(0, 0, 0, 680);
    bg.addColorStop(0, "#fff2e2");
    bg.addColorStop(0.55, "#ffdcc2");
    bg.addColorStop(1, "#f7ebe0");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 540, 680);

    // Header
    ctx.fillStyle = "#2f263b";
    ctx.font = "900 36px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Mochi Pop! 🐱🧩", 270, 72);

    ctx.fillStyle = "#7a6a5e";
    ctx.font = "700 16px 'Segoe UI', sans-serif";
    const cardTag = appState.nickname ? `${appState.nickname} • ${getDateKey()}` : getDateKey();
    ctx.fillText(cardTag, 270, 104);

    // Mochi snapshot circle
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(270, 260, 118, 0, Math.PI * 2);
    ctx.fill();
    ctx.clip();
    if (petCanvas.width > 0 && petCanvas.height > 0) {
      const aspect = petCanvas.width / petCanvas.height;
      const drawH = 220;
      const drawW = drawH * aspect;
      ctx.drawImage(petCanvas, 270 - drawW * 0.5, 152, drawW, drawH);
    }
    ctx.restore();

    // Stats Box
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(56, 408, 428, 178, 26);
    ctx.fill();

    ctx.fillStyle = "#8a7568";
    ctx.font = "800 15px 'Segoe UI', sans-serif";
    ctx.fillText("SCORE", 155, 450);
    ctx.fillText("BEST", 270, 450);
    ctx.fillText("STREAK", 385, 450);

    ctx.fillStyle = "#ff5f7e";
    ctx.font = "900 38px 'Segoe UI', sans-serif";
    ctx.fillText(String(puzzle.score), 155, 502);

    ctx.fillStyle = "#2f263b";
    ctx.fillText(String(appState.bestScore), 270, 502);

    ctx.fillStyle = "#d97706";
    ctx.fillText(`🔥${appState.streakDays || 1}`, 385, 502);

    ctx.fillStyle = "#6e5a4f";
    ctx.font = "700 15px 'Segoe UI', sans-serif";
    ctx.fillText(`Collected Treats: ${appState.treats} 🐟`, 270, 554);

    // Footer
    ctx.fillStyle = "#8a7568";
    ctx.font = "700 14px 'Segoe UI', sans-serif";
    ctx.fillText("Play Mochi Pop! • jemangr.app", 270, 636);

    const url = card.toDataURL("image/png");
    if (window.MochiAndroid && typeof window.MochiAndroid.shareScoreCard === "function") {
      const shareText = `Mochi Pop! 🐱🧩 Score: ${puzzle.score} (Best: ${appState.bestScore})`;
      window.MochiAndroid.shareScoreCard(url, shareText);
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = `mochi-pop-${puzzle.score}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  btnShareCard.addEventListener("click", () => {
    exportScoreCardPng();
    btnShareCard.textContent = i18n("go_card_saved");
    setTimeout(() => {
      btnShareCard.textContent = i18n("go_share");
    }, 2000);
  });

  // Game Over Modal Actions
  btnReviveAd.addEventListener("click", () => {
    ensureAudioUnlocked();
    openRewardedAd(i18n("ad_lbl_revive"), () => {
      gameOverModal.classList.add("hidden");
      puzzle.clearCenterForRevive();
      appState.mood = Math.min(100, appState.mood + 25);
      pet.triggerState("excited", 1.5);
      pet.spawnHearts(6);
      sound.playMeowHappy();
      showBubble(i18n("msg_revive_yay"), 2400);
      updateHUD();
      saveGame();
    });
  });

  if (btnDoubleRunFishAd) {
    btnDoubleRunFishAd.addEventListener("click", () => {
      ensureAudioUnlocked();
      const bonus = puzzle.runFishEarned || 0;
      if (bonus <= 0 || runFishDoubledThisRun) return;
      openRewardedAd(i18n("ad_lbl_double_fish", { n: bonus }), () => {
        runFishDoubledThisRun = true;
        appState.treats += bonus;
        btnDoubleRunFishAd.classList.add("hidden");
        sound.playCravingWin();
        showBubble(i18n("msg_double_fish_yay", { n: bonus }), 2200);
        updateHUD();
        saveGame();
      });
    });
  }

  if (btnRescuePackAd) {
    btnRescuePackAd.addEventListener("click", () => {
      ensureAudioUnlocked();
      openRewardedAd(i18n("ad_lbl_rescue"), () => {
        gameOverModal.classList.add("hidden");
        puzzle.addRotateCharges(3);
        puzzle.grantBombPiece();
        appState.mood = Math.min(100, appState.mood + 20);
        pet.triggerCelebrate("cheer", 1.5);
        sound.playMilestoneUnlock();
        showBubble(i18n("msg_rescue_yay"), 2400);
        updateHUD();
        saveGame();
      });
    });
  }

  if (btnRematchSeed) {
    btnRematchSeed.addEventListener("click", () => {
      gameOverModal.classList.add("hidden");
      runStartMs = Date.now();
      giftUpgradeUsedThisRun = false;
      runFishDoubledThisRun = false;
      if (btnGiftUpgradeAd) btnGiftUpgradeAd.classList.add("hidden");
      puzzle.newGame(puzzle.currentRunSeed || undefined);
      appState.mood = Math.max(45, appState.mood);
      refreshPetRestingState();
      updateHUD();
      saveGame();
    });
  }

  btnPlayAgain.addEventListener("click", () => {
    gameOverModal.classList.add("hidden");
    const launchRun = () => {
      runStartMs = Date.now();
      giftUpgradeUsedThisRun = false;
      runFishDoubledThisRun = false;
      if (btnGiftUpgradeAd) btnGiftUpgradeAd.classList.add("hidden");
      if (Mon) Mon.MochiAnalytics.track("run_start", { mode: puzzle.mode });
      if (puzzle.mode === "blitz") {
        puzzle.startBlitzMode();
      } else if (puzzle.mode === "daily") {
        puzzle.startDailyChallenge(getDateKey());
      } else if (puzzle.mode === "adventure" && puzzle.adventureLevel) {
        puzzle.startAdventureLevel(puzzle.adventureLevel);
      } else if (puzzle.mode === "challenge" && puzzle.challengeSeed) {
        puzzle.startSeededChallenge(puzzle.challengeSeed, puzzle.challengeTarget, puzzle.challengerName);
      } else {
        puzzle.newGame();
      }
      appState.mood = Math.max(45, appState.mood);
      refreshPetRestingState();
      updateHUD();
      saveGame();
    };
    openInterstitialIfAllowed(launchRun);
  });

  // Playtest Tools (outside phone frame)
  btnSim6h.addEventListener("click", () => {
    applyOfflineDecay(6);
    updateHUD();
    saveGame();
  });

  btnSim14h.addEventListener("click", () => {
    applyOfflineDecay(14);
    sound.playMeowGrumpy();
    updateHUD();
    saveGame();
  });

  if (btnSim48h) {
    btnSim48h.addEventListener("click", () => {
      ensureAudioUnlocked();
      applyOfflineDecay(48);
      sound.playFainted();
      updateHUD();
      saveGame();
    });
  }

  if (btnSimNextDay) {
    btnSimNextDay.addEventListener("click", () => {
      ensureAudioUnlocked();
      appState.simDayOffset = (appState.simDayOffset || 0) + 1;
      checkDailyStreak();
      updateHUD();
      saveGame();
      showBubble(`⏭️ Next Day! Streak: Day ${appState.streakDays}! 🔥`, 2300);
    });
  }

  btnToggleDayNight.addEventListener("click", () => {
    applyTimeOfDayLighting(!isNightMode);
  });

  btnTestWake.addEventListener("click", () => {
    ensureAudioUnlocked();
    runWakeUpSequence();
  });

  btnSimLose.addEventListener("click", () => {
    puzzle.fillBoardForLoseTest();
  });

  btnAddTreats.addEventListener("click", () => {
    appState.treats += 5;
    updateHUD();
    saveGame();
  });

  btnReset.addEventListener("click", () => {
    localStorage.removeItem(SAVE_KEY);
    savedClassicState = null;
    overdriveMovesLeft = 0;
    purrRushEndsAt = 0;
    appState = {
      bestScore: 0,
      treats: 3,
      hunger: 95,
      mood: 95,
      unlockedAcc: ["none"],
      equippedAcc: "none",
      unlockedCollars: ["red_bell", "none"],
      equippedCollar: "none",
      unlockedSkins: ["orange"],
      equippedSkin: "orange",
      unlockedDecors: ["pink"],
      equippedDecor: "pink",
      unlockedToys: ["yarn"],
      equippedToy: "yarn",
      unlockedGadgets: [],
      equippedGadgets: [],
      unlockedThemes: ["peach"],
      equippedTheme: "peach",
      unlockedTileSkins: ["classic"],
      equippedTileSkin: "classic",
      zenMode: false,
      language: appState.language || "en",
      nickname: appState.nickname || "",
      friendXp: 0,
      albumCards: [],
      claimedAlbumSets: [],
      albumTokens: 0,
      albumDupPity: 0,
      blitzBestScore: 0,
      wheelDayKey: getDateKey(),
      wheelFreeUsed: false,
      wheelAdSpinsUsed: 0,
      dailyBestScore: 0,
      dailyBestDate: null,
      dailyCompletedDates: {},
      claimedArchiveMilestones: [],
      adventureStars: {},
      miniGameDayKey: getDateKey(),
      miniGamePlaysToday: 0,
      beatenChallengeCodes: [],
      leagueWeeklyBest: {},
      claimedLeagueWeeks: [],
      seasonTrophies: 0,
      claimedAchievements: [],
      statsTotalLines: 0,
      statsMaxCombo: 0,
      diaryLog: [],
      lastBackupRemindAt: 0,
      adUnlockProgress: {},
      dispenserFreeLeft: 0,
      dispenserDayKey: getDateKey(),
      dailyClaimedDate: null,
      dailyAdClaimedDate: null,
      missedStreakPrev: 0,
      simDayOffset: 0,
      quests: { pets: 0, plays: 0, lines: 0, combos: 0 },
      claimedQuests: [],
      equippedSticker: "🐾",
      streakDays: 1,
      lastPlayDate: getDateKey(),
      dailyCompletedDate: null,
      cravingIndex: 0,
      cravingProgress: 0,
      lastTimestamp: Date.now(),
      muted: false,
      musicEnabled: true,
      musicVolume: 0.7,
      sfxEnabled: true,
      sfxVolume: 0.85,
      catEnabled: true,
      catVolume: 0.9,
      fxEnabled: true,
      hapticsEnabled: true,
      colorblindMode: false,
      powerSaver: false,
      dragOffset: "normal",
      seenSpecialTips: []
    };
    applyAudioSettings();
    gameOverModal.classList.add("hidden");
    if (dailyModal) dailyModal.classList.add("hidden");
    pet.setAccessory("none");
    pet.setCollar("none");
    pet.setSkin("orange");
    pet.setToy("yarn");
    pet.setRoomGadgets([]);
    applyDecor("pink");
    applyRoomTheme("peach");
    applyWallSticker("🐾");
    giftUpgradeUsedThisRun = false;
    runFishDoubledThisRun = false;
    applyEventAndLevelModifiers();
    puzzle.setTileSkin("classic");
    puzzle.setColorblindMode(false);
    puzzle.setDragOffset("normal");
    puzzle.setZenMode(false);
    document.body.classList.remove("power-saver");
    puzzle.newGame();
    refreshPetRestingState();
    updateHUD();
    showBubble(i18n("msg_fresh_start"), 2200);
  });

  window.addEventListener("resize", syncBowlTarget);

  const phoneShellEl = document.getElementById("phoneShell");
  if (phoneShellEl && typeof ResizeObserver === "function") {
    const ro = new ResizeObserver(() => {
      if (pet && typeof pet._resize === "function") pet._resize();
      if (puzzle && typeof puzzle._resizeAll === "function") puzzle._resizeAll();
      syncBowlTarget();
    });
    ro.observe(phoneShellEl);
  }

  window.onMochiBackPressed = function () {
    const adBlocking = [adModal, interstitialModal].some((m) => m && !m.classList.contains("hidden"));
    if (adBlocking) return true;
    const dismissible = [
      privacyModal,
      cloudModal,
      statsModal,
      bugReportModal,
      settingsModal,
      keyLegendModal,
      diaryModal,
      trophyModal,
      photoModal,
      miniGameModal,
      adventureModal,
      leaderboardModal,
      luckyWheelModal,
      audioModal,
      wardrobeModal,
      dailyModal,
      welcomeGuideModal
    ];
    for (const m of dismissible) {
      if (m && !m.classList.contains("hidden")) {
        if (m === miniGameModal && miniGameCtrl) miniGameCtrl.stop();
        m.classList.add("hidden");
        return true;
      }
    }
    return false;
  };

  // Web & PWA hardware back-button support: trap popstate to close open modals gracefully
  if (!window.MochiAndroid && typeof window.history !== "undefined" && typeof window.history.pushState === "function") {
    try {
      window.history.pushState({ mochiRoot: true }, "");
      window.addEventListener("popstate", () => {
        if (typeof window.onMochiBackPressed === "function" && window.onMochiBackPressed()) {
          window.history.pushState({ mochiRoot: true }, "");
        }
      });
    } catch (_) {}
  }

  // Main 60 FPS Loop (throttled to ~30 FPS in Power Saver mode)
  let lastFrame = performance.now();
  let lastFeverUiSync = 0;
  let lastPhotoSync = 0;
  let syncedBowl = false;
  function loop(now) {
    if (appState.powerSaver && now - lastFrame < 32) {
      requestAnimationFrame(loop);
      return;
    }
    const dt = Math.min(0.08, (now - lastFrame) / 1000);
    lastFrame = now;

    if (purrRushEndsAt > 0 && now - lastFeverUiSync > 250) {
      lastFeverUiSync = now;
      if (!isPurrRushActive()) {
        purrRushEndsAt = 0;
        updateHUD();
      } else {
        syncPurrRushState();
      }
    }

    pet.update(dt);
    pet.draw();
    if (wardrobeModal && !wardrobeModal.classList.contains("hidden") && closetPreviewCanvas) {
      pet.drawPreviewCanvas(closetPreviewCanvas, appState.equippedTheme || "peach");
    }
    if (photoModal && !photoModal.classList.contains("hidden") && photoStudioCanvas && now - lastPhotoSync > 95) {
      lastPhotoSync = now;
      renderPhotoStudio();
    }
    if (!syncedBowl) {
      syncedBowl = true;
      syncBowlTarget();
    }

    puzzle.update(dt);
    puzzle.draw();

    requestAnimationFrame(loop);
  }

  loadGame();
  try {
    const urlChallenge = parseChallengeInput(window.location.search);
    if (urlChallenge) {
      savedClassicState = puzzle.exportState();
      puzzle.startSeededChallenge(urlChallenge.seed, urlChallenge.target, urlChallenge.name);
      updateHUD();
    }
  } catch (_) {}
  renderUpdateStatus();
  setTimeout(maybeAutoCheckForUpdate, 2500);
  setInterval(maybeAutoCheckForUpdate, 15 * 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) maybeAutoCheckForUpdate();
  });
  if ("serviceWorker" in navigator && location.protocol.startsWith("http") && location.hostname !== "appassets.mochi.local") {
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      if (!reg) return;
      reg.addEventListener("updatefound", () => {
        const nextWorker = reg.installing;
        if (!nextWorker) return;
        nextWorker.addEventListener("statechange", () => {
          if (nextWorker.state === "installed" && navigator.serviceWorker.controller && pwaUpdateToast) {
            pwaUpdateToast.classList.remove("hidden");
          }
        });
      });
    }).catch(() => {});
  }
  if (btnPwaRefresh) {
    btnPwaRefresh.addEventListener("click", () => {
      if (pwaUpdateToast) pwaUpdateToast.classList.add("hidden");
      window.location.reload();
    });
  }
  requestAnimationFrame(loop);
})();
