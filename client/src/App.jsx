import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './store'
import { fetchWishlist, selectWishlistSynced } from './store/slices/wishlistSlice'
import { AuthProvider, useAuth } from './context/AuthContext'

import Navbar      from './components/layout/Navbar'
import Footer      from './components/layout/Footer'
import ScrollToTop from './components/ui/ScrollToTop'
import AppLoader   from './components/ui/AppLoader'
import RouteProgressBar from './components/ui/RouteProgressBar'
import WhatsAppButton from './components/ui/WhatsAppButton'
import MobileBottomNav from './components/layout/MobileBottomNav'
import ProtectedRoute from './components/auth/ProtectedRoute'

import Home          from './pages/Home'
import Products      from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart          from './pages/Cart'
import Likes         from './pages/Likes'
import Checkout      from './pages/Checkout'
import OrderSuccess  from './pages/OrderSuccess'
import TrackOrder    from './pages/TrackOrder'
import PaymentCallback from './pages/PaymentCallback'
import NotFound      from './pages/NotFound'
import ProfilePage      from './pages/ProfilePage'
import MyOrdersPage    from './pages/MyOrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import MyReturnsPage            from './pages/MyReturnsPage'
import WalletPage               from './pages/WalletPage'
import ReturnPaymentCallback    from './pages/ReturnPaymentCallback'
import AuthPage                 from './pages/AuthPage'
import FAQsPage                 from './pages/FAQsPage'
import ShippingPolicyPage       from './pages/ShippingPolicyPage'
import ReturnsPolicyPage        from './pages/ReturnsPolicyPage'
import ContactPage              from './pages/ContactPage'
import PrivacyPolicyPage        from './pages/PrivacyPolicyPage'

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
    </div>
  )
}

function AppInner() {
  const dispatch                    = useDispatch()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const wishlistSynced              = useSelector(selectWishlistSynced)

  const [appLoading, setAppLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && isAuthenticated && !wishlistSynced) {
      dispatch(fetchWishlist())
    }
  }, [authLoading, isAuthenticated, wishlistSynced, dispatch])

  const handleLoaderComplete = () => {
    setAppLoading(false)
  }

  return (
    <>
      {appLoading && (
        <AppLoader onComplete={handleLoaderComplete} />
      )}

      <RouteProgressBar />

      <div className={`overflow-x-hidden ${appLoading ? 'invisible' : 'visible'}`}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2500,
            style: {
              fontFamily:   'Inter',
              fontSize:     '13px',
              borderRadius: '0',
              border:       '1px solid #e5e7eb',
            },
          }}
        />
        <ScrollToTop />
        <Routes>
          {/* ── Public routes ──────────────────────────────────────────────── */}
          <Route path="/"             element={<Layout><Home /></Layout>} />
          <Route path="/products"     element={<Layout><Products /></Layout>} />
          <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/track"        element={<Layout><TrackOrder /></Layout>} />
          <Route path="/track-order"  element={<Layout><TrackOrder /></Layout>} />
          <Route path="/likes"        element={<Layout><Likes /></Layout>} />
          <Route path="/payment-callback"        element={<Layout><PaymentCallback /></Layout>} />
          <Route path="/return-payment-callback" element={<Layout><ReturnPaymentCallback /></Layout>} />

          {/* ── Static info pages ──────────────────────────────────────────── */}
          <Route path="/faqs"            element={<Layout><FAQsPage /></Layout>} />
          <Route path="/shipping-policy" element={<Layout><ShippingPolicyPage /></Layout>} />
          <Route path="/returns-policy"  element={<Layout><ReturnsPolicyPage /></Layout>} />
          <Route path="/contact"         element={<Layout><ContactPage /></Layout>} />
          <Route path="/privacy-policy"  element={<Layout><PrivacyPolicyPage /></Layout>} />

          {/* ── Auth page ──────────────────────────────────────────────────── */}
          <Route path="/auth"     element={<AuthPage />} />
          <Route path="/login"    element={<Navigate to="/auth" replace />} />
          <Route path="/register" element={<Navigate to="/auth" replace />} />

          {/* ── Protected routes ───────────────────────────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart"          element={<Layout><Cart /></Layout>} />
            <Route path="/checkout"      element={<Layout><Checkout /></Layout>} />
            <Route path="/order-success" element={<Layout><OrderSuccess /></Layout>} />
            <Route path="/profile"            element={<Layout><ProfilePage /></Layout>} />
            <Route path="/my-orders"          element={<Layout><MyOrdersPage /></Layout>} />
            <Route path="/my-orders/:orderId" element={<Layout><OrderDetailPage /></Layout>} />
            <Route path="/my-returns"         element={<Layout><MyReturnsPage /></Layout>} />
            <Route path="/wallet"             element={<Layout><WalletPage /></Layout>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <MobileBottomNav />
        <WhatsAppButton />
      </div>
    </>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  )
}
