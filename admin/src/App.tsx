import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { AuthProvider } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/ProtectedRoute'
import AppLayout from '@/components/AppLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Categories from '@/pages/Categories'
import Levels from '@/pages/Levels'
import Questions from '@/pages/Questions'
import Users from '@/pages/Users'
import Messages from '@/pages/Messages'
import System from '@/pages/System'
import ShopGoods from '@/pages/Shop/Goods'
import ShopOrders from '@/pages/Shop/Orders'

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
        },
      }}
    >
      <AntdApp>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/levels" element={<Levels />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/users" element={<Users />} />
                <Route path="/shop/goods" element={<ShopGoods />} />
                <Route path="/shop/orders" element={<ShopOrders />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/system" element={<System />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
