import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../../components/ui/Product/ProductCard.jsx';
import './Shop.css';

const ITEMS_PER_PAGE = 20;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // Veritabanı Veri State'leri
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbBrands, setDbBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dinamik Fiyat Limit State'leri
  const [maxProductPrice, setMaxProductPrice] = useState(0); 
  const [maxPrice, setMaxPrice] = useState(0); 

  // Filtre ve Sıralama State'leri
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  
  // Şase No (VIN) Sorgu State'leri
  const [vinQuery, setVinQuery] = useState('');
  const [activeVinFilter, setActiveVinFilter] = useState('');
  const [vinLoading, setVinLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('All');
    }
  }, [categoryParam]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [selectedCategory, selectedBrand, maxPrice, sortBy, activeVinFilter, searchParam, currentPage]);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          axios.get(`${apiUrl}/api/products`),
          axios.get(`${apiUrl}/api/categories`),
          axios.get(`${apiUrl}/api/brands`)
        ]);

        const incomingProducts = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.products || []);
        const incomingCategories = Array.isArray(categoriesRes.data) ? categoriesRes.data : (categoriesRes.data?.categories || []);
        const incomingBrands = Array.isArray(brandsRes.data) ? brandsRes.data : (brandsRes.data?.brands || []);

        setProducts(incomingProducts);
        setDbCategories(incomingCategories);
        setDbBrands(incomingBrands);

        if (incomingProducts.length > 0) {
          const highestPrice = incomingProducts.reduce((max, item) => {
            const itemPrice = Number(item.sale_price || item.price || 0);
            return itemPrice > max ? itemPrice : max;
          }, 0);

          const ceiledMax = Math.ceil(highestPrice);
          setMaxProductPrice(ceiledMax || 1000);
          setMaxPrice(ceiledMax || 1000); 
        }

      } catch (error) {
        console.error('Mağaza verileri yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [apiUrl]);

  const categories = useMemo(() => {
    if (!Array.isArray(dbCategories)) return ['All'];
    return ['All', ...dbCategories.map(cat => cat.name || cat)];
  }, [dbCategories]);

  const brands = useMemo(() => {
    if (!Array.isArray(dbBrands)) return ['All'];
    return ['All', ...dbBrands.map(brand => brand.name || brand)];
  }, [dbBrands]);

  // Yardımcı: Filtre Değiştiğinde Sayfayı 1'e Sıfırlayan Parametre Güncelleyici
  const updateParams = (mutator) => {
    const newParams = new URLSearchParams(searchParams);
    mutator(newParams);
    newParams.delete('page'); // Filtre değiştiğinde 1. sayfaya dön
    setSearchParams(newParams);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    updateParams((params) => {
      if (cat === 'All') {
        params.delete('category');
      } else {
        params.set('category', cat);
      }
    });
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    if (newPage <= 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', newPage.toString());
    }
    setSearchParams(newParams);
  };

  // Şase No Arama Fonksiyonu
  const handleVinSearch = async (e) => {
    e.preventDefault();
    const query = vinQuery.trim();
    if (!query) return;

    try {
      setVinLoading(true);
      const res = await axios.get(`${apiUrl}/api/products/vin/${query}`);
      setActiveVinFilter(query);
      handlePageChange(1);
      if (res.data && res.data.length === 0) {
        alert('Bu şase numarasına ait uyumlu yedek parça bulunamadı.');
      }
    } catch (error) {
      console.error('Şase numarası ile arama yapılırken hata oluştu:', error);
      setActiveVinFilter(query);
    } finally {
      setVinLoading(false);
    }
  };

  const clearVinFilter = () => {
    setVinQuery('');
    setActiveVinFilter('');
    handlePageChange(1);
  };

  // Filtreleme ve Sıralama Mantığı
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    
    let result = [...products];

    // Aktif ürünleri süz
    result = result.filter(p => p && (p.is_active === 1 || p.is_active === true || p.is_active === '1'));

    // Arama Kelimesi Filtresi
    if (searchParam) {
      result = result.filter(p => 
        p.name?.toLowerCase().includes(searchParam.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchParam.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchParam.toLowerCase())
      );
    }

    // Şase No (VIN) Filtresi
    if (activeVinFilter) {
      result = result.filter(p => {
        const rawVin = p.vin_code || p.vin_codes || p.compatible_vins;
        if (!rawVin) return false;
        
        if (Array.isArray(rawVin)) {
          return rawVin.some(v => String(v).toLowerCase().includes(activeVinFilter.toLowerCase()));
        }
        return String(rawVin).toLowerCase().includes(activeVinFilter.toLowerCase());
      });
    }

    // Kategori Filtresi
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category_name === selectedCategory);
    }

    // Marka Filtresi
    if (selectedBrand !== 'All') {
      result = result.filter(p => p.brand_name === selectedBrand);
    }

    // Fiyat Filtresi
    result = result.filter(p => Number(p.sale_price || p.price || 0) <= maxPrice);

    // Sıralama
    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.sale_price || a.price || 0) - Number(b.sale_price || b.price || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.sale_price || b.price || 0) - Number(a.sale_price || a.price || 0));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [products, selectedCategory, selectedBrand, maxPrice, sortBy, activeVinFilter, searchParam]);

  // Sayfalama Hesaplamaları (20 Ürün Limitli)
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  if (loading) {
    return (
      <div className="shop-loading-container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '20px', fontWeight: '500', color: '#666' }}>Mağaza Parçaları Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="shop-page container">
      <div className="shop-breadcrumb">
        <h2>Mağaza {selectedCategory !== 'All' ? `> ${selectedCategory}` : ''}</h2>
      </div>

      <div className="shop-layout">
        {/* SOL FİLTRE PANELİ */}
        <aside className="shop-sidebar">
          
          {/* Şase Numarası Widget'ı */}
          <div className="filter-widget vin-widget">
            <h4>Şase No ile Ara <i className="fas fa-car" style={{ fontSize: '14px', color: '#2b4c7e' }}></i></h4>
            <form onSubmit={handleVinSearch}>
              <div className="vin-input-group">
                <input 
                  type="text" 
                  placeholder="17 Haneli Şase No (VIN)" 
                  value={vinQuery}
                  onChange={(e) => setVinQuery(e.target.value.toUpperCase())}
                  maxLength={17}
                  className="vin-input"
                />
                <button type="submit" className="vin-submit-btn" disabled={vinLoading}>
                  {vinLoading ? '...' : <i className="fas fa-search"></i>}
                </button>
              </div>
            </form>
            {activeVinFilter && (
              <div className="active-vin-badge">
                <span>Şase: <strong>{activeVinFilter}</strong></span>
                <button type="button" onClick={clearVinFilter} className="clear-vin-btn">&times;</button>
              </div>
            )}
          </div>

          {/* Kategori Filtresi */}
          <div className="filter-widget">
            <h4>Kategoriler</h4>
            <ul>
              {categories.map((cat, idx) => (
                <li 
                  key={idx} 
                  className={selectedCategory === cat ? 'active' : ''} 
                  onClick={() => handleCategorySelect(cat)}
                  style={{ cursor: 'pointer' }}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          {/* Fiyat Filtresi */}
          <div className="filter-widget">
            <h4>Maksimum Fiyat: <span className="price-val">{maxPrice} TL</span></h4>
            <input 
              type="range" 
              min="0" 
              max={maxProductPrice || 100} 
              step="1"
              value={maxPrice} 
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                handlePageChange(1);
              }}
              className="price-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginTop: '5px' }}>
              <span>0 TL</span>
              <span>{maxProductPrice} TL</span>
            </div>
          </div>

          {/* Marka Filtresi */}
          <div className="filter-widget">
            <h4>Markalar</h4>
            <ul>
              {brands.map((brand, idx) => (
                <li 
                  key={idx} 
                  className={selectedBrand === brand ? 'active' : ''} 
                  onClick={() => {
                    setSelectedBrand(brand);
                    handlePageChange(1);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {brand}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* SAĞ ÜRÜN LİSTELEME ALANI */}
        <main className="shop-content">
          <div className="shop-toolbar">
            <p className="product-count">
              Toplam <strong>{filteredProducts.length}</strong> üründen <strong>{paginatedProducts.length}</strong> tanesi gösteriliyor
            </p>
            <div className="sort-wrapper">
              <label htmlFor="sort">Sırala:</label>
              <select id="sort" value={sortBy} onChange={(e) => {
                setSortBy(e.target.value);
                handlePageChange(1);
              }}>
                <option value="default">Varsayılan</option>
                <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                <option value="name-asc">Ürün Adı: A-Z</option>
              </select>
            </div>
          </div>

          {paginatedProducts.length > 0 ? (
            <>
              <div className="shop-products-grid">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* SAYFALAMA KONTROLLERİ */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="pagination-btn"
                  >
                    &laquo; Önceki
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="pagination-btn"
                  >
                    Sonraki &raquo;
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-products" style={{ textAlign: 'center', padding: '40px 0' }}>
              <i className="fas fa-box-open" style={{ fontSize: '48px', color: '#ccc', marginBottom: '15px' }}></i>
              <p>Aradığınız kriterlere veya şase numarasına uygun parça bulunamadı.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;