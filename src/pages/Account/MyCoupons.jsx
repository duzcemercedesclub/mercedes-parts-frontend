import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Input,
  Space,
  message,
  Statistic,
  Segmented
} from 'antd';
import {
  CopyOutlined,
  TagOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  PlusOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const MyCoupons = () => {
  const [couponInput, setCouponInput] = useState('');
  const [activeTab, setActiveTab] = useState('Tümü (14)');

  const coupons = [
    {
      id: 1,
      code: 'KATLANAN100',
      title: 'Katlanan Kupon',
      desc: 'Minimum alışveriş tutarı 1.000 TL olmalıdır.',
      startDate: '31.07.2026 15:59',
      endDate: '31.08.2026 23:59',
      discount: '100 TL',
      type: 'katlanan',
      badge: 'Sınırlı Stok'
    },
    {
      id: 2,
      code: 'MOBIL250',
      title: 'Cep Telefonu Aksesuarları İndirimi',
      desc: 'Minimum alışveriş tutarı 2.000 TL. İlk 5.000 adete özeldir.',
      startDate: '03.08.2026 09:27',
      endDate: '10.08.2026 23:59',
      discount: '250 TL',
      type: 'sepet',
      badge: 'Fırsat'
    },
    {
      id: 3,
      code: 'BILGISAYAR100',
      title: 'Bilgisayar Aksesuarları İndirim Kuponu',
      desc: 'Minimum alışveriş tutarı 1.000 TL olmalıdır.',
      startDate: '03.08.2026 09:25',
      endDate: '10.08.2026 23:59',
      discount: '100 TL',
      type: 'sepet',
      badge: 'Popüler'
    },
    {
      id: 4,
      code: 'DONANIM250',
      title: 'Bilgisayar Bileşenleri İndirim Kuponu',
      desc: 'Minimum alışveriş tutarı 2.000 TL olmalıdır.',
      startDate: '03.08.2026 09:25',
      endDate: '10.08.2026 23:59',
      discount: '250 TL',
      type: 'urun',
      badge: 'Özel VIP'
    }
  ];

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    message.success(`${code} kupon kodu panoya kopyalandı!`);
  };

  const handleAddCoupon = () => {
    if (!couponInput) {
      message.warning('Lütfen bir kupon kodu giriniz.');
      return;
    }
    message.success('Kupon kodunuz hesabınıza tanımlandı!');
    setCouponInput('');
  };

  return (
    <div>
      {/* Üst Kupon Ekleme Barı */}
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 16,
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Kuponlarım
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Hesabınıza tanımlı indirim kuponları ve puan durumu.
            </Text>
          </Col>
        </Row>
      </Card>


      {/* Kategori Filtre Tabları */}
      <div style={{ marginBottom: 20 }}>
        <Segmented
          options={['Tümü (14)', 'Katlanan Kuponlarım (1)', 'Sepet Kuponlarım (13)', 'Ürün Kuponlarım (1)']}
          value={activeTab}
          onChange={setActiveTab}
          style={{ padding: 4, backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: 10 }}
        />
      </div>

      {/* Özel Bilet Görünümlü Kupon Kartları Grid */}
      <Row gutter={[16, 16]}>
        {coupons.map((c) => (
          <Col xs={24} lg={12} key={c.id}>
            <div
              style={{
                display: 'flex',
                backgroundColor: '#fff',
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid #e8e8e8',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                position: 'relative'
              }}
            >
              {/* Sol İçerik Alanı */}
              <div style={{ flex: 1, padding: '18px 20px' }}>
                <Space style={{ marginBottom: 6 }}>
                  <Tag color="magenta" style={{ borderRadius: 10 }}>
                    {c.badge}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Bitiş: {c.endDate}
                  </Text>
                </Space>
                <Title level={5} style={{ margin: '4px 0', fontSize: 15 }}>
                  {c.title}
                </Title>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                  {c.desc}
                </Text>
                <Button
                  size="small"
                  type="dashed"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(c.code)}
                  style={{ borderRadius: 6, fontWeight: 600 }}
                >
                  Kod: {c.code}
                </Button>
              </div>

              {/* Bilet Ayrım Çizgisi (Kupon Çentiği) */}
              <div
                style={{
                  width: 1,
                  borderRight: '2px dashed #d9d9d9',
                  position: 'relative',
                  margin: '10px 0'
                }}
              />

              {/* Sağ İndirim Tutarı Alanı */}
              <div
                style={{
                  width: 130,
                  backgroundColor: '#fafafa',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 12,
                  textAlign: 'center'
                }}
              >
                <Text strong style={{ fontSize: 22, color: '#eb2f96', lineHeight: 1 }}>
                  {c.discount}
                </Text>
                <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                  İNDİRİM
                </Text>
                <Button
                  type="link"
                  size="small"
                  style={{ fontSize: 11, marginTop: 8, padding: 0 }}
                >
                  Detayı Gör
                </Button>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MyCoupons;