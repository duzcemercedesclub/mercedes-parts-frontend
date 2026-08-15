import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BrandSection.css';

const BrandSection = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  // Veritabanından Markaları Çekme
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        // Express backend portunuza giden istek[cite: 40]
        const response = await axios.get(`${apiUrl}/api/brands`);
        
        const incomingBrands = Array.isArray(response.data) ? response.data : [];
        setBrands(incomingBrands);
      } catch (error) {
        console.error('Marka verileri yüklenirken bir hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Yüklenme Durumu
  if (loading) {
    return (
      <section className="brand-section">
        <div className="container">
          <p style={{ color: '#666', fontSize: '15px' }}>Markalar yükleniyor...</p>
        </div>
      </section>
    );
  }

  // Marka yoksa boş kalmasın diye render etmiyoruz
  if (brands.length === 0) {
    return null;
  }

  // Sonsuz kayma (marquee) animasyonunun kesintisiz sürmesi için diziyi çiftliyoruz[cite: 41, 42]
  const displayBrands = [...brands, ...brands];

  return (
    <section className="brand-section">
      <div className="container">
        <h2 className="section-heading" style={{ fontSize: '28px', fontWeight: '600', color: '#222' }}>
          En iyi markaları satıyoruz
        </h2>
        <div className="brand-slider">
          <div className="brand-track">
            {displayBrands.map((brand, index) => (
              <div 
                className="brand-item" 
                key={`${brand.id}-${index}`} // Key çakışmasını engellemek için index ekledik
              >
                <img 
                  src={brand.image_url || 'https://via.placeholder.com/160x80?text=Logo+Yok'} 
                  alt={brand.name} 
                  title={brand.name}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSection;