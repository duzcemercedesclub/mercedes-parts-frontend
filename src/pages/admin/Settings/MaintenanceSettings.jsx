import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  DatePicker,
  Typography,
  Alert,
  Row,
  Col,
  Spin,
  message,
  Divider
} from 'antd';
import {
  ToolOutlined,
  SaveOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const MaintenanceSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    };
  };

  // Ayarları Çek
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/maintenance/admin/settings`, getAuthHeaders());
      const data = res.data;
      const activeStatus = Boolean(data.is_active);
      setIsActive(activeStatus);

      form.setFieldsValue({
        is_active: activeStatus,
        title: data.title || 'Sitemiz Bakımdadır',
        message: data.message || '',
        estimated_end_datetime: data.estimated_end_datetime ? dayjs(data.estimated_end_datetime) : null
      });
    } catch (error) {
      const errDetail = error.response?.data?.message || 'Bakım modu ayarları çekilemedi.';
      message.error(errDetail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Kaydet
  const handleSave = async (values) => {
    setSaveLoading(true);
    try {
      const payload = {
        is_active: values.is_active ? 1 : 0,
        title: values.title,
        message: values.message,
        estimated_end_datetime: values.estimated_end_datetime
          ? values.estimated_end_datetime.format('YYYY-MM-DD HH:mm:ss')
          : null
      };

      const res = await axios.put(`${API_URL}/api/maintenance/admin/settings`, payload, getAuthHeaders());
      
      setIsActive(Boolean(values.is_active));
      message.success(res.data.message || 'Bakım modu ayarları başarıyla güncellendi.');
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      const errDetail = error.response?.data?.message || error.response?.data?.error || 'Ayarlar kaydedilirken bir hata oluştu.';
      message.error(`Hata: ${errDetail}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <ToolOutlined /> Bakım Modu Yönetimi
          </Title>
          <Text type="secondary">
            Sitenizi bakım moduna alabilir, ziyaretçilere gösterilecek duyuru metnini özelleştirebilirsiniz.
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchSettings}>
          Yenile
        </Button>
      </div>

      {isActive ? (
        <Alert
          message="SİTE ŞU ANDA BAKIM MODUNDADIR"
          description="Normal ziyaretçiler sadece bakım ekranını görür ve Mercedes logosu döner. Siz admin hesabı ile giriş yaptığınız için siteyi kullanmaya devam edebilirsiniz."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 24, borderRadius: 8 }}
        />
      ) : (
        <Alert
          message="Site Yayında"
          description="Siteniz şu anda tüm ziyaretçilere açıktır ve normal olarak çalışmaktadır."
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ marginBottom: 24, borderRadius: 8 }}
        />
      )}

      <Card variant="borderless">
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="is_active"
                  label="Bakım Modu Durumu"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="AÇIK (BAKIMDA)"
                    unCheckedChildren="KAPALI (CANLI YAYINDA)"
                    onChange={(checked) => setIsActive(checked)}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="estimated_end_datetime"
                  label="Tahmini Bitiş Tarihi & Saati (Opsiyonel)"
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    style={{ width: '100%' }}
                    placeholder="Tahmini bitiş zamanı seçin"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left" style={{ borderColor: '#1890ff' }}>
              <InfoCircleOutlined /> Bakım Ekranı İçerikleri
            </Divider>

            <Row gutter={24}>
              <Col xs={24}>
                <Form.Item
                  name="title"
                  label="Bakım Ekranı Başlığı"
                  rules={[{ required: true, message: 'Lütfen bakım başlığını giriniz.' }]}
                >
                  <Input placeholder="Örn: Sitemiz Bakımdadır" size="large" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="message"
                  label="Bakım Açıklama Metni"
                  rules={[{ required: true, message: 'Lütfen açıklama metnini giriniz.' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Sizlere daha iyi hizmet verebilmek için altyapımızı güncelliyoruz..."
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ textAlign: 'right', marginTop: 16 }}>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saveLoading} size="large">
                Bakım Ayarlarını Kaydet
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default MaintenanceSettings;