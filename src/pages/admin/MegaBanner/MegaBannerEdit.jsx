import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Upload, Image, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MegaBannerEdit = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchBannerDetail = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/mega-banners/${id}`);
        form.setFieldsValue(response.data);
        setCurrentImage(response.data.image_url);
      } catch (error) {
        message.error('Detaylar veritabanından çekilemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchBannerDetail();
  }, [id, form]);

  const onFinish = async (values) => {
    setUpdating(true);
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('subtitle', values.subtitle || '');
    formData.append('discount_text', values.discount_text || '');
    formData.append('btn_link', values.btn_link);
    formData.append('current_image', currentImage);

    if (fileList.length > 0) {
      formData.append('image', fileList[0]);
    }

    try {
      await axios.put(`${API_URL}/api/mega-banners/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Mega Banner başarıyla güncellendi!');
      navigate('/admin/banners');
    } catch (error) {
      message.error('Güncelleme sırasında hata meydana geldi.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Veriler yükleniyor...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/banners')} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Banner Düzenle</Title>
          <Text type="secondary">Mevcut görseli koruyabilir veya bilgisayarınızdan yenisini seçebilirsiniz.</Text>
        </div>
      </div>

      <Card bordered={false} style={{ maxWidth: 750 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="Kampanya Başlığı" rules={[{ required: true, message: 'Boş bırakılamaz' }]}>
            <Input />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="subtitle" label="Üst Başlık" style={{ flex: 1 }}><Input /></Form.Item>
            <Form.Item name="discount_text" label="İndirim Metni" style={{ flex: 1 }}><Input /></Form.Item>
          </div>

          <Form.Item name="btn_link" label="Buton Linki"><Input /></Form.Item>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#4a5568' }}>Aktif Banner Görseli</label>
            <Image src={currentImage} width={240} style={{ borderRadius: 6, border: '1px solid #eee' }} />
          </div>

          <Form.Item label="Görseli Değiştir (İstemiyorsanız Dokunmayın)">
            <Upload
              beforeUpload={(file) => { setFileList([file]); return false; }}
              fileList={fileList}
              onRemove={() => setFileList([])}
              accept="image/*"
            >
              {fileList.length < 1 && <Button icon={<UploadOutlined />}>Yeni Dosya Seç</Button>}
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={updating} icon={<SaveOutlined />}>
              {updating ? 'Kaydediliyor...' : 'Değişiklikleri Veritabanına İşle'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default MegaBannerEdit;