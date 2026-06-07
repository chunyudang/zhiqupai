import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Tag, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getLevels, createLevel, updateLevel, deleteLevel } from '@/api/levels'
import { getCategories } from '@/api/categories'
import type { Level, CreateLevelParams, UpdateLevelParams, Category } from '@/types'

export default function Levels() {
  const [levels, setLevels] = useState<Level[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>()
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const fetchData = () => {
    setLoading(true)
    Promise.all([getLevels(filterCategoryId), getCategories()])
      .then(([levelsData, categoriesData]) => {
        setLevels(levelsData)
        setCategories(categoriesData)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [filterCategoryId])

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name ?? '-'
  }

  const openCreateModal = () => {
    setEditingLevel(null)
    setModalVisible(true)
    setTimeout(() => {
      form.resetFields()
      form.setFieldsValue({ passScore: 4, difficulty: 'medium' })
    })
  }

  const openEditModal = (record: Level) => {
    setEditingLevel(record)
    setModalVisible(true)
    setTimeout(() => {
      form.setFieldsValue(record)
    })
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      if (editingLevel) {
        await updateLevel(editingLevel.id, values as UpdateLevelParams)
        message.success('更新成功')
      } else {
        await createLevel(values as CreateLevelParams)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchData()
    } catch {
      // handled
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    await deleteLevel(id)
    message.success('删除成功')
    fetchData()
  }

  const difficultyColor: Record<string, string> = { easy: 'green', medium: 'orange', hard: 'red' }
  const difficultyLabel: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '所属学科',
      dataIndex: 'categoryId',
      width: 100,
      render: (id: number) => getCategoryName(id),
    },
    { title: '关卡号', dataIndex: 'levelNo', width: 70 },
    { title: '名称', dataIndex: 'name', width: 120 },
    {
      title: '难度',
      dataIndex: 'difficulty',
      width: 80,
      render: (d: string) => <Tag color={difficultyColor[d]}>{difficultyLabel[d]}</Tag>,
    },
    { title: '通关分', dataIndex: 'passScore', width: 70 },
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
      render: (_: unknown, record: Level) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该关卡？" onConfirm={() => handleDelete(record.id)}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0 }}>关卡管理</h2>
          <Select
            placeholder="筛选学科"
            allowClear
            style={{ width: 150 }}
            value={filterCategoryId}
            onChange={(val) => setFilterCategoryId(val)}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          新增关卡
        </Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={levels} loading={loading} />

      <Modal
        title={editingLevel ? '编辑关卡' : '新增关卡'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="categoryId" label="所属学科" rules={[{ required: true, message: '请选择学科' }]}>
            <Select
              placeholder="请选择学科"
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>
          <Form.Item
            name="levelNo"
            label="关卡号"
            rules={[
              { required: true, message: '请输入关卡号' },
              { type: 'number', min: 1, max: 5, message: '关卡号范围 1-5' },
            ]}
          >
            <InputNumber min={1} max={5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入关卡名称' }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="difficulty" label="难度">
            <Select
              options={[
                { label: '简单', value: 'easy' },
                { label: '中等', value: 'medium' },
                { label: '困难', value: 'hard' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="passScore"
            label="通关分"
            rules={[{ type: 'number', min: 1, max: 6, message: '通关分范围 1-6' }]}
          >
            <InputNumber min={1} max={6} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
