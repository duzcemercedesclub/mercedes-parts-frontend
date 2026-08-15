import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Upload, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MegaBannerAdd = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      message.error('Lütfen bilgisayarınızdan bir kampanya görseli seçin!');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('subtitle', values.subtitle || '');
    formData.append('discount_text', values.discount_text || '');
    formData.append('btn_link', values.btn_link || '/shop');
    formData.append('image', fileList[0]);

    try {
      await axios.post(`${API_URL}/api/mega-banners`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Yeni büyük reklam bannerı başarıyla oluşturuldu!');
      navigate('/admin/banners');
    } catch (error) {
      message.error('Banner yüklenirken teknik bir sorun oluştu.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/banners')} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Yeni Mega Banner Ekle</Title>
          <Text type="secondary">Bilgisayarınızdan seçeceğiniz görsel doğrudan Cloudinary bulutuna yüklenir.</Text>
        </div>
      </div>

      <Card bordered={false} style={{ maxWidth: 750 }}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ btn_link: '/shop' }}>
          <Form.Item name="title" label="Kampanya Ana Başlığı" rules={[{ required: true, message: 'Başlık zorunludur' }]}>
            <Input placeholder="Örn: M102 & M103 Motor Parçalarında Dev Fırsat" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="subtitle" label="Küçük Spot Üst Başlık" style={{ flex: 1 }}><Input placeholder="Örn: SINIRLI STOK" /></Form.Item>
            <Form.Item name="discount_text" label="İndirim / Vurgu Oranı" style={{ flex: 1 }}><Input placeholder="Örn: %40 KDV İNDİRİMİ" /></Form.Item>
          </div>

          <Form.Item name="btn_link" label="Afişe Tıklanınca Gidilecek Sayfa Linki"><Input placeholder="/shop" /></Form.Item>

          <Form.Item label="Geniş Reklam Görseli Seçiniz *" required>
            <Upload
              beforeUpload={(file) => { setFileList([file]); return false; }}
              fileList={fileList}
              onRemove={() => setFileList([])}
              accept="image/*"
            >
              {fileList.length < 1 && <Button icon={<UploadOutlined />}>Bilgisayarımdan Dosya Seç</Button>}
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={uploading} icon={<SaveOutlined />}>
              {uploading ? 'Görsel Buluta Gönderiliyor...' : 'Kampanyayı Veritabanına Yaz'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default MegaBannerAdd;