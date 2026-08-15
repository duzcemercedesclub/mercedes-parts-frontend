import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeaturesSection.css';

const FeaturesSection = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  // Veritabanındaki Özellikleri Çekme
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/features`);
        
        const incomingFeatures = Array.isArray(response.data) ? response.data : [];
        setFeatures(incomingFeatures);
      } catch (error) {
        console.error('Özellik kartları yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  // Yükleme sırasında boş alan kalmaması için bekleme görseli/yazısı
  if (loading) {
    return (
      <section className="features-section">
        <div className="container" style={{ textAlign: 'center', color: '#777' }}>
          <p>Yükleniyor...</p>
        </div>
      </section>
    );
  }

  // Veritabanında özellik kartı tanımlanmamışsa bölümü hiç gösterme
  if (features.length === 0) {
    return null;
  }

  return (
    <section className="features-section">
      <div className="container">
        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.id}>
              <div className="icon-wrapper">
                <i className={feature.icon}></i>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;