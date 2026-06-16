import { useEffect, useRef, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Tag, ListOrdered, Image as ImageIcon } from 'lucide-react'

const empty = { name: '', description: '', displayOrder: 0 }

function inputCls() {
  return 'mt-1.5 w-full bg-gray-50 dark:bg-dark-bg border border-gray-150 dark:border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all duration-200'
}

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
    } finally {
      setSaving(false)
    }
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Categories</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Manage store categories, hierarchy displays, and sorting parameters</p>
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh]">
          <div className="inline-block h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
          <p className="text-xs text-gray-400 dark:text-gray-500">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl">
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No categories found. Click Add Category to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(c => (
            <div key={c._id} className="bg-white dark:bg-dark-card rounded-2xl shadow-xs border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="relative h-44 bg-gray-50 dark:bg-[#181818] border-b border-gray-50 dark:border-white/2 overflow-hidden flex items-center justify-center">
                {c.image?.url ? (
                  <img src={c.image.url} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" />
                ) : (
                  <ImageIcon size={32} className="text-gray-300 dark:text-gray-700" />
                )}
                {/* Category Counter Overlay */}
                <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-dark-card/85 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-2xs">
                  <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">{c.productCount || 0} Products</p>
                </div>
              </div>
              
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate">{c.name}</p>
                  {c.description ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-1 leading-relaxed">{c.description}</p>
                  ) : (
                    <p className="text-xs text-gray-300 dark:text-gray-600 italic mt-1 leading-none">No description</p>
                  )}
                  <p className="text-[10px] text-primary bg-brand-pink dark:bg-primary/10 font-bold tracking-wider uppercase inline-block px-2 py-0.5 rounded-md mt-3">
                    Order Preference: {c.displayOrder}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(c)} className="p-2 bg-gray-50 hover:bg-brand-pink dark:bg-white/2 dark:hover:bg-primary/10 rounded-xl text-gray-500 hover:text-primary transition-all cursor-pointer">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => remove(c)} className="p-2 bg-gray-50 hover:bg-rose-50 dark:bg-white/2 dark:hover:bg-rose-950/20 rounded-xl text-gray-500 hover:text-rose-600 transition-all cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{modal === 'add' ? 'Create Category' : 'Edit Category'}</h3>
              <button 
                onClick={() => setModal(null)} 
                className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl text-gray-400 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Category Name *</label>
                <div className="relative mt-1">
                  <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    placeholder="e.g. Earrings"
                    className={`${inputCls()} pl-10`} 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Description</label>
                <textarea 
                  rows={2} 
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                  placeholder="e.g. Fine handcrafted diamond and gemstone earrings..."
                  className={`${inputCls()} resize-none`} 
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Display Order</label>
                <div className="relative mt-1">
                  <ListOrdered size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input 
                    type="number" 
                    value={form.displayOrder} 
                    onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} 
                    className={`${inputCls()} pl-10`} 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider block mb-1">Cover Image</label>
                <input 
                  ref={fileRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setFile(e.target.files[0])} 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  className="w-full border-2 border-dashed border-gray-250 dark:border-white/10 rounded-2xl py-4 text-xs text-gray-400 dark:text-gray-500 hover:border-primary hover:text-primary dark:hover:text-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-gray-50/20 dark:bg-transparent"
                >
                  <ImageIcon size={16} />
                  <span>{file ? file.name : 'Select cover image'}</span>
                </button>
              </div>

              <button 
                onClick={save} 
                disabled={saving} 
                className="w-full mt-2 bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                {saving ? 'Saving...' : modal === 'add' ? 'Create Category' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
