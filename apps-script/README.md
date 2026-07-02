# Google Apps Script Backend

This folder contains the backend script for order processing and WhatsApp notification.

## Deploy
1. Open the Apps Script editor.
2. Create a new project and paste the contents of `Code.js`.
3. Add `appsscript.json` or verify the project settings are correct.
4. Deploy as a web app with:
   - Execute as: Me
   - Who has access: Anyone

## Required script properties
Set the following properties in `Project Settings > Script Properties`:
- `WHATSAPP_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `BUSINESS_OWNER_PHONE`
- `OWNER_PIN` — the PIN the business owner enters to open their dashboard (e.g. `54321` for local testing). **Set a unique PIN per business** — do not reuse the same PIN across clients, since anyone who guesses it can see that business's revenue data.
- `ANTHROPIC_API_KEY` — Claude API key, used server-side only to generate the AI business insights on the owner dashboard. If unset, the dashboard still works but shows a friendly "not configured" message instead of AI insights.

## How it works
- Accepts order POST requests from the frontend and saves them to an `Orders` sheet, updates the `Customers` sheet, and sends a WhatsApp message to the owner.
- Accepts `GET ?action=menu` to serve live menu data from the `Categories`/`MenuItems` sheets.
- Accepts `POST` requests with `action: "verifyOwnerPin"`, `"dashboard"`, or `"aiInsights"` for the owner-only analytics dashboard. PIN verification issues a short-lived session token (6 hours, via `CacheService`) that the frontend must send with dashboard/insights requests — the PIN itself is never sent again after login.

## Notes
- Update `src/config/businesses.js` with the deployed web app URL.
- The frontend should never include API keys or WhatsApp tokens.
