import { useEffect, useState, useCallback } from 'react'
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Space, Tag,
  Popconfirm, message, Radio,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '@/api/questions'
import { getLevels } from '@/api/levels'
import { getCategories } from '@/api/categories'
import type { Question, CreateQuestionParams, UpdateQuestionParams, Level, Category } from '@/types'

const { TextArea } = Input

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [filterLevelId, setFilterLevelId] = useState<number | undefined>()
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const fetchLevels = useCallback(async () => {
    const [levelsData, categoriesData] = await Promise.all([getLevels(), getCategories()])
    setLevels(levelsData)
    setCategories(categoriesData)
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getQuestions({
        page: pagination.page,
        pageSize: pagination.pageSize,
        levelId: filterLevelId,
        keyword: keyword || undefined,
      })
      setQuestions(data.list)
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }))
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, filterLevelId, keyword])

  useEffect(() => {
    fetchLevels()
  }, [fetchLevels])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getLevelName = (levelId: number) => {
    const level = levels.find((l) => l.id === levelId)
    if (!level) return '-'
    const cat = categories.find((c) => c.id === level.categoryId)
    return cat ? `${cat.name} - 第${level.levelNo}关` : `第${level.levelNo}关`
  }

  const openCreateModal = () => {
    setEditingQuestion(null)
    form.resetFields()
    form.setFieldsValue({ sortOrder: 0 })
    setModalVisible(true)
  }

  const openEditModal = (record: Question) => {
    setEditingQuestion(record)
    // 解析 options JSON 字符串为数组
    let optionsArr: string[] = ['', '', '', '']
    try {
      const parsed = JSON.parse(record.options)
      if (Array.isArray(parsed)) {
        optionsArr = parsed.slice(0, 4)
      }
    } catch { /* ignore */ }
    form.setFieldsValue({
      levelId: record.levelId,
      content: record.content,
      optionA: optionsArr[0] || '',
      optionB: optionsArr[1] || '',
      optionC: optionsArr[2] || '',
      optionD: optionsArr[3] || '',
      correctAnswer: record.correctAnswer,
      explanation: record.explanation,
      sortOrder: record.sortOrder,
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const optionsArr = [values.optionA, values.optionB, values.optionC, values.optionD]
      const options = JSON.stringify(optionsArr)

      setSubmitting(true)
      if (editingQuestion) {
        const params: UpdateQuestionParams = {
          content: values.content,
          options,
          correctAnswer: values.correctAnswer,
          explanation: values.explanation,
          sortOrder: values.sortOrder,
        }
        await updateQuestion(editingQuestion.id, params)
        message.success('更新成功')
      } else {
        const params: CreateQuestionParams = {
          levelId: values.levelId,
          content: values.content,
          options,
          correctAnswer: values.correctAnswer,
          explanation: values.explanation,
          sortOrder: values.sortOrder,
        }
        await createQuestion(params)
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
    await deleteQuestion(id)
    message.success('删除成功')
    fetchData()
  }

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, page, pageSize }))
  }

  const handleSearch = (value: string) => {
    setKeyword(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '所属关卡',
      dataIndex: 'levelId',
      width: 150,
      render: (id: number) => <span style={{ fontSize: 12 }}>{getLevelName(id)}</span>,
    },
    {
      title: '题目内容',
      dataIndex: 'content',
      ellipsis: true,
    },
    { title: '答案', dataIndex: 'correctAnswer', width: 60 },
    { title: '排序', dataIndex: 'sortOrder', width: 60 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 70,
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
      render: (_: unknown, record: Question) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该题目？" onConfirm={() => handleDelete(record.id)}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0 }}>题目管理</h2>
          <Select
            placeholder="筛选关卡"
            allowClear
            style={{ width: 200 }}
            value={filterLevelId}
            onChange={(val) => {
              setFilterLevelId(val)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            options={levels.map((l) => {
              const catName = categories.find((c) => c.id === l.categoryId)?.name ?? ''
              return {
                label: `${catName} - 第${l.levelNo}关`,
                value: l.id,
              }
            })}
          />
          <Input.Search
            placeholder="搜索题目内容"
            allowClear
            style={{ width: 250 }}
            onSearch={handleSearch}
          />
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          新增题目
        </Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={questions}
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => handleTableChange(page, pageSize),
        }}
      />

      <Modal
        title={editingQuestion ? '编辑题目' : '新增题目'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="levelId" label="所属关卡" rules={[{ required: true, message: '请选择关卡' }]}>
            <Select
              placeholder="请选择关卡"
              options={levels.map((l) => {
                const catName = categories.find((c) => c.id === l.categoryId)?.name ?? ''
                return {
                  label: `${catName} - 第${l.levelNo}关`,
                  value: l.id,
                }
              })}
            />
          </Form.Item>
          <Form.Item name="content" label="题目内容" rules={[{ required: true, message: '请输入题目内容' }]}>
            <TextArea rows={3} maxLength={500} showCount />
          </Form.Item>

          <div style={{ marginBottom: 8, fontWeight: 500 }}>选项</div>
          {OPTION_LABELS.map((label) => (
            <Form.Item
              key={label}
              name={`option${label}`}
              label={label}
              rules={[{ required: true, message: `请输入选项 ${label}` }]}
            >
              <Input placeholder={`选项 ${label}`} />
            </Form.Item>
          ))}

          <Form.Item name="correctAnswer" label="正确答案" rules={[{ required: true, message: '请选择正确答案' }]}>
            <Radio.Group>
              {OPTION_LABELS.map((label) => (
                <Radio key={label} value={label}>
                  {label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item name="explanation" label="解析">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
