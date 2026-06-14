import { useNavigate } from 'react-router-dom'
import { Check, X } from 'lucide-react'

const RETURN_ELIGIBILITY = [
  { ok: true, text: 'Product must be unused and unwashed' },
  { ok: true, text: 'Original tags must still be attached' },
  { ok: true, text: 'Returned in its original packaging' },
  { ok: true, text: 'No signs of wear, damage, or alteration' },
  { ok: false, text: 'Innerwear and socks are not returnable' },
  { ok: false, text: 'Customized products and gift cards cannot be returned' },
  { ok: false, text: 'Clearance or final-sale items are not eligible' },
]

const EXCHANGE_ELIGIBILITY = [
  { ok: true, text: 'Available for size issues' },
  { ok: true, text: 'Available for damaged products' },
  { ok: true, text: 'Available for incorrect items received' },
  { ok: true, text: 'Subject to stock availability' },
]

const REFUND_POINTS = [
  'Refunds are processed after a quality inspection of the returned item.',
  'Approved refunds are credited within 5–7 business days to your original payment method.',
]

const RETURN_SHIPPING = [
  { ok: true, text: 'LUXORA JEWELLERY covers return shipping for damaged, defective, or incorrect items' },
  { ok: false, text: 'For size exchanges or preference-based returns, shipping charges may be deducted' },
]

const RETURN_STEPS = [
  'Go to My Orders',
  'Select the delivered order',
  'Click Request Return or Exchange',
  'Select items and reason',
  'Submit request',
  'Our team reviews within 24-48 hours',
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

function Checklist({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          {item.ok ? (
            <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <X size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <span className="text-[14px] text-gray-600" style={{ lineHeight: 1.8 }}>
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function ReturnsPolicyPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#FCD4DB]">
      {/* Hero */}
      <section className="bg-[#0A0A0A] py-16 px-4 text-center">
        <p className="uppercase text-[#EE6B83] mb-3" style={{ letterSpacing: '0.2em', fontSize: '11px' }}>
          Policies
        </p>
        <h1 className="text-white mb-4" style={{ ...displayFont, fontSize: '40px', fontWeight: 400 }}>
          Returns &amp; Exchanges
        </h1>
        <p className="text-white/60 max-w-md mx-auto" style={{ fontSize: '15px', lineHeight: 1.7 }}>
          Simple, hassle-free returns and exchanges within our policy window
        </p>
      </section>

      {/* Content */}
      <div className="max-w-[860px] mx-auto py-16 px-4 space-y-6">
        {/* Two key info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Return & Exchange window */}
          <div className="bg-white p-8">
            <div className="inline-block pb-2 border-b border-[#EE6B83]">
              <span className="text-[#0A0A0A]" style={{ ...displayFont, fontSize: '48px', lineHeight: 1 }}>
                7
              </span>
              <span className="block uppercase text-[#6B6B6B] mt-1" style={{ fontSize: '13px', letterSpacing: '0.06em' }}>
                Days
              </span>
            </div>
            <p className="text-[14px] text-[#6B6B6B] mt-4" style={{ lineHeight: 1.8 }}>
              You may request a return or exchange within 7 days of receiving your product.
            </p>
          </div>

          {/* Refund timeline */}
          <div className="bg-white p-8">
            <div className="inline-block pb-2 border-b border-[#EE6B83]">
              <span className="text-[#0A0A0A]" style={{ ...displayFont, fontSize: '48px', lineHeight: 1 }}>
                5–7
              </span>
              <span className="block uppercase text-[#6B6B6B] mt-1" style={{ fontSize: '13px', letterSpacing: '0.06em' }}>
                Days
              </span>
            </div>
            <p className="text-[14px] text-[#6B6B6B] mt-4" style={{ lineHeight: 1.8 }}>
              Approved refunds are credited to your original payment method within 5–7
              business days.
            </p>
          </div>
        </div>

        {/* Card 1 — Return Eligibility */}
        <div className="bg-white p-8">
          <SectionHeading>Return Eligibility</SectionHeading>
          <Checklist items={RETURN_ELIGIBILITY} />
        </div>

        {/* Card 2 — Exchange Policy */}
        <div className="bg-white p-8">
          <SectionHeading>Exchange Policy</SectionHeading>
          <Checklist items={EXCHANGE_ELIGIBILITY} />
        </div>

        {/* Card 3 — Refund Process */}
        <div className="bg-white p-8">
          <SectionHeading>Refund Process</SectionHeading>
          <ul className="space-y-3">
            {REFUND_POINTS.map((point, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-1 h-1 rounded-full bg-black mt-2.5 flex-shrink-0" />
                <span className="text-[14px] text-gray-500" style={{ lineHeight: 1.8 }}>
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 4 — Return Shipping */}
        <div className="bg-white p-8">
          <SectionHeading>Return Shipping</SectionHeading>
          <Checklist items={RETURN_SHIPPING} />
        </div>

        {/* Card 5 — Damaged or Incorrect Products */}
        <div className="bg-white p-8">
          <SectionHeading>Damaged or Incorrect Products</SectionHeading>
          <div className="bg-[#FCD4DB] p-5 border-l-[3px] border-[#EE6B83]">
            <p className="text-[14px] text-gray-600" style={{ lineHeight: 1.8 }}>
              Please notify us within 48 hours of delivery with supporting photos so we can
              resolve the issue quickly.
            </p>
          </div>
        </div>

        {/* Card 6 — How to Request a Return */}
        <div className="bg-white p-8">
          <SectionHeading>How to Request a Return</SectionHeading>
          <ol className="space-y-4">
            {RETURN_STEPS.map((step, i) => (
              <li key={i} className="flex items-center">
                <span className="w-7 h-7 rounded-full bg-black text-white text-[13px] flex items-center justify-center flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[14px] text-gray-600 ml-4">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA */}
        <div className="bg-white p-8 text-center">
          <h2 className="text-[#0A0A0A] mb-3" style={{ ...displayFont, fontSize: '24px', fontWeight: 400 }}>
            Need to return something?
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
            <button
              onClick={() => navigate('/my-orders')}
              className="bg-[#EE6B83] text-white px-6 py-3 text-[13px] uppercase tracking-[0.1em] hover:bg-[#D9506A] transition-colors rounded-lg"
            >
              My Orders
            </button>
            <button
              onClick={() => navigate('/my-returns')}
              className="border border-[#EE6B83] text-[#EE6B83] px-6 py-3 text-[13px] uppercase tracking-[0.1em] hover:bg-[#FCD4DB] transition-colors rounded-lg"
            >
              Track Return
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
