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
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            selected === color
              ? 'border-[#EE6B83] ring-2 ring-[#EE6B83] ring-offset-2'
              : 'border-gray-200 hover:border-gray-400'
          }`}
          style={{ backgroundColor: COLOR_MAP[color] || '#ccc' }}
        />
      ))}
    </div>
  )
}
