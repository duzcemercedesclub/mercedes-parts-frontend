import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Upload, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CategoryAdd = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      message.error('Lütfen kategori için bir temsilî görsel seçin!');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('image', fileList[0]);

    try {
      await axios.post(`${API_URL}/api/categories`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Kategori Cloudinary yüklemesiyle birlikte başarıyla oluşturuldu!');
      navigate('/admin/categories');
    } catch (error) {
      message.error('Kategori eklenirken sunucu hatası oluştu.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/categories')} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Yeni Kategori Oluştur</Title>
          <Text type="secondary">Girilen kategori adı ve görseli veritabanına dinamik olarak işlenir.</Text>
        </div>
      </div>

      <Card bordered={false} style={{ maxWidth: 600 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Kategori Adı" rules={[{ required: true, message: 'Kategori adı boş bırakılamaz!' }]}>
            <Input placeholder="Örn: Motor Parçaları, Kaporta, Elektrik" />
          </Form.Item>

          <Form.Item label="Kategori Küçük Görseli (İkonik Resim) *" required>
            <Upload
              beforeUpload={(file) => { setFileList([file]); return false; }}
              fileList={fileList}
              onRemove={() => setFileList([])}
              accept="image/*"
            >
              {fileList.length < 1 && <Button icon={<UploadOutlined />}>Bilgisayardan Görsel Seç</Button>}
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={uploading} icon={<SaveOutlined />}>
              {uploading ? 'Kategori Kaydediliyor...' : 'Kategoriyi Oluştur'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CategoryAdd;