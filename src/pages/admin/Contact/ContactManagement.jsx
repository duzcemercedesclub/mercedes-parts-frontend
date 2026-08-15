import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tabs,
  Form,
  Input,
  Tag,
  Space,
  Modal,
  Popconfirm,
  message,
  Typography,
  Badge,
  Row,
  Col,
  Tooltip,
  Divider,
  Spin
} from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  InboxOutlined,
  ReloadOutlined,
  FileTextOutlined,
  FontSizeOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ContactManagement = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Modal Durumları
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replySubmitLoading, setReplySubmitLoading] = useState(false);

  const [settingsForm] = Form.useForm();
  const [replyForm] = Form.useForm();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    };
  };

  // 1. Gelen Mesajları Çek
  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await axios.get(`${API_URL}/api/contact/admin/messages`, getAuthHeaders());
      setMessages(res.data);
    } catch (error) {
      message.error('Mesajlar yüklenirken bir hata oluştu.');
    } finally {
      setLoadingMessages(false);
    }
  };

  // 2. İletişim & Harita Ayarlarını Çek
  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/contact/settings`);
      settingsForm.setFieldsValue(res.data);
    } catch (error) {
      message.error('İletişim ayarları çekilemedi.');
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchSettings();
  }, []);

  // Mesaj Detayını Aç
  const handleOpenDetail = async (record) => {
    setSelectedMsg(record);
    setDetailModalOpen(true);

    if (record.status === 'Okunmadı') {
      try {
        await axios.put(`${API_URL}/api/contact/admin/messages/${record.id}/status`, { status: 'Okundu' }, getAuthHeaders());
        fetchMessages();
      } catch (err) {
        console.error('Durum güncellenemedi');
      }
    }
  };

  // Yanıt Verme Modalı Aç
  const handleOpenReply = (record) => {
    setSelectedMsg(record);
    replyForm.resetFields();
    setReplyModalOpen(true);
  };

  // Müşteriye Yanıt E-Postası Gönder (SMTP)
  const handleSendReply = async (values) => {
    if (!selectedMsg) return;
    setReplySubmitLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/contact/admin/messages/${selectedMsg.id}/reply`,
        {
          replyMessage: values.replyMessage,
          customerEmail: selectedMsg.email,
          subject: selectedMsg.subject
        },
        getAuthHeaders()
      );
      message.success('Yanıt e-postası müşteriye başarıyla iletildi.');
      setReplyModalOpen(false);
      replyForm.resetFields();
      fetchMessages();
    } catch (error) {
      message.error(error.response?.data?.message || 'E-posta gönderilirken hata oluştu.');
    } finally {
      setReplySubmitLoading(false);
    }
  };

  // Mesaj Sil
  const handleDeleteMessage = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/contact/admin/messages/${id}`, getAuthHeaders());
      message.success('Mesaj silindi.');
      fetchMessages();
    } catch (error) {
      message.error('Mesaj silinirken hata oluştu.');
    }
  };

  // İletişim Ayarlarını Kaydet
  const handleSaveSettings = async (values) => {
    setSaveLoading(true);
    try {
      await axios.put(`${API_URL}/api/contact/admin/settings`, values, getAuthHeaders());
      message.success('İletişim bilgileri ve içerikler güncellendi.');
    } catch (error) {
      message.error('Ayarlar kaydedilirken hata oluştu.');
    } finally {
      setSaveLoading(false);
    }
  };

  // TABLO SÜTUNLARI
  const messageColumns = [
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        if (status === 'Cevaplandı') return <Tag color="green"><CheckCircleOutlined /> Cevaplandı</Tag>;
        if (status === 'Okundu') return <Tag color="blue">Okundu</Tag>;
        return <Tag color="volcano"><Badge status="processing" /> Okunmadı</Tag>;
      }
    },
    {
      title: 'Gönderen',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
        </div>
      )
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone) => phone || '-'
    },
    {
      title: 'Konu',
      dataIndex: 'subject',
      key: 'subject',
      render: (text) => <Text strong style={{ color: '#2b4c7e' }}>{text || 'İletişim Formu'}</Text>
    },
    {
      title: 'Mesaj Özeti',
      dataIndex: 'message',
      key: 'message',
      render: (text) => <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, maxWidth: 260 }}>{text}</Paragraph>
    },
    {
      title: 'Tarih',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      render: (date) => date ? new Date(date).toLocaleString('tr-TR') : '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Detayları Gör">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => handleOpenDetail(record)}
            />
          </Tooltip>
          <Tooltip title="E-Posta İle Yanıtla">
            <Button
              type="text"
              icon={<SendOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenReply(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bu mesajı silmek istediğinize emin misiniz?"
            onConfirm={() => handleDeleteMessage(record.id)}
            okText="Evet"
            cancelText="Hayır"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const unreadCount = messages.filter((m) => m.status === 'Okunmadı').length;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>İletişim & Mesaj Yönetimi</Title>
          <Text type="secondary">
            Müşterilerinizden gelen iletişim taleplerini inceleyin, yanıtlayın ve iletişim bilgilerinizi güncelleyin.
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => { fetchMessages(); fetchSettings(); }}>
          Yenile
        </Button>
      </div>

      <Card variant="borderless">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'messages',
              label: (
                <span>
                  <InboxOutlined />
                  Gelen Mesajlar {unreadCount > 0 && <Badge count={unreadCount} style={{ marginLeft: 8 }} />}
                </span>
              ),
              children: (
                <Table
                  columns={messageColumns}
                  dataSource={messages}
                  rowKey="id"
                  loading={loadingMessages}
                  pagination={{ pageSize: 8 }}
                />
              )
            },
            {
              key: 'settings',
              label: (
                <span>
                  <SettingOutlined />
                  İletişim Bilgileri & İçerik Yönetimi
                </span>
              ),
              children: (
                <Spin spinning={settingsLoading}>
                  <Form form={settingsForm} layout="vertical" onFinish={handleSaveSettings}>
                    
                    <Divider orientation="left" style={{ borderColor: '#2b4c7e' }}>
                      <FontSizeOutlined /> Sayfa Metin İçerikleri
                    </Divider>

                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="info_title"
                          label="Sol Kolon Başlığı"
                          rules={[{ required: true, message: 'Lütfen başlık giriniz.' }]}
                        >
                          <Input prefix={<FontSizeOutlined />} placeholder="Bizimle İletişime Geçin" />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          name="info_description"
                          label="Sol Kolon Açıklama Metni"
                          rules={[{ required: true, message: 'Lütfen açıklama metnini giriniz.' }]}
                        >
                          <TextArea
                            rows={3}
                            placeholder="Yedek parça sorgulamaları, sipariş durumları veya genel sorularınız için..."
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider orientation="left" style={{ borderColor: '#2b4c7e' }}>
                      <FileTextOutlined /> İletişim Detayları
                    </Divider>

                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="email"
                          label="Kurumsal E-Posta Adresi"
                          rules={[{ required: true, message: 'Lütfen e-posta giriniz.' }]}
                        >
                          <Input prefix={<MailOutlined />} placeholder="info@mercedesclub.com" />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          name="phone"
                          label="Telefon Numarası"
                          rules={[{ required: true, message: 'Lütfen telefon giriniz.' }]}
                        >
                          <Input prefix={<PhoneOutlined />} placeholder="+90 (380) 123 45 67" />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          name="address"
                          label="Fiziksel Adres"
                          rules={[{ required: true, message: 'Lütfen adres giriniz.' }]}
                        >
                          <TextArea rows={3} placeholder="Sanayi Sitesi, Mercedes Sokak No: 12, Düzce" />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          name="working_hours"
                          label="Çalışma Saatleri"
                          rules={[{ required: true, message: 'Lütfen çalışma saatlerini giriniz.' }]}
                        >
                          <TextArea rows={3} placeholder="Hafta İçi & Cumartesi: 08:30 - 18:30&#10;Pazar: Kapalı" />
                        </Form.Item>
                      </Col>

                      <Col xs={24}>
                        <Form.Item
                          name="map_url"
                          label="Google Maps Iframe / Embed URL"
                          extra="Google Haritalar'dan 'Haritayı yerleştir' seçeneğindeki src URL'sini yapıştırın."
                        >
                          <Input prefix={<EnvironmentOutlined />} placeholder="https://www.google.com/maps/embed?pb=..." />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Canlı Harita Önizlemesi */}
                    <Form.Item shouldUpdate={(prev, curr) => prev.map_url !== curr.map_url}>
                      {() => {
                        const url = settingsForm.getFieldValue('map_url');
                        return url ? (
                          <div style={{ marginBottom: 20, borderRadius: 8, overflow: 'hidden', border: '1px solid #d9d9d9' }}>
                            <Text type="secondary" style={{ display: 'block', padding: '8px 12px', background: '#fafafa' }}>
                              Harita Önizlemesi:
                            </Text>
                            <iframe
                              title="Map Preview"
                              src={url}
                              width="100%"
                              height="250"
                              style={{ border: 0 }}
                              allowFullScreen=""
                              loading="lazy"
                            ></iframe>
                          </div>
                        ) : null;
                      }}
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right' }}>
                      <Button type="primary" htmlType="submit" loading={saveLoading} size="large">
                        Ayarları Kaydet
                      </Button>
                    </Form.Item>
                  </Form>
                </Spin>
              )
            }
          ]}
        />
      </Card>

      {/* MESAJ DETAY MODALI */}
      <Modal
        title="İletişim Mesajı Detayı"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Kapat
          </Button>,
          <Button
            key="reply"
            type="primary"
            icon={<SendOutlined />}
            onClick={() => {
              setDetailModalOpen(false);
              handleOpenReply(selectedMsg);
            }}
          >
            Müşteriye Yanıt Ver
          </Button>
        ]}
        destroyOnHidden
        centered
      >
        {selectedMsg && (
          <div style={{ padding: '10px 0' }}>
            <p><strong>Gönderen:</strong> {selectedMsg.name}</p>
            <p><strong>E-Posta:</strong> {selectedMsg.email}</p>
            <p><strong>Telefon:</strong> {selectedMsg.phone || 'Belirtilmedi'}</p>
            <p><strong>Tarih:</strong> {new Date(selectedMsg.created_at).toLocaleString('tr-TR')}</p>
            <p><strong>Konu:</strong> {selectedMsg.subject || 'Genel İletişim'}</p>
            <Divider />
            <Text strong>Gelen Mesaj:</Text>
            <div style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 6, marginTop: 8, whiteSpace: 'pre-wrap' }}>
              {selectedMsg.message}
            </div>

            {selectedMsg.admin_reply && (
              <>
                <Divider />
                <Text strong style={{ color: '#52c41a' }}>Gönderilen Yanıt ({new Date(selectedMsg.replied_at).toLocaleString('tr-TR')}):</Text>
                <div style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', padding: 12, borderRadius: 6, marginTop: 8, whiteSpace: 'pre-wrap' }}>
                  {selectedMsg.admin_reply}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* MÜŞTERİYE E-POSTA YANITLAMA MODALI */}
      <Modal
        title="Müşteriye E-Posta İle Yanıt Gönder"
        open={replyModalOpen}
        onCancel={() => setReplyModalOpen(false)}
        footer={null}
        destroyOnHidden
        centered
      >
        {selectedMsg && (
          <div>
            <div style={{ backgroundColor: '#f0f5ff', padding: 12, borderRadius: 6, marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Alıcı Müşteri:</Text>
              <br />
              <Text strong>{selectedMsg.name} ({selectedMsg.email})</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>Konu: Re: {selectedMsg.subject || 'İletişim Talebiniz'}</Text>
            </div>

            <Form form={replyForm} layout="vertical" onFinish={handleSendReply}>
              <Form.Item
                name="replyMessage"
                label="E-Posta Yanıtınız"
                rules={[{ required: true, message: 'Lütfen müşteriye iletilecek yanıtı yazınız.' }]}
              >
                <TextArea
                  rows={6}
                  placeholder="Sayın müşterimiz, iletmiş olduğunuz mesajınız doğrultusunda..."
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setReplyModalOpen(false)}>İptal</Button>
                  <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={replySubmitLoading}>
                    Yanıtı Gönder (SMTP)
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContactManagement;