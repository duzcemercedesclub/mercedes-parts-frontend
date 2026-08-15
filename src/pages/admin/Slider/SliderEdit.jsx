import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Upload, Image, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const SliderEdit = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Eski verileri çekip forma dolduruyoruz
  useEffect(() => {
    const fetchSliderDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/sliders/${id}`);
        form.setFieldsValue(response.data);
        setCurrentImage(response.data.bg_image);
      } catch (error) {
        message.error('Slayt detayları getirilemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchSliderDetail();
  }, [id, form]);

  const onFinish = async (values) => {
    setUpdating(true);
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('subtitle', values.subtitle || '');
    formData.append('discount', values.discount || '');
    formData.append('btn_link', values.btn_link);
    formData.append('current_image', currentImage); // Yeni resim seçilmezse korunacak link

    if (fileList.length > 0) {
      formData.append('image', fileList[0]); // Yeni seçilen resim dosyası
    }

    try {
      await axios.put(`http://localhost:5000/api/sliders/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Slider başarıyla güncellendi!');
      navigate('/admin/sliders');
    } catch (error) {
      message.error('Güncelleme başarısız oldu.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/sliders')} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Slaytı Düzenle</Title>
          <Text type="secondary">Mevcut slayt bilgilerini ve resmini güncelleyin.</Text>
        </div>
      </div>

      <Card bordered={false} style={{ maxWidth: 750 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="Ana Başlık" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="subtitle" label="Üst Başlık" style={{ flex: 1 }}><Input /></Form.Item>
            <Form.Item name="discount" label="İndirim Rozeti" style={{ flex: 1 }}><Input /></Form.Item>
          </div>

          <Form.Item name="btn_link" label="Buton Linki"><Input /></Form.Item>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#4a5568' }}>Mevcut Slayt Resmi</label>
            <Image src={currentImage} width={200} style={{ borderRadius: 6, border: '1px solid #ddd' }} />
          </div>

          <Form.Item label="Yeni Resim Seç (Değiştirmek İstemiyorsanız Boş Bırakın)">
            <Upload
              beforeUpload={(file) => { setFileList([file]); return false; }}
              fileList={fileList}
              onRemove={() => setFileList([])}
              accept="image/*"
            >
              {fileList.length < 1 && <Button icon={<UploadOutlined />}>Yeni Resim Yükle</Button>}
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={updating} icon={<SaveOutlined />}>
              {updating ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SliderEdit;