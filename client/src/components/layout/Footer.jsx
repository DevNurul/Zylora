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
    href: 'https://www.instagram.com/zylora.jewellery',
    label: 'Instagram',
    external: true,
  },
  { Icon: FacebookIcon, href: '#', label: 'Facebook', external: true },
  { Icon: MailIcon, href: 'mailto:support@zylorajewellery.com', label: 'Email', external: false },
]

export default function Footer() {
  return (
    <footer className="bg-[#0D0D0D] border-t border-[#2A2A2A] text-white mt-24">
      <div className="px-6 md:px-12 lg:px-20 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 lg:gap-16">
          {/* Brand */}
          <div className="text-center sm:text-left space-y-5">
            <div className="flex flex-col items-center sm:items-start select-none group">
              <span className="font-serif text-[1.85rem] tracking-[0.22em] leading-none text-white transition-colors group-hover:text-[#C9A86A]">ZYLORA</span>
              <span className="text-[8.5px] uppercase tracking-[0.38em] text-[#C9A86A] mt-1.5 leading-none pl-[0.38em]">JEWELLERY</span>
            </div>
            <p className="text-[13px] text-[#B3B3B3] leading-relaxed font-light">
              Crafting timeless fine jewelry for the modern collector. Fine 925 sterling silver, lab-grown diamonds, and luxury designs made to shine forever.
            </p>
            <div className="flex gap-3 justify-center sm:justify-start">
              {SOCIAL.map(({ Icon, href, label, external }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  title={label}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="w-10 h-10 border border-[#2A2A2A] rounded-lg flex items-center justify-center hover:border-[#C9A86A] hover:bg-white/5 transition-all duration-300 text-[#B3B3B3] hover:text-white"
                >
                  <Icon width={16} height={16} className="transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="text-center sm:text-left">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A86A] mb-4 sm:mb-6">Shop Collections</h3>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-3 sm:block sm:space-y-3.5">
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-[13px] text-[#B3B3B3] hover:text-[#EE6B83] transition-colors duration-200 font-medium"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="text-center sm:text-left">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A86A] mb-4 sm:mb-6">Customer Care</h3>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-3 sm:block sm:space-y-3.5">
              {HELP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-[13px] text-[#B3B3B3] hover:text-[#EE6B83] transition-colors duration-200 font-medium"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center sm:text-left">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A86A] mb-4 sm:mb-6">Our Boutique</h3>
            <div className="space-y-3 text-[13px] text-[#B3B3B3] font-medium leading-relaxed">
              <p className="hover:text-[#EE6B83] transition-colors">support@zylorajewellery.com</p>
              <p className="hover:text-[#EE6B83] transition-colors">+91 98765 43210</p>
              <p className="text-white/60 leading-relaxed font-light mt-2">
                42, Luxury Fashion Street<br />
                Bandra West, Mumbai<br />
                Maharashtra 400050
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#2A2A2A] px-6 md:px-12 lg:px-20 py-6 bg-[#090909]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[11px] text-[#B3B3B3]/40 tracking-wider">© 2026 ZYLORA Jewellery. All rights reserved.</p>
          <div className="flex items-center gap-3 text-[11px] text-[#B3B3B3]/40 flex-wrap justify-center">
            <Link to="/shipping-policy" className="hover:text-[#EE6B83] transition-colors">Shipping</Link>
            <span>·</span>
            <Link to="/returns-policy" className="hover:text-[#EE6B83] transition-colors">Returns &amp; Warranty</Link>
            <span>·</span>
            <Link to="/privacy-policy" className="hover:text-[#EE6B83] transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-[11px] text-[#B3B3B3]/35 tracking-[0.12em] font-mono uppercase">
            VISA &nbsp;·&nbsp; MASTERCARD &nbsp;·&nbsp; UPI &nbsp;·&nbsp; COD
          </p>
        </div>
      </div>
    </footer>
  )
}
