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

const displayFont = { fontFamily: '"Cormorant Garamond", Georgia, serif' }

function SectionHeading({ children }) {
  return (
    <h2 className="uppercase text-white mb-4 pb-3 border-b border-[#242424]" style={{ fontSize: '13px', letterSpacing: '0.08em', fontWeight: 500 }}>
      {children}
    </h2>
  )
}

function Body({ children, className = '' }) {
  return (
    <p className={`text-[14px] text-[#9A9A9A] ${className}`} style={{ lineHeight: 1.8 }}>
      {children}
    </p>
  )
}

function BulletList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((point, i) => (
        <li key={i} className="flex gap-3">
          <span className="w-1 h-1 rounded-full bg-[#B8976A] mt-2.5 flex-shrink-0" />
          <span className="text-[14px] text-[#9A9A9A]" style={{ lineHeight: 1.8 }}>{point}</span>
        </li>
      ))}
    </ul>
  )
}

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <section className="bg-[#0A0A0A] py-10 md:py-10 md:py-16 px-4 text-center border-b border-[#242424]">
        <p className="uppercase text-[#B8976A] mb-3" style={{ letterSpacing: '0.2em', fontSize: '11px' }}>Policies</p>
        <h1 className="text-white mb-4" style={{ ...displayFont, fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 400 }}>Shipping Policy</h1>
        <p className="text-[#9A9A9A] max-w-md mx-auto" style={{ fontSize: '15px', lineHeight: 1.7 }}>
          Everything you need to know about how we deliver your orders
        </p>
      </section>

      <div className="max-w-[860px] mx-auto py-10 md:py-10 md:py-16 px-4 space-y-6">
        <div className="bg-[#141414] p-5 md:p-8 rounded-xl border border-[#242424]">
          <SectionHeading>Order Processing</SectionHeading>
          <BulletList items={PROCESSING_POINTS} />
        </div>

        <div className="bg-[#141414] p-5 md:p-8 rounded-xl border border-[#242424]">
          <SectionHeading>Shipping Timeline</SectionHeading>
          <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1C1C1C]">
                <th className="text-left uppercase tracking-wider text-xs text-white font-medium py-3 px-4">Location</th>
                <th className="text-left uppercase tracking-wider text-xs text-white font-medium py-3 px-4">Estimated Delivery</th>
              </tr>
            </thead>
            <tbody>
              {SHIPPING_TIMELINE.map((row) => (
                <tr key={row.location} className="border-b border-[#242424]">
                  <td className="py-3 px-4 text-[14px] text-white font-medium">{row.location}</td>
                  <td className="py-3 px-4 text-[14px] text-[#9A9A9A]">{row.timeframe}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        <div className="bg-[#141414] p-5 md:p-8 rounded-xl border border-[#242424]">
          <SectionHeading>Shipping Charges</SectionHeading>
          <BulletList items={SHIPPING_CHARGES} />
        </div>

        <div className="bg-[#141414] p-5 md:p-8 rounded-xl border border-[#242424]">
          <SectionHeading>Order Tracking</SectionHeading>
          <Body>
            Once your order is shipped, tracking details will be shared with you via email,
            SMS, or WhatsApp. You can also follow your order on the{' '}
            <Link to="/track" className="inline-flex items-center gap-1 text-white font-medium hover:text-[#B8976A] transition-colors">
              Track Your Order <ArrowRight size={13} />
            </Link>{' '}
            page.
          </Body>
        </div>

        <div className="bg-[#141414] p-5 md:p-8 rounded-xl border border-[#242424]">
          <SectionHeading>Delivery Delays</SectionHeading>
          <Body>
            Delivery timelines may vary due to weather conditions, public holidays, logistics
            issues, or other unforeseen circumstances.
          </Body>
        </div>

        <div className="bg-[#141414] p-5 md:p-8 rounded-xl border border-[#242424]">
          <SectionHeading>Failed Delivery</SectionHeading>
          <div className="bg-[#1C1C1C] p-5 border-l-[3px] border-[#B8976A] rounded-r-lg">
            <p className="text-[14px] text-[#9A9A9A]" style={{ lineHeight: 1.8 }}>
              If delivery attempts fail due to an incorrect address or unavailability,
              additional shipping charges may apply for re-delivery.
            </p>
          </div>
        </div>

        <p className="text-[12px] text-[#5C5C5C] text-center pt-2">Last updated: June 2026</p>
      </div>
    </div>
  )
}
