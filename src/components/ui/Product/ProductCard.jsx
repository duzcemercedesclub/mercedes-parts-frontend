import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext.jsx';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const cartContext = useCart();
  const addToCart = cartContext?.addToCart || (() => {});
  const toggleWishlist = cartContext?.toggleWishlist || (() => {});
  const wishlist = cartContext?.wishlist || [];
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  if (!product) return null;

  // Güvenli veri dönüşümleri
  const productStock = product?.stock !== undefined ? Number(product.stock) : 0;
  const discountRate = product?.discount_rate !== undefined ? Number(product.discount_rate) : 0;
  const originalPrice = product?.price !== undefined ? Number(product.price) : 0;
  const salePrice = product?.sale_price !== undefined ? Number(product.sale_price) : originalPrice;

  const isFavorite = wishlist.some((item) => item.id === product?.id);
  const hasDiscount = discountRate > 0;

  // Sepete iletilecek geçerli fiyat
  const effectivePrice = hasDiscount ? salePrice : originalPrice;

  // Sepete eklerken Marka ve Durum (Condition) bilgilerini de paketliyoruz
  const handleAddToCart = () => {
    const itemToCart = {
      ...product,
      id: product.id || product._id,
      name: product.name,
      price: effectivePrice,
      originalPrice: originalPrice,
      hasDiscount: hasDiscount,
      imgUrl: product.image_url || product.imgUrl || 'https://via.placeholder.com/260',
      brand: product.brand_name || product.brand || 'Mercedes OEM',
      condition_type: product.condition_type || product.condition || 'new'
    };
    addToCart(itemToCart);
  };

  return (
    <div className="product-card">
      {/* Ürün Görsel Alanı */}
      <div className="product-img-area">
        <div className="badges">
          {productStock === 0 && <span className="badge-sale" style={{ backgroundColor: '#888' }}>TÜKENDİ</span>}
          {hasDiscount && productStock > 0 && <span className="badge-sale">-{discountRate}%</span>}
        </div>
        
        <div className="action-icons">
          <button 
            onClick={() => toggleWishlist(product)} 
            style={{ color: isFavorite ? '#d0021b' : '#333' }}
            aria-label="Favorilere Ekle"
          >
            <i className={isFavorite ? "fas fa-heart" : "far fa-heart"}></i>
          </button>
          <button aria-label="Karşılaştır"><i className="fas fa-right-left"></i></button>
          <button aria-label="Hızlı Bakış"><i className="far fa-eye"></i></button>
        </div>

        <Link to={`/product/${product.id}`} className="product-img-link">
          <img src={product.image_url || product.imgUrl || 'https://via.placeholder.com/260'} alt={product.name} />
        </Link>
      </div>

      {/* Ürün Bilgi Alanı */}
      <div className="product-info">
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h4 className="product-name">{product.name}</h4>
        </Link>
        
        <div className="product-price">
          {hasDiscount && <span className="old-price">{originalPrice.toFixed(2)} TL</span>}
          <span className={`new-price ${!hasDiscount ? 'black-price' : ''}`}>
            {salePrice.toFixed(2)} TL
          </span>
        </div>

        {/* Sepete Ekle Butonu */}
        <button 
          onClick={handleAddToCart}
          disabled={productStock === 0}
          className="add-to-cart-btn"
        >
          {productStock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;