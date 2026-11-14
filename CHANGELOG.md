# Changelog — Mochi Pop!

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
