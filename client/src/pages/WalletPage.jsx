import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react'
import { fetchWallet } from '../store/slices/walletSlice'

function TxnIcon({ type }) {
  if (type === 'credit')  return <ArrowDownLeft size={16} className="text-[#2E7D32]" />
  if (type === 'debit')   return <ArrowUpRight  size={16} className="text-[#E8A0B0]" />
  return <Clock size={16} className="text-[#5C5C5C]" />
}

function StatusBadge({ status }) {
  const map = {
    pending:  { bg: 'rgba(238,107,131,0.1)', color: '#E8A0B0', label: 'Pending Approval' },
    approved: { bg: 'rgba(46,125,50,0.1)', color: '#2E7D32', label: 'Credited' },
    rejected: { bg: 'rgba(238,107,131,0.1)', color: '#E8A0B0', label: 'Rejected' },
    expired:  { bg: 'rgba(107,107,107,0.1)', color: '#5C5C5C', label: 'Expired' },
  }
  const cfg = map[status] || { bg: 'rgba(107,107,107,0.1)', color: '#5C5C5C', label: status }
  return (
    <span className="text-[10px] uppercase tracking-[0.06em] font-medium px-2 py-1 rounded-lg" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

export default function WalletPage() {
  const dispatch = useDispatch()
  const { balance, transactions, loading } = useSelector(s => s.wallet)

  useEffect(() => { dispatch(fetchWallet()) }, [dispatch])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-9 h-10 border-2 border-[#B8976A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-12">
      <div className="max-w-xl mx-auto">

        {/* Heading */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl text-white mb-2 font-light">
            My Wallet
          </h1>
          <p className="text-sm text-[#5C5C5C]">ZYLARA Store Credit</p>
        </div>

        {/* Balance card */}
        <div className="bg-[#141414] border border-[#242424] rounded-2xl p-5 md:p-8 mb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#5C5C5C] mb-3">
            Available Balance
          </p>
          {balance > 0 ? (
            <p className="font-serif text-4xl md:text-5xl text-white mb-2 font-light break-words">
              ₹{balance.toLocaleString('en-IN')}
            </p>
          ) : (
            <p className="text-lg text-[#5C5C5C] mb-2">No balance yet</p>
          )}
          <p className="text-sm text-[#5C5C5C] mb-6">
            Earn more by choosing wallet refund on returns
          </p>
          <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-4 text-left">
            <p className="text-xs text-[#5C5C5C] leading-relaxed">
              Wallet balance can be used on your next purchase.
              Valid for 6 months from credit date.
              Covers up to 80% of any order total.
            </p>
          </div>
        </div>

        {/* Transaction history */}
        <p className="text-xs uppercase tracking-[0.1em] text-[#5C5C5C] mb-4 font-medium">
          Transaction History
        </p>

        {transactions.length === 0 ? (
          <div className="bg-[#141414] border border-[#242424] rounded-2xl p-10 text-center">
            <p className="text-sm text-[#5C5C5C]">No transactions yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {transactions.map((txn, i) => (
              <div key={txn._id || i} className="bg-[#141414] border border-[#242424] rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-[#0A0A0A] rounded-xl">
                      <TxnIcon type={txn.type} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white mb-0.5">
                        {txn.description || (txn.type === 'credit' ? 'Wallet Credit' : 'Wallet Debit')}
                      </p>
                      <p className="text-xs text-[#5C5C5C]">
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold mb-1 ${
                      txn.type === 'credit' ? 'text-[#2E7D32]' : txn.type === 'debit' ? 'text-[#E8A0B0]' : 'text-[#5C5C5C]'
                    }`}>
                      {txn.type === 'credit' ? '+' : txn.type === 'debit' ? '-' : ''}
                      ₹{txn.amount?.toLocaleString('en-IN')}
                    </p>
                    {txn.bonusAmount > 0 && (
                      <p className="text-[10px] text-[#2E7D32] mb-1">
                        Incl. ₹{txn.bonusAmount?.toLocaleString('en-IN')} bonus
                      </p>
                    )}
                    <StatusBadge status={txn.status} />
                    {txn.status === 'approved' && txn.expiresAt && (
                      <p className="text-[10px] text-[#5C5C5C] mt-1">
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
