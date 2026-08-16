import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Space,
  message,
  Segmented
} from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import './responsive.css';

const { Title, Text } = Typography;

const MyCoupons = () => {
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

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Üst Başlık Kartı */}
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 16,
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
          Kuponlarım
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Hesabınıza tanımlı indirim kuponları ve puan durumu.
        </Text>
      </Card>

      {/* Kategori Filtre Tabları (Mobilde Yatay Kaydırılabilir) */}
      <div style={{ marginBottom: 20 }} className="responsive-segmented-container">
        <Segmented
          options={['Tümü (14)', 'Katlanan Kuponlarım (1)', 'Sepet Kuponlarım (13)', 'Ürün Kuponlarım (1)']}
          value={activeTab}
          onChange={setActiveTab}
          style={{ padding: 4, backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: 10 }}
        />
      </div>

      {/* Kupon Kartları Grid */}
      <Row gutter={[16, 16]}>
        {coupons.map((c) => (
          <Col xs={24} lg={12} key={c.id}>
            <div className="coupon-ticket-card">
              {/* Sol İçerik Alanı */}
              <div className="coupon-ticket-left">
                <Space style={{ marginBottom: 6, flexWrap: 'wrap' }}>
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

              {/* Bilet Ayrım Çizgisi */}
              <div className="coupon-ticket-divider" />

              {/* Sağ İndirim Tutarı Alanı */}
              <div className="coupon-ticket-right">
                <div>
                  <Text strong style={{ fontSize: 22, color: '#eb2f96', lineHeight: 1 }}>
                    {c.discount}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                    İNDİRİM
                  </Text>
                </div>
                <Button
                  type="link"
                  size="small"
                  style={{ fontSize: 11, padding: 0 }}
                >
                  Detay
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