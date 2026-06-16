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
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'sale', label: 'On Sale' },
]

function SectionTitle({ children }) {
  return (
    <h3 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#9A9A9A] pb-3 mb-4 border-b border-[#242424]/50">
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
        <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-white">Filters</span>
        <div className="flex items-center gap-4">
          <button
            onClick={clearFilters}
            className="text-[11px] uppercase tracking-[0.08em] text-[#5C5C5C] hover:text-white transition-colors border-b border-transparent hover:border-white"
          >
            Clear all
          </button>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/5 rounded-lg text-[#9A9A9A] hover:text-white transition-colors">
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
                  ? 'text-white font-medium'
                  : 'text-[#5C5C5C] hover:text-white'
              }`}
            >
              {o.label}
              {sortBy === o.value && <span className="ml-2 text-[#B8976A]">✓</span>}
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
              className={`px-4 py-1.5 text-[12px] uppercase tracking-[0.06em] border transition-all duration-300 rounded-xl ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white border-transparent'
                  : 'border-[#242424] text-[#5C5C5C] hover:border-[#B8976A] hover:text-[#B8976A]'
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
        <div className="flex justify-between text-[13px] text-[#5C5C5C] mb-3">
          <span>{formatPrice(priceRange[0])}</span>
          <span className="font-medium text-white">{formatPrice(priceRange[1])}</span>
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
              className={`py-2 text-[12px] uppercase tracking-wide border transition-all duration-300 rounded-xl ${
                selectedSizes.includes(s)
                  ? 'bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white border-transparent'
                  : 'border-[#242424] text-[#5C5C5C] hover:border-[#B8976A] hover:text-[#B8976A]'
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
              className={`w-9 h-10 rounded-full transition-all duration-300 ${
                selectedColors.includes(c.name)
                  ? 'ring-2 ring-[#B8976A] ring-offset-2 ring-offset-[#0A0A0A] scale-110'
                  : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: c.hex,
                border: c.name === 'White' ? '1px solid #242424' : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
