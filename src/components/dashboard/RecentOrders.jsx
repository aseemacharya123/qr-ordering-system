import React from 'react';
import { formatCurrency } from '../../utils/currency.js';

function RecentOrders({ orders }) {
  if (orders.length === 0) {
    return <p className="state-message">No orders yet.</p>;
  }

  return (
    <div style={{ display: 'grid', gap: '0' }}>
      {orders.map((order) => (
        <div key={order.orderId} className="cart-item">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{order.customerName}</div>
            <div className="small-tag">
              {order.orderId}{order.tableNo ? ` · Table ${order.tableNo}` : ''}
              {order.status ? ` · ${order.status}` : ''}
              {order.paymentStatus ? ` · ${order.paymentStatus}` : ''}
            </div>
          </div>
          <div style={{ fontWeight: 700 }}>{formatCurrency(order.totalAmount)}</div>
        </div>
      ))}
    </div>
  );
}

export default RecentOrders;
