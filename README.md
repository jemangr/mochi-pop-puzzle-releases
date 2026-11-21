# 🐱 Mochi Pop! — Cozy Pet & Block Puzzle (`v1.1.0`)

> **Private Repository** — Closed Source / All Rights Reserved (`support@jemangr.app`)

**Mochi Pop!** combines a crisp **8×8 block puzzle** with an expressive **3D Pixar-style virtual cat (Mochi)** living in a customizable cozy room. Keep Mochi fed and happy to power up your puzzle score multiplier, level up Friendship (`Lv.1–50`), spin the **Lucky Tuna Wheel**, collect **12 Sticker Album Cards**, beat **20 Adventure Story Levels (60⭐)**, race **90s Blitz Mode**, use **Smart Hints (`💡`)** & **Toy Hammers (`🔨`)**, play **Laser Dash, Cozy Bakery & Fish Rain**, unlock **10 Trophy Medals**, customize **Photo Studio Postcards**, and climb the **Purr League**!

<p align="center">
  <img src="assets/screenshot-day.png" alt="Mochi Pop! Daytime Gameplay" width="300" />
  &nbsp;&nbsp;&nbsp;
  <img src="assets/screenshot-night.png" alt="Mochi Pop! Night Lamp & Fairy Lights" width="300" />
</p>

---

## ✨ What's New in v1.1.0
- **🎨 Cozy Honey-Wood & Glossy Candy Bouncy Cartoon 3D UI (`styles.css`, `index.html`, `main.js`, `assets/ui/`):** Replaced OS emojis across the Top HUD, Pet Meters, Social Orbs, Challenge Pill, and all 6 Power-Up buttons with **24 baked 3D cartoon UI icons** framed inside carved honey-oak capsules, recessed wooden slots, and glossy 3D pillow buttons & modals.
- **🔤 Offline 6-Language Cartoon Typography (`assets/fonts/`, `MainActivity.java`):** Bundled `M PLUS Rounded 1c` (`700/800/900` for Greek, Latin & Latin-Ext) offline with heavy cocoa cartoon outlines across HUD, modals, and Canvas.

## ✨ What's New in v1.0.1
- **🐟 Realistic Fish Visual Unification (`pet.js`, `puzzle.js`, `minigame.js`):** Unified procedural 3D ocean-blue/silvery/amber fish rendering across the bowl, dragged treat, feeding arc, board clears, special tiles, and *Fish Rain*.

## ✨ What's New in v1.0.0
- **⚡ Floating Popups & Blitz 10" Urgency (`puzzle.js`, `audio.js`, `styles.css`):** Crisp floating `+pts` & `🔥 COMBO ×N!` board popups plus pulsing red countdown & ticks during the final 10 seconds of **90s Blitz**.
- **💡 Smart Move Hint (`puzzle.js`, `main.js`):** Evaluates valid placements and highlights the highest-impact move with a pulsing golden outline (`#btnHint` or hotkey `T`).
- **📊 End-of-Run Breakdown Card (`index.html`, `main.js`):** Displays *Lines*, *Best Combo*, *Specials*, and *vs Best* record gap on Game Over & Blitz Finish.
- **🎀 Closet Filters & Outfit Set Bonus (`main.js`, `i18n.js`):** Filter Closet items (**All / Owned / Locked**) and equip matching sets (**Royal Party**, **Cozy Sakura**, **Cool Café**, **Cozy Knit**) for `+10% Friendship XP`.
- **🐱 Night Dream Bubbles & Idle Curiosity (`pet.js`):** Mochi dreams of fish, yarn, or crowns while sleeping at night and glances curiously around after idle pauses.
- **☁️ Blitz League Tab, GitHub Pages CORS & API Health Check (`server/src/worker.js`, `monetization.js`):** Added **⏱️ Blitz** tab in Purr League, `https://jemangr.github.io` CORS + `"blitz"` mode in the Worker, and live **🩺 Test API** latency check.

## ✨ What's New in v0.9.0
- **⏱️ 90s Blitz Rush Mode (`puzzle.js`, `main.js`):** Fast timed arcade mode awarding `+2s / +5s` per clear with its own `blitzBestScore`.
- **🎯 Hammer Reticle & 💣 3×3 Bomb Outcome Preview (`puzzle.js`):** Shows live `CRACK`/`SMASH` target crosshairs in `hammerMode` and exact block/ice/fish counts on hover when aiming a Bomb.
- **🎟️ Album Pity System & Token Shop (`monetization.js`, `main.js`):** Guarantees a non-duplicate card after 2 duplicates and lets you swap `2 Tokens` for `+1 🔨` or `+1 ↻`.
- **🐟 Fish Rain Mini-Game, Interactive Lamp & Window, & Theme Music (`minigame.js`, `audio.js`, `main.js`):** Added 3rd mini-game (`Fish Rain`), clickable overhead Lamp (Day/Night) & Window (weather peek), plus unique `Beach` & `Winter` music loops.

## ✨ What's New in v0.8.0
- **🔨 Toy Hammer Power-Up (`puzzle.js`, `audio.js`, `main.js`, `index.html`):** Smash any single occupied cell or crack 1 Ice/Crate layer on demand (`+2 🔨` via Rewarded Ad when empty).
- **🌙 Adventure Chapter 5 (`Moonlit Loft`, Lv.17–20 → 60⭐) (`adventure.js`):** Expands Story Mode to **5 Chapters / 20 Levels (60⭐ max)** with late-game `ice + crate` board challenges.
- **🔁 Seeded Classic Rematches & Live Preview Points (`puzzle.js`, `main.js`):** Replay the exact Classic piece sequence via **🔁 Rematch Same Seed** (`currentRunSeed`), plus live `+pts` point previews inside hover line-clear badges.
- **📖 Mochi's Diary, Chin-Scratch Petting & Photo Studio Stickers (`pet.js`, `main.js`, `index.html`):** Zone-aware petting (`getPetZone`: extra blissful chin purr & ear hearts), unlockable Album sticker stamps on `540×680` postcards, and **📖 Mochi's Diary** logging meals, achievements, postcards, and Story milestones.
- **🎵 Mini-Game Music, Crate Crack Audio, Keyboard Legend & PWA Update Toast (`audio.js`, `main.js`, `index.html`):** Dedicated upbeat `Laser Dash` / `Cozy Bakery` music loops, wood crate crack & achievement sounds, `⌨️` Keyboard Controls cheat sheet, and non-blocking PWA refresh toast.

## ✨ What's New in v0.7.0
- **🏅 Trophy Room & Achievements (`achievements.js`):** 10 evaluated milestones (`lines`, `score`, `combo`, `stars`, `closet`, `album`, `friend_15`) with progress bars, notification badge, and claimable bonus `🐟` rewards.
- **🌿 Adventure Ch.4 & 🍪 Cozy Bakery (`adventure.js`, `minigame.js`):** Wooden berry crates (`crateCells`), targeted color-clear goals, and a 2nd mini-game mode (`Cozy Bakery`).
- **⚡ Friendship Lv.15–50 Perks, Offscreen Cache & Accessibility (`monetization.js`, `puzzle.js`, `styles.css`):** Score multiplier perks up to `1.15×`, `bgCacheCanvas` frame cache, full keyboard controls (`1/2/3`, `Arrows/WASD`, `Space/Enter`, `H`, `R`, `Esc`), `viewport-fit=cover`, `:focus-visible`, and `⭐ Stars` leaderboard tab.

## ✨ What's New in v0.6.0
- **🗺️ Adventure Chapters, 🎮 Catch the Laser & 📸 Photo Studio:** 3 initial Story chapters, canvas mini-game, live Closet Mochi preview, and seeded Friend Challenges (`MCH:<seed>:<score>:<name>`).

## ✨ What's New in v0.5.8
- **🏠 Cozy Room & 3D Toy/Gadget Overhaul (`pet.js`, `styles.css`):** Added baseboard molding + subtle wood-plank flooring, 4-pane window mullions, stitched double-rim rugs centered neatly under Mochi across mobile and tablet (`≥ 840px`), larger tablet Mochi proportions, readable mobile Playtest bar, and 3D Pixar-shaded props (`_drawFoodBowl` with vector golden fish, yarn, mouse, feather wand, laser beam, fountain, feeder, catnip plant, tower, wheel, vector songbird).
- **🍬 Jewel 3D Candy Blocks & Vector Special Emblems (`puzzle.js`):** Carved checkerboard 8×8 recessed slots, inlaid outer board bevel, pulsing golden row/col clear preview highlights, multi-stop diagonal candy block fills with specular glass capsules, faceted crystal ice, and custom 2D vector canvas emblems for `fish`, `bomb`, `gift`, `rocket`, `rainbow`, and `tuna`.

## ✨ What's New in v0.5.7
- **🐱 Clean Default Mochi & Intuitive `🛍️` Closet Button (`pet.js`, `main.js`, `index.html`):** Mochi now starts clean with no accessories or collar equipped by default, and the top-right Closet button uses a clear `🛍️` icon instead of `🎩`.
- **✨ 3D Pixar-Shaded Accessories & Collars (`pet.js`):** Completely upgraded visual detail on every crown (velvet dome + faceted gems), satin bow, glossy Wayfarer sunglasses, knitted scarf, padded headphones, pleated chef hat, plush bear ears, notched sakura blossom, seeded strawberry, star wizard hat, and stitched bell collars.

## ✨ What's New in v0.5.6
- **🎀 Motion-Tracked Kitty Accessories (`assets/sprites/manifest.js`, `pet.js`):** Hats, crowns, bows, headphones, sunglasses, scarves, and bell collars now interpolate smoothly frame-by-frame across all 19 visible `.webp` animation loops — tilting, bobbing, and mirroring in sync with Mochi (including side-profile `shades` while walking instead of disappearing).

## ✨ What's New in v0.5.5
- **👆 UI & Touch Ergonomics (`puzzle.js`, `styles.css`):** Live `✨ 1 LINE!` / `🔥 2 LINES!` ghost clear indicator, configurable **Touch Drag Height** (`Low / Normal / High`), compact narrow-phone HUD, and **Tablet Quick-Care Dock** (`💕 / 🧶 / 🎩 / 🎨`).
- **🌤️ Seasonal Window Weather, Ad-Free Archive & Special Tips:** Dynamic seasonal weather + Winter Heater cozy buff, `🐟 15 / 📺 Ad Free` Archive choice bar, and 1-time tooltips for special blocks.
- **🌐 Installable Web PWA & Local `.json` Backup (`manifest.webmanifest`, `sw.js`):** Full offline browser precaching + JSON Save Export/Import inside Cloud & Backup.

## ✨ What's New in v0.5.0
- **🗓️ Daily Challenge Monthly Archive (`daily-archive.js`):** Full monthly calendar inside Daily Rewards — replay missed seeded days (`15 🐟`) and earn `7d / 15d / Full Month` milestone Fish rewards.
- **🏆 Weekly Purr League Season Rewards (`league-rewards.js`):** Claim end-of-season Fish (`+10` to `+60 🐟`) and Season Trophies for prior ISO weeks.
- **🎨 Colorblind Symbols & 🔋 30 FPS Power Saver:** Distinct vector geometric glyphs on every block (`#toggleColorblind`) and calm reduced-motion 30 FPS loop (`#togglePowerSaver`) across all 6 languages.
- **⚙️ Modular Architecture & CI (`.github/workflows/ci.yml`):** Extracted `daily-archive.js` & `league-rewards.js` and added automated GitHub Actions CI + expanded `tests/run_tests.py`.

## ✨ What's New in v0.4.6

- **📱 Native Android Polish (`MainActivity.java`, `MochiShareProvider.java`):** Modal-aware Back button + double-tap exit guard, native Score Card Share Sheet, and Android `Vibrator` haptic feedback bridge.
- **🛡️ Cloud Backend Hardening & GDPR Self-Delete (`server/`, `monetization.js`):** IP rate limiting, live `POST /v1/profile` Nickname sync (+ inline Leaderboard Nickname prompt), and 2-tap **🗑️ Delete My Cloud Data** (`DELETE /v1/account` / `POST /v1/account/delete`).
- **🌙 Night Mode Music & Tablet Landscape (`audio.js`, `styles.css`):** Gentle Night lullaby melody when the lamp is on, plus a responsive 2-column layout on tablets/desktops (`≥ 840px`).
- **🧪 Automated QA Suite (`tests/run_tests.py`):** In-browser unit + E2E tests verifying Puzzle determinism, Back hook, Privacy Policy, Tablet layout & Cloud sync.

## ✨ What's New in v0.4.5

- **🧹 Supporter Pass & Billing Removal (`index.html`, `main.js`, `monetization.js`, `version.json`, `PRIVACY_POLICY.md`, `privacy.html`):** Removed the Cozy Supporter Pass UI, daily bowl bonus, `supporterDailyFish` remote-config key, and Google Play Billing references; updated Settings tab to **📖 Guide & Stats** and kept AdMob + live `api.jemangr.app` disclosures.

## ✨ What's New in v0.4.4

- **☁️ Live Leaderboard & Cloud Save (`https://api.jemangr.app`):** Powered by Cloudflare Workers + D1 (`server/`), **🏆 Purr League** now fetches live Daily, Weekly, and All-Time standings with graceful offline fallback, and **☁️ Cloud Save & Device Transfer** lets you sync & restore progress across devices using an anonymous `MOCHI-XXXX-XXXX` transfer code.
- **🛡️ Google Play Protect Fix & Safe Updates (`AndroidManifest.xml`, `MainActivity.java`):** Removed `REQUEST_INSTALL_PACKAGES` and in-app APK downloading/sideloading completely; update checks now open official releases safely in the external browser.
- **🔒 Bilingual In-App Privacy Policy (`PRIVACY_POLICY.md`, `privacy.html`):** Offline-capable EN/EL Privacy Policy modal in **Settings → App**, plus dedicated `privacy@jemangr.app` & `support@jemangr.app` addresses.
- **🟡 Squeezy Ball & Per-Toy Sounds (`audio.js`, `main.js`):** Dedicated audio profile per interactive toy with `toy_squeak.mp3` wired exclusively to the **Squeezy Ball**.

## ✨ What's New in v0.4.3

- **🖼️ Clean Stage Layout (`pet.js`, `styles.css`):** Shifted Mochi's stage anchor & roam bounds cleanly rightwards, compacted left HUD pills, and relocated `.wall-frame` & `.stage-event-pill` so pills never overlap Mochi or her bowl.
- **🔇 Background Audio Auto-Pause (`audio.js`, `MainActivity.java`):** Switching tabs or backgrounding the Android app immediately suspends WebAudio, stops the Kalimba loop, and pauses all MP3 clips (resuming cleanly on foreground).
- **⚙️ 3-Tab Settings & `jemangr.app` Showcase (`index.html`, `i18n.js`, `main.js`):** Regrouped Settings into **🎮 Game**, **👑 VIP & Info**, and **📱 App** tabs with responsive `dvh` bounds so nothing clips on small screens, plus an **Our Other Apps (`jemangr.app`)** card.

## ✨ What's New in v0.4.2

- **🌍 Complete 6-Language Localization (`el`, `en`, `de`, `es`, `fr`, `tr`):** Localized all remaining dynamic strings across HUD pills (`×2.0 ΠΟΝΤ.`, `Επ.1`, `🧘 Χαλαρά`), weekend/Wednesday event banners (with live refresh on language switch), puzzle cravings, onboarding welcome & Mochi speech bubbles, Daily Calendar & Streak Saver, Quests & Wall Stickers, Closet categories, Audio Mixer channels, Stats cards, Bug Report, Rewarded/Interstitial Ad demos, and Game Over modal.
- **📱 Android APK Asset Fix (`v0.4.1`):** Fixed Windows `build-apk.py` zip asset separators to POSIX `/` so bundled offline `www/` assets load reliably inside Android WebView (`zipalign` + `apksigner` v2+v3 verified).
- **🛡️ Smart Interstitial Gate, Remote Config & Funnel Analytics (`monetization.js`):** Zero forced ads on Day 0, `≥3`-run & `210s` cooldown gate, `120s` **Rewarded Immunity Shield**, live `version.json` Remote Config merge, native `MochiAdBridge` / `MochiNativeAnalytics` hooks, and an in-game **📊 Stats & Funnel** inspector in Settings (`⚙️`).
- **🎡 Lucky Tuna Wheel & 📸 12-Card Sticker Album:** 1 Free daily spin + up to 3 Bonus Ad spins/day for Golden Fish, `↻` Rotates, or **Mochi Moments** sticker cards (`3 sets × 4 cards` with `+12/+18/+24 🐟` set completion bonuses in Daily → `📸 Album`).
- **💖 Friendship Level (`Lv.1–50`), 🎉 Mini-Events & 🏆 Purr League:** Earn Friendship XP for permanent `+1`/`+2` starting `↻ Rotate` perks, enjoy **🐟 Fish Frenzy (`2×`)** weekends & **🚀 Rocket Surge (`2×`)** Wednesdays, and compete in Daily/Weekly Purr League standings with your Nickname.
- **📺 High-ROI Rewarded Flows:** **2× Run Fish** + **Rescue Pack (`+3 ↻ + 1 💣`)** on Game Over, once-per-run **🎁 Upgrade (`+4 🐟 + Card`)**, and **Closet `Watch-Ad (0/3)`** alternative unlocks on premium items.
- **🔔 Native Android Scheduled Care Alarms (`MochiAlarmReceiver.java`):** Localized (`el/en/de/es/fr/tr`) background reminders when Mochi is hungry or sulking.

## ✨ Earlier Releases (`v0.2.0` + `v0.3.0`)

- **🌍 6-Language Support (`el`, `en`, `de`, `es`, `fr`, `tr`) & Nickname (`i18n.js`):** Instant language picker & nickname setup on first launch or inside **Settings (`⚙️`)**, rendered live across the UI, Score Cards, and guide.
- **📖 5-Step Welcome Guide & Interactive Permissions:** Explains Mochi's care & energy multiplier, puzzle specials & moves, rewards/closet, and requests Notifications, Haptics & APK install permissions cleanly on first run (reopenable from Settings).
- **🥫🚀🌈🎁 Special Tiles & Tactics (`puzzle.js`):** Golden Tuna (`+2 🐟`), Mystery Gift Box (`🎁`), Yarn Rocket (`🚀` cross-line burst), Rainbow Color-Clear (`🌈`), **Hold Pocket (`HOLD`)**, **90° Rotate (`↻`)** with earned charges + Ad refill, **🧘 Zen Mode**, Color Harmony (`×1.5`), Full-Board Clear (`+1000`), Milestone Waves, Smart Magnetic Snap, Cascade Clear, and **4 Tile Skins** (`Classic`, `Cat Paws`, `Choco Cookies`, `Cyber Neon`).

## ✨ Highlights from v0.2.0

- **21 Animated Pixar-Style Sprite Loops (`assets/sprites/*.webp`):** Smooth `4×4` transparent WebP atlases (`idle`, `walk_side`, `sleep`, `eat`, `drink`, `cry`, `sulk`, `sulk_2`, `pet_1..3`, `cheer`, `fainted`, `groom`, `nervous`, `dance`, `yawn`, `tickle`, `play_pounce`, `track_toy`, `fever_party`) with accessories & bell collars attached dynamically.
- **Audio & 3-Channel Sound Mixer (`audio.js`):** 13 normalized MP3 voice/SFX clips (`meow_1`, `meow_2`, `purr`, `eat`, `cry`, `sulk`, `yawn`, `fainted`, `sneeze`, `water_lap`, `kibble_pour`, `toy_squeak`, `bell_jingle`), background kalimba carpet, and separate volume/mute sliders for **Music**, **Game SFX**, and **Cat Sounds**.
- **7-Day Daily Rewards Calendar & Quests (`#dailyModal`):** Looping Day 1–7 calendar with Free Claim + Rewarded Ad Super Bonus, missed-day **Streak Saver**, Day 5 `Snack Dispenser`, Day 7 Grand Prize (`🧙 Star Wizard` + `🏰 Cat Tower`), plus Quests that unlock Wall Frame Stickers (`👑`, `🌟`, `💖`).
- **Energy Multiplier, Purr Rush & Power-Ups:**
  - Mochi's energy dynamically scales puzzle score (`×0.75` up to `×2.0`).
  - **Purr Rush (Fever Mode):** Triggers for `30s` at high energy (`≥ 90%`) + `Combo ≥ x3`, doubling Golden Fish frequency and adding `+0.5×` multiplier.
  - **High-Value Rewarded Ads (Demo Flow):** `⚡×3.0 Overdrive` (15 moves) & `💣 Emergency Paw Bomb` (`1×1` board clear piece), alongside Undo, Refresh, and Rescue/Revive.
- **Interactive Room Gadgets, Toys & Themes:** Yarn Ball, Wind-Up Mouse, Feather Wand, Laser Pointer, Water Fountain (`drink` loop + `-30%` decay), Daily Snack Dispenser, Window Bird Feeder, Heated Cushion, Scratching Wheel, Catnip Plant, Fairy Lights, and `Peach Cozy` / `Sunny Beach` / `Snowy Cozy` themes.
- **Easter Eggs & Polish:** Uninterrupted 6-tap rapid nose-tickle sneeze (`ACHOO!!`), Dramatic Faint (`24h+` away), Playtest Tools bar (auto-hidden in production builds unless `?demo=1`), and local notification schedule planner.

---

## 📁 Project Structure

- `index.html` — Mobile-first viewport, HUD, Daily Rewards/Quests, Wardrobe, Sound Mixer, Settings & Error Report modals.
- `styles.css` — Pastel styling, day/night room lighting, themes, responsive phone shell, modal & animation styles.
- `i18n.js` — Localization dictionary (`el`, `en`, `de`, `es`, `fr`, `tr`) & automatic DOM translation.
- `monetization.js` — Smart Interstitial Gate, Remote Config merge, `MochiAnalytics` funnel tracking, Wheel prizes, 12-Card Sticker Album, Friendship Levels (`Lv.1–50`), Mini-Events & Purr League generator.
- `pet.js` — `MochiPet`: 60 FPS sprite atlas renderer + canvas fallback, pointer look-tracking, prop walking, accessories, collars, room gadgets, particles.
- `puzzle.js` — `PuzzleEngine`: 8×8 block puzzle, weighted shapes, Special Tiles (`🐟`, `🥫`, `🎁`, `🚀`, `🌈`, `🧊`, `💣`), Hold Slot, 90° Rotate, Zen Mode, Tile Skins, ghost preview & energy multiplier.
- `audio.js` — `SoundEngine`: Web Audio API music loop + 13 MP3 SFX clips + 3-channel mixer.
- `main.js` — Persistence (`localStorage`), offline hunger/mood decay, 7-day Daily Calendar & Quests, Wardrobe/Shop, Demo Rewarded Ads, diagnostics & PNG Score Card export.
- `android/` — Native Android WebView wrapper (`MainActivity.java`, `AndroidManifest.xml`, adaptive launcher icon) serving bundled assets cleanly via `https://appassets.mochi.local`.
- `scripts/build-apk.py` — Zero-dependency Python builder using `aapt2`, `javac`, `d8`, `zipalign`, and `apksigner` to produce signed `dist/mochi-pop-puzzle.apk`.
- `server/` — Cloudflare Workers API (`src/worker.js`, `wrangler.toml`) + D1 SQL schema (`schema.sql`) powering live leaderboards & cloud saves at `https://api.jemangr.app`.
- `tests/run_tests.py` — Automated browser unit + E2E QA suite (`360×800` mobile, `1024×768` tablet, Cloud sync & Daily determinism).
- `PRIVACY_POLICY.md` & `privacy.html` — Bilingual (EN/EL) Privacy Policy (also embedded offline inside Settings → App).
- `CHANGELOG.md` — Version history (`v0.5.8`, `v0.5.7`, `v0.5.6`, `v0.5.5`, `v0.5.0`, `v0.4.6`, `v0.4.5`, `v0.4.4`, `v0.4.3`, `v0.4.2`, `v0.4.1`, `v0.4.0`, `v0.3.0`, `v0.2.0`, `v0.1.0`).
- `version.json` — Remote auto-update manifest & live `remoteConfig` values.
- `TODO.md` — Roadmap for live AdMob SDK & Play Store launch.
- `assets/` — Compiled `sprites/*.webp`, `sounds/*.mp3`, reference art, and documentation screenshots.

---

## 📱 Build & Preview

### 1. Android APK (`dist/mochi-pop-puzzle.apk`)

```powershell
python "scripts/build-apk.py"
```

Outputs a v2+v3 signed, zipaligned APK (`dist/mochi-pop-puzzle.apk` and `dist/mochi-pop-puzzle-v0.5.8.apk`).

### 2. Local Web Preview

Serve locally (recommended for MP3/WebP loading) or open `index.html` directly:

```powershell
python -m http.server 8778 --directory "c:\Claude\puzzle game"
```

Desktop/localhost builds automatically display the top **Playtest Tools** bar (`+6h Away`, `+14h Sulk`, `+48h Faint`, `⏭️ +1 Day`, `☀️/🌙 Day/Night`, `😴 Wake`, `Test Cry/Lose`, `+5 Fish`, `Reset`). It hides automatically on production domains & inside the Android APK (can be forced via `?demo=1` or suppressed locally via `?prod=1`).

---

## 📦 Releases Repository

Public showcase & direct downloads (Android `.apk` + Web `.zip`) live at **`jemangr/mochi-pop-puzzle-releases`**:  
[`https://github.com/jemangr/mochi-pop-puzzle-releases/releases`](https://github.com/jemangr/mochi-pop-puzzle-releases/releases)
