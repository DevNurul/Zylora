import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { fetchMyOrders, setActiveFilter } from '../store/slices/myOrdersSlice'
import OrderCard from '../components/orders/OrderCard'
import OrderCardSkeleton from '../components/orders/OrderCardSkeleton'

const FILTERS = [
  { key: 'all',             label: 'All' },
  { key: 'pending',         label: 'Pending' },
  { key: 'confirmed',       label: 'Confirmed' },
  { key: 'shipped',         label: 'Shipped' },
  { key: 'out_for_delivery',label: 'Out for Delivery' },
  { key: 'delivered',       label: 'Delivered' },
  { key: 'cancelled',       label: 'Cancelled' },
]

export default function MyOrdersPage() {
  const dispatch     = useDispatch()
  const navigate     = useNavigate()
  const listRef      = useRef(null)
  const {
    orders, loading, error,
    totalOrders, totalPages, currentPage,
    hasNextPage, hasPrevPage, activeFilter,
  } = useSelector((s) => s.myOrders)

  useEffect(() => {
    dispatch(fetchMyOrders({ page: 1, status: 'all' }))
  }, [dispatch])

  const changeFilter = (key) => {
    dispatch(setActiveFilter(key))
    dispatch(fetchMyOrders({ page: 1, status: key }))
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const changePage = (page) => {
    dispatch(fetchMyOrders({ page, status: activeFilter }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-12">
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="max-w-3xl mx-auto">

        {/* Page heading */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl text-white mb-2 font-light">
              My Orders
            </h1>
            <p className="text-sm text-[#5C5C5C]">View and track all your orders</p>
          </div>
          {totalOrders > 0 && (
            <span className="bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-lg font-medium">
              {totalOrders} {totalOrders === 1 ? 'Order' : 'Orders'}
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-0 border-b border-[#242424] mb-8 overflow-x-auto no-scrollbar">
          {FILTERS.map(({ key, label }) => {
            const active = activeFilter === key
            return (
              <button
                key={key}
                onClick={() => changeFilter(key)}
                className={`py-3 px-4 text-xs uppercase tracking-[0.08em] font-medium whitespace-nowrap border-b-2 -mb-[1px] transition-all duration-300 ${
                  active
                    ? 'text-[#B8976A] border-[#B8976A]'
                    : 'text-[#5C5C5C] border-transparent hover:text-[#9A9A9A]'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* List anchor */}
        <div ref={listRef} />

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[0,1,2].map(i => <OrderCardSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-[#141414] border border-[#242424] rounded-2xl p-5 md:p-8 text-center">
            <p className="text-[#E8A0B0] mb-4">{error}</p>
             <button onClick={() => dispatch(fetchMyOrders({ page: 1, status: activeFilter }))}
              className="bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white border-none px-6 py-3 cursor-pointer text-xs uppercase tracking-[0.1em] font-semibold rounded-xl">
              Retry
            </button>
          </div>
        )}

        {/* Empty — no orders ever */}
        {!loading && !error && orders.length === 0 && activeFilter === 'all' && (
          <div className="bg-[#141414] border border-[#242424] rounded-2xl p-8 md:p-16 text-center">
            <ShoppingBag size={48} className="text-[#242424] mx-auto mb-4" />
            <p className="font-serif text-xl text-white mb-2">No orders yet</p>
            <p className="text-sm text-[#5C5C5C] mb-6">Start shopping and your orders will appear here</p>
            <button onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white border-none px-8 py-3.5 text-xs uppercase tracking-[0.1em] font-semibold cursor-pointer rounded-xl">
              Shop Now
            </button>
          </div>
        )}

        {/* Empty — filter active, no results */}
        {!loading && !error && orders.length === 0 && activeFilter !== 'all' && (
          <div className="bg-[#141414] border border-[#242424] rounded-2xl p-8 md:p-16 text-center">
            <ShoppingBag size={48} className="text-[#242424] mx-auto mb-4" />
            <p className="font-serif text-xl text-white mb-2">
              No {FILTERS.find(f=>f.key===activeFilter)?.label.toLowerCase()} orders
            </p>
            <p className="text-sm text-[#5C5C5C] mb-6">Try a different filter</p>
            <button onClick={() => changeFilter('all')}
              className="text-xs text-[#B8976A] hover:text-[#E8A0B0] transition-colors underline cursor-pointer">
              View All Orders
            </button>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col gap-4">
            {orders.map((order, i) => (
              <div key={order.orderId} style={{ animation: `fadeInUp 300ms ease ${i * 60}ms both` }}>
                <OrderCard order={order} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={!hasPrevPage}
              className="text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[#B8976A] hover:text-[#E8A0B0]"
            >
              ← Previous
            </button>
            <span className="text-sm text-[#5C5C5C]">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={!hasNextPage}
              className="text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[#B8976A] hover:text-[#E8A0B0]"
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
