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
    <div className="fixed bottom-0 left-0 right-0 z-[998] md:hidden px-3 pb-3 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent pt-8 pointer-events-none">
      <nav
        className="w-full max-w-md mx-auto bg-[#141414]/90 backdrop-blur-xl border border-[#B8976A]/10 flex items-center justify-around h-16 rounded-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.5)] pointer-events-auto px-2 relative"
        style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,168,106,0.1)' }}
      >
        {tabs.map(tab => {
          const Icon = tab.icon
          const active = isActive(tab.path)

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex-1 flex flex-col items-center justify-center h-full gap-1.5 relative transition-all duration-300 active:scale-95 cursor-pointer"
              aria-label={tab.label}
            >
              <div className="relative">
                {tab.badge && (
                  <span className="absolute -top-2 -right-3 bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white text-[7px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 leading-none">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}

                <Icon
                  size={20}
                  strokeWidth={active ? 2.2 : 1.5}
                  className={`transition-colors duration-300 ${
                    active ? 'text-[#B8976A]' : 'text-[#5C5C5C]'
                  }`}
                />
              </div>

              <span
                className={`text-[9px] uppercase tracking-wider transition-colors duration-300 font-medium leading-none ${
                  active ? 'text-[#B8976A]' : 'text-[#5C5C5C]'
                }`}
              >
                {tab.label}
              </span>

              {active && (
                <span className="absolute top-0 w-8 h-[2px] bg-gradient-to-r from-[#B8976A] to-[#E8A0B0] rounded-full" />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default MobileBottomNav
