# QR Code Setup

## URL pattern

Every business gets a menu URL built from its `businessId` (the slug used as the key in `src/config/businesses.js`):

```
https://<your-domain>/menu/<businessId>
```

Add `?table=<number>` for dine-in table ordering. The table number is read automatically from the URL and shown in the header and included with the order.

## Shop-level QR (no table)

For a kirana store, sweet shop, or takeaway counter with no per-table ordering, print one QR pointing at the plain menu URL:

```
https://yourapp.com/menu/sharma-sweets
```

## Table-level QR (dine-in)

For a restaurant or cafe, print one QR per table, each with a different `table` value:

```
https://yourapp.com/menu/cafe-99?table=1
https://yourapp.com/menu/cafe-99?table=2
https://yourapp.com/menu/cafe-99?table=3
```

## Generating the QR image

The app does not generate QR images itself — generate a static QR code image from the URL using any free QR generator (e.g. `https://www.qr-code-generator.com`, or a bulk tool if printing many tables at once), then print and place it on the table or at the counter.

Recommendation: use a QR generator that supports **dynamic QR codes** (where the QR image stays the same but the destination URL can be edited later). That way, if you ever need to change domains or fix a typo in the businessId, you don't need to reprint every table's QR code.

## Testing before printing

1. Scan the QR with a phone (or paste the URL directly in a mobile browser).
2. Confirm the correct business name/logo appears.
3. Confirm the table number shows in the header (for table QRs).
4. Place one test order end-to-end and confirm it appears in the `Orders` sheet.

Only print and hand out QR codes after this test passes — see [deployment.md](deployment.md) for how to get the app live first.
