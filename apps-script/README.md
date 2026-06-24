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

## How it works
- Accepts order POST requests from the frontend.
- Saves orders to a `Orders` sheet in the bound spreadsheet.
- Sends a WhatsApp message to the business owner using the WhatsApp Cloud API.

## Notes
- Update `src/config/businesses.js` with the deployed web app URL.
- The frontend should never include API keys or WhatsApp tokens.
