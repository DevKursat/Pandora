"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase" // Firebase auth örneğini import et

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertCircle, Lock } from "lucide-react"
import { SplashScreen } from "@/components/splash-screen"

export default function AdminLogin() {
  const [showSplash, setShowSplash] = useState(true)
  const [email, setEmail] = useState("") // Artık email kullanıyoruz
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const logSession = async (userId: string, success: boolean, ip: string, location: string) => {
    try {
      await fetch('/api/auth/session-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          success,
          ipAddress: ip,
          userAgent: navigator.userAgent,
          location,
        }),
      });
    } catch (e) {
      console.error("Failed to log session:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // IP ve konum bilgisini al
    let ipAddress = 'Unknown';
    let location = 'Unknown';
    try {
        const ipRes = await fetch('https://ipapi.co/json/');
        if(ipRes.ok) {
            const ipData = await ipRes.json();
            ipAddress = ipData.ip;
            location = `${ipData.city}, ${ipData.country_name}`;
        }
    } catch (ipError) {
        console.error("Could not fetch IP info:", ipError);
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user;

      // Başarılı girişi kaydet
      await logSession(user.uid, true, ipAddress, location);

      // localStorage'ı artık kullanmıyoruz. Firebase'in kendi oturum yönetimi var.
      router.push("/boss")

    } catch (authError: any) {
      let errorMessage = "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
          errorMessage = "E-posta veya şifre yanlış.";
      }
      setError(errorMessage)
      // Başarısız giriş denemesini de kaydet (kullanıcı ID'si olmadan)
      await logSession(email, false, ipAddress, location); // Başarısız denemede UID yerine e-postayı loglayabiliriz
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
          {/* ... (Header aynı kaldı) ... */}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Yönetici E-posta Adresi
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-slate-800/50 border-slate-700 focus:border-primary h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Yönetici Şifresi
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-slate-800/50 border-slate-700 focus:border-primary h-11"
              />
            </div>
            {error && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
              {isLoading ? "Doğrulanıyor..." : "Yönetici Girişi"}
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
