import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Minus, ArrowRight } from 'lucide-react'

const FAQS = [
  { id: 1, category: 'General', question: 'What is ZYLARA JEWELLERY?', value: 'What is ZYLARA JEWELLERY?', answer: 'ZYLARA JEWELLERY is a premium jewelry brand focused on delivering stylish, premium-quality apparel and accessories designed for contemporary lifestyles.' },
  { id: 2, category: 'Orders', question: 'How can I place an order?', answer: 'Browse our collections, add the items you love to your cart, and proceed to checkout.' },
  { id: 3, category: 'Payments', question: 'What payment methods do you accept?', answer: 'We accept UPI, credit cards, debit cards, net banking, wallets, and other secure payment methods.' },
  { id: 4, category: 'Orders', question: 'How can I track my order?', answer: 'Tracking details are shared with you after your order has been shipped.' },
  { id: 5, category: 'Shipping', question: 'How long does delivery take?', answer: 'Delivery usually takes 3–7 business days.' },
  { id: 6, category: 'Orders', question: 'Can I cancel my order?', answer: 'Orders can be canceled any time before they are shipped.' },
  { id: 7, category: 'Returns', question: 'Do you offer returns or exchanges?', answer: 'Yes, we offer returns and exchanges, subject to our policy terms.' },
  { id: 8, category: 'Returns', question: 'What if I receive a damaged product?', answer: 'Please contact our support team within 24 hours of delivery.' },
  { id: 9, category: 'General', question: 'How can I contact support?', answer: 'You can reach our support team at care@zylara.co.in.' },
  { id: 10, category: 'Payments', question: 'Are my payments secure?', answer: 'Yes. All payments are processed through PhonePe secure payment gateways.' },
]

const CATEGORIES = ['All', 'General', 'Orders', 'Shipping', 'Returns', 'Payments']
const displayFont = { fontFamily: '"Cormorant Garamond", Georgia, serif' }

export default function FAQsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [openId, setOpenId] = useState(1)

  const visibleFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory
    const matchesQuery = faq.question.toLowerCase().includes(query.trim().toLowerCase())
    return matchesCategory && matchesQuery
  })

  const toggle = (id) => setOpenId((current) => (current === id ? null : id))

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <section className="bg-[#0A0A0A] py-10 md:py-10 md:py-16 px-4 text-center border-b border-[#242424]">
        <p className="uppercase text-[#B8976A] mb-3" style={{ letterSpacing: '0.2em', fontSize: '11px' }}>Help Center</p>
        <h1 className="text-white mb-4" style={{ ...displayFont, fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 400 }}>Frequently Asked Questions</h1>
        <p className="text-[#9A9A9A] max-w-md mx-auto" style={{ fontSize: '15px', lineHeight: 1.7 }}>
          Find answers to the most common questions about shopping with ZYLARA JEWELLERY
        </p>
      </section>

      <div className="max-w-[860px] mx-auto py-10 md:py-10 md:py-16 px-4">
        <div className="relative mb-8">
          <Search size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-[#5C5C5C]" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions..."
            className="w-full bg-transparent border-0 border-b border-[#242424] pl-8 pr-2 py-3 text-[14px] text-white outline-none focus:border-[#B8976A] transition-colors" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 text-[13px] uppercase tracking-[0.06em] transition-all rounded-lg border ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white border-[#B8976A]'
                  : 'bg-[#141414] text-[#9A9A9A] border-[#242424] hover:text-[#B8976A]'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="bg-[#141414] rounded-xl border border-[#242424] overflow-hidden">
          {visibleFaqs.length === 0 ? (
            <p className="text-center text-[14px] text-[#9A9A9A] py-16">No questions match your search.</p>
          ) : (
            visibleFaqs.map((faq) => {
              const isOpen = openId === faq.id
              return (
                <div key={faq.id} className="border-b border-[#242424] last:border-b-0">
                  <button onClick={() => toggle(faq.id)}
                    className="w-full flex items-center justify-between gap-4 text-left py-4 px-6 hover:bg-[#1C1C1C] transition-colors cursor-pointer">
                    <span className="text-[14px] font-medium text-white">{faq.question}</span>
                    {isOpen ? <Minus size={16} className="flex-shrink-0 text-[#9A9A9A]" /> : <Plus size={16} className="flex-shrink-0 text-[#9A9A9A]" />}
                  </button>
                  <div className="overflow-hidden transition-[max-height] duration-[350ms] ease" style={{ maxHeight: isOpen ? '500px' : '0px' }}>
                    <p className="px-6 pb-5 text-[14px] text-[#9A9A9A]" style={{ lineHeight: 1.8 }}>{faq.answer}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <section className="bg-[#1C1C1C] py-12 px-4 text-center border-t border-[#242424]">
        <h2 className="text-white" style={{ ...displayFont, fontSize: '24px', fontWeight: 400 }}>Still have questions?</h2>
        <p className="text-[#9A9A9A] mt-2" style={{ fontSize: '14px' }}>Our team is here to help</p>
        <button onClick={() => navigate('/contact')}
          className="inline-flex items-center gap-2 border border-[#B8976A] px-6 py-3 text-[#B8976A] text-[13px] uppercase tracking-[0.1em] mt-6 hover:bg-[#B8976A] hover:text-white transition-colors rounded-lg">
          Contact Us <ArrowRight size={15} />
        </button>
      </section>
    </div>
  )
}
