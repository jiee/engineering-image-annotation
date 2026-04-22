import React, { useEffect, useState } from 'react';
import { Table, Card, Row, Col, Button, Modal, Form, Input, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ProjectOutlined, PictureOutlined, AimOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../../utils/api';
import { Project } from '../../types';
import { formatDateTime } from '../../utils/helpers';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await projectApi.getProjects();
      setProjects(response.data || []);
    } catch {
      message.error('加载项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (values: { name: string; description: string }) => {
    try {
      await projectApi.createProject(values);
      message.success('项目创建成功');
      setModalVisible(false);
      form.resetFields();
      loadProjects();
    } catch {
      message.error('创建失败');
    }
  };

  const handleUpdate = async (values: { name: string; description: string }) => {
    if (!editingProject) return;
    try {
      await projectApi.updateProject(editingProject.id, values);
      message.success('项目更新成功');
      setModalVisible(false);
      setEditingProject(null);
      form.resetFields();
      loadProjects();
    } catch {
      message.error('更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await projectApi.deleteProject(id);
      message.success('项目删除成功');
      loadProjects();
    } catch {
      message.error('删除失败');
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({ name: project.name, description: project.description });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProject(null);
    form.resetFields();
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <a onClick={() => navigate(`/projects/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '影像数量',
      dataIndex: 'image_count',
      key: 'image_count',
      width: 120,
      render: (count: number) => count || 0,
    },
    {
      title: '标注数量',
      dataIndex: 'annotation_count',
      key: 'annotation_count',
      width: 120,
      render: (count: number) => count || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text: string) => formatDateTime(text),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Project) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个项目吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalImages = projects.reduce((sum, p) => sum + (p.image_count || 0), 0);
  const totalAnnotations = projects.reduce((sum, p) => sum + (p.annotation_count || 0), 0);

  return (
    <div style={{ marginLeft: 220 }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0 }}>项目列表</h1>
            <p style={{ color: '#666', margin: '8px 0 0' }}>管理所有工程项目影像标注项目</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            新建项目
          </Button>
        </div>
      </div>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Card.Meta
              avatar={<ProjectOutlined style={{ fontSize: '32px', color: '#1890ff' }} />}
              title="项目总数"
              description={<div style={{ fontSize: '24px', fontWeight: 'bold' }}>{projects.length}</div>}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Card.Meta
              avatar={<PictureOutlined style={{ fontSize: '32px', color: '#52c41a' }} />}
              title="影像总数"
              description={<div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalImages}</div>}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Card.Meta
              avatar={<AimOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />}
              title="标注总数"
              description={<div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalAnnotations}</div>}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table columns={columns} dataSource={projects} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title={editingProject ? '编辑项目' : '新建项目'} open={modalVisible} onCancel={closeModal} footer={null}>
        <Form form={form} layout="vertical" onFinish={editingProject ? handleUpdate : handleCreate}>
          <Form.Item label="项目名称" name="name" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item label="项目描述" name="description">
            <Input.TextArea rows={4} placeholder="请输入项目描述（可选）" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={closeModal}>取消</Button>
              <Button type="primary" htmlType="submit">{editingProject ? '保存' : '创建'}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectList;
