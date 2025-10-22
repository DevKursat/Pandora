"use client"

import { Shield, Wrench } from "lucide-react"
import { Card } from "@/components/ui/card"

export function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center animated-bg p-4">
      <Card className="w-full max-w-2xl border-primary/20 bg-slate-900/50 backdrop-blur-xl p-8 md:p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Shield className="w-24 h-24 md:w-32 md:h-32 text-primary animate-pulse" />
            <Wrench className="w-12 h-12 md:w-16 md:h-16 text-primary absolute bottom-0 right-0 animate-bounce" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">BAKIMDAYIZ</h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-6">
          Sistemimiz şu anda bakım çalışması yapılmaktadır.
        </p>
        <div className="space-y-3 text-sm md:text-base text-muted-foreground">
          <p>Daha iyi hizmet verebilmek için sistemimizi güncelliyoruz.</p>
          <p>Lütfen daha sonra tekrar deneyiniz.</p>
          <p className="text-primary font-semibold mt-6">Anlayışınız için teşekkür ederiz.</p>
        </div>
      </Card>
    </div>
  )
}
