import React, { useCallback, useEffect, useRef, useState } from 'react';

import KitchenOrderCard from '../components/KitchenOrderCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';

import { fetchKitchenOrders, updateOrderStatus, markOrderPaid } from '../services/staffService.js';
import { clearToken } from '../utils/staffSession.js';

const POLL_INTERVAL_MS = 10000;

function StaffDashboard({ business, token, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyOrderId, setBusyOrderId] = useState('');
  const pollRef = useRef(null);

  const loadOrders = useCallback(async ({ silent } = {}) => {
    if (!silent) {
      setIsLoading(true);
    }

    try {
      const response = await fetchKitchenOrders(business.apiUrl, token);

      if (response.success) {
        setOrders(response.orders || []);
        setError('');
      } else if (response.error === 'Unauthorized') {
        onLogout();
      } else {
        setError(response.error || 'Could not load orders.');
      }
    } catch (fetchError) {
      setError('Could not reach the kitchen queue. Retrying...');
    } finally {
      setIsLoading(false);
    }
  }, [business.apiUrl, token, onLogout]);

  useEffect(() => {
    loadOrders();
    pollRef.current = setInterval(() => loadOrders({ silent: true }), POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [loadOrders]);

  const handleAdvanceStatus = async (orderId, nextStatus) => {
    setBusyOrderId(orderId);
    try {
      await updateOrderStatus(business.apiUrl, token, orderId, nextStatus);
      await loadOrders({ silent: true });
    } catch (actionError) {
      setError('Could not update the order. Please try again.');
    } finally {
      setBusyOrderId('');
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order? The customer will be notified.')) {
      return;
    }
    await handleAdvanceStatus(orderId, 'Cancelled');
  };

  const handleMarkPaid = async (orderId) => {
    setBusyOrderId(orderId);
    try {
      await markOrderPaid(business.apiUrl, token, orderId);
      await loadOrders({ silent: true });
    } catch (actionError) {
      setError('Could not mark the order as paid. Please try again.');
    } finally {
      setBusyOrderId('');
    }
  };

  const handleLogout = () => {
    clearToken(business.businessId);
    onLogout();
  };

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '48px' }}>
        <LoadingState message="Loading kitchen queue..." />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header" style={{ position: 'static', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="header-title">{business.businessName}</div>
          <div className="small-tag">Kitchen Queue · {orders.length} active</div>
        </div>
        <button type="button" className="button button-secondary" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {error && <ErrorState message={error} />}

      {orders.length === 0 ? (
        <div className="card state-box">
          <p className="state-message">No active orders right now. New orders will appear here automatically.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {orders.map((order) => (
            <KitchenOrderCard
              key={order.orderId}
              order={order}
              isBusy={busyOrderId === order.orderId}
              onAdvanceStatus={handleAdvanceStatus}
              onCancel={handleCancel}
              onMarkPaid={handleMarkPaid}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default StaffDashboard;
