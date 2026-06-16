import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const RouteProgressBar = () => {
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [completing, setCompleting] = useState(false)
  const timerRef = useRef(null)
  const prevLocation = useRef(location)

  useEffect(() => {
    if (prevLocation.current === location) {
      prevLocation.current = location
      return
    }
    prevLocation.current = location

    if (timerRef.current) clearTimeout(timerRef.current)

    setProgress(0)
    setVisible(true)
    setCompleting(false)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setProgress(85)
      })
    })

    timerRef.current = setTimeout(() => {
      setCompleting(true)
      setProgress(100)
      setTimeout(() => {
        setVisible(false)
        setProgress(0)
        setCompleting(false)
      }, 500)
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [location])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 z-29 h-[2px]"
      style={{
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #B8976A, #E8A0B0)',
        transition: completing
          ? 'width 200ms ease-in, opacity 300ms ease-in 200ms'
          : 'width 400ms ease-out',
        boxShadow: '0 0 8px rgba(201,168,106,0.6)',
        opacity: completing ? 0 : 1,
      }}
    />
  )
}

export default RouteProgressBar
