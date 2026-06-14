import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Settings() {
  const [form, setForm] = useState({
    storeName: '', tagline: '', contactEmail: '', contactPhone: '',
    shippingCharge: '', freeShippingThreshold: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => {
      const s = data.settings
      setForm({
        storeName: s.storeName || '',
        tagline: s.tagline || '',
        contactEmail: s.contactEmail || '',
        contactPhone: s.contactPhone || '',
        shippingCharge: s.shippingCharge,
        freeShippingThreshold: s.freeShippingThreshold,
      })
    }).catch(() => toast.error('Failed to load settings')).finally(() => setLoading(false))
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/admin/settings', form)
      toast.success('Settings saved')
    } catch {
      toast.error('Save failed')
    } finally { setSaving(false) }
  }

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

      <form onSubmit={save} className="bg-white rounded-xl shadow-sm border border-black/5 p-6 space-y-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Store Info</p>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Store Name</label>
          <input value={form.storeName} onChange={e => f('storeName', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tagline</label>
          <input value={form.tagline} onChange={e => f('tagline', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Email</label>
          <input type="email" value={form.contactEmail} onChange={e => f('contactEmail', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Phone</label>
          <input value={form.contactPhone} onChange={e => f('contactPhone', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
        </div>

        <hr className="border-gray-100" />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Shipping</p>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shipping Charge (₹)</label>
          <input type="number" value={form.shippingCharge} onChange={e => f('shippingCharge', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
          <p className="text-xs text-gray-400 mt-1">Applied when order is below the free shipping threshold</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Free Shipping Threshold (₹)</label>
          <input type="number" value={form.freeShippingThreshold} onChange={e => f('freeShippingThreshold', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
          <p className="text-xs text-gray-400 mt-1">Orders above this amount get free shipping</p>
        </div>

        <button type="submit" disabled={saving} className="w-full bg-[#C9A96E] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#b8935a] transition-colors disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
