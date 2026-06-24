import React from 'react';
import { formatCurrency } from '../utils/currency.js';

function MenuItemCard({ item, onAddToCart }) {
  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'grid', gap: '12px' }}>
        <img src={item.imageUrl} alt={item.itemName} style={{ borderRadius: '16px' }} />
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>{item.itemName}</h3>
            <span style={{ fontWeight: 700 }}>{formatCurrency(item.price)}</span>
          </div>
          <p style={{ margin: '8px 0 0', color: '#4b5563' }}>{item.description}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <span className="small-tag">{item.vegType === 'veg' ? 'VEG' : 'NON-VEG'}</span>
          <button
            type="button"
            className="button button-primary"
            onClick={() => onAddToCart(item)}
            disabled={!item.isAvailable}
            style={{ opacity: item.isAvailable ? 1 : 0.5 }}
          >
            {item.isAvailable ? 'Add' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MenuItemCard;
