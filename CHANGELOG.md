# Changelog — Mochi Pop!

## [1.2.0] - 2026-11-21
### Added & Improved
- **Clean & Spacious Cozy Honey-Wood 3D Layout**: Decluttered the main screen so Mochi's room, pet meters, puzzle board, and bottom piece tray breathe comfortably without cramped buttons or overflowing labels:
  - Compact 4-item `.top-hud` with combined `Score + Best` wooden tablet pill, oversized bouncy emerald **Feed** pill with overflowing 3D salmon (`#btnFeed`), **Wardrobe**, and **Settings**.
  - Moved `.wall-frame` away from `#hungerBar`/`#moodBar`, unified the status pill (`×Mult · Lv.N`), and anchored just two crisp golden 3D room medallions on the bottom-left: **Lucky Wheel** (`🎡`) and **Mochi Hub** (`🧭`).
  - Replaced crowded vertical stacks beside the board with a clean 2-item **challenge bar** (`Craving + Modes...`) and a dedicated full-width **Honey-Oak Power Dock** below the tray with all 6 power-up buttons (**Rotate, Hammer, Undo, Refresh, Bomb, Hint**) at `≥ 48px` width.
  - Added **Mochi Hub** (`#mochiHubModal`) organizing **Daily Check-In, Purr League, Trophy Room, Mini-Games, Photo Studio, Sticker Album, Sound Mute/Unmute, 2× Overdrive, Toy Ball, and Keyboard Shortcuts** in a spacious 2×4 wooden grid, plus a dedicated **Game Modes** (`#modesModal`) selector for **Classic, Zen, Adventure, Daily, and 90s Blitz**.
- **Updated Day & Night Screenshots**: Refreshed `assets/screenshot-day.png` and `assets/screenshot-night.png` to showcase the clean `v1.2.0` UI.

## [1.1.0] - 2026-11-21
### Added & Improved
- **🎨 Cozy Honey-Wood & Glossy Candy Bouncy Cartoon 3D UI (`styles.css`, `index.html`, `main.js`):**
  - Replaced plain flat HUD badges & OS-dependent emojis with **24 bespoke 160×160 3D cartoon `.webp` UI icons** (`assets/ui/*.webp`) sporting cocoa-chocolate `#4a2410` outlines and glossy candy shading.
  - Upgraded the Top HUD, Pet Meters (`Hunger` & `Mood` with dynamic sad-heart feedback), floating Social/Feature medallions (`🎡`, `🏆`, `🏅`, `🎮`, `📸`, `📖`, `⌨️`), carved 8×8 wooden board bezel, recessed piece tray slots, 6 glossy 3D pillow power-up buttons, and carved honey-oak modals.
- **🔤 Offline 6-Language Rounded Cartoon Typography (`assets/fonts/*.woff2`, `MainActivity.java`):**
  - Bundled `M PLUS Rounded 1c` (`700/800/900`) locally across `greek`, `latin-ext`, and `latin` subsets (`MochiDisplay`) with `.woff2` WebView MIME serving so all 6 languages (`EL`, `EN`, `DE`, `ES`, `FR`, `TR`) render offline with thick cartoon outlines across HUD, modals, and Canvas.

## [1.0.1] - 2026-11-17
### Added & Improved
- **🐟 Realistic Fish Visual Unification (`pet.js`, `puzzle.js`, `minigame.js`):**
  - Replaced the disparate flat yellow vector fish and OS-dependent emoji (`🐟`, which rendered as an inconsistent solid blue fish on Android Noto Color Emoji / Moto G54) with a unified procedural 3D vector renderer matching the realistic fish Mochi holds and eats in `assets/sprites/eat.webp`.
  - The unified renderer features a steely iridescent ocean-blue dorsal back (`#2c5270` -> `#3d739c`), silvery-cyan lateral band (`#74a8cc`), pearlescent white/cream belly (`#e3edf5` -> `#fffaf0`), translucent warm amber/golden fins & tail (`#f59e0b` / `#fbbf24`), glossy eye with catchlight, and delicate gill/scale accents.
  - Applied consistently across:
    - Ceramic Food Bowl treat (`pet.js`)
    - Interactive dragged snack from bowl to Mochi (`pet.js`)
    - Flying snack feeding arcs (`pet.js`)
    - Board clear flying fish arcs to bowl (`puzzle.js`)
    - Special fish tile emblems on the 8×8 board & adventure stages (`puzzle.js`)
    - Mini-game falling/tap fish targets (`minigame.js`)

## [1.0.0] - 2026-11-15
### Added & Improved
- **⚡ Board Popups & Blitz Last-10s Urgency (`puzzle.js`, `audio.js`, `styles.css`, `main.js`):**
  - Added floating score popups on normal placements (`+${pts}`), dedicated `🔥 COMBO ×N!` floating banners on multi-combos, and run metric tracking (`runMaxCombo`, `runSpecialPops`, `getRunStats()`).
  - Added pulsing red/rose `.is-urgent` urgency highlight + `sound.playBlitzTick()` countdown ticks during the final 10 seconds of **90s Blitz**.
- **💡 Smart Move Hint (`puzzle.js`, `main.js`, `index.html`, `i18n.js`):**
  - Added `findBestMoveHint()` & `triggerHint()` (hotkey `T` + `#btnHint` button in `.tray-actions`, 1 free hint per run + Rewarded Ad refill) highlighting the strongest placement on the 8×8 board with a pulsing golden silhouette.
- **📊 End-of-Run Breakdown Card (`index.html`, `styles.css`, `main.js`, `i18n.js`):**
  - Added `#runBreakdownCard` to Classic Game Over & Blitz Complete showing **Lines**, **Best Combo**, **Specials**, and **vs Best** record gap across all 6 languages.
- **🎀 Closet Filters & Outfit Set Bonus (`index.html`, `styles.css`, `main.js`, `i18n.js`):**
  - Added `#closetFilterChips` (**All / Owned / Locked**) and `getActiveOutfitSet()` matching costume sets (**Royal Party**, **Cozy Sakura**, **Cool Café**, **Cozy Knit**) granting `+10% Friendship XP` with `#closetSetBanner`.
- **🐱 Living Mochi Night Dreams & Idle Window Curiosity (`pet.js`):**
  - Added cozy floating Night dream bubbles (`💭🐟`, `💭🧶`, `💭👑`) during night sleep and periodic autonomous window curiosity glances after 16+ idle seconds.
- **☁️ Backend Prep for GitHub Pages & Blitz League (`server/src/worker.js`, `monetization.js`, `version.json`, `index.html`, `main.js`):**
  - Added `https://jemangr.github.io` to Worker `corsHeaders()`, `"blitz"` to `VALID_MODES`, `"leaderboardBlitzLive": false` remote flag, `#leagueTabs` **⏱️ Blitz** tab, and `MochiCloud.checkHealth()` / **🩺 Test API** health & latency ping in Cloud Save.

## [0.9.0] - 2026-11-15
### Added & Improved
- **⏱️ 90s Blitz Rush Mode (`puzzle.js`, `main.js`, `index.html`, `styles.css`, `i18n.js`):**
  - Added `#btnBlitzMode` (`startBlitzMode()`) with a 90-second arcade countdown (`+2s` / `+5s` bonus time per clear/combo), automatic board rescue keep-alive while time remains, separate `blitzBestScore`, and end-of-run `🐟` & Friend XP rewards across all 6 languages.
- **🔨 Hammer Hover Reticle & 💣 Bomb Outcome Preview (`puzzle.js`):**
  - Added live crosshair & target badge (`❄️ CRACK`, `📦 CRACK`, `🔨 SMASH +45`) on pointer hover during `hammerMode`, plus live `3×3` block, crystal ice & fish summary inside the hover Bomb badge.
- **🎟️ Album Pity System & Token Exchange (`monetization.js`, `main.js`, `index.html`):**
  - Added `pickAlbumCardWithPity()` (guarantees a missing card after 2 consecutive duplicates) + `#albumTokensBar` (`🎟️ Tokens`) inside the Sticker Album to trade `2 Tokens` for `+1 🔨` or `+1 ↻`.
- **🐟 3rd Mini-Game (`Fish Rain`), Interactive Lamp & Window, Theme Music Chords (`minigame.js`, `audio.js`, `main.js`, `index.html`):**
  - Added **🐟 Fish Rain Catcher** (`mode === "rain"`) to `#mgModeChips` with horizontal pointer/drag movement.
  - Made the overhead `#hangingLamp` clickable to toggle cozy Night/Day ambience directly and `#roomWindow` clickable for an interactive weather-peek reaction.
  - Added distinct Web Audio chord progressions per room theme (`Beach` tropical pluck & `Winter` crystal bells) via `sound.setRoomTheme()`.
- **🌐 Public Releases Refresh & Live Web Play (`jemangr/mochi-pop-puzzle-releases`):**
  - Updated showcase screenshots (`assets/screenshot-day.png`, `assets/screenshot-night.png`) from `v0.9.0` and deployed the live **Play in Browser** demo on GitHub Pages (`gh-pages`).

## [0.8.0] - 2026-11-15
### Added & Improved
- **Toy Hammer Power-Up (`puzzle.js`, `audio.js`, `main.js`, `index.html`, `styles.css`, `i18n.js`):**
  - Added **🔨 Toy Hammer** (`hammerCharges`, `hammerMode`, `useHammerAt(row, col)`) right inside `.tray-actions`: smash any occupied block or crack 1 Ice/Crate layer, collect Fish/Tuna treats, and replenish `+2 🔨` via Rewarded Ad when empty.
- **Adventure Chapter 5 (`🌙 Moonlit Loft`, Lv.17–20 → 60⭐) (`adventure.js`, `index.html`):**
  - Expanded Story Mode to **5 Chapters / 20 Levels (60⭐ max)** with late-game `ice + crate` tactical layouts in **Chapter 5: Moonlit Loft**.
- **Seeded Classic Rematches & Live Preview Points (`puzzle.js`, `main.js`, `index.html`):**
  - Added deterministic `currentRunSeed` tracking for Classic games + **🔁 Rematch Same Seed** (`#btnRematchSeed`) on `#gameOverModal`, and added live `+previewPts` numbers directly to `_drawBoard()` line-clear hover badges.
- **Mochi's Diary, Pet Touch Zones & Photo Studio Stickers (`pet.js`, `main.js`, `index.html`, `styles.css`, `i18n.js`):**
  - Added **📖 Mochi's Diary** (`#btnDiary`, `#btnQuickDiary`, `#diaryModal`) recording feeds, achievements, postcards, Story clears, mini-game runs, and best scores.
  - Added zone-aware petting via `pet.getPetZone(x, y)` (`"ears"`, `"chin"`, `"body"`) with instant bliss purr reactions under Mochi's chin.
  - Added unlockable sticker stamps inside **📸 Photo Studio** (`#photoStickerChips` + top-right postcard badge in `renderPostcardCanvas`).
- **Mini-Game Music, Crate Crack Audio, Keyboard Shortcuts Legend & PWA Update Toast (`audio.js`, `puzzle.js`, `main.js`, `index.html`, `styles.css`):**
  - Added `playCrateCrack()`, `playHammerSmash()`, `playAchievement()`, and upbeat `setMiniGameMode("laser" | "bakery" | null)` Web Audio loops.
  - Added **⌨️ Keyboard Controls** legend modal (`#btnKeyLegend`, `#keyLegendModal`) and non-blocking PWA update toast (`#pwaUpdateToast`) on Service Worker `updatefound`.

## [0.7.0] - 2026-11-15
### Added & Improved
- **Trophy Room & Permanent Achievements (`achievements.js`, `main.js`, `index.html`, `styles.css`, `i18n.js`):**
  - Added **🏅 Mochi's Trophy Room** (`#btnTrophies`, `#trophyModal`, `#trophyBadgeDot`) with 10 evaluated long-term milestones (`lines_50`, `lines_250`, `score_1500`, `score_5000`, `combo_4`, `adv_18`, `adv_36`, `closet_10`, `album_6`, `friend_15`), progress bars, notification badge, and claimable bonus `🐟` rewards across all 6 languages.
- **Adventure Chapter 4 & Crate Mechanic (`adventure.js`, `puzzle.js`, `main.js`):**
  - Expanded **🗺️ Story / Adventure Mode** to **16 levels / 48 stars** with **Chapter 4 (`🌿 Garden Terrace`, Lv.13–16)** introducing targeted `color` clear goals and 2-hit wooden berry `crateCells`.
- **2nd Mini-Game Mode: Cozy Bakery (`minigame.js`, `index.html`, `main.js`, `styles.css`):**
  - Added mode chips inside `#miniGameModal` to switch between **🔴 Laser Dash** and **🍪 Cozy Bakery** order-matching gameplay.
- **Friendship Level 15–50 Perks (`monetization.js`, `main.js`):**
  - Expanded `computeFriendLevel()` perks beyond Lv.12 with **Lv.15/35/50** score multipliers (`1.05×` / `1.10×` / `1.15×`), **Lv.18** slower offline hunger decay (`0.85×`), **Lv.25** extra daily Lucky Wheel ad spin (`+1`), and **Lv.35** upgraded milestone `🐟` drops (`+2`).
- **Offscreen Board Cache, Keyboard Controls & Accessibility (`puzzle.js`, `index.html`, `styles.css`, `main.js`):**
  - Pre-rendered the static 8×8 beveled board frame and 64 recessed checkerboard slots onto an offscreen cache canvas (`bgCacheCanvas`), added full desktop keyboard play (`1`/`2`/`3` select tray piece, `Arrows`/`WASD` move cursor, `Space`/`Enter` place, `H` Hold swap, `R` Rotate, `Escape` cancel), Notch `viewport-fit=cover` + `env(safe-area-inset-*)`, `@media (prefers-reduced-motion: reduce)`, `:focus-visible`, and Web/PWA `popstate` modal back-button handling.
- **Adventure Stars Leaderboard Tab, Cloud Backup Reminder & Clean PWA Manifest (`server/src/worker.js`, `main.js`, `manifest.webmanifest`, `assets/icon-192.png`):**
  - Added **⭐ Stars** tab (`mode="stars"`) to Purr League & backend worker allowlist with offline fallback, non-intrusive 7-day backup reminder for unsynced high-progress players, clean UTF-8 `manifest.webmanifest`, `192×192` maskable icon (`assets/icon-192.png`), and wide flyer screenshot (`assets/flyer.png`).

## [0.6.0] - 2026-11-15
### Added & Improved
- **Adventure Story Chapters (`adventure.js`, `puzzle.js`, `main.js`, `index.html`, `styles.css`, `i18n.js`):**
  - Added **🗺️ Story / Adventure Mode** with 3 Chapters (`Cozy Morning`, `Frosty Window`, `Starry Attic`) and 12 curated goal levels (`lines`, `fish`, `ice`, `score`) with move limits, progressive star ratings (`1–3 ⭐`), and `🐟` / Friend XP rewards across all 6 languages.
- **Interactive Care Mini-Game (`minigame.js`, `main.js`, `index.html`, `styles.css`, `i18n.js`):**
  - Added **🎮 Catch the Laser & Golden Treats** 15-second canvas mini-game accessible from the Pet Stage and Tablet Quick-Care dock, boosting Mood, Friend XP, and daily bonus `🐟`.
- **Mochi Photo Studio & Postcards (`pet.js`, `main.js`, `index.html`, `styles.css`, `i18n.js`):**
  - Added **📸 Photo Studio** modal rendering crisp `540×680` postcards of Mochi wearing all currently equipped coats, accessories, scarves, and collars with selectable poses (`idle`, `cheer`, `dance`, `fever_party`, `groom`, `sleep`), 4 frames (`Cozy`, `Polaroid`, `Starlight`, `Comic`), custom captions, optional Stats stamp, and native Share / PNG download.
- **Live Closet Preview (`pet.js`, `index.html`, `main.js`, `styles.css`):**
  - Embedded an animated live Mochi preview canvas (`#closetPreviewCanvas`) inside Mochi's Closet showing coats, accessories, collars, and room decor updates in real time.
- **Seeded Friend Challenges (`puzzle.js`, `main.js`, `index.html`, `styles.css`, `i18n.js`):**
  - Added shareable challenge links & compact codes (`MCH:<seed>:<score>:<name>`) from Game Over and Purr League, plus `?challenge=...` URL auto-launch so friends can play the exact same piece sequence and earn a `+5 🐟` victory bonus upon beating the target score.
- **Board Juice, Single-Source Version Sync & Full PWA Offline Precache (`puzzle.js`, `scripts/sync-version.py`, `scripts/build-apk.py`, `sw.js`):**
  - Added pop-in scale & color-tiered floating board popups (`iceCracked`, `combo`, `perfectBoard`), Purr Rush board glow aura, automated version synchronization (`version.json` → `main.js`, `MainActivity.java`, `AndroidManifest.xml`, `sw.js`), and full precaching of all `.webp` sprites and `.mp3` clips in `sw.js` with network-first code updates.

## [0.5.8] - 2026-11-15
### Improved
- **Full-App Cozy Room & Toy Graphics Overhaul (`pet.js`, `styles.css`):**
  - Added wall wainscoting/baseboard molding + subtle wooden plank floor seams strictly along the room floor, 4-pane window mullions with soft inner sills, double-stitched textured rugs, and improved wall-frame placement.
  - Upgraded floor props & room gadgets (`_drawFoodBowl` with glazed porcelain & custom 3D vector golden fish, `_drawYarnBall`, `mouse`, `feather`, `laser` with emitter beam, `_drawWaterFountain`, `_drawAutoFeeder`, `_drawCatnipPlant`, `_drawCatTower`, `_drawBirdFeeder` with vector songbird, and `_drawCatWheel`).
- **3D Candy Blocks & Custom Vector Special Emblems (`puzzle.js`):**
  - Sculpted checkerboard 8×8 recessed cells with bottom catchlight rim, inlaid outer board bevel, and pulsing golden row/col clear preview highlights on hover.
  - Multi-stop diagonal candy/jewel block gradients with top glass specular capsule, catchlight gleam dot, faceted crystal ice, and bespoke 2D vector canvas emblems for `fish`, `bomb`, `gift`, `rocket`, `rainbow`, and `tuna` instead of system emojis.
- **UI Depth & Mobile/Tablet Layout Fixes (`styles.css`, `pet.js`):**
  - Centered `.room-rug` directly beneath Mochi on Tablet (`≥ 840px`), increased tablet Mochi & room scale, enlarged tablet `.room-window`, separated `#petBubble` and `#eventBannerPill` cleanly from `.room-window`, fixed mobile `.demo-bar` dark backdrop contrast, and added subtle 3D highlights across HUD pills, meters, tray slots, board housing, action buttons, and Closet cards.

## [0.5.7] - 2026-11-15
### Improved
- **Clean Default Mochi (`pet.js`, `main.js`):** Mochi now starts without any equipped hat, accessory, or collar (`accessory: "none"`, `collar: "none"`); the free `Red Bell` collar remains unlocked in the Closet if you choose to put it on.
- **3D Pixar-Shaded Wardrobe Accessories (`pet.js`):** Redesigned all 9 head accessories (`bow`, `crown`, `strawberry`, `shades`, `chef`, `bear`, `blossom`, `headphones`, `wizard`), `scarf`, and all 3 bell collars (`red_bell`, `pastel_bell`, `star_bell`) with 3D multi-stop gradients, cast shadows onto fur, folded seams, gemstones, golden seeds, notched sakura petals, glossy tinted lenses, and cushioned pads.
- **Intuitive Closet HUD Icon (`index.html`):** Replaced the top-right `🎩` button on `#btnWardrobe` with a `🛍️` shopping bag icon and updated `#btnQuickHat` to `🎀`.

## [0.5.6] - 2026-11-15
### Fixed & Improved
- **Per-Frame Sprite Accessory & Collar Tracking (`assets/sprites/manifest.js`, `pet.js`):**
  - Added smoothed 16-frame `frameHeadAnchors` (`[dx, dy, rot, eyeDy, profile]`) and `frameNeckAnchors` (`[dx, dy]`) measured directly from all 19 visible Pixar Mochi `.webp` sprite sheets.
  - Updated `_drawSpriteMochi`, `_drawAccessory`, `_drawCollarAndBell`, and `_drawScarf` to interpolate sub-frame anchors smoothly at 60 FPS, apply head tilt (`rotate`) and walk mirroring (`scale(flipSign, 1)`), track eye pitch (`eyeDy`) for `shades` on upward/downward poses (`cheer`, `track_toy`, `drink`, `pet_3`), and draw foreshortened side-profile `shades` / `scarf` / `bow` instead of hiding or skewing them during walks and side turns.

## [0.5.5] - 2026-11-14
### Added & Improved
- **UI & Mobile/Tablet Ergonomics (`index.html`, `styles.css`, `puzzle.js`, `main.js`):**
  - **Narrow-Phone HUD Compact Mode (`≤ 420px`):** Tightened header pills and stage height so the 8×8 puzzle board gets extra vertical breathing room.
  - **Live Ghost Line-Clear Badge:** Displays `✨ 1 LINE!` / `🔥 2 LINES!` / `💣 3×3` dynamically above valid ghost placements before releasing a piece.
  - **Touch Drag Height Setting:** Configurable `Low / Normal / High` finger lift offset (`#selectDragOffset`) across all 6 languages.
  - **Tablet Landscape Quick-Care Dock (`≥ 840px`):** Instant 1-tap `💕 Pet`, `🧶 Cycle Toy`, `🎩 Cycle Hat`, `🎨 Cycle Room Theme` buttons anchored cleanly on the pet stage.
- **Gameplay, PWA & Offline Backup (`manifest.webmanifest`, `sw.js`, `i18n.js`, `main.js`):**
  - **Free Ad Alternative in Monthly Archive:** Tapping a missed past day presents a dual choice bar (`🐟 15` or `📺 Ad Free`).
  - **Seasonal Window Weather & Winter Cozy Buff:** Displays animated seasonal weather (`❄️ / 🌸 / ☀️ / 🍂`) inside `.room-window` and adds `+15%` Mood warmth when Winter + Heater gadget are active.
  - **1-Time Special Block Tutorials:** Automatic localized Mochi speech-bubble tips the first time `💣`, `🧊`, `🚀`, `🌈`, `🥫`, or `🎁` appears in the tray.
  - **Installable Web PWA & Offline JSON Backup:** Added `manifest.webmanifest`, `sw.js` precaching, and **📤 Export (.json) / 📥 Import (.json)** buttons inside Cloud & Backup.

## [0.5.0] - 2026-11-14
### Added & Improved
- **Daily Challenge Monthly Calendar Archive (`daily-archive.js`, `index.html`, `main.js`, `styles.css`):**
  - Added 4th tab **🗓️ Archive** inside Daily Rewards & Quests showing the full current-month calendar of seeded Daily Challenge boards.
  - Completed dates display best score + ✅, today plays free, and missed past days can be replayed for `15 🐟` to complete **Monthly Milestones** (`7d: +25 🐟`, `15d: +60 🐟`, Full Month: `+150 🐟`).
- **Weekly Purr League Season Rewards (`league-rewards.js`, `index.html`, `main.js`):**
  - Tracks weekly ISO participation (`appState.leagueWeeklyBest`) and checks prior-week placement from Cloudflare D1 (with offline tier fallback) to award end-of-season Fish (`+10` to `+60 🐟`) & Season Trophies (`🏆`).
- **Accessibility & Battery Optimization (`puzzle.js`, `main.js`, `styles.css`, `i18n.js`):**
  - **🎨 Colorblind Symbols:** Draws crisp geometric vector shapes (`●`, `▲`, `■`, `◆`, `✚`, `✦`) across board blocks, tray pieces & hold slot (translated in all 6 languages).
  - **🔋 Power Saver (30 FPS / Reduced Motion):** Throttles game loop to ~30 FPS and softens CSS animations (`body.power-saver`).
- **Modular Architecture & CI/CD (`.github/workflows/ci.yml`, `scripts/build-apk.py`, `tests/run_tests.py`):**
  - Extracted `daily-archive.js` and `league-rewards.js` modules cleanly out of `main.js` and updated `scripts/build-apk.py`.
  - Added GitHub Actions CI workflow (`.github/workflows/ci.yml`) running `python -m py_compile` and `tests/run_tests.py`, and expanded automated unit + E2E checks for all v0.5.0 features.

## [0.4.6] - 2026-11-14
### Added & Improved
- **Native Android UX (`MainActivity.java`, `MochiShareProvider.java`, `AndroidManifest.xml`, `main.js`):**
  - Modal-aware Back button (`window.onMochiBackPressed()` + Android 13+ `OnBackInvokedCallback`) closing open overlays first with double-tap exit toast confirmation.
  - Native PNG Score Card Share Sheet (`MochiAndroid.shareScoreCard` via `MochiShareProvider`) + native `Vibrator`/`VibrationEffect` haptics bridge (`MochiAndroid.vibrate` / `vibratePattern`).
- **Cloud Backend Security, GDPR Self-Delete & Leaderboard UX (`server/src/worker.js`, `monetization.js`, `main.js`, `index.html`):**
  - Added per-IP Edge Cache + isolate rate limiting on `/v1/register`, `/v1/score`, `/v1/save`, `/v1/restore`, `/v1/profile`, `/v1/account/delete`.
  - Added instant Nickname sync (`POST /v1/profile`) + inline `"MochiFan"` prompt inside `#leaderboardModal`.
  - Added self-service **🗑️ Delete My Cloud Data** (`DELETE /v1/account` & `POST /v1/account/delete`) inside `#cloudModal` with 2-tap confirmation across all 6 languages.
- **Cozy Night Audio & Tablet Landscape (`audio.js`, `styles.css`, `main.js`):**
  - Night Mode (`sound.setNightMode`) cross-switches to a gentle slower lullaby loop + night shimmer chimes.
  - Responsive 2-column Tablet/Desktop landscape layout (`@media (min-width: 840px) and (min-height: 540px)`) with `ResizeObserver` canvas auto-fit.
- **Automated Verification (`tests/run_tests.py`):** Added repeatable unit + Playwright E2E suite (desktop tablet & mobile viewports, Back hook, Seeded Daily determinism, Privacy Policy EN/EL, Cloud backup).

## [0.4.5] - 2026-11-14
### Changed & Removed
- **Removed Supporter Pass & Play Billing References (`index.html`, `main.js`, `monetization.js`, `i18n.js`, `styles.css`, `version.json`, `PRIVACY_POLICY.md`, `privacy.html`):**
  - Removed the paid/demo **Cozy Supporter Pass** UI, state fields (`supporterPass`, `supporterBowlDate`), CSS rules, translations across all 6 languages, and `remoteConfig.supporterDailyFish`.
  - Updated Settings **📖 Guide & Stats** tab label and simplified interstitial copy (`interstitial_sub`).
  - Removed Google Play Billing & Supporter Pass mentions from `PRIVACY_POLICY.md`, `privacy.html`, `README.md`, and `TODO.md` (keeping only Google AdMob disclosures for future Play Store releases plus live `api.jemangr.app` Leaderboard / Cloud Save).

## [0.4.4] - 2026-11-14
### Added
- **Live Cloud Leaderboard & Cross-Device Cloud Save (`https://api.jemangr.app`, `server/`, `monetization.js`, `main.js`):**
  - Deployed Cloudflare Workers + D1 backend (`mochi-pop-api` / `mochi-pop-db` bound as `DB`) at `https://api.jemangr.app` (`/v1/health`, `/v1/register`, `/v1/score`, `/v1/leaderboard`, `/v1/save`, `/v1/restore`).
  - Wired **🏆 Purr League** Daily, Weekly (`YYYY-Www`), and All-Time live standings with graceful offline fallback.
  - Added optional **☁️ Cloud Save & Device Transfer** (`MOCHI-XXXX-XXXX` sync code, `#cloudModal` in Settings → App) across all 6 languages (`el`, `en`, `de`, `es`, `fr`, `tr`) with auto-sync and zero email/password requirements.
- **In-App & Standalone Bilingual Privacy Policy (`PRIVACY_POLICY.md`, `privacy.html`):**
  - Added offline-capable EN/EL `privacy.html` modal (`#privacyModal` in Settings → App) covering local storage, `api.jemangr.app` leaderboard & cloud save, email split (`privacy@jemangr.app` & `support@jemangr.app`), and future Play Store ad/billing disclosures.
- **Squeezy Ball Toy & Per-Toy Sounds (`main.js`, `audio.js`, `i18n.js`):**
  - Unlocked distinct audio profiles per interactive toy and wired `toy_squeak.mp3` exclusively to the **🟡 Squeezy Ball**.

### Fixed & Changed
- **Google Play Protect False-Positive Removal (`AndroidManifest.xml`, `MainActivity.java`, `main.js`):**
  - Completely removed `REQUEST_INSTALL_PACKAGES`, `DownloadManager`, `BroadcastReceiver`, `ACTION_MANAGE_UNKNOWN_APP_SOURCES`, and in-app APK sideloading code; **Check for App Update** now opens the official release page cleanly in the external browser (`openExternalUrl`).
- **Support & Privacy Emails (`index.html`, `main.js`, `PRIVACY_POLICY.md`, `privacy.html`):** Routed bug reports & general support to `support@jemangr.app` and privacy/GDPR requests to `privacy@jemangr.app`.

## [0.4.3] - 2026-11-14
### Fixed
- **Pet Stage Layout & HUD Clearance (`pet.js`, `styles.css`):** Shifted Mochi's anchor position rightwards (`anchorXRatio = 0.58`), constrained autonomous roaming (`-12..+24px`), compacted `.pet-meters` & `.pet-left-controls` (`max-width: 138px`), relocated `.wall-frame` next to `.room-window` (`right: 92px`), and moved `.stage-event-pill` to `top: 72px; right: 8px` so HUD badges and event banners no longer overlap Mochi, her food bowl, or floor props.
- **Background Audio Pause (`audio.js`, `main.js`, `MainActivity.java`):** Added `visibilitychange` / `pagehide` / `freeze` lifecycle listeners, `SoundEngine.pauseForBackground()` / `resumeFromBackground()`, and native Android `onPause()` / `onResume()` hooks (`onMochiAppPause`, `onMochiAppResume`, `webView.pauseTimers()` / `resumeTimers()`) to immediately silence the Kalimba loop, WebAudio oscillators, and MP3 clips when backgrounding the app or switching tabs.
- **Settings Modal Viewport Fit, Tab Grouping & More Apps (`index.html`, `styles.css`, `i18n.js`, `main.js`):** Fixed top/bottom clipping on `#settingsModal` by adding bounded `.modal-card` scrolling (`max-height: min(86dvh, 720px); overflow-y: auto`), organized Settings into 3 tabs (`🎮 Game`, `👑 VIP & Info`, `📱 App`) across all 6 languages, and added a **More Apps (`jemangr.app`)** card opening `https://jemangr.app` via native Android `MochiAndroid.openExternalUrl` or browser new tab.

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
