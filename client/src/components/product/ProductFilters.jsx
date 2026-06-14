import { useProducts } from '../../hooks/useProducts'
import { formatPrice } from '../../utils/formatPrice'
import { X } from 'lucide-react'

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const ALL_COLORS = [
  { name: 'Black', hex: '#0A0A0A' },
  { name: 'White', hex: '#F0EDE8' },
  { name: 'Beige', hex: '#C9A96E' },
  { name: 'Navy', hex: '#1B2A4A' },
]
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'sale', label: 'On Sale' },
]

function SectionTitle({ children }) {
  return (
    <h3 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#0A0A0A] pb-3 mb-4 border-b border-gray-100">
      {children}
    </h3>
  )
}

export default function ProductFilters({ onClose }) {
  const {
    categories, selectedCategory, sortBy, priceRange,
    selectedSizes, selectedColors,
    setCategory, setSortBy, setPriceRange, toggleSize, toggleColor, clearFilters,
  } = useProducts()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.15em] font-semibold">Filters</span>
        <div className="flex items-center gap-4">
          <button
            onClick={clearFilters}
            className="text-[11px] uppercase tracking-[0.08em] text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors border-b border-transparent hover:border-[#0A0A0A]"
          >
            Clear all
          </button>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-50 rounded">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Sort */}
      <div>
        <SectionTitle>Sort By</SectionTitle>
        <div className="space-y-2">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setSortBy(o.value)}
              className={`block w-full text-left text-[13px] py-1.5 transition-colors ${
                sortBy === o.value
                  ? 'text-[#0A0A0A] font-medium'
                  : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
              }`}
            >
              {o.label}
              {sortBy === o.value && <span className="ml-2 text-[#EE6B83]">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <SectionTitle>Category</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 text-[12px] uppercase tracking-[0.06em] border transition-all duration-150 rounded-lg ${
                selectedCategory === cat
                  ? 'bg-[#EE6B83] text-white border-[#EE6B83]'
                  : 'border-gray-200 text-[#6B6B6B] hover:border-[#EE6B83] hover:text-[#EE6B83]'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <SectionTitle>Price Range</SectionTitle>
        <div className="flex justify-between text-[13px] text-[#6B6B6B] mb-3">
          <span>{formatPrice(priceRange[0])}</span>
          <span className="font-medium text-[#0A0A0A]">{formatPrice(priceRange[1])}</span>
        </div>
        <input
          type="range"
          min={500}
          max={10000}
          step={100}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full"
        />
      </div>

      {/* Sizes */}
      <div>
        <SectionTitle>Size</SectionTitle>
        <div className="grid grid-cols-3 gap-2">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={`py-2 text-[12px] uppercase tracking-wide border transition-all duration-150 rounded-lg ${
                selectedSizes.includes(s)
                  ? 'bg-[#EE6B83] text-white border-[#EE6B83]'
                  : 'border-gray-200 text-[#6B6B6B] hover:border-[#EE6B83] hover:text-[#EE6B83]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <SectionTitle>Color</SectionTitle>
        <div className="flex gap-3 flex-wrap">
          {ALL_COLORS.map((c) => (
            <button
              key={c.name}
              title={c.name}
              onClick={() => toggleColor(c.name)}
              className={`w-8 h-8 rounded-full transition-all duration-150 ${
                selectedColors.includes(c.name)
                  ? 'ring-2 ring-[#EE6B83] ring-offset-2 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: c.hex,
                border: c.name === 'White' ? '1px solid #ddd' : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
