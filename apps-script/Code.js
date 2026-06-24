const WHATSAPP_API_VERSION = 'v17.0';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'QR WhatsApp ordering backend is running.',
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const rawBody = e.postData && e.postData.contents;
    if (!rawBody) {
      return buildJsonResponse({ success: false, error: 'Missing request body.' });
    }

    const payload = JSON.parse(rawBody);
    const validation = validateOrderPayload(payload);

    if (!validation.isValid) {
      return buildJsonResponse({ success: false, error: validation.error });
    }

    const orderId = generateOrderId();
    const orderRecord = {
      orderId,
      createdAt: new Date().toISOString(),
      businessId: payload.businessId,
      businessName: payload.businessName,
      tableNo: payload.tableNo || '',
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      totalAmount: payload.totalAmount,
      items: JSON.stringify(payload.items),
      source: payload.source || 'web',
    };

    saveOrderToSheet(orderRecord);
    sendWhatsAppNotification(orderRecord, payload);

    return buildJsonResponse({ success: true, orderId });
  } catch (error) {
    return buildJsonResponse({ success: false, error: error.message || 'Order processing failed.' });
  }
}

function validateOrderPayload(payload) {
  if (!payload) {
    return { isValid: false, error: 'Payload is required.' };
  }

  if (!payload.businessId || !payload.businessName) {
    return { isValid: false, error: 'Business information is missing.' };
  }

  if (!payload.customerName || !payload.customerPhone) {
    return { isValid: false, error: 'Customer name and phone are required.' };
  }

  if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    return { isValid: false, error: 'Cart must contain at least one item.' };
  }

  return { isValid: true };
}

function generateOrderId() {
  const timestamp = new Date().getTime();
  return `ORDER-${timestamp}`;
}

function saveOrderToSheet(orderRecord) {
  const sheet = getOrdersSheet();
  sheet.appendRow([
    orderRecord.orderId,
    orderRecord.createdAt,
    orderRecord.businessId,
    orderRecord.businessName,
    orderRecord.tableNo,
    orderRecord.customerName,
    orderRecord.customerPhone,
    orderRecord.totalAmount,
    orderRecord.items,
    orderRecord.source,
  ]);
}

function getOrdersSheet() {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadSheet.getSheetByName('Orders');

  if (!sheet) {
    sheet = spreadSheet.insertSheet('Orders');
    sheet.appendRow([
      'Order ID',
      'Created At',
      'Business ID',
      'Business Name',
      'Table No',
      'Customer Name',
      'Customer Phone',
      'Total Amount',
      'Items',
      'Source',
    ]);
  }

  return sheet;
}

function sendWhatsAppNotification(orderRecord, payload) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const token = scriptProperties.getProperty('WHATSAPP_TOKEN');
  const phoneNumberId = scriptProperties.getProperty('WHATSAPP_PHONE_NUMBER_ID');
  const ownerPhone = scriptProperties.getProperty('BUSINESS_OWNER_PHONE');

  if (!token || !phoneNumberId || !ownerPhone) {
    Logger.log('WhatsApp notification skipped: missing script properties.');
    return;
  }

  const messageBody = buildWhatsAppMessage(orderRecord, payload);

  const apiUrl = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: JSON.stringify({
      messaging_product: 'whatsapp',
      to: ownerPhone,
      type: 'text',
      text: {
        body: messageBody,
      },
    }),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(apiUrl, options);
  Logger.log(`WhatsApp API response: ${response.getResponseCode()} ${response.getContentText()}`);
}

function buildWhatsAppMessage(orderRecord, payload) {
  const header = `New order received for ${orderRecord.businessName}`;
  const tableLabel = orderRecord.tableNo ? `Table: ${orderRecord.tableNo}` : 'No table specified';
  const customer = `Customer: ${orderRecord.customerName} (${orderRecord.customerPhone})`;
  const itemsText = payload.items
    .map((item) => `* ${item.name} x${item.quantity} = ₹${item.subtotal}`)
    .join('\n');

  return `${header}\n${tableLabel}\n${customer}\n\nItems:\n${itemsText}\n\nTotal: ₹${orderRecord.totalAmount}`;
}

function buildJsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
