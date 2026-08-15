import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Space, Button, message, Input, Modal, Descriptions, Divider } from 'antd';
import { UserOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, PhoneOutlined, MailOutlined, HomeOutlined, CreditCardOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/users`);
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      message.error('Kullanıcı verileri yüklenirken bir bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    
    const filtered = users.filter((user) => {
      const fullName = `${user.name || ''} ${user.surname || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const phone = (user.phone || '').toLowerCase();
      const role = (user.role || '').toLowerCase();

      return (
        fullName.includes(value) ||
        email.includes(value) ||
        phone.includes(value) ||
        role.includes(value)
      );
    });
    
    setFilteredUsers(filtered);
  };

  const handleShowDetail = (record) => {
    setSelectedUser(record);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Kullanıcı Adı Soyadı',
      key: 'fullName',
      render: (_, record) => (
        <Space>
          <UserOutlined style={{ color: '#1677ff' }} />
          <strong>{record.name} {record.surname}</strong>
        </Space>
      ),
    },
    {
      title: 'E-posta Adresi',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Telefon',
      key: 'phone',
      render: (_, record) => record.phone ? `${record.phone_code || '+90'} ${record.phone}` : '-',
    },
    {
      title: 'Rol / Yetki',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = role === 'admin' ? 'magenta' : 'blue';
        return (
          <Tag color={color} style={{ fontWeight: '500' }}>
            {role ? role.toUpperCase() : 'USER'}
          </Tag>
        );
      },
    },
    {
      title: 'Kayıt Tarihi',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (date ? new Date(date).toLocaleString('tr-TR') : '-'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={() => handleShowDetail(record)}
        >
          Detay
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Sistem Kullanıcıları</Title>
          <Text type="secondary">Veritabanında kayıtlı tüm kullanıcı hesaplarının yetki ve detaylı profilleri.</Text>
        </div>
        <Button 
          type="default" 
          icon={<ReloadOutlined />} 
          onClick={fetchUsers} 
          loading={loading}
        >
          Yenile
        </Button>
      </div>

      <div style={{ marginBottom: 16, maxWidth: 400 }}>
        <Input
          placeholder="Ad, soyad, e-posta, telefon veya rol ile ara..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={searchText}
          onChange={handleSearch}
          allowClear
        />
      </div>

      <Card variant="borderless">
        <Table 
          columns={columns} 
          dataSource={filteredUsers} 
          rowKey="id" 
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            locale: { items_per_page: '/ sayfa' }
          }}
        />
      </Card>

      <Modal
        title={
          <Space style={{ fontSize: 18 }}>
            <UserOutlined style={{ color: '#1677ff' }} />
            <span>Kullanıcı Detay Profili</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        centered
        width={750}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>
            Kapat
          </Button>
        ]}
      >
        {selectedUser && (
          <div style={{ marginTop: 20 }}>
            <Descriptions title="Kişisel Bilgiler" bordered size="small" column={2}>
              <Descriptions.Item label="Adı Soyadı">
                <strong>{selectedUser.name} {selectedUser.surname}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="E-posta">
                <MailOutlined style={{ marginRight: 6, color: '#1677ff' }} />
                {selectedUser.email}
              </Descriptions.Item>
              <Descriptions.Item label="Telefon">
                <PhoneOutlined style={{ marginRight: 6, color: '#52c41a' }} />
                {selectedUser.phone ? `${selectedUser.phone_code || '+90'} ${selectedUser.phone}` : 'Belirtilmemiş'}
              </Descriptions.Item>
              <Descriptions.Item label="Cinsiyet">
                {selectedUser.gender === 'male' ? 'Erkek' : selectedUser.gender === 'female' ? 'Kadın' : 'Belirtilmemiş'}
              </Descriptions.Item>
              <Descriptions.Item label="Rol / Yetki">
                <Tag color={selectedUser.role === 'admin' ? 'magenta' : 'blue'}>
                  {selectedUser.role ? selectedUser.role.toUpperCase() : 'USER'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Pazarlama Onayı">
                <Tag color={selectedUser.is_marketing_accepted ? 'green' : 'red'}>
                  {selectedUser.is_marketing_accepted ? 'Evet' : 'Hayır'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Kayıt Tarihi" span={2}>
                {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString('tr-TR') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions title="Adres Bilgileri" bordered size="small" column={2}>
              <Descriptions.Item label="Adres Başlığı">
                <HomeOutlined style={{ marginRight: 6, color: '#fa8c16' }} />
                {selectedUser.parsedAddress?.title || 'Belirtilmedi'}
              </Descriptions.Item>
              <Descriptions.Item label="İl / İlçe">
                {selectedUser.parsedAddress?.city ? `${selectedUser.parsedAddress.city} / ${selectedUser.parsedAddress.district || ''}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Mahalle">
                {selectedUser.parsedAddress?.neighborhood || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ülke">
                {selectedUser.parsedAddress?.country || 'Türkiye'}
              </Descriptions.Item>
              <Descriptions.Item label="Açık Adres" span={2}>
                {selectedUser.parsedAddress?.addressDetail || selectedUser.address || 'Kayıtlı teslimat adresi bulunamadı.'}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions title="Fatura Bilgileri" bordered size="small" column={2}>
              <Descriptions.Item label="Fatura Tipi">
                {selectedUser.parsedBilling?.invoiceType ? selectedUser.parsedBilling.invoiceType.toUpperCase() : 'Bireysel'}
              </Descriptions.Item>
              <Descriptions.Item label="TC No / Vergi No">
                {selectedUser.parsedBilling?.tcNo || selectedUser.parsedBilling?.taxNo || '-'}
              </Descriptions.Item>
              {selectedUser.parsedBilling?.companyName && (
                <Descriptions.Item label="Şirket Adı" span={2}>
                  {selectedUser.parsedBilling.companyName}
                </Descriptions.Item>
              )}
              {selectedUser.parsedBilling?.taxOffice && (
                <Descriptions.Item label="Vergi Dairesi" span={2}>
                  {selectedUser.parsedBilling.taxOffice}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions title="Bildirim Tercihleri & Ödeme Bilgisi" bordered size="small" column={2}>
              <Descriptions.Item label="SMS Bildirimi">
                <Tag color={selectedUser.sms_notification ? 'green' : 'volcano'}>
                  {selectedUser.sms_notification ? 'Açık' : 'Kapalı'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="E-posta Bildirimi">
                <Tag color={selectedUser.email_notification ? 'green' : 'volcano'}>
                  {selectedUser.email_notification ? 'Açık' : 'Kapalı'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Kayıtlı IBAN" span={2}>
                <CreditCardOutlined style={{ marginRight: 6, color: '#13c2c2' }} />
                {selectedUser.iban || 'Kayıtlı IBAN bulunamadı.'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserList;