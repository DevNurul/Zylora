import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-[#E8A0B0] text-white hover:bg-[#D48A9A] rounded-xl shadow-[0_4px_20px_rgba(238,107,131,0.3)] hover:shadow-[0_6px_28px_rgba(238,107,131,0.4)]',
  gold: 'bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white hover:from-[#A88345] hover:to-[#B8976A] rounded-xl shadow-[0_4px_20px_rgba(201,168,106,0.3)] hover:shadow-[0_6px_28px_rgba(201,168,106,0.4)]',
  outline: 'bg-transparent text-[#B8976A] border border-[#B8976A]/30 hover:bg-[#B8976A]/10 hover:border-[#B8976A] rounded-xl',
  ghost: 'bg-transparent text-[#9A9A9A] hover:bg-white/5 hover:text-white rounded-xl',
  dark: 'bg-[#1C1C1C] text-white border border-[#242424] hover:bg-[#242424] hover:border-[#3A3A3A] rounded-xl',
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
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
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
