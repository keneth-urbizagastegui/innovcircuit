import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // 1. Cargar el carrito inicial desde localStorage
  const [items, setItems] = useState(() => {
    try {
      const localData = localStorage.getItem('cartItems');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      return [];
    }
  });

  // 2. Guardar en localStorage cada vez que 'items' cambie
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }, [items]);

  const addItem = (diseno) => {
    // Evitar duplicados
    if (!items.find((item) => item.id === diseno.id)) {
      setItems([...items, diseno]);
      alert(`'${diseno.nombre}' añadido al carrito!`);
    } else {
      alert('Este diseño ya está en tu carrito.');
    }
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]); // Esto disparará el useEffect y limpiará localStorage
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};