# Monviora — Branded Web/PWA Release

This web-only package applies the approved Monviora Finance Pro artwork to the most recent **MyFinance country-cards / balance toggle** web release.

## Updated
- App header name and tagline: **Monviora / Your money. Your world.**
- Header artwork sourced from the selected Monviora design.
- PNG browser favicons and Apple touch icon.
- PWA manifest app name, icon sizes (192px/512px), and separate maskable icon.
- Social preview image and web page description.
- Service worker cache revision to refresh branded assets.

## Preserved, intentionally unchanged
- All existing financial data keys, browser localStorage structures and country records.
- Firebase project configuration, Firebase functions/globals, cloud snapshots and Firestore rules.
- Payment reminders, theme choices, the country carousel and per-card balance toggles.
- Web-only deployment: no Capacitor, iOS/Xcode/Codemagic files or GitHub upload automation.

## Install
1. **Export your full finance JSON backup before deploying.** Retain a copy of the existing website.
2. Extract ZIP, compare/merge with any newer deployed changes, and place files with `index.html` at the static host root.
3. Deploy over HTTPS (e.g. Vercel static hosting); **do not** set a native build command.
4. Refresh/reinstall the PWA if your Home Screen still displays the old icon. Existing devices may cache the old icon independently of the service worker.
5. Test theme toggle, country card swipe and show/hide controls, Firebase login/restore, and existing transactions with test data before importing real data.

The generated Monviora logo uses a crop from the approved promotional artwork; consider a separate simpler small-size mark if accessibility at 32px is a concern.
Cloud Firestore project ID still contains its original MyFinance identifier; renaming the consumer-facing app does not require changing Firebase IDs.
