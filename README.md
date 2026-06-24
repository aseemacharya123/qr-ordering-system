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

## Notes
- Sample menu data lives in `src/config/sampleMenuData.js`.
- Checkout submission calls `src/services/orderService.js`.
- Backend saves orders to a Google Sheet and sends a WhatsApp notification to the business owner.
