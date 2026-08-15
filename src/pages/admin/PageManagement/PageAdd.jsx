import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Switch, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axios from 'axios';

const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'clean']
  ]
};

const PageAdd = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/pages`, values);
      message.success('Kurumsal sayfa başarıyla oluşturuldu ve yayına alındı!');
      navigate('/admin/pages');
    } catch (error) {
      message.error(error.response?.data?.message || 'Sayfa eklenirken teknik bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/pages')} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Yeni Sayfa Ekle</Title>
          <Text type="secondary">Yazacağınız başlığa göre SEO uyumlu link sistem tarafından otomatik üretilir.</Text>
        </div>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ is_active: true }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
            <Form.Item 
              name="title" 
              label="Sayfa / Sözleşme Başlığı" 
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Lütfen sayfa başlığını girin!' }]}
            >
              <Input placeholder="Örn: Kullanıcı Sözleşmesi ve Üyelik Şartları" />
            </Form.Item>

            <Form.Item name="is_active" label="Doğrudan Yayınla" valuePropName="checked" style={{ width: 140 }}>
              <Switch checkedChildren="Aktif" unCheckedChildren="Taslak" />
            </Form.Item>
          </div>

          <Form.Item 
            name="content" 
            label="Sayfa İçerik Metni" 
            rules={[{ required: true, message: 'Sayfa içeriği boş bırakılamaz!' }]}
          >
            <ReactQuill 
              theme="snow"
              modules={modules}
              placeholder="Sözleşme maddelerini, yasal yükümlülükleri ve detaylı metinleri buraya yazın..."
              style={{ height: '320px', marginBottom: '60px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />} size="large">
              {submitting ? 'Kaydediliyor...' : 'Sayfayı Veritabanına Yaz'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PageAdd;