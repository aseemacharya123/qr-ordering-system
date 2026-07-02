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

## Orders (auto-created by the backend)

You don't need to create this tab — the Apps Script backend creates it automatically on the first order. Listed here for reference.

| Order ID | Created At | Business ID | Business Name | Table No | Customer Name | Customer Phone | Total Amount | Items | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ORD-20260702-143000 | 2026-07-02T14:30:00.000Z | cafe-99 | Cafe 99 | 5 | Ramesh | 9876543210 | 320 | [{"itemId":"item_001",...}] | web |

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
