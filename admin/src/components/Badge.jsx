const STATUS_STYLES = {
  // Order Statuses
  pending:          'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  confirmed:        'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20',
  shipped:          'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
  out_for_delivery: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
  delivered:        'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  cancelled:        'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  
  // Return / Wallet Statuses
  requested:        'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  approved:         'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  rejected:         'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  refunded:         'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
}

export default function Badge({ status }) {
  const normalized = status?.toLowerCase() || ''
  const style = STATUS_STYLES[normalized] || 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
  const label = status?.replace(/_/g, ' ')
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border capitalize transition-all ${style}`}>
      {label}
    </span>
  )
}
