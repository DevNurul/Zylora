import { useState, useEffect } from 'react'
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { Sun, Moon, Bell, Search, Menu, X, Home, ShoppingBag, Package, Settings, RotateCcw, Plus } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Layout States
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true'
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  
  // Theme States
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', collapsed)
  }, [collapsed])

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  // Generate Breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname
    if (path === '/') return [{ label: 'Dashboard', active: true }]
    
    const parts = path.split('/').filter(Boolean)
    return [
      { label: 'Dashboard', to: '/' },
      ...parts.map((part, index) => {
        const to = '/' + parts.slice(0, index + 1).join('/')
        const isLast = index === parts.length - 1
        
        // Clean display label
        let label = part.charAt(0).toUpperCase() + part.slice(1)
        if (label === 'Wallet') label = 'Wallet Approvals'
        if (label === 'Returns' && parts[index + 1]) label = 'Returns List'
        
        return { label, to: isLast ? null : to, active: isLast }
      })
    ]
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-gray-200 transition-colors duration-300 flex">
      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/40 backdrop-blur-xs">
          <div className="relative w-64 max-w-xs animate-slide-in">
            <Sidebar collapsed={false} setCollapsed={() => {}} isMobile={true} closeMobile={() => setMobileOpen(false)} />
            <button 
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-[-48px] p-2 bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-white rounded-lg shadow-lg border border-black/5"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ── Main Panel Wrapper ── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'md:pl-20' : 'md:pl-70'}`}>
        
        {/* ── Sticky Top Nav ── */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 bg-white/80 dark:bg-dark-card/85 backdrop-blur-md border-b border-gray-100 dark:border-white/5 shadow-xs">
          <div className="flex items-center gap-4">
            {/* Hamburger trigger */}
            <button 
              onClick={() => setMobileOpen(true)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500 md:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500">
              {breadcrumbs.map((bc, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && <span>/</span>}
                  {bc.active ? (
                    <span className="text-gray-900 dark:text-white font-semibold">{bc.label}</span>
                  ) : (
                    <Link to={bc.to} className="hover:text-primary dark:hover:text-primary transition-colors">{bc.label}</Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Box */}
            <div className="relative hidden lg:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input 
                placeholder="Global search (Ctrl+K)..." 
                className="pl-9 pr-4 py-1.5 w-60 border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-dark-bg rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent dark:text-white"
              />
            </div>

            {/* Quick Create Button */}
            <button 
              onClick={() => navigate('/products')}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-xs"
            >
              <Plus size={14} /> <span className="hidden sm:inline">Add Product</span>
            </button>

            {/* Dark Mode toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-all"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-all">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white dark:ring-dark-card" />
              </button>
            </div>

            {/* Admin Profile */}
            <div className="h-8 w-px bg-gray-100 dark:bg-white/5" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary uppercase">
                {user?.name?.slice(0, 2) || 'AD'}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">{user?.name || 'Zylora Admin'}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-semibold leading-none mt-0.5">{user?.role || 'Administrator'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Scroll View ── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* ── Mobile Bottom Navigation ── */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-dark-card/95 backdrop-blur-md border-t border-gray-100 dark:border-white/5 flex items-center justify-around py-3 px-2 md:hidden shadow-lg">
          <Link to="/" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-primary active:text-primary transition-colors">
            <Home size={18} className={location.pathname === '/' ? 'text-primary' : ''} />
            <span className={`text-[9px] font-medium ${location.pathname === '/' ? 'text-primary' : ''}`}>Home</span>
          </Link>
          <Link to="/orders" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-primary active:text-primary transition-colors">
            <ShoppingBag size={18} className={location.pathname.startsWith('/orders') ? 'text-primary' : ''} />
            <span className={`text-[9px] font-medium ${location.pathname.startsWith('/orders') ? 'text-primary' : ''}`}>Orders</span>
          </Link>
          <Link to="/products" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-primary active:text-primary transition-colors">
            <Package size={18} className={location.pathname.startsWith('/products') ? 'text-primary' : ''} />
            <span className={`text-[9px] font-medium ${location.pathname.startsWith('/products') ? 'text-primary' : ''}`}>Products</span>
          </Link>
          <Link to="/returns" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-primary active:text-primary transition-colors">
            <RotateCcw size={18} className={location.pathname.startsWith('/returns') ? 'text-primary' : ''} />
            <span className={`text-[9px] font-medium ${location.pathname.startsWith('/returns') ? 'text-primary' : ''}`}>Returns</span>
          </Link>
          <Link to="/settings" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-primary active:text-primary transition-colors">
            <Settings size={18} className={location.pathname.startsWith('/settings') ? 'text-primary' : ''} />
            <span className={`text-[9px] font-medium ${location.pathname.startsWith('/settings') ? 'text-primary' : ''}`}>Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}
