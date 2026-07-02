import React from 'react';

function AIInsights({ insights, isLoading, error, onGenerate }) {
  return (
    <div>
      {!insights && !isLoading && (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <p className="state-message" style={{ marginBottom: '14px' }}>
            Get AI-generated recommendations based on your sales data.
          </p>
          <button type="button" className="button button-primary" onClick={() => onGenerate(false)}>
            Generate Insights
          </button>
        </div>
      )}

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '12px 0' }}>
          <div className="spinner" />
          <p className="state-message">Analyzing your sales data...</p>
        </div>
      )}

      {error && <div className="error-text">{error}</div>}

      {insights && !isLoading && (
        <div>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.92rem' }}>{insights}</p>
          <button
            type="button"
            className="button button-secondary"
            style={{ marginTop: '14px' }}
            onClick={() => onGenerate(true)}
          >
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}

export default AIInsights;
