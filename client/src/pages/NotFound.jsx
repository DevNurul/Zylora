import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-[#6B6B6B] mb-4">Error</p>
      <h1 className="text-8xl md:text-9xl font-light text-gray-100 leading-none select-none">
        404
      </h1>
      <h2 className="text-2xl font-semibold mt-4 mb-3">Page Not Found</h2>
      <p className="text-[#6B6B6B] text-sm mb-8 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button size="lg" onClick={() => navigate('/')}>
        Back to Home
      </Button>
    </div>
  )
}
