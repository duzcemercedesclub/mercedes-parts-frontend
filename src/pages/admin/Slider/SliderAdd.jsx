import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Upload, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const SliderAdd = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      message.error('Lütfen bilgisayarınızdan bir arka plan resmi seçin!');
      return;
    }

    setUploading(true);
    
    // Resim ve Metinleri taşımak için FormData mimarisi kullanıyoruz
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('subtitle', values.subtitle || '');
    formData.append('discount', values.discount || '');
    formData.append('btn_link', values.btn_link || '/shop');
    formData.append('image', fileList[0]); // Seçilen gerçek dosya

    try {
      await axios.post('http://localhost:5000/api/sliders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Slider başarıyla Cloudinary\'ye yüklendi ve MySQL\'e kaydedildi!');
      navigate('/admin/sliders');
    } catch (error) {
      message.error(error.response?.data?.message || 'Slider eklenirken bir sorun oluştu.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/sliders')} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Yeni Slayt Ekle</Title>
          <Text type="secondary">Bilgisayardan resim seçerek sisteme yeni kampanya afişi gönderin.</Text>
        </div>
      </div>

      <Card bordered={false} style={{ maxWidth: 750 }}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ btn_link: '/shop' }}>
          <Form.Item name="title" label="Ana Başlık (Büyük Yazı)" rules={[{ required: true, message: 'Başlık zorunludur' }]}>
            <Input placeholder="Örn: Orijinal Mercedes W201 Parçaları" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="subtitle" label="Üst Başlık" style={{ flex: 1 }}><Input placeholder="Örn: SEZON FIRSATI" /></Form.Item>
            <Form.Item name="discount" label="İndirim Rozeti" style={{ flex: 1 }}><Input placeholder="Örn: %30 NET İNDİRİM" /></Form.Item>
          </div>

          <Form.Item name="btn_link" label="Buton Linki"><Input placeholder="/shop" /></Form.Item>

          {/* BİLGİSAYARDAN DOSYA SEÇME ALANI */}
          <Form.Item label="Slayt Arka Plan Resmi *" required>
            <Upload
              beforeUpload={(file) => {
                setFileList([file]); // Sadece tek bir resim kabul ediyoruz
                return false; // Otomatik yüklemeyi kapatıyoruz, formla gidecek
              }}
              fileList={fileList}
              onRemove={() => setFileList([])}
              accept="image/*"
            >
              {fileList.length < 1 && <Button icon={<UploadOutlined />}>Bilgisayardan Resim Seç</Button>}
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={uploading} icon={<SaveOutlined />}>
              {uploading ? 'Yükleniyor ve Kaydediliyor...' : 'Slaytı Veritabanına Kaydet'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SliderAdd;