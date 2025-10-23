"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertCircle } from "lucide-react"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "next/navigation"

interface LoginFormProps {
  onLoginSuccess: () => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    let finalEmail = email;
    let finalPassword = password;

    // Demo user check
    if (email === "demo" && password === "demo") {
      // Use a real demo account's credentials
      finalEmail = "demo@example.com";
      finalPassword = "demopassword";
    }

    try {
      await signInWithEmailAndPassword(auth, finalEmail, finalPassword)
      onLoginSuccess()
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError("E-posta veya şifre hatalı.")
      } else {
        setError("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg p-4">
      <Card className="w-full max-w-md border-primary/20 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader className="space-y-4">
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Pandora
            </CardTitle>
            <CardDescription>Sorgu Sistemi</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="text"
                placeholder="E-postanızı veya 'demo' yazın"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-slate-800/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-slate-800/50"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
            <div className="text-sm text-muted-foreground text-center space-y-1">
              <p>Demo Hesap: demo / demo</p>
              <p className="text-xs">
                VIP erişim için:{" "}
                <a
                  href="https://t.me/ErSocietyPlus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  @ErSocietyPlus
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
