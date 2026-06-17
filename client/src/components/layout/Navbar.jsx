import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Heart, ShoppingBag, Menu, X, ChevronRight, User, Wallet } from 'lucide-react'
import SearchBar from '../search/SearchBar'
import { useDispatch, useSelector } from 'react-redux'
import { toggleCart, closeCart, toggleMobileMenu, closeMobileMenu } from '../../store/slices/uiSlice'
import { selectCartCount } from '../../store/slices/cartSlice'
import { selectWishlistCount } from '../../store/slices/wishlistSlice'
import { useAuth } from '../../context/AuthContext'
import { fetchWallet } from '../../store/slices/walletSlice'
import { useCart } from '../../hooks/useCart'
import CartItem from '../cart/CartItem'
import { formatPrice } from '../../utils/formatPrice'

const NAV_LINKS = [
  { label: 'New Arrivals', href: '/products?sort=newest' },
  { label: 'Best Sellers', href: '/products?sort=trending' },
  { label: 'Categories', href: '/products' },
  { label: 'Collections', href: '/products?collection=Premium' },
]

function CartDrawer() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cartOpen = useSelector((s) => s.ui.cartOpen)
  const { items, finalTotal } = useCart()

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen])

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/70 z-45 transition-opacity duration-500 ${
          cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => dispatch(closeCart())}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[min(400px,92vw)] bg-[#0A0A0A] z-50 flex flex-col
          transition-transform duration-500 ease-out border-l border-[#B8976A]/10
          ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ boxShadow: cartOpen ? '-20px 0 60px rgba(0,0,0,0.5)' : 'none' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-8 py-6 border-b border-[#242424]">
          <div>
            <h2 className="font-serif text-lg tracking-[0.15em] text-white">Shopping Bag</h2>
            {items.length > 0 && (
              <p className="text-xs text-[#9A9A9A] mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
            )}
          </div>
          <button
            onClick={() => dispatch(closeCart())}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 transition-colors rounded-full text-[#9A9A9A] hover:text-white"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <div className="w-20 h-20 border border-[#B8976A]/20 rounded-full flex items-center justify-center text-[#B8976A]/40">
                <ShoppingBag size={28} />
              </div>
              <div>
                <p className="font-serif text-xl text-white mb-2">Your bag is empty</p>
                <p className="text-sm text-[#9A9A9A]">Discover our luxury collection</p>
              </div>
              <button
                onClick={() => { dispatch(closeCart()); navigate('/products') }}
                className="bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white px-8 py-3 rounded-xl text-xs uppercase tracking-widest font-medium hover:shadow-lg hover:shadow-[#B8976A]/20 transition-all"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <CartItem key={`${item.id}-${item.size}-${item.color}`} item={item} compact />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#242424] px-5 md:px-8 py-6 bg-[#0A0A0A]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-[#9A9A9A] uppercase tracking-[0.12em]">Subtotal</span>
              <span className="text-xl font-serif text-white">{formatPrice(finalTotal)}</span>
            </div>
            <button
              onClick={() => { dispatch(closeCart()); navigate('/cart') }}
              className="w-full border border-[#B8976A]/30 text-[#B8976A] rounded-xl py-3.5 text-xs uppercase tracking-widest font-medium hover:bg-[#B8976A]/10 transition-all duration-300 mb-3 cursor-pointer"
            >
              View Bag
            </button>
            <button
              onClick={() => { dispatch(closeCart()); navigate('/checkout') }}
              className="w-full bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white rounded-xl py-3.5 text-xs uppercase tracking-widest font-medium hover:shadow-lg hover:shadow-[#B8976A]/20 transition-all duration-300 cursor-pointer"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function MobileMenu() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const mobileOpen = useSelector((s) => s.ui.mobileMenuOpen)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const go = (href) => {
    dispatch(closeMobileMenu())
    navigate(href)
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/70 z-45 transition-opacity duration-500 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => dispatch(closeMobileMenu())}
      />
      <div
        className={`fixed top-0 left-0 h-full w-[min(320px,88vw)] bg-[#0A0A0A] z-50 flex flex-col
          transition-transform duration-500 ease-out border-r border-[#B8976A]/10
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ boxShadow: mobileOpen ? '20px 0 60px rgba(0,0,0,0.5)' : 'none' }}
      >
        <div className="flex items-center justify-between px-5 md:px-8 py-6 border-b border-[#242424]">
          <div className="flex flex-col items-start select-none">
            <span className="font-serif text-[1.4rem] tracking-[0.22em] font-light leading-none text-white">ZYLARA</span>
            <span className="text-[7px] uppercase tracking-[0.35em] text-[#B8976A] mt-1.5 leading-none pl-[0.38em]">JEWELLERY</span>
          </div>
          <button
            onClick={() => dispatch(closeMobileMenu())}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 transition-colors rounded-full text-[#9A9A9A] hover:text-white"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 md:px-8 py-6">
          {NAV_LINKS.map((link, idx) => (
            <button
              key={link.label}
              onClick={() => go(link.href)}
              className="flex items-center justify-between w-full py-4 border-b border-[#242424]/50 text-left group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <span className="text-sm uppercase tracking-[0.1em] font-medium text-[#9A9A9A] group-hover:text-white transition-colors">
                {link.label}
              </span>
              <ChevronRight size={16} className="text-[#9A9A9A] group-hover:text-[#B8976A] transition-colors" />
            </button>
          ))}
        </nav>

        <MobileMenuFooter go={go} />
      </div>
    </>
  )
}

function MobileMenuFooter({ go }) {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  return (
    <div className="px-5 md:px-8 py-4 md:py-6 border-t border-[#242424] flex flex-col gap-3 bg-[#0A0A0A]">
      {!isAuthenticated && (
        <button
          onClick={() => go('/auth')}
          className="text-xs uppercase tracking-[0.12em] text-[#B8976A] font-semibold hover:text-[#E8A0B0] transition-colors text-left"
        >
          Sign In
        </button>
      )}
      {isAuthenticated && (
        <button
          onClick={() => go('/profile')}
          className="text-xs uppercase tracking-[0.12em] text-[#9A9A9A] hover:text-white transition-colors text-left font-medium"
        >
          My Profile
        </button>
      )}
      <button
        onClick={() => go('/likes')}
        className="text-xs uppercase tracking-[0.12em] text-[#9A9A9A] hover:text-white transition-colors text-left font-medium"
      >
        Wishlist
      </button>
      <button
        onClick={() => go('/track-order')}
        className="text-xs uppercase tracking-[0.12em] text-[#9A9A9A] hover:text-white transition-colors text-left font-medium"
      >
        Track Order
      </button>
      {isAuthenticated && (
        <button
          onClick={handleLogout}
          className="text-xs uppercase tracking-[0.12em] text-[#E8A0B0] hover:text-[#D48A9A] transition-colors text-left font-semibold"
        >
          Sign Out
        </button>
      )}
    </div>
  )
}

function AuthButton() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate   = useNavigate()
  const dispatch   = useDispatch()
  const walletBalance = useSelector(s => s.wallet?.balance || 0)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/auth')
  }

  if (isAuthenticated) {
    return (
      <div className="hidden md:flex items-center relative" ref={dropdownRef}>
        <button
          onClick={() => { setOpen((v) => { if (!v) dispatch(fetchWallet()); return !v }) }}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B8976A] to-[#A88345] text-white flex items-center justify-center text-xs font-bold active:scale-95 transition-all select-none shadow-[0_2px_12px_rgba(201,168,106,0.3)]"
          aria-label="Account menu"
        >
          {user?.name?.[0]?.toUpperCase() || <User size={14} />}
        </button>

        {open && (
          <div className="absolute top-full right-0 mt-3 bg-[#141414] border border-[#242424] shadow-[0_10px_40px_rgba(0,0,0,0.5)] min-w-[180px] py-2 z-50 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#242424] mb-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#B8976A]">Hello, {user?.name?.split(' ')[0]}</p>
            </div>
            {[
              { label: 'My Orders', path: '/my-orders' },
              { label: 'Returns & Exchanges', path: '/my-returns' },
              { label: 'My Wallet', path: '/wallet', icon: Wallet, badge: walletBalance > 0 ? `₹${walletBalance.toLocaleString('en-IN')}` : null },
              { label: 'My Profile', path: '/profile' },
              { label: 'Track Order', path: '/track' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => { setOpen(false); navigate(item.path) }}
                className="w-full text-left px-5 py-2.5 text-xs font-medium text-[#9A9A9A] hover:bg-[#B8976A]/10 hover:text-[#B8976A] transition-colors flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {item.icon && <item.icon size={12} />}
                  {item.label}
                </span>
                {item.badge && (
                  <span className="text-[10px] text-[#B8976A] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-5 py-2.5 text-xs font-bold text-[#E8A0B0] hover:bg-[#E8A0B0]/10 transition-colors border-t border-[#242424] mt-1 pt-2"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      to="/auth"
      className="hidden md:flex items-center bg-gradient-to-r from-[#B8976A] to-[#A88345] hover:from-[#A88345] hover:to-[#B8976A] rounded-xl px-5 py-2.5 text-[10px] uppercase tracking-[0.12em] font-semibold text-white transition-all duration-300 active:scale-95 cursor-pointer shadow-[0_2px_12px_rgba(201,168,106,0.2)]"
      aria-label="Login"
    >
      Login
    </Link>
  )
}

export default function Navbar() {
  const dispatch      = useDispatch()
  const navigate      = useNavigate()
  const location      = useLocation()
  const cartCount     = useSelector(selectCartCount)
  const wishlistCount = useSelector(selectWishlistCount)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const searchContainerRef = useRef(null)

  useEffect(() => {
    dispatch(closeCart())
    dispatch(closeMobileMenu())
    setSearchOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    const handleEscape = (e) => { if (e.key === 'Escape') setSearchOpen(false) }
    if (searchOpen) {
      document.addEventListener('mousedown', handleOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [searchOpen])

  const isActive = (href) => {
    const current = location.pathname + location.search
    return current === href
  }

  const isHome = location.pathname === '/'

  return (
    <>
      <header
        className={`sticky top-0 z-30 transition-all duration-500 ${
          isHome && !scrolled
            ? 'bg-transparent text-white border-transparent'
            : 'bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#242424]/50 text-white shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
        }`}
      >
        <div className="px-5 md:px-8 lg:px-16">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Brand Logo */}
            <Link
              to="/"
              className="flex flex-col items-center flex-shrink-0 outline-none focus:outline-none select-none group"
            >
              <span className="font-serif text-[1.5rem] tracking-[0.22em] font-light leading-none text-white transition-colors group-hover:text-[#B8976A]">ZYLARA</span>
              <span className="text-[7px] uppercase tracking-[0.35em] text-[#B8976A] mt-1.5 leading-none pl-[0.35em]">JEWELLERY</span>
            </Link>

            {/* Desktop Navigation links */}
            <nav className="hidden lg:flex items-center gap-10">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`relative text-[11px] uppercase tracking-[0.12em] font-medium transition-colors duration-300 group pb-1 ${
                    isActive(link.href)
                      ? 'text-white'
                      : 'text-[#9A9A9A] hover:text-white'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#B8976A] to-[#E8A0B0] transition-all duration-500 ${
                      isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              ))}
            </nav>

            {/* Icons group */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div ref={searchContainerRef} className="relative">
                <button
                  onClick={() => setSearchOpen((v) => !v)}
                  aria-label="Search"
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all active:scale-95 cursor-pointer"
                >
                  <Search size={18} className="text-white hover:text-[#B8976A] transition-colors" />
                </button>

                {searchOpen && (
                  <div className="absolute top-full right-0 mt-3 w-[480px] max-w-[90vw] bg-[#141414] border border-[#242424] shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl z-50 animate-fadeIn overflow-hidden">
                    <div className="p-5">
                      <SearchBar onClose={() => setSearchOpen(false)} />
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/likes"
                className="hidden md:flex relative w-10 h-10 items-center justify-center hover:bg-white/5 rounded-full active:scale-95 transition-all"
                aria-label="Wishlist"
              >
                <Heart size={18} className={wishlistCount > 0 ? 'fill-[#EE6B83] stroke-[#EE6B83]' : 'text-white hover:text-[#B8976A]'} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#EE6B83] to-[#D48A9A] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account button */}
              <AuthButton />

              {/* Shopping Cart button */}
              <button
                className="relative hidden md:inline-flex w-10 h-10 items-center justify-center hover:bg-white/5 rounded-full active:scale-95 transition-all cursor-pointer"
                onClick={() => dispatch(toggleCart())}
                aria-label="Cart"
              >
                <ShoppingBag size={18} className="text-white hover:text-[#B8976A] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Mobile menu trigger */}
              <button
                className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full active:scale-95 transition-all cursor-pointer"
                onClick={() => dispatch(toggleMobileMenu())}
                aria-label="Menu"
              >
                <Menu size={18} className="text-white hover:text-[#B8976A]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer />
      <MobileMenu />
    </>
  )
}
