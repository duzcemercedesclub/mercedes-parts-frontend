import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Popconfirm, Tag, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PageList = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/pages`);
      setPages(response.data);
    } catch (error) {
      message.error('Sayfa listesi yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/pages/${id}`);
      message.success('Sayfa başarıyla silindi.');
      fetchPages();
    } catch (error) {
      message.error('Silme işlemi başarısız oldu.');
    }
  };

  const columns = [
    {
      title: 'Sayfa Başlığı',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <span>
          <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <strong style={{ fontSize: 14 }}>{text}</strong>
        </span>
      )
    },
    {
      title: 'SEO Link (Slug)',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => <code>/{slug}</code>
    },
    {
      title: 'Durum',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Yayında' : 'Taslak'}
        </Tag>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 10 }}>
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => navigate(`/admin/pages/edit/${record.id}`)}>
            Düzenle
          </Button>
          <Popconfirm
            title="Sayfayı Sil"
            description="Bu yasal sayfayı silmek istediğinize emin misiniz? Ön yüzde erişilemez olacaktır."
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
          <Title level={3} style={{ margin: 0 }}>Sayfa ve Sözleşme Yönetimi</Title>
          <Text type="secondary">Gizlilik politikası, mesafeli satış sözleşmesi gibi kurumsal metinleri buradan yönetin.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/pages/add')}>
          Yeni Sayfa Oluştur
        </Button>
      </div>

      <Table columns={columns} dataSource={pages} rowKey="id" loading={loading} bordered pagination={{ pageSize: 10 }} />
    </div>
  );
};

export default PageList;