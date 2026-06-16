import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { 
  Loader2, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  ArrowUpRight, 
  X, 
  Check 
} from 'lucide-react'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr)
  const m    = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function AdminWalletPage() {
  const [credits,  setCredits]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [actionId, setActionId] = useState(null)   // transactionId being processed

  // inline confirm / reject state
  const [confirmId,   setConfirmId]   = useState(null)
  const [rejectId,    setRejectId]    = useState(null)
  const [rejectReason,setRejectReason]= useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/wallet/pending')
      setCredits(data.pendingCredits || [])
    } catch {
      toast.error('Failed to load pending credits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (item) => {
    setActionId(item.transactionId)
    try {
      await api.patch(`/admin/wallet/${item.userId}/approve`, { transactionId: item.transactionId })
      toast.success(`₹${item.totalCredit.toLocaleString('en-IN')} credited to ${item.userName}`)
      setCredits(prev => prev.filter(c => c.transactionId !== item.transactionId))
      setConfirmId(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Approval failed')
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (item) => {
    setActionId(item.transactionId)
    try {
      await api.patch(`/admin/wallet/${item.userId}/reject`, {
        transactionId: item.transactionId,
        reason:        rejectReason,
      })
      toast.success('Credit rejected')
      setCredits(prev => prev.filter(c => c.transactionId !== item.transactionId))
      setRejectId(null)
      setRejectReason('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Rejection failed')
    } finally {
      setActionId(null)
    }
  }

  const totalPendingAmt = credits.reduce((s, c) => s + c.totalCredit, 0)

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Wallet Approvals</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Review and approve wallet credits from customer returns & refunds.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xs flex items-center justify-between group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pending Approvals</p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2 tracking-tight">{credits.length}</p>
          </div>
          <div className="p-3 bg-brand-light dark:bg-primary/10 text-primary rounded-xl transition-all duration-300 group-hover:scale-105">
            <Clock size={22} className="stroke-[2.2]" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xs flex items-center justify-between group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Pending Value</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-2 tracking-tight">₹{totalPendingAmt.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-xl transition-all duration-300 group-hover:scale-105">
            <Wallet size={22} className="stroke-[2.2]" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xs flex items-center justify-between group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">System Status</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-3">
              {credits.length === 0 ? 'All clear — no actions needed' : 'Attention required'}
            </p>
          </div>
          <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-105 ${
            credits.length === 0 
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' 
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-500'
          }`}>
            {credits.length === 0 ? <CheckCircle2 size={22} className="stroke-[2.2]" /> : <AlertCircle size={22} className="stroke-[2.2]" />}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl shadow-xs">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : credits.length === 0 ? (
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-16 text-center shadow-xs">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">All Caught Up!</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              There are no pending wallet approvals at this moment. Excellent work!
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/75 dark:bg-white/2 border-b border-gray-100 dark:border-white/5">
                <tr>
                  {['Customer', 'Return ID', 'Base Amount', 'Bonus (10%)', 'Total Credit', 'Submitted', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {credits.map(item => (
                  <tr key={item.transactionId} className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                          {item.userName ? item.userName.charAt(0) : <User size={14} />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.userName}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => window.open(`/returns/${item.returnId}`, '_blank')}
                        className="inline-flex items-center gap-1 font-mono text-xs text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded px-2.5 py-1 transition-all font-semibold"
                      >
                        {item.returnId}
                        <ArrowUpRight size={12} className="opacity-60" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700 dark:text-gray-300">
                      ₹{item.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/10">
                        +₹{item.bonusAmount?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-950 dark:text-white text-base">
                      ₹{item.totalCredit?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {timeAgo(item.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {/* Approve confirmation state */}
                      {confirmId === item.transactionId ? (
                        <div className="flex flex-col gap-2 p-2 bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-200/50 dark:border-emerald-500/20 rounded-xl max-w-xs">
                          <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-medium leading-tight">
                            Credit ₹{item.totalCredit.toLocaleString('en-IN')} to customer wallet?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(item)}
                              disabled={actionId === item.transactionId}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1 shadow-sm shadow-emerald-600/10"
                            >
                              {actionId === item.transactionId ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Check size={12} className="stroke-[3]" />
                              )}
                              Yes, Credit
                            </button>
                            <button 
                              onClick={() => setConfirmId(null)} 
                              className="px-2.5 py-1.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all bg-white dark:bg-dark-card"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : rejectId === item.transactionId ? (
                        /* Reject confirmation state */
                        <div className="flex flex-col gap-2 p-2 bg-rose-50/50 dark:bg-rose-500/5 border border-rose-200/50 dark:border-rose-500/20 rounded-xl max-w-xs">
                          <input
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            className="border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 w-full bg-white dark:bg-dark-bg text-gray-900 dark:text-white transition-all"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReject(item)}
                              disabled={actionId === item.transactionId || !rejectReason.trim()}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1 shadow-sm shadow-rose-600/10"
                            >
                              {actionId === item.transactionId ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <X size={12} className="stroke-[3]" />
                              )}
                              Confirm Reject
                            </button>
                            <button 
                              onClick={() => { setRejectId(null); setRejectReason('') }} 
                              className="px-2.5 py-1.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all bg-white dark:bg-dark-card"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Default action buttons */
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setConfirmId(item.transactionId)}
                            className="px-3 py-1.5 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectId(item.transactionId)}
                            className="px-3 py-1.5 border border-rose-200 dark:border-white/10 text-rose-500 text-xs rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
