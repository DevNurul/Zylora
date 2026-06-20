import { useEffect, useState } from 'react'
import { ShoppingBag, Package, IndianRupee, TrendingUp, AlertTriangle, ArrowUpRight, Trophy } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import { formatPrice } from '../utils/formatPrice'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Loading analytics dashboard...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <AlertTriangle size={40} className="text-red-500 mb-3" />
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Failed to load dashboard</h3>
        <p className="text-sm text-gray-400 mt-1">Please check your backend connection or refresh the page.</p>
      </div>
    )
  }

  const {
    totalOrders, totalRevenue, totalProducts,
    ordersByStatus = {}, recentOrders = [], lowStockProducts = [], topSellingProducts = [],
  } = data

  const statusData = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => ({
    name: s.replace(/_/g, ' '),
    count: ordersByStatus[s] || 0,
  }))

  return (
    <div className="space-y-8 pb-12">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Overview</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Real-time performance metrics and order tracking</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard label="Total Orders" value={totalOrders} icon={ShoppingBag} />
        <StatCard label="Total Revenue" value={formatPrice(totalRevenue)} icon={IndianRupee} />
        <StatCard label="Total Products" value={totalProducts} icon={Package} />
        <StatCard label="Delivered" value={ordersByStatus.delivered || 0} icon={TrendingUp} />
      </div>

      {/* Chart & Recent Orders Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts card */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-xs flex flex-col">
          <div className="mb-6">
            <h3 className="font-bold text-sm text-gray-950 dark:text-white uppercase tracking-wider">Order Status Distribution</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Volume comparison by lifecycle state</p>
          </div>
          <div className="flex-1 min-h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EE6B83" stopOpacity={1} />
                    <stop offset="100%" stopColor="#EE6B83" stopOpacity={0.65} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" className="dark:stroke-white/2" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                  itemStyle={{ color: '#EE6B83', fontWeight: 600, fontSize: '12px' }}
                  labelStyle={{ color: '#1F2937', fontWeight: 500, fontSize: '11px' }}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders List card */}
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-sm text-gray-950 dark:text-white uppercase tracking-wider">Recent Orders</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Latest transactions</p>
            </div>
            <Link to="/orders" className="text-primary hover:text-primary-hover text-xs font-semibold flex items-center gap-0.5 transition-colors group">
              View All <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[280px] pr-1">
            {recentOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-4">
                <p className="text-gray-400 dark:text-gray-500 text-xs font-medium">No recent orders logged</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/2 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/1 rounded-lg px-2 transition-colors">
                  <div className="min-w-0 pr-2">
                    <p className="font-mono text-xs font-bold text-gray-900 dark:text-white truncate">{order.orderId}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{order.customerName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
                    <div className="scale-85 origin-right mt-1">
                      <Badge status={order.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Product Sales */}
      <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Trophy size={18} className="stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-950 dark:text-white uppercase tracking-wider">Product Sales</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Top products by units sold across active orders</p>
            </div>
          </div>
          <Link to="/orders" className="text-primary hover:text-primary-hover text-xs font-semibold flex items-center gap-0.5 transition-colors group">
            View Orders <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {topSellingProducts.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">No product sales recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="text-left border-b border-gray-100 dark:border-white/5">
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">Product</th>
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold text-right">Units Sold</th>
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold text-right">Orders</th>
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold text-right">Revenue</th>
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold text-right">Stock Left</th>
                </tr>
              </thead>
              <tbody>
                {topSellingProducts.map((p, idx) => (
                  <tr key={p.productId || p.name} className="border-b border-gray-50 dark:border-white/2 last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-[11px] font-bold text-gray-400 dark:text-gray-500">{idx + 1}</span>
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-11 h-11 object-cover rounded-xl bg-gray-50 dark:bg-white/5 flex-shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300 dark:text-gray-700 flex-shrink-0">
                            <Package size={15} />
                          </div>
                        )}
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[280px]" title={p.name}>{p.name}</p>
                      </div>
                    </td>
                    <td className="py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{p.unitsSold}</td>
                    <td className="py-4 text-right text-xs text-gray-500 dark:text-gray-400">{p.orderCount}</td>
                    <td className="py-4 text-right text-xs font-bold text-gray-900 dark:text-white">{formatPrice(p.revenue)}</td>
                    <td className={`py-4 text-right text-xs font-bold ${(p.stock ?? 0) < 5 ? 'text-amber-600 dark:text-amber-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {p.stock ?? 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <AlertTriangle size={18} className="stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-950 dark:text-white uppercase tracking-wider">Inventory Alerts</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Items with stock count under the threshold</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {lowStockProducts.map((p) => (
              <div key={p._id} className="flex items-center gap-3.5 p-3.5 border border-amber-100 dark:border-amber-500/20 bg-amber-500/3 dark:bg-amber-500/1 rounded-2xl hover:scale-[1.01] transition-transform">
                {p.images?.[0] ? (
                  <img src={p.images[0].url} alt={p.name} className="w-12 h-12 object-cover rounded-xl flex-shrink-0 bg-gray-50 dark:bg-white/5 shadow-xs" />
                ) : (
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0">
                    <Package size={16} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate" title={p.name}>{p.name}</p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider mt-1">{p.stock} units remaining</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
