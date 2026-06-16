import { useEffect, useRef, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight, Laptop, Smartphone, Image as ImageIcon, Link2, ListOrdered } from 'lucide-react'

const empty = { title: '', subtitle: '', ctaText: '', ctaLink: '', displayOrder: 0 }

function inputCls() {
  return 'mt-1.5 w-full bg-gray-50 dark:bg-dark-bg border border-gray-150 dark:border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all duration-200'
}

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

  // Track preview modes per banner card (default is desktop)
  const [previewModes, setPreviewModes] = useState({})

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
    } finally {
      setSaving(false)
    }
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

  const setPreviewMode = (bannerId, mode) => {
    setPreviewModes(prev => ({ ...prev, [bannerId]: mode }))
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Banners</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Manage homepage advertisements, promotional slider elements, and CTA navigation</p>
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Banner list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh]">
          <div className="inline-block h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
          <p className="text-xs text-gray-400 dark:text-gray-500">Loading banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl">
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No active banners. Click Add Banner to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {banners.map(b => {
            const currentMode = previewModes[b._id] || 'desktop'
            return (
              <div key={b._id} className="bg-white dark:bg-dark-card rounded-2xl shadow-xs border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-md">
                
                {/* Visual Banner Preview section */}
                <div className="relative bg-gray-50 dark:bg-[#151515] border-b border-gray-50 dark:border-white/2 flex items-center justify-center p-4 min-h-[220px]">
                  {b.image?.url ? (
                    currentMode === 'desktop' ? (
                      /* Desktop Mockup Frame */
                      <div className="w-full aspect-[21/9] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-xs relative">
                        <img src={b.image.url} alt={b.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/25 flex flex-col justify-center px-6 text-left text-white">
                          <span className="text-[8px] tracking-[0.2em] font-bold text-white/80 uppercase">{b.subtitle}</span>
                          <h4 className="font-serif text-sm font-bold mt-1 line-clamp-2 leading-tight">{b.title}</h4>
                        </div>
                      </div>
                    ) : (
                      /* Mobile Mockup Frame */
                      <div className="w-[120px] aspect-[9/16] rounded-xl overflow-hidden border-[3px] border-gray-800 dark:border-gray-700 shadow-lg relative bg-white flex flex-col justify-center">
                        <img src={b.image.url} alt={b.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex flex-col justify-center px-2 text-center text-white">
                          <span className="text-[6px] tracking-[0.2em] font-bold text-white/80 uppercase">{b.subtitle?.slice(0, 15)}</span>
                          <h4 className="font-serif text-[8px] font-bold mt-0.5 leading-tight">{b.title?.slice(0, 30)}</h4>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-gray-300 dark:text-gray-700 flex flex-col items-center gap-1">
                      <ImageIcon size={32} />
                      <span className="text-xs">No Image Loaded</span>
                    </div>
                  )}

                  {/* Desktop/Mobile Switcher Controls */}
                  {b.image?.url && (
                    <div className="absolute top-3 right-3 flex items-center bg-white/80 dark:bg-dark-card/90 backdrop-blur-xs p-1 rounded-xl shadow-2xs border border-gray-100 dark:border-white/5">
                      <button 
                        onClick={() => setPreviewMode(b._id, 'desktop')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${currentMode === 'desktop' ? 'bg-primary text-white shadow-3xs' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
                      >
                        <Laptop size={12} />
                      </button>
                      <button 
                        onClick={() => setPreviewMode(b._id, 'mobile')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${currentMode === 'mobile' ? 'bg-primary text-white shadow-3xs' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
                      >
                        <Smartphone size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Banner Metadata & Actions */}
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{b.title || 'Untitled Banner'}</p>
                    {b.subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{b.subtitle}</p>}
                    {b.ctaText && b.ctaLink && (
                      <p className="text-[10px] text-primary bg-brand-pink dark:bg-primary/10 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mt-3.5">
                        CTA: {b.ctaText} → {b.ctaLink}
                      </p>
                    )}
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mt-2.5">Display Order: {b.displayOrder ?? 0}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => toggle(b)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer">
                      {b.isActive
                        ? <ToggleRight size={26} className="text-primary" />
                        : <ToggleLeft size={26} className="text-gray-300 dark:text-gray-700" />}
                    </button>
                    <button onClick={() => openEdit(b)} className="p-2 bg-gray-50 hover:bg-brand-pink dark:bg-white/2 dark:hover:bg-primary/10 rounded-xl text-gray-500 hover:text-primary transition-all cursor-pointer">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => remove(b)} className="p-2 bg-gray-50 hover:bg-rose-50 dark:bg-white/2 dark:hover:bg-rose-950/20 rounded-xl text-gray-500 hover:text-rose-600 transition-all cursor-pointer">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden max-h-[90vh] flex flex-col no-scrollbar">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{modal === 'add' ? 'Create Banner' : 'Edit Banner'}</h3>
              <button 
                onClick={() => setModal(null)} 
                className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl text-gray-400 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Title *</label>
                <input 
                  value={form.title} 
                  onChange={e => f('title', e.target.value)} 
                  placeholder="e.g. Elegant Silver Collections"
                  className={inputCls()} 
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Subtitle</label>
                <input 
                  value={form.subtitle} 
                  onChange={e => f('subtitle', e.target.value)} 
                  placeholder="e.g. Crafted to shine every day"
                  className={inputCls()} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Button Text</label>
                  <input 
                    value={form.ctaText} 
                    onChange={e => f('ctaText', e.target.value)} 
                    placeholder="e.g. Shop Now" 
                    className={inputCls()} 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Button Link</label>
                  <div className="relative mt-1">
                    <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      value={form.ctaLink} 
                      onChange={e => f('ctaLink', e.target.value)} 
                      placeholder="e.g. /products" 
                      className={`${inputCls()} pl-9`} 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Display Order</label>
                <div className="relative mt-1">
                  <ListOrdered size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="number" 
                    value={form.displayOrder} 
                    onChange={e => f('displayOrder', e.target.value)} 
                    className={`${inputCls()} pl-9`} 
                  />
                </div>
              </div>

              {/* Image Input Options */}
              <div className="space-y-3 bg-gray-50/50 dark:bg-white/1 border border-gray-100 dark:border-white/2 p-4 rounded-2xl">
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider block">
                  Image file {modal === 'add' ? '*' : '(leave blank to keep current)'}
                </label>
                
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1.5">Upload file:</p>
                  <input 
                    ref={fileRef} 
                    type="file" 
                    accept="image/*"
                    onChange={e => { setFile(e.target.files[0]); setImageUrl('') }}
                    className="block text-xs text-gray-500" 
                  />
                </div>
                
                <div className="relative flex items-center justify-center py-1.5">
                  <span className="h-px bg-gray-100 dark:bg-white/5 w-full absolute" />
                  <span className="text-[9px] uppercase font-bold bg-gray-50 dark:bg-dark-card px-2 text-gray-400 dark:text-gray-500 relative z-10">or</span>
                </div>
                
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1.5">Image URL:</p>
                  <input
                    value={imageUrl}
                    onChange={e => { setImageUrl(e.target.value); setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full bg-white dark:bg-dark-bg border border-gray-150 dark:border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <button 
                onClick={save} 
                disabled={saving}
                className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                {saving ? 'Saving...' : modal === 'add' ? 'Create Banner' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
