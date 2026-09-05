import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ScrollToTop from './components/ScrollToTop';
import DemoNoticeModal from './components/ui/DemoNoticeModal/DemoNoticeModal';

// BAKIM MODU KORUMA BİLEŞENİ
import MaintenanceGuard from './pages/public/MaintenanceGuard';

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/public/Home";
import Shop from "./pages/public/Shop";
import ProductDetail from "./pages/public/ProductDetail";
import Cart from "./pages/public/Cart";
import Wishlist from './pages/public/Wishlist';
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Contact from './pages/public/Contact';
import CheckoutSuccess from './pages/public/CheckoutSuccess';

// HESABIM MÜŞTERİ SAYFALARI
import MyOrders from './pages/Account/MyOrders';
import MyQuestions from './pages/Account/MyQuestions';
import MyProfile from './pages/Account/MyProfile';
import MyReviews from './pages/Account/MyReviews';
import MyCoupons from './pages/Account/MyCoupons';

// ADMİN SAYFALARI
import Dashboard from "./pages/admin/Dashboard/Dashboard";

import ProductList from "./pages/admin/Product/ProductList";
import ProductAdd from "./pages/admin/Product/ProductAdd";
import ProductEdit from "./pages/admin/Product/ProductEdit";

import SliderList from "./pages/admin/Slider/SliderList";
import SliderAdd from "./pages/admin/Slider/SliderAdd";
import SliderEdit from "./pages/admin/Slider/SliderEdit";

import MegaBannerList from "./pages/admin/MegaBanner/MegaBannerList";
import MegaBannerAdd from "./pages/admin/MegaBanner/MegaBannerAdd";
import MegaBannerEdit from "./pages/admin/MegaBanner/MegaBannerEdit";

import CategoryList from "./pages/admin/Category/CategoryList";
import CategoryAdd from "./pages/admin/Category/CategoryAdd";
import CategoryEdit from "./pages/admin/Category/CategoryEdit";

import PageList from "./pages/admin/PageManagement/PageList";
import PageAdd from "./pages/admin/PageManagement/PageAdd";
import PageEdit from "./pages/admin/PageManagement/PageEdit";

import BrandList from "./pages/admin/Brand/BrandList";
import BrandAdd from "./pages/admin/Brand/BrandAdd";
import BrandEdit from "./pages/admin/Brand/BrandEdit";

import FeaturesManager from "./pages/admin/Features/FeaturesManager";
import TestimonialManagement from "./pages/admin/Testimonial/TestimonialManagement";
import UserList from "./pages/admin/User/UserList";

import OrdersList from './pages/admin/Orders/OrdersList';

import Coupons from './pages/admin/Coupon/AdminCouponManager';

import GeneralAndLogoSettings from "./pages/admin/Settings/GeneralAndLogoSettings";
import SocialMediaManager from "./pages/admin/Settings/SocialMediaManager";
import SmtpSettings from "./pages/admin/Settings/SmtpSettings";
import SeoSettings from "./pages/admin/Settings/SeoSettings";
import FooterSettings from "./pages/admin/Settings/FooterSettings";
import ContactManagement from "./pages/admin/Contact/ContactManagement";
import MaintenanceSettings from "./pages/admin/Settings/MaintenanceSettings";
import ForgotPassword from './pages/public/ForgotPassword';


// --- GÜVENLİK KİLİDİ (PROTECTED ROUTE) ---
const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    alert("Bu alana erişim yetkiniz yok! Yönetici girişi yapmalısınız.");
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const [showDemoModal, setShowDemoModal] = useState(true);

  return (
    <MaintenanceGuard>
      {/* DENEME AŞAMASI MODAL UYARISI */}
      {showDemoModal && (
        <DemoNoticeModal onClose={() => setShowDemoModal(false)} />
      )}

      <ScrollToTop />
      <Routes>
        {/* PUBLIC (MÜŞTERİ) ROUTE'LARI */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="contact" element={<Contact />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* HESABIM SAYFA YÖNLENDİRMELERİ */}
          <Route path="hesabim/siparislerim" element={<MyOrders />} />
          <Route path="hesabim/soru-taleplerim" element={<MyQuestions />} />
          <Route path="hesabim/kullanici-bilgilerim" element={<MyProfile />} />
          <Route path="hesabim/degerlendirmelerim" element={<MyReviews />} />
          <Route path="hesabim/kuponlarim" element={<MyCoupons />} />
        </Route>

        {/* PROTECTED ADMIN ROUTE'LARI (KİLİTLİ) */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Dashboard/>} />

          {/* SLIDER MODÜLÜ */}
          <Route path="sliders" element={<SliderList />} />
          <Route path="sliders/add" element={<SliderAdd />} />
          <Route path="sliders/edit/:id" element={<SliderEdit />} />

          {/* MEGA BANNER MODÜLÜ */}
          <Route path="banners" element={<MegaBannerList />} />
          <Route path="banners/add" element={<MegaBannerAdd />} />
          <Route path="banners/edit/:id" element={<MegaBannerEdit />} />

          {/* KATEGORİ MODÜLÜ */}
          <Route path="categories" element={<CategoryList />} />
          <Route path="categories/add" element={<CategoryAdd />} />
          <Route path="categories/edit/:id" element={<CategoryEdit />} />

          {/* SAYFA YÖNETİMİ MODÜLÜ */}
          <Route path="pages" element={<PageList />} />
          <Route path="pages/add" element={<PageAdd />} />
          <Route path="pages/edit/:id" element={<PageEdit />} />

          {/* MARKALAR MODÜLÜ */}
          <Route path="brands" element={<BrandList />} />
          <Route path="brands/add" element={<BrandAdd />} />
          <Route path="brands/edit/:id" element={<BrandEdit />} />

          {/* ÜRÜN YÖNETİMİ MODÜLÜ */}
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<ProductAdd />} />
          <Route path="products/edit/:id" element={<ProductEdit />} />

          {/* MÜŞTERİ YÖNETİMİ MODÜLÜ */}
          <Route path="testimonials" element={<TestimonialManagement />} />

          {/* ÖZELLİKLER YÖNETİMİ MODÜLÜ */}
          <Route path="features" element={<FeaturesManager />} />

          {/* KULLANICI YÖNETİMİ MODÜLÜ */}
          <Route path="users" element={<UserList />} />

          <Route path="orders" element={<OrdersList />} />

          <Route path="coupon" element={<Coupons />} />

          {/* AYARLAR YÖNETİMİ MODÜLÜ */}
          <Route path="settings/general" element={<GeneralAndLogoSettings />} />
          <Route path="settings/social" element={<SocialMediaManager />} />
          <Route path="settings/smtp" element={<SmtpSettings />} />
          <Route path="settings/seo" element={<SeoSettings />} />
          <Route path="settings/footer" element={<FooterSettings />} />
          <Route path="settings/contact" element={<ContactManagement />} />
          <Route path="settings/maintenance" element={<MaintenanceSettings />} />
        </Route>
      </Routes>
    </MaintenanceGuard>
  );
};

export default App;