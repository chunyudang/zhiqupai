import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Spin } from 'antd'
import {
  UserOutlined,
  UserAddOutlined,
  FileTextOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { getDashboard } from '@/api/dashboard'
import type { DashboardStats } from '@/types'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  const cards = [
    { title: '总用户数', value: stats?.totalUsers ?? 0, icon: <UserOutlined />, color: '#1677ff' },
    { title: '今日新增', value: stats?.newUsersToday ?? 0, icon: <UserAddOutlined />, color: '#52c41a' },
    { title: '总答题次数', value: stats?.totalQuizSessions ?? 0, icon: <FileTextOutlined />, color: '#faad14' },
    { title: '平均通关率', value: `${stats?.averagePassRate ?? 0}%`, icon: <TrophyOutlined />, color: '#eb2f96' },
    { title: '总签到次数', value: stats?.totalCheckIns ?? 0, icon: <CheckCircleOutlined />, color: '#722ed1' },
    { title: '今日签到', value: stats?.newCheckInsToday ?? 0, icon: <CalendarOutlined />, color: '#13c2c2' },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>运营数据看板</h2>
      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col xs={24} sm={12} lg={8} key={card.title}>
            <Card>
              <Statistic
                title={card.title}
                value={card.value}
                prefix={<span style={{ color: card.color }}>{card.icon}</span>}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
