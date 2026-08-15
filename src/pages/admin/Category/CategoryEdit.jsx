import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Upload, Image, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const CategoryEdit = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchCategoryDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/categories/${id}`);
        form.setFieldsValue(response.data);
        setCurrentImage(response.data.image_url);
      } catch (error) {
        message.error('Kategori bilgileri çekilemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryDetail();
  }, [id, form]);

  const onFinish = async (values) => {
    setUpdating(true);
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('current_image', currentImage);

    if (fileList.length > 0) {
      formData.append('image', fileList[0]);
    }

    try {
      await axios.put(`http://localhost:5000/api/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Kategori başarıyla güncellendi!');
      navigate('/admin/categories');
    } catch (error) {
      message.error('Güncelleme işlemi başarısız.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Kategori yükleniyor...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/categories')} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Kategoriyi Düzenle</Title>
          <Text type="secondary">Kategori adını veya buluttaki görselini güncelleyin.</Text>
        </div>
      </div>

      <Card bordered={false} style={{ maxWidth: 600 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Kategori Adı" rules={[{ required: true, message: 'Boş bırakılamaz' }]}>
            <Input />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#4a5568' }}>Mevcut Kategori Resmi</label>
            <Image src={currentImage} width={150} style={{ borderRadius: 6, border: '1px solid #eee' }} />
          </div>

          <Form.Item label="Görseli Değiştir (Değiştirmek istemiyorsanız dokunmayın)">
            <Upload
              beforeUpload={(file) => { setFileList([file]); return false; }}
              fileList={fileList}
              onRemove={() => setFileList([])}
              accept="image/*"
            >
              {fileList.length < 1 && <Button icon={<UploadOutlined />}>Yeni Resim Seç</Button>}
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={updating} icon={<SaveOutlined />}>
              {updating ? 'Güncelleniyor...' : 'Kategoriyi Güncelle'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CategoryEdit;