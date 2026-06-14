import { useCart } from '../hooks/useCart'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAuth } from '../context/AuthContext'
import ShippingForm from '../components/checkout/ShippingForm'
import OrderSummary from '../components/checkout/OrderSummary'

function SavedAddressPicker({ addresses, selected, onSelect }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <p style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: '#0A0A0A', marginBottom: '12px' }}>
        Saved Addresses
      </p>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
        {addresses.map((addr) => {
          const isSelected = selected?._id === addr._id
          return (
            <button
              key={addr._id}
              onClick={() => onSelect(addr)}
              style={{
                minWidth: '250px',
                border: `1px solid ${isSelected ? '#EE6B83' : '#E5E5E5'}`,
                background: isSelected ? '#FCD4DB' : '#fff',
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 200ms',
              }}
            >
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#FCD4DB', padding: '2px 8px', display: 'inline-block', marginBottom: '6px' }}>
                {addr.label}
              </span>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A', margin: '0 0 2px' }}>{addr.fullName}</p>
              <p style={{ fontSize: '12px', color: '#6B6B6B', margin: 0 }}>{addr.city}, {addr.state}</p>
            </button>
          )
        })}
      </div>
      {selected && (
        <button
          onClick={() => onSelect(null)}
          style={{ marginTop: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6B6B6B', padding: 0, textDecoration: 'underline' }}
        >
          Enter a new address instead
        </button>
      )}
    </div>
  )
}

export default function Checkout() {
  const { items }           = useCart()
  const navigate            = useNavigate()
  const { isAuthenticated } = useAuth()
  const addresses           = useSelector((s) => s.profile.addresses)

  const [selectedAddress, setSelectedAddress] = useState(() =>
    addresses.find((a) => a.isDefault) || addresses[0] || null
  )

  useEffect(() => {
    if (items.length === 0) navigate('/cart')
  }, [items])

  const hasSaved = isAuthenticated && addresses.length > 0

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-8 lg:px-16 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold mb-10">Checkout</h1>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            {hasSaved && (
              <SavedAddressPicker
                addresses={addresses}
                selected={selectedAddress}
                onSelect={setSelectedAddress}
              />
            )}
            <ShippingForm prefill={selectedAddress} />
          </div>
          <div className="lg:w-[340px] xl:w-[380px]">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
