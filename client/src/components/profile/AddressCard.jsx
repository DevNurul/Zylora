import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { deleteUserAddress, setUserDefaultAddress } from '../../store/slices/profileSlice'
import AddressForm from './AddressForm'

function Badge({ children, dark }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      padding: '2px 8px',
      background: dark ? '#EE6B83' : '#FCD4DB',
      color: dark ? '#fff' : '#EE6B83',
      marginRight: '6px',
    }}>
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
    <div style={{
      border: `1px solid ${address.isDefault ? '#EE6B83' : '#E5E5E5'}`,
      padding: '20px',
      transition: 'border-color 200ms',
    }}>
      {/* Top row: badges + action icons */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <Badge>{address.label}</Badge>
          {address.isDefault && <Badge dark>Default</Badge>}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={() => { setEditing((v) => !v); setConfirmDel(false) }}
            title="Edit"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', padding: '2px', lineHeight: 0 }}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => { setConfirmDel((v) => !v); setEditing(false) }}
            title="Delete"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', padding: '2px', lineHeight: 0 }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Address details */}
      <p style={{ fontSize: '15px', fontWeight: 500, color: '#0A0A0A', margin: '0 0 4px' }}>{address.fullName}</p>
      <p style={{ fontSize: '13px', color: '#6B6B6B', margin: '0 0 6px' }}>{address.phone}</p>
      <p style={{ fontSize: '13px', color: '#6B6B6B', lineHeight: 1.6, margin: 0 }}>{fullAddressLine}</p>

      {/* Set as Default link */}
      {!address.isDefault && !editing && !confirmDel && (
        <button
          onClick={handleSetDefault}
          disabled={updating}
          style={{
            marginTop: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#6B6B6B',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          Set as Default
        </button>
      )}

      {/* Inline delete confirmation */}
      {confirmDel && (
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#0A0A0A' }}>
          Remove this address?{' '}
          <button
            onClick={handleDelete}
            disabled={updating}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontWeight: 600, textDecoration: 'underline', padding: 0 }}
          >
            Yes
          </button>
          {' '}·{' '}
          <button
            onClick={() => setConfirmDel(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', padding: 0 }}
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
