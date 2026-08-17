import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Button,
  message,
  Input,
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Tooltip
} from 'antd';
import {
  ScissorOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  UserOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminCouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form] = Form.useForm();

  // Kupon ve Müşteri Listesini Yükle
  const fetchData = async () => {
    setLoading(true);
    try {
      const [couponsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/coupons/admin/list`),
        axios.get(`${API_URL}/api/users`)
      ]);
      setCoupons(couponsRes.data);
      setFilteredCoupons(couponsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      message.error('Veriler yüklenirken sunucu bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Arama / Filtreleme
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    const filtered = coupons.filter((c) => {
      const codeMatch = c.code.toLowerCase().includes(value);
      const titleMatch = c.title.toLowerCase().includes(value);
      const userMatch = c.user_email ? c.user_email.toLowerCase().includes(value) : false;
      const userNameMatch = c.user_name ? `${c.user_name} ${c.user_surname}`.toLowerCase().includes(value) : false;

      return codeMatch || titleMatch || userMatch || userNameMatch;
    });

    setFilteredCoupons(filtered);
  };

  // Rastgele Kupon Kodu Üretici
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldsValue({ code: result });
  };

  // Yeni Kupon Oluştur
  const handleCreateCoupon = async (values) => {
    try {
      const payload = {
        userId: values.userId === 'all' ? null : values.userId,
        code: values.code,
        title: values.title,
        description: values.description,
        discountAmount: values.discountAmount,
        discountType: values.discountType,
        minSpend: values.minSpend || 0,
        badge: values.badge,
        startDate: values.dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
        endDate: values.dateRange[1].format('YYYY-MM-DD HH:mm:ss')
      };

      await axios.post(`${API_URL}/api/coupons/admin/create`, payload);
      message.success('Kupon başarıyla tanımlandı!');
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Kupon eklenirken hata oluştu.');
    }
  };

  // Kupon Sil
  const handleDeleteCoupon = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/coupons/admin/${id}`);
      message.success('Kupon başarıyla silindi.');
      fetchData();
    } catch (error) {
      message.error('Kupon silinirken bir hata oluştu.');
    }
  };

  // Tablo Kolonları
  const columns = [
    {
      title: 'Kupon Kodu & Başlık',
      key: 'code',
      render: (_, record) => (
        <div>
          <Space>
            <Tag color="volcano" style={{ fontWeight: 'bold', fontSize: 13, padding: '2px 8px' }}>
              {record.code}
            </Tag>
            {record.badge && <Tag color="blue">{record.badge}</Tag>}
          </Space>
          <div style={{ fontWeight: 600, marginTop: 4 }}>{record.title}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
        </div>
      )
    },
    {
      title: 'Hedef Kullanıcı',
      key: 'target_user',
      render: (_, record) => (
        record.user_id ? (
          <Space direction="vertical" size={0}>
            <Tag color="magenta" icon={<UserOutlined />}>
              {record.user_name} {record.user_surname}
            </Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>{record.user_email}</Text>
          </Space>
        ) : (
          <Tag color="green">Tüm Kullanıcılar (Genel)</Tag>
        )
      )
    },
    {
      title: 'İndirim Tutar / Koşul',
      key: 'discount',
      render: (_, record) => (
        <div>
          <strong style={{ color: '#eb2f96', fontSize: 15 }}>
            {record.discount_type === 'percentage' ? `%${record.discount_amount}` : `${record.discount_amount} TL`}
          </strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Min. Alışveriş: {record.min_spend > 0 ? `${record.min_spend} TL` : 'Yok'}
          </div>
        </div>
      )
    },
    {
      title: 'Geçerlilik Tarihi',
      key: 'dates',
      render: (_, record) => {
        const isExpired = dayjs().isAfter(dayjs(record.end_date));
        return (
          <div style={{ fontSize: 12 }}>
            <div>Başlangıç: {dayjs(record.start_date).format('DD.MM.YYYY HH:mm')}</div>
            <div>Bitiş: {dayjs(record.end_date).format('DD.MM.YYYY HH:mm')}</div>
            {isExpired ? (
              <Tag color="red" icon={<ClockCircleOutlined />} style={{ marginTop: 2 }}>Süresi Doldu</Tag>
            ) : (
              <Tag color="success" icon={<CheckCircleOutlined />} style={{ marginTop: 2 }}>Aktif</Tag>
            )}
          </div>
        );
      }
    },
    {
      title: 'İşlem',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Popconfirm
          title="Kuponu Sil"
          description="Bu kuponu silmek istediğinize emin misiniz?"
          onConfirm={() => handleDeleteCoupon(record.id)}
          okText="Evet, Sil"
          cancelText="Vazgeç"
          okButtonProps={{ danger: true }}
        >
          <Button danger ghost icon={<DeleteOutlined />} size="small">
            Sil
          </Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div style={{ padding: '0px' }}>
      {/* Üst Bilgi Kartı */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <ScissorOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
            Kupon Yönetim Paneli
          </Title>
          <Text type="secondary">
            Müşterilere özel tanımlanan veya tüm sisteme açık indirim kuponlarının yönetimi.
          </Text>
        </div>
        <Space>
          <Button type="default" icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#eb2f96', borderColor: '#eb2f96' }}>
            Yeni Kupon Tanımla
          </Button>
        </Space>
      </div>

      {/* İstatistikler */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={8}>
          <Card variant="borderless">
            <Statistic title="Toplam Kupon" value={coupons.length} prefix={<GiftOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card variant="borderless">
            <Statistic
              title="Özel (Kullanıcıya Tanımlı)"
              value={coupons.filter(c => c.user_id !== null).length}
              valueStyle={{ color: '#722ed1' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless">
            <Statistic
              title="Aktif Kupon Sayısı"
              value={coupons.filter(c => dayjs().isBefore(dayjs(c.end_date))).length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Arama Alanı */}
      <div style={{ marginBottom: 16, maxWidth: 400 }}>
        <Input
          placeholder="Kupon kodu, başlık veya müşteri e-postası ara..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={searchText}
          onChange={handleSearch}
          allowClear
        />
      </div>

      {/* Tablo */}
      <Card variant="borderless">
        <Table
          columns={columns}
          dataSource={filteredCoupons}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Yeni Kupon Ekleme Modalı */}
      <Modal
        title="Yeni İndirim Kuponu Oluştur"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={650}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCoupon}
          initialValues={{
            discountType: 'fixed',
            badge: 'Fırsat',
            userId: 'all',
            minSpend: 0
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="userId"
            label="Hedef Müşteri / Kullanıcı"
            rules={[{ required: true, message: 'Lütfen kullanıcı seçimi yapın.' }]}
          >
            <Select showSearch placeholder="Tüm Kullanıcılar veya Belirli Bir Müşteri Seçin" filterOption={(input, option) =>
              (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }>
              <Option value="all">🌍 Tüm Kullanıcılar (Genel Kupon)</Option>
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  👤 {u.name} {u.surname} ({u.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="code"
                label="Kupon Kodu"
                rules={[{ required: true, message: 'Kupon kodu giriniz.' }]}
              >
                <Input placeholder="Örn: OZELINDIRIM100" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={8} style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 24 }}>
              <Button type="dashed" onClick={generateRandomCode} style={{ width: '100%' }}>
                Kod Üret
              </Button>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="Kupon Başlığı"
            rules={[{ required: true, message: 'Başlık giriniz.' }]}
          >
            <Input placeholder="Örn: Size Özel 100 TL İndirim Kuponu" />
          </Form.Item>

          <Form.Item name="description" label="Açıklama / Koşul Metni">
            <Input.TextArea rows={2} placeholder="Örn: 1000 TL ve üzeri siparişlerde geçerlidir." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="discountType" label="İndirim Tipi">
                <Select>
                  <Option value="fixed">Sabit TL Tutarı</Option>
                  <Option value="percentage">Yüzde (%)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="discountAmount"
                label="İndirim Değeri"
                rules={[{ required: true, message: 'Miktar girin.' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="100" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="minSpend" label="Min. Harcama (TL)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="badge" label="Rozet Etiketi">
                <Select>
                  <Option value="Özel VIP">Özel VIP</Option>
                  <Option value="Sınırlı Stok">Sınırlı Stok</Option>
                  <Option value="Fırsat">Fırsat</Option>
                  <Option value="Popüler">Popüler</Option>
                  <Option value="Katlanan">Katlanan</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="Geçerlilik Tarih Aralığı"
                rules={[{ required: true, message: 'Tarih aralığı seçiniz.' }]}
              >
                <RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 12 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>İptal</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#eb2f96', borderColor: '#eb2f96' }}>
                Kuponu Tanımla
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCouponManager;