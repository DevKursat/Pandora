"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface SplashScreenProps {
  onComplete?: () => void
  duration?: number
}

export function SplashScreen({ onComplete, duration = 2000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animated-bg">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        <div className="relative w-40 h-40 animate-pulse">
          <Image src="/logo.jpeg" alt="Logo" width={160} height={160} className="object-contain" priority />
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  )
}
