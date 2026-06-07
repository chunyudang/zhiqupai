import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, theme, Dropdown } from 'antd'
import {
  DashboardOutlined,
  AppstoreOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/hooks/useAuth'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '运营看板',
  },
  {
    key: 'content',
    icon: <AppstoreOutlined />,
    label: '内容管理',
    children: [
      { key: '/categories', label: '学科管理' },
      { key: '/levels', label: '关卡管理' },
      { key: '/questions', label: '题目管理' },
    ],
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: '用户管理',
  },
  {
    key: 'shop',
    icon: <ShoppingOutlined />,
    label: '积分商城',
    children: [
      { key: '/shop/goods', label: '商品管理' },
      { key: '/shop/orders', label: '兑换记录' },
    ],
  },
  {
    key: '/messages',
    icon: <BellOutlined />,
    label: '消息推送',
  },
  {
    key: '/system',
    icon: <SettingOutlined />,
    label: '系统配置',
  },
]

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { admin, logout } = useAuth()
  const { token: themeToken } = theme.useToken()

  // 根据当前路径确定选中的菜单项
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const selectedKey = pathSegments.length >= 2 && pathSegments[0] === 'shop'
    ? `/${pathSegments[0]}/${pathSegments[1]}`
    : '/' + (pathSegments[0] || '')

  // 找到展开的 SubMenu
  const openKeys = menuItems
    .filter((item) => 'children' in item)
    .filter((item) => item.children!.some((child) => child.key === selectedKey))
    .map((item) => item.key)

  const handleMenuClick = (info: { key: string }) => {
    navigate(info.key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        style={{ background: themeToken.colorBgContainer }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
          }}
        >
          <h2
            style={{
              color: themeToken.colorPrimary,
              margin: 0,
              fontSize: collapsed ? 16 : 18,
              whiteSpace: 'nowrap',
            }}
          >
            {collapsed ? '识趣' : '识趣派管理'}
          </h2>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: themeToken.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: handleLogout,
                },
              ],
            }}
          >
            <Button type="text" icon={<UserOutlined />}>
              {admin?.username || '管理员'}
            </Button>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: themeToken.colorBgContainer,
            borderRadius: themeToken.borderRadiusLG,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
