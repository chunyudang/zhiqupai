import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Space, Tag, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/categories'
import type { Category, CreateCategoryParams, UpdateCategoryParams } from '@/types'

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const fetchData = () => {
    setLoading(true)
    getCategories()
      .then(setCategories)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openCreateModal = () => {
    setEditingCategory(null)
    setModalVisible(true)
    setTimeout(() => {
      form.resetFields()
      form.setFieldsValue({ sortOrder: 0 })
    })
  }

  const openEditModal = (record: Category) => {
    setEditingCategory(record)
    setModalVisible(true)
    setTimeout(() => {
      form.setFieldsValue(record)
    })
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      if (editingCategory) {
        await updateCategory(editingCategory.id, values as UpdateCategoryParams)
        message.success('更新成功')
      } else {
        await createCategory(values as CreateCategoryParams)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchData()
    } catch {
      // 表单验证失败或 API 错误已处理
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    await deleteCategory(id)
    message.success('删除成功')
    fetchData()
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', width: 100 },
    { title: '英文名', dataIndex: 'nameEn', width: 100 },
    { title: '图标', dataIndex: 'icon', width: 60 },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '排序', dataIndex: 'sortOrder', width: 70 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作',
      width: 150,
      render: (_: unknown, record: Category) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该学科？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>学科管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          新增学科
        </Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={categories} loading={loading} />

      <Modal
        title={editingCategory ? '编辑学科' : '新增学科'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入学科名称' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item name="nameEn" label="英文名">
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Input maxLength={10} placeholder="如: 🔬" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
