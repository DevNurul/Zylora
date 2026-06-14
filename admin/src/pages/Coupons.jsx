import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

const empty = { code: '', discountType: 'percentage', discountValue: '', minOrderValue: 0, maxUses: '', expiresAt: '', isActive: true }

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
    } finally { setSaving(false) }
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Coupons</h2>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#C9A96E] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#b8935a]">
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Code', 'Discount', 'Min Order', 'Uses', 'Expires', 'Active', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : coupons.map(c => (
              <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-gray-900">{c.code}</td>
                <td className="px-4 py-3">{c.discountValue}{c.discountType === 'percentage' ? '%' : '₹'} off</td>
                <td className="px-4 py-3">₹{c.minOrderValue}</td>
                <td className="px-4 py-3">{c.usedCount}/{c.maxUses ?? '∞'}</td>
                <td className="px-4 py-3 text-gray-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block w-2 h-2 rounded-full ${c.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#C9A96E]"><Pencil size={15} /></button>
                    <button onClick={() => remove(c)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-bold text-lg">{modal === 'add' ? 'Add Coupon' : 'Edit Coupon'}</h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Code *</label>
                <input value={form.code} onChange={e => f('code', e.target.value.toUpperCase())} placeholder="e.g. SAVE20" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
                  <select value={form.discountType} onChange={e => f('discountType', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Value *</label>
                  <input type="number" value={form.discountValue} onChange={e => f('discountValue', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Order (₹)</label>
                  <input type="number" value={form.minOrderValue} onChange={e => f('minOrderValue', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Uses (blank = unlimited)</label>
                  <input type="number" value={form.maxUses} onChange={e => f('maxUses', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires At (blank = never)</label>
                <input type="date" value={form.expiresAt} onChange={e => f('expiresAt', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} className="accent-[#C9A96E]" />
                Active
              </label>
              <button onClick={save} disabled={saving} className="w-full bg-[#C9A96E] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#b8935a] disabled:opacity-60">
                {saving ? 'Saving...' : modal === 'add' ? 'Create Coupon' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
