import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Tag, 
  Card, 
  Typography, 
  Button, 
  message, 
  Modal, 
  Form, 
  Select, 
  Input, 
  Space,
  Descriptions,
  Divider
} from 'antd';
import { 
  EyeOutlined, 
  ReloadOutlined, 
  EditOutlined, 
  TruckOutlined,
  UserOutlined,
  ShoppingOutlined,
  ExportOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CARGO_COMPANIES = [
  'Yurtiçi Kargo',
  'Aras Kargo',
  'MNG Kargo',
  'Sürat Kargo',
  'PTT Kargo',
  'Trendyol Express',
  'HepsiJET',
  'Kolay Gelsin',
  'Diğer'
];

const ORDER_STATUS_COLORS = {
  'Ödeme Yapıldı': 'blue',
  'Sipariş Verildi': 'cyan',
  'Hazırlanıyor': 'orange',
  'Kargoya Verildi': 'purple',
  'Teslim Edildi': 'green',
  'İptal Edildi': 'red'
};

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Düzenleme / Yönet Modalı
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();

  // Detay Modalı State'leri
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let res = await fetch(`${API_URL}/api/admin/orders`);
      
      if (!res.ok) {
        res = await fetch(`${API_URL}/api/orders`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Sipariş çekme hatası:', error);
      message.error('Siparişler yüklenirken bir hata oluştu.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatAddress = (addr) => {
    if (!addr) return 'Adres bilgisi bulunmuyor.';
    
    let parsed = addr;
    if (typeof addr === 'string') {
      try {
        parsed = JSON.parse(addr);
      } catch (e) {
        return addr;
      }
    }

    if (typeof parsed === 'object' && parsed !== null) {
      const parts = [
        parsed.fullName,
        parsed.title,
        parsed.addressDetail || parsed.address_detail,
        parsed.neighborhood,
        parsed.district,
        parsed.city,
        parsed.country
      ].filter(Boolean);

      return parts.length > 0 ? parts.join(', ') : 'Adres detayı bulunamadı.';
    }

    return String(parsed);
  };

  const handleEditClick = (record) => {
    setSelectedOrder(record);
    form.setFieldsValue({
      orderStatus: record.orderStatus || 'Ödeme Yapıldı',
      cargoCompany: record.cargoCompany || undefined,
      trackingNumber: record.trackingNumber || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDetailClick = (record) => {
    setDetailOrder(record);
    setIsDetailModalOpen(true);
  };

  const handleUpdateOrder = async (values) => {
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Sipariş durumu ve kargo bilgileri güncellendi.');
        setIsEditModalOpen(false);
        fetchOrders();
      } else {
        message.error(data.error || 'Güncelleme sırasında hata oluştu.');
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      message.error('Sunucuya bağlanılamadı.');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      title: 'Sipariş No',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text, record) => <strong>#{text || record.id}</strong>,
    },
    {
      title: 'Müşteri',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <div>
          <Text strong>{user?.name || 'Müşteri'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{user?.email || '-'}</Text>
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (date ? new Date(date).toLocaleString('tr-TR') : '-'),
    },
    {
      title: 'Toplam Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <Text strong style={{ color: '#fa541c' }}>{Number(amount || 0).toFixed(2)} TL</Text>,
    },
    {
      title: 'Sipariş Durumu',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status) => (
        <Tag color={ORDER_STATUS_COLORS[status] || 'default'} variant="filled">
          {status || 'Ödeme Yapıldı'}
        </Tag>
      ),
    },
    {
      title: 'Kargo Bilgileri',
      key: 'cargoInfo',
      render: (_, record) => (
        record.cargoCompany ? (
          <div>
            <Tag icon={<TruckOutlined />} color="cyan" variant="filled">
              {record.cargoCompany}
            </Tag>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>
              Takip No: {record.trackingNumber || 'Girilmedi'}
            </Text>
          </div>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>Henüz Girilmedi</Text>
        )
      ),
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            onClick={() => handleEditClick(record)}
          >
            Yönet
          </Button>

          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleDetailClick(record)}
          >
            Detay
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card variant="outlined" styles={{ body: { padding: '24px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>Sipariş Yönetimi</Title>
            <Text type="secondary">Sipariş durumlarını ve kargo gönderim bilgilerini yönetin</Text>
          </div>
          <Button type="primary" icon={<ReloadOutlined />} onClick={fetchOrders} loading={loading}>
            Yenile
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 1. SİPARİŞ DETAYLARI ORTADA AÇILAN MODAL */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: '#1890ff' }} />
            <span>Sipariş Detayı (#{detailOrder?.orderNumber || detailOrder?.id})</span>
          </Space>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Kapat
          </Button>
        ]}
        width={750}
        centered
        destroyOnClose
      >
        {detailOrder && (
          <div style={{ padding: '8px 0' }}>
            {/* Müşteri ve Sipariş Özeti */}
            <Descriptions title={<Space><UserOutlined /> Müşteri & Sipariş Özeti</Space>} bordered size="small" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Sipariş No">
                <strong>#{detailOrder.orderNumber || detailOrder.id}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Sipariş Tarihi">
                {detailOrder.createdAt ? new Date(detailOrder.createdAt).toLocaleString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Müşteri Adı">
                {detailOrder.user?.name || 'Belirtilmemiş'}
              </Descriptions.Item>
              <Descriptions.Item label="E-Posta">
                {detailOrder.user?.email || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Sipariş Durumu">
                <Tag color={ORDER_STATUS_COLORS[detailOrder.orderStatus] || 'default'} variant="filled">
                  {detailOrder.orderStatus || 'Ödeme Yapıldı'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Tutar">
                <Text strong style={{ color: '#fa541c', fontSize: 16 }}>
                  {Number(detailOrder.totalAmount || 0).toFixed(2)} TL
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            {/* Kargo ve Adres Bilgileri */}
            <Descriptions title={<Space><TruckOutlined /> Teslimat & Kargo Bilgileri</Space>} bordered size="small" column={1}>
              <Descriptions.Item label="Teslimat Adresi">
                {formatAddress(detailOrder.user?.address)}
              </Descriptions.Item>
              <Descriptions.Item label="Kargo Firması">
                {detailOrder.cargoCompany ? (
                  <Tag icon={<TruckOutlined />} color="cyan" variant="filled">
                    {detailOrder.cargoCompany}
                  </Tag>
                ) : (
                  <Text type="secondary">Henüz kargo bilgisi girilmedi</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Kargo Takip No">
                {detailOrder.trackingNumber || <Text type="secondary">Girilmedi</Text>}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            {/* Ürünler Tablosu */}
            <div style={{ marginBottom: 8 }}>
              <Space><ShoppingOutlined /><Text strong>Satın Alınan Ürünler</Text></Space>
            </div>
            <Table
              dataSource={detailOrder.items || []}
              rowKey={(item, index) => item.id || item.productId || item.product_id || index}
              pagination={false}
              size="small"
              bordered
              columns={[
                {
                  title: 'Ürün Adı',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, item) => {
                    const productId = item.productId || item.product_id || item.id;
                    const productUrl = `/product/${productId}`;

                    return (
                      <a 
                        href={productUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: '#1890ff', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        title="Ürün detay sayfasına git"
                      >
                        {text || 'İsimsiz Ürün'}
                        <ExportOutlined style={{ fontSize: 12 }} />
                      </a>
                    );
                  },
                },
                {
                  title: 'Birim Fiyat',
                  dataIndex: 'price',
                  key: 'price',
                  align: 'right',
                  render: (price) => `${Number(price || 0).toFixed(2)} TL`,
                },
                {
                  title: 'Adet',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  align: 'center',
                  render: (q) => `x${q || 1}`,
                },
                {
                  title: 'Toplam Tutar',
                  key: 'total',
                  align: 'right',
                  render: (_, item) => (
                    <Text strong style={{ color: '#fa541c' }}>
                      {(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)} TL
                    </Text>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* 2. SİPARİŞ DURUMU VE KARGO GÜNCELLEME MODALI */}
      <Modal
        title={`Sipariş Yönetimi (#${selectedOrder?.orderNumber || selectedOrder?.id})`}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        centered
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateOrder}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="orderStatus"
            label="Sipariş Durumu"
            rules={[{ required: true, message: 'Lütfen bir sipariş durumu seçin.' }]}
          >
            <Select placeholder="Sipariş Durumu Seçin">
              <Option value="Ödeme Yapıldı">Ödeme Yapıldı</Option>
              <Option value="Sipariş Verildi">Sipariş Verildi</Option>
              <Option value="Hazırlanıyor">Hazırlanıyor</Option>
              <Option value="Kargoya Verildi">Kargoya Verildi</Option>
              <Option value="Teslim Edildi">Teslim Edildi</Option>
              <Option value="İptal Edildi">İptal Edildi</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="cargoCompany"
            label="Kargo Firması"
          >
            <Select placeholder="Kargo Firması Seçin" allowClear>
              {CARGO_COMPANIES.map((company) => (
                <Option key={company} value={company}>{company}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="trackingNumber"
            label="Kargo Takip Numarası"
          >
            <Input placeholder="Örn: 1234567890" allowClear />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
            <Button onClick={() => setIsEditModalOpen(false)}>
              İptal
            </Button>
            <Button type="primary" htmlType="submit" loading={updating}>
              Kaydet ve Güncelle
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default OrdersList;