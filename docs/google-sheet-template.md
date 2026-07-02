# Google Sheet Template

Each business gets its own Google Sheet, bound to its own Apps Script deployment. Copy this structure for every new client.

## Categories

Menu categories shown as tabs on the menu page.

| categoryId | categoryName | displayOrder | isActive |
| --- | --- | --- | --- |
| starters | Starters | 1 | TRUE |
| main-course | Main Course | 2 | TRUE |
| drinks | Drinks | 3 | TRUE |

- `categoryId` — lowercase, no spaces, used to link items to a category.
- `displayOrder` — number controlling left-to-right tab order.
- `isActive` — set `FALSE` to hide a category without deleting it.

## MenuItems

| itemId | categoryId | itemName | description | price | imageUrl | vegType | isAvailable | displayOrder |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| item_001 | starters | Paneer Tikka | Spicy grilled paneer cubes | 180 | https://... | Veg | TRUE | 1 |
| item_002 | starters | Veg Spring Roll | Crispy vegetable rolls | 140 | https://... | Veg | TRUE | 2 |

- `categoryId` must match a row in the Categories tab.
- `imageUrl` — a public image link (e.g. hosted on Google Drive with public sharing, Imgur, or your own hosting). Leave blank to show "No Image".
- `isAvailable` — set `FALSE` to grey out an item (e.g. sold out) without deleting it.
- Owners can edit prices, descriptions, and availability directly in this tab — no code changes needed. Changes appear next time a customer loads the menu.

## Settings (auto-created by the backend)

Key/value pairs for business info the owner might want to change themselves, without a code change. Auto-created with blank values on first use — the owner (or you, during setup) fills them in directly in the Sheet.

| Key | Value |
| --- | --- |
| upiId | ownername@okhdfcbank |
| upiPayeeName | Cafe 99 |

- `upiId` — the business's UPI ID (VPA). **Use the same UPI ID that's linked to their physical counter/soundbox QR** so that payments made through the app land in the same account and the soundbox still rings. Leave blank to hide the "Pay via UPI" option at checkout entirely (customers only see "Pay at Counter").
- `upiPayeeName` — the name shown to the customer during UPI payment. Falls back to the business name if left blank.
- This tab is intentionally public/non-secret (read via a no-login API action) — it's the same information already printed on the business's physical UPI QR code at the counter. Never put WhatsApp tokens, API keys, or PINs here; those stay in Apps Script **Script Properties** (see [deployment.md](deployment.md)).

## Orders (auto-created by the backend)

You don't need to create this tab — the Apps Script backend creates it automatically on the first order, and automatically adds the newer columns below to any older sheet the next time it runs. Listed here for reference.

| Order ID | Created At | Business ID | Business Name | Table No | Customer Name | Customer Phone | Total Amount | Items | Source | Status | Payment Method | Payment Status | UPI Ref | Updated At |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ORD-20260702-143000 | 2026-07-02T14:30:00.000Z | cafe-99 | Cafe 99 | 5 | Ramesh | 9876543210 | 320 | [{"itemId":"item_001",...}] | web | Preparing | UPI | Paid | | 2026-07-02T14:32:10.000Z |

- `Status` — `Received` → `Preparing` → `Ready` → `Completed`, or `Cancelled`. Updated from the kitchen/staff view.
- `Payment Method` — `Cash` or `UPI`, chosen by the customer at checkout.
- `Payment Status` — `Pay at counter` (cash orders), `Awaiting confirmation` → `Customer confirmed - awaiting staff` → `Paid` (UPI orders, the last step set by staff).
- `UPI Ref` — optional reference/UTR number the customer can attach when confirming a UPI payment.
- You can freely edit these columns by hand for historical orders (e.g. fixing a mistaken status) — the backend always looks columns up by header name, not position.

## Customers (auto-created by the backend)

Also auto-created on the first order.

| Customer Phone | Customer Name | First Order Date | Last Order Date | Total Orders | Total Spend | Opt-In WhatsApp | Last Message Sent |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 9876543210 | Ramesh | 2026-07-02T14:30:00.000Z | 2026-07-02T14:30:00.000Z | 1 | 320 | FALSE | |

Used later for repeat-customer or inactive-customer WhatsApp campaigns.

## Setting up a new client's sheet

1. Make a copy of an existing working sheet (e.g. Cafe 99's) in Google Drive: **File → Make a copy**.
2. Clear the `Categories` and `MenuItems` tabs and fill them with the new business's real menu.
3. Delete any rows in `Orders`/`Customers` left over from testing.
4. Open **Extensions → Apps Script**, and follow [deployment.md](deployment.md) to deploy a fresh backend bound to this new sheet.
5. Add the new business to `src/config/businesses.js` with its own `businessId`, name, and the new Apps Script web app URL.
