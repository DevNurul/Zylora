import { useRef, useEffect, useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Loader2 } from 'lucide-react'
import useSearchSuggestions from '../../hooks/useSearchSuggestions'

const SuggestionItem = memo(function SuggestionItem({ product, index, activeIndex, onSelect, onHover, query }) {
  const isActive = index === activeIndex

  const highlightMatch = (text) => {
    if (!query || query.length < 3) return text
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-transparent font-semibold text-[#B8976A] not-italic">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  return (
    <li
      role="option"
      aria-selected={isActive}
      onClick={() => onSelect(product)}
      onMouseEnter={() => onHover(index)}
      className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors duration-200 ${
        isActive ? 'bg-[#B8976A]/10' : 'hover:bg-white/5'
      } border-b border-[#242424]/50 last:border-b-0`}
    >
      {/* Product image */}
      <div className="w-12 h-14 flex-shrink-0 overflow-hidden bg-[#141414] rounded-lg">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-[#1C1C1C] flex items-center justify-center">
            <Search className="w-4 h-4 text-[#5C5C5C]" />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-[#5C5C5C] mb-0.5">
          {product.category?.name}
        </p>
        <p className="text-sm font-medium text-white truncate">
          {highlightMatch(product.name)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-white">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.isSale && product.originalPrice && (
            <span className="text-xs text-[#5C5C5C] line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        {product.isNew && (
          <span className="text-[9px] uppercase tracking-wider bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white px-2 py-0.5 rounded-md">
            New
          </span>
        )}
        {product.isSale && (
          <span className="text-[9px] uppercase tracking-wider bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white px-2 py-0.5 rounded-md">
            Sale
          </span>
        )}
      </div>
    </li>
  )
})

const SearchBar = ({ onClose }) => {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  const {
    query,
    setQuery,
    suggestions,
    loading,
    showDropdown,
    clearSearch,
    hideDropdown,
  } = useSearchSuggestions()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setActiveIndex(-1)
  }, [suggestions])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        hideDropdown()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFullSearch = (searchQuery) => {
    const q = searchQuery || query
    if (!q.trim()) return
    clearSearch()
    if (onClose) onClose()
    navigate(`/products?search=${encodeURIComponent(q.trim())}`)
  }

  const handleSuggestionClick = (product) => {
    clearSearch()
    if (onClose) onClose()
    navigate(`/products/${product.slug || product._id}`)
  }

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter') handleFullSearch()
      if (e.key === 'Escape') { clearSearch(); if (onClose) onClose() }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSuggestionClick(suggestions[activeIndex])
        } else {
          handleFullSearch()
        }
        break
      case 'Escape':
        hideDropdown()
        if (onClose) onClose()
        break
      default:
        break
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      {/* Input row */}
      <div className="flex items-center border-b border-[#242424] pb-3">
        <Search className="w-4 h-4 text-[#5C5C5C] flex-shrink-0 mr-3" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          aria-label="Search products"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          role="combobox"
          className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-[#5C5C5C] text-white"
          autoComplete="off"
          spellCheck="false"
        />

        {loading && (
          <Loader2 className="w-4 h-4 text-[#5C5C5C] animate-spin flex-shrink-0 ml-2" />
        )}

        {query && !loading && (
          <button
            onClick={clearSearch}
            className="ml-2 text-[#5C5C5C] hover:text-white transition-colors flex-shrink-0"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hint text */}
      {query.length > 0 && query.length < 3 && (
        <p className="text-xs text-[#5C5C5C] mt-2 ml-7">Keep typing to search...</p>
      )}

      {/* Suggestions dropdown */}
      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 bg-[#141414] border border-[#242424] border-t-0 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-h-[420px] overflow-y-auto animate-fadeIn rounded-b-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Results header */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2.5 border-b border-[#242424]/50 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#5C5C5C]">
                {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => handleFullSearch(query)}
                className="text-[10px] uppercase tracking-wider text-[#B8976A] hover:text-[#E8A0B0] transition-colors"
              >
                View all results →
              </button>
            </div>
          )}

          {/* Suggestion items */}
          {suggestions.length > 0 && (
            <ul>
              {suggestions.map((product, index) => (
                <SuggestionItem
                  key={product._id}
                  product={product}
                  index={index}
                  activeIndex={activeIndex}
                  onSelect={handleSuggestionClick}
                  onHover={setActiveIndex}
                  query={query}
                />
              ))}
            </ul>
          )}

          {/* No results */}
          {!loading && suggestions.length === 0 && query.length >= 3 && (
            <div className="px-4 py-10 text-center">
              <Search className="w-9 h-10 text-[#242424] mx-auto mb-3" />
              <p className="text-sm text-[#5C5C5C]">No products found for</p>
              <p className="text-sm font-medium text-white mt-1">"{query}"</p>
              <button
                onClick={() => handleFullSearch(query)}
                className="mt-4 text-[10px] uppercase tracking-wider border border-[#B8976A]/30 rounded-xl px-4 py-2 text-[#B8976A] hover:bg-[#B8976A]/10 transition-all"
              >
                Search anyway →
              </button>
            </div>
          )}

          {/* View all footer */}
          {suggestions.length > 0 && (
            <div className="border-t border-[#242424]/50">
              <button
                onClick={() => handleFullSearch(query)}
                className="w-full px-4 py-3 text-center text-[10px] uppercase tracking-wider text-[#5C5C5C] hover:bg-white/5 hover:text-white transition-colors"
              >
                See all results for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
