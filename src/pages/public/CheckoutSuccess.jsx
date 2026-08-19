import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CheckoutSuccess = () => {
  const { cart, clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Çift istek atılmasını engellemek için kontrol
  const hasRun = useRef(false);

  // API BASE URL TANIMLAMASI
  const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://mercedes-parts-backend.onrender.com';

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    // İstek zaten gönderildiyse tekrar çalıştırma
    if (hasRun.current) return;
    hasRun.current = true;

    const confirmOrder = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/checkout/confirm-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            items: cart,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setOrderNumber(data.orderNumber);
          if (clearCart) clearCart();
        } else {
          setError(data.error || 'Sipariş kaydedilirken bir sorun oluştu.');
        }
      } catch (err) {
        console.error('Sipariş Onay Hatası:', err);
        setError('Sunucuya bağlanılamadı.');
      } finally {
        setLoading(false);
      }
    };

    confirmOrder();
  }, [sessionId, apiUrl]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Siparişiniz işleniyor, lütfen bekleyiniz...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <i className="fas fa-circle-xmark" style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '20px' }}></i>
        <h2>Ödeme Doğrulama Hatası</h2>
        <p style={{ color: '#666', marginTop: '10px' }}>{error}</p>
        <Link to="/cart" style={{ marginTop: '20px', display: 'inline-block', padding: '10px 20px', backgroundColor: '#1a1a1a', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
          Sepete Dön
        </Link>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <i className="fas fa-circle-check" style={{ fontSize: '64px', color: '#52c41a', marginBottom: '20px' }}></i>
      <h2>Siparişiniz Başarıyla Alındı!</h2>
      <p style={{ fontSize: '18px', color: '#333', marginTop: '10px' }}>
        Sipariş Numarası: <strong>#{orderNumber}</strong>
      </p>
      <p style={{ marginTop: '5px', color: '#666' }}>
        Ödemeniz Stripe üzerinden başarıyla gerçekleşti ve veritabanına kaydedildi.
      </p>
      <div style={{ marginTop: '30px' }}>
        <Link to="/" style={{ padding: '12px 24px', backgroundColor: '#1a1a1a', color: '#fff', borderRadius: '4px', textDecoration: 'none' }}>
          Alışverişe Devam Et
        </Link>
      </div>
    </div>
  );
};

export default CheckoutSuccess;