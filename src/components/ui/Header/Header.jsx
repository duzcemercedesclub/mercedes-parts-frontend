import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../../context/CartContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import './Header.css';

const Header = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, logout } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  const { cart, wishlist } = useCart();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    logo_text_small: 'DUZCE',
    logo_text_large: 'MERCEDESCLUB',
    use_image_logo: 0,
    logo_url: null,
    promo_text: '100 TL ve üzeri siparişlerde kargo bedava!',
    currency: 'TL ₺',
    show_facebook: 1,
    facebook_url: '#',
    show_instagram: 1,
    instagram_url: '#',
    show_twitter: 1,
    twitter_url: '#'
  });

  const totalCartItems = cart ? cart.reduce((total, item) => total + item.quantity, 0) : 0;
  const totalWishlistItems = wishlist ? wishlist.length : 0;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/settings`);
        if (response.data) {
          setSettings(response.data);
          if (response.data.title) {
            document.title = response.data.title;
          }
        }
      } catch (error) {
        console.error("Sistem ayarları yüklenemedi:", error);
      }
    };

    loadSettings();

    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [apiUrl]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const response = await axios.get(`${apiUrl}/api/products?search=${encodeURIComponent(searchQuery.trim())}`);
          const products = Array.isArray(response.data) ? response.data : (response.data.products || []);
          setSearchResults(products.slice(0, 5));
        } catch (error) {
          console.error("Arama yapılırken hata oluştu:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const timer = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, apiUrl]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="header">
      
      {/* ÜST BAR (TOP BAR) */}
      <div className="top-bar">
        <div className="social-icons">
          {settings.show_facebook === 1 && (
            <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
          )}
          {settings.show_instagram === 1 && (
            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
          )}
          {settings.show_twitter === 1 && (
            <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer">
              <i className="fab fa-x-twitter"></i>
            </a>
          )}
        </div>

        <div className="promo-text">
          {settings.promo_text}
        </div>

        <div className="currency-selector">
          <span>{settings.currency} <i className="fas fa-chevron-down"></i></span>
        </div>
      </div>

      <div 
        className="main-header"
        style={
          isSticky 
            ? { position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1050, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
            : { position: 'relative', zIndex: 1050 }
        }
      >
        {/* MOBİL HAMBURGER BUTONU */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menüyü Aç/Kapat"
        >
          <i className={isMobileMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </button>

        {/* NAVİGASYON MENÜSÜ */}
        <nav className={`nav-menu ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
          <ul>
            <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Anasayfa</Link></li>
            <li><Link to="/shop" onClick={() => setIsMobileMenuOpen(false)}>Mağaza <i className="fas fa-chevron-down"></i></Link></li>
            <li><Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>İletişim</Link></li>
          </ul>
        </nav>

        {/* DİNAMİK LOGO ALANI */}
        <div className="logo">
          {settings.use_image_logo === 1 && settings.logo_url ? (
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <img 
                src={settings.logo_url} 
                alt="Logo" 
                style={{ maxHeight: '45px', objectFit: 'contain', display: 'block' }} 
              />
            </Link>
          ) : (
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}>
              <div className="logo-small">{settings.logo_text_small}</div>
              <div className="logo-large">{settings.logo_text_large}</div>
            </Link>
          )}
        </div>

        <div className="header-icons">
          <button 
            type="button" 
            className="icon-link search-toggle-btn"
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              setIsMobileMenuOpen(false);
            }}
            title="Ürün Ara"
          >
            <i className="fas fa-search"></i>
          </button>
          
          {user ? (
            <div 
              className="account-menu-wrapper"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div className={`account-trigger-box ${isDropdownOpen ? 'active' : ''}`}>
                <i className="far fa-user account-box-icon"></i>
                <div className="account-text-group">
                  <span className="account-title-text">Hesabım</span>
                  <span className="account-user-name">{user.name ? user.name.toUpperCase() : ''}</span>
                </div>
                <i className={`fas fa-chevron-down account-arrow-icon ${isDropdownOpen ? 'rotate' : ''}`}></i>
              </div>

              {isDropdownOpen && (
                <div className="account-dropdown-menu">
                  <div className="dropdown-pointer-arrow"></div>
                  <Link to="/hesabim/siparislerim" className="dropdown-menu-item" onClick={() => setIsMobileMenuOpen(false)}>Siparişlerim</Link>
                  <Link to="/hesabim/soru-taleplerim" className="dropdown-menu-item" onClick={() => setIsMobileMenuOpen(false)}>Soru ve Taleplerim</Link>
                  <Link to="/hesabim/kullanici-bilgilerim" className="dropdown-menu-item" onClick={() => setIsMobileMenuOpen(false)}>Kullanıcı Bilgilerim</Link>
                  <Link to="/hesabim/degerlendirmelerim" className="dropdown-menu-item" onClick={() => setIsMobileMenuOpen(false)}>Değerlendirmelerim</Link>
                  <Link to="/hesabim/kuponlarim" className="dropdown-menu-item" onClick={() => setIsMobileMenuOpen(false)}>Kuponlarım</Link>
                  <div className="dropdown-item-divider"></div>
                  <button onClick={handleLogout} className="dropdown-menu-item logout-action-btn">
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="icon-link" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="far fa-user"></i>
            </Link>
          )}

          <Link to="/wishlist" className="icon-link wishlist-icon" onClick={() => setIsMobileMenuOpen(false)}>
            <i className="far fa-heart"></i>
            {totalWishlistItems > 0 && <span className="badge">{totalWishlistItems}</span>}
          </Link>

          <Link to="/cart" className="icon-link wishlist-icon" onClick={() => setIsMobileMenuOpen(false)}>
            <i className="fas fa-basket-shopping"></i>
            {totalCartItems > 0 && <span className="badge">{totalCartItems}</span>}
          </Link>
        </div>
      </div>

      {/* ARAMA MODAL */}
      {isSearchOpen && (
        <div className="search-overlay" onClick={() => setIsSearchOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <i className="fas fa-search search-form-icon"></i>
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="Yedek parça, model veya ürün adı yazın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="search-clear-btn" 
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
              <button type="submit" className="search-submit-btn">Ara</button>
              <button 
                type="button" 
                className="search-close-btn" 
                onClick={() => setIsSearchOpen(false)}
                title="Kapat"
              >
                <i className="fas fa-xmark"></i>
              </button>
            </form>

            {searchQuery.trim().length >= 2 && (
              <div className="search-results-dropdown">
                {isSearching ? (
                  <div className="search-loading">
                    <i className="fas fa-spinner fa-spin"></i> Ürünler aranıyor...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="search-results-list">
                    {searchResults.map((product) => {
                      const discountRate = Number(product.discount_rate || 0);
                      const origPrice = Number(product.price || 0);
                      const salePrice = Number(product.sale_price || origPrice);
                      const hasDiscount = discountRate > 0 || (product.sale_price && salePrice < origPrice);

                      return (
                        <Link
                          key={product.id || product._id}
                          to={`/product/${product.id || product._id}`}
                          className="search-result-item"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                        >
                          <img 
                            src={product.image_url || product.imgUrl || 'https://via.placeholder.com/50'} 
                            alt={product.name} 
                            className="search-result-img"
                          />
                          <div className="search-result-info">
                            <span className="search-result-title">{product.name}</span>
                            <div className="search-result-price-box">
                              {hasDiscount ? (
                                <>
                                  <span className="search-old-price">{origPrice.toFixed(2)} TL</span>
                                  <span className="search-sale-price">{salePrice.toFixed(2)} TL</span>
                                </>
                              ) : (
                                <span className="search-regular-price">{origPrice.toFixed(2)} TL</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    <button 
                      type="button" 
                      className="search-view-all-btn"
                      onClick={handleSearchSubmit}
                    >
                      Tüm Sonuçları Gör ("{searchQuery}") <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                ) : (
                  <div className="search-no-results">
                    "{searchQuery}" ile eşleşen ürün bulunamadı.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
};

export default Header;