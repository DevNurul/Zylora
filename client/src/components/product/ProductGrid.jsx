import ProductCard from './ProductCard'
import EmptyState from '../ui/EmptyState'
import { Search } from 'lucide-react'

function SkeletonCard() {
  return (
    <div>
      <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
      <div className="pt-3 space-y-2">
        <div className="h-2.5 bg-gray-200 animate-pulse w-1/3 rounded" />
        <div className="h-3.5 bg-gray-200 animate-pulse w-3/4 rounded" />
        <div className="h-3 bg-gray-200 animate-pulse w-1/4 rounded" />
      </div>
    </div>
  )
}

export default function ProductGrid({ products, loading, total }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-[#9CA3AF] mb-6">
        {products.length} {total ? `of ${total}` : ''} product{products.length !== 1 ? 's' : ''}
      </p>

      {products.length === 0 ? (
        <EmptyState
          icon={Search}
          heading="No products found"
          subtext="Try adjusting your filters or search query"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
