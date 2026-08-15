import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Switch, Upload, Card, Row, Col, Space, message, Spin, Divider, Popconfirm } from 'antd';
import { UploadOutlined, SaveOutlined, UndoOutlined, SettingOutlined } from '@ant-design/icons';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GeneralAndLogoSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [useImageLogo, setUseImageLogo] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  // Ayarları Sunucudan Çek (LİSTELEME / GET)
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/settings`);
      const data = response.data;
      
      form.setFieldsValue({
        ...data,
        use_image_logo: data.use_image_logo === 1,
        show_facebook: data.show_facebook === 1,
        show_instagram: data.show_instagram === 1,
        show_twitter: data.show_twitter === 1,
      });

      setUseImageLogo(data.use_image_logo === 1);
      setCurrentImageUrl(data.logo_url || '');
      
      if (data.logo_url) {
        setFileList([
          {
            uid: '-1',
            name: 'Mevcut_Logo.png',
            status: 'done',
            url: data.logo_url,
          },
        ]);
      }
    } catch (error) {
      message.error('Sistem ayarları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Dosya Değişim Takibi
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Ayarları Kaydet (GÜNCELLEME / POST)
  const onFinish = async (values) => {
    setSaving(true);
    const formData = new FormData();

    formData.append('title', values.title || '');
    formData.append('logo_text_small', values.logo_text_small || '');
    formData.append('logo_text_large', values.logo_text_large || '');
    formData.append('promo_text', values.promo_text || '');
    formData.append('currency', values.currency || '');
    formData.append('facebook_url', values.facebook_url || '');
    formData.append('instagram_url', values.instagram_url || '');
    formData.append('twitter_url', values.twitter_url || '');

    formData.append('use_image_logo', useImageLogo ? '1' : '0');
    formData.append('show_facebook', values.show_facebook ? '1' : '0');
    formData.append('show_instagram', values.show_instagram ? '1' : '0');
    formData.append('show_twitter', values.show_twitter ? '1' : '0');

    formData.append('current_image', currentImageUrl);

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('image', fileList[0].originFileObj);
    }

    try {
      const res = await axios.post(`${API_URL}/api/settings`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Sistem ayarları başarıyla kaydedildi.');
      if (res.data.logo_url) {
        setCurrentImageUrl(res.data.logo_url);
      }
      fetchSettings();
    } catch (error) {
      message.error('Ayarlar kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  // Ayarları Varsayılana Döndür (SİLME / RESET)
  const handleReset = async () => {
    try {
      await axios.delete(`${API_URL}/api/settings/reset`);
      message.success('Varsayılan ayarlara başarıyla dönüldü.');
      setFileList([]);
      setCurrentImageUrl('');
      fetchSettings();
    } catch (error) {
      message.error('Sıfırlama işlemi başarısız.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Ayarlar Yükleniyor..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={<span><SettingOutlined /> Genel & Logo Ayarları</span>} 
        extra={
          <Popconfirm
            title="Tüm ayarları sıfırlamak istediğinize emin misiniz?"
            onConfirm={handleReset}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button danger icon={<UndoOutlined />}>Varsayılana Sıfırla</Button>
          </Popconfirm>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            currency: 'TL ₺',
            use_image_logo: false,
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Card type="inner" title="Logo Ayarları" style={{ height: '100%' }}>
                <Form.Item label="Logo Türü Seçimi" name="use_image_logo" valuePropName="checked">
                  <Switch 
                    checkedChildren="Resim Logo" 
                    unCheckedChildren="Metin Logo" 
                    onChange={(checked) => setUseImageLogo(checked)} 
                  />
                </Form.Item>

                {useImageLogo ? (
                  <Form.Item label="Logo Resim Dosyası">
                    <Upload
                      listType="picture"
                      fileList={fileList}
                      onChange={handleUploadChange}
                      beforeUpload={() => false}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Logo Seç (PNG önerilir)</Button>
                    </Upload>
                  </Form.Item>
                ) : (
                  <>
                    <Form.Item 
                      label="Metin Logo Üst Başlık (Küçük)" 
                      name="logo_text_small"
                      rules={[{ required: !useImageLogo, message: 'Üst başlık zorunludur.' }]}
                    >
                      <Input placeholder="Örn: DUZCE" />
                    </Form.Item>
                    <Form.Item 
                      label="Metin Logo Ana Başlık (Büyük)" 
                      name="logo_text_large"
                      rules={[{ required: !useImageLogo, message: 'Ana başlık zorunludur.' }]}
                    >
                      <Input placeholder="Örn: MERCEDESCLUB" />
                    </Form.Item>
                  </>
                )}
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card type="inner" title="Üst Bar (Top Bar) Ayarları" style={{ height: '100%' }}>
                <Form.Item label="Tarayıcı & Site Başlığı" name="title">
                  <Input placeholder="DuzceMercedesParts" />
                </Form.Item>

                <Form.Item label="Kampanya Duyuru Metni" name="promo_text">
                  <Input placeholder="100 TL ve üzeri siparişlerde kargo bedava!" />
                </Form.Item>

                <Form.Item label="Para Birimi Gösterimi" name="currency">
                  <Input placeholder="TL ₺" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Card type="inner" title="Sosyal Medya Link ve Görünürlük Kontrolleri" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item label="Facebook Aktif / Pasif" name="show_facebook" valuePropName="checked">
                  <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                </Form.Item>
                <Form.Item name="facebook_url" label="Facebook URL">
                  <Input placeholder="https://facebook.com/sayfaniz" />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={8}>
                <Form.Item label="Instagram Aktif / Pasif" name="show_instagram" valuePropName="checked">
                  <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                </Form.Item>
                <Form.Item name="instagram_url" label="Instagram URL">
                  <Input placeholder="https://instagram.com/sayfaniz" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={8}>
                <Form.Item label="Twitter (X) Aktif / Pasif" name="show_twitter" valuePropName="checked">
                  <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                </Form.Item>
                <Form.Item name="twitter_url" label="Twitter (X) URL">
                  <Input placeholder="https://x.com/sayfaniz" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Form.Item style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={saving}>
              Ayarları Kaydet ve Yayına Al
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default GeneralAndLogoSettings;