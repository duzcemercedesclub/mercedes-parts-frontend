import React from 'react';
import HeroSlider from '../../components/ui/HeroSlider/HeroSlider.jsx';
import CategoriesSection from '../../components/ui/Categories/CategoriesSection.jsx';
import ProductSlider from '../../components/ui/ProductSlider/ProductSlider.jsx';
import MegaSaleBanner from '../../components/ui/MegaSale/MegaSaleBanner.jsx';
import BrandSection from '../../components/ui/Brand/BrandSection.jsx';
import FeaturesSection from '../../components/ui/Features/FeaturesSection.jsx';

const Home = () => {
  return (
    <div className="home-page">
      
      <HeroSlider />
      
      <CategoriesSection />
      
      {/* 1. Popüler Ürünler Bölümü */}
      <ProductSlider 
        title="En popüler ürünler" 
        tabs={['Tüm Ürünler', 'Sıfır Parçalar', 'Çıkma Parçalar']} 
        filterType="popular"
      />
      
      <MegaSaleBanner />
      
      {/* 2. İndirimli Ürünler Bölümü */}
      <ProductSlider 
        title="İndirimli ürünler" 
        tabs={['Tüm Ürünler', 'Sıfır Parçalar', 'Çıkma Parçalar']} 
        filterType="discounted"
      />
      
      <BrandSection />
      <FeaturesSection />

    </div>
  );
};

export default Home;