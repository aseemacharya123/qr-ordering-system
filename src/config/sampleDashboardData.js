export const sampleDashboardSummary = {
  monthlyRevenue: [
    { month: '2026-02', revenue: 18400 },
    { month: '2026-03', revenue: 21200 },
    { month: '2026-04', revenue: 19800 },
    { month: '2026-05', revenue: 24600 },
    { month: '2026-06', revenue: 27300 },
    { month: '2026-07', revenue: 9100 },
  ],
  categoryRevenue: [
    { category: 'Starters', revenue: 22400 },
    { category: 'Main Course', revenue: 38600 },
    { category: 'Drinks', revenue: 14200 },
    { category: 'Sweets', revenue: 9800 },
    { category: 'Snacks', revenue: 11400 },
  ],
  topItems: [
    { itemId: 'item_003', itemName: 'Paneer Butter Masala', quantity: 210, revenue: 54600 },
    { itemId: 'item_001', itemName: 'Paneer Tikka', quantity: 180, revenue: 32400 },
    { itemId: 'item_004', itemName: 'Veg Biryani', quantity: 140, revenue: 30800 },
    { itemId: 'item_005', itemName: 'Cold Coffee', quantity: 165, revenue: 19800 },
    { itemId: 'item_009', itemName: 'Aloo Samosa', quantity: 260, revenue: 10400 },
  ],
  bottomItems: [
    { itemId: 'item_010', itemName: 'French Fries', quantity: 4, revenue: 440 },
    { itemId: 'item_008', itemName: 'Rasgulla', quantity: 6, revenue: 540 },
    { itemId: 'item_007', itemName: 'Gulab Jamun', quantity: 9, revenue: 720 },
    { itemId: 'item_006', itemName: 'Fresh Lime Soda', quantity: 12, revenue: 1080 },
    { itemId: 'item_002', itemName: 'Veg Spring Roll', quantity: 18, revenue: 2520 },
  ],
  totalOrders: 412,
  totalRevenue: 120400,
  totalCustomers: 186,
  repeatCustomers: 54,
  recentOrders: [
    { orderId: 'ORD-20260702-101500', createdAt: new Date().toISOString(), customerName: 'Ramesh', tableNo: '5', totalAmount: 320 },
    { orderId: 'ORD-20260702-095200', createdAt: new Date().toISOString(), customerName: 'Priya', tableNo: '', totalAmount: 540 },
    { orderId: 'ORD-20260701-201000', createdAt: new Date().toISOString(), customerName: 'Arjun', tableNo: '2', totalAmount: 210 },
  ],
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const OPERATING_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]; // 10 AM - 11 PM

function formatHourLabel(hour24) {
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:00 ${period}`;
}

function sampleHourCount(dayIndex, hour) {
  const isWeekend = dayIndex === 0 || dayIndex === 5 || dayIndex === 6;
  const lunchBoost = hour >= 12 && hour <= 14 ? 12 : 0;
  const eveningBoost = hour >= 19 && hour <= 21 ? (isWeekend ? 28 : 20) : 0;
  const afternoonLull = hour >= 15 && hour <= 17 ? -6 : 0;
  const base = isWeekend ? 10 : 7;
  return Math.max(1, base + lunchBoost + eveningBoost + afternoonLull);
}

const heatmap = [];
let maxHourCount = 0;

DAY_NAMES.forEach((dayName, dayIndex) => {
  OPERATING_HOURS.forEach((hour) => {
    const count = sampleHourCount(dayIndex, hour);
    maxHourCount = Math.max(maxHourCount, count);
    heatmap.push({ dayName, hourLabel: formatHourLabel(hour), count });
  });
});

heatmap.forEach((entry) => {
  entry.intensity = Math.round((entry.count / maxHourCount) * 100) / 100;
});

function buildDayAnalysis(dayName, dayIndex) {
  const isWeekend = dayIndex === 0 || dayIndex === 5 || dayIndex === 6;

  return {
    dayName,
    totalOrders: isWeekend ? 68 : 48,
    totalRevenue: isWeekend ? 21200 : 14800,
    peakRevenueWindow: { startLabel: isWeekend ? '7:00 PM' : '7:00 PM', endLabel: '10:00 PM', value: isWeekend ? 9800 : 6200 },
    peakVolumeWindow: { startLabel: '7:00 PM', endLabel: '10:00 PM', value: isWeekend ? 32 : 21 },
    lowDemandWindow: { startLabel: '3:00 PM', endLabel: '5:00 PM', value: isWeekend ? 3 : 2 },
    nearZeroHours: dayIndex === 1 ? [{ startLabel: '3:00 PM', endLabel: '4:00 PM' }] : [],
  };
}

export const sampleOperationsSummary = {
  hasEnoughData: true,
  weeksOfDataAnalyzed: 12,
  totalOrders: 412,
  dayAnalysis: DAY_NAMES.map(buildDayAnalysis),
  breakRecommendation: {
    ownerWindow: { startLabel: '3:15 PM', endLabel: '3:45 PM' },
    kitchenWindow: { startLabel: '3:00 PM', endLabel: '3:45 PM' },
    staggeredSchedule: [
      { group: 'Group A', startLabel: '3:00 PM', endLabel: '3:30 PM' },
      { group: 'Group B', startLabel: '3:30 PM', endLabel: '4:00 PM' },
    ],
    impactPercent: 2,
  },
  closureRecommendation: {
    window: { startLabel: '3:00 PM', endLabel: '4:00 PM' },
    estimatedWeeklyLoss: 2100,
    estimatedMonthlyLoss: 9093,
    impactPercent: 1.8,
  },
  weeklyOffRecommendation: {
    bestDay: 'Tuesday',
    bestDayImpactPercent: 6.5,
    secondBestDay: 'Monday',
    secondBestImpactPercent: 8.2,
    worstDaysToAvoid: [
      { dayName: 'Friday', sharePercent: 17.4 },
      { dayName: 'Saturday', sharePercent: 19.8 },
      { dayName: 'Sunday', sharePercent: 16.1 },
    ],
  },
  staffingGuidance: {
    heatmap,
    understaffedPeriods: [
      { dayName: 'Saturday', hourLabel: '8:00 PM' },
      { dayName: 'Friday', hourLabel: '8:00 PM' },
      { dayName: 'Sunday', hourLabel: '7:00 PM' },
    ],
    overstaffedPeriods: [
      { dayName: 'Monday', hourLabel: '3:00 PM' },
      { dayName: 'Tuesday', hourLabel: '4:00 PM' },
      { dayName: 'Wednesday', hourLabel: '3:00 PM' },
    ],
  },
};
