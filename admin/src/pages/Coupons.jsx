import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Ticket, Calendar, ShoppingBag, ShieldCheck, Percent, HelpCircle } from 'lucide-react'

const empty = { code: '', discountType: 'percentage', discountValue: '', minOrderValue: 0, maxUses: '', expiresAt: '', isActive: true }

function inputCls() {
  return 'mt-1.5 w-full bg-gray-50 dark:bg-dark-bg border border-gray-150 dark:border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all duration-200'
}

export default function Coupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/coupons')
      setCoupons(data.coupons)
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(empty); setEditId(null); setModal('add') }
  const openEdit = (c) => {
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      minOrderValue: c.minOrderValue, maxUses: c.maxUses ?? '',
      expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '',
      isActive: c.isActive,
    })
    setEditId(c._id); setModal('edit')
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = { ...form, maxUses: form.maxUses === '' ? null : Number(form.maxUses), expiresAt: form.expiresAt || null }
      if (modal === 'add') {
        await api.post('/admin/coupons', payload)
        toast.success('Coupon created')
      } else {
        await api.put(`/admin/coupons/${editId}`, payload)
        toast.success('Coupon updated')
      }
      setModal(null); load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (c) => {
    if (!confirm(`Delete coupon "${c.code}"?`)) return
    try {
      await api.delete(`/admin/coupons/${c._id}`)
      toast.success('Deleted'); load()
    } catch { toast.error('Delete failed') }
  }

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Coupons</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Manage store discounts, purchase coupon codes, and customer reward offers</p>
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {/* Coupons grid cards layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh]">
          <div className="inline-block h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
          <p className="text-xs text-gray-400 dark:text-gray-500">Loading coupons...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl">
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No coupons active. Click Add Coupon to launch a promo campaign.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map(c => {
            const hasLimit = c.maxUses !== null
            const usePercentage = hasLimit ? (c.usedCount / c.maxUses) * 100 : 0
            
            return (
              <div key={c._id} className="relative bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col justify-between shadow-xs transition-all duration-300 hover:shadow-md">
                
                {/* Coupon Details (Ticket style top section) */}
                <div className="p-6 pb-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-brand-pink dark:bg-primary/10 border border-primary/20 rounded-xl px-3 py-1 text-primary flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider">
                      <Ticket size={14} /> {c.code}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      c.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                        : 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-white/2 dark:border-white/5'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-gray-600'}`} />
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-serif font-black text-gray-900 dark:text-white leading-none">
                      {c.discountValue}{c.discountType === 'percentage' ? '%' : ' ₹'} OFF
                    </h3>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 uppercase font-bold tracking-wider">
                      Min Purchase: ₹{c.minOrderValue}
                    </p>
                  </div>

                  {/* Usage stats bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                      <span>Usage Statistics</span>
                      <span>{c.usedCount} / {c.maxUses ?? '∞'} uses</span>
                    </div>
                    {hasLimit ? (
                      <div className="w-full h-1.5 bg-gray-50 dark:bg-[#181818] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, usePercentage)}%` }} 
                        />
                      </div>
                    ) : (
                      <div className="w-full h-1.5 bg-gray-50 dark:bg-[#181818] rounded-full overflow-hidden">
                        <div className="h-full bg-[#C9A96E] rounded-full w-[35%] animate-pulse-soft" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Ticket dash divider lines */}
                <div className="relative flex items-center py-1 select-none">
                  {/* Left notch */}
                  <span className="absolute left-[-8px] h-4 w-4 bg-gray-50 dark:bg-dark-bg border-r border-gray-100 dark:border-white/5 rounded-full z-10" />
                  {/* Center dashed line */}
                  <span className="h-px border-t border-dashed border-gray-150 dark:border-white/5 w-full mx-3" />
                  {/* Right notch */}
                  <span className="absolute right-[-8px] h-4 w-4 bg-gray-50 dark:bg-dark-bg border-l border-gray-100 dark:border-white/5 rounded-full z-10" />
                </div>

                {/* Card footer (Ticket style bottom section) */}
                <div className="p-5 pt-3 flex items-center justify-between bg-gray-50/20 dark:bg-white/1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-semibold">
                    <Calendar size={13} />
                    <span>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN', { dateStyle: 'short' }) : 'Never Expires'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(c)} className="p-2 bg-white dark:bg-dark-card hover:bg-brand-pink dark:hover:bg-primary/10 rounded-xl text-gray-500 hover:text-primary border border-gray-100 dark:border-white/5 transition-all shadow-3xs cursor-pointer">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => remove(c)} className="p-2 bg-white dark:bg-dark-card hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-gray-400 hover:text-rose-600 border border-gray-100 dark:border-white/5 transition-all shadow-3xs cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{modal === 'add' ? 'Create Coupon' : 'Edit Coupon'}</h3>
              <button 
                onClick={() => setModal(null)} 
                className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl text-gray-400 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Coupon Code *</label>
                <div className="relative mt-1">
                  <Ticket size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input 
                    value={form.code} 
                    onChange={e => f('code', e.target.value.toUpperCase())} 
                    placeholder="e.g. SAVE20" 
                    className={`${inputCls()} pl-10 font-mono tracking-wider`} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Discount Type</label>
                  <select 
                    value={form.discountType} 
                    onChange={e => f('discountType', e.target.value)} 
                    className={inputCls()}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Cash (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Value *</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">{form.discountType === 'percentage' ? '%' : '₹'}</span>
                    <input 
                      type="number" 
                      value={form.discountValue} 
                      onChange={e => f('discountValue', e.target.value)} 
                      placeholder="e.g. 20"
                      className={`${inputCls()} pl-8`} 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Min Purchase (₹)</label>
                  <div className="relative mt-1">
                    <ShoppingBag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="number" 
                      value={form.minOrderValue} 
                      onChange={e => f('minOrderValue', e.target.value)} 
                      className={`${inputCls()} pl-9`} 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Max Allowed Uses</label>
                  <div className="relative mt-1">
                    <Percent size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="number" 
                      value={form.maxUses} 
                      onChange={e => f('maxUses', e.target.value)} 
                      placeholder="e.g. 100"
                      className={`${inputCls()} pl-9`} 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Expiry Date</label>
                <div className="relative mt-1">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="date" 
                    value={form.expiresAt} 
                    onChange={e => f('expiresAt', e.target.value)} 
                    className={`${inputCls()} pl-9`} 
                  />
                </div>
              </div>

              <div className="py-2.5">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.isActive} 
                    onChange={e => f('isActive', e.target.checked)} 
                    className="w-4 h-4 rounded-md accent-primary border-gray-300 cursor-pointer" 
                  />
                  Active & Available for checkout
                </label>
              </div>

              <button 
                onClick={save} 
                disabled={saving} 
                className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                {saving ? 'Creating Promo...' : modal === 'add' ? 'Create Coupon Offer' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
