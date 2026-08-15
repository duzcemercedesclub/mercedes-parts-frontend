import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { VisaLogo, MastercardLogo, MaestroLogo, TroyLogo, AmexLogo } from '../../../components/ui/PaymentLogos/PaymentLogos';
import 'react-quill-new/dist/quill.snow.css'; // ReactQuill içeriklerinin stilleri için eklendi
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [settings, setSettings] = useState({
    about_text: 'Yükleniyor...',
    contact_hours: '7/24 Müşteri Hizmetleri Sunmaktayız',
    contact_phone: '0380 123 4567',
    contact_email: 'info@siteniz.com',
    copyright_text: 'Tüm Hakları Saklıdır.',
    show_visa: 1,
    show_mastercard: 1,
    show_maestro: 1,
    show_troy: 1,
    show_amex: 1
  });

  // Yan Panel (Side Drawer) Durum Kontrolleri
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Kullanıcı Giriş Durumunu Kontrol Et
    const token = localStorage.getItem('token') || localStorage.getItem('user');
    setIsLoggedIn(!!token);

    // 2. Footer Ayarlarını, Kategorileri ve Kurumsal Sayfaları Veritabanından Çek
    const fetchFooterData = async () => {
      try {
        const [settingsRes, categoriesRes, pagesRes] = await Promise.all([
          axios.get(`${apiUrl}/api/footer`),
          axios.get(`${apiUrl}/api/categories/footer`).catch(() => ({ data: [] })),
          axios.get(`${apiUrl}/api/pages`).catch(() => ({ data: [] }))
        ]);

        if (settingsRes.data) setSettings(settingsRes.data);
        if (categoriesRes.data) setCategories(categoriesRes.data);
        if (pagesRes.data) {
          // Sadece aktif olan sayfaları listele
          const activePages = pagesRes.data.filter(
            (p) => p.is_active === 1 || p.is_active === true || p.is_active === undefined
          );
          setPages(activePages);
        }
      } catch (error) {
        console.error('Footer verileri yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, [apiUrl]);

  // Yan Paneli Açma Fonksiyonu
  const openSideDrawer = (title, content) => {
    setDrawerData({ 
      title: title || 'Detay', 
      content: content || '<p style="color: #666;">Bu sayfa için henüz içerik girilmemiştir.</p>' 
    });
    setDrawerOpen(true);
    document.body.style.overflow = 'hidden'; // Sayfanın arka planda kaymasını engeller
  };

  // Yan Paneli Kapatma Fonksiyonu
  const closeSideDrawer = () => {
    setDrawerOpen(false);
    document.body.style.overflow = 'auto';
  };

  // Hakkımızda Metnini Kısaltma (160 Karakter Sınırı) ve Devamını Oku Butonu
  const renderAboutText = () => {
    const text = settings.about_text || '';
    const maxLength = 160;

    if (text.length <= maxLength) {
      return <p>{text}</p>;
    }

    return (
      <div className="about-text-container">
        <p>{text.substring(0, maxLength)}...</p>
        <button 
          type="button" 
          className="read-more-btn" 
          onClick={() => openSideDrawer('Hakkımızda', text)}
        >
          Devamını Oku &raquo;
        </button>
      </div>
    );
  };

  return (
    <>
      <footer className="footer-section">
        <div className="container">
          <div className="footer-grid">
            
            {/* 1. KOLON: KATEGORİLER */}
            <div className="footer-col">
              <h4>Kategoriler</h4>
              <ul>
                {loading ? (
                  <li style={{ color: '#999' }}>Yükleniyor...</li>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <li key={category.id}>
                      <a href={`/shop?category=${category.id}`}>{category.name}</a>
                    </li>
                  ))
                ) : (
                  <li style={{ color: '#999' }}>Kategori bulunamadı.</li>
                )}
              </ul>
            </div>

            {/* 2. KOLON: KURUMSAL */}
            <div className="footer-col">
              <h4>Kurumsal</h4>
              <ul>
                {/* Kullanıcı Giriş Yapmışsa Hesabım, Yapmamışsa Giriş/Kayıt Alanı */}
                {isLoggedIn ? (
                  <>
                    <li>
                      <a href="/hesabim/kullanici-bilgilerim" className="account-link">
                        <i className="fas fa-user-circle"></i> Hesabım
                      </a>
                    </li>
                    <li><a href="/wishlist">Favorilerim</a></li>
                  </>
                ) : (
                  <>
                    <li><a href="/login">Giriş Yap</a></li>
                    <li><a href="/register">Kayıt Ol</a></li>
                  </>
                )}

                {/* Veritabanından Çekilen Dinamik Sayfalar (Tıklanınca Yan Panel Açılır) */}
                {pages.map((page) => (
                  <li key={page.id}>
                    <button 
                      type="button" 
                      className="footer-page-btn"
                      onClick={() => openSideDrawer(page.title, page.content)}
                    >
                      {page.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. KOLON: HAKKIMIZDA (Kısaltılmış ve Devamını Oku Düğmeli) */}
            <div className="footer-col">
              <h4>Hakkımızda</h4>
              {renderAboutText()}
            </div>

            {/* 4. KOLON: İLETİŞİM */}
            <div className="footer-col contacts">
              <h4>İletişim</h4>
              <ul>
                <li><i className="far fa-clock"></i> {settings.contact_hours}</li>
                <li><i className="fas fa-phone-alt"></i> Bizi Arayın: {settings.contact_phone}</li>
                <li><i className="far fa-envelope"></i> {settings.contact_email}</li>
              </ul>
            </div>

          </div>
          
          {/* ALT BİLGİ VE ÖDEME LOGOLARI */}
          <div className="footer-bottom">
            <div className="footer-bottom-container">
              
              <div className="copyright-text">
                <p>&copy; {currentYear}, {settings.copyright_text}</p>
              </div>

              <div className="footer-payments-wrapper">
                
                <div className="security-badge" title="256-Bit SSL Şifreli Güvenli Bağlantı">
                  <svg viewBox="0 0 24 24" className="security-icon" width="16" height="16">
                    <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14.47V17h2v-1.53c1.15-.38 2-1.46 2-2.77a3 3 0 0 0-6 0c0 1.31.85 2.39 2 2.77zM12 8a2 2 0 0 1 2 2h-4a2 2 0 0 1 2-2z"/>
                  </svg>
                  <span>256-Bit SSL GÜVENLİ</span>
                </div>
                
                {/* Yönetim Paneli Tercihlerine Göre Gösterilen Kredi Kartı Logoları */}
                <div className="payment-logos">
                  {settings.show_visa === 1 && (
                    <div className="payment-badge" title="Visa ile Güvenli Ödeme">
                      <VisaLogo />
                    </div>
                  )}

                  {settings.show_mastercard === 1 && (
                    <div className="payment-badge" title="Mastercard ile Güvenli Ödeme">
                      <MastercardLogo />
                    </div>
                  )}

                  {settings.show_maestro === 1 && (
                    <div className="payment-badge" title="Maestro ile Güvenli Ödeme">
                      <MaestroLogo />
                    </div>
                  )}

                  {settings.show_troy === 1 && (
                    <div className="payment-badge" title="Yerli Kart TROY ile Güvenli Ödeme">
                      <TroyLogo />
                    </div>
                  )}

                  {settings.show_amex === 1 && (
                    <div className="payment-badge" title="American Express ile Güvenli Ödeme">
                      <AmexLogo />
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>
      </footer>

      {/* SİTEDE SAĞDAN KAYARAK AÇILAN YAN PANEL (SIDE DRAWER) */}
      <div className={`side-drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={closeSideDrawer}>
        <div className={`side-drawer ${drawerOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h3>{drawerData.title}</h3>
            <button type="button" className="drawer-close-btn" onClick={closeSideDrawer}>&times;</button>
          </div>
          {/* ql-editor sınıfı eklendi: ReactQuill stillerinin tam ve düzgün basılmasını sağlar */}
          <div className="drawer-body ql-editor">
            <div dangerouslySetInnerHTML={{ __html: drawerData.content }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;