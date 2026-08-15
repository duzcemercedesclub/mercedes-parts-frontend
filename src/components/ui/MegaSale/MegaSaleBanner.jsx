import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './MegaSaleBanner.css';

const MegaSaleBanner = () => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Veritabanından Mega Banner Verisini Çekme
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setLoading(true);
        // Express backend portunuza (5000) yönlendirilmiş mutlak API isteği
        const response = await axios.get(`${apiUrl}/api/mega-banners`);
        
        // Backend 'ORDER BY id DESC' sıralamasıyla gönderdiği için en güncel banner ilk elemandır
        if (response.data && response.data.length > 0) {
          setBanner(response.data[0]);
        }
      } catch (error) {
        console.error('Mega banner yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  // Yüklenme Durumu Arayüzü
  if (loading) {
    return (
      <section className="mega-sale-section">
        <div className="sale-banner" style={{ justifyContent: 'center', color: '#ffffff' }}>
          <p>Yükleniyor...</p>
        </div>
      </section>
    );
  }

  // Veritabanında tanımlı banner yoksa boş alan kalmaması için koruma
  if (!banner) {
    return null;
  }

  return (
    <section className="mega-sale-section">
      <div className="sale-banner">
        
        {/* İçerik Alanı */}
        <div className="sale-content">
          {/* Üst Kategori Tag / Altyazı (Örn: MEGA SALE) */}
          {banner.subtitle && (
            <span className="mega-tag">{banner.subtitle}</span>
          )}
          
          {/* Ana Başlık (dangerouslySetInnerHTML sayesinde satır satır bölme (br) etiketleri korunur) */}
          <h2 
            className="sale-title" 
            dangerouslySetInnerHTML={{ __html: banner.title }}
          ></h2>
          
          {/* İndirim Oranı veya Kampanya Metni (Örn: 22% off) */}
          {banner.discount_text && (
            <p style={{ color: '#ffb703', fontWeight: 'bold', marginBottom: '25px', fontSize: '18px' }}>
              {banner.discount_text}
            </p>
          )}
          
          {/* Dinamik Link Butonu */}
          <Link to={banner.btn_link || '/shop'} className="btn-shop">
            Koleksiyonu İncele
          </Link>
        </div>

        {/* Veritabanından Gelen Görsel Alanı (Cloudinary veya Fallback) */}
        <img 
          src={banner.image_url || 'https://via.placeholder.com/1200x400?text=G%C3%B6rsel+Bulunamadı'} 
          alt={banner.title || "Mega Sale Banner"} 
          className="sale-bg-img" 
        />
        
      </div>
    </section>
  );
};

export default MegaSaleBanner;