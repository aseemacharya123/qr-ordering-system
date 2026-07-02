import React, { useState } from 'react';
import { normalizeImageUrl } from '../utils/imageUrl.js';

function isNonVeg(vegType) {
  return String(vegType || '').toLowerCase().includes('non');
}

function isItemAvailable(isAvailable) {
  return String(isAvailable).toLowerCase().trim() !== 'false';
}

function MenuItemCard({
  item,
  onAddToCart,
}) {

  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl = normalizeImageUrl(item.imageUrl);
  const showImage = imageUrl && !imageFailed;
  const available = isItemAvailable(item.isAvailable);

  return (

    <div className="card menu-item-card">

      {/* LEFT SIDE */}

      <div className="menu-item-details">

        {item.vegType && (
          <span className={'veg-badge' + (isNonVeg(item.vegType) ? ' nonveg' : '')} />
        )}

        <h3>
          {item.itemName}
        </h3>

        {item.description && (
          <p>
            {item.description}
          </p>
        )}

        <div className="menu-item-price">
          ₹{item.price}
        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="menu-item-image-wrap">

        <div className="menu-item-image-box">

          {showImage ? (

            <img
              src={imageUrl}
              alt={item.itemName}
              className="menu-item-image"
              onError={() => setImageFailed(true)}
            />

          ) : (

            <div className="image-placeholder">
              No Image
            </div>

          )}

        </div>

        <button
          type="button"
          className="add-button"
          disabled={!available}
          onClick={() =>
            onAddToCart(item)
          }
        >
          {available ? 'Add' : 'Sold out'}
        </button>

      </div>

    </div>
  );
}

export default MenuItemCard;
