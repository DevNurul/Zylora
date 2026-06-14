import { Link } from 'react-router-dom'

/* Brand icons — this lucide-react version has no Instagram/Facebook glyphs,
   so we use inline SVGs that match the lucide stroke style. */
const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const MailIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const SHOP_LINKS = [
  { label: 'Women', href: '/products?category=Women' },
  { label: 'Men', href: '/products?category=Men' },
  { label: 'Accessories', href: '/products?category=Accessories' },
  { label: 'Footwear', href: '/products?category=Footwear' },
  { label: 'Sale', href: '/products?category=sale' },
  { label: 'New Arrivals', href: '/products?filter=new' },
]

const HELP_LINKS = [
  { label: 'Track Order', href: '/track-order' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Shipping Policy', href: '/shipping-policy' },
  { label: 'Returns & Exchanges', href: '/returns-policy' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
]

const SOCIAL = [
  {
    Icon: InstagramIcon,
    href: 'https://www.instagram.com/luxora.jewellery',
    label: 'Instagram',
    external: true,
  },
  // TODO: Update Facebook link when available
  { Icon: FacebookIcon, href: '#', label: 'Facebook', external: true },
  { Icon: MailIcon, href: 'mailto:support@luxorajewellery.com', label: 'Email', external: false },
]

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white mt-24">
      <div className="px-6 md:px-12 lg:px-20 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 lg:gap-16">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <div className="flex flex-col items-center sm:items-start mb-5 select-none">
              <span className="font-display text-[2rem] tracking-[0.22em] leading-none text-white">LUXORA</span>
              <span className="text-[9px] uppercase tracking-[0.38em] text-white/40 mt-1.5 leading-none pl-[0.38em]">JEWELLERY</span>
            </div>
            <p className="text-[14px] text-white/50 leading-relaxed font-light mb-8">
              Curated fine jewelry for the discerning collector. Timeless design, always.
            </p>
            <div className="flex gap-3 justify-center sm:justify-start">
              {SOCIAL.map(({ Icon, href, label, external }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  title={label}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="w-10 h-10 border border-white/15 flex items-center justify-center hover:border-white hover:bg-white/8 transition-all duration-200 text-white/60 hover:text-white"
                >
                  <Icon width={15} height={15} className="transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="text-center sm:text-left">
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-semibold text-white/35 mb-3 sm:mb-6">Shop</h3>
            <ul className="grid grid-cols-3 gap-x-3 gap-y-2 sm:block sm:space-y-3.5">
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-[13px] sm:text-[14px] text-white/60 hover:text-white transition-colors duration-200 font-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="text-center sm:text-left">
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-semibold text-white/35 mb-3 sm:mb-6">Help</h3>
            <ul className="grid grid-cols-3 gap-x-3 gap-y-2 sm:block sm:space-y-3.5">
              {HELP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-[13px] sm:text-[14px] text-white/60 hover:text-white transition-colors duration-200 font-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center sm:text-left">
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-semibold text-white/35 mb-3 sm:mb-6">Contact</h3>
            <div className="space-y-2 sm:space-y-3.5 text-[14px] text-white/50 font-light leading-relaxed">
              <p>support@luxorajewellery.com</p>
              <p>+91 98765 43210</p>
              <p>
                42, Fashion Street<br />
                Bandra West, Mumbai<br />
                Maharashtra 400050
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8 px-6 md:px-12 lg:px-20 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/30 tracking-wide">© 2026 LUXORA Jewellery. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[12px] text-white/30">
            <Link to="/shipping-policy" className="hover:text-white/60 transition-colors">Shipping Policy</Link>
            <span>·</span>
            <Link to="/returns-policy" className="hover:text-white/60 transition-colors">Returns &amp; Exchanges</Link>
            <span>·</span>
            <Link to="/privacy-policy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-[12px] text-white/30 tracking-[0.08em]">
            VISA &nbsp;·&nbsp; MASTERCARD &nbsp;·&nbsp; UPI &nbsp;·&nbsp; COD
          </p>
        </div>
      </div>
    </footer>
  )
}
