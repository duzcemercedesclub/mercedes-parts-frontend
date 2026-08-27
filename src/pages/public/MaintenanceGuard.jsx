import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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

  // Pinterest'teki veya sunucunuzdaki doğrudan GIF bağlantısı
  // Not: Pinterest sayfa linki (tr.pinterest.com/pin/...) yerine doğrudan görsel adresini (.gif) veya local dosya yolunuzu yazabilirsiniz.
  const MERCEDES_GIF_URL = "https://i.pinimg.com/originals/b5/07/7e/b5077e64177d6786c551239f67a2a16d.gif";

  // API URL temizliği
  const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const API_URL = rawApiUrl.replace(/\/$/, '');

  const checkStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/maintenance/status?t=${new Date().getTime()}`);
      
      const rawActive = res.data?.is_active;
      const activeStatus = rawActive === true || rawActive === 1 || rawActive === '1';
      
      setMaintenance({
        is_active: activeStatus,
        title: res.data?.title || 'SİTEMİZ BAKIMDADIR',
        message: res.data?.message || 'Sizlere daha iyi hizmet verebilmek için altyapımızı güncelliyoruz.',
        estimated_end_datetime: res.data?.estimated_end_datetime || null
      });
    } catch (error) {
      console.error('Bakım modu durumu sorgulanamadı:', error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [API_URL]);

  if (checking) {
    return null;
  }

  // Admin paneli ve login rotalarını bakımdan muaf tut
  const isExemptPath = location.pathname === '/login' || location.pathname.startsWith('/admin');

  // Bakım aktif + kullanıcı admin değil + hariç tutulan yolda değilse ekranı göster
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
            width: 180px;
            height: 180px;
            margin-bottom: 24px;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .mercedes-gif-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 50%;
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.2));
          }

          .maintenance-title {
            font-size: 30px;
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

        {/* PINTEREST GIF EKRANI */}
        <div className="mercedes-logo-wrapper">
          <img 
            src={MERCEDES_GIF_URL} 
            alt="Mercedes Logo Animation" 
            className="mercedes-gif-img"
          />
        </div>

        <h1 className="maintenance-title">{maintenance.title}</h1>
        
        <p className="maintenance-message">{maintenance.message}</p>

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