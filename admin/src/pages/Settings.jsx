import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Settings as SettingsIcon, ShieldCheck, Mail, Globe, CreditCard, Truck, Store, Save } from 'lucide-react'

const TABS = [
  { id: 'general', label: 'General Info', icon: SettingsIcon },
  { id: 'store', label: 'Store Identity', icon: Store },
  { id: 'shipping', label: 'Shipping Rules', icon: Truck },
  { id: 'payment', label: 'Payment Gateway', icon: CreditCard },
  { id: 'seo', label: 'SEO Config', icon: Globe },
  { id: 'email', label: 'Email SMTP', icon: Mail },
  { id: 'security', label: 'Access Security', icon: ShieldCheck },
]

function inputCls() {
  return 'mt-1.5 w-full bg-gray-50 dark:bg-dark-bg border border-gray-150 dark:border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all duration-200'
}

function Label({ children }) {
  return <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">{children}</label>
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [form, setForm] = useState({
    storeName: '', tagline: '', contactEmail: '', contactPhone: '',
    shippingCharge: '', freeShippingThreshold: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => {
      const s = data.settings || {}
      setForm({
        storeName: s.storeName || '',
        tagline: s.tagline || '',
        contactEmail: s.contactEmail || '',
        contactPhone: s.contactPhone || '',
        shippingCharge: s.shippingCharge ?? 99,
        freeShippingThreshold: s.freeShippingThreshold ?? 999,
      })
    }).catch(() => toast.error('Failed to load settings')).finally(() => setLoading(false))
  }, [])

  const save = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      await api.put('/admin/settings', form)
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally { setSaving(false) }
  }

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="inline-block h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
        <p className="text-xs text-gray-400 dark:text-gray-500">Loading configurations...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Control store properties, checkout parameters, and metadata listings</p>
        </div>
        <button 
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer disabled:opacity-60"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Tabbed interface layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        
        {/* Left tabs menu */}
        <div className="w-full lg:w-64 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5 p-3.5 space-y-1.5 flex-shrink-0 shadow-xs">
          <p className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 px-3.5 py-1.5 tracking-wider">Config Modules</p>
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-brand-pink dark:bg-primary/10 text-primary'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-950 dark:hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right content forms */}
        <div className="flex-1 w-full bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5 p-6 sm:p-8 shadow-xs min-h-[450px]">
          
          {/* General settings tab */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">General Information</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Primary email and phone contacts for store communications</p>
              </div>
              <div className="space-y-4 max-w-xl">
                <div>
                  <Label>Support Contact Email</Label>
                  <input 
                    type="email" 
                    value={form.contactEmail} 
                    onChange={e => f('contactEmail', e.target.value)} 
                    placeholder="support@zylora.com"
                    className={inputCls()} 
                  />
                </div>
                <div>
                  <Label>Support Phone Number</Label>
                  <input 
                    value={form.contactPhone} 
                    onChange={e => f('contactPhone', e.target.value)} 
                    placeholder="+91 9999999999"
                    className={inputCls()} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Store Identity tab */}
          {activeTab === 'store' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">Store Identity</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Branding text elements for page titles and promotional sub-headers</p>
              </div>
              <div className="space-y-4 max-w-xl">
                <div>
                  <Label>Store Name</Label>
                  <input 
                    value={form.storeName} 
                    onChange={e => f('storeName', e.target.value)} 
                    placeholder="Zylora"
                    className={inputCls()} 
                  />
                </div>
                <div>
                  <Label>Tagline / Moto</Label>
                  <input 
                    value={form.tagline} 
                    onChange={e => f('tagline', e.target.value)} 
                    placeholder="Wear Confidence"
                    className={inputCls()} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shipping settings tab */}
          {activeTab === 'shipping' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">Shipping Configuration</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Control pricing tables and threshold limits for free delivery</p>
              </div>
              <div className="space-y-4 max-w-xl">
                <div>
                  <Label>Base Shipping Fee (₹)</Label>
                  <input 
                    type="number" 
                    value={form.shippingCharge} 
                    onChange={e => f('shippingCharge', e.target.value)} 
                    placeholder="99"
                    className={inputCls()} 
                  />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">Applied on orders with totals below the free shipping limit.</p>
                </div>
                <div>
                  <Label>Free Shipping Threshold Limit (₹)</Label>
                  <input 
                    type="number" 
                    value={form.freeShippingThreshold} 
                    onChange={e => f('freeShippingThreshold', e.target.value)} 
                    placeholder="999"
                    className={inputCls()} 
                  />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">Orders exceeding this amount receive free checkout delivery.</p>
                </div>
              </div>
            </div>
          )}

          {/* Simulated Payment Gateway tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">Payment Gateway</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Integration keys for PhonePe UPI and card gateway networks</p>
              </div>
              <div className="space-y-4 max-w-xl opacity-60">
                <div>
                  <Label>Merchant ID (PhonePe)</Label>
                  <input value="PGTESTPAYUAT86" disabled className={inputCls()} />
                </div>
                <div>
                  <Label>Salt Key</Label>
                  <input value="••••••••••••••••••••••••••••••••••••" disabled className={inputCls()} />
                </div>
                <div>
                  <Label>Salt Index</Label>
                  <input value="1" disabled className={inputCls()} />
                </div>
              </div>
              <p className="text-[10px] text-primary bg-brand-pink dark:bg-primary/10 font-bold px-2 py-0.5 rounded-md inline-block">⚠ Configured securely in backend environment variables (.env)</p>
            </div>
          )}

          {/* Simulated SEO tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">Search Engine Optimization</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Manage meta titles, keywords, and robot crawls</p>
              </div>
              <div className="space-y-4 max-w-xl opacity-65">
                <div>
                  <Label>Meta Title</Label>
                  <input value="Zylora - Elegant Premium Sterling Silver Jewelry" disabled className={inputCls()} />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <textarea rows={2} value="Shop handcrafted silver rings, gemstone earrings, and designer necklaces at Zylora. 925 sterling silver jewelry with free shipping." disabled className={`${inputCls()} resize-none`} />
                </div>
                <div>
                  <Label>Keywords</Label>
                  <input value="silver jewelry, sterling silver, rings, earrings, zylora" disabled className={inputCls()} />
                </div>
              </div>
            </div>
          )}

          {/* Simulated Email tab */}
          {activeTab === 'email' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">Email SMTP</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Configurations for outbound order notifications and OTP emails</p>
              </div>
              <div className="space-y-4 max-w-xl opacity-65">
                <div>
                  <Label>SMTP Host</Label>
                  <input value="smtp.hostinger.com" disabled className={inputCls()} />
                </div>
                <div>
                  <Label>SMTP Port</Label>
                  <input value="465" disabled className={inputCls()} />
                </div>
                <div>
                  <Label>Outbound From Name</Label>
                  <input value="Zylora Support" disabled className={inputCls()} />
                </div>
              </div>
            </div>
          )}

          {/* Simulated Security tab */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">Access Security</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Control login bypass keys and JWT token expiry lifespans</p>
              </div>
              <div className="space-y-4 max-w-xl opacity-65">
                <div>
                  <Label>Bypass OTP Access Key</Label>
                  <input value="••••••" disabled className="mt-1.5 w-full bg-gray-50 dark:bg-dark-bg border border-gray-150 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-center font-mono tracking-widest disabled:opacity-60" />
                </div>
                <div>
                  <Label>JWT Session Duration</Label>
                  <input value="7 Days" disabled className={inputCls()} />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
