import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, Package, Tag, Image, Ticket, Settings, LogOut, RotateCcw, Wallet,
  ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const STATIC_LINKS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/banners', icon: Image, label: 'Banners' },
  { to: '/coupons', icon: Ticket, label: 'Coupons' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ collapsed, setCollapsed, isMobile = false, closeMobile }) {
  const { logout } = useAuth()
  const [pendingReturns, setPendingReturns] = useState(0)
  const [pendingWallet, setPendingWallet] = useState(0)

  useEffect(() => {
    api.get('/admin/returns', { params: { status: 'requested', limit: 1 } })
      .then(({ data }) => setPendingReturns(data.totalRequests || 0))
      .catch(() => {})
    api.get('/admin/wallet/pending')
      .then(({ data }) => setPendingWallet(data.total || 0))
      .catch(() => {})
  }, [])

  const handleLinkClick = () => {
    if (isMobile && closeMobile) {
      closeMobile()
    }
  }

  return (
    <aside 
      className={`fixed top-0 bottom-0 left-0 z-40 bg-white/90 dark:bg-dark-card/90 backdrop-blur-md border-r border-gray-100 dark:border-white/5 flex flex-col transition-all duration-300 shadow-sm ${
        isMobile ? 'w-64' : collapsed ? 'w-20' : 'w-70'
      }`}
    >
      {/* ── Logo Section ── */}
      <div className={`px-6 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between ${
        collapsed && !isMobile ? 'justify-center' : ''
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
            <Sparkles size={20} className="stroke-[2.5]" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="text-left">
              <h1 className="font-serif text-lg font-bold tracking-wide text-gray-900 dark:text-white">Zylora</h1>
              <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider leading-none mt-0.5">JEWELRY ADMIN</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {STATIC_LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={handleLinkClick}
            title={collapsed && !isMobile ? label : ''}
            className={({ isActive }) =>
              `flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                collapsed && !isMobile ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-brand-pink dark:bg-primary/15 text-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {(!collapsed || isMobile) && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        {/* Returns link with pending badge */}
        <NavLink
          to="/returns"
          onClick={handleLinkClick}
          title={collapsed && !isMobile ? 'Returns' : ''}
          className={({ isActive }) =>
            `flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
              collapsed && !isMobile ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
            } ${
              isActive
                ? 'bg-brand-pink dark:bg-primary/15 text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
            }`
          }
        >
          <RotateCcw size={18} />
          {(!collapsed || isMobile) && (
            <>
              <span className="flex-1 truncate">Returns</span>
              {pendingReturns > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none scale-90 animate-pulse-soft">
                  {pendingReturns > 99 ? '99+' : pendingReturns}
                </span>
              )}
            </>
          )}
          {collapsed && !isMobile && pendingReturns > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          )}
        </NavLink>

        {/* Wallet approvals link with pending badge */}
        <NavLink
          to="/wallet"
          onClick={handleLinkClick}
          title={collapsed && !isMobile ? 'Wallet Approvals' : ''}
          className={({ isActive }) =>
            `flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
              collapsed && !isMobile ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
            } ${
              isActive
                ? 'bg-brand-pink dark:bg-primary/15 text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
            }`
          }
        >
          <Wallet size={18} />
          {(!collapsed || isMobile) && (
            <>
              <span className="flex-1 truncate">Wallet Approvals</span>
              {pendingWallet > 0 && (
                <span className="bg-[#C9A96E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none scale-90">
                  {pendingWallet > 99 ? '99+' : pendingWallet}
                </span>
              )}
            </>
          )}
          {collapsed && !isMobile && pendingWallet > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#C9A96E] rounded-full" />
          )}
        </NavLink>
      </nav>

      {/* ── Sidebar Actions / Collapse Button ── */}
      <div className="p-3 border-t border-gray-100 dark:border-white/5 space-y-1">
        <button
          onClick={logout}
          title={collapsed && !isMobile ? 'Logout' : ''}
          className={`flex items-center rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 w-full ${
            collapsed && !isMobile ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
          }`}
        >
          <LogOut size={18} />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>

        {/* Desktop Collapse Toggle */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center p-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all w-full"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>
    </aside>
  )
}
