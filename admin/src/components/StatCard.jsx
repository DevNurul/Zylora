export default function StatCard({ label, value, sub, icon: Icon, color = 'bg-white' }) {
  return (
    <div className={`${color} rounded-xl p-5 shadow-sm border border-black/5 flex items-start justify-between`}>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      {Icon && (
        <div className="p-2.5 bg-[#C9A96E]/10 rounded-lg">
          <Icon size={20} className="text-[#C9A96E]" />
        </div>
      )}
    </div>
  )
}
