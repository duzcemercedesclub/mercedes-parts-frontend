import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Card, Switch, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShareAltOutlined } from '@ant-design/icons';
import axios from 'axios';

const SocialMediaManager = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form] = Form.useForm();

  // 1. Sosyal Medya Verilerini Getir
  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/social-links');
      setLinks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error('Sosyal medya adresleri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // 2. Aktif/Pasif Durumu Hızlı Değiştir (PATCH)
  const handleToggleStatus = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/social-links/${id}/toggle`);
      message.success(response.data.message);
      fetchLinks();
    } catch (error) {
      message.error('Durum değiştirilemedi.');
    }
  };

  // 3. Ekleme veya Güncelleme İşlemini Kaydet
  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        is_active: values.is_active ? 1 : 0
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/social-links/${editingId}`, payload);
        message.success('Sosyal medya başarıyla güncellendi.');
      } else {
        await axios.post('http://localhost:5000/api/social-links', payload);
        message.success('Sosyal medya başarıyla eklendi.');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchLinks();
    } catch (error) {
      message.error('Kayıt işlemi başarısız.');
    }
  };

  // 4. Sosyal Medya Sil
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/social-links/${id}`);
      message.success('Sosyal medya başarıyla silindi.');
      fetchLinks();
    } catch (error) {
      message.error('Silme işlemi başarısız.');
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      is_active: record.is_active === 1
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true });
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'İkon',
      dataIndex: 'icon',
      key: 'icon',
      width: 100,
      render: (icon) => (
        <span style={{ fontSize: '18px', color: '#1e1e1e' }}>
          <i className={icon}></i>
        </span>
      ),
    },
    {
      title: 'Platform Adı',
      dataIndex: 'platform_name',
      key: 'platform_name',
    },
    {
      title: 'Yönlendirme Linki (URL)',
      dataIndex: 'url',
      key: 'url',
      render: (url) => <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>,
    },
    {
      title: 'Görünürlük (Açık/Kapalı)',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 150,
      render: (is_active, record) => (
        <Space size="middle">
          <Switch 
            checked={is_active === 1} 
            onChange={() => handleToggleStatus(record.id)} 
            checkedChildren="Açık"
            unCheckedChildren="Kapalı"
          />
          {is_active === 1 ? (
            <Tag color="success">Aktif</Tag>
          ) : (
            <Tag color="default">Gizli</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)} 
          />
          <Popconfirm
            title="Bu sosyal medya adresini silmek istediğinize emin misiniz?"
            okText="Evet"
            cancelText="Hayır"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={<span><ShareAltOutlined /> Sosyal Medya Linkleri Yönetimi</span>} 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
            Yeni Sosyal Medya Ekle
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={links} 
          rowKey="id" 
          loading={loading}
          pagination={false} 
        />

        <Modal
          title={editingId ? "Sosyal Medya Güncelle" : "Yeni Sosyal Medya Ekle"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => form.submit()}
          okText="Kaydet"
          cancelText="İptal"
          destroyOnHidden
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="platform_name"
              label="Platform Adı"
              rules={[{ required: true, message: 'Lütfen platform adını girin!' }]}
            >
              <Input placeholder="Instagram, Facebook vb." />
            </Form.Item>

            <Form.Item
              name="icon"
              label="Font Awesome İkon Sınıfı"
              rules={[{ required: true, message: 'Lütfen ikon sınıfını girin!' }]}
              tooltip="Örn: fab fa-instagram, fab fa-youtube, fab fa-linkedin-in"
            >
              <Input placeholder="fab fa-instagram" />
            </Form.Item>

            <Form.Item
              name="url"
              label="Yönlendirme Linki (URL)"
              rules={[
                { required: true, message: 'Lütfen yönlendirme linkini girin!' },
                { type: 'url', message: 'Lütfen geçerli bir URL adresi girin!' }
              ]}
            >
              <Input placeholder="https://instagram.com/hesabiniz" />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="Varsayılan Görünürlük Durumu"
              valuePropName="checked"
            >
              <Switch checkedChildren="Aktif Başlat" unCheckedChildren="Pasif Başlat" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default SocialMediaManager;