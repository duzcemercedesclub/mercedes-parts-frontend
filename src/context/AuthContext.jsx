import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Veritabanından en güncel profil ve adres verilerini çeken fonksiyon
  const fetchUserProfile = async (authToken = token) => {
    if (!authToken) return null;
    try {
      const response = await axios.get(`${apiUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
    } catch (error) {
      console.error('Profil senkronizasyon hatası:', error);
    }
    return null;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Local user parse hatası:', e);
        }
      }
      // Sayfa yüklendiğinde güncel adres ve profil verisini sunucudan çek
      fetchUserProfile(savedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // 1. GİRİŞ
  const login = async (identifier, password) => {
    try {
      const response = await axios.post(`${apiUrl}/api/auth/login`, { identifier, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      setToken(token);

      // Giriş yapıldıktan hemen sonra detaylı adres profili çekilir
      const fullProfile = await fetchUserProfile(token);
      if (!fullProfile) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Giriş yapılırken bir hata oluştu.' 
      };
    }
  };

  // 2. KAYIT
  const register = async (formData) => {
    try {
      const response = await axios.post(`${apiUrl}/api/auth/register`, formData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Kayıt olurken bir hata oluştu.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, fetchUserProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);