"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SplashScreen } from "@/components/splash-screen"
import {
  Shield,
  ArrowLeft,
  User as UserIcon,
  Calendar,
  Activity,
  Award,
  Clock,
  TrendingUp,
  Database,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"


export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const [stats, setStats] = useState<any | null>(null)
  const [profileData, setProfileData] = useState<any | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    } else if (user) {
      loadUserProfile(user.uid)
      loadUserStats(user.uid)
    }
  }, [user, loading, router])

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const loadUserProfile = async (uid: string) => {
    try {
      // Bu API rotasını bir sonraki adımda oluşturacağız
      const res = await fetch(`/api/profile/${uid}`);
      if(res.ok){
        setProfileData(await res.json());
      }
    } catch (error) {
      console.error("Failed to load user profile:", error)
    }
  }

  const loadUserStats = async (uid: string) => {
    try {
      // Bu API rotasını bir sonraki adımda oluşturacağız
      const res = await fetch(`/api/profile/stats/${uid}`);
      if(res.ok){
        setStats(await res.json());
      }
    } catch (error) {
      console.error("Failed to load user stats:", error);
      setStats({ totalQueries: 0, successfulQueries: 0, lastQuery: null, accountAge: 0, vipDaysRemaining: null });
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      toast.info("Bu özellik şu anda demo aşamasındadır.");
      // Gerçek şifre güncelleme mantığı buraya eklenebilir.
  }

  if (showSplash || loading || !stats || !profileData) {
    return <SplashScreen onComplete={() => setShowSplash(false)} duration={1500} />
  }

  if (!user) return null

  const isVip = profileData?.role === 'vip' || profileData?.role === 'admin';
  const vipDaysRemaining = profileData?.vipExpiry ? Math.ceil((new Date(profileData.vipExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="min-h-screen animated-bg">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4">
              <Shield className="h-6 w-6 md:h-10 md:w-10 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm md:text-xl font-bold text-foreground truncate">Profil Yönetimi</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Hesap Bilgileri ve İstatistikler</p>
              </div>
            </div>
            <Button asChild variant="outline" className="hover:bg-slate-800 text-xs md:text-sm flex-shrink-0">
              <Link href="/">
                <ArrowLeft className="mr-0 md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Ana Sayfa</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-6 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
          <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 rounded-lg bg-primary/10">
                <UserIcon className="h-4 w-4 md:h-6 md:w-6 text-primary" />
              </div>
              <Badge
                variant={profileData.role === "admin" ? "default" : profileData.role === "vip" ? "secondary" : "outline"}
                className="text-xs"
              >
                {profileData.role?.toUpperCase() || 'USER'}
              </Badge>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1 truncate">{profileData.fullName || user.email}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{user.email}</p>
          </Card>

          <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1">{stats.accountAge} Gün</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Hesap Yaşı</p>
          </Card>

          <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 rounded-lg bg-primary/10">
                <Award className="h-4 w-4 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1">
              {vipDaysRemaining !== null ? `${vipDaysRemaining} Gün` : "N/A"}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">VIP Kalan Süre</p>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800 w-full grid grid-cols-3 h-auto">
            <TabsTrigger value="overview" className="text-xs md:text-sm py-2">
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs md:text-sm py-2">
              Aktivite
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs md:text-sm py-2">
              Güvenlik
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6 flex items-center gap-2">
                <Activity className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span className="text-sm md:text-base">Sorgu İstatistikleri</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <div className="p-3 md:p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <Database className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <p className="text-xs md:text-sm text-muted-foreground">Toplam Sorgu</p>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-foreground">{stats.totalQueries}</p>
                </div>
                <div className="p-3 md:p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                    <p className="text-xs md:text-sm text-muted-foreground">Başarılı</p>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-foreground">{stats.successfulQueries}</p>
                </div>
                <div className="p-3 md:p-4 rounded-lg bg-slate-800/50 border border-slate-700 sm:col-span-3 lg:col-span-1">
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <p className="text-xs md:text-sm text-muted-foreground">Başarı Oranı</p>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {stats.totalQueries > 0 ? Math.round((stats.successfulQueries / stats.totalQueries) * 100) : 0}%
                  </p>
                </div>
              </div>
            </Card>

            {!isVip && (
              <Card className="p-4 md:p-6 bg-primary/10 border-primary/20 backdrop-blur-sm">
                 {/* ... VIP Reklamı ... */}
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 md:space-y-6">
             {/* ... Aktivite Sekmesi ... */}
          </TabsContent>

          <TabsContent value="security" className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6 flex items-center gap-2">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span className="text-sm md:text-base">Güvenlik Ayarları</span>
              </h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <Label className="text-xs md:text-sm">Mevcut Şifre</Label>
                  <Input type="password" placeholder="••••••••" className="bg-slate-800/50 border-slate-700 mt-2 text-sm" />
                </div>
                <div>
                  <Label className="text-xs md:text-sm">Yeni Şifre</Label>
                  <Input type="password" placeholder="••••••••" className="bg-slate-800/50 border-slate-700 mt-2 text-sm" />
                </div>
                <div>
                  <Label className="text-xs md:text-sm">Yeni Şifre (Tekrar)</Label>
                  <Input type="password" placeholder="••••••••" className="bg-slate-800/50 border-slate-700 mt-2 text-sm" />
                </div>
                <Button type="submit" className="w-full" size="sm">
                  Şifreyi Güncelle
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
