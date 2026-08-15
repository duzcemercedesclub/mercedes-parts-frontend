import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, Switch, Space, Divider, message, Spin, Alert } from 'antd';
import { LayoutOutlined, SaveOutlined, CreditCardOutlined } from '@ant-design/icons';
import axios from 'axios';
import { VisaLogo, MastercardLogo, MaestroLogo, TroyLogo, AmexLogo } from '../../../components/ui/PaymentLogos/PaymentLogos';

const { TextArea } = Input;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FooterSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Mevcut Footer Ayarlarını Çek (Doğru API Rotası: /api/footer)
  const fetchFooterSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/footer`);
      if (response.data) {
        form.setFieldsValue({
          ...response.data,
          show_visa: response.data.show_visa === 1,
          show_mastercard: response.data.show_mastercard === 1,
          show_maestro: response.data.show_maestro === 1,
          show_troy: response.data.show_troy === 1,
          show_amex: response.data.show_amex === 1,
        });
      }
    } catch (error) {
      message.error('Footer ayarları yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterSettings();
  }, []);

  // 2. Ayarları Kaydet
  const onSave = async (values) => {
    setSaving(true);
    try {
      await axios.post(`${API_URL}/api/footer`, {
        ...values,
        show_visa: values.show_visa ? 1 : 0,
        show_mastercard: values.show_mastercard ? 1 : 0,
        show_maestro: values.show_maestro ? 1 : 0,
        show_troy: values.show_troy ? 1 : 0,
        show_amex: values.show_amex ? 1 : 0,
      });
      message.success('Footer ve Kredi Kartı ikon tercihleri kaydedildi.');
    } catch (error) {
      message.error('Kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large" description="Footer Ayarları Yükleniyor..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title={<span><LayoutOutlined /> Footer (Alt Bilgi) & Ödeme Logoları Yönetimi</span>}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSave}
        >
          <Row gutter={24}>
            
            {/* SOL KOLON - METİN VE İLETİŞİM ALANLARI */}
            <Col xs={24} lg={14}>
              <Card type="inner" title="Genel Footer Metinleri" style={{ marginBottom: '24px' }}>
                <Form.Item 
                  label="Hakkımızda Metni (About)" 
                  name="about_text"
                  rules={[{ required: true, message: 'Lütfen hakkında yazısı girin.' }]}
                >
                  <TextArea rows={3} placeholder="Footer alanında görünecek kısa şirket tanıtım yazısı." />
                </Form.Item>

                <Form.Item 
                  label="Çalışma Saatleri Bilgisi" 
                  name="contact_hours"
                  rules={[{ required: true, message: 'Çalışma saatlerini belirtin.' }]}
                >
                  <Input placeholder="Örn: 7/24 Müşteri Hizmetleri" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Telefon Numarası" name="contact_phone">
                      <Input placeholder="Örn: 0380 123 45 67" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="E-Posta Adresi" name="contact_email">
                      <Input placeholder="Örn: info@duzcemercedesparts.com" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item 
                  label="Telif Hakkı Metni (Copyright)" 
                  name="copyright_text"
                  rules={[{ required: true, message: 'Telif hakkı metni gereklidir.' }]}
                >
                  <Input placeholder="Örn: Düzce Mercedes Parts. Tüm Hakları Saklıdır." />
                </Form.Item>
              </Card>
            </Col>

            {/* SAĞ KOLON - KREDİ KARTI LOGOLARI AÇ/KAPAT */}
            <Col xs={24} lg={10}>
              <Card 
                type="inner" 
                title={<span><CreditCardOutlined /> Footer Kredi Kartı Logoları</span>}
                style={{ height: '100%' }}
              >
                <Alert 
                  message="Ödeme Seçenekleri Gösterimi"
                  description="Footer kısmında müşterilerinize sunulacak aktif ödeme yöntemi logolarını belirleyebilirsiniz."
                  type="info"
                  showIcon
                  style={{ marginBottom: '20px' }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="middle">
                      <VisaLogo />
                      <span style={{ fontWeight: 500 }}>Visa Logosu</span>
                    </Space>
                    <Form.Item name="show_visa" valuePropName="checked" style={{ margin: 0 }}>
                      <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                    </Form.Item>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="middle">
                      <MastercardLogo />
                      <span style={{ fontWeight: 500 }}>MasterCard Logosu</span>
                    </Space>
                    <Form.Item name="show_mastercard" valuePropName="checked" style={{ margin: 0 }}>
                      <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                    </Form.Item>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="middle">
                      <MaestroLogo />
                      <span style={{ fontWeight: 500 }}>Maestro Logosu</span>
                    </Space>
                    <Form.Item name="show_maestro" valuePropName="checked" style={{ margin: 0 }}>
                      <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                    </Form.Item>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="middle">
                      <TroyLogo />
                      <span style={{ fontWeight: 500 }}>TROY Logosu</span>
                    </Space>
                    <Form.Item name="show_troy" valuePropName="checked" style={{ margin: 0 }}>
                      <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                    </Form.Item>

                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="middle">
                      <AmexLogo />
                      <span style={{ fontWeight: 500 }}>American Express Logosu</span>
                    </Space>
                    <Form.Item name="show_amex" valuePropName="checked" style={{ margin: 0 }}>
                      <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                    </Form.Item>
                  </div>

                </div>
              </Card>
            </Col>

          </Row>

          <Divider />

          <Form.Item style={{ textAlign: 'right', margin: 0 }}>
            <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={saving}>
              Footer Ayarlarını Kaydet
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default FooterSettings;