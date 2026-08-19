import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Kullanıcıya özel dinamik depolama anahtarları
  const cartStorageKey = user?.id ? `cart_user_${user.id}` : 'cart_guest';
  const wishlistStorageKey = user?.id ? `wishlist_user_${user.id}` : 'wishlist_guest';

  // Kullanıcı değiştikçe sepeti ilgili kullanıcı anahtarından yükle
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(cartStorageKey);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Cart LocalStorage okuma hatası:', error);
      return [];
    }
  });

  // Kullanıcı değiştikçe favorileri ilgili kullanıcı anahtarından yükle
  const [wishlist, setWishlist] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem(wishlistStorageKey);
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error('Wishlist LocalStorage okuma hatası:', error);
      return [];
    }
  });

  // Kullanıcı oturumu değiştiğinde (Giriş/Çıkış) sepet ve favorileri yenile
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(cartStorageKey);
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } catch (e) {
      setCart([]);
    }

    try {
      const savedWishlist = localStorage.getItem(wishlistStorageKey);
      setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
    } catch (e) {
      setWishlist([]);
    }
  }, [user?.id]);

  // Sepet değiştikçe aktif kullanıcının key'ine kaydet
  useEffect(() => {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  }, [cart, cartStorageKey]);

  // Favoriler değiştikçe aktif kullanıcının key'ine kaydet
  useEffect(() => {
    localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlist));
  }, [wishlist, wishlistStorageKey]);

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

  // Sepetteki Ürün Adedini Düşür
  const decreaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
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

  // Favorilere Ekle / Çıkar
  const toggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      if (exists) {
        return prevWishlist.filter((item) => item.id !== product.id);
      }
      return [...prevWishlist, product];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        decreaseQuantity,
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