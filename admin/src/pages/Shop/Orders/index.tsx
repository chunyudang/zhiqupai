import { useEffect, useState, useCallback } from 'react'
import { Table, InputNumber, Tag } from 'antd'
import { getShopOrders } from '@/api/shop'
import type { ShopOrder } from '@/types'

export default function ShopOrders() {
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [filterUserId, setFilterUserId] = useState<number | undefined>()
  const [filterGoodsId, setFilterGoodsId] = useState<number | undefined>()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getShopOrders({
        page: pagination.page,
        pageSize: pagination.pageSize,
        userId: filterUserId,
        goodsId: filterGoodsId,
      })
      setOrders(data.list)
      setPagination((prev) => ({ ...prev, total: data.pagination.total }))
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, filterUserId, filterGoodsId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, page, pageSize }))
  }

  const handleFilterChange = (type: 'userId' | 'goodsId', value: number | null) => {
    if (type === 'userId') {
      setFilterUserId(value ?? undefined)
    } else {
      setFilterGoodsId(value ?? undefined)
    }
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '用户',
      width: 120,
      render: (_: unknown, r: ShopOrder) => r.user?.nickname || '-',
    },
    {
      title: '商品',
      width: 150,
      ellipsis: true,
      render: (_: unknown, r: ShopOrder) => r.goods?.name || '-',
    },
    {
      title: '消耗积分',
      dataIndex: 'pointsCost',
      width: 90,
      render: (v: number) => <span style={{ color: '#f5222d' }}>-{v}</span>,
    },
    { title: '兑换后余额', dataIndex: 'balanceAfter', width: 100 },
    {
      title: '兑换码',
      dataIndex: 'code',
      width: 200,
      ellipsis: true,
      render: (v: string) => v ? <code style={{ fontSize: 12 }}>{v}</code> : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (s: string) => (
        <Tag color={s === 'success' ? 'green' : 'default'}>
          {s === 'success' ? '成功' : '已退回'}
        </Tag>
      ),
    },
    { title: '兑换时间', dataIndex: 'createdAt', width: 170 },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0 }}>兑换记录</h2>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <InputNumber
          placeholder="按用户 ID 筛选"
          style={{ width: 180 }}
          value={filterUserId}
          onChange={(v) => handleFilterChange('userId', v)}
          min={1}
        />
        <InputNumber
          placeholder="按商品 ID 筛选"
          style={{ width: 180 }}
          value={filterGoodsId}
          onChange={(v) => handleFilterChange('goodsId', v)}
          min={1}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => handleTableChange(page, pageSize),
        }}
      />
    </div>
  )
}
