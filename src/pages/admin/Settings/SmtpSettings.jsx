import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, Space, message, Spin, Divider, InputNumber, Alert, Modal } from 'antd';
import { MailOutlined, SaveOutlined, SendOutlined, SafetyOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const SmtpSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  // 1. SMTP Ayarlarını API'den Çek
  const fetchSmtpSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/smtp-settings');
      if (response.data) {
        form.setFieldsValue(response.data);
      }
    } catch (error) {
      message.error('SMTP ayarları sunucudan yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmtpSettings();
  }, []);

  // 2. Ayarları Veritabanına Kaydet (POST)
  const onSave = async (values) => {
    setSaving(true);
    try {
      await axios.post('http://localhost:5000/api/smtp-settings', values);
      message.success('SMTP e-posta ayarları başarıyla güncellendi.');
    } catch (error) {
      message.error('Ayarlar kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  // 3. SMTP Ayarlarını Test Etmek İçin Mail Gönder (POST /test)
  const handleSendTestMail = async () => {
    if (!testEmail) {
      message.warning('Lütfen geçerli bir alıcı e-posta adresi yazın.');
      return;
    }

    setTesting(true);
    // Formdaki güncel alanları alıyoruz (Kaydetmeden önce de test edebilmek için)
    const currentFormValues = form.getFieldsValue();

    try {
      const response = await axios.post('http://localhost:5000/api/smtp-settings/test', {
        test_email: testEmail,
        ...currentFormValues
      });
      message.success(response.data.message);
      setIsTestModalOpen(false);
      setTestEmail('');
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Bağlantı hatası oluştu.';
      Modal.error({
        title: 'SMTP Bağlantı Hatası',
        content: errMsg,
        width: 500
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="SMTP Ayarları Yükleniyor..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={<span><MailOutlined /> SMTP E-Posta Ayarları</span>}
        extra={
          <Button 
            type="default" 
            icon={<SendOutlined />} 
            onClick={() => setIsTestModalOpen(true)}
          >
            Sistemi Test Et (Mail Gönder)
          </Button>
        }
      >
        <Alert 
          message="Dikkat"
          description="Sistem genelinde otomatik gönderilecek e-postaların (sipariş makbuzları, üyelik doğrulamaları vb.) çalışabilmesi için SMTP ayarlarının eksiksiz doldurulması gerekir."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={onSave}
        >
          <Row gutter={24}>
            
            {/* SOL KOLON - SUNUCU PARAMETRELERİ */}
            <Col xs={24} md={12}>
              <Card type="inner" title="Sunucu Bağlantı Ayarları" style={{ height: '100%' }}>
                <Form.Item 
                  label="SMTP Sunucusu (Host)" 
                  name="smtp_host"
                  rules={[{ required: true, message: 'Sunucu adresi gereklidir. Örn: smtp.gmail.com' }]}
                >
                  <Input placeholder="smtp.gmail.com veya mail.siteniz.com" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item 
                      label="SMTP Portu" 
                      name="smtp_port"
                      rules={[{ required: true, message: 'Port numarası gereklidir.' }]}
                    >
                      <InputNumber style={{ width: '100%' }} placeholder="465 veya 587" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      label="Güvenlik Protokolü" 
                      name="smtp_secure"
                      rules={[{ required: true, message: 'Protokol seçimi gereklidir.' }]}
                    >
                      <Select placeholder="Güvenlik Türü">
                        <Option value="ssl">SSL (Genellikle Port 465)</Option>
                        <Option value="tls">TLS (Genellikle Port 587)</Option>
                        <Option value="none">Yok (Güvensiz)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item 
                  label="SMTP Kullanıcı Adı (E-posta)" 
                  name="smtp_user"
                  rules={[{ required: true, type: 'email', message: 'Geçerli bir kullanıcı e-postası giriniz!' }]}
                >
                  <Input placeholder="ornek@domain.com" />
                </Form.Item>

                <Form.Item 
                  label="SMTP Şifresi" 
                  name="smtp_pass"
                  rules={[{ required: true, message: 'Lütfen SMTP şifrenizi girin!' }]}
                >
                  <Input.Password placeholder="••••••••••••••••" />
                </Form.Item>
              </Card>
            </Col>

            {/* SAĞ KOLON - ALICI/GÖNDERİCİ DETAYLARI */}
            <Col xs={24} md={12}>
              <Card type="inner" title="Gönderici (Kimlik) Bilgileri" style={{ height: '100%' }}>
                <Form.Item 
                  label="Maske Gönderici Adı (From Name)" 
                  name="from_name"
                  rules={[{ required: true, message: 'Gönderici adı zorunludur.' }]}
                  tooltip="Alıcıların e-postayı kimden aldıklarını gösteren isimdir. Örn: Düzce Mercedes Parts"
                >
                  <Input placeholder="Düzce Mercedes Parts" />
                </Form.Item>

                <Form.Item 
                  label="Görünen Gönderici E-postası (From Email)" 
                  name="from_email"
                  rules={[
                    { required: true, message: 'Gönderici e-postası zorunludur.' },
                    { type: 'email', message: 'Geçerli bir e-posta adresi yazın!' }
                  ]}
                  tooltip="Alıcıya görünecek olan gönderen e-posta adresidir. Çoğu sunucu bu alanın SMTP Kullanıcı Adı ile birebir uyuşmasını zorunlu kılar."
                >
                  <Input placeholder="noreply@siteniz.com" />
                </Form.Item>

                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', marginTop: '20px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                    <SafetyOutlined style={{ color: '#10b981', marginRight: '6px' }} /> Bilgilendirme
                  </span>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                    Eğer <strong>Gmail</strong> altyapısı kullanıyorsanız, standart hesap şifreniz güvenlik nedeniyle bloke edilebilir. Gmail hesabınızda 2 Adımlı Doğrulamayı açıp <strong>"Uygulama Şifreleri"</strong> (App Passwords) kısmından 16 haneli özel bir şifre üretip buradaki SMTP Şifresi alanına yapıştırmanız önerilir.
                  </p>
                </div>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Form.Item style={{ textAlign: 'right', margin: 0 }}>
            <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={saving}>
              SMTP Ayarlarını Kaydet
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* ANLIK BAĞLANTI SINA / TEST MAİLİ MODALI */}
      <Modal
        title="SMTP Bağlantı ve İletim Testi"
        open={isTestModalOpen}
        onCancel={() => {
          if (!testing) setIsTestModalOpen(false);
        }}
        onOk={handleSendTestMail}
        okText="Test Maili Gönder"
        cancelText="Kapat"
        confirmLoading={testing}
        destroyOnClose
      >
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Form alanlarında düzenlediğiniz ayarlarla sunucunuza bir bağlantı isteği gönderilecek ve aşağıda belirteceğiniz adrese anlık test e-postası ulaştırılacaktır.
        </p>
        <Form layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item label="Alıcı E-Posta Adresi (Test Maillerinin Gideceği Yer)" required>
            <Input 
              type="email" 
              placeholder="kendiadresiniz@gmail.com" 
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              disabled={testing}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SmtpSettings;