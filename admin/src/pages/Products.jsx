import { useEffect, useRef, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight, ImagePlus } from 'lucide-react'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const empty = {
  name: '', description: '', price: '', originalPrice: '', category: '',
  sizes: [], sizeStock: {}, stock: '',
  colors: '', isFeatured: false, isNew: false, tags: '',
}

function inputCls() {
  return 'mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]'
}

function Label({ children }) {
  return <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{children}</label>
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

  const load = async () => {
    setLoading(true)
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/admin/products', { params: { page } }),
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
      sizes: p.sizes || [],
      sizeStock: p.sizeStock || {},
      stock: p.stock || '',
      colors: (p.colors || []).join(', '),
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

  const toggleSize = (s) => setForm(f => {
    const hasSizeNow = f.sizes.includes(s)
    const newSizes = hasSizeNow ? f.sizes.filter(x => x !== s) : [...f.sizes, s]
    const newSizeStock = { ...f.sizeStock }
    if (hasSizeNow) {
      delete newSizeStock[s]
    } else {
      if (newSizeStock[s] === undefined) newSizeStock[s] = 0
    }
    return { ...f, sizes: newSizes, sizeStock: newSizeStock }
  })

  const setSizeQty = (size, val) => setForm(f => ({
    ...f,
    sizeStock: { ...f.sizeStock, [size]: Math.max(0, Number(val) || 0) },
  }))

  const totalSizeStock = Object.values(form.sizeStock).reduce((a, b) => a + (Number(b) || 0), 0)

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
        if (k === 'sizes') {
          fd.append(k, JSON.stringify(v))
        } else if (k === 'colors') {
          fd.append(k, JSON.stringify(v.split(',').map(s => s.trim()).filter(Boolean)))
        } else if (k === 'tags') {
          fd.append(k, JSON.stringify(v.split(',').map(s => s.trim()).filter(Boolean)))
        } else if (k === 'sizeStock') {
          if (form.sizes.length > 0) fd.append('sizeStock', JSON.stringify(v))
        } else if (k === 'stock') {
          if (form.sizes.length === 0) fd.append('stock', v || 0)
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Products <span className="text-gray-400 text-lg font-normal">({total})</span>
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#C9A96E] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#b8935a] transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Image', 'Name', 'Category', 'Price', 'Stock', 'Sizes', 'Active', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : products.map((p) => {
              const hasSizeStock = p.sizeStock && Object.keys(p.sizeStock).length > 0
              return (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {p.images?.[0] ? (
                      <img src={p.images[0].url} alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-gray-400 text-xs">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 font-semibold">₹{p.price}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {hasSizeStock ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(p.sizeStock).map(([size, qty]) => (
                          <span
                            key={size}
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              qty === 0 ? 'bg-red-50 text-red-400' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {size}:{qty}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(p)}>
                      {p.isActive
                        ? <ToggleRight size={22} className="text-green-500" />
                        : <ToggleLeft size={22} className="text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#C9A96E]">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => remove(p)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4 gap-2">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40">Prev</button>
        <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40">Next</button>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <Label>Name *</Label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls()}
                  placeholder="Product name"
                />
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={inputCls()}
                  placeholder="Product description"
                />
              </div>

              {/* Price + Original Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (₹) *</Label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className={inputCls()}
                    placeholder="999"
                  />
                </div>
                <div>
                  <Label>Original Price (₹)</Label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                    className={inputCls()}
                    placeholder="1499 (for strike-through)"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <Label>Category *</Label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className={inputCls()}
                >
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              {/* Sizes */}
              <div>
                <Label>Sizes</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {SIZES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        form.sizes.includes(s)
                          ? 'bg-[#C9A96E] text-white border-[#C9A96E]'
                          : 'border-gray-200 text-gray-600 hover:border-[#C9A96E]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Per-size stock — shown only when sizes are selected */}
              {form.sizes.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Stock per Size</Label>
                    <span className="text-xs text-gray-500">
                      Total: <span className="font-semibold text-gray-800">{totalSizeStock}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {form.sizes.map(size => (
                      <div key={size} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200">
                          <span className="text-xs font-bold text-gray-600">{size}</span>
                        </div>
                        <div className="flex items-center px-3 py-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSizeQty(size, (form.sizeStock[size] || 0) - 1)}
                            className="text-gray-400 hover:text-gray-700 font-bold text-base leading-none w-5 text-center"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={form.sizeStock[size] ?? 0}
                            onChange={e => setSizeQty(size, e.target.value)}
                            className="flex-1 text-sm text-center focus:outline-none w-full"
                          />
                          <button
                            type="button"
                            onClick={() => setSizeQty(size, (form.sizeStock[size] || 0) + 1)}
                            className="text-gray-400 hover:text-gray-700 font-bold text-base leading-none w-5 text-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalSizeStock === 0 && (
                    <p className="text-xs text-orange-500 mt-2">⚠ All sizes have 0 stock — product will appear as sold out.</p>
                  )}
                </div>
              ) : (
                <div>
                  <Label>Total Stock</Label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    className={inputCls()}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">Select sizes above to set stock per size instead.</p>
                </div>
              )}

              {/* Colors + Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Colors (comma separated)</Label>
                  <input
                    value={form.colors}
                    onChange={e => setForm(f => ({ ...f, colors: e.target.value }))}
                    placeholder="Black, White, Red"
                    className={inputCls()}
                  />
                </div>
                <div>
                  <Label>Tags (comma separated)</Label>
                  <input
                    value={form.tags}
                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="summer, casual"
                    className={inputCls()}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                    className="accent-[#C9A96E]"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))}
                    className="accent-[#C9A96E]"
                  />
                  New Arrival
                </label>
              </div>

              {/* Images */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>Images (max 5)</Label>
                  <span className="text-xs text-gray-400">{files.length} new selected</span>
                </div>

                {/* Existing images — shown in edit mode when no new files chosen yet */}
                {modal === 'edit' && editImages.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1.5">Current images {files.length > 0 ? '(will be replaced)' : ''}:</p>
                    <div className="flex flex-wrap gap-2">
                      {editImages.map((img, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New file previews */}
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {files.map((f, i) => (
                      <div key={i} className="relative group w-16 h-16">
                        <img
                          src={URL.createObjectURL(f)}
                          alt=""
                          className="w-full h-full object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewFile(i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload trigger */}
                {files.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current.click()}
                    className="mt-2 w-full border-2 border-dashed border-gray-200 rounded-lg py-3 text-sm text-gray-400 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors flex items-center justify-center gap-2"
                  >
                    <ImagePlus size={15} />
                    {files.length === 0 ? 'Click to upload images' : `Add more (${5 - files.length} remaining)`}
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
                {modal === 'edit' && files.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">Leave empty to keep current images.</p>
                )}
              </div>

              <button
                onClick={save}
                disabled={saving}
                className="w-full bg-[#C9A96E] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#b8935a] transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : modal === 'add' ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
