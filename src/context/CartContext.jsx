import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // LocalStorage'dan sepet verilerini çek
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Cart LocalStorage okuma hatası:', error);
      return [];
    }
  });

  // LocalStorage'dan favori verilerini çek
  const [wishlist, setWishlist] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error('Wishlist LocalStorage okuma hatası:', error);
      return [];
    }
  });

  // State değiştikçe LocalStorage güncelle
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sepete Ürün Ekle / Adet Artır
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      const availableStock = product.stock !== undefined ? Number(product.stock) : 999;

      if (existingProduct) {
        if (existingProduct.quantity >= availableStock) {
          alert(`Maksimum stok miktarına (${availableStock}) ulaştınız.`);
          return prevCart;
        }

        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      if (availableStock > 0) {
        return [...prevCart, { ...product, quantity: 1 }];
      } else {
        alert('Üzgünüz, bu ürün stokta kalmadı.');
        return prevCart;
      }
    });
  };

  // Sepetteki Ürün Adedini Düşür (DÜZELTİLDİ)
  const decreaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0) // Adet 0 olursa sepetten otomatik sil
    );
  };

  // Sepetten Tamamen Çıkar
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Sepeti Temizle
  const clearCart = () => {
    setCart([]);
  };

  // Favorilere Ekle / Çıkar (Toggle)
  const toggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      if (exists) {
        return prevWishlist.filter((item) => item.id !== product.id);
      }
      return [...prevWishlist, product];
    });
  };

  // Ürünün favorilerde olup olmadığını kontrol eden yardımcı fonksiyon
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        decreaseQuantity, // Buraya eklendi!
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);