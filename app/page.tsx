"use client"

import { useState, useEffect } from "react"
import { QueryInterface } from "@/components/query-interface"
import { LoginForm } from "@/components/login-form"
import { SplashScreen } from "@/components/splash-screen"
import { onAuthUserChanged, User } from "@/lib/auth"
import { MaintenancePage } from "@/components/maintenance-page"
import { useRouter } from 'next/navigation'

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(true);
  const router = useRouter()

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await fetch('/api/admin/maintenance');
        if (res.ok) {
          const data = await res.json();
          setIsMaintenance(data.isEnabled);
        }
      } catch (error) {
        console.error("Bakım modu kontrol edilemedi:", error);
      } finally {
        setIsCheckingMaintenance(false);
      }
    };
    checkMaintenance();

    const unsubscribe = onAuthUserChanged(async (user) => {
      setUser(user)
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        setIsAdmin(tokenResult.claims.role === 'admin' || user.email === 'demo@demo.demo');
      } else {
        setIsAdmin(false);
      }
      setIsCheckingAuth(false)
    })

    return () => unsubscribe()
  }, [])

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  if (isCheckingAuth || isCheckingMaintenance) {
    return null
  }

  if (isMaintenance && !isAdmin) {
      return <MaintenancePage />;
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
