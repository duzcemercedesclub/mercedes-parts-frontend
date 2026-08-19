import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Tag,
  Select,
  Row,
  Col,
  Space,
  Spin,
  Empty,
  Avatar,
  Divider,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  message
} from 'antd';
import {
  ShoppingOutlined,
  CalendarOutlined,
  CarOutlined,
  BarcodeOutlined,
  RollbackOutlined,
  CloseCircleOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import './responsive.css';

const { Title, Text } = Typography;
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

const MyOrders = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [orders, setOrders] = useState([]);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchMonthlyOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/user/orders/monthly?year=${selectedYear}&month=${selectedMonth}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Sunucudan geçersiz yanıt alındı (Status: ${response.status})`);
      }

      const data = await response.json();

      if (response.ok) {
        setOrders(data);
      } else {
        message.error(data.error || 'Siparişler getirilemedi.');
      }
    } catch (error) {
      console.error('Sipariş yükleme hatası:', error);
      message.error(error.message || 'Sunucu bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyOrders();
  }, [token, selectedYear, selectedMonth]);

  const handleProductClick = (productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  // Siparişi İptal Etme (Kargo öncesi durumlar)
  const handleCancelOrder = async (orderId) => {
    setCancellingOrder(true);
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        message.success(data.message || 'Siparişiniz başarıyla iptal edildi.');
        fetchMonthlyOrders();
      } else {
        message.error(data.error || 'Sipariş iptal edilemedi.');
      }
    } catch (error) {
      console.error('İptal hatası:', error);
      message.error('Sipariş iptal edilirken bir hata oluştu.');
    } finally {
      setCancellingOrder(false);
    }
  };

  // İade Talebi Gönderme
  const handleCreateReturn = async (values) => {
    if (!selectedReturnItem || !token) return;

    setSubmittingReturn(true);
    try {
      const response = await fetch(`${API_URL}/api/user/returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: selectedReturnItem.orderId,
          productId: selectedReturnItem.productId,
          reason: values.reason,
          description: values.description
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Sunucu yanıt veremedi.');
      }

      const data = await response.json();

      if (response.ok) {
        message.success(data.message || 'İade talebiniz başarıyla alındı.');
        setReturnModalOpen(false);
        form.resetFields();
        fetchMonthlyOrders();
      } else {
        message.error(data.message || 'İade talebi oluşturulamadı.');
      }
    } catch (error) {
      console.error('İade hatası:', error);
      message.error(error.message || 'İade talebi iletilirken bir hata oluştu.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'Teslim Edildi':
        return <Tag color="success">Teslim Edildi</Tag>;
      case 'Kargoya Verildi':
        return <Tag color="processing">Kargoya Verildi</Tag>;
      case 'İptal Edildi':
        return <Tag color="error">İptal Edildi</Tag>;
      case 'İade Talebi Oluşturuldu':
        return <Tag color="warning">İade Talebi Alındı</Tag>;
      case 'İade Onaylandı (Para İadesi Yapıldı)':
        return <Tag color="magenta">Para İadesi Yapıldı</Tag>;
      default:
        return <Tag color="warning">{status || 'Ödeme Yapıldı'}</Tag>;
    }
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
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Siparişlerim
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Sipariş detaylarınızı görüntüleyin ve iade/iptal süreçlerinizi yönetin.
            </Text>
          </Col>
          <Col xs={24} sm={12} className="mobile-text-left" style={{ textAlign: 'right' }}>
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
          <Spin size="large" tip="Siparişleriniz yükleniyor..." />
        </div>
      ) : orders.length === 0 ? (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '40px 0' }}>
          <Empty description="Seçilen aya ait sipariş bulunamadı." />
        </Card>
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {orders.map((order) => {
            const isCancelable = ['Ödeme Yapıldı', 'Sipariş Verildi', 'Hazırlanıyor'].includes(order.orderStatus);
            const isDelivered = order.orderStatus === 'Teslim Edildi';

            return (
              <Card
                key={order.id}
                style={{
                  borderRadius: 12,
                  border: '1px solid #e8e8e8',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
                styles={{ body: { padding: 16 } }}
              >
                <Row justify="space-between" align="middle" gutter={[8, 8]} style={{ marginBottom: 12 }}>
                  <Col>
                    <Space size={8} wrap>
                      <ShoppingOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                      <Text strong style={{ fontSize: 14 }}>
                        #{order.orderNumber}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        ({new Date(order.createdAt).toLocaleDateString('tr-TR')})
                      </Text>
                    </Space>
                  </Col>
                  <Col>{getStatusTag(order.orderStatus)}</Col>
                </Row>

                {order.cargoCompany && (
                  <div
                    style={{
                      backgroundColor: '#fafafa',
                      padding: '8px 12px',
                      borderRadius: 8,
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      flexWrap: 'wrap',
                      fontSize: 12
                    }}
                  >
                    <Space>
                      <CarOutlined style={{ color: '#52c41a' }} />
                      <Text type="secondary">Kargo:</Text>
                      <Text strong>{order.cargoCompany}</Text>
                    </Space>
                    {order.trackingNumber && (
                      <Space>
                        <BarcodeOutlined style={{ color: '#fa8c16' }} />
                        <Text type="secondary">Takip No:</Text>
                        <Text strong>{order.trackingNumber}</Text>
                      </Space>
                    )}
                  </div>
                )}

                <Divider style={{ margin: '12px 0' }} />

                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  {order.items?.map((item) => (
                    <Row key={item.id} justify="space-between" align="middle" gutter={[12, 12]} style={{ width: '100%' }}>
                      <Col xs={24} sm={15}>
                        <div
                          onClick={() => handleProductClick(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            cursor: 'pointer',
                            borderRadius: 8
                          }}
                        >
                          <Avatar
                            shape="square"
                            size={48}
                            src={item.image}
                            style={{ borderRadius: 6, flexShrink: 0 }}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <Text
                              strong
                              style={{
                                fontSize: 13,
                                display: 'block',
                                color: '#262626'
                              }}
                              ellipsis
                            >
                              {item.name} <RightOutlined style={{ fontSize: 10, color: '#bfbfbf' }} />
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {item.quantity} Adet x ₺{item.price.toLocaleString('tr-TR')}
                            </Text>
                          </div>
                        </div>
                      </Col>

                      <Col xs={24} sm={9} className="mobile-text-left" style={{ textAlign: 'right' }}>
                        <Space direction="vertical" align="end" size={4} className="mobile-full-width">
                          <Text strong style={{ fontSize: 14 }}>
                            ₺{item.totalPrice.toLocaleString('tr-TR')}
                          </Text>

                          {item.returnStatus ? (
                            <Tag color="orange" style={{ borderRadius: 6 }}>
                              {item.returnStatus}
                            </Tag>
                          ) : (
                            isDelivered && (
                              <Button
                                type="default"
                                danger
                                size="small"
                                icon={<RollbackOutlined />}
                                onClick={() => {
                                  setSelectedReturnItem({
                                    orderId: order.id,
                                    productId: item.id,
                                    productName: item.name
                                  });
                                  form.resetFields();
                                  setReturnModalOpen(true);
                                }}
                                style={{ borderRadius: 6, fontSize: 12 }}
                              >
                                İade Talebi
                              </Button>
                            )
                          )}
                        </Space>
                      </Col>
                    </Row>
                  ))}
                </Space>

                <Divider style={{ margin: '12px 0' }} />

                <Row justify="space-between" align="middle">
                  <Col>
                    {isCancelable && (
                      <Popconfirm
                        title="Siparişi İptal Et"
                        description="Siparişi iptal etmek istediğinize emin misiniz?"
                        onConfirm={() => handleCancelOrder(order.id)}
                        okText="Evet, İptal Et"
                        cancelText="Hayır"
                        okButtonProps={{ danger: true, loading: cancellingOrder }}
                      >
                        <Button type="primary" danger ghost icon={<CloseCircleOutlined />}>
                          Siparişi İptal Et
                        </Button>
                      </Popconfirm>
                    )}
                  </Col>
                  <Col>
                    <Space align="center">
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Toplam Tutar:
                      </Text>
                      <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
                        ₺{order.totalAmount.toLocaleString('tr-TR')}
                      </Title>
                    </Space>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </Space>
      )}

      {/* İade Talebi Modalı */}
      <Modal
        title="İade Talebi Oluştur"
        open={returnModalOpen}
        onCancel={() => setReturnModalOpen(false)}
        footer={null}
        centered
        destroyOnClose
      >
        {selectedReturnItem && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateReturn}
            style={{ marginTop: 16 }}
          >
            <div style={{ backgroundColor: '#fafafa', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>İade Edilecek Ürün:</Text>
              <Text strong style={{ display: 'block', fontSize: 14 }}>
                {selectedReturnItem.productName}
              </Text>
            </div>

            <Form.Item
              name="reason"
              label="İade Nedeni"
              rules={[{ required: true, message: 'Lütfen bir iade nedeni seçin.' }]}
            >
              <Select placeholder="İade nedenini seçiniz" style={{ borderRadius: 8 }} virtual={false}>
                <Option value="Ürün Hasarlı/Kusurlu">Ürün Hasarlı veya Kusurlu Geldi</Option>
                <Option value="Yanlış Ürün Gönderildi">Yanlış Ürün Gönderildi</Option>
                <Option value="Açıklama/Görsel ile Uyuşmuyor">Ürün Görseldeki ile Uyuşmuyor</Option>
                <Option value="Vazgeçtim">Satın Almaktan Vazgeçtim</Option>
                <Option value="Diğer">Diğer</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="Açıklama (İsteğe Bağlı)"
            >
              <Input.TextArea
                rows={4}
                maxLength={500}
                placeholder="İade talebinizle ilgili detayları girebilirsiniz..."
              />
            </Form.Item>

            <Button
              type="primary"
              danger
              htmlType="submit"
              block
              size="large"
              loading={submittingReturn}
              style={{ borderRadius: 8, marginTop: 12 }}
            >
              İade Talebini Gönder
            </Button>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default MyOrders;