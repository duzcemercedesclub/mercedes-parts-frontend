import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Space,
  message,
  Segmented,
  Spin,
  Empty
} from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import './responsive.css';

const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MyCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tümü');

  const fetchMyCoupons = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/coupons/my-coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(res.data);
      setFilteredCoupons(res.data);
    } catch (error) {
      message.error('Kuponlarınız yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCoupons();
  }, []);

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === 'Tümü') {
      setFilteredCoupons(coupons);
    } else if (value === 'Özel Kuponlarım') {
      setFilteredCoupons(coupons.filter((c) => c.user_id !== null));
    } else if (value === 'Genel Kuponlar') {
      setFilteredCoupons(coupons.filter((c) => c.user_id === null));
    }
  };

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
          Hesabınıza özel tanımlanan indirim kuponları ve genel fırsatlar.
        </Text>
      </Card>

      {/* Kategori Filtre Tabları */}
      <div style={{ marginBottom: 20 }} className="responsive-segmented-container">
        <Segmented
          options={['Tümü', 'Özel Kuponlarım', 'Genel Kuponlar']}
          value={activeTab}
          onChange={handleTabChange}
          style={{ padding: 4, backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: 10 }}
        />
      </div>

      {/* Kupon Kartları Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredCoupons.length === 0 ? (
        <Empty description="Kullanılabilir kuponunuz bulunmamaktadır." />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredCoupons.map((c) => (
            <Col xs={24} lg={12} key={c.id}>
              <div className="coupon-ticket-card">
                {/* Sol İçerik Alanı */}
                <div className="coupon-ticket-left">
                  <Space style={{ marginBottom: 6, flexWrap: 'wrap' }}>
                    <Tag color="magenta" style={{ borderRadius: 10 }}>
                      {c.badge || 'Fırsat'}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Bitiş: {dayjs(c.end_date).format('DD.MM.YYYY HH:mm')}
                    </Text>
                  </Space>
                  <Title level={5} style={{ margin: '4px 0', fontSize: 15 }}>
                    {c.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                    {c.description || (c.min_spend > 0 ? `Minimum ${c.min_spend} TL alışverişte geçerlidir.` : 'Tüm alışverişlerde geçerli.')}
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
                      {c.discount_type === 'percentage' ? `%${c.discount_amount}` : `${c.discount_amount} TL`}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                      İNDİRİM
                    </Text>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MyCoupons;