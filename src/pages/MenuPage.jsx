import React, { useMemo, useState } from 'react';

import Header from '../components/Header.jsx';
import SearchBar from '../components/SearchBar.jsx';
import CategoryTabs from '../components/CategoryTabs.jsx';
import MenuItemCard from '../components/MenuItemCard.jsx';
import CartFooter from '../components/CartFooter.jsx';
import CartDrawer from '../components/CartDrawer.jsx';
import CheckoutForm from '../components/CheckoutForm.jsx';
import OrderSuccess from '../components/OrderSuccess.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import NotFoundPage from './NotFoundPage.jsx';

import { getBusiness } from '../services/businessService.js';

import {
  categories as sampleCategories,
  items as sampleItems,
} from '../config/sampleMenuData.js';

import {
  addItemToCart,
  updateCartQuantity,
  removeCartItem,
  calculateCartTotal,
  getCartItemCount,
} from '../utils/localCart.js';

import { validateCheckoutForm } from '../utils/validation.js';

import { formatOrderPayload } from '../utils/orderFormatter.js';

import { submitOrder } from '../services/orderService.js';

function getSlugFromPath(path) {
  const segments = path.split('/').filter(Boolean);

  return segments.length >= 2
    ? segments[1]
    : null;
}

function getTableNumber() {
  const searchParams =
    new URLSearchParams(window.location.search);

  return searchParams.get('table') || '';
}

function MenuPage() {

  const [searchTerm, setSearchTerm] =
    useState('');

  const [selectedCategoryId, setSelectedCategoryId] =
    useState(
      () =>
        sampleCategories.find(
          (category) => category.isActive
        )?.categoryId || ''
    );

  const [cartItems, setCartItems] =
    useState([]);

  const [showCartDrawer, setShowCartDrawer] =
    useState(false);

  const [customerName, setCustomerName] =
    useState('');

  const [customerPhone, setCustomerPhone] =
    useState('');

  const [errors, setErrors] =
    useState({});

  const [orderId, setOrderId] =
    useState('');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [apiError, setApiError] =
    useState('');

  const slug =
    getSlugFromPath(window.location.pathname);

  const tableNo =
    getTableNumber();

  const business =
    getBusiness(slug);

  const filteredCategories = useMemo(
    () =>
      sampleCategories
        .filter((category) => category.isActive)
        .sort(
          (a, b) =>
            a.displayOrder - b.displayOrder
        ),
    []
  );

  const filteredItems = useMemo(() => {

    return sampleItems
      .filter(
        (item) =>
          item.categoryId === selectedCategoryId
      )
      .filter((item) => item.isAvailable)
      .filter((item) =>
        item.itemName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      .sort(
        (a, b) =>
          a.displayOrder - b.displayOrder
      );

  }, [searchTerm, selectedCategoryId]);

  const totalAmount =
    calculateCartTotal(cartItems);

  const itemCount =
    getCartItemCount(cartItems);

  const handleAddToCart = (item) => {

    setCartItems((prevItems) =>
      addItemToCart(prevItems, item)
    );
  };

  const handleQuantityChange = (
    itemId,
    delta
  ) => {

    setCartItems((prevItems) =>
      updateCartQuantity(
        prevItems,
        itemId,
        delta
      )
    );
  };

  const handleRemoveItem = (itemId) => {

    setCartItems((prevItems) =>
      removeCartItem(prevItems, itemId)
    );
  };

  const handleCheckoutChange = (
    field,
    value
  ) => {

    setErrors({
      ...errors,
      [field]: '',
    });

    if (field === 'customerName') {
      setCustomerName(value);
    }

    if (field === 'customerPhone') {
      setCustomerPhone(value);
    }
  };

  const handleSubmitOrder = async (
    event
  ) => {

    event.preventDefault();

    setApiError('');

    const newErrors =
      validateCheckoutForm({
        customerName,
        customerPhone,
        cartItems,
      });

    setErrors(newErrors);

    if (
      Object.keys(newErrors).length > 0
    ) {
      return;
    }

    const payload =
      formatOrderPayload(
        business,
        tableNo,
        customerName,
        customerPhone,
        cartItems
      );

    setIsSubmitting(true);

    try {

      console.log(
        'Submitting Order...'
      );

      console.log(
        'API URL:',
        business.apiUrl
      );

      console.log(
        'Payload:',
        payload
      );

      // ✅ FINAL FIX
      const response =
        await submitOrder(
          business.apiUrl,
          payload
        );

      console.log(
        'Response:',
        response
      );

      setOrderId(response.orderId);

      setCartItems([]);

      setShowCartDrawer(false);

    } catch (error) {

      console.error(error);

      setApiError(error.message);

    } finally {

      setIsSubmitting(false);

    }
  };

  if (!slug || !business) {

    return (
      <NotFoundPage
        message="This business is not available. Please use a valid QR menu URL."
      />
    );
  }

  if (!business.isActive) {

    return (
      <NotFoundPage
        message="This business is currently unavailable. Please try again later."
      />
    );
  }

  if (orderId) {

    return (
      <OrderSuccess
        orderId={orderId}
        onBackToMenu={() =>
          window.location.reload()
        }
      />
    );
  }

  return (

    <div className="container">

      <Header
        businessName={business.businessName}
        logoUrl={business.logoUrl}
        tableNo={tableNo}
      />

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <CategoryTabs
        categories={filteredCategories}
        selectedCategoryId={
          selectedCategoryId
        }
        onSelectCategory={
          setSelectedCategoryId
        }
      />

      {filteredItems.length === 0 ? (

        <div
          className="empty-box card"
          style={{ marginTop: '16px' }}
        >
          No items found for this category or search.
        </div>

      ) : (

        filteredItems.map((item) => (

          <MenuItemCard
            key={item.itemId}
            item={item}
            onAddToCart={handleAddToCart}
          />

        ))

      )}

      {apiError && (
        <ErrorState message={apiError} />
      )}

      {isSubmitting && (
        <LoadingState
          message="Placing your order..."
        />
      )}

      <CartFooter
        itemCount={itemCount}
        totalAmount={totalAmount}
        onOpenCart={() =>
          setShowCartDrawer(true)
        }
      />

      <CartDrawer
        visible={showCartDrawer}
        cartItems={cartItems}
        totalAmount={totalAmount}
        onClose={() =>
          setShowCartDrawer(false)
        }
        onQuantityChange={
          handleQuantityChange
        }
        onRemoveItem={handleRemoveItem}
        onOpenCheckout={() =>
          setShowCartDrawer(false)
        }
      />

      <div
        className="card"
        style={{ marginTop: '24px' }}
      >

        <h2>Checkout</h2>

        <CheckoutForm
          customerName={customerName}
          customerPhone={customerPhone}
          onChange={handleCheckoutChange}
          onSubmit={handleSubmitOrder}
          errors={errors}
          disabled={isSubmitting}
        />

      </div>

    </div>
  );
}

export default MenuPage;