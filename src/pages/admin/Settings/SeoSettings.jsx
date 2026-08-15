import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Tabs, Card, Row, Col, message, Spin, Divider, Upload, Alert, Progress } from 'antd';
import { GoogleOutlined, SaveOutlined, FileSyncOutlined, SearchOutlined, ShareAltOutlined, FileTextOutlined, ExportOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SeoSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingSitemap, setGeneratingSitemap] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [currentOgImageUrl, setCurrentOgImageUrl] = useState('');

  const [titleCharCount, setTitleCharCount] = useState(0);
  const [descCharCount, setDescCharCount] = useState(0);

  const [watchTitle, setWatchTitle] = useState('');
  const [watchDesc, setWatchDesc] = useState('');

  const fetchSeoSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/seo-settings`);
      const data = response.data;
      if (data) {
        form.setFieldsValue(data);
        setTitleCharCount(data.meta_title?.length || 0);
        setDescCharCount(data.meta_description?.length || 0);
        setWatchTitle(data.meta_title || '');
        setWatchDesc(data.meta_description || '');
        setCurrentOgImageUrl(data.og_image_url || '');

        if (data.og_image_url) {
          setFileList([
            {
              uid: '-1',
              name: 'Mevcut_OG_Image.png',
              status: 'done',
              url: data.og_image_url,
            },
          ]);
        }
      }
    } catch (error) {
      message.error('SEO ayarları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onSave = async (values) => {
    setSaving(true);
    const formData = new FormData();

    formData.append('meta_title', values.meta_title || '');
    formData.append('meta_description', values.meta_description || '');
    formData.append('meta_keywords', values.meta_keywords || '');
    formData.append('canonical_url', values.canonical_url || '');
    formData.append('og_title', values.og_title || '');
    formData.append('og_description', values.og_description || '');
    formData.append('og_type', values.og_type || 'website');
    formData.append('google_verification', values.google_verification || '');
    formData.append('google_analytics_id', values.google_analytics_id || '');
    formData.append('robots_txt', values.robots_txt || '');
    formData.append('current_og_image', currentOgImageUrl);

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('og_image', fileList[0].originFileObj);
    }

    try {
      const res = await axios.post(`${API_URL}/api/seo-settings`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success(res.data.message);
      if (res.data.og_image_url) {
        setCurrentOgImageUrl(res.data.og_image_url);
      }
      fetchSeoSettings();
    } catch (error) {
      message.error('SEO ayarları kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSitemap = async () => {
    setGeneratingSitemap(true);
    try {
      const response = await axios.post(`${API_URL}/api/seo-settings/generate-sitemap`);
      message.success(response.data.message);
    } catch (error) {
      message.error(error.response?.data?.message || 'Sitemap oluşturma işlemi başarısız.');
    } finally {
      setGeneratingSitemap(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="SEO Ayarları Yükleniyor..." />
      </div>
    );
  }

  const tabItems = [
    {
      key: '1',
      label: <span><SearchOutlined /> Genel SEO Ayarları</span>,
      children: (
        <Row gutter={24}>
          <Col xs={24} lg={14}>
            <Form.Item 
              label="Site Başlığı (Meta Title)" 
              name="meta_title"
              rules={[{ required: true, message: 'Meta başlığı boş bırakılamaz.' }]}
            >
              <Input 
                maxLength={70} 
                onChange={(e) => {
                  setTitleCharCount(e.target.value.length);
                  setWatchTitle(e.target.value);
                }} 
                placeholder="Google arama sonuçlarında görünecek başlık"
              />
            </Form.Item>
            <div style={{ marginBottom: '16px', marginTop: '-10px' }}>
              <span style={{ fontSize: '12px', color: titleCharCount > 60 ? '#faad14' : '#52c41a' }}>
                Önerilen Karakter Uzunluğu: 50-60 karakter (Mevcut: {titleCharCount})
              </span>
              <Progress percent={Math.min((titleCharCount / 60) * 100, 100)} size="small" showInfo={false} status={titleCharCount > 60 ? "exception" : "success"} />
            </div>

            <Form.Item 
              label="Site Açıklaması (Meta Description)" 
              name="meta_description"
              rules={[{ required: true, message: 'Arama motoru açıklaması boş bırakılamaz.' }]}
            >
              <TextArea 
                rows={4} 
                maxLength={160}
                onChange={(e) => {
                  setDescCharCount(e.target.value.length);
                  setWatchDesc(e.target.value);
                }}
                placeholder="Arama motorlarında başlığın altında görüntülenecek 1-2 cümlelik tanıtım."
              />
            </Form.Item>
            <div style={{ marginBottom: '16px', marginTop: '-10px' }}>
              <span style={{ fontSize: '12px', color: descCharCount > 150 ? '#faad14' : '#52c41a' }}>
                Önerilen Karakter Uzunluğu: 140-160 karakter (Mevcut: {descCharCount})
              </span>
              <Progress percent={Math.min((descCharCount / 160) * 100, 100)} size="small" showInfo={false} status={descCharCount > 150 ? "exception" : "success"} />
            </div>

            <Form.Item 
              label="Anahtar Kelimeler (Meta Keywords)" 
              name="meta_keywords"
              tooltip="Kelimeleri virgülle ayırarak yazın."
            >
              <Input placeholder="mercedes parça, w201, 190d, düzce mercedes" />
            </Form.Item>

            <Form.Item 
              label="Canonical URL" 
              name="canonical_url"
              tooltip="Arama motorlarının mükerrer sayfaları engellemesi için kullanacağı ana sitemizin adresi."
            >
              <Input placeholder="https://duzcemercedesparts.com" />
            </Form.Item>
          </Col>

          <Col xs={24} lg={10}>
            <Card title="Google Sonuç Önizlemesi" style={{ background: '#fcfcfc', border: '1px dashed #d9d9d9', position: 'sticky', top: '10px' }}>
              <div style={{ fontFamily: 'Arial, sans-serif' }}>
                <div style={{ fontSize: '14px', color: '#202124', marginBottom: '2px', wordBreak: 'break-all' }}>
                  {form.getFieldValue('canonical_url') || 'https://duzcemercedesparts.com'}
                </div>
                <div style={{ fontSize: '20px', color: '#1a0dab', textDecoration: 'none', cursor: 'pointer', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {watchTitle || 'Düzce Mercedes Parts | Klasik ve Modern Mercedes'}
                </div>
                <div style={{ fontSize: '14px', color: '#4d5156', lineHeight: '1.4', wordBreak: 'break-word' }}>
                  {watchDesc || 'Site açıklaması boş bırakıldığında Google bu alanı rastgele metinlerle doldurur. Lütfen özgün bir açıklama girin.'}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: '2',
      label: <span><ShareAltOutlined /> Sosyal Medya & Open Graph (OG)</span>,
      children: (
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item label="Sosyal Paylaşım Başlığı (og:title)" name="og_title">
              <Input placeholder="Sosyal medyada paylaşınca görünecek başlık" />
            </Form.Item>

            <Form.Item label="Sosyal Paylaşım Açıklaması (og:description)" name="og_description">
              <TextArea rows={4} placeholder="Sosyal medyada paylaşınca görünecek açıklama" />
            </Form.Item>

            <Form.Item label="İçerik Tipi (og:type)" name="og_type">
              <Input placeholder="website, article vb." />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Paylaşım Görseli (og:image)">
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={() => false}
                maxCount={1}
              >
                {fileList.length < 1 && "+ Görsel Seç (1200x630)"}
              </Upload>
            </Form.Item>
            <Alert 
              message="Önemli Bilgi"
              description="WhatsApp, Facebook veya Twitter üzerinde site linkinizi gönderdiğinizde, kart şeklinde çıkacak ana resmi yukarıdan yükleyebilirsiniz. Önerilen boyut 1200x630 pikseldir."
              type="info"
              showIcon
            />
          </Col>
        </Row>
      )
    },
    {
      key: '3',
      label: <span><GoogleOutlined /> Arama Motoru Entegrasyonları</span>,
      children: (
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Card type="inner" title="Google Search Console Doğrulama Kodu">
              <Form.Item 
                label="Google Site Doğrulama HTML Kodu (meta tag value)" 
                name="google_verification"
                tooltip="Google Search Console üzerinden aldığınız html doğrulama anahtarını buraya girin."
              >
                <Input placeholder="Örn: google-site-verification-12345" />
              </Form.Item>
              <p style={{ color: '#64748b', fontSize: '13px' }}>
                Arama motoruna mülk doğrulaması yapmak için HTML Etiketi yöntemini seçip, size verilen benzersiz kod dizesini buraya ekleyin.
              </p>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card type="inner" title="Google Analytics (GA4)">
              <Form.Item 
                label="Google Analytics Ölçüm Kimliği (Measurement ID)" 
                name="google_analytics_id"
                tooltip="Google Analytics panelinizden aldığınız G- ile başlayan ölçüm kimliği."
              >
                <Input placeholder="Örn: G-XXXXXXXXXX" />
              </Form.Item>
              <p style={{ color: '#64748b', fontSize: '13px' }}>
                G- ile başlayan izleme kodunuzu eklediğinizde, web sitenizin tüm ziyaretçi ve sayfa tıklama trafik verileri Google sunucularına otomatik aktarılmaya başlar.
              </p>
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: '4',
      label: <span><FileTextOutlined /> Robots.txt & Sitemap</span>,
      children: (
        <div>
          <Alert 
            message="Gelişmiş Dosya Yapılandırmaları"
            description="Robots.txt arama motoru botlarının hangi klasörleri tarayıp hangilerini taramayacağını söyler."
            type="warning"
            showIcon
            style={{ marginBottom: '20px' }}
          />

          <Form.Item label="Robots.txt İçeriği" name="robots_txt">
            <TextArea rows={8} style={{ fontFamily: 'Courier New, monospace' }} placeholder="User-agent: *..." />
          </Form.Item>

          <Divider />

          <Card type="inner" title="Dinamik Sitemap.xml Otomasyonu" style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Aşağıdaki butona tıkladığınızda veritabanındaki aktif ürünlerinizi, kategorilerinizi ve ana sayfalarınızı birleştirerek standartlara uygun güncel bir **sitemap.xml** harita dosyası oluşturur ve sitenizin kök dizinine otomatik yazar.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Button 
                type="primary" 
                icon={<FileSyncOutlined />} 
                onClick={handleGenerateSitemap}
                loading={generatingSitemap}
              >
                Sitemap.xml Dosyasını Oluştur / Güncelle
              </Button>
              <a 
                href={`${API_URL}/sitemap.xml`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ExportOutlined /> Dosyayı Önizle (sitemap.xml)
              </a>
            </div>
          </Card>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title={<span><SearchOutlined /> Arama Motoru Optimizasyonu (SEO) & Entegrasyon Ayarları</span>}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSave}
        >
          <Tabs defaultActiveKey="1" items={tabItems} style={{ marginBottom: '24px' }} />

          <Divider />

          <Form.Item style={{ textAlign: 'right', margin: 0 }}>
            <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={saving}>
              SEO Ayarlarını Kaydet ve Güncelle
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SeoSettings;