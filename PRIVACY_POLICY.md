# Privacy Policy — Mochi Pop!

**Effective Date:** November 14, 2026  
**Developer:** jemangr  
**Privacy Contact:** privacy@jemangr.app  
**Support / Bug Reports:** support@jemangr.app  
**Website:** https://jemangr.app  
**Application ID:** `app.jemangr.mochipop`

---

## 1. Overview

**Mochi Pop!** is an offline-first cozy block puzzle and virtual pet game developed by **jemangr**. We respect your privacy and collect as little information as possible.

This Privacy Policy explains what data the app stores locally on your device, what network requests it makes (including our live Leaderboard and Cloud Save API), how permissions are used, and how future Google Play advertising (Google AdMob) is handled.

---

## 2. Data Stored Locally on Your Device

By default, Mochi Pop! stores your game progress, preferences, and counters **strictly locally on your device** (inside browser/WebView `localStorage`, and Android Auto Backup when enabled by your OS settings):

- **Game Save & Preferences (`mochi_pop_save_v1`):** Puzzle grid state, scores, best score, daily challenge progress, cat hunger/happiness/energy levels, Golden Fish balance, owned accessories/toys, language choice, sound volumes, and your chosen display **Nickname**.
- **Onboarding Flag (`mochi_pop_onboarded_v030`):** Whether you completed the welcome guide.
- **Local Gameplay Counters (`mochi_pop_analytics_v1`):** Local session/run counters and ad-pacing timestamps stored only on your device unless native analytics is explicitly integrated.
- **Remote Config Cache (`mochi_pop_remote_cfg_v1`), Cloud Identity (`mochi_pop_cloud_v1`) & Update Cache (`mochi_pop_update_meta_v1`):** Cached update check timestamps, gameplay configuration parameters, and your random anonymous `playerId`, `deviceToken`, and transfer `syncCode` (`MOCHI-XXXX-XXXX`).

You can delete all locally stored data at any time by clearing the app's storage in Android Settings or clearing site data in your browser.

---

## 3. Network Requests & External Services

### 3.1 App Update Checks (Direct APK Distribution)
In the standalone APK / web release, Mochi Pop! periodically checks for new versions and remote configuration via HTTPS requests to GitHub:
- `https://api.github.com/repos/jemangr/mochi-pop-puzzle-releases/releases/latest`
- `https://raw.githubusercontent.com/jemangr/mochi-pop-puzzle-releases/main/version.json`

GitHub may receive standard HTTP connection metadata (such as your IP address and User-Agent) when serving those static files, subject to GitHub's Privacy Statement. No personal profile data or gameplay save is transmitted in update checks.

### 3.2 Support & Bug Reports
If you choose to tap **Report a Bug / Error**, Mochi Pop! opens your device's email client (`mailto:support@jemangr.app`) with app version and recent local error diagnostics pre-filled. Sending an email is **100% voluntary**; nothing is sent automatically without your action.

### 3.3 External Links
Links such as **Our Other Apps (`https://jemangr.app`)** open in your external browser and are governed by the privacy policy of the destination page.

### 3.4 Advertising (Google Play Releases)
- **Current Preview / Direct APK Builds:** Rewarded and interstitial ads are **simulated locally (demo mode)** and **no real ad network SDK** is active in the preview build.
- **Future Google Play Store Releases:** When published on Google Play with **Google AdMob** enabled, **Google AdMob** may collect device identifiers (such as the Android Advertising ID), IP address, coarse location, and ad interaction data in accordance with Google's Privacy Policy and EU/EEA **UMP (User Messaging Platform) GDPR consent** prompts where required.

### 3.5 Online Leaderboard (`Purr League`) & Cloud Save (`https://api.jemangr.app`)
Mochi Pop! uses our Cloudflare Workers + D1 API (`https://api.jemangr.app`) to power live leaderboards and optional cross-device Cloud Save backups **without requiring an email address or password**:
- **Live Leaderboard:** Sends your random anonymous `playerId`, chosen **Nickname** (default: `MochiFan` — please do not use your real full name, email, or phone number), puzzle **Score**, **League Tier**, and **Date Key**.
- **Cloud Save & Device Transfer:** Stores your gameplay save JSON (`appState` and board progress) linked only to your random `playerId` and Device Transfer Code (`MOCHI-XXXX-XXXX`) so you can restore your progress on another device.
- **No Personal Account Data:** No email, phone number, contacts, or precise location are required or collected by `api.jemangr.app`.

---

## 4. Android Permissions Explained

Mochi Pop! declares only the permissions needed for its features:

- **`INTERNET` & `ACCESS_NETWORK_STATE`:** Used for live Purr League leaderboards & Cloud Save (`https://api.jemangr.app`), update checks, external links, and (in future Google Play builds) ads.
- **`VIBRATE`:** Optional tactile feedback when placing blocks or petting Mochi (can be turned off in Settings).
- **`POST_NOTIFICATIONS` (Optional):** Requested only if you enable gentle daily care reminders for Mochi. Scheduled locally on your device via Android `AlarmManager` (`MochiAlarmReceiver`). You can disable notifications anytime in Android Settings.

---

## 5. Children's Privacy

Mochi Pop! is a general-audience casual puzzle game and is **not directed at children under 13** (or the applicable age of digital consent in your country). We do not knowingly collect personal information from children. If you believe a child has submitted personal data through support email or a future nickname submission, contact `privacy@jemangr.app` and we will delete it promptly.

---

## 6. Your Rights & Data Deletion (GDPR / EEA & International Users)

- **Local Data:** Uninstall the app or clear app storage to erase all local saves immediately.
- **Leaderboard / Support Email Deletion Requests:** Email `privacy@jemangr.app` with your Nickname or request details and we will delete any server-side leaderboard entries or support correspondence associated with your request.

---

## 7. Changes to This Policy

We may update this Privacy Policy as new online features (such as Google AdMob) or service updates are rolled out. Updates will be reflected by the Effective Date above.

---

## 8. Contact

For privacy requests, contact:  
**Developer:** jemangr  
**Privacy Email:** privacy@jemangr.app  
**Support Email:** support@jemangr.app  
**Web:** https://jemangr.app
