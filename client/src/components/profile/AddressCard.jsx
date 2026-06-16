import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { deleteUserAddress, setUserDefaultAddress } from '../../store/slices/profileSlice'
import AddressForm from './AddressForm'

function Badge({ children, active }) {
  return (
    <span className={`inline-block text-[9px] uppercase tracking-[0.06em] px-2.5 py-1 rounded-md mr-1.5 ${
      active
        ? 'bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white'
        : 'bg-[#242424] text-[#9A9A9A]'
    }`}>
      {children}
    </span>
  )
}

export default function AddressCard({ address }) {
  const dispatch = useDispatch()
  const updating = useSelector((s) => s.profile.updating)
  const [editing,     setEditing]     = useState(false)
  const [confirmDel,  setConfirmDel]  = useState(false)

  const fullAddressLine = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    `${address.state} - ${address.pincode}`,
  ].filter(Boolean).join(', ')

  const handleDelete = async () => {
    const result = await dispatch(deleteUserAddress(address._id))
    if (deleteUserAddress.fulfilled.match(result)) {
      toast.success('Address removed successfully')
    } else {
      toast.error(result.payload || 'Failed to remove address')
    }
    setConfirmDel(false)
  }

  const handleSetDefault = async () => {
    const result = await dispatch(setUserDefaultAddress(address._id))
    if (setUserDefaultAddress.fulfilled.match(result)) {
      toast.success('Default address updated')
    } else {
      toast.error(result.payload || 'Failed to update default')
    }
  }

  return (
    <div className={`border rounded-2xl p-5 transition-all duration-300 ${
      address.isDefault ? 'border-[#B8976A]/50 bg-[#B8976A]/5' : 'border-[#242424] bg-[#0A0A0A]'
    }`}>
      {/* Top row: badges + action icons */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <Badge>{address.label}</Badge>
          {address.isDefault && <Badge active>Default</Badge>}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => { setEditing((v) => !v); setConfirmDel(false) }}
            title="Edit"
            className="p-1.5 text-[#5C5C5C] hover:text-[#B8976A] hover:bg-[#B8976A]/10 rounded-lg transition-all"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => { setConfirmDel((v) => !v); setEditing(false) }}
            title="Delete"
            className="p-1.5 text-[#5C5C5C] hover:text-[#E8A0B0] hover:bg-[#E8A0B0]/10 rounded-lg transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Address details */}
      <p className="text-sm font-medium text-white m-0 mb-1">{address.fullName}</p>
      <p className="text-xs text-[#5C5C5C] m-0 mb-1.5">{address.phone}</p>
      <p className="text-xs text-[#5C5C5C] leading-relaxed m-0">{fullAddressLine}</p>

      {/* Set as Default link */}
      {!address.isDefault && !editing && !confirmDel && (
        <button
          onClick={handleSetDefault}
          disabled={updating}
          className="mt-3 text-xs text-[#5C5C5C] hover:text-[#B8976A] transition-colors underline cursor-pointer bg-transparent border-none p-0"
        >
          Set as Default
        </button>
      )}

      {/* Inline delete confirmation */}
      {confirmDel && (
        <div className="mt-3 text-xs text-white">
          Remove this address?{' '}
          <button
            onClick={handleDelete}
            disabled={updating}
            className="bg-transparent border-none cursor-pointer text-[#E8A0B0] font-semibold underline p-0"
          >
            Yes
          </button>
          {' '}·{' '}
          <button
            onClick={() => setConfirmDel(false)}
            className="bg-transparent border-none cursor-pointer text-[#5C5C5C] p-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Inline edit form */}
      {editing && (
        <AddressForm
          existing={address}
          onCancel={() => setEditing(false)}
          onSuccess={() => setEditing(false)}
        />
      )}
    </div>
  )
}
