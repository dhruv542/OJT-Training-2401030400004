import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart from backend if authenticated, otherwise load from localStorage
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (token) {
        try {
          const response = await fetch('http://127.0.0.1:5000/api/cart', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setCartItems(data.items || []);
          }
        } catch (err) {
          console.error('Failed to fetch cart from backend:', err.message);
        }
      } else {
        // Load from localStorage for guest users
        const guestCart = localStorage.getItem('guest_cart');
        setCartItems(guestCart ? JSON.parse(guestCart) : []);
      }
      setLoading(false);
    };

    loadCart();
  }, [token]);

  // Sync guest cart to DB upon login
  useEffect(() => {
    if (token && cartItems.length > 0) {
      // Sync each guest item to DB if the DB cart is currently empty
      const syncCart = async () => {
        try {
          const response = await fetch('http://127.0.0.1:5000/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const dbCart = await response.json();
            if (dbCart.items && dbCart.items.length === 0) {
              for (const item of cartItems) {
                await fetch('http://127.0.0.1:5000/api/cart', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ productId: item.product._id || item.product, quantity: item.quantity })
                });
              }
              // Refresh cart from DB
              const refreshed = await fetch('http://127.0.0.1:5000/api/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const refreshedData = await refreshed.json();
              setCartItems(refreshedData.items || []);
            }
          }
        } catch (err) {
          console.error('Failed to sync guest cart:', err.message);
        }
      };
      syncCart();
    }
  }, [token]);

  // Helper function to update state and persist
  const saveCartState = async (updatedItems) => {
    setCartItems(updatedItems);
    if (!token) {
      localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const productId = product._id;
    
    if (token) {
      try {
        // Calculate new quantity
        const existing = cartItems.find(item => item.product._id === productId);
        const newQty = existing ? existing.quantity + quantity : quantity;

        const response = await fetch('http://127.0.0.1:5000/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, quantity: newQty })
        });
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
        }
      } catch (err) {
        console.error('Failed to add to backend cart:', err.message);
      }
    } else {
      // LocalStorage guest addition
      const updated = [...cartItems];
      const index = updated.findIndex(item => item.product._id === productId);
      if (index > -1) {
        updated[index].quantity += quantity;
      } else {
        updated.push({ product, quantity });
      }
      saveCartState(updated);
    }
  };

  const updateQuantity = async (productId, newQty) => {
    if (newQty < 1) {
      removeFromCart(productId);
      return;
    }

    if (token) {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, quantity: newQty })
        });
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
        }
      } catch (err) {
        console.error('Failed to update cart quantity on server:', err.message);
      }
    } else {
      const updated = cartItems.map(item => 
        item.product._id === productId ? { ...item, quantity: newQty } : item
      );
      saveCartState(updated);
    }
  };

  const removeFromCart = async (productId) => {
    if (token) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/cart?productId=${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
        }
      } catch (err) {
        console.error('Failed to remove item from server cart:', err.message);
      }
    } else {
      const updated = cartItems.filter(item => item.product._id !== productId);
      saveCartState(updated);
    }
  };

  const clearCart = async () => {
    if (token) {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/cart', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
        }
      } catch (err) {
        console.error('Failed to clear server cart:', err.message);
      }
    } else {
      saveCartState([]);
      localStorage.removeItem('guest_cart');
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  };

  const getItemsCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getCartTotal,
      getItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
