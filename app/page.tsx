"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth" // Yeni hook'u kullan
import { SplashScreen } from "@/components/splash-screen"
import { QueryInterface } from "@/components/query-interface"
import { LoginForm } from "@/components/login-form"

export default function HomePage() {
  const { user, loading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (loading || showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} duration={1500} />
  }

  return (
    <main className="min-h-screen">
      {user ? <QueryInterface user={user} /> : <LoginForm />}
    </main>
  )
}
