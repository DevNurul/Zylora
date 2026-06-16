const COLOR_MAP = {
  Black: '#0A0A0A',
  White: '#FAF8F6',
  Beige: '#E1C699',
  Navy: '#1B2A4A',
}

export default function ColorSelector({ colors, selected, onChange }) {
  return (
    <div className="flex gap-3">
      {colors.map((color) => (
        <button
          key={color}
          title={color}
          onClick={() => onChange(color)}
          className={`w-9 h-10 rounded-full border-2 transition-all ${
            selected === color
              ? 'border-[#B8976A] ring-2 ring-[#B8976A] ring-offset-2 ring-offset-[#141414]'
              : 'border-[#242424] hover:border-[#5C5C5C]'
          }`}
          style={{ backgroundColor: COLOR_MAP[color] || '#ccc' }}
        />
      ))}
    </div>
  )
}
