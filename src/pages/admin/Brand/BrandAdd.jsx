import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Upload, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const BrandAdd = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      message.error('Lütfen marka için bir logo seçin!');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('image', fileList[0]);

    try {
      await axios.post('http://localhost:5000/api/brands', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Marka ve logosu başarıyla veritabanına kaydedildi!');
      navigate('/admin/brands');
    } catch (error) {
      message.error('Marka eklenirken teknik bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/brands')} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Yeni Marka Ekle</Title>
          <Text type="secondary">Üretici logosu doğrudan Cloudinary bulut servisindeki 'brands' klasörüne aktarılır.</Text>
        </div>
      </div>

      <Card bordered={false} style={{ maxWidth: 600 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Marka / Üretici Adı" rules={[{ required: true, message: 'Marka adı zorunludur!' }]}>
            <Input placeholder="Örn: Bosch, Lemförder, Sachs" />
          </Form.Item>

          <Form.Item label="Marka Logosu *" required>
            <Upload
              beforeUpload={(file) => { setFileList([file]); return false; }}
              fileList={fileList}
              onRemove={() => setFileList([])}
              accept="image/*"
            >
              {fileList.length < 1 && <Button icon={<UploadOutlined />}>Bilgisayardan Logo Seç</Button>}
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={uploading} icon={<SaveOutlined />}>
              {uploading ? 'Logo Yükleniyor...' : 'Markayı Kaydet'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BrandAdd;