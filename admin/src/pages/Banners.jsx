import { useEffect, useRef, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react'

const empty = { title: '', subtitle: '', ctaText: '', ctaLink: '', displayOrder: 0 }

export default function Banners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const fileRef = useRef()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/banners')
      setBanners(data.banners)
    } catch { toast.error('Failed to load banners') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setForm(empty); setFile(null); setImageUrl(''); setEditId(null); setModal('add')
  }
  const openEdit = (b) => {
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      ctaText: b.ctaText || '',
      ctaLink: b.ctaLink || '',
      displayOrder: b.displayOrder ?? 0,
    })
    setFile(null); setImageUrl(''); setEditId(b._id); setModal('edit')
  }

  const save = async () => {
    if (modal === 'add' && !file && !imageUrl.trim()) {
      toast.error('Please upload an image or provide an image URL')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (file) {
        fd.append('image', file)
      } else if (imageUrl.trim()) {
        fd.append('imageUrl', imageUrl.trim())
      }

      if (modal === 'add') {
        await api.post('/admin/banners', fd)
        toast.success('Banner created')
      } else {
        await api.put(`/admin/banners/${editId}`, fd)
        toast.success('Banner updated')
      }
      setModal(null); load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  const remove = async (b) => {
    if (!confirm('Delete this banner?')) return
    try {
      await api.delete(`/admin/banners/${b._id}`)
      toast.success('Deleted'); load()
    } catch { toast.error('Delete failed') }
  }

  const toggle = async (b) => {
    try {
      await api.patch(`/admin/banners/${b._id}/toggle`)
      toast.success('Updated'); load()
    } catch { toast.error('Failed') }
  }

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Banners</h2>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#C9A96E] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#b8935a]">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : banners.length === 0 ? (
          <p className="text-gray-400">No banners yet. Add one above.</p>
        ) : banners.map(b => (
          <div key={b._id} className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
            {b.image?.url && (
              <img src={b.image.url} alt={b.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4 flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{b.title}</p>
                {b.subtitle && <p className="text-xs text-gray-500 mt-0.5">{b.subtitle}</p>}
                {b.ctaText && (
                  <p className="text-xs text-[#C9A96E] mt-1">CTA: {b.ctaText} → {b.ctaLink}</p>
                )}
                <p className="text-xs text-gray-300 mt-1">Order: {b.displayOrder}</p>
              </div>
              <div className="flex gap-1 items-center">
                <button onClick={() => toggle(b)}>
                  {b.isActive
                    ? <ToggleRight size={22} className="text-green-500" />
                    : <ToggleLeft size={22} className="text-gray-300" />}
                </button>
                <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#C9A96E]">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(b)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-lg">{modal === 'add' ? 'Add Banner' : 'Edit Banner'}</h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title *</label>
                <input value={form.title} onChange={e => f('title', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtitle</label>
                <input value={form.subtitle} onChange={e => f('subtitle', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Button Text</label>
                  <input value={form.ctaText} onChange={e => f('ctaText', e.target.value)} placeholder="Shop Now" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Button Link</label>
                  <input value={form.ctaLink} onChange={e => f('ctaLink', e.target.value)} placeholder="/products" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Display Order</label>
                <input type="number" value={form.displayOrder} onChange={e => f('displayOrder', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
              </div>

              {/* Image — file upload OR direct URL */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Image {modal === 'add' ? '*' : '(leave blank to keep current)'}
                </label>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Upload file (via Cloudinary):</p>
                  <input ref={fileRef} type="file" accept="image/*"
                    onChange={e => { setFile(e.target.files[0]); setImageUrl('') }}
                    className="block text-sm text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">— or paste an image URL:</p>
                  <input
                    value={imageUrl}
                    onChange={e => { setImageUrl(e.target.value); setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]"
                  />
                </div>
              </div>

              <button onClick={save} disabled={saving}
                className="w-full bg-[#C9A96E] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#b8935a] disabled:opacity-60">
                {saving ? 'Saving...' : modal === 'add' ? 'Create Banner' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
