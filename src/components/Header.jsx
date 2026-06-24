import React from 'react';

function Header({ businessName, logoUrl, tableNo }) {
  return (
    <div className="page-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={logoUrl}
          alt={`${businessName} logo`}
          width="60"
          height="60"
          style={{ borderRadius: '16px', objectFit: 'cover' }}
        />
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{businessName}</div>
          {tableNo && <div className="small-tag">Table {tableNo}</div>}
        </div>
      </div>
    </div>
  );
}

export default Header;
