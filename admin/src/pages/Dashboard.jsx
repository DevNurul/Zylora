import { useEffect, useState } from 'react'
import { ShoppingBag, Package, IndianRupee, TrendingUp, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
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

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>
  if (!data) return <div className="p-8 text-red-500">Failed to load dashboard</div>

  const {
    totalOrders, totalRevenue, totalProducts, totalCategories,
    ordersByStatus = {}, recentOrders = [], lowStockProducts = [],
  } = data

  const statusData = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => ({
    name: s.replace(/_/g, ' '),
    count: ordersByStatus[s] || 0,
  }))

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders" value={totalOrders} icon={ShoppingBag} />
        <StatCard label="Total Revenue" value={formatPrice(totalRevenue)} icon={IndianRupee} />
        <StatCard label="Total Products" value={totalProducts} icon={Package} />
        <StatCard label="Delivered" value={ordersByStatus.delivered || 0} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-black/5">
          <h3 className="font-semibold text-gray-900 mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#C9A96E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-black/5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.length === 0 && <p className="text-gray-400 text-sm">No orders yet</p>}
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{order.orderId}</p>
                  <p className="text-gray-400 text-xs">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                  <Badge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-black/5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-orange-500" />
            <h3 className="font-semibold text-gray-900">Low Stock Alert</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {lowStockProducts.map((p) => (
              <div key={p._id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                {p.images?.[0] && (
                  <img src={p.images[0].url} alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-orange-600 font-semibold">{p.stock} left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
