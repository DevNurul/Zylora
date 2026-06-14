import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const SHIPPING_TIMELINE = [
  { location: 'Metro Cities', timeframe: '2–5 business days' },
  { location: 'Other Locations', timeframe: '4–7 business days' },
  { location: 'Remote Areas', timeframe: '5–10 business days' },
]

const PROCESSING_POINTS = [
  'Orders are processed within 1–2 business days.',
  'Orders placed on weekends or public holidays will be processed on the next working day.',
]

const SHIPPING_CHARGES = [
  'Free shipping on orders above ₹999.',
  'Orders below ₹999 may incur a shipping fee displayed at checkout.',
]

const displayFont = { fontFamily: '"Playfair Display", Georgia, serif' }

function SectionHeading({ children }) {
  return (
    <h2
      className="uppercase text-[#0A0A0A] mb-4 pb-3 border-b border-[#E5E5E5]"
      style={{ fontSize: '13px', letterSpacing: '0.08em', fontWeight: 500 }}
    >
      {children}
    </h2>
  )
}

function Body({ children, className = '' }) {
  return (
    <p className={`text-[14px] text-[#6B6B6B] ${className}`} style={{ lineHeight: 1.8 }}>
      {children}
    </p>
  )
}

function BulletList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((point, i) => (
        <li key={i} className="flex gap-3">
          <span className="w-1 h-1 rounded-full bg-black mt-2.5 flex-shrink-0" />
          <span className="text-[14px] text-gray-500" style={{ lineHeight: 1.8 }}>
            {point}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FCD4DB]">
      {/* Hero */}
      <section className="bg-[#0A0A0A] py-16 px-4 text-center">
        <p className="uppercase text-[#EE6B83] mb-3" style={{ letterSpacing: '0.2em', fontSize: '11px' }}>
          Policies
        </p>
        <h1 className="text-white mb-4" style={{ ...displayFont, fontSize: '40px', fontWeight: 400 }}>
          Shipping Policy
        </h1>
        <p className="text-white/60 max-w-md mx-auto" style={{ fontSize: '15px', lineHeight: 1.7 }}>
          Everything you need to know about how we deliver your orders
        </p>
      </section>

      {/* Content */}
      <div className="max-w-[860px] mx-auto py-16 px-4 space-y-6">
        {/* Card 1 — Order Processing */}
        <div className="bg-white p-8">
          <SectionHeading>Order Processing</SectionHeading>
          <BulletList items={PROCESSING_POINTS} />
        </div>

        {/* Card 2 — Shipping Timeline */}
        <div className="bg-white p-8">
          <SectionHeading>Shipping Timeline</SectionHeading>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FCD4DB]">
                <th className="text-left uppercase tracking-wider text-xs text-[#0A0A0A] font-medium py-3 px-4">
                  Location
                </th>
                <th className="text-left uppercase tracking-wider text-xs text-[#0A0A0A] font-medium py-3 px-4">
                  Estimated Delivery
                </th>
              </tr>
            </thead>
            <tbody>
              {SHIPPING_TIMELINE.map((row) => (
                <tr key={row.location} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-[14px] text-[#0A0A0A] font-medium">{row.location}</td>
                  <td className="py-3 px-4 text-[14px] text-[#6B6B6B]">{row.timeframe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card 3 — Shipping Charges */}
        <div className="bg-white p-8">
          <SectionHeading>Shipping Charges</SectionHeading>
          <BulletList items={SHIPPING_CHARGES} />
        </div>

        {/* Card 4 — Order Tracking */}
        <div className="bg-white p-8">
          <SectionHeading>Order Tracking</SectionHeading>
          <Body>
            Once your order is shipped, tracking details will be shared with you via email,
            SMS, or WhatsApp. You can also follow your order on the{' '}
            <Link
              to="/track"
              className="inline-flex items-center gap-1 text-[#0A0A0A] font-medium hover:text-[#EE6B83] transition-colors"
            >
              Track Your Order <ArrowRight size={13} />
            </Link>{' '}
            page.
          </Body>
        </div>

        {/* Card 5 — Delivery Delays */}
        <div className="bg-white p-8">
          <SectionHeading>Delivery Delays</SectionHeading>
          <Body>
            Delivery timelines may vary due to weather conditions, public holidays, logistics
            issues, or other unforeseen circumstances.
          </Body>
        </div>

        {/* Card 6 — Failed Delivery */}
        <div className="bg-white p-8">
          <SectionHeading>Failed Delivery</SectionHeading>
          <div className="bg-[#FCD4DB] p-5 border-l-[3px] border-[#EE6B83]">
            <p className="text-[14px] text-gray-600" style={{ lineHeight: 1.8 }}>
              If delivery attempts fail due to an incorrect address or unavailability,
              additional shipping charges may apply for re-delivery.
            </p>
          </div>
        </div>

        {/* Last updated */}
        <p className="text-[12px] text-gray-400 text-center pt-2">Last updated: June 2026</p>
      </div>
    </div>
  )
}
