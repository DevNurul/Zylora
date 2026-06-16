const INFORMATION_COLLECTED = [
  'Name', 'Email address', 'Phone number', 'Shipping and billing address',
  'Payment information', 'Device and browser information', 'Website usage data',
]

const INFORMATION_USE = [
  'Process orders', 'Deliver products', 'Provide customer support',
  'Improve our website and services', 'Send promotional offers and updates',
]

const INFORMATION_SHARING = [
  'Shipping partners', 'Payment gateway providers',
  'Service providers necessary to operate our business',
]

const YOUR_RIGHTS = [
  'Access to your personal information', 'Correction of inaccurate information',
  'Deletion of your information where applicable',
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
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="w-1 h-1 rounded-full bg-[#B8976A] mt-2.5 flex-shrink-0" />
          <span className="text-[14px] text-[#9A9A9A]" style={{ lineHeight: 1.8 }}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <section className="bg-[#0A0A0A] py-10 md:py-10 md:py-16 px-4 text-center border-b border-[#242424]">
        <p className="uppercase text-[#B8976A] mb-3" style={{ letterSpacing: '0.2em', fontSize: '11px' }}>Policies</p>
        <h1 className="text-white mb-4" style={{ ...displayFont, fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 400 }}>Privacy Policy</h1>
        <p className="text-[#9A9A9A] max-w-md mx-auto" style={{ fontSize: '15px', lineHeight: 1.7 }}>
          At ZYLARA JEWELLERY, we respect your privacy and are committed to protecting your personal information
        </p>
      </section>

      <div className="max-w-[860px] mx-auto py-10 md:py-10 md:py-16 px-4 space-y-6">
        <div className="bg-[#141414] p-5 md:p-8 rounded-xl border border-[#242424]">
          <SectionHeading>Information We Collect</SectionHeading>
          <Body className="mb-5">We may collect:</Body>
          <BulletList items={INFORMATION_COLLECTED} />
        </div>

        <div className="bg-[#141414] p-5 md:p-8 rounded-xl border border-[#242424]">
          <SectionHeading>How We Use Your Information</SectionHeading>
          <Body className="mb-5">We use your information to:</Body>
          <BulletList items={INFORMATION_USE} />
        </div>

        <div className="bg-[#141414] p-5 md:p-8 rounded-xl border border-[#242424]">
          <SectionHeading>Data Protection</SectionHeading>
          <Body>
            We implement appropriate security measures to protect your personal information
            from unauthorized access, disclosure, or misuse.
          </Body>
        </div>

        <div className="bg-[#141414] p-5 md:p-8 rounded-xl border border-[#242424]">
          <SectionHeading>Sharing of Information</SectionHeading>
          <Body className="mb-5">We do not sell your personal information. Information may be shared with:</Body>
          <BulletList items={INFORMATION_SHARING} />
        </div>

        <div className="bg-[#141414] p-5 md:p-8 rounded-xl border border-[#242424]">
          <SectionHeading>Cookies</SectionHeading>
          <Body>
            Our website may use cookies to improve user experience and analyze website traffic.
          </Body>
        </div>

        <div className="bg-[#141414] p-5 md:p-8 rounded-xl border border-[#242424]">
          <SectionHeading>Your Rights</SectionHeading>
          <Body className="mb-5">You may request:</Body>
          <BulletList items={YOUR_RIGHTS} />
        </div>

        <p className="text-[12px] text-[#5C5C5C] text-center pt-2">Last updated: June 2026</p>
      </div>
    </div>
  )
}
