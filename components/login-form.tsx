"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login } from "@/lib/auth"
import { Shield, AlertCircle } from "lucide-react"

interface LoginFormProps {
  onLoginSuccess: () => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const user = login(username, password)
    if (user) {
      onLoginSuccess()
    } else {
      setError("Kullanıcı adı veya şifre hatalı")
    }
    setIsLoading(false)
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
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                type="text"
                placeholder="Kullanıcı adınızı girin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
