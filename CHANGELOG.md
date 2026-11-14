# Changelog — Mochi Pop!

## [0.4.2] - 2026-11-14
### Fixed
- **Full Localization Audit Across All 6 Languages (`el`, `en`, `de`, `es`, `fr`, `tr`):**
  - Localized previously English HUD & dynamic strings in `i18n.js`, `index.html`, and `main.js`: onboarding completion bubble (`Welcome <name>` → localized welcome), `×1.5 ΠΟΝΤ.` (`PTS`), `🧘 Χαλαρά` (`Zen`), weekend/Wednesday event banner (`🐟 Πυρετός Ψαριού: 2× Χρυσά Ψάρια!` + live refresh on language switch), puzzle craving strip (`Σπάσε 2 γραμμές...`), Daily Challenge HUD, Mochi's speech bubbles (`*Χασμουρητό*...`, feeding, toys, fountain, dispenser, wheel, sneezing, purrs, sulking/fainted), Daily Calendar & Streak Saver, Daily Quests & Wall Stickers, Closet sections & cards, Audio Mixer channels, Stats cards, Rewarded/Interstitial Ad overlays, and Game Over modal.

## [0.4.1] - 2026-11-14
### Fixed
- **Android APK Asset Path Fix (`scripts/build-apk.py`):** Replaced Windows `aapt2 -A` asset packing (which stored backslashes like `assets/www\index.html` inside the APK zip and caused Android's `AssetManager` to return `404 Not Found` on launch) with POSIX forward-slash packaging (`assets/www/index.html`, verified binary-clean on `zipalign` + `apksigner` v2+v3).

## [0.4.0] - 2026-11-14
### Added
- **Smart Monetization & Remote Config (`monetization.js`):**
  - **Interstitial Gate:** Zero forced ads on Day 0 (`d0GracePeriod`), requires ≥3 runs (`interstitialMinRuns: 3`), respects a `120s` Rewarded Ad Immunity shield after every Rewarded Ad, enforces a `210s` cooldown between Interstitials, and is completely removed by the Supporter Pass.
  - **Remote Config + Funnel Analytics:** Live config merge from `version.json` (`remoteConfig`) + privacy-safe funnel counters (`MochiAnalytics` across sessions, runs, rewarded ad starts/completes, interstitial views, wheel spins, league opens, album unlocks), inspectable inside **Settings (`⚙️`) → 📊 Stats & Funnel**.
  - **Production Mediation Adapter Hooks:** Clean `window.MochiAdBridge` & `window.MochiNativeAnalytics` bridge interfaces alongside offline Demo Flows.
- **High-ROI Rewarded & Hybrid Flows:**
  - **🎡 Lucky Tuna Wheel:** 1 Free Spin daily + up to 3 Bonus Ad Spins/day for `+2 🐟`, `+4 🐟`, `+8 🐟!`, `+1 ↻`, `+2 ↻`, or a 📸 Album Card.
  - **Game Over `2× Run Fish` & `Rescue Pack (+3 ↻ + 1 💣)`:** Doubles all Golden Fish earned during the run (always free Bonus option or Rewarded Ad) or rescues an impossible board once per run.
  - **Mystery `🎁` Upgrade Pill:** Once per run after clearing a Gift Box (`🎁`), watch an optional Ad for `+4 🐟 + 📸 Album Card`.
  - **Closet `📺 Watch-Ad` Unlock Alternative (`unlockAltAd`):** Premium accessories (`🎩 Sunglasses`, `👑 Crown`), `Sunny Beach` theme, and `Cyber Neon ⚡` tile skin can now be unlocked either with Golden Fish OR `3` Rewarded Ad watches (`0/3` progress).
  - **👑 Cozy Supporter Pass (`Demo €2.99`):** Permanently removes forced Interstitials, unlocks Supporter badge, and adds the **🥣 Daily Golden Bowl (`+2 🐟/day`)** claimable inside Settings.
- **Retention, Progression & Social League:**
  - **💖 Mochi Friendship Level (`Lv.1–50`):** Care actions, line clears, and feeding grant Friendship XP; reaching Lv.3/5/10/15+ grants permanent `+1` / `+2` starting `↻ Rotate` charges and Golden Fish milestone bonuses.
  - **📸 12-Card Sticker Photo Album (`3 sets × 4 cards`):** Embedded as the 3rd tab inside the Daily modal (`📸 Album`); collect cards from Gifts, Score Milestones, and the Wheel to claim Set Completion Rewards (`+12 🐟`, `+18 🐟`, `+24 🐟`).
  - **🗓️ Daily & Weekly Purr League Leaderboard (`🏆`):** Seeded Daily Challenge & Weekly League standings featuring the player's **Nickname** (`Cozy Bronze → Warm Silver → Golden Whisker → Cozy Legend`) and ready for remote cloud API sync.
  - **🎉 Mini-Events:** Automatic rotating schedule (`🐟 Fish Frenzy 2× Fish` on Sat–Sun, `🚀 Rocket Surge 2× Rockets` on Wed).
- **Native Android Scheduled Notifications (`MochiAlarmReceiver.java`, `MainActivity.java`):** Localized (`el/en/de/es/fr/tr`) 6h/18h background reminder notifications via `AlarmManager.setAndAllowWhileIdle` & `mochi_care` notification channel.

## [0.3.0] - 2026-11-14
### Added
- **6-Language Localization (`i18n.js`):** Full interface, HUD, Settings, Closet Tile Skins, Daily Challenge card, and Onboarding Guide in **Greek (`el`)**, **English (`en`)**, **German (`de`)**, **Spanish (`es`)**, **French (`fr`)**, and **Turkish (`tr`)**, with live switching and browser auto-detection.
- **Player Nickname & Personalization:** Added Nickname input inside First-Run Onboarding Step 1 and Settings (`⚙️`), printed onto exported PNG Score Cards (`by <nickname>`) and diagnostic reports in preparation for future leaderboards.
- **5-Step First-Run Onboarding & Permissions Wizard (`#welcomeGuideModal`):** Automatically introduces new players to Language + Nickname first, followed by Mochi care & energy multiplier, 8×8 puzzle tiles & tactical moves, Closet & progression rewards, and interactive app permission controls (Notifications, Vibration test, and Android APK auto-update install permission), also reopenable anytime from Settings (`📖 Game Guide & Permissions`).
- **New Special Tiles (`puzzle.js`):**
  - `🥫` **Golden Tuna** (`+2 🐟` on 5+ cell pieces)
  - `🎁` **Mystery Gift Box** (`+2 🐟`, `+300 pts`, or `+1 ↻ Rotate` from score 150+)
  - `🚀` **Yarn Rocket** (clears full intersecting perpendicular line on clear from score 350+)
  - `🌈` **Rainbow Color-Clear** (clears all matching color cells across the board from score 550+)
- **Hold Pocket (`HOLD / ΤΣΕΠΗ`) & 90° Tray Rotation (`↻`):** Drag any tray piece into/out of the Hold slot (`1 swap/turn`), and rotate remaining tray pieces `90° CW` starting with `3` charges (`+1` charge every 5 cleared lines, plus `+3 ↻` Rewarded Ad refill).
- **Gameplay Depth & Modes:** **Color Harmony** (`×1.5` when ≥6 cleared blocks match color), **Perfect Full-Board Clear** (`+1000 pts +3 🐟`), **Milestone Waves** (every `1500` pts rewards `+2 🐟`), **1-Turn Combo Grace**, **🧘 Zen Mode** toggle (relaxed play without Game Over), **Smart Magnetic Snap**, **Live Clear Score/Fish Preview Pill**, **15ms Cascade Wave**, and **4 Unlockable Tile Skins** (`Classic`, `Cat Paws 🐾`, `Choco Cookies 🍪`, `Cyber Neon ⚡`) in Mochi's Closet.
- **Android Notification Bridge (`MainActivity.java`):** Native runtime `POST_NOTIFICATIONS` request + `canRequestPackageInstalls()` check for `v0.3.0` (`versionCode 3`).

## [0.2.0] - 2026-11-14
### Added
- **Pixar-Style 3D Mochi Sprite Engine (21 Animations):** Integrated 4×4 transparent WebP sprite atlases (`idle`, `walk_side`, `sleep`, `eat`, `drink`, `cry`, `sulk`, `sulk_2`, `pet_1..3`, `cheer`, `fainted`, `groom`, `nervous`, `dance`, `yawn`, `tickle`, `play_pounce`, `track_toy`, `fever_party`) with accessories & bell collars attached to bone offsets.
- **Audio & 3-Channel Mixer (`audio.js`):** 13 normalized MP3 voice/SFX clips (`meow_1`, `meow_2`, `purr`, `eat`, `cry`, `sulk`, `yawn`, `fainted`, `sneeze`, `water_lap`, `kibble_pour`, `toy_squeak`, `bell_jingle`) plus independent toggles & volume sliders for Music Carpet, Game SFX, and Cat Sounds.
- **7-Day Daily Rewards Calendar, Quests & Streak Saver (`#dailyModal`):** Looping Day 1–7 rewards calendar with Daily Free Claim + Demo Ad Super Bonus, missed-day Streak Saver Ad, quests unlocking wall frame stickers (`👑`, `🌟`, `💖`), and `+1 Day` playtest helper.
- **Energy Multiplier, Purr Rush & High-Value Boosts:** Cat energy dynamically scales puzzle score multiplier (`×0.75` to `×2.0`), `Purr Rush` Fever Mode (`30s` at high energy + `Combo x3` doubling Golden Fish frequency), `⚡×3.0 Overdrive` Boost (15 moves), and `💣 Emergency Paw Bomb`.
- **Interactive Toys, Care Gadgets & Room Themes:** Yarn Ball, Wind-Up Mouse, Feather Wand, Laser Pointer, Water Fountain (`drink` anim + `-30%` offline decay), reworked Daily Snack Dispenser, Window Bird Feeder, Heated Cushion, Scratching Wheel, Catnip Plant, Fairy Lights, Cat Tower, and `Peach Cozy` / `Sunny Beach` / `Snowy Cozy` themes.
- **Easter Egg & Polish:** Uninterrupted 6-tap rapid nose-tickle sneeze animation (`sneeze.mp3`), Dramatic Faint & Rescue flow (`24h+` away), Playtest Bar auto-hide in production builds (plus `?prod=1` preview), and local notification schedule planner.
- **Native Android APK (`dist/mochi-pop-puzzle.apk`):** Full-screen portrait WebView Android wrapper (`minSdk 26`, `targetSdk 34`, offline `appassets.mochi.local` asset routing, Downloads PNG score card saver, external `mailto:` support, custom Mochi launcher icon, v1+v2+v3 signed via `scripts/build-apk.py`).
- **In-App APK Auto-Updater (Settings + 6h Check):** Manual *"Check for App Update"* button inside Settings plus automatic 6-hour release check (`jemangr/mochi-pop-puzzle-releases` + `version.json` fallback) that automatically downloads new APK versions via Android `DownloadManager` and launches the installer.

### Fixed
- Tightened top HUD flex layout & responsive sizing so the Settings (`⚙️`) button always remains cleanly inside narrow phone screens (`360px`–`410px`) even with 5-digit scores, and turned mobile Playtest Tools into a single slim top strip without overlapping Mochi.

## [0.1.0] - 2026-11-13
### Added
- Initial playable web build of Mochi Pop! featuring the 8×8 block puzzle (`PuzzleEngine`), procedural `MochiPet`, offline hunger/mood decay, Settings, Error Report diagnostics, and shareable PNG Score Card.
