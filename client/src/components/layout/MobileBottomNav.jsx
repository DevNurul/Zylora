import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../../context/AuthContext'
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react'
import { selectCartCount } from '../../store/slices/cartSlice'
import { selectWishlistCount } from '../../store/slices/wishlistSlice'

const MobileBottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const cartCount = useSelector(selectCartCount)
  const wishlistCount = useSelector(selectWishlistCount)

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: Grid,
      path: '/products',
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      path: '/likes',
      badge: wishlistCount > 0 ? wishlistCount : null,
      tinted: wishlistCount > 0,
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingBag,
      path: '/cart',
      badge: cartCount > 0 ? cartCount : null,
    },
    {
      id: 'profile',
      label: isAuthenticated ? 'Profile' : 'Login',
      icon: User,
      path: isAuthenticated ? '/profile' : '/auth',
    },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const hiddenRoutes = ['/checkout', '/order-success']
  const isHidden = hiddenRoutes.some(route =>
    location.pathname.startsWith(route)
  )

  if (isHidden) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[998] flex items-center md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      }}>

      {tabs.map(tab => {
        const Icon = tab.icon
        const active = isActive(tab.path)
        const tinted = tab.tinted

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className="flex-1 flex flex-col items-center justify-center h-full gap-1 relative transition-all duration-150 active:scale-95"
            aria-label={tab.label}>

            <div className="relative">
              {tab.badge && (
                <span className="absolute -top-1.5 -right-2 bg-black text-white text-[9px] font-medium min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 leading-none">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}

              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.5}
                fill={tinted ? '#BE185D' : 'none'}
                className={`transition-colors duration-150 ${
                  tinted
                    ? 'text-[#c2436b]'
                    : active
                    ? 'text-black'
                    : 'text-gray-400'
                }`}
              />
            </div>

            <span
              className={`text-[10px] tracking-wide transition-colors duration-150 leading-none ${
                tinted
                  ? 'text-[#BE185D] font-medium'
                  : active
                  ? 'text-black font-medium'
                  : 'text-gray-400 font-normal'
              }`}>
              {tab.label}
            </span>

            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-black rounded-full" />
            )}
          </button>
        )
      })}
    </nav>
  )
}

export default MobileBottomNav
