import { Loader2 } from 'lucide-react'

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-[#B8976A]" />
    </div>
  )
}
