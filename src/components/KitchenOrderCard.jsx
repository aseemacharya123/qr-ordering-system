import React from 'react';
import { formatCurrency } from '../utils/currency.js';

const NEXT_STATUS = {
  Received: { label: 'Start Preparing', next: 'Preparing' },
  Preparing: { label: 'Mark Ready', next: 'Ready' },
  Ready: { label: 'Mark Completed', next: 'Completed' },
};

function minutesAgo(isoDateString) {
  const created = new Date(isoDateString).getTime();
  if (isNaN(created)) {
    return '';
  }
  const minutes = Math.max(0, Math.round((Date.now() - created) / 60000));
  return minutes === 0 ? 'just now' : `${minutes} min ago`;
}

function KitchenOrderCard({ order, onAdvanceStatus, onCancel, onMarkPaid, isBusy }) {
  const nextAction = NEXT_STATUS[order.status];
  const needsPaymentConfirmation = order.paymentMethod === 'UPI' && order.paymentStatus !== 'Paid';

  return (
    <div className="card" style={{ borderLeft: order.status === 'Ready' ? '4px solid #16a34a' : '4px solid var(--color-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
            {order.orderId}{order.tableNo ? ` · Table ${order.tableNo}` : ''}
          </div>
          <div className="small-tag">{order.customerName} · {minutesAgo(order.createdAt)}</div>
        </div>
        <div style={{ fontWeight: 800 }}>{formatCurrency(order.totalAmount)}</div>
      </div>

      <div style={{ display: 'grid', gap: '2px', marginBottom: '10px' }}>
        {order.items.map((item, index) => (
          <div key={`${order.orderId}-${item.itemId || index}`} className="small-tag">
            {item.quantity}x {item.name}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: needsPaymentConfirmation || nextAction ? '10px' : 0 }}>
        <span className="small-tag" style={{ padding: '3px 8px', borderRadius: '999px', background: 'var(--color-primary-soft)' }}>
          {order.status}
        </span>
        <span className="small-tag" style={{ padding: '3px 8px', borderRadius: '999px', background: 'var(--color-primary-soft)' }}>
          {order.paymentMethod} · {order.paymentStatus}
        </span>
      </div>

      <div style={{ display: 'grid', gap: '8px' }}>
        {needsPaymentConfirmation && (
          <button
            type="button"
            className="button button-secondary button-block"
            disabled={isBusy}
            onClick={() => onMarkPaid(order.orderId)}
          >
            Mark Paid
          </button>
        )}

        {nextAction && (
          <button
            type="button"
            className="button button-primary button-block"
            disabled={isBusy}
            onClick={() => onAdvanceStatus(order.orderId, nextAction.next)}
          >
            {nextAction.label}
          </button>
        )}

        <button
          type="button"
          className="button button-secondary button-block"
          disabled={isBusy}
          onClick={() => onCancel(order.orderId)}
        >
          Cancel Order
        </button>
      </div>
    </div>
  );
}

export default KitchenOrderCard;
