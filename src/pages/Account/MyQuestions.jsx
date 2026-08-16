import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Tag,
  Button,
  Input,
  Space,
  Avatar,
  Modal,
  Form,
  Select,
  Spin,
  Empty,
  message
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ShopOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import './responsive.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const MyQuestions = () => {
  const { token } = useAuth ? useAuth() : { token: localStorage.getItem('token') };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [productsList, setProductsList] = useState([]);

  const [form] = Form.useForm();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchMyQuestions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/user/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setTickets(data);
      } else {
        message.error(data.message || 'Sorularınız getirilemedi.');
      }
    } catch (error) {
      console.error('Soru çekme hatası:', error);
      message.error('Sunucu bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      if (response.ok) {
        setProductsList(data);
      }
    } catch (error) {
      console.error('Ürün çekme hatası:', error);
    }
  };

  useEffect(() => {
    fetchMyQuestions();
    fetchProducts();
  }, [token]);

  const handleCreateQuestion = async (values) => {
    if (!token) {
      message.error('Oturum açmanız gerekmektedir.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/user/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: values.productId,
          question: values.question
        })
      });

      const data = await response.json();

      if (response.ok) {
        message.success(data.message || 'Sorunuz mağazaya iletilmiştir.');
        setIsModalOpen(false);
        form.resetFields();
        fetchMyQuestions();
      } else {
        message.error(data.message || 'Soru iletilemedi.');
      }
    } catch (error) {
      console.error('Ekleme hatası:', error);
      message.error('Sunucu hatası oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter(
    (item) =>
      item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.question?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Soru ve Cevaplarım
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Satıcılara yönelttiğiniz tüm soruları ve yanıtları takip edebilirsiniz.
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            className="mobile-full-width"
            onClick={() => setIsModalOpen(true)}
            style={{ borderRadius: 8, backgroundColor: '#1677ff' }}
          >
            Yeni Soru Sor
          </Button>
        </div>
      </Card>

      <Input
        placeholder="Ürün veya soru ara..."
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        size="large"
        allowClear
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ borderRadius: 10, marginBottom: 16 }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" description="Sorularınız yükleniyor..." />
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '40px 0' }}>
          <Empty description="Henüz sorduğunuz bir soru bulunmamaktadır." />
        </Card>
      ) : (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {filteredTickets.map((item) => (
            <Card
              key={item.id}
              hoverable
              onClick={() => setSelectedTicket(item)}
              style={{
                borderRadius: 12,
                border: '1px solid #e8e8e8',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
              styles={{ body: { padding: 16 } }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                <Avatar
                  shape="square"
                  size={52}
                  src={item.productImage}
                  icon={<ShopOutlined />}
                  style={{ borderRadius: 8, flexShrink: 0, border: '1px solid #f0f0f0' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                    <Text strong style={{ fontSize: 14, color: '#262626' }} ellipsis>
                      {item.productName}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {item.date}
                    </Text>
                  </div>

                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{ margin: '6px 0', color: '#595959', fontWeight: 500, wordBreak: 'break-word' }}
                  >
                    "{item.question}"
                  </Paragraph>

                  <div>
                    {item.reply ? (
                      <Tag icon={<CheckCircleFilled />} color="success" style={{ borderRadius: 10 }}>
                        Mağaza Cevapladı
                      </Tag>
                    ) : (
                      <Tag icon={<ClockCircleOutlined />} color="warning" style={{ borderRadius: 10 }}>
                        Cevap Bekliyor
                      </Tag>
                    )}
                  </div>
                </div>
                <RightOutlined style={{ color: '#bfbfbf', alignSelf: 'center', fontSize: 14, flexShrink: 0 }} />
              </div>
            </Card>
          ))}
        </Space>
      )}

      {/* Soru Detay Modalı */}
      <Modal
        title="Soru Talebi Detayı"
        open={!!selectedTicket}
        onCancel={() => setSelectedTicket(null)}
        zIndex={2000}
        centered
        footer={[
          <Button key="close" onClick={() => setSelectedTicket(null)}>
            Kapat
          </Button>
        ]}
      >
        {selectedTicket && (
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>İlgili Ürün:</Text>
            <Title level={5} style={{ marginTop: 2 }}>{selectedTicket.productName}</Title>

            <div style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginTop: 12 }}>
              <Text strong style={{ fontSize: 12, color: '#8c8c8c' }}>
                Sizin Sorunuz ({selectedTicket.date}):
              </Text>
              <p style={{ margin: '4px 0 0 0', fontWeight: 500, wordBreak: 'break-word' }}>{selectedTicket.question}</p>
            </div>

            {selectedTicket.reply ? (
              <div
                style={{
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 12
                }}
              >
                <Text strong style={{ fontSize: 12, color: '#52c41a' }}>Mağaza Yanıtı:</Text>
                <p style={{ margin: '4px 0 0 0', wordBreak: 'break-word' }}>{selectedTicket.reply}</p>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <Tag color="warning">Mağaza henüz bu soruyu yanıtlamadı.</Tag>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Yeni Soru Oluşturma Modalı */}
      <Modal
        title="Mağazaya Soru Sor"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        zIndex={2000}
        centered
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateQuestion} style={{ marginTop: 16 }}>
          <Form.Item
            name="productId"
            label="Soru Sorulacak Ürün"
            rules={[{ required: true, message: 'Lütfen bir ürün seçin.' }]}
          >
            <Select showSearch placeholder="Ürün adı yazarak arayın..." optionFilterProp="children" virtual={false}>
              {productsList.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="question"
            label="Sorunuz"
            rules={[{ required: true, message: 'Lütfen sorunuzu giriniz.' }]}
          >
            <Input.TextArea rows={4} placeholder="Ürün uyumluluğu veya teknik detay hakkında sorun..." />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={submitting}
            style={{ borderRadius: 8, marginTop: 12 }}
          >
            Soruyu Gönder
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default MyQuestions;