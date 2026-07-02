import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

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
import { fetchMenu } from '../services/menuService.js';

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

/* ========================================
   HELPERS
======================================== */

function getTableNumber() {

  const searchParams =
    new URLSearchParams(
      window.location.search
    );

  return (
    searchParams.get('table') || ''
  );
}

function getBusinessSlug() {

  const pathSegments =
    window.location.pathname
      .split('/')
      .filter(Boolean);

  const menuIndex =
    pathSegments.indexOf('menu');

  if (
    menuIndex !== -1 &&
    pathSegments[menuIndex + 1]
  ) {

    return pathSegments[menuIndex + 1];
  }

  return '';
}

/* ========================================
   COMPONENT
======================================== */

function MenuPage() {

  /* ========================================
     BUSINESS
  ======================================== */

  const slug = getBusinessSlug();

  const business =
    getBusiness(slug);

  const tableNo =
    getTableNumber();

  /* ========================================
     STATES
  ======================================== */

  const [searchTerm, setSearchTerm] =
    useState('');

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState('');

  const [cartItems, setCartItems] =
    useState([]);

  const [
    showCartDrawer,
    setShowCartDrawer,
  ] = useState(false);

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

  const [menuData, setMenuData] =
    useState({
      categories: [],
      items: [],
    });

  /* ========================================
     LOAD MENU
  ======================================== */

  useEffect(() => {

    async function loadMenu() {

      try {

        const data =
          await fetchMenu(
            business.apiUrl
          );

        console.log(
          'MENU DATA:',
          data
        );

        setMenuData({
          categories:
            data.categories || [],
          items:
            data.items || [],
        });

      } catch (error) {

        console.error(
          'Menu fetch error:',
          error
        );
      }
    }

    if (business?.apiUrl) {

      loadMenu();
    }

  }, [business]);

  /* ========================================
     AUTO SELECT CATEGORY
  ======================================== */

  useEffect(() => {

    if (
      menuData.categories.length > 0 &&
      !selectedCategoryId
    ) {

      setSelectedCategoryId(
        menuData.categories[0]
          .categoryId
      );
    }

  }, [
    menuData.categories,
    selectedCategoryId,
  ]);

  /* ========================================
     FILTERED CATEGORIES
  ======================================== */

  const filteredCategories =
    useMemo(() => {

      return (
        menuData.categories || []
      )
        .filter((category) => {

          return (
            String(
              category.isActive
            )
              .toLowerCase()
              .trim() === 'true'
          );
        })
        .sort(
          (a, b) =>
            Number(a.displayOrder) -
            Number(b.displayOrder)
        );

    }, [menuData.categories]);

  /* ========================================
     FILTERED ITEMS
  ======================================== */

  const filteredItems =
    useMemo(() => {

      return (
        menuData.items || []
      )
        .filter(
          (item) =>
            String(item.categoryId)
              .trim()
              .toLowerCase() ===
            String(selectedCategoryId)
              .trim()
              .toLowerCase()
        )
        .filter((item) =>
          item.itemName
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            )
        )
        .sort(
          (a, b) =>
            Number(a.displayOrder) -
            Number(b.displayOrder)
        );

    }, [
      menuData.items,
      selectedCategoryId,
      searchTerm,
    ]);

  /* ========================================
     TOTALS
  ======================================== */

  const totalAmount =
    calculateCartTotal(cartItems);

  const itemCount =
    getCartItemCount(cartItems);

  /* ========================================
     CART ACTIONS
  ======================================== */

  const handleAddToCart = (
    item
  ) => {

    setCartItems((prevItems) =>
      addItemToCart(
        prevItems,
        item
      )
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

  const handleRemoveItem = (
    itemId
  ) => {

    setCartItems((prevItems) =>
      removeCartItem(
        prevItems,
        itemId
      )
    );
  };

  /* ========================================
     CHECKOUT
  ======================================== */

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

  /* ========================================
     SUBMIT ORDER
  ======================================== */

  const handleSubmitOrder =
    async (event) => {

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
        Object.keys(newErrors)
          .length > 0
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

        const response =
          await submitOrder(
            business.apiUrl,
            payload
          );

        setOrderId(
          response.orderId
        );

        setCartItems([]);

        setShowCartDrawer(false);

      } catch (error) {

        console.error(error);

        setApiError(
          error.message
        );

      } finally {

        setIsSubmitting(false);
      }
    };

  /* ========================================
     INVALID / INACTIVE BUSINESS
  ======================================== */

  if (!business) {

    return (
      <NotFoundPage message="This QR code is not linked to a valid business." />
    );
  }

  if (!business.isActive) {

    return (
      <NotFoundPage message="This business is currently unavailable." />
    );
  }

  /* ========================================
     SUCCESS
  ======================================== */

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

  /* ========================================
     UI
  ======================================== */

  return (

    <>

      <Header
        businessName={
          business.businessName
        }
        logoUrl={business.logoUrl}
        tableNo={tableNo}
      />

      <div className="container">

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={
          setSearchTerm
        }
      />

      <CategoryTabs
        categories={
          filteredCategories
        }
        selectedCategoryId={
          selectedCategoryId
        }
        onSelectCategory={
          setSelectedCategoryId
        }
      />

      {filteredItems.length === 0 ? (

        <div
          className="card state-box"
          style={{
            marginTop: '16px',
          }}
        >
          <p className="state-message">No items found for this category or search.</p>
        </div>

      ) : (

        filteredItems.map((item) => (

          <MenuItemCard
            key={item.itemId}
            item={item}
            onAddToCart={
              handleAddToCart
            }
          />

        ))

      )}

      {apiError && (

        <ErrorState
          message={apiError}
        />

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
        onRemoveItem={
          handleRemoveItem
        }
        onOpenCheckout={() =>
          setShowCartDrawer(false)
        }
      />

      <div
        className="card"
        style={{
          marginTop: '24px',
        }}
      >

        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px' }}>Checkout</h2>

        <CheckoutForm
          customerName={
            customerName
          }
          customerPhone={
            customerPhone
          }
          onChange={
            handleCheckoutChange
          }
          onSubmit={
            handleSubmitOrder
          }
          errors={errors}
          disabled={isSubmitting}
        />

      </div>

      </div>

    </>
  );
}

export default MenuPage;