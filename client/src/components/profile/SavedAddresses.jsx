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
    <div style={{ background: '#fff', padding: '32px', marginTop: '24px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: '#0A0A0A' }}>
            Saved Addresses
          </span>
          <span style={{ fontSize: '13px', color: '#6B6B6B' }}>({addresses.length} of 5)</span>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          disabled={atMax}
          title={atMax ? 'Maximum 5 addresses reached' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid #0A0A0A',
            background: 'none',
            padding: '8px 14px',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: atMax ? 'not-allowed' : 'pointer',
            color: atMax ? '#B0B0B0' : '#0A0A0A',
            borderColor: atMax ? '#E5E5E5' : '#0A0A0A',
            transition: 'all 200ms',
          }}
        >
          <Plus size={13} />
          Add New Address
        </button>
      </div>

      {/* Add form — shown inline below header */}
      {showForm && !atMax && (
        <div style={{ borderBottom: '1px solid #E5E5E5', marginBottom: '24px', paddingBottom: '24px' }}>
          <AddressForm
            onCancel={() => setShowForm(false)}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Empty state */}
      {addresses.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#6B6B6B' }}>
          <MapPin size={32} style={{ margin: '0 auto 12px', display: 'block', color: '#B0B0B0' }} />
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#0A0A0A', margin: '0 0 6px' }}>No saved addresses</p>
          <p style={{ fontSize: '13px', margin: '0 0 20px' }}>Add your first address to checkout faster</p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: '#0A0A0A',
              color: '#fff',
              border: 'none',
              padding: '12px 28px',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            Add Address
          </button>
        </div>
      )}

      {/* Address grid */}
      {addresses.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {addresses.map((addr) => (
            <AddressCard key={addr._id} address={addr} />
          ))}
        </div>
      )}
    </div>
  )
}
