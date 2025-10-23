"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { onAuthUserChanged, User } from "@/lib/auth"
import { SplashScreen } from "@/components/splash-screen"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Shield, ArrowLeft, SettingsIcon, Bell, Eye, Database } from "lucide-react"

const SETTINGS_KEY = "pandora_user_settings"

const defaultSettings = {
  notifications: true, emailAlerts: false, queryHistory: true, autoSave: true,
  darkMode: true, language: "tr", resultsPerPage: "20", cacheResults: true,
  twoFactorAuth: false, sessionTimeout: "30",
};

export default function SettingsPage() {
  const [showSplash, setShowSplash] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const { toast } = useToast()

  const [settings, setSettings] = useState(defaultSettings);

  const router = useRouter()

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthUserChanged((user) => {
      if (!user) {
        router.push("/")
      } else {
        setUser(user)
      }
      setIsChecking(false)
    })
    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }))
  }

  const handleSaveChanges = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    toast({
      title: "Ayarlar Kaydedildi",
      description: "Yaptığınız değişiklikler başarıyla kaydedildi.",
    })

    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);


  if (showSplash || isChecking) {
    return <SplashScreen onComplete={() => setShowSplash(false)} duration={1500} />
  }

  if (!user) return null

  return (
    <div className="min-h-screen animated-bg">
       <Toaster />
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4">
              <Shield className="h-6 w-6 md:h-10 md:w-10 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm md:text-xl font-bold text-foreground truncate">Ayarlar</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Sistem Tercihleri ve Yapılandırma</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="hover:bg-slate-800 text-xs md:text-sm flex-shrink-0"
            >
              <ArrowLeft className="mr-0 md:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ana Sayfa</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-6 max-w-4xl">
        <Tabs defaultValue="general" className="space-y-4 md:space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800 w-full grid grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="general" className="text-xs md:text-sm py-2">
              Genel
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs md:text-sm py-2">
              Bildirimler
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs md:text-sm py-2">
              Gizlilik
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs md:text-sm py-2">
              Gelişmiş
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6 flex items-center gap-2">
                <SettingsIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span className="text-sm md:text-base">Genel Ayarlar</span>
              </h3>
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs md:text-sm">Karanlık Mod</Label>
                    <p className="text-xs text-muted-foreground">Arayüz temasını değiştir</p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Dil</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="tr">Türkçe</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Sayfa Başına Sonuç</Label>
                  <Select
                    value={settings.resultsPerPage}
                    onValueChange={(value) => handleSettingChange("resultsPerPage", value)}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6 flex items-center gap-2">
                <Bell className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span className="text-sm md:text-base">Bildirim Tercihleri</span>
              </h3>
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs md:text-sm">Bildirimler</Label>
                    <p className="text-xs text-muted-foreground">Sistem bildirimlerini etkinleştir</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs md:text-sm">E-posta Uyarıları</Label>
                    <p className="text-xs text-muted-foreground">Önemli olaylar için e-posta al</p>
                  </div>
                  <Switch
                    checked={settings.emailAlerts}
                    onCheckedChange={(checked) => handleSettingChange("emailAlerts", checked)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6 flex items-center gap-2">
                <Eye className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span className="text-sm md:text-base">Gizlilik Ayarları</span>
              </h3>
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs md:text-sm">Sorgu Geçmişi</Label>
                    <p className="text-xs text-muted-foreground">Sorgu geçmişini kaydet</p>
                  </div>
                  <Switch
                    checked={settings.queryHistory}
                    onCheckedChange={(checked) => handleSettingChange("queryHistory", checked)}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs md:text-sm">İki Faktörlü Kimlik Doğrulama</Label>
                    <p className="text-xs text-muted-foreground">Ekstra güvenlik katmanı ekle</p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Oturum Zaman Aşımı (dakika)</Label>
                  <Select
                    value={settings.sessionTimeout}
                    onValueChange={(value) => handleSettingChange("sessionTimeout", value)}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="15">15 dakika</SelectItem>
                      <SelectItem value="30">30 dakika</SelectItem>
                      <SelectItem value="60">1 saat</SelectItem>
                      <SelectItem value="120">2 saat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6 flex items-center gap-2">
                <Database className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span className="text-sm md:text-base">Gelişmiş Ayarlar</span>
              </h3>
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs md:text-sm">Otomatik Kaydet</Label>
                    <p className="text-xs text-muted-foreground">Sorgu parametrelerini otomatik kaydet</p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs md:text-sm">Sonuçları Önbelleğe Al</Label>
                    <p className="text-xs text-muted-foreground">Daha hızlı erişim için sonuçları sakla</p>
                  </div>
                  <Switch
                    checked={settings.cacheResults}
                    onCheckedChange={(checked) => handleSettingChange("cacheResults", checked)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-end gap-2 md:gap-4">
          <Button variant="outline" onClick={() => router.push("/")} className="w-full sm:w-auto" size="sm">
            İptal
          </Button>
          <Button className="w-full sm:w-auto" size="sm" onClick={handleSaveChanges}>
            Değişiklikleri Kaydet
          </Button>
        </div>
      </div>
    </div>
  )
}
