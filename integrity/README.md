# BhuChain Site Integrity

Daily tracking for BhuChain construction sites, so that no worker, engineer, supervisor, contractor or supplier can fake attendance, records or bills. It needs only Android phones, Google Sheets/Drive, WhatsApp and printed QR cards.

**Live app:** https://ashuda332.github.io/build/integrity/ — open it in Chrome on the phone and choose "Add to Home screen". It works offline.

| File | What it is |
|---|---|
| `index.html`, `app.js` | The phone app (Hinglish / हिंदी / ଓଡ଼ିଆ) |
| `core.js` | All rules: roles, approvals, proof, stock, standard consumption, payment checks, red flags, reports, hash chain. No DOM, so it is tested in Node |
| `apps-script/Code.gs` | Free backend: append-only Google Sheet ledger, photos to Drive (`Site/Date/Category`), daily Merkle root |
| `docs/MANUAL.md` | The full system: overview, sections A–K, templates, red-flag table, schedule, penalties, upgrade path. **Start here** |
| `docs/GOOGLE-SETUP.md` | Sheet, Apps Script, Drive, Forms (backup), conditional formatting, access |
| `docs/STAFF-GUIDE-HI.md`, `docs/STAFF-GUIDE-OR.md` | One-page site staff guides in Hindi and Odia |

## How data is stored
- Every action is an **entry**: id, device, sequence number, type, time, person, GPS, photo hashes, data, the previous entry's hash, and its own SHA-256 hash.
- Entries are saved first in the phone's IndexedDB, so they work without internet.
- When the phone is online, entries are sent to the Google Sheet `Ledger` tab, which is append-only. Photos are stamped with site, time, GPS and name, and go to Drive.
- Each phone also pulls the other phones' entries.
- Nothing is edited or deleted. A correction is a new entry and counts only after a second person approves it.
- A changed or missing entry breaks the hash chain and shows as a red flag.
- Each day's entries reduce to one Merkle root (Reports → Day hash, and the `Anchors` sheet). That root is what gets anchored on the BhuChain blockchain.

## Tests
`node tests/integrity-core.mjs` checks the rules. `node tests/integrity-ui.mjs` runs the app in a phone-sized browser. Both run in CI.
