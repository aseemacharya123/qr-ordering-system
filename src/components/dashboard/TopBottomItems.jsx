import React from 'react';
import { formatCurrency } from '../../utils/currency.js';

function ItemBarList({ items }) {
  const maxRevenue = Math.max(...items.map((item) => item.revenue), 1);

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {items.map((item) => {
        const widthPercent = Math.max((item.revenue / maxRevenue) * 100, 3);

        return (
          <div key={item.itemId}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.itemName}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{formatCurrency(item.revenue)}</span>
            </div>
            <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-pill)', height: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${widthPercent}%`,
                  height: '100%',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-primary)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TopBottomItems({ topItems, bottomItems }) {
  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Top 5 Sellers</h3>
        {topItems.length > 0
          ? <ItemBarList items={topItems} />
          : <p className="state-message">No sales yet.</p>}
      </div>

      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Bottom 5 Sellers</h3>
        {bottomItems.length > 0
          ? <ItemBarList items={bottomItems} />
          : <p className="state-message">Not enough data yet.</p>}
      </div>
    </div>
  );
}

export default TopBottomItems;
