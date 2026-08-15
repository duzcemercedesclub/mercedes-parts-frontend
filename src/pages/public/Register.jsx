import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone_code: 'TR (+90)',
    phone: '',
    password: '',
    gender: '', // 'female' | 'male'
    is_terms_accepted: false,
    is_marketing_accepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Şifre Doğrulama Kuralları Kontrolü
  const isLengthValid = formData.password.length >= 8 && formData.password.length <= 15;
  const hasDigit = /\d/.test(formData.password);
  const hasUpperLower = /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGenderSelect = (selectedGender) => {
    setFormData(prev => ({
      ...prev,
      gender: prev.gender === selectedGender ? '' : selectedGender
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.is_terms_accepted) {
      setError('Lütfen Üyelik Sözleşmesini onaylayın.');
      return;
    }

    if (!isLengthValid || !hasDigit || !hasUpperLower) {
      setError('Lütfen şifre kurallarına uyunuz.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(formData);
    setIsSubmitting(false);

    if (result.success) {
      alert('Kaydınız başarıyla oluşturuldu!');
      navigate('/login');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-box">
        {error && <div className="auth-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="n11-auth-form">
          {/* Ad & Soyad */}
          <div className="form-row-grid">
            <div className="floating-input-group">
              <input 
                type="text" 
                name="name"
                placeholder="Ad" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="floating-input-group">
              <input 
                type="text" 
                name="surname"
                placeholder="Soyad (İsteğe Bağlı)" 
                value={formData.surname}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* E-posta */}
          <div className="floating-input-group full-width">
            <input 
              type="email" 
              name="email"
              placeholder="E-posta Adresi" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Ülke Kodu & Telefon Numarası */}
          <div className="form-row-grid phone-grid">
            <div className="floating-input-group country-code-group">
              <span className="mini-label">Ülke Kodu</span>
              <input 
                type="text" 
                name="phone_code"
                value={formData.phone_code}
                readOnly
              />
            </div>
            <div className="floating-input-group">
              <input 
                type="tel" 
                name="phone"
                placeholder="Telefon Numarası" 
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Şifre ve Göster/Gizle İkonu */}
          <div className="floating-input-group full-width password-group">
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="password"
              placeholder="Şifre" 
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button 
              type="button" 
              className="eye-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={showPassword ? "far fa-eye-slash" : "far fa-eye"}></i>
            </button>
          </div>

          {/* Canlı Şifre Kriterleri */}
          <div className="password-rules-box">
            <div className={`rule-item ${isLengthValid ? 'valid' : ''}`}>
              <span className="dot">•</span> 8-15 karakter
            </div>
            <div className={`rule-item ${hasDigit ? 'valid' : ''}`}>
              <span className="dot">•</span> En az 1 rakam (0-9)
            </div>
            <div className={`rule-item ${hasUpperLower ? 'valid' : ''}`}>
              <span className="dot">•</span> En az 1 büyük, 1 küçük harf
            </div>
          </div>

          {/* Cinsiyet Seçimi */}
          <div className="gender-section">
            <label className="section-subtitle">Cinsiyet (İsteğe Bağlı)</label>
            <div className="gender-btn-group">
              <button 
                type="button" 
                className={`gender-btn ${formData.gender === 'female' ? 'active' : ''}`}
                onClick={() => handleGenderSelect('female')}
              >
                Kadın
              </button>
              <button 
                type="button" 
                className={`gender-btn ${formData.gender === 'male' ? 'active' : ''}`}
                onClick={() => handleGenderSelect('male')}
              >
                Erkek
              </button>
            </div>
          </div>

          {/* Onay Kutuları */}
          <div className="checkbox-section">
            <label className="n11-checkbox-label">
              <input 
                type="checkbox" 
                name="is_terms_accepted"
                checked={formData.is_terms_accepted}
                onChange={handleChange}
              />
              <span>
                <Link to="/sozlesme" target="_blank" className="underlined-link">Üyelik Sözleşmesi</Link> şartlarını okudum ve kabul ediyorum.
              </span>
            </label>

            <label className="n11-checkbox-label">
              <input 
                type="checkbox" 
                name="is_marketing_accepted"
                checked={formData.is_marketing_accepted}
                onChange={handleChange}
              />
              <span>
                Fırsatlardan ve özel kampanyalardan haberdar olmak istiyorum.
              </span>
            </label>
          </div>

          {/* Bilgilendirme Metni */}
          <p className="privacy-info-text">
            Kişisel verilerinizin işlenmesine yönelik detaylara <Link to="/aydinlatma-metni" target="_blank" className="underlined-link">Aydınlatma Metni</Link>'nden ulaşabilirsiniz.
          </p>

          {/* Üye Ol Butonu */}
          <button type="submit" className="n11-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Kaydediliyor...' : 'Üye Ol'}
          </button>
        </form>

        <div className="auth-switch-link">
          Zaten üye misiniz? <Link to="/login">Giriş Yapın</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;