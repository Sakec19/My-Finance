# MyFinance — offline-first PWA starter

## Included
- Income/expense entry, edit and delete; daily/weekly/monthly/all-time overview.
- Category spending breakdown and net cash flow.
- Bank accounts with opening balances and transaction-based running balances.
- Credit card balance, limit, minimum, due date, and suggested twice-monthly payment split.
- Savings goal roadmap with daily, weekly and monthly targets.
- CSV transaction export and full JSON backup/restore.
- Local browser storage (`localStorage`) and an app-shell service worker for offline loading.
- Browser notification permission and reminder checks while the app is open/active.

## Run locally
Service workers require a secure context (`https://`) or `localhost`; opening `index.html` directly via `file://` will not enable offline caching. With Python installed:

```bash
cd myfinance_pwa
python -m http.server 8000
```

Then open http://localhost:8000 in Chrome/Edge. For iPhone installation, deploy the folder to an HTTPS host, open its URL in Safari, use Share → Add to Home Screen. The server is needed for first install; cached shell can then load offline after successful installation and cache setup.

## Important behavior and limitations
- Currency is currently USD.
- Data is stored in this browser's local storage. Clearing browser/site data can delete it; export backups regularly. No cloud sync is implemented.
- The payment plan is a rough planning aid, not a bank connection or payment instruction. It splits the entered balance into two suggested amounts and displays the minimum payment. Verify issuer statement, available cash, interest, pending charges and payment processing time yourself.
- Due dates should be updated to the next actual due date each cycle. A card due date is stored as a single date, not an automatically recurring schedule.
- Web notifications are not reliable scheduled alarms when the browser is closed or suspended. This version checks reminders when opened and while the page is active. Reliable background iOS notifications need additional native/push infrastructure.
- Cloud backup, encryption-at-rest beyond browser/platform storage, biometric lock, multi-device sync, and bank integrations are not implemented.

## Test checklist
1. Add an account with opening balance $1,000.
2. Add a $100 expense assigned to that account; verify account balance is $900.
3. Add $500 income assigned to the account; verify balance is $1,400.
4. Change Daily/Weekly/Monthly/All time and check summary totals.
5. Add a card and goal; verify payment split and daily/weekly/monthly savings targets.
6. Export CSV; open in a spreadsheet app.
7. Download JSON backup, clear test data, restore backup, and confirm records return.
8. Deploy over HTTPS, install to home screen, load once online, then test airplane mode.

This is a runnable starter implementation, not a professionally audited financial product. Test with sample data before relying on it.


## Payment calendar (version 3)

Select **Payment calendar** to view previous/current/next months. For each credit card, the due date is repeated monthly (short months clamp to their final day). The final installment is targeted 3 calendar days before the due date, and the first installment 15 days before that. The application does **not** guarantee bank processing by the due date; pay earlier for weekends and holidays.

Select **Mark paid** for each installment. Enter the actual amount and the actual payment date. A recorded partial payment reduces the remaining cycle amount; the other unrecorded installment is recalculated. An **Undo** action removes the record and recalculates the plan. Payment history is saved locally and included in JSON backups; **Export payments CSV** is also available. A payment marked here does not move money or automatically debit your bank account. The card balance is a per-cycle starting target snapshot; the app does not retrieve issuer statements, interest, new purchases, or roll a prior cycle's remainder into the next cycle. Reconcile and edit balances each billing cycle.

Local browser persistence is not a secure encrypted vault. No actual cloud backup or closed-app scheduled iOS notification mechanism is included. For financial data, use your device's security features and store downloaded backups securely.


## Version 4: bundled offline issuer-style artwork and calendar

- The ZIP includes self-contained SVG icons in `assets/` for Chase, American Express, Capital One, Citi, Discover, Bank of America, Wells Fargo, and a generic card. These are **original illustrative issuer badges**, **not official bank logos** or representations of endorsement. No external downloads or image requests are used.
- Choose an issuer when adding or editing a card. Existing cards automatically infer an issuer from their name until edited.
- The calendar displays due dates (gold), scheduled payments (green), and recorded payments (gray). Select a day for a focused agenda.
- The payment scheduling and JSON schema are unchanged; existing local data and backups should remain compatible.
- Reinstall/reload the upgraded app online once so the version 4 service worker can precache the new SVG artwork, then verify airplane-mode functionality.
- Bank logos are trademarked and official logo files are not bundled. For official artwork, obtain permitted assets and replace SVGs while preserving filenames.

## Version 5: expanded offline card-art library

- Credit cards can now use a broader set of bundled **offline illustrative card styles**.
- Added common issuer-family styles across Chase, American Express, Capital One, Citi, Discover, Bank of America, and Wells Fargo.
- Added co-branded and specialty-style options including **Hilton-style** and **Delta-style** variants, plus Bilt-style.
- These bundled SVGs are **original illustrative assets** packaged with the app for offline display. They are not official bank or airline or hotel logos, and no network request is required to show them.
- Existing saved cards remain compatible. If a card has no chosen artwork, the app tries to infer an appropriate style from the card name and issuer.

## Version 6: Light / Dark / System appearance

- A Theme selector in the app header offers **System**, **Light**, and **Dark**.
- System mode follows the device's current appearance setting and updates when it changes.
- Theme preference is saved locally, and included in JSON backups under settings.theme.
- The finance dashboard, payment calendar, card rows, dialogs, alerts, buttons, and forms all use theme-aware contrast. Card artwork remains bundled offline.
- The service worker cache was bumped to v6. Load the hosted app online once to receive the refreshed shell, then test offline.


## Version 7: expanded offline card pack and due-date calendar

- Added a larger bundled offline card-art library across major issuers, including Chase, American Express, Capital One, Citi, Discover, Bank of America, Wells Fargo, U.S. Bank, Barclays, Synchrony, Navy Federal, PNC, TD, and Citizens.
- Added many common card-family styles and co-branded styles such as Hilton, Delta, United, Southwest, Hyatt, IHG, Marriott, Alaska, JetBlue, Wyndham, Amazon, PayPal, Venmo, Bilt, Costco, AAdvantage, and more.
- These are original illustrative SVGs included in the app bundle for offline display; they are not official logos.
- The Payment Calendar now includes a “Card due dates this month” strip that shows every due card with its icon preview and due date.
- Calendar day cells also show small icon previews on due dates.


## Version 8 — user-supplied card photos

- Added **44** offline WebP photo previews cropped from the supplied card-image collages. Existing card visuals fall back to bundled SVG illustrations where no supplied photo exists.
- Calendar day previews, monthly due cards, and card list use the same photo mapping. Added several new selectable business and travel card variants.
- Cropped cardholder-label regions were obscured where practical. Images displaying full account/card numbers or personal account paperwork were excluded.
- Photos are locally bundled in `assets/` and are precached in the V8 service worker. Deploy over HTTPS and load once online before testing Airplane Mode.
- Official product images may change over time; user-supplied screenshots can be dated or small and some crops may be less sharp than individually supplied promotional images.


## Version 9: new user-provided card photos

- Added 16 newly uploaded product-card previews as local optimized WebP assets and retained the original uploaded-art matches from V8. The new matches cover Amex Delta SkyMiles Blue/Gold/Platinum/Reserve, Amex Gold/Platinum, Hilton Honors/Surpass/Aspire, Marriott Bevy/Brilliant, Blue Cash Everyday/Preferred, Barclays JetBlue Plus/Aviator, and Bank of America Alaska Airlines.
- Added separate Blue Cash Everyday, Blue Cash Preferred, and Marriott Bonvoy Bevy picker entries. Existing card image selections and all account data remain compatible.
- Included four user-uploaded Bank of America issuer-mark images for future optional use; preserved existing V8 full-card previews instead of replacing them with logos.
- New images are bundled into the service-worker cache for offline use after secure first load. The actual images provided are low-resolution (160 x 100), so enlarged previews may appear soft.
- Images are user-provided examples, not verified current product or issuer artwork. No financial account details are transmitted.


## Version 10 — uploaded Bank of America card previews

- Kept the existing uploaded American Express, Chase, Capital One, Citi and Barclays card previews and preserved existing saved data.
- Replaced Bank of America's logo-only previews with the newly supplied full-card images for Customized Cash Rewards, Premium Rewards, Travel Rewards, and Unlimited Cash Rewards.
- Bundled a BankAmericard full-card image and added Premium Rewards Elite as its own selectable style with its uploaded card image.
- Identical duplicate Amex/Hilton/Delta/Marriott uploads were skipped, avoiding redundant assets.
- All photo previews are packaged as local WebP files in assets/ and precached by the v10 service worker for offline use.
- The calendar and the card overview automatically use the updated mapping; an illustrative SVG is used if an uploaded preview is unavailable.
- Real cards are shown only as imagery; the app does not retrieve card balances or make payments.


## V11: user-supplied card imagery
Added locally bundled card previews for TD, Citi, PNC, U.S. Bank, and additional Chase/Capital One/Barclays cards. All photo assets are served locally and cached by service worker. New specific variants include Citi Strata Elite/Premier, Costco Business, Diamond Preferred, Simplicity, and Disney Inspire/Premier. Discover collage and blank Synchrony images were not used. The PWA does not connect to any bank or automatically execute payments. New asset deployments should be loaded over HTTPS once while online to update the offline cache.


## Version 12: Discover it Gold card style
- Added a selectable Discover it — Gold design card option and locally bundled SVG preview for the payment calendar.
- The gold preview is original illustrative artwork inspired by the Discover it gold design linked by the user; it is **not the actual online photograph**.
- The linked forum photo could be viewed but was not retrievable as a local image file. To use that exact image, upload it directly.
- Existing saved cards and image mappings remain intact.
