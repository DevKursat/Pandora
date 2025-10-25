"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertCircle, Lock, Eye, EyeOff } from "lucide-react"
import { SplashScreen } from "@/components/splash-screen"

export default function AdminLogin() {
  const [showSplash, setShowSplash] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      // On successful login, the onAuthUserChanged listener in the main
      // admin page will handle redirection. We can just push to the boss page.
      router.push("/boss")
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        setError("Geçersiz e-posta veya şifre.")
      } else {
        setError("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.")
      }
      console.error("Admin login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} duration={1500} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg p-4">
      <Card className="w-full max-w-md border-primary/20 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10 border-2 border-primary/20">
              <Shield className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              Admin Paneli
            </CardTitle>
            <CardDescription className="text-base">Yönetici Girişi</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-posta
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-slate-800/50 border-slate-700 focus:border-primary h-11"
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-sm font-medium">
                Şifre
              </Label>
              <div className="relative">
                 <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-slate-800/50 border-slate-700 focus:border-primary h-11 pr-10"
                 />
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                 >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                 </Button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
              {isLoading ? "Doğrulanıyor..." : "Giriş Yap"}
            </Button>
            <div className="text-center pt-4 border-t border-slate-800">
              <p className="text-xs text-muted-foreground">Bu alan sadece yetkili yöneticiler içindir.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
