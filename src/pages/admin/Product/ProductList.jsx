import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Popconfirm, Tag, Image, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, BarcodeOutlined, CarOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (error) {
      message.error('Ürünler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      message.success('Ürün başarıyla silindi.');
      fetchProducts();
    } catch (error) {
      message.error('Ürün silinemedi.');
    }
  };

  const columns = [
    {
      title: 'Görsel',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 90,
      render: (url) => <Image src={url} width={60} style={{ borderRadius: 6, objectFit: 'cover', height: 50 }} />
    },
    {
      title: 'Ürün Detayı',
      key: 'product_details',
      render: (_, record) => (
        <div>
          <strong style={{ fontSize: 14, color: '#1a202c' }}>{record.name}</strong>
          <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>
            <BarcodeOutlined /> <span style={{ fontFamily: 'monospace' }}>{record.sku}</span>
          </div>
          {record.vin_code && (
            <div style={{ fontSize: 11, color: '#2b4c7e', marginTop: 2 }}>
              <CarOutlined /> <strong>Şase:</strong> {record.vin_code}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Parça Durumu',
      dataIndex: 'condition_type',
      key: 'condition_type',
      width: 130,
      render: (cond) => (
        <Tag color={cond === 'used' ? 'orange' : 'cyan'}>
          {cond === 'used' ? '2. El (Çıkma)' : 'Sıfır Parça'}
        </Tag>
      )
    },
    {
      title: 'Kategori / Marka',
      key: 'relations',
      width: 180,
      render: (_, record) => (
        <div>
          <Tag color="blue">{record.category_name}</Tag>
          <div style={{ marginTop: 4 }}><Tag color="purple">{record.brand_name}</Tag></div>
        </div>
      )
    },
    {
      title: 'Fiyat Detayı',
      key: 'pricing',
      width: 180,
      render: (_, record) => {
        const hasDiscount = record.discount_rate > 0;
        return (
          <div>
            {hasDiscount ? (
              <>
                <Text delete type="secondary" style={{ fontSize: 12 }}>{Number(record.price).toLocaleString('tr-TR')} TL</Text>
                <Tag color="volcano" style={{ marginLeft: 6 }}>-%{record.discount_rate}</Tag>
                <div style={{ fontWeight: 'bold', color: '#38a169', fontSize: 15 }}>
                  {Number(record.sale_price).toLocaleString('tr-TR')} TL
                </div>
              </>
            ) : (
              <span style={{ fontWeight: 'bold', fontSize: 15 }}>{Number(record.price).toLocaleString('tr-TR')} TL</span>
            )}
          </div>
        );
      }
    },
    {
      title: 'Stok',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      render: (stock) => (
        <span style={{ fontWeight: '600', color: stock < 5 ? '#e53e3e' : '#2d3748' }}>
          {stock} Adet {stock < 5 && '(Kritik)'}
        </span>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (active) => <Tag color={active ? 'green' : 'red'}>{active ? 'Satışta' : 'Gizli'}</Tag>
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button type="primary" ghost icon={<EditOutlined />} size="small" onClick={() => navigate(`/admin/products/edit/${record.id}`)}>
            Düzenle
          </Button>
          <Popconfirm
            title="Ürünü Sil"
            description="Seçilen yedek parçayı silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sil"
            cancelText="İptal"
            okButtonProps={{ danger: true }}
          >
            <Button type="primary" danger size="small" icon={<DeleteOutlined />}>Sil</Button>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Yedek Parça Ürün Kataloğu</Title>
          <Text type="secondary">Sitenizde listelenen tüm ürünleri fiyat, indirim, şase no ve stok verileriyle yönetin.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/products/add')}>
          Yeni Ürün Ekle
        </Button>
      </div>

      <Table columns={columns} dataSource={products} rowKey="id" loading={loading} bordered pagination={{ pageSize: 10 }} />
    </div>
  );
};

export default ProductList;