import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [settings, setSettings] = useState({
    info_title: 'Bizimle İletişime Geçin',
    info_description: 'Yedek parça sorgulamaları, sipariş durumları veya genel sorularınız için aşağıdaki kanallardan bize ulaşabilir ya da iletişim formunu doldurabilirsiniz.',
    address: 'Yükleniyor...',
    phone: 'Yükleniyor...',
    email: 'Yükleniyor...',
    working_hours: 'Yükleniyor...',
    map_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Veritabanındaki İletişim Bilgilerini Getir
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/contact/settings`);
        if (res.data) {
          setSettings(res.data);
        }
      } catch (error) {
        console.error('İletişim bilgileri alınamadı:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      await axios.post(`${API_URL}/api/contact/send-message`, formData);

      setStatusMessage({
        type: 'success',
        text: 'Mesajınız başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz!'
      });

      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error('İletişim formu gönderme hatası:', error);
      setStatusMessage({
        type: 'error',
        text: error.response?.data?.message || 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page container" style={{ padding: '30px 20px', minHeight: '80vh', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>İletişim</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', marginBottom: '50px' }}>
        
        {/* SOL KOLON: İletişim Bilgileri (Dinamik Başlık ve Açıklama) */}
        <div style={{ backgroundColor: '#f9f9f9', padding: '30px', borderRadius: '8px', border: '1px solid #eee' }}>
          
          {/* Dinamik Başlık */}
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1a1a1a', borderBottom: '2px solid #2b4c7e', paddingBottom: '10px' }}>
            {settings.info_title || 'Bizimle İletişime Geçin'}
          </h3>
          
          {/* Dinamik Açıklama Metni */}
          <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '25px', whiteSpace: 'pre-line' }}>
            {settings.info_description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Adres */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#2b4c7e', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                📍
              </div>
              <div>
                <strong style={{ display: 'block', color: '#333', marginBottom: '3px' }}>Adresimiz</strong>
                <span style={{ color: '#666', fontSize: '14px', lineHeight: '1.4' }}>
                  {settings.address}
                </span>
              </div>
            </div>

            {/* Telefon */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#2b4c7e', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                📞
              </div>
              <div>
                <strong style={{ display: 'block', color: '#333', marginBottom: '3px' }}>Telefon</strong>
                <a href={`tel:${settings.phone}`} style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                  {settings.phone}
                </a>
              </div>
            </div>

            {/* E-posta */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#2b4c7e', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                ✉️
              </div>
              <div>
                <strong style={{ display: 'block', color: '#333', marginBottom: '3px' }}>E-Posta</strong>
                <a href={`mailto:${settings.email}`} style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                  {settings.email}
                </a>
              </div>
            </div>

            {/* Çalışma Saatleri */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#2b4c7e', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                ⏰
              </div>
              <div>
                <strong style={{ display: 'block', color: '#333', marginBottom: '3px' }}>Çalışma Saatleri</strong>
                <span style={{ color: '#666', fontSize: '14px', whiteSpace: 'pre-line' }}>
                  {settings.working_hours}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* SAĞ KOLON: İletişim Formu */}
        <div style={{ border: '1px solid #eee', padding: '30px', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1a1a1a' }}>
            Mesaj Gönderin
          </h3>

          {statusMessage.text && (
            <div style={{
              padding: '12px 15px',
              borderRadius: '4px',
              marginBottom: '20px',
              backgroundColor: statusMessage.type === 'success' ? '#d4edda' : '#f8d7da',
              color: statusMessage.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${statusMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
              fontSize: '14px'
            }}>
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                  Adınız Soyadınız *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ahmet Yılmaz"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                  E-Posta Adresiniz *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="ahmet@example.com"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0555 123 45 67"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                  Konu
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Örn: Parça Uyum Sorgulama"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                Mesajınız *
              </label>
              <textarea
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Mesajınızı buraya yazabilirsiniz..."
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', resize: 'vertical' }}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#888' : '#2b4c7e',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '4px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Gönderiliyor...' : 'Mesajı Gönder'}
            </button>

          </form>
        </div>

      </div>

      {/* HARİTA (DİNAMİK GOOGLE MAPS) */}
      {settings.map_url && (
        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
          <iframe
            title="Google Map"
            src={settings.map_url}
            width="100%"
            height="380"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      )}

    </div>
  );
};

export default Contact;