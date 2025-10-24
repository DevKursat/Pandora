"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth" // Yeni hook'u kullan
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SplashScreen } from "@/components/splash-screen"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ArrowLeft, Bell, Key, Palette, User as UserIcon, Languages } from "lucide-react"

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash || loading) {
    return <SplashScreen onComplete={() => setShowSplash(false)} duration={1500} />
  }

  if (!user) return null

  return (
    <div className="min-h-screen animated-bg">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
               <UserIcon className="h-6 w-6 md:h-10 md:w-10 text-primary flex-shrink-0" />
               <h1 className="text-sm md:text-xl font-bold text-foreground truncate">Ayarlar</h1>
            </div>
            <Button asChild variant="outline" className="hover:bg-slate-800 text-xs md:text-sm">
              <Link href="/">
                <ArrowLeft className="mr-0 md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Ana Sayfa</span>
              </Link>
            </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6 max-w-4xl">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-slate-800 h-auto">
            <TabsTrigger value="account" className="py-2"><UserIcon className="w-4 h-4 mr-2"/>Hesap</TabsTrigger>
            <TabsTrigger value="appearance" className="py-2"><Palette className="w-4 h-4 mr-2"/>Görünüm</TabsTrigger>
            <TabsTrigger value="notifications" className="py-2"><Bell className="w-4 h-4 mr-2"/>Bildirimler</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card className="bg-slate-900/50 border-slate-800 mt-4">
              <CardHeader>
                <CardTitle>Hesap Bilgileri</CardTitle>
                <CardDescription>Temel hesap bilgilerinizi güncelleyin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" type="email" value={user.email || ""} disabled className="bg-slate-800/50 border-slate-700" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="username">Kullanıcı Adı</Label>
                  <Input id="username" type="text" placeholder="Kullanıcı adınız" className="bg-slate-800/50 border-slate-700" />
                </div>
                <Button>Değişiklikleri Kaydet</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
             <Card className="bg-slate-900/50 border-slate-800 mt-4">
               <CardHeader>
                 <CardTitle>Görünüm</CardTitle>
                 <CardDescription>Arayüzün görünümünü özelleştirin.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="language">Dil</Label>
                   <Select defaultValue="tr">
                     <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700">
                       <SelectValue placeholder="Dil seçin" />
                     </SelectTrigger>
                     <SelectContent className="bg-slate-900 border-slate-800">
                       <SelectItem value="tr">Türkçe</SelectItem>
                       <SelectItem value="en">English</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </CardContent>
             </Card>
          </TabsContent>

           <TabsContent value="notifications">
               <Card className="bg-slate-900/50 border-slate-800 mt-4">
                 <CardHeader>
                   <CardTitle>Bildirimler</CardTitle>
                   <CardDescription>Bildirim tercihlerinizi yönetin.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Bildirim ayarları yakında eklenecek.</p>
                 </CardContent>
               </Card>
           </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  )
}
