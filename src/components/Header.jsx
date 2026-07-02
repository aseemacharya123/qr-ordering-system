import React from 'react';
import { normalizeImageUrl } from '../utils/imageUrl.js';

function Header({ businessName, logoUrl, tableNo }) {
  return (
    <div className="page-header">
      <img
        src={normalizeImageUrl(logoUrl)}
        alt={`${businessName} logo`}
        className="header-logo"
        onError={(event) => {
          event.currentTarget.style.visibility = 'hidden';
        }}
      />
      <div>
        <div className="header-title">{businessName}</div>
        {tableNo && <div className="header-table-badge">Table {tableNo}</div>}
      </div>
    </div>
  );
}

export default Header;
