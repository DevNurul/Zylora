const CONFIG = {
  pending:          { label: 'Pending',          bg: '#fefce8', color: '#a16207', border: '#fde68a' },
  confirmed:        { label: 'Confirmed',         bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  shipped:          { label: 'Shipped',           bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' },
  out_for_delivery: { label: 'Out for Delivery',  bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  delivered:        { label: 'Delivered',         bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  cancelled:        { label: 'Cancelled',         bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
}

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || { label: status, bg: '#f3f4f6', color: '#374151', border: '#d1d5db' }
  return (
    <span style={{
      display:       'inline-block',
      fontSize:      '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontWeight:    500,
      padding:       '3px 10px',
      borderRadius:  '3px',
      border:        `1px solid ${cfg.border}`,
      background:    cfg.bg,
      color:         cfg.color,
      whiteSpace:    'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}
