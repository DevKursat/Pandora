"use client"

import { Shield, Clock } from "lucide-react"

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center animated-bg text-white p-4">
      <div className="text-center p-8 max-w-lg w-full bg-slate-900/50 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10 border-2 border-primary/20">
                <Shield className="w-16 h-16 text-primary" />
            </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Sistem Bakımda</h1>
        <p className="text-base md:text-lg text-muted-foreground mb-8">
          Uygulamayı iyileştirmek için kısa bir süreliğine bakımdayız. Anlayışınız için teşekkür ederiz.
        </p>
        <div className="flex items-center justify-center text-sm text-primary">
          <Clock className="w-5 h-5 mr-2 animate-spin" />
          <span>En kısa sürede geri döneceğiz!</span>
        </div>
      </div>
      <footer className="absolute bottom-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Pandora Sorgu. Tüm hakları saklıdır.
      </footer>
    </div>
  )
}
