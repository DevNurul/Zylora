import { useCart } from '../hooks/useCart'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAuth } from '../context/AuthContext'
import ShippingForm from '../components/checkout/ShippingForm'
import OrderSummary from '../components/checkout/OrderSummary'

function SavedAddressPicker({ addresses, selected, onSelect }) {
  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-[0.1em] font-medium text-[#9A9A9A] mb-4">
        Saved Addresses
      </p>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {addresses.map((addr) => {
          const isSelected = selected?._id === addr._id
          return (
            <button
              key={addr._id}
              onClick={() => onSelect(addr)}
              className={`min-w-[260px] border rounded-2xl p-5 text-left cursor-pointer flex-shrink-0 transition-all duration-300 ${
                isSelected
                  ? 'border-[#B8976A] bg-[#B8976A]/5'
                  : 'border-[#242424] bg-[#141414] hover:border-[#B8976A]/30'
              }`}
            >
              <span className="text-[9px] uppercase tracking-[0.08em] bg-[#242424] px-2.5 py-1 rounded-md text-[#9A9A9A] inline-block mb-3">
                {addr.label}
              </span>
              <p className="text-sm font-medium text-white mb-1">{addr.fullName}</p>
              <p className="text-xs text-[#5C5C5C]">{addr.city}, {addr.state}</p>
            </button>
          )
        })}
      </div>
      {selected && (
        <button
          onClick={() => onSelect(null)}
          className="mt-3 text-xs text-[#5C5C5C] hover:text-[#B8976A] transition-colors underline"
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
        <h1 className="font-serif text-2xl md:text-3xl text-white mb-10 font-light">Checkout</h1>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
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
