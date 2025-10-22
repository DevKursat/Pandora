"use client"

import { useState, useEffect } from "react"
import { QueryInterface } from "@/components/query-interface"
import { LoginForm } from "@/components/login-form"
import { SplashScreen } from "@/components/splash-screen"
import { MaintenancePage } from "@/components/maintenance-page"
import { getCurrentUser } from "@/lib/auth"
import { isMaintenanceMode } from "@/lib/maintenance"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [maintenance, setMaintenance] = useState(false)

  useEffect(() => {
    setMaintenance(isMaintenanceMode())

    const user = getCurrentUser()
    setIsAuthenticated(!!user)
    setIsChecking(false)
  }, [])

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  if (maintenance) {
    return <MaintenancePage />
  }

  if (isChecking) {
    return null
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return (
    <main className="min-h-screen bg-background">
      <QueryInterface />
    </main>
  )
}
