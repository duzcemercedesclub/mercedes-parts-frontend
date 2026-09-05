import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true); // Varsayılan olarak işaretli
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(identifier, password, rememberMe);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-box">
        {error && <div className="auth-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="n11-auth-form">
          {/* E-posta veya Telefon Numarası Input */}
          <div className="floating-input-group full-width has-value-label">
            <span className="mini-label">E-posta Adresi veya Telefon Numarası</span>
            <input 
              type="text" 
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)} 
              required 
            />
          </div>

          {/* Şifre ve Göz Toggle */}
          <div className="floating-input-group full-width password-group has-value-label">
            <span className="mini-label">Şifre</span>
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
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

          {/* Beni Hatırla ve Şifremi Unuttum Satırı */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#cbd5e1'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                style={{ width: '16px', height: '16px', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
              Beni Hatırla
            </label>

            <Link to="/forgot-password" className="forgot-password-link">
              Şifremi Unuttum
            </Link>
          </div>

          {/* Giriş Yap Butonu */}
          <button type="submit" className="n11-submit-btn" disabled={loading}>
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="auth-switch-link">
          Hesabınız yok mu? <Link to="/register">Hemen Kayıt Olun</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;