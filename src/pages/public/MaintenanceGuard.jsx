import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const MaintenanceGuard = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [maintenance, setMaintenance] = useState({
    is_active: false,
    title: '',
    message: '',
    estimated_end_datetime: null
  });
  const [checking, setChecking] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const checkStatus = async () => {
    try {
      // Önbelleği (Cache) engellemek için t parametresi eklendi
      const res = await axios.get(`${API_URL}/api/maintenance/status?t=${new Date().getTime()}`);
      
      // Veritabanından gelen veri tipini (1, '1', true) kesin olarak boolean yapıyoruz
      const activeStatus = res.data.is_active === true || res.data.is_active === 1 || res.data.is_active === '1';
      
      setMaintenance({
        ...res.data,
        is_active: activeStatus
      });
    } catch (error) {
      console.error('Bakım modu kontrolü yapılamadı:', error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Her 15 saniyede bir durumu otomatik kontrol et
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [API_URL]);

  if (checking) {
    return null;
  }

  // /login veya /admin ile başlayan sayfalarda bakım ekranı gösterilmez (Giriş yapılabilsin diye)
  const isExemptPath = location.pathname === '/login' || location.pathname.startsWith('/admin');

  // BAKIM MODU AÇIKSA + KULLANICI ADMİN DEĞİLSE + HARİÇ TUTULAN SAYFADA DEĞİLSE
  if (maintenance.is_active && user?.role !== 'admin' && !isExemptPath) {
    return (
      <div className="mercedes-maintenance-overlay">
        <style>{`
          .mercedes-maintenance-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #0a0c10 0%, #151922 100%);
            color: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            text-align: center;
            padding: 24px;
            font-family: 'Jost', sans-serif;
            box-sizing: border-box;
          }

          .mercedes-logo-wrapper {
            position: relative;
            width: 140px;
            height: 140px;
            margin-bottom: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .mercedes-star-svg {
            width: 100%;
            height: 100%;
            animation: mercedesSpin 10s linear infinite;
            filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.3));
          }

          @keyframes mercedesSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .maintenance-title {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 2px;
            margin-bottom: 16px;
            color: #ffffff;
            text-transform: uppercase;
          }

          .maintenance-message {
            max-width: 600px;
            font-size: 16px;
            line-height: 1.6;
            color: #a0aec0;
            margin-bottom: 28px;
          }

          .maintenance-time-box {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 12px 24px;
            border-radius: 30px;
            font-size: 14px;
            color: #38bdf8;
            margin-bottom: 32px;
          }

          .admin-login-link {
            font-size: 13px;
            color: #64748b;
            text-decoration: underline;
            transition: color 0.3s;
          }

          .admin-login-link:hover {
            color: #ffffff;
          }
        `}</style>

        {/* DÖNEN MERCEDES LOGOSU */}
        <div className="mercedes-logo-wrapper">
          <svg className="mercedes-star-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" stroke="#E2E8F0" strokeWidth="4" />
            <path d="M50 8 L50 50 L20 80 Z" fill="#E2E8F0" />
            <path d="M50 8 L50 50 L80 80 Z" fill="#CBD5E1" />
            <path d="M50 50 L80 80 L20 80 Z" fill="#94A3B8" />
          </svg>
        </div>

        <h1 className="maintenance-title">{maintenance.title || 'SİTEMİZ BAKIMDADIR'}</h1>
        
        <p className="maintenance-message">
          {maintenance.message || 'Sizlere daha iyi hizmet verebilmek için sistemlerimizi güncelliyoruz. Kısa süre sonra tekrar aktif olacağız.'}
        </p>

        {maintenance.estimated_end_datetime && (
          <div className="maintenance-time-box">
            ⏱ <strong>Tahmini Bitiş Zamanı:</strong>{' '}
            {new Date(maintenance.estimated_end_datetime).toLocaleString('tr-TR')}
          </div>
        )}

        <Link to="/login" className="admin-login-link">
          Yönetici Girişi Yap
        </Link>
      </div>
    );
  }

  return children;
};

export default MaintenanceGuard;