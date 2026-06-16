import { useState } from 'react'
import { useSelector } from 'react-redux'
import { MapPin, Plus } from 'lucide-react'
import AddressCard from './AddressCard'
import AddressForm from './AddressForm'

export default function SavedAddresses() {
  const addresses = useSelector((s) => s.profile.addresses)
  const [showForm, setShowForm] = useState(false)
  const atMax = addresses.length >= 5

  return (
    <div className="bg-[#141414] border border-[#242424] rounded-2xl p-5 md:p-8 mt-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.1em] font-semibold text-white">
            Saved Addresses
          </span>
          <span className="text-xs text-[#5C5C5C]">({addresses.length} of 5)</span>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          disabled={atMax}
          title={atMax ? 'Maximum 5 addresses reached' : undefined}
          className="flex items-center gap-2 border border-[#B8976A]/30 bg-transparent                px-4 py-3 min-h-[44px] text-[11px] uppercase tracking-[0.08em] font-semibold rounded-xl cursor-pointer text-[#B8976A] hover:bg-[#B8976A]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={13} />
          Add New Address
        </button>
      </div>

      {/* Add form */}
      {showForm && !atMax && (
        <div className="border-b border-[#242424] mb-6 pb-6">
          <AddressForm
            onCancel={() => setShowForm(false)}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Empty state */}
      {addresses.length === 0 && !showForm && (
        <div className="text-center py-12">
          <MapPin size={32} className="text-[#242424] mx-auto mb-3" />
          <p className="text-sm font-medium text-white mb-1">No saved addresses</p>
          <p className="text-xs text-[#5C5C5C] mb-5">Add your first address to checkout faster</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white border-none px-6 py-3 text-xs uppercase tracking-[0.1em] font-semibold cursor-pointer rounded-xl"
          >
            Add Address
          </button>
        </div>
      )}

      {/* Address grid */}
      {addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard key={addr._id} address={addr} />
          ))}
        </div>
      )}
    </div>
  )
}
