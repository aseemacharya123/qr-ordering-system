import React from 'react';

function LandingPage({ businessName, logoUrl, onSelectOrder, onSelectOwner, onSelectStaff }) {
  return (
    <div className="container" style={{ paddingTop: '48px' }}>
      <div className="state-box" style={{ marginBottom: '32px' }}>
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`${businessName} logo`}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: 'var(--radius-md)',
              objectFit: 'cover',
              margin: '0 auto 16px',
              border: '1px solid var(--color-border)',
            }}
          />
        )}
        <h1 className="state-title" style={{ fontSize: '1.3rem' }}>{businessName}</h1>
      </div>

      <div style={{ display: 'grid', gap: '14px' }}>
        <button
          type="button"
          className="button button-primary button-block"
          style={{ padding: '18px' }}
          onClick={onSelectOrder}
        >
          Place an Order
        </button>

        <button
          type="button"
          className="button button-secondary button-block"
          style={{ padding: '18px' }}
          onClick={onSelectOwner}
        >
          I am the Owner
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          type="button"
          onClick={onSelectStaff}
          style={{ border: 'none', background: 'none', padding: 0, color: 'var(--color-text-muted, #888)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
        >
          Staff / Kitchen Login
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
