import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react'
import { fetchWallet } from '../store/slices/walletSlice'

function TxnIcon({ type }) {
  if (type === 'credit')  return <ArrowDownLeft size={16} color="#15803d" />
  if (type === 'debit')   return <ArrowUpRight  size={16} color="#b91c1c" />
  return <Clock size={16} color="#6b7280" />
}

function StatusBadge({ status }) {
  const map = {
    pending:  { bg: '#fefce8', color: '#a16207', label: 'Pending Approval' },
    approved: { bg: '#f0fdf4', color: '#15803d', label: 'Credited'         },
    rejected: { bg: '#fef2f2', color: '#b91c1c', label: 'Rejected'         },
    expired:  { bg: '#f9fafb', color: '#6b7280', label: 'Expired'          },
  }
  const cfg = map[status] || { bg: '#f3f4f6', color: '#374151', label: status }
  return (
    <span style={{
      fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500,
      padding: '2px 8px', background: cfg.bg, color: cfg.color, borderRadius: 3,
    }}>{cfg.label}</span>
  )
}

export default function WalletPage() {
  const dispatch = useDispatch()
  const { balance, transactions, loading } = useSelector(s => s.wallet)

  useEffect(() => { dispatch(fetchWallet()) }, [dispatch])

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #EE6B83', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FCD4DB', padding: '48px 16px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Heading */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 400, color: '#0A0A0A', margin: '0 0 4px', letterSpacing: '0.04em' }}>
            My Wallet
          </h1>
          <p style={{ fontSize: 14, color: '#6B6B6B', margin: 0 }}>LUXORA Store Credit</p>
        </div>

        {/* Balance card */}
        <div style={{ background: '#fff', padding: 32, marginBottom: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B6B6B', margin: '0 0 8px' }}>
            Available Balance
          </p>
          {balance > 0 ? (
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 48, fontWeight: 600, color: '#0A0A0A', margin: '0 0 4px' }}>
              ₹{balance.toLocaleString('en-IN')}
            </p>
          ) : (
            <p style={{ fontSize: 18, color: '#9CA3AF', margin: '0 0 4px' }}>No balance yet</p>
          )}
          <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 24px' }}>
            Earn more by choosing wallet refund on returns
          </p>
          <div style={{ background: '#FCD4DB', padding: 16, textAlign: 'left' }}>
            <p style={{ fontSize: 12, color: '#6B6B6B', margin: 0, lineHeight: 1.7 }}>
              Wallet balance can be used on your next purchase.
              Valid for 6 months from credit date.
              Covers up to 80% of any order total.
            </p>
          </div>
        </div>

        {/* Transaction history */}
        <p style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B6B6B', margin: '0 0 16px', fontWeight: 500 }}>
          Transaction History
        </p>

        {transactions.length === 0 ? (
          <div style={{ background: '#fff', padding: 40, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>No transactions yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {transactions.map((txn, i) => (
              <div key={txn._id || i} style={{ background: '#fff', padding: 16, border: '1px solid #E5E5E5' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <TxnIcon type={txn.type} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#0A0A0A', margin: '0 0 2px' }}>
                        {txn.description || (txn.type === 'credit' ? 'Wallet Credit' : 'Wallet Debit')}
                      </p>
                      <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: 14, fontWeight: 600, margin: '0 0 2px',
                      color: txn.type === 'credit' ? '#15803d' : txn.type === 'debit' ? '#b91c1c' : '#6b7280',
                    }}>
                      {txn.type === 'credit' ? '+' : txn.type === 'debit' ? '-' : ''}
                      ₹{txn.amount?.toLocaleString('en-IN')}
                    </p>
                    {txn.bonusAmount > 0 && (
                      <p style={{ fontSize: 11, color: '#15803d', margin: '0 0 4px' }}>
                        Incl. ₹{txn.bonusAmount?.toLocaleString('en-IN')} bonus
                      </p>
                    )}
                    <StatusBadge status={txn.status} />
                    {txn.status === 'approved' && txn.expiresAt && (
                      <p style={{ fontSize: 11, color: '#9CA3AF', margin: '4px 0 0' }}>
                        Expires: {new Date(txn.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
