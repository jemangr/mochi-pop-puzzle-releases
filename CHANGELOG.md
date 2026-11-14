# Changelog — Mochi Pop!

## [0.2.0] - 2026-11-14
### Added
- **Pixar-Style 3D Mochi Sprite Engine (21 Animations):** Integrated 4×4 transparent WebP sprite atlases (`idle`, `walk_side`, `sleep`, `eat`, `drink`, `cry`, `sulk`, `sulk_2`, `pet_1..3`, `cheer`, `fainted`, `groom`, `nervous`, `dance`, `yawn`, `tickle`, `play_pounce`, `track_toy`, `fever_party`) with accessories & bell collars attached to bone offsets.
- **Audio & 3-Channel Mixer (`audio.js`):** 13 normalized MP3 voice/SFX clips (`meow_1`, `meow_2`, `purr`, `eat`, `cry`, `sulk`, `yawn`, `fainted`, `sneeze`, `water_lap`, `kibble_pour`, `toy_squeak`, `bell_jingle`) plus independent toggles & volume sliders for Music Carpet, Game SFX, and Cat Sounds.
- **7-Day Daily Rewards Calendar, Quests & Streak Saver (`#dailyModal`):** Looping Day 1–7 rewards calendar with Daily Free Claim + Demo Ad Super Bonus, missed-day Streak Saver Ad, quests unlocking wall frame stickers (`👑`, `🌟`, `💖`), and `+1 Day` playtest helper.
- **Energy Multiplier, Purr Rush & High-Value Boosts:** Cat energy dynamically scales puzzle score multiplier (`×0.75` to `×2.0`), `Purr Rush` Fever Mode (`30s` at high energy + `Combo x3` doubling Golden Fish frequency), `⚡×3.0 Overdrive` Boost (15 moves), and `💣 Emergency Paw Bomb`.
- **Interactive Toys, Care Gadgets & Room Themes:** Yarn Ball, Wind-Up Mouse, Feather Wand, Laser Pointer, Water Fountain (`drink` anim + `-30%` offline decay), reworked Daily Snack Dispenser, Window Bird Feeder, Heated Cushion, Scratching Wheel, Catnip Plant, Fairy Lights, Cat Tower, and `Peach Cozy` / `Sunny Beach` / `Snowy Cozy` themes.
- **Easter Egg & Polish:** Uninterrupted 6-tap rapid nose-tickle sneeze animation (`sneeze.mp3`), Dramatic Faint & Rescue flow (`24h+` away), Playtest Bar auto-hide in production builds (plus `?prod=1` preview), and local notification schedule planner.
- **Native Android APK (`dist/mochi-pop-puzzle.apk`):** Full-screen portrait WebView Android wrapper (`minSdk 26`, `targetSdk 34`, offline `appassets.mochi.local` asset routing, Downloads PNG score card saver, external `mailto:` support, custom Mochi launcher icon, v1+v2+v3 signed via `scripts/build-apk.py`).

### Fixed
- Tightened top HUD flex layout & responsive sizing so the Settings (`⚙️`) button always remains cleanly inside narrow phone screens (`360px`–`410px`) even with 5-digit scores, and turned mobile Playtest Tools into a single slim top strip without overlapping Mochi.

## [0.1.0] - 2026-11-13
### Added
- Initial playable web build of Mochi Pop! featuring the 8×8 block puzzle (`PuzzleEngine`), procedural `MochiPet`, offline hunger/mood decay, Settings, Error Report diagnostics, and shareable PNG Score Card.
