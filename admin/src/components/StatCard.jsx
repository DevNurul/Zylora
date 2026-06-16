export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-white/5 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
      <div>
        <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1.5 tracking-tight font-sans">{value}</p>
      </div>
      <div className="p-3 bg-brand-light dark:bg-primary/10 text-primary rounded-xl transition-all duration-300 group-hover:scale-105">
        <Icon size={20} className="stroke-[2.2]" />
      </div>
    </div>
  )
}
