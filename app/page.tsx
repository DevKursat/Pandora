"use client"

import { useState, useEffect } from "react"
import { QueryInterface } from "@/components/query-interface"
import { LoginForm } from "@/components/login-form"
import { SplashScreen } from "@/components/splash-screen"
import { onAuthUserChanged, User } from "@/lib/auth"
import { MaintenancePage } from "@/components/maintenance-page"
import { isMaintenanceMode } from "@/lib/maintenance"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [maintenance, setMaintenance] = useState(false)

  useEffect(() => {
    setMaintenance(isMaintenanceMode())

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

  if (maintenance) {
    return <MaintenancePage />
  }

  if (isChecking) {
    // You can return a loader here if you want
    return null
  }

  if (!user) {
    return <LoginForm onLoginSuccess={() => setIsChecking(true)} />
  }

  return (
    <main className="min-h-screen bg-background">
      <QueryInterface user={user} />
    </main>
  )
}
