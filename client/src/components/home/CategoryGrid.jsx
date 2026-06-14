import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'

export default function CategoryGrid() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => {})
  }, [])

  if (categories.length === 0) return null

  return (
    <section className="px-4 md:px-8 lg:px-16 py-16">
      <div className="flex items-end justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold">Shop by Category</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.slice(0, 4).map((cat) => (
          <div
            key={cat._id}
            className="relative overflow-hidden cursor-pointer group aspect-[3/4]"
            onClick={() => navigate(`/products?category=${cat.name}`)}
          >
            <img
              src={cat.image?.url || `https://picsum.photos/seed/${cat.name}/400/600`}
              alt={cat.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-4 text-white">
              <h3 className="text-lg font-medium leading-tight">{cat.name}</h3>
              <p className="text-xs text-white/70 mt-1 group-hover:text-[#EE6B83] transition-colors">Shop Now →</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
