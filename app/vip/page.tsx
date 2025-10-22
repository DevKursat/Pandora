"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Check, Star, Zap, Crown, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { SplashScreen } from "@/components/splash-screen"

export default function VIPPage() {
  const [showSplash, setShowSplash] = useState(true)
  const router = useRouter()

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} duration={1500} />
  }

  const features = [
    "Sınırsız sorgu hakkı",
    "Tüm API'lere tam erişim",
    "Öncelikli destek",
    "Hızlı sorgu işleme",
    "Gelişmiş filtreleme",
    "Özel raporlar",
    "API entegrasyonu",
    "7/24 erişim",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Pandora VIP Üyelik</h1>
                <p className="text-xs text-muted-foreground">Premium Erişim</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push("/")} className="hover:bg-slate-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfa
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Crown className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">VIP Üyeliğe Geçin</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Profesyonel istihbarat sorgu sisteminin tüm özelliklerine sınırsız erişim kazanın
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Demo Hesap</h3>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4" />
                Sorguları görüntüleme
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4" />
                Sınırlı erişim
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground line-through">
                <Check className="h-4 w-4" />
                Sorgu yapma
              </div>
            </div>
            <Badge variant="outline" className="w-full justify-center py-2">
              Ücretsiz
            </Badge>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/20 to-accent/20 border-primary relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-4 right-4">
              <Star className="h-6 w-6 text-primary fill-primary" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">VIP Üyelik</h3>
            </div>
            <div className="space-y-3 mb-6">
              {features.slice(0, 3).map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </div>
              ))}
              <p className="text-xs text-muted-foreground">+5 özellik daha...</p>
            </div>
            <Badge className="w-full justify-center py-2 bg-primary text-primary-foreground">
              <Zap className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </Card>
        </div>

        <Card className="p-8 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">VIP Üyelik Özellikleri</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground">VIP üyelik için bizimle iletişime geçin</p>
            <Button size="lg" className="w-full md:w-auto" asChild>
              <a href="https://t.me/ErSocietyPlus" target="_blank" rel="noopener noreferrer">
                <Shield className="mr-2 h-5 w-5" />
                Telegram'dan İletişime Geç
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">@ErSocietyPlus</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
