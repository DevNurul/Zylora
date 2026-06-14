import { lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import PageSuspense from './components/PageSuspense'

const Login            = lazy(() => import('./pages/Login'))
const Dashboard        = lazy(() => import('./pages/Dashboard'))
const Orders           = lazy(() => import('./pages/Orders'))
const Products         = lazy(() => import('./pages/Products'))
const Categories       = lazy(() => import('./pages/Categories'))
const Banners          = lazy(() => import('./pages/Banners'))
const Coupons          = lazy(() => import('./pages/Coupons'))
const Settings         = lazy(() => import('./pages/Settings'))
const AdminReturns     = lazy(() => import('./pages/AdminReturns'))
const AdminReturnDetail = lazy(() => import('./pages/AdminReturnDetail'))
const AdminWalletPage  = lazy(() => import('./pages/AdminWalletPage'))

function ProtectedRoutes() {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="orders"            element={<Orders />} />
        <Route path="products"          element={<Products />} />
        <Route path="categories"        element={<Categories />} />
        <Route path="banners"           element={<Banners />} />
        <Route path="coupons"           element={<Coupons />} />
        <Route path="settings"          element={<Settings />} />
        <Route path="returns"           element={<AdminReturns />} />
        <Route path="returns/:returnId" element={<AdminReturnDetail />} />
        <Route path="wallet"            element={<AdminWalletPage />} />
      </Route>
    </Routes>
  )
}

function AppRoutes() {
  const { isLoggedIn } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <PageSuspense>
          <AppRoutes />
        </PageSuspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
