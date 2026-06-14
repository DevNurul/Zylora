import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Mail, Clock, Check, ArrowRight } from 'lucide-react'

/* Brand icons — this lucide-react version has no Instagram/Facebook glyphs,
   so we use inline SVGs that match the lucide stroke style. */
const InstagramIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const FacebookIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

// TODO: Replace with real content
const SUBJECTS = [
  'Order Issue',
  'Return or Exchange',
  'Product Question',
  'Payment Issue',
  'Feedback',
  'Other',
]

const CONTACT_INFO = {
  whatsappDisplay: '+91 91083 06669',
  email: 'support@luxorajewellery.com',
  businessDays: 'Monday – Saturday',
  businessHours: '10:00 AM – 7:00 PM IST',
}

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER
const WHATSAPP_MESSAGE = 'Hi LUXORA JEWELLERY! I need help with my order.'
const whatsappUrl = `https://wa.me/${(WHATSAPP_NUMBER || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`

const SOCIALS = [
  {
    Icon: InstagramIcon,
    label: 'Instagram',
    href: 'https://www.instagram.com/luxora.jewellery',
    external: true,
  },
  // TODO: Update Facebook link when available
  { Icon: FacebookIcon, label: 'Facebook', href: '#', external: true },
  { Icon: Mail, label: 'Email', href: 'mailto:support@luxorajewellery.com', external: false },
]

const displayFont = { fontFamily: '"Playfair Display", Georgia, serif' }

const underlineInput =
  'w-full bg-transparent border-0 border-b border-[#E5E5E5] py-2.5 text-[15px] text-[#0A0A0A] outline-none focus:border-[#0A0A0A] transition-colors'

function FieldLabel({ children }) {
  return (
    <label
      className="block uppercase text-[#6B6B6B] mb-1"
      style={{ fontSize: '11px', letterSpacing: '0.06em' }}
    >
      {children}
    </label>
  )
}

function InfoCard({ icon, heading, children }) {
  return (
    <div className="bg-white p-8">
      <div className="mb-3">{icon}</div>
      <h3
        className="uppercase text-[#0A0A0A] mb-2"
        style={{ fontSize: '13px', letterSpacing: '0.08em', fontWeight: 500 }}
      >
        {heading}
      </h3>
      {children}
    </div>
  )
}

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    orderId: '',
  })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Please enter your full name'
    if (!form.email.trim()) newErrors.email = 'Please enter your email address'
    if (!form.subject) newErrors.subject = 'Please select a topic'
    if (!form.message.trim()) newErrors.message = 'Please enter a message'
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    // UI only — simulate sending. Backend email integration can be added later.
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
    }, 1500)
  }

  const resetForm = () => {
    setForm({ name: '', email: '', subject: '', message: '', orderId: '' })
    setErrors({})
    setSent(false)
  }

  return (
    <div className="min-h-screen bg-[#FCD4DB]">
      {/* Hero */}
      <section className="bg-[#0A0A0A] py-16 px-4 text-center">
        <p className="uppercase text-[#EE6B83] mb-3" style={{ letterSpacing: '0.2em', fontSize: '11px' }}>
          Get in Touch
        </p>
        <h1 className="text-white mb-4" style={{ ...displayFont, fontSize: '40px', fontWeight: 400 }}>
          Contact Us
        </h1>
        <p className="text-white/60 max-w-md mx-auto" style={{ fontSize: '15px', lineHeight: 1.7 }}>
          We typically respond within 24 hours on business days
        </p>
      </section>

      {/* Content */}
      <div className="max-w-[860px] mx-auto py-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — Form */}
          <div className="lg:col-span-3">
            <div className="bg-white p-8">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto">
                    <Check size={32} className="text-white" strokeWidth={3} />
                  </div>
                  <h2 className="text-[#0A0A0A] mt-4" style={{ ...displayFont, fontSize: '24px', fontWeight: 400 }}>
                    Message Sent!
                  </h2>
                  <p className="text-[14px] text-[#6B6B6B] mt-2" style={{ lineHeight: 1.8 }}>
                    We will get back to you at {form.email} within 24 hours.
                  </p>
                  <button
                    onClick={resetForm}
                    className="text-[13px] text-[#0A0A0A] font-medium hover:text-[#EE6B83] transition-colors mt-6 underline underline-offset-4"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h2
                    className="uppercase text-[#0A0A0A] mb-6"
                    style={{ fontSize: '13px', letterSpacing: '0.08em', fontWeight: 500 }}
                  >
                    Send us a message
                  </h2>

                  <div className="mb-5">
                    <FieldLabel>Full Name</FieldLabel>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Your full name"
                      className={underlineInput}
                    />
                    {errors.name && <span className="text-[12px] text-red-500 mt-1 block">{errors.name}</span>}
                  </div>

                  <div className="mb-5">
                    <FieldLabel>Email Address</FieldLabel>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="your@email.com"
                      className={underlineInput}
                    />
                    {errors.email && <span className="text-[12px] text-red-500 mt-1 block">{errors.email}</span>}
                  </div>

                  <div className="mb-5">
                    <FieldLabel>Subject</FieldLabel>
                    <select
                      value={form.subject}
                      onChange={set('subject')}
                      className={`${underlineInput} ${form.subject ? 'text-[#0A0A0A]' : 'text-[#6B6B6B]'}`}
                    >
                      <option value="" disabled>
                        Select a topic
                      </option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s} className="text-[#0A0A0A]">
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.subject && <span className="text-[12px] text-red-500 mt-1 block">{errors.subject}</span>}
                  </div>

                  <div className="mb-5">
                    <FieldLabel>Message</FieldLabel>
                    <textarea
                      value={form.message}
                      onChange={set('message')}
                      placeholder="Describe your issue or question in detail..."
                      rows={5}
                      maxLength={1000}
                      className="w-full border border-[#E5E5E5] p-3 text-[14px] text-[#0A0A0A] outline-none focus:border-black transition-colors resize-y"
                    />
                    <div className="flex justify-between">
                      {errors.message ? (
                        <span className="text-[12px] text-red-500">{errors.message}</span>
                      ) : (
                        <span />
                      )}
                      <span className="text-[12px] text-[#6B6B6B]">{form.message.length}/1000</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <FieldLabel>Order ID (optional)</FieldLabel>
                    <input
                      type="text"
                      value={form.orderId}
                      onChange={set('orderId')}
                      placeholder="ORD-XXXXXX (if related to an order)"
                      className={underlineInput}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full h-12 bg-[#EE6B83] text-white text-[13px] uppercase tracking-[0.1em] hover:bg-[#D9506A] transition-colors disabled:opacity-70 disabled:cursor-not-allowed rounded-lg"
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right — Info */}
          <div className="lg:col-span-2 space-y-6">
            <InfoCard icon={<MessageCircle size={22} className="text-[#25D366]" />} heading="WhatsApp">
              <p className="text-[14px] text-[#0A0A0A] font-medium">{CONTACT_INFO.whatsappDisplay}</p>
              <p className="text-[14px] text-[#6B6B6B] mt-1" style={{ lineHeight: 1.8 }}>
                Chat with us directly
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#25D366] text-[13px] mt-3"
              >
                Open WhatsApp <ArrowRight size={13} />
              </a>
            </InfoCard>

            <InfoCard icon={<Mail size={22} className="text-[#0A0A0A]" />} heading="Email">
              <p className="text-[14px] text-[#0A0A0A] font-medium">{CONTACT_INFO.email}</p>
              <p className="text-[14px] text-[#6B6B6B] mt-1" style={{ lineHeight: 1.8 }}>
                We reply within 24 hours
              </p>
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="inline-flex items-center gap-1 text-[#0A0A0A] text-[13px] mt-3 hover:text-[#EE6B83] transition-colors"
              >
                Send Email <ArrowRight size={13} />
              </a>
            </InfoCard>

            <InfoCard icon={<Clock size={22} className="text-[#0A0A0A]" />} heading="Business Hours">
              <div className="text-[14px] text-[#6B6B6B]" style={{ lineHeight: 1.8 }}>
                <p className="text-[#0A0A0A] font-medium">{CONTACT_INFO.businessDays}</p>
                <p>{CONTACT_INFO.businessHours}</p>
                <p>Closed on Sundays and public holidays</p>
              </div>
            </InfoCard>

            {/* Social links */}
            <div className="bg-white p-8">
              <h3
                className="uppercase text-[#0A0A0A] mb-4"
                style={{ fontSize: '13px', letterSpacing: '0.08em', fontWeight: 500 }}
              >
                Follow Us
              </h3>
              <div className="flex gap-3">
                {SOCIALS.map(({ Icon, label, href, external }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    title={label}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:border-black transition-all duration-200"
                  >
                    <Icon size={16} className="text-[#0A0A0A]" />
                  </a>
                ))}
              </div>
            </div>

            {/* FAQ shortcut */}
            <div className="bg-[#FCD4DB] p-5">
              <p className="text-[13px] font-medium text-[#0A0A0A]">Looking for quick answers?</p>
              <p className="text-[14px] text-[#6B6B6B] mt-1" style={{ lineHeight: 1.8 }}>
                Check our FAQ page for instant help
              </p>
              <Link
                to="/faqs"
                className="inline-flex items-center gap-1 uppercase text-[#0A0A0A] text-[13px] mt-3 hover:text-[#EE6B83] transition-colors"
                style={{ letterSpacing: '0.06em' }}
              >
                View FAQs <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
