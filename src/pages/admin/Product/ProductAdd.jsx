import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Upload, Select, InputNumber, Row, Col, Switch, Radio, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axios from 'axios';

const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProductAdd = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [price, setPrice] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);

  useEffect(() => {
    const fetchRelations = async () => {
      try {
        const catRes = await axios.get(`${API_URL}/api/categories`);
        const brandRes = await axios.get(`${API_URL}/api/brands`);
        setCategories(catRes.data);
        setBrands(brandRes.data);
      } catch (error) {
        message.error('İlişkili kategori veya markalar yüklenemedi.');
      }
    };
    fetchRelations();
  }, []);

  const calculatedSalePrice = price - (price * (discountRate / 100));

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      message.error('Lütfen ürün için en az bir ana görsel ekleyin!');
      return;
    }

    setUploading(true);
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
    formData.append('image', fileList[0]);

    try {
      await axios.post(`${API_URL}/api/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Ürün başarıyla eklendi!');
      navigate('/admin/products');
    } catch (error) {
      message.error(error.response?.data?.message || 'Ürün eklenirken hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/products')} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Yeni Ürün Ekle</Title>
          <Text type="secondary">E-ticaret katalog sistemine gelişmiş teknik parametrelerle yeni parça dahil edin.</Text>
        </div>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish} 
        initialValues={{ price: 0, discount_rate: 0, stock: 1, condition_type: 'new', is_active: true, description: '', vin_code: '' }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Ürün Genel Bilgileri" bordered={false} style={{ marginBottom: 24 }}>
              <Form.Item name="name" label="Ürün / Parça Adı" rules={[{ required: true, message: 'Ürün adı zorunludur' }]}>
                <Input placeholder="Örn: Mercedes W201 190D Ön Amortisör Takımı" />
              </Form.Item>

              <Form.Item name="description" label="Detaylı Ürün Açıklaması (React Quill)">
                <ReactQuill theme="snow" style={{ height: '280px', marginBottom: '50px' }} />
              </Form.Item>
            </Card>

            <Card title="Fiyatlandırma ve İndirim Otomasyonu (TL)" bordered={false}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="price" label="Orijinal Liste Fiyatı (TL)" rules={[{ required: true, message: 'Fiyat giriniz' }]}>
                    <InputNumber style={{ width: '100%' }} min={0} onChange={(val) => setPrice(val || 0)} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="discount_rate" label="İndirim Oranı (%)">
                    <InputNumber style={{ width: '100%' }} min={0} max={100} onChange={(val) => setDiscountRate(val || 0)} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <div style={{ background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', border: '1px dashed #cbd5e1', marginTop: '30px' }}>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Müşterinin Göreceği Net Fiyat:</span>
                    <strong style={{ fontSize: 16, color: '#16a34a' }}>{calculatedSalePrice.toLocaleString('tr-TR')} TL</strong>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Lojistik ve Parça Durumu" bordered={false} style={{ marginBottom: 24 }}>
              <Form.Item name="condition_type" label="Parça Durumu" rules={[{ required: true, message: 'Parça durumunu seçiniz' }]}>
                <Radio.Group buttonStyle="solid" style={{ width: '100%' }}>
                  <Radio.Button value="new" style={{ width: '50%', textAlign: 'center' }}>Sıfır Parça</Radio.Button>
                  <Radio.Button value="used" style={{ width: '50%', textAlign: 'center' }}>2. El (Çıkma)</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="sku" label="Stok Kodu (SKU / Üretici Kodu)" rules={[{ required: true, message: 'SKU zorunludur' }]}>
                <Input placeholder="Örn: BOS-190D-8921" />
              </Form.Item>

              <Form.Item name="vin_code" label="Uyumlu Şase Numaraları (VIN)" tooltip="Birden fazla şase numarasını virgül ile ayırarak yazabilirsiniz. Örn: WDB201024, WDB124020">
                <Input placeholder="Örn: WDB2010241F123456, WDB124020" />
              </Form.Item>

              <Form.Item name="category_id" label="Sistem Kategorisi" rules={[{ required: true, message: 'Kategori seçiniz' }]}>
                <Select placeholder="Kategori Seçin">
                  {categories.map(cat => <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>)}
                </Select>
              </Form.Item>

              <Form.Item name="brand_id" label="Üretici Marka" rules={[{ required: true, message: 'Marka seçiniz' }]}>
                <Select placeholder="Marka Seçin">
                  {brands.map(brand => <Select.Option key={brand.id} value={brand.id}>{brand.name}</Select.Option>)}
                </Select>
              </Form.Item>

              <Form.Item name="stock" label="Mevcut Stok Miktarı" rules={[{ required: true, message: 'Stok giriniz' }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>

              <Form.Item name="is_active" label="Ürünü Doğrudan Satışa Aç" valuePropName="checked">
                <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
              </Form.Item>
            </Card>

            <Card title="Ürün Görseli" bordered={false}>
              <Form.Item required>
                <Upload
                  beforeUpload={(file) => { setFileList([file]); return false; }}
                  fileList={fileList}
                  onRemove={() => setFileList([])}
                  accept="image/*"
                >
                  {fileList.length < 1 && <Button icon={<UploadOutlined />} style={{ width: '100%' }}>Resim Seç</Button>}
                </Upload>
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={uploading} icon={<SaveOutlined />} size="large" block style={{ marginTop: 24 }}>
                {uploading ? 'Buluta Yükleniyor...' : 'Ürünü Kataloğa Ekle'}
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ProductAdd;