import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Rate,
  Button,
  Space,
  Row,
  Col,
  Avatar,
  Modal,
  Input,
  Form,
  Select,
  Segmented,
  Tag,
  Spin,
  Empty,
  message
} from 'antd';
import {
  StarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  CalendarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import './responsive.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const monthsList = [
  { value: 1, label: 'Ocak' },
  { value: 2, label: 'Şubat' },
  { value: 3, label: 'Mart' },
  { value: 4, label: 'Nisan' },
  { value: 5, label: 'Mayıs' },
  { value: 6, label: 'Haziran' },
  { value: 7, label: 'Temmuz' },
  { value: 8, label: 'Ağustos' },
  { value: 9, label: 'Eylül' },
  { value: 10, label: 'Ekim' },
  { value: 11, label: 'Kasım' },
  { value: 12, label: 'Aralık' }
];

const MyReviews = () => {
  const { token } = useAuth ? useAuth() : { token: localStorage.getItem('token') };
  const [activeTab, setActiveTab] = useState('Değerlendirme Bekleyenler');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pendingReviews, setPendingReviews] = useState([]);
  const [completedReviews, setCompletedReviews] = useState([]);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [form] = Form.useForm();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchMonthlyReviews = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/user/reviews/monthly?year=${selectedYear}&month=${selectedMonth}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();

      if (response.ok) {
        setPendingReviews(data.pending || []);
        setCompletedReviews(data.completed || []);
      } else {
        message.error(data.error || 'Değerlendirmeler getirilemedi.');
      }
    } catch (error) {
      console.error('Değerlendirme çekme hatası:', error);
      message.error('Sunucu bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyReviews();
  }, [token, selectedYear, selectedMonth]);

  const handleAddReview = async (values) => {
    if (!selectedProduct || !token) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/user/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProduct.productId,
          orderId: selectedProduct.orderId,
          rating: values.rating,
          comment: values.comment
        })
      });

      const data = await response.json();

      if (response.ok) {
        message.success(data.message || 'Değerlendirmeniz alındı.');
        setReviewModalOpen(false);
        form.resetFields();
        await fetchMonthlyReviews();
      } else {
        message.error(data.message || 'Değerlendirme kaydedilemedi.');
      }
    } catch (error) {
      console.error('Ekleme hatası:', error);
      message.error('Sunucu bağlantı hatası oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusTag = (status) => {
    if (status === 'Onaylandı') {
      return (
        <Tag icon={<CheckCircleFilled />} color="success" style={{ borderRadius: 12, padding: '2px 10px' }}>
          Onaylandı
        </Tag>
      );
    }
    if (status === 'Reddedildi') {
      return (
        <Tag icon={<CloseCircleFilled />} color="error" style={{ borderRadius: 12, padding: '2px 10px' }}>
          Reddedildi
        </Tag>
      );
    }
    return (
      <Tag icon={<ClockCircleOutlined />} color="warning" style={{ borderRadius: 12, padding: '2px 10px' }}>
        Onay Bekliyor
      </Tag>
    );
  };

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 20,
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
        styles={{ body: { padding: 16 } }}
      >
        <Title level={4} style={{ margin: '0 0 16px 0', fontWeight: 700 }}>
          Değerlendirmelerim
        </Title>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <div className="responsive-segmented-container">
              <Segmented
                options={['Değerlendirme Bekleyenler', 'Geçmiş Değerlendirmelerim']}
                value={activeTab}
                onChange={setActiveTab}
                size="large"
                style={{ padding: 4, backgroundColor: '#f5f5f5' }}
              />
            </div>
          </Col>
          <Col xs={24} lg={10} className="mobile-text-left" style={{ textAlign: 'right' }}>
            <Space wrap>
              <CalendarOutlined style={{ color: '#8c8c8c' }} />
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                style={{ width: 110, borderRadius: 8 }}
                virtual={false}
              >
                {monthsList.map((m) => (
                  <Option key={m.value} value={m.value}>
                    {m.label}
                  </Option>
                ))}
              </Select>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: 90, borderRadius: 8 }}
                virtual={false}
              >
                <Option value="2026">2026</Option>
                <Option value="2025">2025</Option>
                <Option value="2024">2024</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" description="Değerlendirmeler yükleniyor..." />
        </div>
      ) : activeTab === 'Değerlendirme Bekleyenler' ? (
        pendingReviews.length === 0 ? (
          <Card style={{ borderRadius: 12, textAlign: 'center', padding: '40px 0' }}>
            <Empty description="Seçilen döneme ait değerlendirme bekleyen siparişiniz bulunmuyor." />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {pendingReviews.map((item) => (
              <Col xs={24} sm={12} key={`${item.orderId}-${item.productId}`}>
                <Card
                  style={{
                    borderRadius: 12,
                    border: '1px solid #e8e8e8',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                  styles={{ body: { padding: 14 } }}
                >
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Avatar
                      shape="square"
                      size={60}
                      src={item.productImage || 'https://via.placeholder.com/100'}
                      style={{ borderRadius: 8, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Title level={5} ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: 13, minHeight: 36 }}>
                        {item.productName}
                      </Title>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', margin: '4px 0' }}>
                        Teslim: {new Date(item.orderDate).toLocaleDateString('tr-TR')}
                      </Text>

                      <Row justify="end" align="middle" style={{ marginTop: 8 }}>
                        <Button
                          type="primary"
                          size="small"
                          icon={<StarOutlined />}
                          onClick={() => {
                            setSelectedProduct(item);
                            form.resetFields();
                            setReviewModalOpen(true);
                          }}
                          style={{ borderRadius: 6, backgroundColor: '#1677ff' }}
                        >
                          Değerlendir
                        </Button>
                      </Row>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )
      ) : (
        completedReviews.length === 0 ? (
          <Card style={{ borderRadius: 12, textAlign: 'center', padding: '40px 0' }}>
            <Empty description="Seçilen döneme ait yapılmış bir değerlendirme bulunmuyor." />
          </Card>
        ) : (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {completedReviews.map((rev) => (
              <Card
                key={rev.id}
                style={{ borderRadius: 12, border: '1px solid #e8e8e8' }}
                styles={{ body: { padding: 16 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 200 }}>
                    <Avatar
                      shape="square"
                      size={50}
                      src={rev.productImage || 'https://via.placeholder.com/100'}
                      style={{ borderRadius: 8, flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <Title level={5} style={{ margin: 0, fontSize: 14 }} ellipsis>
                        {rev.productName}
                      </Title>
                      <Space style={{ margin: '4px 0', flexWrap: 'wrap' }}>
                        <Rate disabled defaultValue={Number(rev.rating)} style={{ fontSize: 12 }} />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {new Date(rev.createdAt).toLocaleDateString('tr-TR')}
                        </Text>
                      </Space>
                      {rev.comment && (
                        <Paragraph style={{ margin: '4px 0 0 0', color: '#434343', wordBreak: 'break-word' }}>
                          "{rev.comment}"
                        </Paragraph>
                      )}
                    </div>
                  </div>
                  <div>{renderStatusTag(rev.status)}</div>
                </div>
              </Card>
            ))}
          </Space>
        )
      )}

      {/* Değerlendirme Yapma Modalı */}
      <Modal
        title="Ürün Değerlendirmesi Yap"
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        footer={null}
        zIndex={2000}
        centered
        destroyOnClose
      >
        {selectedProduct && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddReview}
            initialValues={{ rating: 5 }}
            style={{ marginTop: 12 }}
          >
            <Text strong style={{ fontSize: 14 }}>{selectedProduct.productName}</Text>

            <Form.Item
              name="rating"
              label="Puanınız"
              rules={[{ required: true, message: 'Lütfen puan veriniz.' }]}
              style={{ marginTop: 16 }}
            >
              <Rate />
            </Form.Item>

            <Form.Item name="comment" label="Yorumunuz (İsteğe Bağlı)">
              <Input.TextArea
                rows={4}
                maxLength={500}
                placeholder="Ürün kalitesi, paketleme ve teslimat hakkındaki deneyiminizi yazın..."
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={submitting}
              style={{ borderRadius: 8, marginTop: 12 }}
            >
              Değerlendirmeyi Gönder
            </Button>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default MyReviews;