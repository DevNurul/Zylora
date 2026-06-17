import { Link } from 'react-router-dom'

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
  { label: 'Earrings', href: '/products?category=Earrings' },
  { label: 'Necklaces', href: '/products?category=Necklaces' },
  { label: 'Rings', href: '/products?category=Rings' },
  { label: 'Bracelets', href: '/products?category=Bracelets' },
  { label: 'Anklets', href: '/products?category=Anklets' },
  { label: 'Jewelry Sets', href: '/products?category=Sets' },
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
    href: 'https://www.instagram.com/zylara_jewels/',
    label: 'Instagram',
    external: true,
  },
  { Icon: FacebookIcon, href: 'https://www.facebook.com/zylara.official', label: 'Facebook', external: true },
  { Icon: MailIcon, href: 'mailto:care@zylara.co.in', label: 'Email', external: false },
]

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#242424]/50 text-white mt-24">
      <div className="px-6 md:px-12 lg:px-20 py-10 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-12 lg:gap-16">
          {/* Brand */}
          <div className="text-left space-y-5">
            <div className="flex flex-col items-start select-none group">
              <span className="font-serif text-[2rem] tracking-[0.18em] leading-none text-white transition-colors group-hover:text-[#B8976A]">ZYLARA</span>
              <span className="text-[8px] uppercase tracking-[0.35em] text-[#B8976A] mt-1.5 leading-none pl-[0.35em]">JEWELLERY</span>
            </div>
            <p className="text-[13px] text-[#9A9A9A] leading-relaxed font-light">
              Crafting timeless fine jewelry for the modern collector. Fine 925 sterling silver, lab-grown diamonds, and luxury designs made to shine forever.
            </p>
            <div className="flex gap-3 justify-start">
              {SOCIAL.map(({ Icon, href, label, external }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  title={label}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="w-10 h-10 border border-[#242424] rounded-xl flex items-center justify-center hover:border-[#B8976A] hover:bg-[#B8976A]/10 transition-all duration-300 text-[#9A9A9A] hover:text-[#B8976A]"
                >
                  <Icon width={16} height={16} className="transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="text-left">
            <h3 className="text-xs uppercase tracking-[0.18em] font-medium text-[#B8976A] mb-5">Shop Collections</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:space-y-3">
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-[13px] text-[#9A9A9A] hover:text-[#B8976A] transition-colors duration-300 font-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="text-left">
            <h3 className="text-xs uppercase tracking-[0.18em] font-medium text-[#B8976A] mb-5">Customer Care</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:space-y-3">
              {HELP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-[13px] text-[#9A9A9A] hover:text-[#B8976A] transition-colors duration-300 font-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-left">
            <h3 className="text-xs uppercase tracking-[0.18em] font-medium text-[#B8976A] mb-5">Our Boutique</h3>
            <div className="space-y-3 text-[13px] text-[#9A9A9A] font-light leading-relaxed">
              <p className="hover:text-[#B8976A] transition-colors">care@zylara.co.in</p>
              <p className="hover:text-[#B8976A] transition-colors">+91 86378 74951</p>
              <p className="text-white/40 leading-relaxed mt-3">
                Bengaluru, Karnataka 560107<br />
                India
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#242424]/50 px-6 md:px-12 lg:px-20 py-6 bg-[#080808]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[11px] text-[#9A9A9A]/30 tracking-wider">&copy; 2026 ZYLARA. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-[#9A9A9A]/30 flex-wrap justify-center">
            <Link to="/shipping-policy" className="hover:text-[#B8976A] transition-colors">Shipping</Link>
            <span className="text-[#242424]">|</span>
            <Link to="/returns-policy" className="hover:text-[#B8976A] transition-colors">Returns &amp; Warranty</Link>
            <span className="text-[#242424]">|</span>
            <Link to="/privacy-policy" className="hover:text-[#B8976A] transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-[10px] text-[#9A9A9A]/25 tracking-[0.15em] uppercase">
            VISA &middot; MASTERCARD &middot; UPI &middot; COD
          </p>
        </div>
      </div>
    </footer>
  )
}