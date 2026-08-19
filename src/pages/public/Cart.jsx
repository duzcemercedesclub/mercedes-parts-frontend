import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useCart();
  const { user, token, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // Tek geçerli kupon objesi
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Ara toplam hesabı
  const subtotal = cart.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);

  // Kupon İndirimi Hesabı (Yüzde veya Sabit TL)
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * Number(appliedCoupon.discount_amount)) / 100;
    } else {
      discountAmount = Number(appliedCoupon.discount_amount);
    }
  }

  // Minimum harcama altı kalırsa kuponu otomatik kaldır
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.min_spend > 0 && subtotal < appliedCoupon.min_spend) {
      alert(`Sepet tutarı minimum ${appliedCoupon.min_spend} TL altına düştüğü için kupon kaldırıldı.`);
      setAppliedCoupon(null);
    }
  }, [subtotal, appliedCoupon]);

  const shippingCost = subtotal > 1500 || subtotal === 0 ? 0 : 150;
  const totalAmount = Math.max(0, subtotal + shippingCost - discountAmount);

  // KUPON UYGULAMA (Sadece 1 Kupon İznine Göre)
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      alert('Lütfen geçerli bir kupon kodu giriniz.');
      return;
    }

    if (!token) {
      alert('Kupon kullanabilmek için lütfen giriş yapınız.');
      navigate('/login');
      return;
    }

    try {
      setCouponLoading(true);
      
      // Backend kupon doğrulama servisi
      const response = await axios.post(
        `${apiUrl}/api/coupons/validate`,
        {
          code: couponCode.trim(),
          subtotal: subtotal
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Kullanıcının daha önceden uygulanmış kuponu varsa üzerine yazar (Her kullanıcının 1 kupon hakkı)
        setAppliedCoupon(response.data.coupon);
        setCouponCode('');
        alert(`"${response.data.coupon.code}" kuponu başarıyla uygulandı!`);
      }
    } catch (error) {
      console.error('Kupon Doğrulama Hatası:', error);
      alert(error.response?.data?.message || 'Kupon kodu geçersiz veya süresi dolmuş.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const renderConditionText = (cond) => {
    if (!cond) return 'Sıfır Parça';
    if (cond === 'new' || cond === '0') return 'Sıfır Parça';
    if (cond === 'used' || cond === 'second_hand') return 'Çıkma Parça';
    return cond;
  };

  // ÖDEME ADIMINA GEÇİŞ (Stripe/Ödeme Sayfası)
  const handleCheckout = async () => {
    // 1. Oturum Kontrolü
    if (!token || !user) {
      alert('Alışverişi tamamlamak için lütfen giriş yapınız.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      // 2. Güncel profil ve adres bilgisi kontrolü
      let currentUser = user;
      if (fetchUserProfile) {
        const refreshedUser = await fetchUserProfile();
        if (refreshedUser) currentUser = refreshedUser;
      }

      const checkValidData = (data) => {
        if (!data) return false;
        if (typeof data === 'string') {
          const trimmed = data.trim();
          return trimmed !== '' && trimmed !== '{}' && trimmed !== 'null';
        }
        if (typeof data === 'object') {
          return Object.keys(data).length > 0;
        }
        return false;
      };

      const hasAddress =
        checkValidData(currentUser.address) ||
        checkValidData(currentUser.parsedAddress);

      const hasBilling =
        checkValidData(currentUser.billing_address) ||
        checkValidData(currentUser.billingAddress) ||
        checkValidData(currentUser.parsedBilling);

      if (!hasAddress || !hasBilling) {
        alert('Sipariş verebilmek için lütfen adres ve fatura bilgilerinizi eksiksiz doldurunuz.');
        navigate('/hesabim/kullanici-bilgilerim');
        setLoading(false);
        return;
      }

      // 3. Ödeme Oturumu Oluştur (İndirimler Dahil)
      const response = await fetch(`${apiUrl}/api/checkout/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          user: currentUser,
          shippingCost,
          discountAmount,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          totalAmount,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Ödeme oturumu başlatılamadı: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Ödeme Hatası:', error);
      alert('Ödeme sunucusuna bağlanırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-page container">
      <div className="cart-breadcrumb">
        <h2>Alışveriş Sepeti</h2>
        <p><Link to="/">Anasayfa</Link> / Sepetim</p>
      </div>

      {cart.length > 0 ? (
        <div className="cart-layout">
          <div className="cart-table-container">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Fiyat</th>
                  <th>Adet</th>
                  <th>Toplam</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} className="cart-item-row">
                    <td className="td-product">
                      <div className="cart-product-info">
                        <img 
                          src={item.imgUrl || item.image_url || 'https://via.placeholder.com/80'} 
                          alt={item.name} 
                        />
                        <div>
                          <Link to={`/product/${item.id}`} className="cart-prod-name">
                            {item.name}
                          </Link>
                          <p className="cart-prod-brand">Marka: {item.brand || item.brand_name || 'Mercedes OEM'}</p>
                          <p className="cart-prod-condition" style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                            Durum: {renderConditionText(item.condition_type || item.condition)}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="td-price">
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px', display: 'block' }}>
                          {Number(item.originalPrice).toFixed(2)} TL
                        </span>
                      )}
                      <span>{Number(item.price).toFixed(2)} TL</span>
                    </td>
                    
                    <td className="td-quantity">
                      <div className="cart-qty-selector">
                        <button onClick={() => decreaseQuantity(item.id)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => addToCart(item)}>+</button>
                      </div>
                    </td>
                    
                    <td className="td-total">
                      {(Number(item.price) * item.quantity).toFixed(2)} TL
                    </td>
                    
                    <td className="td-remove">
                      <button className="btn-remove-item" onClick={() => removeFromCart(item.id)}>
                        <i className="far fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* KUPON GİRİŞ VE UYGULANAN KUPON ALANI */}
            <div className="cart-coupon-section" style={{ marginTop: '20px' }}>
              {!appliedCoupon ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Kupon Kodu Giriniz" 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', flex: '1', maxWidth: '300px' }}
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    style={{ backgroundColor: '#1a1a1a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {couponLoading ? 'Kontrol Ediliyor...' : 'Kupon Uygula'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', backgroundColor: '#e6f7ff', border: '1px dashed #1890ff', padding: '10px 16px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#0050b3' }}>
                    Uygulanan Kupon: <strong>{appliedCoupon.code}</strong>
                  </span>
                  <button 
                    onClick={handleRemoveCoupon} 
                    style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Kaldır
                  </button>
                </div>
              )}
            </div>

            <div className="cart-actions-bottom">
              <Link to="/" className="btn-continue-shopping">
                <i className="fas fa-arrow-left"></i> Alışverişe Devam Et
              </Link>
            </div>
          </div>

          <div className="cart-summary-sidebar">
            <div className="summary-card">
              <h3>Sipariş Özeti</h3>
              
              <div className="summary-row">
                <span>Ara Toplam</span>
                <strong>{subtotal.toFixed(2)} TL</strong>
              </div>
              
              {discountAmount > 0 && (
                <div className="summary-row" style={{ color: '#d0021b' }}>
                  <span>Kupon İndirimi ({appliedCoupon?.code})</span>
                  <strong>-{discountAmount.toFixed(2)} TL</strong>
                </div>
              )}

              <div className="summary-row">
                <span>Kargo Ücreti</span>
                <span>{shippingCost === 0 ? <strong className="free-shipping">Ücretsiz</strong> : `${shippingCost.toFixed(2)} TL`}</span>
              </div>
              
              {shippingCost > 0 && (
                <p className="shipping-tip">
                  * <strong>{(1500 - subtotal).toFixed(2)} TL</strong> değerinde daha ürün ekleyin, kargo ücretsiz olsun!
                </p>
              )}

              <div className="summary-total-row">
                <span>Genel Toplam</span>
                <span className="grand-total">{totalAmount.toFixed(2)} TL</span>
              </div>

              <button 
                className="btn-checkout" 
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Ödemeye Yönlendiriliyor...' : 'Alışverişi Tamamla'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-cart-wrapper">
          <i className="fas fa-basket-shopping empty-cart-icon"></i>
          <h3>Sepetiniz şu anda boş.</h3>
          <p>Aracınız için en kaliteli yedek parçaları keşfetmek üzere mağazamıza göz atabilirsiniz.</p>
          <Link to="/" className="btn-go-shop">
            Alışverişe Başla
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;