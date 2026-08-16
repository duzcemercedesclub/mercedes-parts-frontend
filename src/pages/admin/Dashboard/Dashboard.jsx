import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Button,
  Select,
  Progress,
  Avatar,
  Space,
  Typography,
  Input,
  Badge,
  Spin,
  Flex,
  message
} from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  WarningOutlined,
  CarOutlined,
  SearchOutlined,
  ArrowUpOutlined,
  DownloadOutlined,
  PlusOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  ToolOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Bu Ay');
  const [searchVin, setSearchVin] = useState('');

  // Dinamik State'ler
  const [dashboardData, setDashboardData] = useState({
    stats: {
      monthlyTurnover: 0,
      totalOrdersCount: 0,
      completedOrdersCount: 0,
      criticalStockCount: 0,
    },
    criticalStocks: [],
    recentOrders: [],
    chassisSales: []
  });

  // Backend API'den Veri Çekme
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token'); 

      const response = await axios.get(`${apiUrl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Dashboard yükleme hatası:', error);
      if (error.response?.status === 401) {
        message.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        message.error('Bu panele erişim yetkiniz bulunmamaktadır (Admin yetkisi gerekli).');
      } else {
        message.error('Dashboard verileri yüklenirken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 2. STOK RAPORU EXCEL OLARAK İNDİRME İŞLEMİ
  const handleDownloadStockReport = async () => {
    setExportLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      const response = await axios.get(`${apiUrl}/api/admin/reports/stock-excel`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Excel binary indirimi için blob gerekli
      });

      // İndirme Bağlantısı Oluşturup Otomatik Tıklatma
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Yedek_Parca_Stok_Raporu_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Detaylı stok raporu Excel dosyası olarak indirildi.');
    } catch (error) {
      console.error('Excel indirme hatası:', error);
      message.error('Stok raporu indirilirken bir hata oluştu.');
    } finally {
      setExportLoading(false);
    }
  };

  // Şase / OEM Arama Yönlendirmesi
  const handleSearch = () => {
    if (!searchVin.trim()) return;
    navigate(`/admin/products?search=${encodeURIComponent(searchVin.trim())}`);
  };

  // İstatistik Kartları Yapılandırması
  const statsCards = [
    {
      id: 1,
      title: 'Aylık Parça Cirosu',
      value: `₺${dashboardData.stats.monthlyTurnover.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
      change: '+18.4%',
      isPositive: true,
      period: 'Bu ayki toplam ciro',
      icon: <DollarOutlined style={{ fontSize: '22px', color: '#10b981' }} />,
      iconBg: '#ecfdf5',
    },
    {
      id: 2,
      title: 'Toplam Siparişler',
      value: `${dashboardData.stats.totalOrdersCount} Adet`,
      change: 'Aktif',
      isPositive: true,
      period: 'Bu ay verilen siparişler',
      icon: <CarOutlined style={{ fontSize: '22px', color: '#1677ff' }} />,
      iconBg: '#e6f4ff',
    },
    {
      id: 3,
      title: 'Kritik Stok Uyarısı',
      value: `${dashboardData.stats.criticalStockCount} Parça`,
      change: 'Acil Tedarik',
      isPositive: false,
      period: 'Stok adedi ≤ 3 olanlar',
      icon: <WarningOutlined style={{ fontSize: '22px', color: '#ef4444' }} />,
      iconBg: '#fef2f2',
    },
    {
      id: 4,
      title: 'Tamamlanan Sipariş',
      value: `${dashboardData.stats.completedOrdersCount} Adet`,
      change: 'Başarılı',
      isPositive: true,
      period: 'Teslim edilen ve ödenenler',
      icon: <ShoppingOutlined style={{ fontSize: '22px', color: '#8b5cf6' }} />,
      iconBg: '#f5f3ff',
    },
  ];

  // Tablo Kolon Tanımlamaları
  const columns = [
    {
      title: 'Sipariş No',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text, record) => (
        <Text strong style={{ color: '#1677ff' }}>#{text || record.id}</Text>
      ),
    },
    {
      title: 'Müşteri',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
            {`${record.userName || ''} ${record.userSurname || ''}`.trim() || 'Müşteri'}
          </div>
        </div>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (text) => (
        <Text strong style={{ color: '#0f172a', fontSize: '14px' }}>
          ₺{Number(text || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {text ? new Date(text).toLocaleDateString('tr-TR') : '-'}
        </Text>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status) => {
        let color = 'default';
        let icon = null;

        if (status === 'Teslim Edildi' || status === 'Tamamlandı') {
          color = 'success';
          icon = <CheckCircleOutlined />;
        } else if (status === 'Hazırlanıyor' || status === 'Kargoya Verildi') {
          color = 'processing';
          icon = <ClockCircleOutlined />;
        } else if (status === 'Ödeme Yapıldı' || status === 'Sipariş Verildi') {
          color = 'warning';
          icon = <ClockCircleOutlined />;
        } else if (status === 'İptal Edildi') {
          color = 'error';
          icon = <CloseCircleOutlined />;
        }

        return (
          <Tag color={color} icon={icon} style={{ borderRadius: '6px', fontWeight: 500, padding: '3px 8px' }}>
            {status || 'Ödeme Yapıldı'}
          </Tag>
        );
      },
    },
    {
      title: 'Aksiyon',
      key: 'action',
      align: 'right',
      render: () => (
        <Button 
          type="text" 
          shape="circle" 
          icon={<MoreOutlined style={{ color: '#94a3b8' }} />} 
          onClick={() => navigate('/admin/orders')}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" description="Gösterge paneli verileri yükleniyor..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. HEADER & HIZLI ŞASE KONTROL BAR */}
      <Card
        variant="borderless"
        style={{
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #001529 0%, #002140 100%)',
          boxShadow: '0 4px 20px rgba(0, 21, 41, 0.15)',
          color: '#fff'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Row gutter={[24, 16]} align="middle" justify="space-between">
          <Col xs={24} md={14}>
            <Flex vertical gap={4}>
              <Space>
                <Tag color="gold" icon={<SafetyCertificateOutlined />}>MERCEDES-BENZ OEM SİSTEMİ</Tag>
                <Text style={{ color: '#94a3b8', fontSize: '12px' }}>Canlı Parça & Stok Paneli</Text>
              </Space>
              <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
                Yedek Parça Operasyon Merkezi
              </Title>
              <Text style={{ color: '#cbd5e1', fontSize: '13px' }}>
                W201, W124, W204 ve W211 kasa grupları için güncel sipariş, stok ve şase doğrulamaları.
              </Text>
            </Flex>
          </Col>

          {/* Hızlı Şase / OEM Sorgulama Kutusu */}
          <Col xs={24} md={10}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Text style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                <SearchOutlined style={{ marginRight: '6px', color: '#38bdf8' }} />
                Hızlı Şase (VIN) veya OEM Parça No Sorgula
              </Text>
              <Input.Search
                placeholder="Örn: WDB2010241F... ya da A2012401917"
                enterButton="Parça Bul"
                size="large"
                value={searchVin}
                onChange={(e) => setSearchVin(e.target.value)}
                onSearch={handleSearch}
                style={{ width: '100%' }}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* 2. DÖNEM FİLTRESİ VE HIZLI BUTONLAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Title level={5} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>
            Performans Özetleri
          </Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Seçilen döneme ait mağaza satış göstergeleri
          </Text>
        </div>

        <Space wrap>
          <Select
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            prefix={<CalendarOutlined style={{ color: '#94a3b8' }} />}
            style={{ width: 140 }}
            options={[
              { value: 'Bugün', label: 'Bugün' },
              { value: 'Bu Hafta', label: 'Bu Hafta' },
              { value: 'Bu Ay', label: 'Bu Ay' },
              { value: 'Bu Yıl', label: 'Bu Yıl' },
            ]}
          />
          {/* EXCEL STOK RAPORU AL BUTONU */}
          <Button 
            icon={<DownloadOutlined />} 
            loading={exportLoading}
            onClick={handleDownloadStockReport}
          >
            Stok Raporu Al
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            style={{ backgroundColor: '#1677ff' }}
            onClick={() => navigate('/admin/products/add')}
          >
            Yeni Parça Ekle
          </Button>
        </Space>
      </div>

      {/* 3. İSTATİSTİK KARTLARI */}
      <Row gutter={[16, 16]}>
        {statsCards.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.id}>
            <Card
              variant="borderless"
              style={{
                borderRadius: '12px',
                boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
                background: '#ffffff',
                border: '1px solid #f1f5f9'
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  {stat.title}
                </Text>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: stat.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {stat.icon}
                </div>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  {stat.value}
                </Text>
                <Tag
                  color={stat.isPositive ? 'success' : 'error'}
                  variant="filled"
                  style={{
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    margin: 0
                  }}
                >
                  <ArrowUpOutlined />
                  {stat.change}
                </Tag>
              </div>

              <div style={{
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px solid #f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#94a3b8'
              }}>
                <span>{stat.period}</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 4. DİNAMİK MERCEDES KASA KODU SATIŞLARI VE KRİTİK STOKLAR */}
      <Row gutter={[16, 16]}>
        
        {/* Mercedes Kasa Kodlarına Göre Dağılım (RESİMDEKİ KISIM) */}
        <Col xs={24} lg={15}>
          <Card
            variant="borderless"
            style={{
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
              border: '1px solid #f1f5f9',
              height: '100%'
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <Text strong style={{ fontSize: '16px', color: '#0f172a', display: 'block' }}>
                  Mercedes Kasa Koduna Göre Parça Satışları
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  En çok yedek parça talebi alan araç kasa grupları (Ürün Adı/Açıklaması Analizi)
                </Text>
              </div>
              <Tag color="geekblue" icon={<ToolOutlined />}>Kasa Dağılımı</Tag>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {dashboardData.chassisSales && dashboardData.chassisSales.length > 0 ? (
                dashboardData.chassisSales.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <Text strong style={{ fontSize: '13px', color: '#334155' }}>{item.model}</Text>
                      <Space>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{item.count}</Text>
                        <Text strong style={{ fontSize: '13px', color: item.color }}>%{item.percentage}</Text>
                      </Space>
                    </div>
                    <Progress
                      percent={item.percentage}
                      strokeColor={item.color}
                      showInfo={false}
                      size={{ height: 10 }}
                      style={{ margin: 0 }}
                    />
                  </div>
                ))
              ) : (
                <Text type="secondary">Kasa kodlarına ait veri bulunamadı.</Text>
              )}
            </div>
          </Card>
        </Col>

        {/* Kritik Stok Bekleyen OEM Parçalar */}
        <Col xs={24} lg={9}>
          <Card
            variant="borderless"
            style={{
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
              border: '1px solid #f1f5f9',
              height: '100%'
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <Text strong style={{ fontSize: '16px', color: '#0f172a', display: 'block' }}>
                  Kritik Stok Uyarısı
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Tedarik edilmesi gereken OEM ürünler
                </Text>
              </div>
              <Badge count={dashboardData.criticalStocks.length} overflowCount={10} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dashboardData.criticalStocks.length === 0 ? (
                <Text type="secondary">Kritik stokta ürün bulunmuyor.</Text>
              ) : (
                dashboardData.criticalStocks.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                    <Space>
                      <Avatar
                        style={{
                          backgroundColor: item.stock === 0 ? '#fef2f2' : '#fffbeb',
                          color: item.stock === 0 ? '#ef4444' : '#f59e0b',
                          border: `1px solid ${item.stock === 0 ? '#fecaca' : '#fef08a'}`
                        }}
                        icon={<WarningOutlined />}
                      />
                      <div>
                        <Text strong style={{ fontSize: '12px', color: '#1e293b', display: 'block' }}>
                          {item.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                          OEM / SKU: {item.oem || '-'}
                        </Text>
                      </div>
                    </Space>
                    <Tag color={item.stock === 0 ? 'red' : 'gold'} style={{ borderRadius: '6px', fontWeight: 700 }}>
                      {item.stock === 0 ? 'Tükendi' : `${item.stock} Adet`}
                    </Tag>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>

      </Row>

      {/* 5. SON YEDEK PARÇA SİPARİŞLERİ TABLOSU */}
      <Card
        variant="borderless"
        style={{
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
          border: '1px solid #f1f5f9'
        }}
        styles={{ body: { padding: '0' } }}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Text strong style={{ fontSize: '16px', color: '#0f172a', display: 'block' }}>
              Son Parça Siparişleri
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Sistemde son gerçekleşen 5 sipariş işlemi
            </Text>
          </div>
          <Button 
            type="link" 
            style={{ fontWeight: 600, padding: 0 }}
            onClick={() => navigate('/admin/orders')}
          >
            Tüm Siparişleri Gör <RightOutlined style={{ fontSize: '10px' }} />
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={dashboardData.recentOrders}
          rowKey="id"
          pagination={false}
          scroll={{ x: true }}
          locale={{ emptyText: 'Henüz sipariş kaydı bulunmuyor.' }}
        />
      </Card>

    </div>
  );
}