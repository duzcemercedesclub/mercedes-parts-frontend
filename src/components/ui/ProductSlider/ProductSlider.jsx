import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import ProductCard from '../Product/ProductCard.jsx';
import './ProductSlider.css';

const ProductSlider = ({ title, tabs, filterType = 'popular' }) => {
  const gridRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Varsayılan aktif sekme
  const [activeTab, setActiveTab] = useState(tabs && tabs.length > 0 ? tabs[0] : 'Tüm Ürünler');
  
  // Veri Durumları
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sağa/Sola Kaydırma
  const scrollLeft = () => {
    if (gridRef.current) {
      gridRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (gridRef.current) {
      gridRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Backend'den Ürünleri Çekme
  useEffect(() => {
    const fetchSliderProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/products`);
        
        const incomingProducts = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.products || []);
          
        setProducts(incomingProducts);
      } catch (error) {
        console.error('Slider ürünleri getirilirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSliderProducts();
  }, []);

  // FİLTRELEME MANTIĞI (İndirim Durumu ve Sıfır/Çıkma Parça Sekme Kontrolü)
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.filter((product) => {
      // 1. Ürün Aktif mi?
      const isActive = product.is_active === 1 || product.is_active === true || product.is_active === '1';
      if (!isActive) return false;

      // 2. İndirimli Ürünler Bölümü Filtresi
      if (filterType === 'discounted') {
        const discount = Number(product.discount_rate || 0);
        if (discount <= 0) return false;
      }

      // 3. Sekme Filtrelemesi (Sıfır Parçalar / Çıkma Parçalar / Tüm Ürünler)
      const cond = product.condition_type || 'new';

      if (activeTab === 'Sıfır Parçalar') {
        return cond === 'new';
      } else if (activeTab === 'Çıkma Parçalar' || activeTab === '2. El Parçalar') {
        return cond === 'used';
      }

      // 'Tüm Ürünler' seçiliyse tüm aktif ürünler geçer
      return true;
    });
  }, [products, activeTab, filterType]);

  return (
    <section className="top-products-section">
      <div className="container">
        
        {/* Başlık ve Sekmeler */}
        <div className="section-header">
          <h2 className="section-heading">{title}</h2>
          <ul className="product-tabs">
            {tabs.map((tab, index) => (
              <li 
                key={index} 
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </li>
            ))}
          </ul>
        </div>

        {/* Ürün Listesi */}
        {loading ? (
          <div className="slider-loading" style={{ textAlign: 'center', padding: '50px 0', color: '#666' }}>
            <p>Ürünler yükleniyor...</p>
          </div>
        ) : (
          <div className="product-slider-wrapper">
            <button className="prod-nav-btn prod-prev" onClick={scrollLeft} aria-label="Geri">
              <i className="fas fa-arrow-left"></i>
            </button>
            
            <div className="product-grid" ref={gridRef}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))
              ) : (
                <div 
                  className="no-products-found" 
                  style={{ 
                    width: '100%', 
                    textAlign: 'center', 
                    padding: '30px', 
                    color: '#999',
                    fontStyle: 'italic'
                  }}
                >
                  Bu kategoride veya sekmede listelenecek uygun yedek parça bulunamadı.
                </div>
              )}
            </div>
            
            <button className="prod-nav-btn prod-next" onClick={scrollRight} aria-label="İleri">
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default ProductSlider;