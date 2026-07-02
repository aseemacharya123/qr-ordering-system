# Deployment

Two separate things get deployed: the **frontend** (React app, one deployment shared by all businesses) and the **backend** (one Apps Script web app per business, since each business has its own Google Sheet).

## Backend: Google Apps Script (per business)

1. Create or open the business's Google Sheet.
2. **Extensions → Apps Script.**
3. Paste in the contents of `apps-script/Code.js` from this repo (replace anything already there).
4. **Deploy → New deployment** (first time) or **Manage deployments → Edit → New version** (updates):
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the web app URL (ends in `/exec`) — this is the business's `apiUrl`.
6. Under the gear icon **Project Settings → Script Properties**, add:
   - `WHATSAPP_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `BUSINESS_OWNER_PHONE`

Note: editing the script and clicking Save is not enough to update the live URL — you must create a **new deployment version** each time you change `Code.js`, or the web app keeps serving the old code.

## Frontend: Vercel (preferred)

1. Push this repo to GitHub (if not already).
2. In Vercel, **Add New → Project**, import the repo.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist` (Vercel usually detects this automatically).
4. The `vercel.json` in this repo already handles SPA routing for `/menu/*` paths — no extra config needed.
5. Deploy. Every new business just needs an entry in `src/config/businesses.js` — no redeploy of Apps Script is needed for frontend-only changes, and no new Vercel project is needed per business.

## Frontend: Firebase Hosting (alternative)

1. `npm install -g firebase-tools` (once).
2. `firebase login`, then `firebase init hosting` in this project — set the public directory to `dist`, and answer **yes** to "configure as a single-page app" (this handles the same `/menu/*` rewrite that `vercel.json` does for Vercel).
3. `npm run build`
4. `firebase deploy`

## Config placeholders to fill in per environment

- `src/config/businesses.js` — each business needs a real `apiUrl` (from the Apps Script deployment step above) before it will work; a placeholder URL will make orders fail silently with a friendly error.
- Apps Script **Script Properties** (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `BUSINESS_OWNER_PHONE`) — until these are set, orders still save fine, but the owner will not receive a WhatsApp alert.

## After deploying

Follow [qr-setup.md](qr-setup.md) to generate and test QR codes before printing/handing them to the business owner.
