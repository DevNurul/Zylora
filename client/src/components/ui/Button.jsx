import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-[#EE6B83] text-white hover:bg-[#D9506A] rounded-lg disabled:bg-gray-400',
  outline: 'bg-white text-[#EE6B83] border border-[#EE6B83] hover:bg-[#FCD4DB] hover:text-[#EE6B83] rounded-lg disabled:opacity-50',
  ghost: 'bg-transparent text-[#EE6B83] hover:bg-[#FCD4DB] rounded-lg disabled:opacity-50',
  accent: 'bg-[#EE6B83] text-[#0A0A0A] hover:bg-[#D9506A] hover:text-white rounded-lg disabled:opacity-50',
}

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-medium tracking-wide uppercase
        transition-all duration-300 cursor-pointer
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}
