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

  const orders = readSheetAsObjects('Orders');

  return buildJsonResponse({
    success: true,
    summary: buildOrderSummary(orders),
    operations: buildOperationsSummarySafely(orders),
  });
}

function buildOperationsSummarySafely(orders) {
  try {
    return buildOperationsSummary(orders);
  } catch (error) {
    Logger.log(`Operations summary failed: ${error.message}`);
    return { hasEnoughData: false, weeksOfDataAnalyzed: 0, totalOrders: orders.length };
  }
}

function buildOrderSummary(orders) {
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
      totalAmount: Number(order['Total Amount'] || 0),
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
   OPERATIONS SUMMARY
   (business-hours analysis, break/closure/
   weekly-off recommendations, staffing guide)
======================================== */

const BUCKETS_PER_DAY = 96; // 15-minute resolution
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MIN_ORDERS_FOR_OPERATIONS = 30;
const MIN_DAYS_SPAN_FOR_OPERATIONS = 7;
const PEAK_BUFFER_BUCKETS = 4; // 1 hour on each side of a day's peak is off-limits for breaks/closure
const WEEKLY_OFF_SIGNIFICANT_SHARE_PERCENT = 15;

function buildOperationsSummary(orders) {
  const { revenueBuckets, countBuckets, earliestDate, latestDate } = parseOrderBuckets(orders);

  const totalRevenue = revenueBuckets.reduce((sum, day) => sum + day.reduce((s, v) => s + v, 0), 0);
  const totalOrders = orders.length;

  const daysSpan = earliestDate && latestDate
    ? Math.max(1, Math.round((latestDate.getTime() - earliestDate.getTime()) / (24 * 60 * 60 * 1000)))
    : 0;
  const weeksOfDataAnalyzed = Math.max(1, Math.round((daysSpan / 7) * 10) / 10);

  const hasEnoughData = totalOrders >= MIN_ORDERS_FOR_OPERATIONS && daysSpan >= MIN_DAYS_SPAN_FOR_OPERATIONS;

  if (!hasEnoughData) {
    return {
      hasEnoughData: false,
      weeksOfDataAnalyzed,
      totalOrders,
    };
  }

  const operatingRange = getOperatingRange(countBuckets);
  const dayAnalysis = buildDayAnalysis(revenueBuckets, countBuckets, operatingRange);

  const weeklyRevenue = sumAcrossDays(revenueBuckets);
  const weeklyCount = sumAcrossDays(countBuckets);
  const protectedBuckets = buildProtectedBuckets(dayAnalysis);

  return {
    hasEnoughData: true,
    weeksOfDataAnalyzed,
    totalOrders,
    dayAnalysis,
    breakRecommendation: buildBreakRecommendation(weeklyRevenue, weeklyCount, protectedBuckets, operatingRange, totalRevenue),
    closureRecommendation: buildClosureRecommendation(weeklyRevenue, protectedBuckets, operatingRange, totalRevenue, weeksOfDataAnalyzed),
    weeklyOffRecommendation: buildWeeklyOffRecommendation(dayAnalysis, totalRevenue),
    staffingGuidance: buildStaffingGuidance(countBuckets, operatingRange),
  };
}

function parseOrderBuckets(orders) {
  const revenueBuckets = [];
  const countBuckets = [];

  for (let d = 0; d < 7; d++) {
    revenueBuckets.push(new Array(BUCKETS_PER_DAY).fill(0));
    countBuckets.push(new Array(BUCKETS_PER_DAY).fill(0));
  }

  let earliestDate = null;
  let latestDate = null;

  orders.forEach((order) => {
    const createdAt = order['Created At'];
    if (!createdAt) {
      return;
    }

    const date = new Date(createdAt);
    if (isNaN(date.getTime())) {
      return;
    }

    if (!earliestDate || date < earliestDate) {
      earliestDate = date;
    }
    if (!latestDate || date > latestDate) {
      latestDate = date;
    }

    const dayOfWeek = date.getDay();
    const bucketIndex = Math.floor((date.getHours() * 60 + date.getMinutes()) / 15);
    const revenue = Number(order['Total Amount'] || 0);

    revenueBuckets[dayOfWeek][bucketIndex] += revenue;
    countBuckets[dayOfWeek][bucketIndex] += 1;
  });

  return { revenueBuckets, countBuckets, earliestDate, latestDate };
}

function getOperatingRange(countBuckets) {
  let minBucket = null;
  let maxBucket = null;

  for (let b = 0; b < BUCKETS_PER_DAY; b++) {
    const hasActivity = countBuckets.some((dayBuckets) => dayBuckets[b] > 0);
    if (hasActivity) {
      if (minBucket === null) {
        minBucket = b;
      }
      maxBucket = b;
    }
  }

  if (minBucket === null) {
    return { start: 0, end: BUCKETS_PER_DAY };
  }

  return { start: minBucket, end: maxBucket + 1 };
}

function sumAcrossDays(dayBuckets) {
  const weekly = new Array(BUCKETS_PER_DAY).fill(0);
  dayBuckets.forEach((day) => {
    day.forEach((value, b) => {
      weekly[b] += value;
    });
  });
  return weekly;
}

function sumRange(bucketArray, start, end) {
  let sum = 0;
  for (let b = start; b < end; b++) {
    sum += bucketArray[b] || 0;
  }
  return sum;
}

function formatBucketTime(bucketIndex) {
  const totalMinutes = bucketIndex * 15;
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12;
  if (hours12 === 0) {
    hours12 = 12;
  }
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

function findBestWindow(bucketValues, windowSize, rangeStart, rangeEnd, mode, excludedBuckets) {
  const withinRange = searchWindow(bucketValues, windowSize, rangeStart, rangeEnd, mode, excludedBuckets);
  if (withinRange) {
    return withinRange;
  }

  // Fallback 1: every candidate window overlapped the excluded (peak-buffer) zone.
  // Rather than return nothing, ignore the exclusion so we still give a usable answer.
  const ignoringExclusion = searchWindow(bucketValues, windowSize, rangeStart, rangeEnd, mode, null);
  if (ignoringExclusion) {
    return ignoringExclusion;
  }

  // Fallback 2: the operating range itself is narrower than the window (e.g. all historical
  // orders cluster within a very short span of the day). Search the full day so callers always
  // get a real window instead of null and crashing downstream.
  const fullDay = searchWindow(bucketValues, windowSize, 0, BUCKETS_PER_DAY, mode, null);
  if (fullDay) {
    return fullDay;
  }

  // Fallback 3: should be unreachable (windowSize always <= BUCKETS_PER_DAY), but never return
  // null from this function — a degenerate zero-length window is safer than a crash.
  const safeStart = Math.max(0, Math.min(rangeStart, BUCKETS_PER_DAY - windowSize));
  return { startBucket: safeStart, endBucket: safeStart + windowSize, value: 0 };
}

function searchWindow(bucketValues, windowSize, rangeStart, rangeEnd, mode, excludedBuckets) {
  let bestStart = null;
  let bestValue = mode === 'max' ? -Infinity : Infinity;

  for (let start = rangeStart; start <= rangeEnd - windowSize; start++) {
    if (excludedBuckets) {
      let overlapsExcluded = false;
      for (let b = start; b < start + windowSize; b++) {
        if (excludedBuckets.has(b)) {
          overlapsExcluded = true;
          break;
        }
      }
      if (overlapsExcluded) {
        continue;
      }
    }

    const sum = sumRange(bucketValues, start, start + windowSize);

    if ((mode === 'max' && sum > bestValue) || (mode === 'min' && sum < bestValue)) {
      bestValue = sum;
      bestStart = start;
    }
  }

  if (bestStart === null) {
    return null;
  }

  return { startBucket: bestStart, endBucket: bestStart + windowSize, value: bestValue };
}

function formatWindow(window) {
  if (!window) {
    return { startBucket: 0, endBucket: 0, startLabel: 'N/A', endLabel: 'N/A', value: 0 };
  }

  return {
    startBucket: window.startBucket,
    endBucket: window.endBucket,
    startLabel: formatBucketTime(window.startBucket),
    endLabel: formatBucketTime(window.endBucket),
    value: Math.round(window.value * 100) / 100,
  };
}

function buildDayAnalysis(revenueBuckets, countBuckets, operatingRange) {
  const windowSize = 8; // 2-hour block, matches the "7 PM to 10 PM" style of range in the spec

  return DAY_NAMES.map((dayName, dayIndex) => {
    const dayRevenue = revenueBuckets[dayIndex];
    const dayCount = countBuckets[dayIndex];

    const peakRevenueWindow = findBestWindow(dayRevenue, windowSize, operatingRange.start, operatingRange.end, 'max');
    const peakVolumeWindow = findBestWindow(dayCount, windowSize, operatingRange.start, operatingRange.end, 'max');
    const lowDemandWindow = findBestWindow(dayCount, windowSize, operatingRange.start, operatingRange.end, 'min');

    const dayTotalOrders = sumRange(dayCount, operatingRange.start, operatingRange.end);
    const dayTotalRevenue = sumRange(dayRevenue, operatingRange.start, operatingRange.end);
    const operatingHours = Math.max((operatingRange.end - operatingRange.start) / 4, 1);
    const avgOrdersPerHour = dayTotalOrders / operatingHours;

    const nearZeroHours = [];
    for (let b = operatingRange.start; b < operatingRange.end; b += 4) {
      const hourCount = sumRange(dayCount, b, b + 4);
      if (hourCount <= 1 || hourCount < avgOrdersPerHour * 0.15) {
        nearZeroHours.push({
          startLabel: formatBucketTime(b),
          endLabel: formatBucketTime(b + 4),
        });
      }
    }

    return {
      dayName,
      totalOrders: dayTotalOrders,
      totalRevenue: dayTotalRevenue,
      peakRevenueWindow: formatWindow(peakRevenueWindow),
      peakVolumeWindow: formatWindow(peakVolumeWindow),
      lowDemandWindow: formatWindow(lowDemandWindow),
      nearZeroHours,
    };
  });
}

function buildProtectedBuckets(dayAnalysis) {
  const protectedSet = new Set();

  dayAnalysis.forEach((day) => {
    const start = Math.max(0, day.peakRevenueWindow.startBucket - PEAK_BUFFER_BUCKETS);
    const end = Math.min(BUCKETS_PER_DAY, day.peakRevenueWindow.endBucket + PEAK_BUFFER_BUCKETS);
    for (let b = start; b < end; b++) {
      protectedSet.add(b);
    }
  });

  return protectedSet;
}

function buildBreakRecommendation(weeklyRevenue, weeklyCount, protectedBuckets, operatingRange, totalRevenue) {
  const ownerWindowSize = 2; // 30 minutes
  const kitchenWindowSize = 3; // 45 minutes

  const ownerWindow = findBestWindow(weeklyCount, ownerWindowSize, operatingRange.start, operatingRange.end, 'min', protectedBuckets);
  const kitchenWindow = findBestWindow(weeklyCount, kitchenWindowSize, operatingRange.start, operatingRange.end, 'min', protectedBuckets);

  const ownerRevenueInWindow = sumRange(weeklyRevenue, ownerWindow.startBucket, ownerWindow.endBucket);
  const impactPercent = totalRevenue > 0 ? Math.round((ownerRevenueInWindow / totalRevenue) * 1000) / 10 : 0;

  const staggerSplit = kitchenWindow.startBucket + 2;

  return {
    ownerWindow: { startLabel: formatBucketTime(ownerWindow.startBucket), endLabel: formatBucketTime(ownerWindow.endBucket) },
    kitchenWindow: { startLabel: formatBucketTime(kitchenWindow.startBucket), endLabel: formatBucketTime(kitchenWindow.endBucket) },
    staggeredSchedule: [
      { group: 'Group A', startLabel: formatBucketTime(kitchenWindow.startBucket), endLabel: formatBucketTime(staggerSplit) },
      { group: 'Group B', startLabel: formatBucketTime(staggerSplit), endLabel: formatBucketTime(kitchenWindow.endBucket) },
    ],
    impactPercent,
  };
}

function buildClosureRecommendation(weeklyRevenue, protectedBuckets, operatingRange, totalRevenue, weeksOfDataAnalyzed) {
  const windowSize = 4; // 1 hour
  const window = findBestWindow(weeklyRevenue, windowSize, operatingRange.start, operatingRange.end, 'min', protectedBuckets);

  const windowRevenueTotal = sumRange(weeklyRevenue, window.startBucket, window.endBucket);
  const estimatedWeeklyLoss = Math.round(windowRevenueTotal / Math.max(weeksOfDataAnalyzed, 1));
  const estimatedMonthlyLoss = Math.round(estimatedWeeklyLoss * 4.33);
  const impactPercent = totalRevenue > 0 ? Math.round((windowRevenueTotal / totalRevenue) * 1000) / 10 : 0;

  return {
    window: { startLabel: formatBucketTime(window.startBucket), endLabel: formatBucketTime(window.endBucket) },
    estimatedWeeklyLoss,
    estimatedMonthlyLoss,
    impactPercent,
  };
}

function buildWeeklyOffRecommendation(dayAnalysis, totalRevenue) {
  const withShare = dayAnalysis.map((day) => ({
    dayName: day.dayName,
    revenue: day.totalRevenue,
    sharePercent: totalRevenue > 0 ? Math.round((day.totalRevenue / totalRevenue) * 1000) / 10 : 0,
  }));

  const sortedAsc = [...withShare].sort((a, b) => a.revenue - b.revenue);
  const sortedDesc = [...withShare].sort((a, b) => b.revenue - a.revenue);

  return {
    bestDay: sortedAsc[0].dayName,
    bestDayImpactPercent: sortedAsc[0].sharePercent,
    secondBestDay: sortedAsc[1].dayName,
    secondBestImpactPercent: sortedAsc[1].sharePercent,
    worstDaysToAvoid: sortedDesc
      .filter((day) => day.sharePercent >= WEEKLY_OFF_SIGNIFICANT_SHARE_PERCENT)
      .slice(0, 3)
      .map((day) => ({ dayName: day.dayName, sharePercent: day.sharePercent })),
  };
}

function buildStaffingGuidance(countBuckets, operatingRange) {
  const heatmap = [];
  let maxHourCount = 0;

  for (let day = 0; day < 7; day++) {
    for (let b = operatingRange.start; b < operatingRange.end; b += 4) {
      const hourCount = sumRange(countBuckets[day], b, b + 4);
      if (hourCount > maxHourCount) {
        maxHourCount = hourCount;
      }
      heatmap.push({
        dayName: DAY_NAMES[day],
        hourLabel: formatBucketTime(b),
        count: hourCount,
      });
    }
  }

  heatmap.forEach((entry) => {
    entry.intensity = maxHourCount > 0 ? Math.round((entry.count / maxHourCount) * 100) / 100 : 0;
  });

  const sortedByCount = [...heatmap].sort((a, b) => b.count - a.count);
  const understaffedPeriods = sortedByCount
    .slice(0, 3)
    .map((entry) => ({ dayName: entry.dayName, hourLabel: entry.hourLabel }));

  const nonZero = sortedByCount.filter((entry) => entry.count > 0);
  const overstaffedPeriods = nonZero
    .slice(-3)
    .reverse()
    .map((entry) => ({ dayName: entry.dayName, hourLabel: entry.hourLabel }));

  return { heatmap, understaffedPeriods, overstaffedPeriods };
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

  const orders = readSheetAsObjects('Orders');
  const summary = buildOrderSummary(orders);
  const operations = buildOperationsSummarySafely(orders);
  const insights = generateAiInsights(summary, operations);

  cache.put(cacheKey, insights, AI_INSIGHTS_CACHE_TTL_SECONDS);

  return buildJsonResponse({ success: true, insights, cached: false });
}

function generateAiInsights(summary, operations) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('ANTHROPIC_API_KEY');

  if (!apiKey) {
    return 'AI insights are not configured yet. Add an ANTHROPIC_API_KEY script property to enable this.';
  }

  const prompt = buildInsightsPrompt(summary, operations);

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

function buildInsightsPrompt(summary, operations) {
  const lines = [
    'You are a friendly business consultant helping a small Indian restaurant/cafe owner understand their sales and operations data.',
    'The owner is not technical. Give 3 to 5 concrete, actionable recommendations they could act on this week, in plain simple language.',
    'Reference specific numbers from the data below where useful. Keep it concise. Suggest WhatsApp-based marketing ideas where relevant, since that is their main customer channel.',
    '',
    'Sales data (JSON):',
    JSON.stringify(summary),
  ];

  if (operations && operations.hasEnoughData) {
    lines.push(
      '',
      'Operations data (JSON): this already contains the exact recommended lunch break window, closure window, weekly-off day, and staffing guidance, computed from real order timestamps.',
      'Do not invent different numbers, times, or days than what is given here. Only explain the numbers below in plain language, in a style like these examples:',
      '"Owner lunch break is recommended between 3:15 PM and 3:45 PM."',
      '"Tuesday is the optimal weekly off day with an estimated revenue impact of only 5.8%."',
      '"Avoid taking weekly off on Friday, Saturday, or Sunday as these contribute a large share of weekly revenue."',
      '"Consider reducing staffing during the identified low-demand hours and increasing it during peak hours."',
      'Include at least one lunch break recommendation, one weekly-off recommendation, and one staffing recommendation in your answer.',
      JSON.stringify(operations)
    );
  }

  return lines.join('\n');
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
