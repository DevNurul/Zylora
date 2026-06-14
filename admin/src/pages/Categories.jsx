import { useEffect, useRef, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

const empty = { name: '', description: '', displayOrder: 0 }

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState(null)
  const fileRef = useRef()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/categories')
      setCategories(data.categories)
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(empty); setFile(null); setEditId(null); setModal('add') }
  const openEdit = (c) => {
    setForm({ name: c.name, description: c.description || '', displayOrder: c.displayOrder })
    setFile(null); setEditId(c._id); setModal('edit')
  }

  const save = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append('image', file)
      if (modal === 'add') {
        await api.post('/admin/categories', fd)
        toast.success('Category created')
      } else {
        await api.put(`/admin/categories/${editId}`, fd)
        toast.success('Category updated')
      }
      setModal(null); load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  const remove = async (c) => {
    if (!confirm(`Delete "${c.name}"?`)) return
    try {
      await api.delete(`/admin/categories/${c._id}`)
      toast.success('Deleted'); load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed')
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#C9A96E] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#b8935a]">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p className="text-gray-400">Loading...</p> : categories.map(c => (
          <div key={c._id} className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
            {c.image?.url && <img src={c.image.url} alt={c.name} className="w-full h-40 object-cover" />}
            <div className="p-4 flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.productCount} products · Order {c.displayOrder}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#C9A96E]"><Pencil size={14} /></button>
                <button onClick={() => remove(c)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-bold text-lg">{modal === 'add' ? 'Add Category' : 'Edit Category'}</h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Display Order</label>
                <input type="number" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="mt-1 block text-sm text-gray-500" />
              </div>
              <button onClick={save} disabled={saving} className="w-full bg-[#C9A96E] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#b8935a] disabled:opacity-60">
                {saving ? 'Saving...' : modal === 'add' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
