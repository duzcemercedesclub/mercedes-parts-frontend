import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './HeroSlider.css';

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // 1. Veritabanından Slider Verilerini Çekme
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        setLoading(true);
        // Backend portunuza (5000) yönlendirilmiş mutlak (absolute) API isteği
        const response = await axios.get(`${apiUrl}/api/sliders`);
        
        const incomingSlides = Array.isArray(response.data) ? response.data : [];
        setSlides(incomingSlides);
      } catch (error) {
        console.error('Slider verileri yüklenirken bir hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  // Slide Değiştirme Fonksiyonları
  const nextSlide = () => {
    setSlides((prevSlides) => {
      if (prevSlides.length === 0) return prevSlides;
      setCurrentSlide((prevIndex) => (prevIndex === prevSlides.length - 1 ? 0 : prevIndex + 1));
      return prevSlides;
    });
  };

  const prevSlide = () => {
    setSlides((prevSlides) => {
      if (prevSlides.length === 0) return prevSlides;
      setCurrentSlide((prevIndex) => (prevIndex === 0 ? prevSlides.length - 1 : prevIndex - 1));
      return prevSlides;
    });
  };

  // 2. Otomatik Slayt Geçişi (AutoPlay - 6 Saniyede Bir)
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    // Bellek sızıntılarını önlemek için temizleme fonksiyonu
    return () => clearInterval(interval);
  }, [slides, currentSlide]);

  // Yüklenme Durumu Arayüzü
  if (loading) {
    return (
      <section className="hero-slider" style={{ backgroundColor: '#0b1a2a' }}>
        <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '500' }}>
          Slaytlar yükleniyor...
        </div>
      </section>
    );
  }

  // Veritabanında slayt yoksa arayüzün çökmesini önleme
  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="hero-slider">
      {slides.map((slide, index) => {
        // Cloudinary veya yerel resim adresini arka plan resmi olarak tanımlıyoruz
        const slideStyle = {
          backgroundImage: slide.bg_image ? `url(${slide.bg_image})` : 'none',
          backgroundColor: '#0b1a2a' // Resim yüklenene kadar veya resim yoksa fallback renk
        };

        return (
          <div 
            key={slide.id} 
            className={`slide ${index === currentSlide ? 'active' : ''}`} 
            style={slideStyle}
          >
            <div className="hero-overlay"></div>
            <div className="hero-content">
              {/* Alt Başlık */}
              {slide.subtitle && <span className="subtitle">{slide.subtitle}</span>}
              
              {/* Ana Başlık (HTML etiketlerini korumak için dangerouslySetInnerHTML) */}
              <h1 className="title" dangerouslySetInnerHTML={{ __html: slide.title }}></h1>
              
              {/* İndirim Oranı / Kampanya Metni */}
              {slide.discount && (
                <p className="brands" style={{ color: '#ffb703', fontWeight: 'bold', fontSize: '18px' }}>
                  {slide.discount}
                </p>
              )}
              
              {/* Yönlendirme Butonu */}
              <Link to={slide.btn_link || '/shop'} className="btn-outline">
                Koleksiyonu İncele
              </Link>
            </div>
          </div>
        );
      })}
      
      {/* Kontrol Butonları (Yalnızca 1'den fazla slayt varsa gösterilir) */}
      {slides.length > 1 && (
        <>
          <button className="slider-btn prev-btn" onClick={prevSlide} aria-label="Önceki Slayt">
            <i className="fas fa-arrow-left-long"></i>
          </button>
          <button className="slider-btn next-btn" onClick={nextSlide} aria-label="Sonraki Slayt">
            <i className="fas fa-arrow-right-long"></i>
          </button>
          
          {/* Slayt Noktaları (Dots) */}
          <div className="slider-dots">
            {slides.map((_, index) => (
              <span 
                key={index} 
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              ></span>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSlider;