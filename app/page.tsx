"use client"

import { useState, useEffect } from "react"
import { QueryInterface } from "@/components/query-interface"
import { LoginForm } from "@/components/login-form"
import { SplashScreen } from "@/components/splash-screen"
import { onAuthUserChanged } from "@/lib/auth.client"
import type { User } from "firebase/auth"
import { MaintenancePage } from "@/components/maintenance-page"
import { useRouter } from 'next/navigation'


export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthUserChanged((user) => {
      setUser(user)
      setIsChecking(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  if (isChecking) {
    // You can return a loader here if you want
    return null
  }

  if (!user) {
    return <LoginForm onLoginSuccess={() => router.refresh()} />
  }

  return (
    <main className="min-h-screen bg-background">
      <QueryInterface user={user} />
    </main>
  )
}
