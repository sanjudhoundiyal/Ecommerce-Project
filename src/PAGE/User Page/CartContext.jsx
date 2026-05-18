import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const BASE_URL = "http://localhost:8080/api/carts";

  const getUserId = () => {
  const id = localStorage.getItem("userId");
  return id && id !== "undefined" && id !== "null" ? Number(id) : null;
};
  const fetchCart = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const res = await fetch(`${BASE_URL}/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCartItems(data || []);
      }
    } catch (err) { console.error("Fetch error:", err); }
  }, []);

  // ✅ Add this function to clear cart items locally
  const clearCartUI = () => {
    setCartItems([]);
  };

 const addToCart = async (product, size) => {
  const userId = getUserId();

  if (!userId) {
    alert("Please login first ❌");
    return false;
  }

  try {
    const res = await fetch(
      `${BASE_URL}/add?userId=${userId}&productId=${product.id}&quantity=1&size=${size}`,
      { method: "POST" }
    );

    if (res.ok) await fetchCart();
    return res.ok;
  } catch (err) {
    return false;
  }
};
  const removeFromCart = async (cartId) => {
    try {
      const res = await fetch(`${BASE_URL}/remove/${cartId}`, { method: "DELETE" });
      if (res.ok) await fetchCart();
    } catch (err) { console.error(err); }
  };

  const updateQuantity = async (cartId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await fetch(`${BASE_URL}/update/${cartId}?quantity=${quantity}`, { method: "PUT" });
      if (res.ok) await fetchCart();
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCart(); }, [fetchCart]);

  return (
    <CartContext.Provider value={{ cartItems, cartCount: cartItems.length, addToCart, removeFromCart, updateQuantity, fetchCart, clearCartUI }}>
      {children}
    </CartContext.Provider>
  );
};