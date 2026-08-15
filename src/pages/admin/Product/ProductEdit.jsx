import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Upload, Select, InputNumber, Row, Col, Switch, Image, Radio, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axios from 'axios';

const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProductEdit = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [price, setPrice] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);

  useEffect(() => {
    const fetchRelationsAndProduct = async () => {
      try {
        const catRes = await axios.get(`${API_URL}/api/categories`);
        const brandRes = await axios.get(`${API_URL}/api/brands`);
        setCategories(catRes.data);
        setBrands(brandRes.data);

        const prodRes = await axios.get(`${API_URL}/api/products/${id}`);
        const product = prodRes.data;
        
        form.setFieldsValue({
          ...product,
          vin_code: product.vin_code || '',
          condition_type: product.condition_type || 'new',
          is_active: product.is_active === 1
        });
        
        setPrice(Number(product.price));
        setDiscountRate(product.discount_rate);
        setCurrentImage(product.image_url);
      } catch (error) {
        message.error('Veriler yüklenirken teknik hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchRelationsAndProduct();
  }, [id, form]);

  const calculatedSalePrice = price - (price * (discountRate / 100));

  const onFinish = async (values) => {
    setUpdating(true);
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('sku', values.sku);
    formData.append('category_id', values.category_id);
    formData.append('brand_id', values.brand_id);
    formData.append('price', values.price);
    formData.append('discount_rate', values.discount_rate || 0);
    formData.append('stock', values.stock || 0);
    formData.append('condition_type', values.condition_type || 'new');
    formData.append('description', values.description || '');
    formData.append('vin_code', values.vin_code || '');
    formData.append('is_active', values.is_active ? '1' : '0');
    formData.append('current_image', currentImage);

    if (fileList.length > 0) {
      formData.append('image', fileList[0]);
    }

    try {
      await axios.put(`${API_URL}/api/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Ürün revizyonu başarıyla kaydedildi!');
      navigate('/admin/products');
    } catch (error) {
      message.error('Ürün güncellenemedi.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Ürün kartı yükleniyor...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/products')} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Ürün Kartını Düzenle</Title>
          <Text type="secondary">Seçilen ürünün fiyatlandırma parametrelerini, şase numarasını ve açıklamalarını revize edin.</Text>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Ürün Genel Bilgileri" bordered={false} style={{ marginBottom: 24 }}>
              <Form.Item name="name" label="Ürün Adı" rules={[{ required: true, message: 'Boş bırakılamaz' }]}>
                <Input />
              </Form.Item>

              <Form.Item name="description" label="Açıklama Metni (Rich Text)">
                <ReactQuill theme="snow" style={{ height: '280px', marginBottom: '50px' }} />
              </Form.Item>
            </Card>

            <Card title="Fiyatlandırma ve İndirim Hesaplaması" bordered={false}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="price" label="Fiyat (TL)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} onChange={(val) => setPrice(val || 0)} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="discount_rate" label="İndirim Oranı (%)">
                    <InputNumber style={{ width: '100%' }} min={0} max={100} onChange={(val) => setDiscountRate(val || 0)} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <div style={{ background: '#f0fdf4', padding: '10px 16px', borderRadius: '8px', border: '1px dashed #bbf7d0', marginTop: '30px' }}>
                    <span style={{ fontSize: 11, color: '#166534', display: 'block' }}>Yeni Satış Fiyatı:</span>
                    <strong style={{ fontSize: 16, color: '#15803d' }}>{calculatedSalePrice.toLocaleString('tr-TR')} TL</strong>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Lojistik ve Parça Durumu" bordered={false} style={{ marginBottom: 24 }}>
              <Form.Item name="condition_type" label="Parça Durumu" rules={[{ required: true }]}>
                <Radio.Group buttonStyle="solid" style={{ width: '100%' }}>
                  <Radio.Button value="new" style={{ width: '50%', textAlign: 'center' }}>Sıfır Parça</Radio.Button>
                  <Radio.Button value="used" style={{ width: '50%', textAlign: 'center' }}>2. El (Çıkma)</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="sku" label="Stok Kodu (SKU)" rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Form.Item name="vin_code" label="Uyumlu Şase Numaraları (VIN)">
                <Input placeholder="Örn: WDB2010241F123456" />
              </Form.Item>

              <Form.Item name="category_id" label="Kategori">
                <Select>
                  {categories.map(cat => <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>)}
                </Select>
              </Form.Item>

              <Form.Item name="brand_id" label="Marka">
                <Select>
                  {brands.map(brand => <Select.Option key={brand.id} value={brand.id}>{brand.name}</Select.Option>)}
                </Select>
              </Form.Item>

              <Form.Item name="stock" label="Stok Adedi" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>

              <Form.Item name="is_active" label="Satış Durumu" valuePropName="checked">
                <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
              </Form.Item>
            </Card>

            <Card title="Ürün Görseli" bordered={false}>
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <span style={{ display: 'block', marginBottom: 8, textAlign: 'left', color: '#4a5568' }}>Mevcut Görsel</span>
                <Image src={currentImage} width="100%" style={{ maxHeight: 200, objectFit: 'contain', borderRadius: 6, border: '1px solid #f1f5f9' }} />
              </div>
              <Form.Item label="Görseli Yenile">
                <Upload
                  beforeUpload={(file) => { setFileList([file]); return false; }}
                  fileList={fileList}
                  onRemove={() => setFileList([])}
                  accept="image/*"
                >
                  {fileList.length < 1 && <Button icon={<UploadOutlined />} block>Yeni Resim Seç</Button>}
                </Upload>
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={updating} icon={<SaveOutlined />} size="large" block style={{ marginTop: 24 }}>
                {updating ? 'Değişiklikler Yazılıyor...' : 'Kartı Güncelle'}
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ProductEdit;