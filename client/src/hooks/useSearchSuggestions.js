import { useState, useEffect, useRef, useCallback } from 'react'
import { getSearchSuggestions } from '../utils/api'

const useSearchSuggestions = () => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef(null)
  const abortRef = useRef(null)

  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()

    setLoading(true)
    try {
      const { data } = await getSearchSuggestions(searchQuery)
      setSuggestions(data.suggestions || [])
      setShowDropdown(true)
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        setSuggestions([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.trim().length < 3) {
      setSuggestions([])
      setShowDropdown(false)
      setLoading(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query.trim())
    }, 350)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, fetchSuggestions])

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setShowDropdown(false)
    setLoading(false)
  }

  const hideDropdown = () => {
    setShowDropdown(false)
  }

  return {
    query,
    setQuery,
    suggestions,
    loading,
    showDropdown,
    clearSearch,
    hideDropdown,
  }
}

export default useSearchSuggestions
