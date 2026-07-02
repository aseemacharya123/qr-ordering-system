# QR + WhatsApp Ordering

This project is a mobile-first QR menu and WhatsApp ordering web app for Indian small businesses.

## Features
- React + Vite frontend
- Business slug routing: `/menu/cafe-99?table=5`
- Menu search, category tabs, cart, checkout, and order confirmation
- Google Apps Script backend for order capture and WhatsApp notification
- Secrets kept out of frontend

## Run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open a menu URL like:
   ```
   http://localhost:5173/menu/cafe-99?table=5
   ```

## Backend setup
1. Deploy `apps-script/Code.js` as a Google Apps Script web app.
2. Set script properties for WhatsApp Cloud API integration:
   - `WHATSAPP_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `BUSINESS_OWNER_PHONE`
3. Update `src/config/businesses.js` with the deployed web app URL for `apiUrl`.

Full step-by-step deployment instructions (Vercel, Firebase Hosting, Apps Script) are in [docs/deployment.md](docs/deployment.md).

## Adding a new business (client)

1. Copy an existing Google Sheet (e.g. Cafe 99's) and fill in the new business's categories and menu items — see [docs/google-sheet-template.md](docs/google-sheet-template.md) for the required tabs/columns.
2. Deploy a new Apps Script web app bound to that sheet — see [docs/deployment.md](docs/deployment.md).
3. Add an entry to `src/config/businesses.js` with the new `businessId`, name, logo, theme color, and the Apps Script `apiUrl`.
4. Generate and test the QR code(s) for the business — see [docs/qr-setup.md](docs/qr-setup.md).
5. Place a real test order and confirm it appears in the new sheet's `Orders` tab before handing off to the client.

No component code needs to change to onboard a new business — only the Sheet, the Apps Script deployment, and the config entry.

## Notes
- Sample menu data lives in `src/config/sampleMenuData.js` and is used only as a local-dev fallback; live menus load from each business's Google Sheet via `?action=menu`.
- Checkout submission calls `src/services/orderService.js`.
- Backend saves orders and customer records to Google Sheets and sends a WhatsApp notification to the business owner (order is always saved even if the WhatsApp send fails).
