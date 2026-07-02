import React from 'react';
import { formatCurrency } from '../../utils/currency.js';

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'short' });
}

function RevenueChart({ monthlyRevenue }) {
  const data = monthlyRevenue.slice(-6);

  if (data.length === 0) {
    return <p className="state-message">No orders yet — revenue will show up here once you get your first order.</p>;
  }

  const maxRevenue = Math.max(...data.map((entry) => entry.revenue), 1);
  const chartHeight = 140;

  return (
    <div>
      <svg
        viewBox={`0 0 ${data.length * 60} ${chartHeight + 30}`}
        width="100%"
        height={chartHeight + 30}
        role="img"
        aria-label="Monthly revenue bar chart"
      >
        <line
          x1="0"
          y1={chartHeight}
          x2={data.length * 60}
          y2={chartHeight}
          stroke="var(--color-border-strong)"
          strokeWidth="1"
        />

        {data.map((entry, index) => {
          const barHeight = Math.max((entry.revenue / maxRevenue) * (chartHeight - 20), 2);
          const barWidth = 28;
          const x = index * 60 + 16;
          const y = chartHeight - barHeight;

          return (
            <g key={entry.month}>
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="var(--color-text)"
              >
                {formatCurrency(entry.revenue)}
              </text>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill="var(--color-primary)"
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight + 18}
                textAnchor="middle"
                fontSize="11"
                fill="var(--color-text-muted)"
              >
                {formatMonthLabel(entry.month)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default RevenueChart;
