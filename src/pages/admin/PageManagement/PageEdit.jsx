import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Switch, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axios from 'axios';

const { Title, Text } = Typography;

// ReactQuill araç çubuğu konfigürasyonu
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'clean']
  ]
};

const PageEdit = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPageDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/pages/${id}`);
        // Veritabanındaki verileri form alanlarına dolduruyoruz
        form.setFieldsValue({
          ...response.data,
          is_active: response.data.is_active === 1
        });
      } catch (error) {
        message.error('Sayfa detayları yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchPageDetail();
  }, [id, form]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await axios.put(`http://localhost:5000/api/pages/${id}`, values);
      message.success('Sayfa içeriği başarıyla güncellendi!');
      navigate('/admin/pages');
    } catch (error) {
      message.error('Güncelleme esnasında teknik bir sorun oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Veriler getiriliyor...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/pages')} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Sayfa Düzenle</Title>
          <Text type="secondary">Mevcut metinleri düzenleyin. Başlığı değiştirdiğinizde URL linki de otomatik güncellenir.</Text>
        </div>
      </div>

      <Card bordered={false}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
            <Form.Item 
              name="title" 
              label="Sayfa / Sözleşme Başlığı" 
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Başlık boş bırakılamaz!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="is_active" label="Yayın Durumu" valuePropName="checked" style={{ width: 140 }}>
              <Switch checkedChildren="Aktif" unCheckedChildren="Taslak" />
            </Form.Item>
          </div>

          <Form.Item 
            name="content" 
            label="Sayfa İçerik Metni" 
            rules={[{ required: true, message: 'İçerik boş bırakılamaz!' }]}
          >
            <ReactQuill 
              theme="snow"
              modules={modules}
              style={{ height: '320px', marginBottom: '60px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />} size="large">
              {submitting ? 'Değişiklikler Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PageEdit;