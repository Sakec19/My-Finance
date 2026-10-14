# MyFinance — encrypted Google Drive cloud backup setup

Cloud backup is **optional**. The application remains offline-first. Existing JSON download and restore features still work without Google.

## One-time Google Cloud setup (for the app owner)

1. Open https://console.cloud.google.com/ and create/select a project.
2. Enable **Google Drive API** under APIs & Services → Library.
3. Configure the Google Auth Platform (OAuth consent/branding). Choose the user type available for your account. If your app is in Testing, add yourself to the test users list. Request the scope `https://www.googleapis.com/auth/drive.appdata` (Drive app-data only, not general file access). Google may require verification depending on publication/audience; follow the Google console prompts.
4. Create an OAuth **Web application** client under Clients/Credentials.
5. Add your EXACT Vercel origin under **Authorized JavaScript origins**, for example `https://your-app.vercel.app` (origin only, no path). You may add `http://localhost:8000` for development. Redirect URIs are not needed for Google Identity Services token flow.
6. Copy the OAuth **client ID** ending in `.apps.googleusercontent.com` (NOT the client secret).
7. Deploy the updated app to Vercel. In MyFinance → **Backup & settings → Google Drive backup**, paste that client ID, choose a strong unique passphrase of at least 12 characters, and choose **Connect Google Drive**. Grant the requested app-data scope.
8. Choose **Back up now**. Wait for confirmation before relying on it. You can enable **Auto-backup changes**. Test a restore using sample data first.

## What gets backed up

All local state: transactions, bank accounts, credit cards and card-art selections, recorded payment history, savings goals, and settings. Static card-art image assets are bundled with the app and are not uploaded. Backups are AES-256-GCM encrypted **before** being sent to Google's Drive app-data folder, using a PBKDF2-SHA256 key derived from the passphrase. The passphrase and OAuth access token are held in page memory only; they are never stored in localStorage or uploaded. One encrypted backup file (`myfinance-encrypted-backup-v1.json`) is created/updated in the app-data folder. This is a backup, not multi-device live sync or historical versioning.

## Important limitations

- Requires HTTPS and a working browser-based Google OAuth sign-in, available internet, and your consent. Google/Apple privacy settings or OAuth configuration can prevent sign-in.
- Auto-backup runs only while the web app is open, online, authorized, and the passphrase has been entered. It is not a background iOS upload service; after reopening, reconnect and re-enter the passphrase.
- Losing the passphrase means the cloud backup cannot be decrypted. Save it securely in a password manager. Restoring replaces all local data, with an explicit confirmation.
- Only one cloud backup version is kept. Before restoring or making risky changes, download a separate local JSON backup.
- If several devices use the same Google account, the most recent successful upload overwrites the previous cloud file. Avoid simultaneous editing; this is not a conflict-aware sync system.
- No Google client secret, API key, or service-account credential should be added to this static Vercel app.
- Your finance entries are still stored unencrypted in the current browser's localStorage for offline use; cloud encryption does not encrypt this local storage.

## Deployment

Upload the full extracted ZIP content to your GitHub repo, commit, and allow Vercel to deploy. You do not need any Vercel environment variables for this static client-side OAuth approach. Adjust your Google OAuth allowed origin if you deploy to a different URL/domain.
