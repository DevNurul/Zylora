import { useState } from 'react'

export default function ProductImageGallery({ images, name }) {
  const [selected, setSelected] = useState(0)

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="overflow-hidden bg-[#FCD4DB] aspect-[3/4]">
        <img
          src={images[selected]}
          alt={name}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`flex-1 overflow-hidden border-2 transition-colors ${
              selected === i ? 'border-[#EE6B83]' : 'border-transparent'
            }`}
          >
            <img
              src={img}
              alt={`${name} view ${i + 1}`}
              className="w-full aspect-square object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
