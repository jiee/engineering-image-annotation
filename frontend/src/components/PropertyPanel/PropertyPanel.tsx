import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Divider, Upload, List, message } from 'antd';
import { 
  DeleteOutlined, 
  PaperClipOutlined, 
  UploadOutlined, 
  InboxOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { useStore } from '../../store';
import { annotationApi, attachmentApi } from '../../utils/api';
import { formatFileSize, formatDateTime } from '../../utils/helpers';
import { Attachment } from '../../types';

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const PropertyPanel: React.FC = () => {
  const { selectedAnnotation, setSelectedAnnotation, updateAnnotation, deleteAnnotation, annotations, setAnnotations } = useStore();
  const [form] = Form.useForm();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载选中标注的附件
  useEffect(() => {
    if (selectedAnnotation) {
      loadAttachments(selectedAnnotation.id);
      form.setFieldsValue({
        name: selectedAnnotation.properties?.name || '',
        description: selectedAnnotation.properties?.description || '',
        status: selectedAnnotation.properties?.status || '待处理',
      });
    } else {
      setAttachments([]);
      form.resetFields();
    }
  }, [selectedAnnotation]);

  const loadAttachments = async (annotationId: string) => {
    try {
      const response = await attachmentApi.getAttachments(annotationId);
      setAttachments(response.data);
    } catch (error) {
      console.error('加载附件失败:', error);
    }
  };

  // 更新标注属性
  const handleUpdateProperties = async (values: any) => {
    if (!selectedAnnotation) return;

    try {
      const response = await annotationApi.updateAnnotation(selectedAnnotation.id, {
        properties: values,
      });
      updateAnnotation(selectedAnnotation.id, { properties: values });
      message.success('属性已更新');
    } catch (error) {
      message.error('更新失败');
    }
  };

  // 删除标注
  const handleDelete = async () => {
    if (!selectedAnnotation) return;

    try {
      await annotationApi.deleteAnnotation(selectedAnnotation.id);
      deleteAnnotation(selectedAnnotation.id);
      message.success('标注已删除');
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 上传附件
  const handleUploadAttachment = async (file: File) => {
    if (!selectedAnnotation) {
      message.warning('请先选择标注');
      return false;
    }

    setLoading(true);
    try {
      const response = await attachmentApi.uploadAttachment(selectedAnnotation.id, file);
      setAttachments([...attachments, response.data]);
      message.success('附件上传成功');
    } catch (error) {
      message.error('上传失败');
    } finally {
      setLoading(false);
    }
    return false; // 阻止默认上传
  };

  // 删除附件
  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await attachmentApi.deleteAttachment(attachmentId);
      setAttachments(attachments.filter((a) => a.id !== attachmentId));
      message.success('附件已删除');
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 获取文件图标
  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return <FileImageOutlined style={{ color: '#1890ff' }} />;
    if (mimeType?.includes('pdf')) return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
    return <FileOutlined style={{ color: '#52c41a' }} />;
  };

  // 标注类型显示
  const typeLabels: Record<string, string> = {
    point: '点标注',
    rectangle: '矩形标注',
    polygon: '多边形标注',
  };

  if (!selectedAnnotation) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          <PaperClipOutlined />
        </div>
        <div>选择标注以查看属性</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 标注信息 */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
          标注详情
        </div>
        <div style={{ fontSize: '12px', color: '#999' }}>
          <span style={{ marginRight: '16px' }}>
            类型: {typeLabels[selectedAnnotation.type]}
          </span>
          <span>
            ID: {selectedAnnotation.id}
          </span>
        </div>
      </div>

      {/* 属性表单 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleUpdateProperties}
        >
          <Form.Item label="名称" name="name">
            <Input placeholder="请输入标注名称" />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <TextArea rows={3} placeholder="请输入标注描述" />
          </Form.Item>

          <Form.Item label="状态" name="status">
            <Select>
              <Option value="待处理">待处理</Option>
              <Option value="进行中">进行中</Option>
              <Option value="已完成">已完成</Option>
              <Option value="异常">异常</Option>
            </Select>
          </Form.Item>

          <Divider>附件管理</Divider>

          <Dragger
            showUploadList={false}
            beforeUpload={handleUploadAttachment}
            accept="*"
            disabled={loading}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽上传附件</p>
            <p className="ant-upload-hint">支持任意格式文件</p>
          </Dragger>

          {attachments.length > 0 && (
            <List
              size="small"
              style={{ marginTop: '16px' }}
              dataSource={attachments}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteAttachment(item.id)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={getFileIcon(item.mime_type)}
                    title={item.original_name}
                    description={formatFileSize(item.file_size || 0)}
                  />
                </List.Item>
              )}
            />
          )}
        </Form>
      </div>

      {/* 操作按钮 */}
      <div style={{ padding: '16px', borderTop: '1px solid #e8e8e8' }}>
        <Button
          danger
          block
          icon={<DeleteOutlined />}
          onClick={handleDelete}
        >
          删除标注
        </Button>
      </div>
    </div>
  );
};

export default PropertyPanel;
