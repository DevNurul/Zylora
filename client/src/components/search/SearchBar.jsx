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
        <mark key={i} className="bg-transparent font-semibold text-black not-italic">
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
      className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors duration-150 ${
        isActive ? 'bg-[#FCD4DB]' : 'hover:bg-gray-50'
      } border-b border-gray-50 last:border-b-0`}
    >
      {/* Product image */}
      <div className="w-12 h-14 flex-shrink-0 overflow-hidden bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">
          {product.category?.name}
        </p>
        <p className="text-sm font-medium text-black truncate">
          {highlightMatch(product.name)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.isSale && product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        {product.isNew && (
          <span className="text-[10px] uppercase tracking-wider bg-black text-white px-1.5 py-0.5">
            New
          </span>
        )}
        {product.isSale && (
          <span className="text-[10px] uppercase tracking-wider bg-red-500 text-white px-1.5 py-0.5">
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
      <div className="flex items-center border-b border-black pb-2">
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0 mr-3" />

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
          className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-gray-400 text-black"
          autoComplete="off"
          spellCheck="false"
        />

        {loading && (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0 ml-2" />
        )}

        {query && !loading && (
          <button
            onClick={clearSearch}
            className="ml-2 text-gray-400 hover:text-black transition-colors flex-shrink-0"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hint text */}
      {query.length > 0 && query.length < 3 && (
        <p className="text-xs text-gray-400 mt-2 ml-7">Keep typing to search...</p>
      )}

      {/* Suggestions dropdown */}
      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 border-t-0 z-50 shadow-lg max-h-[420px] overflow-y-auto animate-fadeIn [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Results header */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => handleFullSearch(query)}
                className="text-xs uppercase tracking-wider text-black hover:text-gray-500 transition-colors"
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
            <div className="px-4 py-8 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No products found for</p>
              <p className="text-sm font-medium text-black mt-1">"{query}"</p>
              <button
                onClick={() => handleFullSearch(query)}
                className="mt-4 text-xs uppercase tracking-wider border border-[#EE6B83] rounded-lg px-4 py-2 text-[#EE6B83] hover:bg-[#FCD4DB] transition-colors"
              >
                Search anyway →
              </button>
            </div>
          )}

          {/* View all footer */}
          {suggestions.length > 0 && (
            <div className="border-t border-gray-100">
              <button
                onClick={() => handleFullSearch(query)}
                className="w-full px-4 py-3 text-center text-xs uppercase tracking-wider text-gray-500 hover:bg-gray-50 hover:text-black transition-colors"
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
