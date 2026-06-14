import { Suspense } from 'react'

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
    </div>
  )
}

export default function PageSuspense({ children }) {
  return (
    <Suspense fallback={<PageFallback />}>
      {children}
    </Suspense>
  )
}
