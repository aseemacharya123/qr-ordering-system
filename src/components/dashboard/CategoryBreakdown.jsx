import React from 'react';
import { formatCurrency } from '../../utils/currency.js';

const CATEGORY_COLORS = [
  '#2a78d6',
  '#1baf7a',
  '#eda100',
  '#008300',
  '#4a3aa7',
  '#e34948',
  '#e87ba4',
  '#eb6834',
];

function CategoryBreakdown({ categoryRevenue }) {
  if (categoryRevenue.length === 0) {
    return <p className="state-message">No category data yet.</p>;
  }

  const sortedByName = [...categoryRevenue].sort((a, b) => a.category.localeCompare(b.category));
  const colorByCategory = {};
  sortedByName.forEach((entry, index) => {
    colorByCategory[entry.category] = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  });

  const maxRevenue = Math.max(...categoryRevenue.map((entry) => entry.revenue), 1);
  const sortedByRevenue = [...categoryRevenue].sort((a, b) => b.revenue - a.revenue);

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {sortedByRevenue.map((entry) => {
        const widthPercent = Math.max((entry.revenue / maxRevenue) * 100, 4);

        return (
          <div key={entry.category}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{entry.category}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{formatCurrency(entry.revenue)}</span>
            </div>
            <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-pill)', height: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${widthPercent}%`,
                  height: '100%',
                  borderRadius: 'var(--radius-pill)',
                  background: colorByCategory[entry.category],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CategoryBreakdown;
