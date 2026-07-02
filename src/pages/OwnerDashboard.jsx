import React, { useEffect, useState } from 'react';

import RevenueChart from '../components/dashboard/RevenueChart.jsx';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown.jsx';
import TopBottomItems from '../components/dashboard/TopBottomItems.jsx';
import RecentOrders from '../components/dashboard/RecentOrders.jsx';
import AIInsights from '../components/dashboard/AIInsights.jsx';
import OperationsSummary from '../components/dashboard/OperationsSummary.jsx';
import BreakAndClosureRecommendations from '../components/dashboard/BreakAndClosureRecommendations.jsx';
import LoadingState from '../components/LoadingState.jsx';

import { fetchDashboard, fetchAiInsights } from '../services/ownerService.js';
import { clearToken } from '../utils/ownerSession.js';
import { formatCurrency } from '../utils/currency.js';
import { sampleDashboardSummary, sampleOperationsSummary } from '../config/sampleDashboardData.js';

function StatTile({ label, value }) {
  return (
    <div className="card" style={{ padding: '14px', marginBottom: 0 }}>
      <div className="small-tag" style={{ marginBottom: '4px' }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>{value}</div>
    </div>
  );
}

function OwnerDashboard({ business, token, onLogout }) {
  const [summary, setSummary] = useState(null);
  const [operations, setOperations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  const [insights, setInsights] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await fetchDashboard(business.apiUrl, token);

        if (cancelled) return;

        if (response.success) {
          setSummary(response.summary);
          setOperations(response.operations);
        } else if (response.error === 'Unauthorized') {
          onLogout();
        } else {
          throw new Error(response.error || 'Could not load dashboard.');
        }
      } catch (error) {
        if (cancelled) return;
        setSummary(sampleDashboardSummary);
        setOperations(sampleOperationsSummary);
        setUsingSampleData(true);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [business.apiUrl, token]);

  const handleGenerateInsights = async (forceRefresh) => {
    setInsightsLoading(true);
    setInsightsError('');

    try {
      const response = await fetchAiInsights(business.apiUrl, token, forceRefresh);

      if (response.success) {
        setInsights(response.insights);
      } else {
        setInsightsError(response.error || 'Could not generate insights.');
      }
    } catch (error) {
      setInsightsError('Could not generate insights right now.');
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken(business.businessId);
    onLogout();
  };

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '48px' }}>
        <LoadingState message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header" style={{ position: 'static', marginBottom: '16px' }}>
        <div>
          <div className="header-title">{business.businessName}</div>
          <div className="small-tag">Owner Dashboard</div>
        </div>
      </div>

      {usingSampleData && (
        <div className="card" style={{ background: 'var(--color-primary-soft)', border: 'none' }}>
          <p className="small-tag">
            Showing sample data — could not reach the live backend from here. Deploy the updated Apps Script
            backend to see real numbers.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <StatTile label="Total revenue" value={formatCurrency(summary.totalRevenue)} />
        <StatTile label="Total orders" value={summary.totalOrders} />
        <StatTile label="Total customers" value={summary.totalCustomers} />
        <StatTile label="Repeat customers" value={summary.repeatCustomers} />
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Monthly Revenue</h2>
        <RevenueChart monthlyRevenue={summary.monthlyRevenue} />
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Revenue by Category</h2>
        <CategoryBreakdown categoryRevenue={summary.categoryRevenue} />
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Item Performance</h2>
        <TopBottomItems topItems={summary.topItems} bottomItems={summary.bottomItems} />
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Demand Heatmap</h2>
        <OperationsSummary heatmap={operations?.staffingGuidance?.heatmap} />
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Operations Recommendations</h2>
        <BreakAndClosureRecommendations operations={operations} />
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>AI Business Insights</h2>
        <AIInsights
          insights={insights}
          isLoading={insightsLoading}
          error={insightsError}
          onGenerate={handleGenerateInsights}
        />
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Recent Orders</h2>
        <RecentOrders orders={summary.recentOrders} />
      </div>

      <button type="button" className="button button-secondary button-block" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}

export default OwnerDashboard;
