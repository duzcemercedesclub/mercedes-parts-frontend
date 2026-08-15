import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Popconfirm, Image, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/brands`);
      setBrands(response.data);
    } catch (error) {
      message.error('Markalar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/brands/${id}`);
      message.success('Marka başarıyla silindi.');
      fetchBrands();
    } catch (error) {
      message.error('Marka silme işlemi başarısız oldu.');
    }
  };

  const columns = [
    {
      title: 'Marka Logosu',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 160,
      render: (url) => (
        <div style={{ background: '#f7f7f7', padding: '6px', borderRadius: '6px', display: 'inline-block' }}>
          <Image src={url} alt="Marka Logo" width={90} style={{ objectFit: 'contain', height: 45 }} />
        </div>
      )
    },
    {
      title: 'Marka Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong style={{ fontSize: 15, color: '#2d3748' }}>{text}</strong>
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 10 }}>
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => navigate(`/admin/brands/edit/${record.id}`)}>
            Düzenle
          </Button>
          <Popconfirm
            title="Markayı Sil"
            description="Bu markayı silmek istediğinize emin misiniz?"
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
          <Title level={3} style={{ margin: 0 }}>Üretici Marka Yönetimi</Title>
          <Text type="secondary">Yedek parça üreticisi markaların isim ve logolarını buradan yönetin.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/brands/add')}>
          Yeni Marka Ekle
        </Button>
      </div>

      <Table columns={columns} dataSource={brands} rowKey="id" loading={loading} bordered pagination={{ pageSize: 8 }} />
    </div>
  );
};

export default BrandList;