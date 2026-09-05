import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: E-posta Gönderme, 2: Kod ve Yeni Şifre
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // ADIM 1: Kod Gönder
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Lütfen e-posta adresinizi giriniz.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/api/auth/forgot-password`, { email });
      setSuccessMsg(res.data.message || 'Doğrulama kodu e-postanıza gönderildi.');
      setStep(2); // 2. Adıma Geç (Kod ve Yeni Şifre Formu)
    } catch (err) {
      setError(err.response?.data?.message || 'Kod gönderilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // ADIM 2: Kodu Doğrula ve Şifreyi Veritabanında Değiştir (Enter ile çalışır)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!code || !newPassword || !confirmPassword) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Girdiğiniz yeni şifreler birbiriyle eşleşmiyor.');
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Şifreniz 8-15 karakter olmalı, en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/api/auth/reset-password`, {
        email,
        code,
        newPassword
      });

      setSuccessMsg(res.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Şifre güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-box">
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '20px', fontSize: '22px' }}>
          {step === 1 ? 'Şifremi Unuttum' : 'Yeni Şifre Oluştur'}
        </h2>

        {error && <div className="auth-error-msg">{error}</div>}
        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            color: '#4ade80',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {successMsg}
          </div>
        )}

        {step === 1 ? (
          /* ADIM 1 FORM - E-POSTA İLE KOD İSTEME */
          <form onSubmit={handleSendCode} className="n11-auth-form">
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px', textAlign: 'center', lineHeight: '1.5' }}>
              Hesabınıza ait e-posta adresinizi giriniz. Size 6 haneli bir doğrulama kodu göndereceğiz.
            </p>

            <div className="floating-input-group full-width has-value-label">
              <span className="mini-label">E-posta Adresi</span>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ornek@domain.com"
                required 
              />
            </div>

            <button type="submit" className="n11-submit-btn" disabled={loading}>
              {loading ? 'Kod Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
            </button>
          </form>
        ) : (
          /* ADIM 2 FORM - KODU VE YENİ ŞİFREYİ GİRİP ENTER İLE ONAYLAMA */
          <form onSubmit={handleResetPassword} className="n11-auth-form">
            <p style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
              <strong>{email}</strong> adresine gönderilen 6 haneli kodu ve yeni şifrenizi giriniz.
            </p>

            {/* Doğrulama Kodu */}
            <div className="floating-input-group full-width has-value-label">
              <span className="mini-label">6 Haneli Doğrulama Kodu</span>
              <input 
                type="text" 
                maxLength="6"
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                placeholder="123456"
                style={{ letterSpacing: '4px', fontWeight: 'bold', fontSize: '16px' }}
                required 
              />
            </div>

            {/* Yeni Şifre */}
            <div className="floating-input-group full-width password-group has-value-label">
              <span className="mini-label">Yeni Şifre</span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
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

            {/* Yeni Şifre Onay */}
            <div className="floating-input-group full-width password-group has-value-label">
              <span className="mini-label">Yeni Şifre (Tekrar)</span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>

            {/* Enter Tuşu ve Buton İle Kaydetme */}
            <button type="submit" className="n11-submit-btn" disabled={loading}>
              {loading ? 'Şifre Değiştiriliyor...' : 'Şifreyi Güncelle ve Giriş Yap'}
            </button>
          </form>
        )}

        <div className="auth-switch-link" style={{ marginTop: '20px' }}>
          Giriş ekranına dönmek için <Link to="/login">Tıklayın</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;