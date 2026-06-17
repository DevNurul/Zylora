import { useEffect, useRef, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight, ImagePlus, Grid, List, Search, ChevronDown, Check, Sparkles, Tag as TagIcon, Eye, EyeOff } from 'lucide-react'
import Badge from '../components/Badge'

const empty = {
  name: '', description: '', price: '', originalPrice: '', category: '',
  stock: '',
  isFeatured: false, isNew: false, tags: '',
}

function inputCls() {
  return 'mt-1.5 w-full bg-gray-50 dark:bg-dark-bg border border-gray-150 dark:border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all duration-200'
}

function Label({ children }) {
  return <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">{children}</label>
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [files, setFiles] = useState([])
  const [editImages, setEditImages] = useState([])
  const fileRef = useRef()

  // Redesign state additions
  const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = { page }
      const [pRes, cRes] = await Promise.all([
        api.get('/admin/products', { params }),
        api.get('/admin/categories'),
      ])
      setProducts(pRes.data.products)
      setTotal(pRes.data.total)
      setTotalPages(pRes.data.totalPages)
      setCategories(cRes.data.categories)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  const openAdd = () => { setForm(empty); setFiles([]); setEditImages([]); setEditId(null); setModal('add') }

  const openEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice || '',
      category: p.category?._id || '',
      stock: p.stock || '',
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      tags: (p.tags || []).join(', '),
    })
    setFiles([])
    setEditImages(p.images || [])
    setEditId(p._id)
    setModal('edit')
  }

  const compressImage = (file) => new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX = 1200
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX }
        else { width = Math.round(width * MAX / height); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })),
        'image/jpeg', 0.82
      )
    }
    img.src = url
  })

  const addFiles = async (newFiles) => {
    if (files.length + newFiles.length > 5) {
      toast.error('Maximum 5 images allowed')
      fileRef.current.value = ''
      return
    }
    const compressed = await Promise.all(Array.from(newFiles).map(compressImage))
    setFiles(f => [...f, ...compressed])
    fileRef.current.value = ''
  }

  const removeNewFile = (index) => setFiles(f => f.filter((_, i) => i !== index))

  const save = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error('Name and price are required')
      return
    }
    if (!form.category) {
      toast.error('Please select a category')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'tags') {
          fd.append(k, JSON.stringify(v.split(',').map(s => s.trim()).filter(Boolean)))
        } else {
          fd.append(k, v)
        }
      })
      files.forEach(f => fd.append('images', f))

      if (modal === 'add') {
        await api.post('/admin/products', fd)
        toast.success('Product created')
      } else {
        await api.put(`/admin/products/${editId}`, fd)
        toast.success('Product updated')
      }
      setModal(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return
    try {
      await api.delete(`/admin/products/${p._id}`)
      toast.success('Product deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const toggle = async (p) => {
    try {
      await api.patch(`/admin/products/${p._id}/toggle`)
      toast.success(`Product ${p.isActive ? 'deactivated' : 'activated'}`)
      load()
    } catch {
      toast.error('Toggle failed')
    }
  }

  // Filter products locally for search / category selection
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory ? p.category?._id === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Products <span className="text-gray-400 dark:text-gray-500 text-lg font-normal">({total})</span>
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Manage jewelry stock levels, sizing, pricing models, and active listing statuses</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters & Grid/List toggler panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search product name..."
              className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
            />
          </div>
          
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="appearance-none bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-white/5 rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* View mode buttons */}
        <div className="flex items-center gap-1 border border-gray-100 dark:border-white/5 p-1 rounded-xl bg-gray-50 dark:bg-[#181818]">
          <button 
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-dark-card text-primary shadow-2xs' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
            title="List View"
          >
            <List size={16} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-dark-card text-primary shadow-2xs' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
            title="Grid View"
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {/* Render View Mode */}
      {viewMode === 'table' ? (
        /* ── Table View ── */
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xs border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-[#181818] border-b border-gray-100 dark:border-white/5">
                <tr>
                  {['Image', 'Product Detail', 'Category', 'Price', 'Inventory Status', 'Listing Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/2">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="inline-block h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
                      <p className="text-xs text-gray-400 dark:text-gray-500">Loading products...</p>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-gray-400 dark:text-gray-500 font-medium">No products found.</td>
                  </tr>
                ) : filteredProducts.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-white/1 transition-colors">
                      <td className="px-6 py-4">
                        {p.images?.[0] ? (
                          <img src={p.images[0].url} alt={p.name} className="w-12 h-12 object-cover rounded-xl border border-gray-100 dark:border-white/5" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400"><Plus size={16} /></div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white leading-tight">{p.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-mono tracking-wider">{p.slug}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">{p.category?.name || '—'}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">₹{p.price}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.stock === 0 
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' 
                            : p.stock <= 5 
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' 
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.stock === 0 
                              ? 'bg-rose-500' 
                              : p.stock <= 5 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                          }`} />
                          {p.stock === 0 ? 'Out of stock' : `${p.stock} remaining`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggle(p)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer">
                          {p.isActive
                            ? <ToggleRight size={26} className="text-primary" />
                            : <ToggleLeft size={26} className="text-gray-300 dark:text-gray-700" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(p)} className="p-2 bg-gray-50 hover:bg-brand-pink dark:bg-white/2 dark:hover:bg-primary/10 rounded-xl text-gray-500 hover:text-primary transition-all cursor-pointer">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => remove(p)} className="p-2 bg-gray-50 hover:bg-rose-50 dark:bg-white/2 dark:hover:bg-rose-950/20 rounded-xl text-gray-500 hover:text-rose-600 transition-all cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Grid Cards View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <div className="inline-block h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
              <p className="text-xs text-gray-400 dark:text-gray-500">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400 dark:text-gray-500 font-medium">No products found.</div>
          ) : filteredProducts.map((p) => (
            <div key={p._id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-xs flex flex-col group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-[#181818] border-b border-gray-50 dark:border-white/2 flex items-center justify-center">
                {p.images?.[0] ? (
                  <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                ) : (
                  <Package size={32} className="text-gray-300" />
                )}
                {/* Active Switch overlay */}
                <div className="absolute top-3 right-3 z-10">
                  <button onClick={() => toggle(p)} className="bg-white/80 dark:bg-dark-card/85 backdrop-blur-xs p-1.5 rounded-xl shadow-xs transition-colors text-gray-500 hover:text-gray-800 cursor-pointer">
                    {p.isActive ? <ToggleRight size={24} className="text-primary" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
                {/* Featured / New flags */}
                <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1.5">
                  {p.isFeatured && (
                    <span className="bg-primary text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-0.5">
                      <Sparkles size={8} /> Featured
                    </span>
                  )}
                  {p.isNew && (
                    <span className="bg-[#C9A96E] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                      New
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-primary bg-brand-pink dark:bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {p.category?.name || 'Accessories'}
                  </span>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-tight truncate mt-1.5">{p.name}</h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{p.slug}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-white/5">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500">Retail Price</span>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">₹{p.price}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500">Stock Count</span>
                    <p className={`text-xs font-bold ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-500' : 'text-emerald-500'}`}>{p.stock} units</p>
                  </div>
                </div>

                {/* Edit overlay on hover / quick actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button 
                    onClick={() => openEdit(p)}
                    className="flex-1 bg-gray-50 hover:bg-brand-pink dark:bg-white/2 dark:hover:bg-primary/10 text-gray-600 dark:text-gray-300 hover:text-primary py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Pencil size={12} /> Edit Details
                  </button>
                  <button 
                    onClick={() => remove(p)}
                    className="bg-gray-50 hover:bg-rose-50 dark:bg-white/2 dark:hover:bg-rose-950/20 p-2 rounded-xl text-gray-400 hover:text-rose-500 transition-all cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination controls for grid view */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-6 gap-2 text-xs font-semibold">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-xl hover:bg-gray-50 disabled:opacity-40 shadow-2xs transition-colors cursor-pointer text-gray-600 dark:text-gray-400">Prev</button>
          <span className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-xl text-gray-900 dark:text-white shadow-2xs">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-xl hover:bg-gray-50 disabled:opacity-40 shadow-2xs transition-colors cursor-pointer text-gray-600 dark:text-gray-400">Next</button>
        </div>
      )}

      {/* ── Add/Edit Modal Redesign ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-white/5 flex flex-col no-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5 sticky top-0 bg-white dark:bg-dark-card z-10">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">{modal === 'add' ? 'New Product' : 'Product Mod'}</span>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mt-0.5">{modal === 'add' ? 'Add Product Listing' : 'Edit Product Details'}</h3>
              </div>
              <button 
                onClick={() => setModal(null)}
                className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl text-gray-400 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Product Info section */}
              <div className="space-y-4">
                <div>
                  <Label>Product Name *</Label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className={inputCls()}
                    placeholder="e.g. Sterling Silver Diamond Ring"
                  />
                </div>

                <div>
                  <Label>Marketing Description</Label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className={`${inputCls()} resize-none`}
                    placeholder="Describe the craftsmanship, materials, dimensions, and styling guides..."
                  />
                </div>
              </div>

              {/* Price Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Retail Price (₹) *</Label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className={inputCls()}
                    placeholder="2999"
                  />
                </div>
                <div>
                  <Label>Original Price (₹)</Label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                    className={inputCls()}
                    placeholder="e.g. 4500 (strikes price comparison)"
                  />
                </div>
              </div>

              {/* Product Category Selection */}
              <div>
                <Label>Store Category *</Label>
                <div className="relative mt-1">
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full appearance-none bg-gray-50 dark:bg-dark-bg border border-gray-150 dark:border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white cursor-pointer"
                  >
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Stock Management */}
              <div>
                <Label>Total Inventory Count</Label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  className={inputCls()}
                  placeholder="0"
                />
              </div>

              {/* Tags */}
              <div>
                <Label>Tags (Comma separated)</Label>
                <input
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="e.g. rings, gift, diamond"
                  className={inputCls()}
                />
              </div>

              {/* Badges toggler */}
              <div className="flex items-center gap-6 py-2">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                    className="w-4 h-4 rounded-md border-gray-300 dark:border-white/5 accent-primary cursor-pointer"
                  />
                  Featured Listing
                </label>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))}
                    className="w-4 h-4 rounded-md border-gray-300 dark:border-white/5 accent-primary cursor-pointer"
                  />
                  New Arrival
                </label>
              </div>

              {/* Product Images Media File Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Images Upload (Max 5)</Label>
                  <span className="text-[10px] text-gray-400 font-bold">{files.length} selected</span>
                </div>

                {/* Existing items previews */}
                {modal === 'edit' && editImages.length > 0 && (
                  <div className="bg-gray-50/50 dark:bg-white/1 border border-gray-100 dark:border-white/2 rounded-2xl p-3">
                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-2">Stored Product Media {files.length > 0 ? '(will be replaced)' : ''}:</p>
                    <div className="flex flex-wrap gap-2.5">
                      {editImages.map((img, i) => (
                        <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-gray-150 dark:border-white/5 shadow-2xs">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New local items previews */}
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mt-2">
                    {files.map((f, i) => (
                      <div key={i} className="relative group w-16 h-16">
                        <img
                          src={URL.createObjectURL(f)}
                          alt=""
                          className="w-full h-full object-cover rounded-xl border border-gray-150 dark:border-white/5"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewFile(i)}
                          className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer shadow-xs border border-white dark:border-dark-card"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload drag block */}
                {files.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current.click()}
                    className="w-full border-2 border-dashed border-gray-250 dark:border-white/10 rounded-2xl py-5 text-xs text-gray-400 dark:text-gray-500 hover:border-primary hover:text-primary dark:hover:text-primary transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-gray-50/20 dark:bg-transparent"
                  >
                    <ImagePlus size={22} className="stroke-[1.8]" />
                    <span>{files.length === 0 ? 'Upload product photos' : `Add more images (${5 - files.length} left)`}</span>
                  </button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={e => addFiles(e.target.files)}
                  className="hidden"
                />
              </div>

              <button
                onClick={save}
                disabled={saving}
                className="w-full mt-4 bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                {saving ? 'Creating Product...' : modal === 'add' ? 'Create Product Listing' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
