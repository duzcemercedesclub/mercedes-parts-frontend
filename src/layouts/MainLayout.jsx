import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/ui/Header/Header.jsx';
import Footer from '../components/ui/Footer/Footer.jsx';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Header />
      
      {/* Outlet, route'a göre değişen sayfaların render edileceği alandır (Örn: Home, Shop, Cart) */}
      <main style={{ minHeight: '60vh' }}>
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;