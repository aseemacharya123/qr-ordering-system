function MenuItemCard({
  item,
  onAddToCart,
}) {

  return (

    <div className="card menu-item-card">

      <div className="menu-item-content">

        {/* LEFT SIDE */}

        <div className="menu-item-details">

          <div className="small-tag">
            {item.vegType}
          </div>

          <h3>
            {item.itemName}
          </h3>

          <p>
            {item.description}
          </p>

          <div className="menu-item-price">
            ₹{item.price}
          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="menu-item-image-section">

          {item.imageUrl ? (

            <img
              src={item.imageUrl}
              alt={item.itemName}
              className="menu-item-image"
            />

          ) : (

            <div className="image-placeholder">
              No Image
            </div>

          )}

          <button
            className="add-button"
            onClick={() =>
              onAddToCart(item)
            }
          >
            Add
          </button>

        </div>

      </div>

    </div>
  );
}

export default MenuItemCard;
