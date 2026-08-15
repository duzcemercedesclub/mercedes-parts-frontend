import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, Menu, Button, Avatar, Dropdown, Space, theme, Breadcrumb } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  SlidersOutlined,
  PercentageOutlined,
  FolderOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  CommentOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  GlobalOutlined,
  TrademarkOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ant Design v5 modern tema token'ları
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Aktif menü seçimi ve açık alt menüleri senkronize etme
  const [selectedKey, setSelectedKey] = useState(location.pathname);
  const [openKeys, setOpenKeys] = useState([]);

  useEffect(() => {
    setSelectedKey(location.pathname);
    
    // Mevcut yol alt menüdeyse, o alt menünün otomatik açık kalmasını sağla
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 2) {
      setOpenKeys([pathParts[2] + '-group']);
    }
  }, [location.pathname]);

  // Menü tıklama olayı
  const handleMenuClick = ({ key }) => {
    if (!key.includes('-group')) {
      navigate(key);
    }
  };

  // Profil Dropdown Menüsü
  const profileMenuItems = [
    {
      key: 'site-go',
      icon: <GlobalOutlined />,
      label: <Link to="/">Siteden Çık / Mağazaya Git</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Güvenli Çıkış Yap',
      danger: true,
      onClick: () => {
        logout();
        navigate('/login');
      }
    },
  ];

  // Gelişmiş Navigasyon Menü Ağacı (Ant Design v5 formatında)
  const sidebarItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard Overview',
    },
    {
      key: '/admin/features',
      icon: <AppstoreOutlined />,
      label: 'Özellikler Bölümü',
    },
    {
      key: 'sliders-group',
      icon: <SlidersOutlined />,
      label: 'Hero Slider',
      children: [
        { key: '/admin/sliders', label: 'Slider Listesi' },
        { key: '/admin/sliders/add', label: 'Yeni Slider Ekle' },
      ],
    },
    {
      key: 'banners-group',
      icon: <PercentageOutlined />,
      label: 'Mega Sale Banner',
      children: [
        { key: '/admin/banners', label: 'Banner Listesi' },
        { key: '/admin/banners/add', label: 'Yeni Banner Ekle' },
      ],
    },
    {
      key: 'categories-group',
      icon: <FolderOutlined />,
      label: 'Kategori Yönetimi',
      children: [
        { key: '/admin/categories', label: 'Kategorileri Listele' },
        { key: '/admin/categories/add', label: 'Yeni Kategori Ekle' },
      ],
    },
    {
    key: '/admin/brands',
    icon: <TrademarkOutlined />,
    label: 'Markalar Yönetimi',
  },
    {
      key: 'pages-group',
      icon: <FileTextOutlined />,
      label: 'Sayfa Yönetimi',
      children: [
        { key: '/admin/pages', label: 'Tüm Sayfalar' },
        { key: '/admin/pages/add', label: 'Yeni Sayfa Ekle' },
      ],
    },
    {
      key: 'products-group',
      icon: <ShoppingOutlined />,
      label: 'Ürün Yönetimi',
      children: [
        { key: '/admin/products', label: 'Ürünleri Listele' },
        { key: '/admin/products/add', label: 'Yeni Ürün Ekle' },
      ],
    },
    {
      key: '/admin/testimonials',
      icon: <CommentOutlined />,
      label: 'Referanslar (Müşteri)',
    },
    {
      key: 'orders-group',
      icon: <ShoppingCartOutlined />,
      label: 'Sipariş Yönetimi',
      children: [
        { key: '/admin/orders', label: 'Sipariş Listesi' },
      ],
    },
    {
      key: 'users-group',
      icon: <UserOutlined />,
      label: 'Kullanıcı Yönetimi',
      children: [
        { key: '/admin/users', label: 'Kullanıcı Listesi' },
      ],
    },
    {
      key: 'settings-group',
      icon: <SettingOutlined />,
      label: 'Sistem Ayarları',
      children: [
        { key: '/admin/settings/general', label: 'Genel & Logo Ayarları' },
        { key: '/admin/settings/social', label: 'Sosyal Medya Linkleri' },
        { key: '/admin/settings/smtp', label: 'SMTP E-Posta Ayarları' },
        { key: '/admin/settings/seo', label: 'Meta SEO Ayarları' },
        { key: '/admin/settings/footer', label: 'Footer Düzenleyici' },
        { key: '/admin/settings/contact', label: 'İletişim Sayfası' },
      ],
    },
  ];

  // Breadcrumb (Yol tarifi) oluşturucu dinamik başlıklar
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    return paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      const isLast = index === paths.length - 1;
      const formatText = path.charAt(0).toUpperCase() + path.slice(1);
      return {
        title: isLast ? formatText : <Link to={url}>{formatText}</Link>
      };
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* SOL SIDEBAR MENÜ */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={260}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 101,
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)'
        }}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          paddingLeft: collapsed ? '0' : '24px',
          background: '#001529',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          transition: 'all 0.2s'
        }}>
          <span style={{
            color: '#fff',
            fontWeight: '700',
            fontSize: collapsed ? '14px' : '18px',
            letterSpacing: '1px',
            fontFamily: 'Jost, sans-serif'
          }}>
            {collapsed ? '⭐️ M-P' : '⭐️ MERCEDES PANEL'}
          </span>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
          onClick={handleMenuClick}
          items={sidebarItems}
          style={{ paddingBottom: '24px' }}
        />
      </Sider>

      {/* SAĞ İÇERİK ALANI */}
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 260, 
        transition: 'all 0.2s',
        minHeight: '100vh'
      }}>
        {/*ÜST PANEL (HEADER) */}
        <Header style={{ 
          padding: '0 24px 0 0', 
          background: colorBgContainer, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#555', fontSize: '14px' }}>
              Rolü: <strong style={{ color: '#1677ff' }}>{user?.role?.toUpperCase() || 'ADMIN'}</strong>
            </span>
            <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1677ff', verticalAlign: 'middle' }} size="large">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </Avatar>
                <span style={{ fontWeight: 500, color: '#333' }}>{user?.name || 'Yönetici'}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>

        {/* ANA İÇERİK GÖVDESİ */}
        <Content style={{ margin: '0 16px 24px 16px' }}>
          <Breadcrumb 
            style={{ margin: '16px 0' }} 
            items={[{ title: 'Admin' }, ...getBreadcrumbs()]}
          />
          
          <div style={{ 
            padding: 24, 
            minHeight: 'calc(100vh - 150px)', 
            background: colorBgContainer, 
            borderRadius: borderRadiusLG,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            {/* Alt sayfa içerikleri (Dashboard, ProductManager vb.) tam buraya enjekte olacak */}
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;