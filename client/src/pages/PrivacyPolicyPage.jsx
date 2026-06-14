const INFORMATION_COLLECTED = [
  'Name',
  'Email address',
  'Phone number',
  'Shipping and billing address',
  'Payment information',
  'Device and browser information',
  'Website usage data',
]

const INFORMATION_USE = [
  'Process orders',
  'Deliver products',
  'Provide customer support',
  'Improve our website and services',
  'Send promotional offers and updates',
]

const INFORMATION_SHARING = [
  'Shipping partners',
  'Payment gateway providers',
  'Service providers necessary to operate our business',
]

const YOUR_RIGHTS = [
  'Access to your personal information',
  'Correction of inaccurate information',
  'Deletion of your information where applicable',
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
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="w-1 h-1 rounded-full bg-black mt-2.5 flex-shrink-0" />
          <span className="text-[14px] text-gray-500" style={{ lineHeight: 1.8 }}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FCD4DB]">
      {/* Hero */}
      <section className="bg-[#0A0A0A] py-16 px-4 text-center">
        <p className="uppercase text-[#EE6B83] mb-3" style={{ letterSpacing: '0.2em', fontSize: '11px' }}>
          Policies
        </p>
        <h1 className="text-white mb-4" style={{ ...displayFont, fontSize: '40px', fontWeight: 400 }}>
          Privacy Policy
        </h1>
        <p className="text-white/60 max-w-md mx-auto" style={{ fontSize: '15px', lineHeight: 1.7 }}>
          At LUXORA JEWELLERY, we respect your privacy and are committed to protecting your personal
          information
        </p>
      </section>

      {/* Content */}
      <div className="max-w-[860px] mx-auto py-16 px-4 space-y-6">
        {/* Information We Collect */}
        <div className="bg-white p-8">
          <SectionHeading>Information We Collect</SectionHeading>
          <Body className="mb-5">We may collect:</Body>
          <BulletList items={INFORMATION_COLLECTED} />
        </div>

        {/* How We Use Your Information */}
        <div className="bg-white p-8">
          <SectionHeading>How We Use Your Information</SectionHeading>
          <Body className="mb-5">We use your information to:</Body>
          <BulletList items={INFORMATION_USE} />
        </div>

        {/* Data Protection */}
        <div className="bg-white p-8">
          <SectionHeading>Data Protection</SectionHeading>
          <Body>
            We implement appropriate security measures to protect your personal information
            from unauthorized access, disclosure, or misuse.
          </Body>
        </div>

        {/* Sharing of Information */}
        <div className="bg-white p-8">
          <SectionHeading>Sharing of Information</SectionHeading>
          <Body className="mb-5">
            We do not sell your personal information. Information may be shared with:
          </Body>
          <BulletList items={INFORMATION_SHARING} />
        </div>

        {/* Cookies */}
        <div className="bg-white p-8">
          <SectionHeading>Cookies</SectionHeading>
          <Body>
            Our website may use cookies to improve user experience and analyze website
            traffic.
          </Body>
        </div>

        {/* Your Rights */}
        <div className="bg-white p-8">
          <SectionHeading>Your Rights</SectionHeading>
          <Body className="mb-5">You may request:</Body>
          <BulletList items={YOUR_RIGHTS} />
        </div>

        {/* Last updated */}
        <p className="text-[12px] text-gray-400 text-center pt-2">Last updated: June 2026</p>
      </div>
    </div>
  )
}
