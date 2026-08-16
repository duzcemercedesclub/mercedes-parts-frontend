import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Button,
  Modal,
  Switch,
  Select,
  Radio,
  message,
  Spin
} from 'antd';
import {
  UserOutlined,
  EnvironmentOutlined,
  LockOutlined,
  BellOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  RightOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  BankOutlined,
  InfoCircleFilled
} from '@ant-design/icons';
import {
  getCityNames as getTurkeyCityNames,
  getCities as getTurkeyCities,
  getDistrictsByCityCode,
  getNeighbourhoodsByCityCodeAndDistrict
} from 'turkey-neighbourhoods';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './responsive.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const normalizeTR = (value = '') =>
  String(value)
    .trim()
    .toLocaleLowerCase('tr-TR');

const getCities = () => {
  try {
    const cities = getTurkeyCityNames();
    return Array.isArray(cities) ? cities : [];
  } catch (error) {
    console.error('Türkiye il listesi alınamadı:', error);
    return [];
  }
};

const getCityObject = (cityName) => {
  if (!cityName) return null;
  try {
    const cities = getTurkeyCities();
    if (!Array.isArray(cities)) return null;

    return (
      cities.find(
        (city) => normalizeTR(city?.name) === normalizeTR(cityName)
      ) || null
    );
  } catch (error) {
    console.error('İl bilgisi alınamadı:', error);
    return null;
  }
};

const getDistricts = (cityName) => {
  if (!cityName) return [];
  try {
    const city = getCityObject(cityName);
    if (!city?.code) return [];
    const districts = getDistrictsByCityCode(String(city.code));
    return Array.isArray(districts) ? districts : [];
  } catch (error) {
    console.error(`"${cityName}" ilçeleri alınamadı:`, error);
    return [];
  }
};

const getNeighborhoods = (cityName, districtName) => {
  if (!cityName || !districtName) return [];
  try {
    const city = getCityObject(cityName);
    if (!city?.code) return [];
    const districts = getDistricts(cityName);

    const matchedDistrict =
      districts.find(
        (district) => normalizeTR(district) === normalizeTR(districtName)
      ) || districtName;

    const neighborhoods = getNeighbourhoodsByCityCodeAndDistrict(
      String(city.code),
      matchedDistrict
    );
    return Array.isArray(neighborhoods) ? neighborhoods : [];
  } catch (error) {
    console.error(`"${cityName} / ${districtName}" mahalleleri alınamadı:`, error);
    return [];
  }
};

const MyProfile = () => {
  const { token, logout, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const [userInfoForm] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [communicationsForm] = Form.useForm();
  const [paymentsForm] = Form.useForm();

  const [addressDetailText, setAddressDetailText] = useState('');
  const [invoiceType, setInvoiceType] = useState('bireysel');

  const [citiesList, setCitiesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [neighborhoodsList, setNeighborhoodsList] = useState([]);

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    setCitiesList(getCities());
  }, []);

  const fetchProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setProfileData(data);
      } else {
        message.error(data.message || 'Profil verisi alınamadı.');
      }
    } catch (error) {
      console.error('Profil yükleme hatası:', error);
      message.error('Sunucu bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (!profileData || !activeModal) return;

    if (activeModal === 'userInfo') {
      userInfoForm.setFieldsValue({
        name: profileData.name,
        surname: profileData.surname,
        email: profileData.email,
        phone: profileData.phone,
        gender: profileData.gender || 'unspecified'
      });
    } else if (activeModal === 'addresses') {
      const addr = profileData.parsedAddress || {};
      const bill = profileData.parsedBilling || {};

      const rawCity = addr.city || (citiesList.length > 0 ? citiesList[0] : 'Düzce');
      const rawDistrict = addr.district || '';
      const rawNeighborhood = addr.neighborhood || '';
      const detailVal = addr.addressDetail || profileData.address || '';

      setAddressDetailText(detailVal);
      setInvoiceType(bill.invoiceType || 'bireysel');

      const allCities = getCities();
      const currentCity = allCities.find(c => String(c).toLocaleLowerCase('tr') === String(rawCity).toLocaleLowerCase('tr')) || rawCity;

      const districts = getDistricts(currentCity);
      let currentDistrict = districts.find(d => String(d).toLocaleLowerCase('tr') === String(rawDistrict).toLocaleLowerCase('tr'));
      if (!currentDistrict && String(rawDistrict).toLocaleLowerCase('tr').includes('merkez')) {
        currentDistrict = districts.find(d => String(d).toLocaleLowerCase('tr').includes('merkez'));
      }

      const neighborhoods = currentDistrict
        ? getNeighborhoods(currentCity, currentDistrict)
        : [];
      let currentNeighborhood = neighborhoods.find(n => String(n).toLocaleLowerCase('tr') === String(rawNeighborhood).toLocaleLowerCase('tr')) || rawNeighborhood;

      setSelectedCity(currentCity);
      setDistrictsList(districts);
      setSelectedDistrict(currentDistrict || '');
      setNeighborhoodsList(neighborhoods);

      addressForm.setFieldsValue({
        fullName: addr.fullName || `${profileData.name || ''} ${profileData.surname || ''}`.trim(),
        phoneCode: addr.phoneCode || profileData.phone_code || '+90',
        phone: addr.phone || profileData.phone || '',
        country: addr.country || 'Türkiye',
        city: currentCity,
        district: currentDistrict,
        neighborhood: currentNeighborhood,
        addressDetail: detailVal,
        title: addr.title || 'Ev adresim',
        invoiceType: bill.invoiceType || 'bireysel',
        tcNo: bill.tcNo || '',
        companyName: bill.companyName || '',
        taxOffice: bill.taxOffice || '',
        taxNo: bill.taxNo || ''
      });
    } else if (activeModal === 'password') {
      passwordForm.resetFields();
    } else if (activeModal === 'communications') {
      communicationsForm.setFieldsValue({
        sms_notification: Boolean(profileData.sms_notification),
        email_notification: Boolean(profileData.email_notification),
        is_marketing_accepted: Boolean(profileData.is_marketing_accepted)
      });
    } else if (activeModal === 'payments') {
      paymentsForm.setFieldsValue({
        iban: profileData.iban,
        saved_cards: profileData.saved_cards
      });
    }
  }, [activeModal, profileData]);

  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    setSelectedDistrict('');
    setNeighborhoodsList([]);

    const districts = getDistricts(cityName);
    setDistrictsList(districts);

    addressForm.setFieldsValue({
      city: cityName,
      district: undefined,
      neighborhood: undefined
    });
  };

  const handleDistrictChange = (districtName) => {
    setSelectedDistrict(districtName);
    const activeCity = addressForm.getFieldValue('city') || selectedCity;

    if (activeCity && districtName) {
      const neighborhoods = getNeighborhoods(activeCity, districtName);
      setNeighborhoodsList(neighborhoods);
    } else {
      setNeighborhoodsList([]);
    }

    addressForm.setFieldsValue({
      district: districtName,
      neighborhood: undefined
    });
  };

  const handleUpdate = async (endpoint, values, successMsg) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/users/profile/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      if (response.ok) {
        message.success(data.message || successMsg);
        setActiveModal(null);
        await fetchProfile();
        if (fetchUserProfile) await fetchUserProfile();
      } else {
        message.error(data.message || 'İşlem başarısız.');
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      message.error('Sunucu ile iletişim kurulamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    message.success('Çıkış yapıldı.');
    navigate('/login');
  };

  const settingCards = [
    {
      key: 'userInfo',
      title: 'Üyelik Bilgilerim',
      desc: 'Ad, soyad, e-posta ve telefon bilgilerinizi güncelleyin',
      icon: <UserOutlined style={{ fontSize: 24, color: '#1677ff' }} />
    },
    {
      key: 'addresses',
      title: 'Adreslerim',
      desc: 'Teslimat ve fatura adreslerinizi yönetin',
      icon: <EnvironmentOutlined style={{ fontSize: 24, color: '#52c41a' }} />
    },
    {
      key: 'password',
      title: 'Şifre Değişikliği',
      desc: 'Hesap şifrenizi güvenli şekilde yenileyin',
      icon: <LockOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
    },
    {
      key: 'communications',
      title: 'İletişim Tercihlerim',
      desc: 'SMS ve e-posta bildirim izinlerinizi ayarlayın',
      icon: <BellOutlined style={{ fontSize: 24, color: '#722ed1' }} />
    },
    {
      key: 'payments',
      title: 'Ödeme Seçeneklerim',
      desc: 'Kayıtlı kart ve IBAN bilgilerinizi düzenleyin',
      icon: <CreditCardOutlined style={{ fontSize: 24, color: '#eb2f96' }} />
    },
    {
      key: 'agreements',
      title: 'Üyelik Sözleşmeleri',
      desc: 'KVKK ve kullanım koşulları belgeleri',
      icon: <FileTextOutlined style={{ fontSize: 24, color: '#13c2c2' }} />
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" description="Profil yükleniyor..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 20,
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
        styles={{ body: { padding: 16 } }}
      >
        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
          Hesap Ayarlarım
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Kişisel bilgilerinizi ve güvenlik ayarlarınızı yönetin.
        </Text>
      </Card>

      <Row gutter={[16, 16]}>
        {settingCards.map((item) => (
          <Col xs={24} sm={12} lg={8} key={item.key}>
            <Card
              hoverable
              onClick={() => setActiveModal(item.key)}
              style={{
                borderRadius: 12,
                border: '1px solid #e8e8e8',
                height: '100%',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
              styles={{ body: { padding: 16 } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #f0f0f0',
                      flexShrink: 0
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <Title level={5} style={{ margin: 0, fontSize: 14 }} ellipsis>
                      {item.title}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                      Yönetmek için tıklayın
                    </Text>
                  </div>
                </div>
                <RightOutlined style={{ color: '#bfbfbf', fontSize: 14, flexShrink: 0 }} />
              </div>
            </Card>
          </Col>
        ))}

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            onClick={handleLogout}
            style={{
              borderRadius: 12,
              border: '1px solid #ffccc7',
              backgroundColor: '#fff2f0',
              height: '100%'
            }}
            styles={{ body: { padding: 16 } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <LogoutOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, fontSize: 14, color: '#ff4d4f' }}>
                    Çıkış Yap
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Oturumu sonlandır
                  </Text>
                </div>
              </div>
              <RightOutlined style={{ color: '#ff4d4f', fontSize: 14, flexShrink: 0 }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 1. ÜYELİK BİLGİLERİ MODALI */}
      <Modal
        title="Üyelik Bilgilerim"
        open={activeModal === 'userInfo'}
        onCancel={() => setActiveModal(null)}
        footer={null}
        zIndex={2000}
        centered
        destroyOnHidden
      >
        <Form
          form={userInfoForm}
          layout="vertical"
          onFinish={(values) => handleUpdate('info', values, 'Bilgiler güncellendi.')}
          style={{ marginTop: 16 }}
        >
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item label="Ad" name="name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Soyad" name="surname">
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="E-Posta" name="email">
            <Input prefix={<MailOutlined />} disabled />
          </Form.Item>
          <Form.Item label="Telefon" name="phone">
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>
          <Form.Item label="Cinsiyet" name="gender">
            <Select virtual={false}>
              <Option value="unspecified">Belirtmek İstemiyorum</Option>
              <Option value="male">Erkek</Option>
              <Option value="female">Kadın</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block icon={<SaveOutlined />} loading={submitting}>
            Kaydet
          </Button>
        </Form>
      </Modal>

      {/* 2. ADRESLERİM VE FATURA BİLGİLERİ MODALI */}
      <Modal
        title="Adres ve Fatura Bilgilerim"
        open={activeModal === 'addresses'}
        onCancel={() => setActiveModal(null)}
        footer={null}
        zIndex={2000}
        centered
        width="100%"
        style={{ maxWidth: 560 }}
        destroyOnHidden
      >
        <Form
          form={addressForm}
          layout="vertical"
          onFinish={(values) => handleUpdate('addresses', values, 'Adres ve fatura bilgileriniz kaydedildi.')}
          style={{ marginTop: 16 }}
        >
          <Title level={5} style={{ marginBottom: 16, fontWeight: 600 }}>
            İletişim Bilgileri
          </Title>

          <Form.Item name="fullName" rules={[{ required: true, message: 'Ad Soyad zorunludur.' }]}>
            <Input size="large" placeholder="Ad Soyad" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={10} sm={8}>
              <Form.Item name="phoneCode" initialValue="+90">
                <Select virtual={false} size="large" style={{ borderRadius: 8 }}>
                  <Option value="+90">TR (+90)</Option>
                  <Option value="+1">US (+1)</Option>
                  <Option value="+49">DE (+49)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={14} sm={16}>
              <Form.Item name="phone" rules={[{ required: true, message: 'Telefon numarası zorunludur.' }]}>
                <Input size="large" placeholder="(539) 784-4089" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <div
            style={{
              backgroundColor: '#e6f4ff',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24
            }}
          >
            <InfoCircleFilled style={{ color: '#1677ff', fontSize: 18, flexShrink: 0 }} />
            <Text style={{ color: '#1f1f1f', fontSize: 13 }}>
              Kargo bilgilerini bu numaraya SMS ile ileteceğiz.
            </Text>
          </div>

          <Title level={5} style={{ marginBottom: 16, fontWeight: 600 }}>
            Adres Bilgileri
          </Title>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="country" label="Ülke" rules={[{ required: true }]}>
                <Select virtual={false} size="large" style={{ borderRadius: 8 }}>
                  <Option value="Türkiye">Türkiye</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="city" label="Şehir" rules={[{ required: true, message: 'Şehir seçiniz.' }]}>
                <Select
                  virtual={false}
                  size="large"
                  showSearch
                  placeholder="Şehir Seçin"
                  onChange={handleCityChange}
                  style={{ borderRadius: 8 }}
                >
                  {citiesList.map((city) => (
                    <Option key={city} value={city}>
                      {city}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="district" label="İlçe" rules={[{ required: true, message: 'İlçe seçiniz.' }]}>
            <Select
              virtual={false}
              size="large"
              showSearch
              placeholder="İlçe Seçin"
              onChange={handleDistrictChange}
              disabled={districtsList.length === 0}
              style={{ borderRadius: 8 }}
            >
              {districtsList.map((district) => (
                <Option key={district} value={district}>
                  {district}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="neighborhood" label="Mahalle" rules={[{ required: true, message: 'Mahalle seçiniz.' }]}>
            <Select
              virtual={false}
              size="large"
              showSearch
              placeholder="Mahalle Seçin"
              disabled={neighborhoodsList.length === 0}
              style={{ borderRadius: 8 }}
            >
              {neighborhoodsList.map((neighborhood) => (
                <Option key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ position: 'relative' }}>
            <Form.Item
              name="addressDetail"
              label="Adres Detayı: Cadde, Sokak, Bina No, vb."
              rules={[{ required: true, message: 'Adres detayı gereklidir.' }]}
            >
              <TextArea
                rows={3}
                maxLength={191}
                onChange={(e) => setAddressDetailText(e.target.value)}
                style={{ borderRadius: 8, paddingBottom: 24 }}
              />
            </Form.Item>
            <div
              style={{
                position: 'absolute',
                right: 12,
                bottom: 30,
                fontSize: 12,
                color: '#8c8c8c'
              }}
            >
              {addressDetailText.length}/191
            </div>
          </div>

          <Form.Item name="title" rules={[{ required: true, message: 'Adres başlığı zorunludur.' }]}>
            <Input size="large" placeholder="Ev adresim" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Title level={5} style={{ marginTop: 24, marginBottom: 12, fontWeight: 600 }}>
            Fatura Bilgileri
          </Title>

          <Form.Item name="invoiceType" initialValue="bireysel">
            <Radio.Group
              onChange={(e) => setInvoiceType(e.target.value)}
              value={invoiceType}
              style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}
            >
              <Radio value="bireysel">Bireysel</Radio>
              <Radio value="kurumsal">Kurumsal</Radio>
            </Radio.Group>
          </Form.Item>

          {invoiceType === 'bireysel' ? (
            <>
              <Form.Item name="tcNo" rules={[{ required: true, message: 'T.C. Kimlik numarası gereklidir.' }]}>
                <Input size="large" placeholder="T.C. Kimlik Numarası" maxLength={11} style={{ borderRadius: 8 }} />
              </Form.Item>

              <div
                style={{
                  backgroundColor: '#e6f4ff',
                  borderRadius: 8,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 24
                }}
              >
                <InfoCircleFilled style={{ color: '#1677ff', fontSize: 18, flexShrink: 0 }} />
                <Text style={{ color: '#1f1f1f', fontSize: 13 }}>
                  Fatura bilgilerini düzenlemek için T.C. kimlik numarana ihtiyaç duyuyoruz.
                </Text>
              </div>
            </>
          ) : (
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item name="companyName" label="Firma Adı" rules={[{ required: true, message: 'Firma adı giriniz.' }]}>
                  <Input size="large" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="taxOffice" label="Vergi Dairesi" rules={[{ required: true, message: 'Vergi dairesi giriniz.' }]}>
                  <Input size="large" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="taxNo" label="Vergi Numarası" rules={[{ required: true, message: 'Vergi numarası giriniz.' }]}>
                  <Input size="large" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            icon={<SaveOutlined />}
            loading={submitting}
            style={{ borderRadius: 8, height: 45, fontWeight: 600, marginTop: 12 }}
          >
            Kaydet
          </Button>
        </Form>
      </Modal>

      {/* 3. ŞİFRE DEĞİŞTİRME MODALI */}
      <Modal
        title="Şifre Değişikliği"
        open={activeModal === 'password'}
        onCancel={() => setActiveModal(null)}
        footer={null}
        zIndex={2000}
        centered
        destroyOnHidden
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={(values) => {
            if (values.newPassword !== values.confirmPassword) {
              return message.error('Yeni şifreler eşleşmiyor!');
            }
            handleUpdate('password', values, 'Şifreniz güncellendi.');
            passwordForm.resetFields();
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item label="Mevcut Şifre" name="currentPassword" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item label="Yeni Şifre" name="newPassword" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item label="Yeni Şifre (Tekrar)" name="confirmPassword" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block icon={<SaveOutlined />} loading={submitting}>
            Şifreyi Güncelle
          </Button>
        </Form>
      </Modal>

      {/* 4. İLETİŞİM TERCİHLERİ MODALI */}
      <Modal
        title="İletişim Tercihlerim"
        open={activeModal === 'communications'}
        onCancel={() => setActiveModal(null)}
        footer={null}
        zIndex={2000}
        centered
        destroyOnHidden
      >
        <Form
          form={communicationsForm}
          layout="vertical"
          onFinish={(values) => handleUpdate('communications', values, 'İletişim tercihleriniz güncellendi.')}
          style={{ marginTop: 16 }}
        >
          <Form.Item label="SMS Bildirimleri" name="sms_notification" valuePropName="checked">
            <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
          </Form.Item>
          <Form.Item label="E-Posta Bildirimleri" name="email_notification" valuePropName="checked">
            <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
          </Form.Item>
          <Form.Item label="Pazarlama ve Kampanya İzinleri" name="is_marketing_accepted" valuePropName="checked">
            <Switch checkedChildren="Kabul Edildi" unCheckedChildren="Reddedildi" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block icon={<SaveOutlined />} loading={submitting}>
            Tercihleri Kaydet
          </Button>
        </Form>
      </Modal>

      {/* 5. ÖDEME SEÇENEKLERİ MODALI */}
      <Modal
        title="Ödeme Bilgilerim"
        open={activeModal === 'payments'}
        onCancel={() => setActiveModal(null)}
        footer={null}
        zIndex={2000}
        centered
        destroyOnHidden
      >
        <Form
          form={paymentsForm}
          layout="vertical"
          onFinish={(values) => handleUpdate('payments', values, 'Ödeme bilgileriniz güncellendi.')}
          style={{ marginTop: 16 }}
        >
          <Form.Item label="IBAN Numarası" name="iban">
            <Input prefix={<BankOutlined />} placeholder="TR00 0000 0000 0000 0000 0000 00" />
          </Form.Item>
          <Form.Item label="Kayıtlı Kart Notu / Rumuz" name="saved_cards">
            <Input prefix={<CreditCardOutlined />} placeholder="Örn: Garanti Bonus Kredi Kartım" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block icon={<SaveOutlined />} loading={submitting}>
            Ödeme Bilgilerini Kaydet
          </Button>
        </Form>
      </Modal>

      {/* 6. ÜYELİK SÖZLEŞMELERİ MODALI */}
      <Modal
        title="Üyelik Sözleşmeleri ve Bilgilendirme"
        open={activeModal === 'agreements'}
        onCancel={() => setActiveModal(null)}
        footer={[
          <Button key="close" onClick={() => setActiveModal(null)}>
            Kapat
          </Button>
        ]}
        zIndex={2000}
        centered
      >
        <div style={{ maxHeight: 350, overflowY: 'auto', paddingRight: 8 }}>
          <Title level={5}>KVKK ve Aydınlatma Metni</Title>
          <Paragraph style={{ fontSize: 13, color: '#555' }}>
            6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca, kişisel verileriniz güvenle saklanmaktadır.
          </Paragraph>
          <Title level={5}>Üyelik Sözleşmesi</Title>
          <Paragraph style={{ fontSize: 13, color: '#555' }}>
            Sitemiz üzerinden verilen siparişlerin teslimat süreçleri için bu bilgiler kullanılmaktadır.
          </Paragraph>
        </div>
      </Modal>
    </div>
  );
};

export default MyProfile;