import { useEffect, useState, useCallback } from 'react'
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Space, Tag,
  Popconfirm, message, Row, Col, Card, Statistic, List, Typography,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined,
  ShoppingOutlined, CheckCircleOutlined, SwapOutlined, FireOutlined,
  WarningOutlined, TrophyOutlined, ClockCircleOutlined,
} from '@ant-design/icons'
import {
  getShopGoods, createGoods, updateGoods, deleteGoods, importGoodsCodes,
  getShopDashboard,
} from '@/api/shop'
import type { ShopGood, CreateGoodsParams, UpdateGoodsParams, GoodsCategory, GoodsStatus, ShopDashboardStats } from '@/types'

const { TextArea } = Input
const { Text } = Typography

const CATEGORY_MAP: Record<GoodsCategory, { label: string; color: string }> = {
  code: { label: '兑换码', color: 'blue' },
  coupon: { label: '优惠券', color: 'orange' },
  virtual: { label: '虚拟道具', color: 'purple' },
}

const STOCK_STATUS_MAP: Record<string, { label: string; color: string }> = {
  sufficient: { label: '充足', color: 'green' },
  tense: { label: '紧张', color: 'orange' },
  low: { label: '不足', color: 'red' },
  out: { label: '售罄', color: 'default' },
}

export default function ShopGoods() {
  const [goods, setGoods] = useState<ShopGood[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [keyword, setKeyword] = useState('')

  const [modalVisible, setModalVisible] = useState(false)
  const [editingGoods, setEditingGoods] = useState<ShopGood | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const [codesModalVisible, setCodesModalVisible] = useState(false)
  const [codesGoodsId, setCodesGoodsId] = useState<number | null>(null)
  const [codesText, setCodesText] = useState('')
  const [importing, setImporting] = useState(false)

  const [dashboard, setDashboard] = useState<ShopDashboardStats | null>(null)
  const [dashLoading, setDashLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getShopGoods({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: keyword || undefined,
      })
      setGoods(data.list)
      setPagination((prev) => ({ ...prev, total: data.pagination.total }))
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, keyword])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const fetchDashboard = useCallback(async () => {
    setDashLoading(true)
    try {
      const data = await getShopDashboard()
      setDashboard(data)
    } finally {
      setDashLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const openCreateModal = () => {
    setEditingGoods(null)
    setModalVisible(true)
    setTimeout(() => {
      form.resetFields()
      form.setFieldsValue({ exchangeLimit: 1, sortOrder: 0 })
    })
  }

  const openEditModal = (record: ShopGood) => {
    setEditingGoods(record)
    setModalVisible(true)
    setTimeout(() => {
      form.setFieldsValue({
        name: record.name,
        coverImage: record.coverImage,
        description: record.description,
        category: record.category,
        pointsPrice: record.pointsPrice,
        totalStock: record.totalStock,
        exchangeLimit: record.exchangeLimit,
        sortOrder: record.sortOrder,
        status: record.status,
      })
    })
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      if (editingGoods) {
        const params: UpdateGoodsParams = { ...values }
        await updateGoods(editingGoods.id, params)
        message.success('更新成功')
      } else {
        const params: CreateGoodsParams = { ...values }
        await createGoods(params)
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
    try {
      await deleteGoods(id)
      message.success('删除成功')
      fetchData()
    } catch {
      // API error already shown
    }
  }

  const handleQuickToggleStatus = async (record: ShopGood) => {
    const newStatus: GoodsStatus = record.status === 'active' ? 'inactive' : 'active'
    try {
      await updateGoods(record.id, { status: newStatus })
      message.success(newStatus === 'active' ? '已上架' : '已下架')
      fetchData()
    } catch {
      // handled
    }
  }

  const openCodesModal = (goodsId: number) => {
    setCodesGoodsId(goodsId)
    setCodesText('')
    setCodesModalVisible(true)
  }

  const handleImportCodes = async () => {
    if (!codesGoodsId) return
    const codes = codesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    if (codes.length === 0) {
      message.warning('请输入至少一个兑换码')
      return
    }
    setImporting(true)
    try {
      const result = await importGoodsCodes(codesGoodsId, { codes })
      message.success(`成功导入 ${result.importedCount} 个兑换码`)
      setCodesModalVisible(false)
      fetchData()
    } catch {
      // handled
    } finally {
      setImporting(false)
    }
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
    { title: '商品名称', dataIndex: 'name', width: 160, ellipsis: true },
    {
      title: '分类',
      dataIndex: 'category',
      width: 90,
      render: (cat: GoodsCategory) => {
        const info = CATEGORY_MAP[cat]
        return info ? <Tag color={info.color}>{info.label}</Tag> : cat
      },
    },
    {
      title: '积分价格',
      dataIndex: 'pointsPrice',
      width: 90,
      render: (v: number) => <span style={{ fontWeight: 600, color: '#fa8c16' }}>{v}</span>,
    },
    {
      title: '库存',
      width: 100,
      render: (_: unknown, r: ShopGood) => `${r.remainingStock} / ${r.totalStock}`,
    },
    {
      title: '库存状态',
      dataIndex: 'stockStatus',
      width: 80,
      render: (s: string) => {
        const info = STOCK_STATUS_MAP[s]
        return info ? <Tag color={info.color}>{info.label}</Tag> : s
      },
    },
    { title: '已兑换', dataIndex: 'exchangeCount', width: 70 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: GoodsStatus) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '上架' : '下架'}
        </Tag>
      ),
    },
    { title: '排序', dataIndex: 'sortOrder', width: 60 },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作',
      width: 260,
      fixed: 'right' as const,
      render: (_: unknown, record: ShopGood) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          {record.category === 'code' && (
            <Button type="link" size="small" icon={<UploadOutlined />} onClick={() => openCodesModal(record.id)}>
              导入码
            </Button>
          )}
          <Button type="link" size="small" onClick={() => handleQuickToggleStatus(record)}>
            {record.status === 'active' ? '下架' : '上架'}
          </Button>
          <Popconfirm title="确定删除该商品？有兑换记录的商品无法删除。" onConfirm={() => handleDelete(record.id)}>
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
      {/* 统计卡片区 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card loading={dashLoading}>
            <Statistic title="商品总数" value={dashboard?.totalGoods ?? 0} prefix={<ShoppingOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card loading={dashLoading}>
            <Statistic title="上架中" value={dashboard?.activeGoods ?? 0} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card loading={dashLoading}>
            <Statistic title="总兑换次数" value={dashboard?.totalOrders ?? 0} prefix={<SwapOutlined style={{ color: '#faad14' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card loading={dashLoading}>
            <Statistic title="积分消耗总量" value={dashboard?.totalPointsConsumed ?? 0} prefix={<FireOutlined style={{ color: '#f5222d' }} />} />
          </Card>
        </Col>
      </Row>

      {/* 库存预警 + 热门商品 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title={<span><WarningOutlined style={{ color: '#faad14' }} /> 库存预警</span>} loading={dashLoading}>
            {dashboard?.lowStockGoods?.length ? (
              <List
                size="small"
                dataSource={dashboard.lowStockGoods}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item.name}</Text>
                    <Tag color={STOCK_STATUS_MAP[item.stockStatus]?.color || 'default'}>
                      剩余 {item.remainingStock}
                    </Tag>
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">暂无预警商品</Text>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={<span><TrophyOutlined style={{ color: '#fa8c16' }} /> 热门商品 TOP5</span>} loading={dashLoading}>
            {dashboard?.topGoods?.length ? (
              <List
                size="small"
                dataSource={dashboard.topGoods}
                renderItem={(item, index) => (
                  <List.Item>
                    <Text strong style={{ width: 24 }}>#{index + 1}</Text>
                    <Text style={{ flex: 1 }}>{item.name}</Text>
                    <Text type="secondary">兑换 {item.exchangeCount} 次</Text>
                    <Text style={{ color: '#fa8c16' }}>{item.pointsPrice} 积分</Text>
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">暂无兑换数据</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* 最近兑换记录 */}
      <Card title={<span><ClockCircleOutlined /> 最近兑换</span>} loading={dashLoading} style={{ marginBottom: 24 }}>
        {dashboard?.recentOrders?.length ? (
          <List
            size="small"
            dataSource={dashboard.recentOrders}
            renderItem={(item) => (
              <List.Item>
                <Text>{item.user.nickname}</Text>
                <Text>兑换了「{item.goods.name}」</Text>
                <Text type="danger">-{item.pointsCost} 积分</Text>
                <Text type="secondary">{new Date(item.createdAt).toLocaleString()}</Text>
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">暂无兑换记录</Text>
        )}
      </Card>

      {/* 商品列表 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0 }}>商品管理</h2>
          <Input.Search
            placeholder="搜索商品名称"
            allowClear
            style={{ width: 280 }}
            onSearch={handleSearch}
          />
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          新增商品
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={goods}
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => handleTableChange(page, pageSize),
        }}
      />

      {/* 新增/编辑商品弹窗 */}
      <Modal
        title={editingGoods ? '编辑商品' : '新增商品'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="category" label="商品分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select
              options={[
                { label: '兑换码', value: 'code' },
                { label: '优惠券', value: 'coupon' },
                { label: '虚拟道具', value: 'virtual' },
              ]}
            />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="pointsPrice" label="积分价格" rules={[{ required: true, message: '请输入积分价格' }]} style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="totalStock" label="总库存" rules={[{ required: true, message: '请输入总库存' }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="exchangeLimit" label="单人限兑次数" style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="sortOrder" label="排序" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="coverImage" label="封面图 URL">
            <Input placeholder="如: /uploads/shop/xxx.png" />
          </Form.Item>
          <Form.Item name="description" label="商品描述">
            <TextArea rows={3} placeholder="商品详细描述" />
          </Form.Item>
          {editingGoods && (
            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { label: '上架', value: 'active' },
                  { label: '下架', value: 'inactive' },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* 导入兑换码弹窗 */}
      <Modal
        title="导入兑换码"
        open={codesModalVisible}
        onOk={handleImportCodes}
        onCancel={() => setCodesModalVisible(false)}
        confirmLoading={importing}
        okText="导入"
      >
        <p style={{ color: '#888', marginBottom: 8 }}>每行输入一个兑换码，重复的码将自动跳过</p>
        <TextArea
          rows={8}
          value={codesText}
          onChange={(e) => setCodesText(e.target.value)}
          placeholder={"VIP-XXXX-YYYY-0001\nVIP-XXXX-YYYY-0002\nVIP-XXXX-YYYY-0003"}
        />
      </Modal>
    </div>
  )
}
