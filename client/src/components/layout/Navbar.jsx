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
        className={`fixed inset-0 bg-black/60 z-45 transition-opacity duration-300 ${
          cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => dispatch(closeCart())}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[min(380px,92vw)] bg-[#171717] z-50 flex flex-col
          transition-transform duration-300 shadow-[0_0_40px_rgba(0,0,0,0.8)] border-l border-[#2A2A2A]
          ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2A]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Shopping Bag</h2>
            {items.length > 0 && (
              <p className="text-xs text-[#B3B3B3] mt-0.5">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
            )}
          </div>
          <button
            onClick={() => dispatch(closeCart())}
            className="p-1.5 hover:bg-white/5 transition-colors rounded-full text-white"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 border border-[#2A2A2A] rounded-full flex items-center justify-center text-[#B3B3B3]">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Your bag is empty</p>
                <p className="text-xs text-[#B3B3B3] mt-1">Add items you love</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item) => (
                <CartItem key={`${item.id}-${item.size}-${item.color}`} item={item} compact />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#2A2A2A] p-6 space-y-3 bg-[#171717]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[#B3B3B3] font-medium uppercase tracking-wider">Subtotal</span>
              <span className="text-lg font-bold text-white">{formatPrice(finalTotal)}</span>
            </div>
            <button
              onClick={() => { dispatch(closeCart()); navigate('/cart') }}
              className="w-full border border-[#EE6B83] text-[#EE6B83] rounded-lg py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#EE6B83]/10 transition-all duration-200 cursor-pointer"
            >
              View Bag
            </button>
            <button
              onClick={() => { dispatch(closeCart()); navigate('/checkout') }}
              className="w-full bg-[#EE6B83] hover:bg-[#D9506A] text-white rounded-lg py-3 text-xs uppercase tracking-widest font-semibold hover:shadow-lg hover:shadow-[#EE6B83]/10 transition-all duration-200 cursor-pointer"
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
        className={`fixed inset-0 bg-black/60 z-45 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => dispatch(closeMobileMenu())}
      />
      <div
        className={`fixed top-0 left-0 h-full w-[min(300px,88vw)] bg-[#171717] z-50 flex flex-col
          transition-transform duration-300 shadow-[0_0_40px_rgba(0,0,0,0.8)] border-r border-[#2A2A2A]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2A]">
          <div className="flex flex-col items-start select-none">
            <span className="font-serif text-[1.35rem] tracking-[0.22em] font-light leading-none text-white">ZYLORA</span>
            <span className="text-[7.5px] uppercase tracking-[0.38em] text-[#C9A86A] mt-1 leading-none pl-[0.38em]">JEWELLERY</span>
          </div>
          <button
            onClick={() => dispatch(closeMobileMenu())}
            className="p-1.5 hover:bg-white/5 transition-colors rounded-full text-white"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-4">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => go(link.href)}
              className="flex items-center justify-between w-full py-4 border-b border-[#2A2A2A] text-left group"
            >
              <span className="text-[13px] uppercase tracking-[0.08em] font-semibold text-[#B3B3B3] group-hover:text-white transition-colors">
                {link.label}
              </span>
              <ChevronRight size={14} className="text-[#B3B3B3] group-hover:text-[#EE6B83] transition-colors" />
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
    <div className="px-6 py-6 border-t border-[#2A2A2A] flex flex-col gap-4 bg-[#171717]">
      {!isAuthenticated && (
        <button
          onClick={() => go('/auth')}
          className="text-[11px] uppercase tracking-[0.1em] text-[#EE6B83] font-semibold hover:text-[#D9506A] transition-colors text-left"
        >
          Sign In
        </button>
      )}
      {isAuthenticated && (
        <button
          onClick={() => go('/profile')}
          className="text-[11px] uppercase tracking-[0.1em] text-[#B3B3B3] hover:text-white transition-colors text-left font-medium"
        >
          My Profile
        </button>
      )}
      <button
        onClick={() => go('/likes')}
        className="text-[11px] uppercase tracking-[0.1em] text-[#B3B3B3] hover:text-white transition-colors text-left font-medium"
      >
        Wishlist
      </button>
      <button
        onClick={() => go('/track-order')}
        className="text-[11px] uppercase tracking-[0.1em] text-[#B3B3B3] hover:text-white transition-colors text-left font-medium"
      >
        Track Order
      </button>
      {isAuthenticated && (
        <button
          onClick={handleLogout}
          className="text-[11px] uppercase tracking-[0.1em] text-red-500 hover:text-red-400 transition-colors text-left font-semibold"
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
          className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A86A] to-[#A88345] text-white flex items-center justify-center text-[12px] font-bold active:scale-95 transition-transform select-none shadow-md shadow-black/20"
          aria-label="Account menu"
        >
          {user?.name?.[0]?.toUpperCase() || <User size={14} />}
        </button>

        {open && (
          <div className="absolute top-full right-0 mt-2 bg-[#171717] border border-[#2A2A2A] shadow-xl shadow-black/40 min-w-[170px] py-2 z-50 rounded-xl">
            <div className="px-4 py-2 border-b border-[#2A2A2A] mb-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#C9A86A]">Hello, {user?.name?.split(' ')[0]}</p>
            </div>
            <button
              onClick={() => { setOpen(false); navigate('/my-orders') }}
              className="w-full text-left px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#EE6B83]/10 hover:text-[#EE6B83] transition-colors"
            >
              My Orders
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/my-returns') }}
              className="w-full text-left px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#EE6B83]/10 hover:text-[#EE6B83] transition-colors"
            >
              Returns & Exchanges
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/wallet') }}
              className="w-full text-left px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#EE6B83]/10 hover:text-[#EE6B83] transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Wallet size={12} />
                My Wallet
              </span>
              {walletBalance > 0 && (
                <span className="text-[11px] text-[#EE6B83] font-bold">
                  ₹{walletBalance.toLocaleString('en-IN')}
                </span>
              )}
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/profile') }}
              className="w-full text-left px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#EE6B83]/10 hover:text-[#EE6B83] transition-colors"
            >
              My Profile
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/track') }}
              className="w-full text-left px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#EE6B83]/10 hover:text-[#EE6B83] transition-colors"
            >
              Track Order
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-[12px] font-bold text-red-500 hover:bg-red-500/10 transition-colors border-t border-[#2A2A2A] mt-1 pt-2"
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
      className="hidden md:flex items-center border border-[#EE6B83] hover:border-[#D9506A] rounded-lg px-4 py-2 text-[11px] uppercase tracking-[0.1em] font-semibold text-white bg-[#EE6B83] hover:bg-[#D9506A] transition-all duration-200 active:scale-95 cursor-pointer"
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
        className={`sticky top-0 z-30 transition-all duration-300 ${
          isHome && !scrolled
            ? 'bg-transparent text-white border-transparent'
            : 'bg-[#0D0D0D]/90 backdrop-blur-md border-b border-[#2A2A2A] text-white shadow-xl shadow-black/25'
        }`}
      >
        <div className="px-4 md:px-8 lg:px-16">
          <div className="flex items-center justify-between h-14 md:h-20">
            {/* Brand Logo */}
            <Link
              to="/"
              className="flex flex-col items-center flex-shrink-0 outline-none focus:outline-none select-none group"
            >
              <span className="font-serif text-[1.45rem] tracking-[0.24em] font-light leading-none text-white transition-colors group-hover:text-[#C9A86A]">ZYLORA</span>
              <span className="text-[7.5px] uppercase tracking-[0.38em] text-[#C9A86A] mt-1.5 leading-none pl-[0.38em]">JEWELLERY</span>
            </Link>

            {/* Desktop Navigation links */}
            <nav className="hidden lg:flex items-center gap-10">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`relative text-[11px] uppercase tracking-[0.14em] font-semibold transition-colors duration-200 group pb-1 ${
                    isActive(link.href)
                      ? 'text-white'
                      : 'text-[#B3B3B3] hover:text-white'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#EE6B83] transition-all duration-300 ${
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
                  className="active:scale-95 transition-transform cursor-pointer"
                >
                  <Search size={20} className="text-white hover:text-[#C9A86A] transition-colors" />
                </button>

                {searchOpen && (
                  <div className="absolute top-full right-0 mt-3 w-[480px] max-w-[90vw] bg-[#171717] border border-[#2A2A2A] shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-2xl z-50 animate-fadeIn">
                    <div className="p-4">
                      <SearchBar onClose={() => setSearchOpen(false)} />
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/likes"
                className="hidden md:flex relative active:scale-95 transition-transform"
                aria-label="Wishlist"
              >
                <Heart size={20} className="text-white hover:text-[#C9A86A] transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#EE6B83] text-white text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold leading-none border border-[#0D0D0D]">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account button */}
              <AuthButton />

              {/* Shopping Cart button */}
              <button
                className="relative hidden md:inline-flex active:scale-95 transition-transform cursor-pointer"
                onClick={() => dispatch(toggleCart())}
                aria-label="Cart"
              >
                <ShoppingBag size={20} className="text-white hover:text-[#C9A86A] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#EE6B83] text-white text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold leading-none border border-[#0D0D0D]">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Mobile menu trigger */}
              <button
                className="lg:hidden active:scale-95 transition-transform cursor-pointer"
                onClick={() => dispatch(toggleMobileMenu())}
                aria-label="Menu"
              >
                <Menu size={20} className="text-white hover:text-[#C9A86A]" />
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
