import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, Package, Tag, Image, Ticket, Settings, LogOut, RotateCcw, Wallet,
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

export default function Sidebar() {
  const { logout } = useAuth()
  const [pendingReturns, setPendingReturns]   = useState(0)
  const [pendingWallet,  setPendingWallet]    = useState(0)

  useEffect(() => {
    api.get('/admin/returns', { params: { status: 'requested', limit: 1 } })
      .then(({ data }) => setPendingReturns(data.totalRequests || 0))
      .catch(() => {})
    api.get('/admin/wallet/pending')
      .then(({ data }) => setPendingWallet(data.total || 0))
      .catch(() => {})
  }, [])

  return (
    <aside className="w-60 min-h-screen bg-[#111] flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-white font-bold text-lg tracking-widest uppercase">AMRIN</h1>
        <p className="text-white/40 text-xs mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {STATIC_LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#C9A96E] text-black'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {/* Returns link with pending badge */}
        <NavLink
          to="/returns"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#C9A96E] text-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <RotateCcw size={18} />
          <span className="flex-1">Returns</span>
          {pendingReturns > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {pendingReturns > 99 ? '99+' : pendingReturns}
            </span>
          )}
        </NavLink>
        {/* Wallet approvals link with pending badge */}
        <NavLink
          to="/wallet"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#C9A96E] text-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <Wallet size={18} />
          <span className="flex-1">Wallet Approvals</span>
          {pendingWallet > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {pendingWallet > 99 ? '99+' : pendingWallet}
            </span>
          )}
        </NavLink>
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
