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

  // Videonuzu public/ klasörüne 'maintenance-video.mp4' adıyla koyduğunuzda bu yol geçerlidir.
  // Dilerseniz doğrudan harici bir .mp4 URL'i de verebilirsiniz.
  const VIDEO_SRC = "/maintenance-video.mp4";

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
            background-color: #000000;
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
            overflow: hidden;
          }

          /* Arka plan karartma katmanı */
          .video-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.45;
            z-index: 1;
          }

          /* Ön plandaki içerik kartı */
          .maintenance-content {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 650px;
            background: rgba(10, 12, 16, 0.65);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            padding: 40px;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
          }

          .maintenance-title {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 2px;
            margin-bottom: 16px;
            color: #ffffff;
            text-transform: uppercase;
          }

          .maintenance-message {
            font-size: 15px;
            line-height: 1.6;
            color: #cbd5e1;
            margin-bottom: 24px;
          }

          .maintenance-time-box {
            background: rgba(56, 189, 248, 0.1);
            border: 1px solid rgba(56, 189, 248, 0.3);
            padding: 10px 20px;
            border-radius: 30px;
            font-size: 13px;
            color: #38bdf8;
            margin-bottom: 24px;
          }

          .admin-login-link {
            font-size: 13px;
            color: #94a3b8;
            text-decoration: underline;
            transition: color 0.3s;
          }

          .admin-login-link:hover {
            color: #ffffff;
          }
        `}</style>

        {/* TAM EKRAN ARKA PLAN VİDEOSU */}
        <video 
          className="video-backdrop" 
          src={VIDEO_SRC} 
          autoPlay 
          loop 
          muted 
          playsInline
        />

        {/* MERKEZİ BİLGİ KARTI */}
        <div className="maintenance-content">
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
      </div>
    );
  }

  return children;
};

export default MaintenanceGuard;