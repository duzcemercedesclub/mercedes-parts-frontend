import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Card,
  Typography,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Avatar,
  Tag,
  Tabs,
  Rate
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  CommentOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const TestimonialManagement = () => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Soru Cevaplama Modalı Durumları
  const [answerModalOpen, setAnswerModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [form] = Form.useForm();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Token'ın dinamik ve güncel alınması için helper fonksiyon
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { 
        Authorization: token ? `Bearer ${token}` : '' 
      }
    };
  };

  // 1. Yorumları Çek
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/reviews`, getAuthHeaders());
      setReviews(res.data);
    } catch (error) {
      if (error.response?.status === 403) {
        message.error('Bu işlem için admin yetkiniz yok veya oturumunuz doldu.');
      } else {
        message.error('Yorumlar yüklenirken hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Soruları Çek
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/questions`, getAuthHeaders());
      setQuestions(res.data);
    } catch (error) {
      if (error.response?.status === 403) {
        message.error('Bu işlem için admin yetkiniz yok veya oturumunuz doldu.');
      } else {
        message.error('Sorular yüklenirken hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    } else {
      fetchQuestions();
    }
  }, [activeTab]);

  // Yorum Durumu Güncelle (Onayla / Reddet)
  const handleUpdateReviewStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/admin/reviews/${id}/status`, { status }, getAuthHeaders());
      message.success(`Yorum "${status}" olarak işaretlendi.`);
      fetchReviews();
    } catch (error) {
      message.error('İşlem gerçekleştirilemedi.');
    }
  };

  // Yorum Sil
  const handleDeleteReview = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/reviews/${id}`, getAuthHeaders());
      message.success('Yorum başarıyla silindi.');
      fetchReviews();
    } catch (error) {
      message.error('Silme işlemi başarısız.');
    }
  };

  // Soru Cevapla Modal Aç
  const handleOpenAnswerModal = (record) => {
    setSelectedQuestion(record);
    form.setFieldsValue({ answer: record.answer || '' });
    setAnswerModalOpen(true);
  };

  // Soru Cevabını Kaydet
  const handleSaveAnswer = async (values) => {
    if (!selectedQuestion) return;
    setSubmitLoading(true);
    try {
      await axios.put(
        `${API_URL}/api/admin/questions/${selectedQuestion.id}/answer`,
        { answer: values.answer },
        getAuthHeaders()
      );
      message.success('Cevabınız iletildi ve yayınlandı.');
      setAnswerModalOpen(false);
      form.resetFields();
      fetchQuestions();
    } catch (error) {
      message.error('Cevap kaydedilirken hata oluştu.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Soru Sil
  const handleDeleteQuestion = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/questions/${id}`, getAuthHeaders());
      message.success('Soru silindi.');
      fetchQuestions();
    } catch (error) {
      message.error('Silme işlemi başarısız.');
    }
  };

  // YORUMLAR TABLO SÜTUNLARI
  const reviewColumns = [
    {
      title: 'Ürün',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.product_image} shape="square" size={40} />
          <Text strong style={{ fontSize: 13 }}>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Müşteri',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{record.user_email}</Text>
        </div>
      )
    },
    {
      title: 'Puan',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating) => <Rate disabled defaultValue={rating} style={{ fontSize: 12 }} />
    },
    {
      title: 'Yorum Metni',
      dataIndex: 'comment',
      key: 'comment',
      render: (text) => <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>{text || '—'}</Paragraph>
    },
    {
      title: 'Tarih',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (date) => date ? new Date(date).toLocaleDateString('tr-TR') : '-'
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        if (status === 'Onaylandı') return <Tag color="success">Onaylandı</Tag>;
        if (status === 'Reddedildi') return <Tag color="error">Reddedildi</Tag>;
        return <Tag color="warning">Onay Bekliyor</Tag>;
      }
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          {record.status !== 'Onaylandı' && (
            <Button
              type="text"
              icon={<CheckOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleUpdateReviewStatus(record.id, 'Onaylandı')}
              title="Onayla"
            />
          )}
          {record.status !== 'Reddedildi' && (
            <Button
              type="text"
              icon={<CloseOutlined style={{ color: '#fa8c16' }} />}
              onClick={() => handleUpdateReviewStatus(record.id, 'Reddedildi')}
              title="Reddet"
            />
          )}
          <Popconfirm
            title="Yorumu silmek istediğinize emin misiniz?"
            onConfirm={() => handleDeleteReview(record.id)}
            okText="Evet"
            cancelText="Hayır"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="Sil" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // SORULAR TABLO SÜTUNLARI
  const questionColumns = [
    {
      title: 'Ürün',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.product_image} shape="square" size={40} />
          <Text strong style={{ fontSize: 13 }}>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Müşteri',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{record.user_email}</Text>
        </div>
      )
    },
    {
      title: 'Müşteri Sorusu',
      dataIndex: 'question',
      key: 'question',
      render: (text) => <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, fontWeight: 500 }}>"{text}"</Paragraph>
    },
    {
      title: 'Mağaza Cevabı',
      dataIndex: 'answer',
      key: 'answer',
      render: (text) => text ? (
        <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, color: '#2f54eb' }}>{text}</Paragraph>
      ) : (
        <Text type="secondary" italic>Henüz yanıtlanmadı</Text>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_, record) => record.answer ? (
        <Tag color="blue">Cevaplandı</Tag>
      ) : (
        <Tag color="orange">Cevap Bekliyor</Tag>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 130,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<MessageOutlined />}
            onClick={() => handleOpenAnswerModal(record)}
          >
            {record.answer ? 'Düzenle' : 'Cevapla'}
          </Button>
          <Popconfirm
            title="Soruyu silmek istediğinize emin misiniz?"
            onConfirm={() => handleDeleteQuestion(record.id)}
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

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Ürün Yorumları & Soru-Cevap Yönetimi</Title>
        <Text type="secondary">
          Müşterilerinizin ürün sayfalarından sordukları soruları yanıtlayın ve yapılan değerlendirmeleri onaylayın.
        </Text>
      </div>

      <Card variant="borderless">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'reviews',
              label: (
                <span>
                  <CommentOutlined />
                  Ürün Değerlendirmeleri ({reviews.filter((r) => r.status === 'Onay Bekliyor').length} Bekleyen)
                </span>
              ),
              children: (
                <Table
                  columns={reviewColumns}
                  dataSource={reviews}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 8 }}
                />
              )
            },
            {
              key: 'questions',
              label: (
                <span>
                  <QuestionCircleOutlined />
                  Ürün Soruları ({questions.filter((q) => !q.answer).length} Yanıtsız)
                </span>
              ),
              children: (
                <Table
                  columns={questionColumns}
                  dataSource={questions}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 8 }}
                />
              )
            }
          ]}
        />
      </Card>

      {/* SORU CEVAPLAMA MODALI */}
      <Modal
        title="Müşteri Sorununu Yanıtla"
        open={answerModalOpen}
        onCancel={() => setAnswerModalOpen(false)}
        footer={null}
        destroyOnHidden
        centered
      >
        {selectedQuestion && (
          <div>
            <div style={{ backgroundColor: '#fafafa', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>İlgili Ürün: {selectedQuestion.product_name}</Text>
              <Paragraph style={{ margin: '6px 0 0 0', fontWeight: 600 }}>
                "{selectedQuestion.question}"
              </Paragraph>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Soran: {selectedQuestion.user_name} | {selectedQuestion.created_at ? new Date(selectedQuestion.created_at).toLocaleDateString('tr-TR') : ''}
              </Text>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSaveAnswer}>
              <Form.Item
                name="answer"
                label="Mağaza Yanıtınız"
                rules={[{ required: true, message: 'Lütfen cevap metnini yazınız.' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Müşteriye iletilecek açıklayıcı yanıt metnini giriniz..."
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setAnswerModalOpen(false)}>İptal</Button>
                  <Button type="primary" htmlType="submit" loading={submitLoading}>
                    Yanıtı Yayınla
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

export default TestimonialManagement;