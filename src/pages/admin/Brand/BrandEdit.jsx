import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Upload, Image, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BrandEdit = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchBrandDetail = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/brands/${id}`);
        form.setFieldsValue(response.data);
        setCurrentImage(response.data.image_url);
      } catch (error) {
        message.error('Marka detayları çekilemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchBrandDetail();
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
      await axios.put(`${API_URL}/api/brands/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Marka başarıyla güncellendi!');
      navigate('/admin/brands');
    } catch (error) {
      message.error('Güncelleme işlemi başarısız.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Veriler yükleniyor...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/brands')} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Markayı Düzenle</Title>
          <Text type="secondary">Marka adını veya mevcut logoyu güncelleyin.</Text>
        </div>
      </div>

      <Card bordered={false} style={{ maxWidth: 600 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Marka Adı" rules={[{ required: true, message: 'Boş bırakılamaz' }]}>
            <Input />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#4a5568' }}>Mevcut Marka Logosu</label>
            <div style={{ background: '#f7f7f7', padding: '10px', borderRadius: '6px', display: 'inline-block' }}>
              <Image src={currentImage} width={120} style={{ objectFit: 'contain' }} />
            </div>
          </div>

          <Form.Item label="Logoyu Değiştir (İstemiyorsanız dokunmanıza gerek yoktur)">
            <Upload
              beforeUpload={(file) => { setFileList([file]); return false; }}
              fileList={fileList}
              onRemove={() => setFileList([])}
              accept="image/*"
            >
              {fileList.length < 1 && <Button icon={<UploadOutlined />}>Yeni Logo Seç</Button>}
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={updating} icon={<SaveOutlined />}>
              {updating ? 'Güncelleniyor...' : 'Markayı Güncelle'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BrandEdit;