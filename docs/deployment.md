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
   - `OWNER_PIN` — a **unique** PIN for this business's owner dashboard login (revenue, AI insights). Never reuse the same PIN across clients.
   - `STAFF_PIN` — a separate PIN for the kitchen/staff order queue (optional). If unset, `OWNER_PIN` also unlocks the staff view, but a distinct PIN lets the owner hand out counter/kitchen access without exposing revenue data.
   - `ANTHROPIC_API_KEY` — Claude API key, for the AI insights panel on the owner dashboard (optional — the dashboard works without it, just without AI insights).

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
- Apps Script **Script Properties** (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `BUSINESS_OWNER_PHONE`) — until these are set, orders still save fine, but the owner will not receive a WhatsApp alert, and customers won't get a "your order is ready" WhatsApp message either.
- `OWNER_PIN` — until set, the owner dashboard login will always reject with "Incorrect PIN."
- `STAFF_PIN` — optional; falls back to `OWNER_PIN` if unset.
- `ANTHROPIC_API_KEY` — until set, the dashboard's AI Insights panel shows a "not configured" message instead of generated insights; numeric analytics (revenue, categories, top/bottom items) work regardless.
- **UPI ID** — set in the business's own Sheet, not here. See [google-sheet-template.md](google-sheet-template.md) → Settings tab.

## Kitchen / staff order queue

The staff view lives at the same menu URL with a query flag: `https://yoursite.com/menu/<slug>?staff=1`. Bookmark that on a kitchen tablet or counter phone. There's also a small "Staff / Kitchen Login" link on the customer landing page for ad-hoc access. Staff log in with `STAFF_PIN` (or `OWNER_PIN`) and see a live queue of active orders (polls every ~10 seconds — Apps Script has no real-time push, so this is "near-live," not instant) with buttons to advance status (Received → Preparing → Ready → Completed), cancel, and mark UPI payments as received. Marking an order "Ready" or "Cancelled" sends the customer a WhatsApp update automatically (if WhatsApp is configured).

## UPI payments (reusing your existing soundbox QR)

If a business already has a UPI soundbox (PhonePe/Paytm/BharatPe/etc.) at the counter, put that **same UPI ID** into the Settings tab of their Sheet (see [google-sheet-template.md](google-sheet-template.md)). Once set, customers get a "Pay via UPI" option at checkout that generates a payment QR/deep-link to that exact UPI ID — so paying through the app credits the same merchant account the soundbox is already watching, and it rings the same as a normal counter payment. Important limitation to set expectations with the owner on: this reuses the UPI ID directly (no payment gateway integration), so the app has **no automatic proof of payment** — staff still confirm each UPI order as "Paid" from the kitchen/staff view after seeing the soundbox ring or checking their payment app. This was a deliberate scope choice to avoid payment-gateway KYC/fees; if the business wants automatic verification down the line, that requires integrating that specific PSP's payment gateway API instead.

## After deploying

Follow [qr-setup.md](qr-setup.md) to generate and test QR codes before printing/handing them to the business owner.
