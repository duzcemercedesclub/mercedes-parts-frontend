import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Wishlist = () => {
  const { wishlist, addToCart, toggleWishlist } = useCart();

  // Sepete Ekleme Fonksiyonu (İndirimli Fiyat Kontrollü)
  const handleAddToCart = (product) => {
    const productStock = product?.stock !== undefined ? Number(product.stock) : 999;
    const discountRate = product?.discount_rate !== undefined ? Number(product.discount_rate) : 0;
    const originalPrice = product?.price !== undefined ? Number(product.price) : 0;
    const salePrice = product?.sale_price !== undefined ? Number(product.sale_price) : originalPrice;
    
    // İndirim kontrolü: İndirim oranı > 0 ise veya indirimli fiyat orijinalden düşükse
    const hasDiscount = discountRate > 0 || (product?.sale_price && Number(product.sale_price) < originalPrice);
    const effectivePrice = hasDiscount ? salePrice : originalPrice;

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
    <div className="container" style={{ padding: '30px 20px', minHeight: '65vh' }}>
      <h2>Favorilerim</h2>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        <Link to="/" style={{ color: '#2b4c7e', textDecoration: 'none' }}>Anasayfa</Link> / Favorilerim
      </p>

      {wishlist && wishlist.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {wishlist.map((product) => {
            const productStock = product?.stock !== undefined ? Number(product.stock) : 0;
            const discountRate = product?.discount_rate !== undefined ? Number(product.discount_rate) : 0;
            const originalPrice = product?.price !== undefined ? Number(product.price) : 0;
            const salePrice = product?.sale_price !== undefined ? Number(product.sale_price) : originalPrice;
            
            const hasDiscount = discountRate > 0 || (product?.sale_price && Number(product.sale_price) < originalPrice);

            return (
              <div 
                key={product.id} 
                style={{ 
                  border: '1px solid #e5e5e5', 
                  borderRadius: '8px', 
                  padding: '15px', 
                  position: 'relative', 
                  backgroundColor: '#fff', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between' 
                }}
              >
                {/* İndirim Rozeti (Badge) */}
                {hasDiscount && (
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: '#d0021b',
                    color: 'white',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    zIndex: 1
                  }}>
                    %{discountRate > 0 ? discountRate : Math.round(((originalPrice - salePrice) / originalPrice) * 100)} İNDİRİM
                  </span>
                )}

                {/* Favorilerden Çıkar Butonu */}
                <button 
                  onClick={() => toggleWishlist(product)} 
                  style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    background: 'none', 
                    border: 'none', 
                    color: '#d0021b', 
                    fontSize: '20px', 
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                  title="Favorilerden Kaldır"
                >
                  <i className="fas fa-heart"></i>
                </button>

                <div>
                  <Link to={`/product/${product.id}`} style={{ display: 'block', height: '160px', marginBottom: '10px', marginTop: '15px' }}>
                    <img 
                      src={product.image_url || product.imgUrl || 'https://via.placeholder.com/200'} 
                      alt={product.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </Link>

                  <h4 style={{ fontSize: '14px', margin: '10px 0', color: '#333', height: '38px', overflow: 'hidden' }}>
                    {product.name}
                  </h4>

                  {/* Fiyat Alanı (İndirimli vs Orijinal Fiyat) */}
                  <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                    {hasDiscount ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: '#888', textDecoration: 'line-through' }}>
                          {originalPrice.toFixed(2)} TL
                        </span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#d0021b' }}>
                          {salePrice.toFixed(2)} TL
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2b4c7e' }}>
                        {originalPrice.toFixed(2)} TL
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => handleAddToCart(product)}
                  disabled={productStock === 0}
                  style={{ 
                    marginTop: '10px', 
                    width: '100%', 
                    padding: '10px', 
                    backgroundColor: productStock === 0 ? '#ccc' : '#1a1a1a', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: productStock === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {productStock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
          <i className="far fa-heart" style={{ fontSize: '48px', color: '#ccc', marginBottom: '15px' }}></i>
          <h3>Favori listeniz boş.</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>Beğendiğiniz ürünleri kalp butonuna basarak favorilerinize ekleyebilirsiniz.</p>
          <Link to="/" style={{ padding: '10px 20px', backgroundColor: '#2b4c7e', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Ürünleri Keşfet
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;