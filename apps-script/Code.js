const WHATSAPP_API_VERSION = 'v17.0';

function doGet(e) {
  const action = e && e.parameter && e.parameter.action;

  if (action === 'menu') {
    return buildJsonResponse({
      success: true,
      categories: readSheetAsObjects('Categories'),
      items: readSheetAsObjects('MenuItems'),
    });
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'QR WhatsApp ordering backend is running.',
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function readSheetAsObjects(sheetName) {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadSheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log(`${sheetName} sheet not found.`);
    return [];
  }

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0];

  return values.slice(1)
    .filter((row) => row.some((cell) => cell !== '' && cell !== null))
    .map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });
      return record;
    });
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
    saveOrUpdateCustomer(orderRecord);

    const notificationStatus = sendWhatsAppNotificationSafely(orderRecord, payload);

    return buildJsonResponse({ success: true, orderId, notificationStatus });
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
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `ORD-${datePart}-${timePart}`;
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

function saveOrUpdateCustomer(orderRecord) {
  const sheet = getCustomersSheet();
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(orderRecord.customerPhone)) {
      const rowIndex = i + 1;
      const totalOrders = Number(values[i][4] || 0) + 1;
      const totalSpend = Number(values[i][5] || 0) + Number(orderRecord.totalAmount);

      sheet.getRange(rowIndex, 2).setValue(orderRecord.customerName);
      sheet.getRange(rowIndex, 4).setValue(orderRecord.createdAt);
      sheet.getRange(rowIndex, 5).setValue(totalOrders);
      sheet.getRange(rowIndex, 6).setValue(totalSpend);
      return;
    }
  }

  sheet.appendRow([
    orderRecord.customerPhone,
    orderRecord.customerName,
    orderRecord.createdAt,
    orderRecord.createdAt,
    1,
    orderRecord.totalAmount,
    false,
    '',
  ]);
}

function getCustomersSheet() {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadSheet.getSheetByName('Customers');

  if (!sheet) {
    sheet = spreadSheet.insertSheet('Customers');
    sheet.appendRow([
      'Customer Phone',
      'Customer Name',
      'First Order Date',
      'Last Order Date',
      'Total Orders',
      'Total Spend',
      'Opt-In WhatsApp',
      'Last Message Sent',
    ]);
  }

  return sheet;
}

function sendWhatsAppNotificationSafely(orderRecord, payload) {
  try {
    return sendWhatsAppNotification(orderRecord, payload);
  } catch (error) {
    Logger.log(`WhatsApp notification failed: ${error.message}`);
    return 'failed';
  }
}

function sendWhatsAppNotification(orderRecord, payload) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const token = scriptProperties.getProperty('WHATSAPP_TOKEN');
  const phoneNumberId = scriptProperties.getProperty('WHATSAPP_PHONE_NUMBER_ID');
  const ownerPhone = scriptProperties.getProperty('BUSINESS_OWNER_PHONE');

  if (!token || !phoneNumberId || !ownerPhone) {
    Logger.log('WhatsApp notification skipped: missing script properties.');
    return 'skipped';
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
  const responseCode = response.getResponseCode();
  Logger.log(`WhatsApp API response: ${responseCode} ${response.getContentText()}`);

  return responseCode >= 200 && responseCode < 300 ? 'sent' : 'failed';
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
