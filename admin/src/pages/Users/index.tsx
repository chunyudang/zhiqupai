import { useEffect, useState, useCallback } from 'react'
import { Table, Input, Tag, Popconfirm, Button, message, Avatar } from 'antd'
import { getUsers, updateUserStatus } from '@/api/users'
import type { User } from '@/types'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [keyword, setKeyword] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getUsers(pagination.page, pagination.pageSize, keyword || undefined)
      setUsers(data.list)
      setPagination((prev) => ({ ...prev, total: data.pagination.total }))
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, keyword])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStatusChange = async (id: number, newStatus: 'active' | 'banned') => {
    await updateUserStatus(id, { status: newStatus })
    message.success(newStatus === 'active' ? '已解封' : '已封禁')
    fetchData()
  }

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, page, pageSize }))
  }

  const handleSearch = (value: string) => {
    setKeyword(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const statusMap: Record<string, { color: string; label: string }> = {
    active: { color: 'green', label: '正常' },
    banned: { color: 'red', label: '封禁' },
    deleted: { color: 'default', label: '已注销' },
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    {
      title: '头像',
      dataIndex: 'avatar',
      width: 60,
      render: (avatar: string) => <Avatar src={avatar} size={32} />,
    },
    { title: '昵称', dataIndex: 'nickname', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.label || status}</Tag>
      ),
    },
    { title: '积分余额', dataIndex: 'pointsBalance', width: 100 },
    { title: '注册时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作',
      width: 120,
      render: (_: unknown, record: User) => {
        if (record.status === 'deleted') return null
        if (record.status === 'active') {
          return (
            <Popconfirm
              title="确定封禁该用户？"
              onConfirm={() => handleStatusChange(record.id, 'banned')}
            >
              <Button type="link" size="small" danger>
                封禁
              </Button>
            </Popconfirm>
          )
        }
        if (record.status === 'banned') {
          return (
            <Popconfirm
              title="确定解封该用户？"
              onConfirm={() => handleStatusChange(record.id, 'active')}
            >
              <Button type="link" size="small">
                解封
              </Button>
            </Popconfirm>
          )
        }
        return null
      },
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0 }}>用户管理</h2>
          <Input.Search
            placeholder="搜索手机号后4位或昵称"
            allowClear
            style={{ width: 250 }}
            onSearch={handleSearch}
          />
        </div>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
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
    </div>
  )
}
