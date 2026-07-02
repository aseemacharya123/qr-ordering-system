const WHATSAPP_API_VERSION = 'v17.0';
const CLAUDE_MODEL = 'claude-opus-4-8';
const OWNER_SESSION_TTL_SECONDS = 6 * 60 * 60;
const AI_INSIGHTS_CACHE_TTL_SECONDS = 60 * 60;

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

/* ========================================
   REQUEST ROUTING
======================================== */

function doPost(e) {
  try {
    const rawBody = e.postData && e.postData.contents;
    if (!rawBody) {
      return buildJsonResponse({ success: false, error: 'Missing request body.' });
    }

    const payload = JSON.parse(rawBody);

    switch (payload.action) {
      case 'verifyOwnerPin':
        return handleVerifyOwnerPin(payload);
      case 'dashboard':
        return handleDashboardRequest(payload);
      case 'aiInsights':
        return handleAiInsightsRequest(payload);
      default:
        return handleOrderSubmission(payload);
    }
  } catch (error) {
    return buildJsonResponse({ success: false, error: error.message || 'Request processing failed.' });
  }
}

/* ========================================
   ORDER SUBMISSION
======================================== */

function handleOrderSubmission(payload) {
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
    age: payload.age || '',
    gender: payload.gender || '',
    society: payload.society || '',
  };

  saveOrderToSheet(orderRecord);
  saveOrUpdateCustomer(orderRecord);

  const notificationStatus = sendWhatsAppNotificationSafely(orderRecord, payload);

  return buildJsonResponse({ success: true, orderId, notificationStatus });
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

      if (orderRecord.age) {
        sheet.getRange(rowIndex, 9).setValue(orderRecord.age);
      }
      if (orderRecord.gender) {
        sheet.getRange(rowIndex, 10).setValue(orderRecord.gender);
      }
      if (orderRecord.society) {
        sheet.getRange(rowIndex, 11).setValue(orderRecord.society);
      }

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
    orderRecord.age || '',
    orderRecord.gender || '',
    orderRecord.society || '',
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
      'Age',
      'Gender',
      'Society',
    ]);
  }

  return sheet;
}

/* ========================================
   OWNER AUTH
======================================== */

function handleVerifyOwnerPin(payload) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const ownerPin = scriptProperties.getProperty('OWNER_PIN');

  if (!ownerPin || !payload.pin || String(payload.pin) !== String(ownerPin)) {
    return buildJsonResponse({ success: false, error: 'Incorrect PIN.' });
  }

  const token = Utilities.getUuid();
  CacheService.getScriptCache().put(`owner_session_${token}`, 'valid', OWNER_SESSION_TTL_SECONDS);

  return buildJsonResponse({ success: true, token });
}

function isValidOwnerToken(token) {
  if (!token) {
    return false;
  }

  return CacheService.getScriptCache().get(`owner_session_${token}`) === 'valid';
}

/* ========================================
   OWNER DASHBOARD
======================================== */

function handleDashboardRequest(payload) {
  if (!isValidOwnerToken(payload.token)) {
    return buildJsonResponse({ success: false, error: 'Unauthorized' });
  }

  return buildJsonResponse({
    success: true,
    summary: buildOrderSummary(),
  });
}

function buildOrderSummary() {
  const orders = readSheetAsObjects('Orders');
  const menuItems = readSheetAsObjects('MenuItems');
  const categories = readSheetAsObjects('Categories');
  const customers = readSheetAsObjects('Customers');

  const menuItemsById = {};
  menuItems.forEach((item) => {
    menuItemsById[String(item.itemId)] = item;
  });

  const categoryNameById = {};
  categories.forEach((category) => {
    categoryNameById[String(category.categoryId)] = category.categoryName;
  });

  const monthlyRevenue = {};
  const categoryRevenue = {};
  const itemStats = {};

  orders.forEach((order) => {
    const totalAmount = Number(order['Total Amount'] || 0);
    const monthKey = getMonthKey(order['Created At']);

    if (monthKey) {
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + totalAmount;
    }

    let items = [];
    try {
      items = JSON.parse(order['Items'] || '[]');
    } catch (error) {
      items = [];
    }

    items.forEach((lineItem) => {
      const itemId = String(lineItem.itemId);
      const menuItem = menuItemsById[itemId];
      const categoryId = menuItem ? String(menuItem.categoryId) : '';
      const categoryName = categoryNameById[categoryId] || 'Uncategorized';
      const subtotal = Number(lineItem.subtotal || 0);

      categoryRevenue[categoryName] = (categoryRevenue[categoryName] || 0) + subtotal;

      if (!itemStats[itemId]) {
        itemStats[itemId] = {
          itemId,
          itemName: lineItem.name || (menuItem && menuItem.itemName) || itemId,
          quantity: 0,
          revenue: 0,
        };
      }

      itemStats[itemId].quantity += Number(lineItem.quantity || 0);
      itemStats[itemId].revenue += subtotal;
    });
  });

  menuItems.forEach((menuItem) => {
    const itemId = String(menuItem.itemId);
    if (!itemStats[itemId]) {
      itemStats[itemId] = {
        itemId,
        itemName: menuItem.itemName,
        quantity: 0,
        revenue: 0,
      };
    }
  });

  const itemPerformance = Object.values(itemStats);
  const topItems = [...itemPerformance].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const bottomItems = [...itemPerformance].sort((a, b) => a.revenue - b.revenue).slice(0, 5);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order['Total Amount'] || 0), 0);
  const repeatCustomers = customers.filter((customer) => Number(customer['Total Orders'] || 0) > 1).length;

  return {
    monthlyRevenue: Object.keys(monthlyRevenue).sort().map((month) => ({
      month,
      revenue: monthlyRevenue[month],
    })),
    categoryRevenue: Object.keys(categoryRevenue).map((name) => ({
      category: name,
      revenue: categoryRevenue[name],
    })),
    topItems,
    bottomItems,
    totalOrders: orders.length,
    totalRevenue,
    totalCustomers: customers.length,
    repeatCustomers,
    recentOrders: orders.slice(-50).reverse().map((order) => ({
      orderId: order['Order ID'],
      createdAt: order['Created At'],
      customerName: order['Customer Name'],
      tableNo: order['Table No'],
      totalAmount: order['Total Amount'],
    })),
  };
}

function getMonthKey(isoDateString) {
  if (!isoDateString) {
    return '';
  }

  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) {
    return '';
  }

  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/* ========================================
   AI INSIGHTS
======================================== */

function handleAiInsightsRequest(payload) {
  if (!isValidOwnerToken(payload.token)) {
    return buildJsonResponse({ success: false, error: 'Unauthorized' });
  }

  const cache = CacheService.getScriptCache();
  const cacheKey = 'ai_insights_cache';

  if (!payload.forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached) {
      return buildJsonResponse({ success: true, insights: cached, cached: true });
    }
  }

  const summary = buildOrderSummary();
  const insights = generateAiInsights(summary);

  cache.put(cacheKey, insights, AI_INSIGHTS_CACHE_TTL_SECONDS);

  return buildJsonResponse({ success: true, insights, cached: false });
}

function generateAiInsights(summary) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('ANTHROPIC_API_KEY');

  if (!apiKey) {
    return 'AI insights are not configured yet. Add an ANTHROPIC_API_KEY script property to enable this.';
  }

  const prompt = buildInsightsPrompt(summary);

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    payload: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      output_config: { effort: 'medium' },
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', options);
    const responseCode = response.getResponseCode();

    if (responseCode < 200 || responseCode >= 300) {
      Logger.log(`Claude API error: ${responseCode} ${response.getContentText()}`);
      return 'Could not generate insights right now. Please try again later.';
    }

    const responseBody = JSON.parse(response.getContentText());

    if (responseBody.stop_reason === 'refusal') {
      return 'The AI declined to generate insights for this data. Please try again later.';
    }

    const textBlock = (responseBody.content || []).find((block) => block.type === 'text');
    return textBlock ? textBlock.text : 'No insights were generated.';
  } catch (error) {
    Logger.log(`Claude API request failed: ${error.message}`);
    return 'Could not generate insights right now. Please try again later.';
  }
}

function buildInsightsPrompt(summary) {
  return [
    'You are a friendly business consultant helping a small Indian restaurant/cafe owner understand their sales data.',
    'The owner is not technical. Give 3 to 5 concrete, actionable recommendations they could act on this week, in plain simple language.',
    'Reference specific numbers from the data below where useful. Keep it concise. Suggest WhatsApp-based marketing ideas where relevant, since that is their main customer channel.',
    '',
    'Sales data (JSON):',
    JSON.stringify(summary),
  ].join('\n');
}

/* ========================================
   WHATSAPP NOTIFICATION
======================================== */

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
