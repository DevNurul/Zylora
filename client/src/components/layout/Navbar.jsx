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
  { label: 'Home', href: '/' },
  { label: 'Women', href: '/products?category=Women' },
  { label: 'Men', href: '/products?category=Men' },
  { label: 'Accessories', href: '/products?category=Accessories' },
  { label: 'Footwear', href: '/products?category=Footwear' },
  { label: 'Sale', href: '/products?category=sale' },
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
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => dispatch(closeCart())}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[min(360px,92vw)] bg-white z-50 flex flex-col
          transition-transform duration-300 shadow-2xl
          ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-[#0A0A0A]">Shopping Bag</h2>
            {items.length > 0 && (
              <p className="text-xs text-[#6B6B6B] mt-0.5">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
            )}
          </div>
          <button
            onClick={() => dispatch(closeCart())}
            className="p-1.5 hover:bg-gray-50 transition-colors rounded-full"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 border border-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag size={24} className="text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0A0A0A]">Your bag is empty</p>
                <p className="text-xs text-[#6B6B6B] mt-1">Add items you love</p>
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
          <div className="border-t border-gray-100 p-6 space-y-3 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6B6B6B]">Total</span>
              <span className="text-lg font-semibold">{formatPrice(finalTotal)}</span>
            </div>
            <button
              onClick={() => { dispatch(closeCart()); navigate('/cart') }}
              className="w-full border border-[#EE6B83] text-[#EE6B83] rounded-lg py-3 text-xs uppercase tracking-widest font-medium hover:bg-[#FCD4DB] hover:text-[#EE6B83] transition-all duration-200"
            >
              View Bag
            </button>
            <button
              onClick={() => { dispatch(closeCart()); navigate('/checkout') }}
              className="w-full bg-[#EE6B83] text-white rounded-lg py-3 text-xs uppercase tracking-widest font-medium hover:bg-[#D9506A] transition-all duration-200"
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
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => dispatch(closeMobileMenu())}
      />
      <div
        className={`fixed top-0 left-0 h-full w-[min(300px,88vw)] bg-white z-50 flex flex-col
          transition-transform duration-300 shadow-2xl
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col items-start select-none">
            <span className="font-display text-[1.35rem] tracking-[0.22em] leading-none">LUXORA</span>
            <span className="text-[7px] uppercase tracking-[0.38em] text-[#6B6B6B] mt-0.5 leading-none pl-[0.38em]">JEWELLERY</span>
          </div>
          <button
            onClick={() => dispatch(closeMobileMenu())}
            className="p-1.5 hover:bg-gray-50 transition-colors rounded-full"
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
              className="flex items-center justify-between w-full py-4 border-b border-gray-50 text-left group"
            >
              <span className="text-[13px] uppercase tracking-[0.08em] font-medium group-hover:text-[#EE6B83] transition-colors">
                {link.label}
              </span>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-[#EE6B83] transition-colors" />
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
    <div className="px-6 py-6 border-t border-gray-50 flex flex-col gap-4">
      {!isAuthenticated && (
        <button
          onClick={() => go('/auth')}
          className="text-[11px] uppercase tracking-[0.1em] text-[#0A0A0A] font-semibold hover:text-[#EE6B83] transition-colors text-left"
        >
          Sign In
        </button>
      )}
      {isAuthenticated && (
        <button
          onClick={() => go('/profile')}
          className="text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors text-left"
        >
          My Profile
        </button>
      )}
      <button
        onClick={() => go('/likes')}
        className="text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors text-left"
      >
        Wishlist
      </button>
      <button
        onClick={() => go('/track-order')}
        className="text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors text-left"
      >
        Track Order
      </button>
      {isAuthenticated && (
        <button
          onClick={handleLogout}
          className="text-[11px] uppercase tracking-[0.1em] text-red-400 hover:text-red-600 transition-colors text-left"
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
          className="w-8 h-8 rounded-full bg-[#EE6B83] text-white flex items-center justify-center text-[13px] font-medium active:scale-95 transition-transform select-none"
          aria-label="Account menu"
        >
          {user?.name?.[0]?.toUpperCase() || <User size={14} />}
        </button>

        {open && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 shadow-md min-w-[160px] py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100 mb-2">
              <p className="text-[12px] text-[#6B6B6B]">Hello, {user?.name?.split(' ')[0]}</p>
            </div>
            <button
              onClick={() => { setOpen(false); navigate('/my-orders') }}
              className="w-full text-left px-4 py-2 text-[13px] text-[#0A0A0A] hover:bg-[#FCD4DB] transition-colors"
            >
              My Orders
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/my-returns') }}
              className="w-full text-left px-4 py-2 text-[13px] text-[#0A0A0A] hover:bg-[#FCD4DB] transition-colors"
            >
              Returns & Exchanges
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/wallet') }}
              className="w-full text-left px-4 py-2 text-[13px] text-[#0A0A0A] hover:bg-[#FCD4DB] transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Wallet size={13} />
                My Wallet
              </span>
              {walletBalance > 0 && (
                <span className="text-[11px] text-[#EE6B83] font-semibold">
                  ₹{walletBalance.toLocaleString('en-IN')}
                </span>
              )}
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/profile') }}
              className="w-full text-left px-4 py-2 text-[13px] text-[#0A0A0A] hover:bg-[#FCD4DB] transition-colors"
            >
              My Profile
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/track') }}
              className="w-full text-left px-4 py-2 text-[13px] text-[#0A0A0A] hover:bg-[#FCD4DB] transition-colors"
            >
              Track Order
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-[13px] text-[#0A0A0A] hover:bg-[#FCD4DB] transition-colors"
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
      className="hidden md:flex items-center border border-[#EE6B83] rounded-lg px-4 py-2 text-[13px] uppercase tracking-[0.06em] text-[#EE6B83] hover:bg-[#FCD4DB] hover:text-[#EE6B83] transition-colors duration-200 active:scale-95"
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
    const onScroll = () => setScrolled(window.scrollY > 10)
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

  return (
    <>
      <header
        className={`sticky top-0 z-30 bg-white transition-shadow duration-200 ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="px-4 md:px-8 lg:px-16">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link
              to="/"
              className="flex flex-col items-center flex-shrink-0 text-[#0A0A0A] outline-none focus:outline-none select-none"
            >
              <span className="font-display text-[1.5rem] tracking-[0.22em] leading-none">LUXORA</span>
              <span className="text-[7.5px] uppercase tracking-[0.38em] text-[#6B6B6B] mt-0.5 leading-none pl-[0.38em]">JEWELLERY</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`relative text-[13px] uppercase tracking-[0.08em] font-medium transition-colors duration-200 group pb-0.5 ${
                    isActive(link.href)
                      ? 'text-[#0A0A0A]'
                      : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-px bg-[#EE6B83] transition-all duration-300 ${
                      isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 sm:gap-4">
              <div ref={searchContainerRef} className="relative">
                <button
                  onClick={() => setSearchOpen((v) => !v)}
                  aria-label="Search"
                  className="active:scale-95 transition-transform"
                >
                  <Search size={19} className="text-[#0A0A0A] hover:text-[#6B6B6B] transition-colors" />
                </button>

                {searchOpen && (
                  <div className="absolute top-full right-0 mt-2 w-[480px] max-w-[90vw] bg-white border border-gray-200 shadow-lg z-50 animate-fadeIn">
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
                <Heart size={19} className="text-[#0A0A0A] hover:text-[#6B6B6B] transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#EE6B83] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Auth button */}
              <AuthButton />

              <button
                className="relative hidden md:inline-flex active:scale-95 transition-transform"
                onClick={() => dispatch(toggleCart())}
                aria-label="Cart"
              >
                <ShoppingBag size={19} className="text-[#0A0A0A] hover:text-[#6B6B6B] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#EE6B83] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              <button
                className="lg:hidden active:scale-95 transition-transform"
                onClick={() => dispatch(toggleMobileMenu())}
                aria-label="Menu"
              >
                <Menu size={19} className="text-[#0A0A0A]" />
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
