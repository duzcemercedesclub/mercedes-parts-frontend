import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Popconfirm, Image, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MegaBannerList = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/mega-banners`);
      setBanners(response.data);
    } catch (error) {
      message.error('Banner listesi yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/mega-banners/${id}`);
      message.success('Banner başarıyla silindi.');
      fetchBanners();
    } catch (error) {
      message.error('Silme işlemi başarısız.');
    }
  };

  const columns = [
    {
      title: 'Banner Görseli',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 200,
      render: (url) => <Image src={url} alt="Mega Banner" width={160} style={{ borderRadius: 6, objectFit: 'cover', height: 75 }} />
    },
    {
      title: 'Yazı ve Kampanya İçeriği',
      key: 'details',
      render: (_, record) => (
        <div>
          <Text type="danger" style={{ fontWeight: 600, fontSize: 12 }}>{record.subtitle} | {record.discount_text}</Text>
          <br />
          <strong style={{ fontSize: 16 }}>{record.title}</strong>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>Hedef URL: <code>{record.btn_link}</code></Text>
        </div>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 10 }}>
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => navigate(`/admin/banners/edit/${record.id}`)}>
            Düzenle
          </Button>
          <Popconfirm
            title="Bannerı Sil"
            description="Bu kampanya bannerını kaldırmak istediğinize emin misiniz?"
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
          <Title level={3} style={{ margin: 0 }}>Mega Sale Banner Yönetimi</Title>
          <Text type="secondary">Ana sayfada dikkat çeken büyük geniş reklam alanlarını buradan yönetin.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/banners/add')}>
          Yeni Banner Ekle
        </Button>
      </div>

      <Table columns={columns} dataSource={banners} rowKey="id" loading={loading} bordered pagination={{ pageSize: 5 }} />
    </div>
  );
};

export default MegaBannerList;