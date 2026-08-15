import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './CategoriesSection.css';

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  // Veritabanından Kategorileri Çekme
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Express backend portunuza (5000) yönlendirilmiş mutlak API isteği
        const response = await axios.get(`${apiUrl}/api/categories`);
        
        // Gelen verinin dizi formatında olup olmadığını doğrulama
        const incomingCategories = Array.isArray(response.data) ? response.data : [];
        setCategories(incomingCategories);
      } catch (error) {
        console.error('Kategoriler yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Yüklenme Durumu Kontrolü
  if (loading) {
    return (
      <div className="categories-section" style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
        <p>Kategoriler optimize ediliyor...</p>
      </div>
    );
  }

  // Veritabanında kategori bulunmuyorsa boş alan kalmaması için koruma
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="categories-section">
      <div className="container">
        <div className="categories-grid">
          {categories.map((category) => (
            <Link 
              to={`/shop?category=${encodeURIComponent(category.name)}`} 
              className="category-card" 
              key={category.id}
            >
              {/* Kategori Görsel Alanı (Cloudinary veya Fallback) */}
              <div className="category-img-wrapper">
                <img 
                  src={category.image_url || 'https://via.placeholder.com/300x150?text=G%C3%B6rsel+Yok'} 
                  alt={category.name} 
                />
              </div>
              {/* Kategori Adı */}
              <h3 className="category-title">{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;