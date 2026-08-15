import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Popconfirm, Image, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      message.error('Kategoriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`);
      message.success('Kategori başarıyla silindi.');
      fetchCategories();
    } catch (error) {
      message.error('Kategori silinemedi, bu kategoriye bağlı ürünler olabilir.');
    }
  };

  const columns = [
    {
      title: 'Kategori Görseli',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 150,
      render: (url) => <Image src={url} alt="Kategori" width={100} style={{ borderRadius: 6, objectFit: 'cover', height: 60 }} />
    },
    {
      title: 'Kategori Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong style={{ fontSize: 15 }}>{text}</strong>
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 10 }}>
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => navigate(`/admin/categories/edit/${record.id}`)}>
            Düzenle
          </Button>
          <Popconfirm
            title="Kategoriyi Sil"
            description="Bu kategoriyi silmek istediğinize emin misiniz?"
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
          <Title level={3} style={{ margin: 0 }}>Yedek Parça Kategorileri</Title>
          <Text type="secondary">Mağazadaki ürünlerin listeleneceği ana kategorileri buradan yönetin.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/categories/add')}>
          Yeni Kategori Ekle
        </Button>
      </div>

      <Table columns={columns} dataSource={categories} rowKey="id" loading={loading} bordered pagination={{ pageSize: 8 }} />
    </div>
  );
};

export default CategoryList;