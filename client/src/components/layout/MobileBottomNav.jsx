import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../../context/AuthContext'
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react'
import { selectWishlistCount } from '../../store/slices/wishlistSlice'

const MobileBottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const wishlistCount = useSelector(selectWishlistCount)

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Grid,
      path: '/products',
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      path: '/likes',
      badge: wishlistCount > 0 ? wishlistCount : null,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      path: isAuthenticated ? '/my-orders' : '/auth',
    },
    {
      id: 'account',
      label: isAuthenticated ? 'Account' : 'Login',
      icon: User,
      path: isAuthenticated ? '/profile' : '/auth',
    },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    // Handle auth path checking as well
    if (path === '/auth') {
      return location.pathname.startsWith('/auth')
    }
    return location.pathname.startsWith(path)
  }

  const hiddenRoutes = ['/checkout', '/order-success', '/products/']
  const isHidden = hiddenRoutes.some(route =>
    location.pathname.startsWith(route)
  )

  if (isHidden) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[998] md:hidden px-4 pb-4 bg-gradient-to-t from-black via-black/20 to-transparent pt-10 pointer-events-none">
      <nav
        className="w-full max-w-md mx-auto bg-[#171717]/85 backdrop-blur-md border border-[#2A2A2A] flex items-center justify-around h-16 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto px-2 relative"
      >
        {tabs.map(tab => {
          const Icon = tab.icon
          const active = isActive(tab.path)

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex-1 flex flex-col items-center justify-center h-full gap-1 relative transition-all duration-150 active:scale-95 cursor-pointer"
              aria-label={tab.label}
            >
              <div className="relative">
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#EE6B83] text-white text-[8px] font-bold min-w-[15px] h-3.5 flex items-center justify-center rounded-full px-1 leading-none border border-[#171717]">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}

                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={`transition-colors duration-200 ${
                    active ? 'text-[#EE6B83]' : 'text-[#B3B3B3]'
                  }`}
                />
              </div>

              <span
                className={`text-[9px] uppercase tracking-wider transition-colors duration-200 font-semibold leading-none ${
                  active ? 'text-[#EE6B83]' : 'text-[#B3B3B3]'
                }`}
              >
                {tab.label}
              </span>

              {active && (
                <span className="absolute bottom-1 w-1 h-1 bg-[#EE6B83] rounded-full shadow-lg shadow-[#EE6B83]/55" />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default MobileBottomNav
