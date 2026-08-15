import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FeaturesManager = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form] = Form.useForm();

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/features`);
      setFeatures(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error('Özellikler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/features/${editingId}`, values);
        message.success('Özellik başarıyla güncellendi.');
      } else {
        await axios.post(`${API_URL}/api/features`, values);
        message.success('Özellik başarıyla eklendi.');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchFeatures();
    } catch (error) {
      message.error('Kayıt işlemi sırasında bir hata oluştu.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/features/${id}`);
      message.success('Özellik başarıyla silindi.');
      fetchFeatures();
    } catch (error) {
      message.error('Silme işlemi başarısız oldu.');
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'İkon',
      dataIndex: 'icon',
      key: 'icon',
      width: 120,
      render: (icon) => (
        <span style={{ fontSize: '20px', color: '#2b4c7e' }}>
          <i className={icon}></i>
        </span>
      ),
    },
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
      fontWeight: 600,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
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
            title="Bu özelliği silmek istediğinize emin misiniz?"
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
    <Card 
      title="Özellikler (Features) Yönetimi" 
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Yeni Özellik Ekle
        </Button>
      }
      style={{ margin: '20px' }}
    >
      <Table 
        columns={columns} 
        dataSource={features} 
        rowKey="id" 
        loading={loading}
        pagination={false} 
      />

      <Modal
        title={editingId ? "Özelliği Düzenle" : "Yeni Özellik Ekle"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Kaydet"
        cancelText="İptal"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="icon"
            label="İkon Sınıfı (Awesome Font)"
            rules={[{ required: true, message: 'Lütfen bir ikon sınıfı girin!' }]}
            tooltip="Örn: fas fa-shipping-fast, fas fa-undo, fas fa-shield-halved"
          >
            <Input placeholder="fas fa-shipping-fast" />
          </Form.Item>

          <Form.Item
            name="title"
            label="Başlık"
            rules={[{ required: true, message: 'Lütfen bir başlık girin!' }]}
          >
            <Input placeholder="Shipping Worldwide" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true, message: 'Lütfen bir açıklama girin!' }]}
          >
            <Input.TextArea rows={3} placeholder="Special financing and earn rewards" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default FeaturesManager;