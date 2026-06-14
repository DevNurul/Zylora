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
    <div style={{ minHeight: '100vh', background: '#FCD4DB', padding: '48px 16px' }}>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Page heading */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: '"Playfair Display",Georgia,serif', fontSize: 32, fontWeight: 400, color: '#0A0A0A', margin: '0 0 6px' }}>
              My Orders
            </h1>
            <p style={{ fontSize: 14, color: '#6B6B6B', margin: 0 }}>View and track all your orders</p>
          </div>
          {totalOrders > 0 && (
            <span style={{ background: '#EE6B83', color: '#fff', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', alignSelf: 'flex-start', borderRadius: 8 }}>
              {totalOrders} {totalOrders === 1 ? 'Order' : 'Orders'}
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E5E5E5', marginBottom: 24, overflowX: 'auto' }}>
          {FILTERS.map(({ key, label }) => {
            const active = activeFilter === key
            return (
              <button
                key={key}
                onClick={() => changeFilter(key)}
                style={{
                  background:    'none',
                  border:        'none',
                  borderBottom:  active ? '2px solid #EE6B83' : '2px solid transparent',
                  padding:       '10px 16px',
                  fontSize:      12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight:    active ? 500 : 400,
                  color:         active ? '#EE6B83' : '#6B6B6B',
                  cursor:        'pointer',
                  whiteSpace:    'nowrap',
                  marginBottom:  -1,
                  transition:    'color 200ms',
                }}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[0,1,2].map(i => <OrderCardSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ background: '#fff', padding: 32, textAlign: 'center' }}>
            <p style={{ color: '#EF4444', marginBottom: 16 }}>{error}</p>
             <button onClick={() => dispatch(fetchMyOrders({ page: 1, status: activeFilter }))}
              style={{ background: '#EE6B83', color: '#fff', border: 'none', padding: '10px 24px', cursor: 'pointer', fontSize: 13, borderRadius: 8 }}>
              Retry
            </button>
          </div>
        )}

        {/* Empty — no orders ever */}
        {!loading && !error && orders.length === 0 && activeFilter === 'all' && (
          <div style={{ background: '#fff', padding: '64px 32px', textAlign: 'center' }}>
            <ShoppingBag size={48} style={{ color: '#D1D5DB', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: 18, fontWeight: 500, color: '#0A0A0A', margin: '0 0 8px' }}>No orders yet</p>
            <p style={{ fontSize: 14, color: '#6B6B6B', margin: '0 0 24px' }}>Start shopping and your orders will appear here</p>
            <button onClick={() => navigate('/products')}
              style={{ background: '#EE6B83', color: '#fff', border: 'none', padding: '12px 28px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', borderRadius: 8 }}>
              Shop Now
            </button>
          </div>
        )}

        {/* Empty — filter active, no results */}
        {!loading && !error && orders.length === 0 && activeFilter !== 'all' && (
          <div style={{ background: '#fff', padding: '64px 32px', textAlign: 'center' }}>
            <ShoppingBag size={48} style={{ color: '#D1D5DB', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: 18, fontWeight: 500, color: '#0A0A0A', margin: '0 0 8px' }}>
              No {FILTERS.find(f=>f.key===activeFilter)?.label.toLowerCase()} orders
            </p>
            <p style={{ fontSize: 14, color: '#6B6B6B', margin: '0 0 20px' }}>Try a different filter</p>
            <button onClick={() => changeFilter('all')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#EE6B83', textDecoration: 'underline' }}>
              View All Orders
            </button>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order, i) => (
              <div key={order.orderId} style={{ animation: `fadeInUp 300ms ease ${i * 60}ms both` }}>
                <OrderCard order={order} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 32 }}>
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={!hasPrevPage}
              style={{ background: 'none', border: 'none', cursor: hasPrevPage ? 'pointer' : 'not-allowed', fontSize: 13, color: hasPrevPage ? '#EE6B83' : '#B0B0B0' }}
            >
              ← Previous
            </button>
            <span style={{ fontSize: 13, color: '#6B6B6B' }}>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={!hasNextPage}
              style={{ background: 'none', border: 'none', cursor: hasNextPage ? 'pointer' : 'not-allowed', fontSize: 13, color: hasNextPage ? '#EE6B83' : '#B0B0B0' }}
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
