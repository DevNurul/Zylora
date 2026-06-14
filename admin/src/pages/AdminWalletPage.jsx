import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

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
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wallet Credit Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve wallet credits from return refunds</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Pending Approvals</p>
          <p className="text-3xl font-bold text-gray-900">{credits.length}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Pending Amount</p>
          <p className="text-3xl font-bold text-amber-600">₹{totalPendingAmt.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</p>
          <p className="text-sm text-gray-600 mt-1">{credits.length === 0 ? 'All clear — no pending credits' : 'Action required'}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : credits.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-16 text-center">
          <p className="text-gray-400 text-sm">No pending wallet credit approvals</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Customer','Return ID','Base Amount','Bonus (10%)','Total Credit','Date','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {credits.map(item => (
                <tr key={item.transactionId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{item.userName}</p>
                    <p className="text-xs text-gray-400">{item.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs text-blue-600 hover:underline cursor-pointer"
                      onClick={() => window.open(`/returns/${item.returnId}`, '_blank')}>
                      {item.returnId}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium">₹{item.amount?.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-green-600 font-medium">+₹{item.bonusAmount?.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-gray-900">₹{item.totalCredit?.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">{timeAgo(item.createdAt)}</td>
                  <td className="px-4 py-4">
                    {/* Approve flow */}
                    {confirmId === item.transactionId ? (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-xs text-gray-600 font-medium">Credit ₹{item.totalCredit.toLocaleString('en-IN')} to {item.userName}?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(item)}
                            disabled={actionId === item.transactionId}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {actionId === item.transactionId && <Loader2 size={10} className="animate-spin" />}
                            Confirm
                          </button>
                          <button onClick={() => setConfirmId(null)} className="px-3 py-1 border border-gray-200 text-xs rounded hover:bg-gray-50">Cancel</button>
                        </div>
                      </div>
                    ) : rejectId === item.transactionId ? (
                      <div className="flex flex-col gap-1.5">
                        <input
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Rejection reason..."
                          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-300 w-40"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(item)}
                            disabled={actionId === item.transactionId}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {actionId === item.transactionId && <Loader2 size={10} className="animate-spin" />}
                            Reject
                          </button>
                          <button onClick={() => { setRejectId(null); setRejectReason('') }} className="px-3 py-1 border border-gray-200 text-xs rounded hover:bg-gray-50">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmId(item.transactionId)}
                          className="px-3 py-1.5 border border-green-500 text-green-600 text-xs rounded hover:bg-green-50 transition-colors font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectId(item.transactionId)}
                          className="px-3 py-1.5 border border-red-300 text-red-500 text-xs rounded hover:bg-red-50 transition-colors"
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
      )}
    </div>
  )
}
