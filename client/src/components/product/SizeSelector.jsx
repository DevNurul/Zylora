export default function SizeSelector({ sizes, selected, onChange }) {
  const outOfStock = []

  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const isOOS = outOfStock.includes(size)
        return (
          <button
            key={size}
            disabled={isOOS}
            onClick={() => !isOOS && onChange(size)}
            className={`
              px-4 py-2 text-sm border transition-all
              ${isOOS ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through' : ''}
              ${selected === size && !isOOS ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : ''}
              ${selected !== size && !isOOS ? 'border-gray-300 hover:border-[#0A0A0A]' : ''}
            `}
          >
            {size}
          </button>
        )
      })}
    </div>
  )
}
