import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Popconfirm, Image, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SliderList = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/sliders`);
      setSliders(response.data);
    } catch (error) {
      message.error('Slaytlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/sliders/${id}`);
      message.success('Slayt veritabanından ve listeden başarıyla kaldırıldı.');
      fetchSliders();
    } catch (error) {
      message.error('Silme işlemi başarısız oldu.');
    }
  };

  const columns = [
    {
      title: 'Görsel (Cloudinary)',
      dataIndex: 'bg_image',
      key: 'bg_image',
      width: 180,
      render: (url) => <Image src={url} alt="Slider" width={140} style={{ borderRadius: 6, objectFit: 'cover', height: 80 }} />
    },
    {
      title: 'İçerik Bilgileri',
      key: 'content',
      render: (_, record) => (
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.subtitle} | {record.discount}</Text>
          <br />
          <strong style={{ fontSize: 15 }}>{record.title}</strong>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>Buton Linki: <code>{record.btn_link}</code></Text>
        </div>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 10 }}>
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => navigate(`/admin/sliders/edit/${record.id}`)}>
            Düzenle
          </Button>
          <Popconfirm
            title="Slaytı Sil"
            description="Bu slayt kalıcı olarak MySQL'den silinecektir. Onaylıyor musunuz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sil"
            cancelText="İptal"
            okButtonProps={{ danger: true }}
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>Sil</Button>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Hero Slider Yönetimi</Title>
          <Text type="secondary">MySQL ve Cloudinary entegreli dinamik afiş listesi.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/sliders/add')}>
          Yeni Slider Ekle
        </Button>
      </div>

      <Table columns={columns} dataSource={sliders} rowKey="id" loading={loading} bordered pagination={{ pageSize: 5 }} />
    </div>
  );
};

export default SliderList;