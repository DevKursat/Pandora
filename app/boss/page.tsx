"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { SplashScreen } from "@/components/splash-screen"
import { onAuthUserChanged, User } from "@/lib/auth"
import { auth } from "@/lib/firebase"
import {
  Shield,
  Users,
  Activity,
  Database,
  ArrowLeft,
  TrendingUp,
  Search,
  UserPlus,
  Trash2,
  Calendar,
  Bell,
  Settings,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  MapPin,
  CreditCard,
  Eye,
  EyeOff,
  RefreshCw,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Clock,
} from "lucide-react"

export default function AdminPanel() {
  const [showSplash, setShowSplash] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [queryLogs, setQueryLogs] = useState<any[]>([])
  const [activeUsers, setActiveUsers] = useState<string[]>([])
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userDevices, setUserDevices] = useState<any[]>([])
  const [userLoginHistory, setUserLoginHistory] = useState<any[]>([])
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false)

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "demo",
    vipExpiry: "",
    email: "",
    phone: "",
    fullName: "",
    address: "",
    city: "",
    country: "Türkiye",
    postalCode: "",
    company: "",
    department: "",
    position: "",
    notes: "",
    maxQueries: "100",
    queryRateLimit: "10",
    ipWhitelist: "",
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: false,
    apiAccess: false,
    exportPermission: false,
    advancedFilters: false,
  })

  const [notification, setNotification] = useState({ message: "", recipients: "all" })
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [disabledQueries, setDisabledQueries] = useState<string[]>([])

  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthUserChanged(async (user) => {
      if (!user) {
        router.push("/boss/login");
        return;
      }
      const tokenResult = await user.getIdTokenResult();
      if (tokenResult.claims.role !== 'admin') {
        router.push("/");
        return;
      }
      setIsAuthorized(true);
      loadAdminData();
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return

    const interval = setInterval(() => {
      loadAdminData()
      setLastRefresh(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [isAuthorized])

  const getAuthHeader = async () => {
    const user = auth.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return { 'Authorization': `Bearer ${token}` };
  }

  const loadAdminData = async () => {
    try {
        const headers = await getAuthHeader();
      const [usersRes, logsRes, activeRes] = await Promise.all([
        fetch("/api/admin/users", { headers }),
        fetch("/api/admin/logs", { headers }),
        fetch("/api/admin/active", { headers }),
      ])

      if (usersRes.ok) setUsers(await usersRes.json())
      if (logsRes.ok) setQueryLogs(await logsRes.json())
      if (activeRes.ok) setActiveUsers(await activeRes.json())
    } catch (error) {
      console.error("Failed to load admin data:", error)
    }
  }

  const loadUserDevices = async (userId: string) => {
    try {
        const headers = await getAuthHeader();
      const [devicesRes, historyRes] = await Promise.all([
        fetch(`/api/admin/devices?userId=${userId}&type=devices`, { headers }),
        fetch(`/api/admin/devices?userId=${userId}&type=history`, { headers }),
      ])

      if (devicesRes.ok) setUserDevices(await devicesRes.json())
      if (historyRes.ok) setUserLoginHistory(await historyRes.json())
    } catch (error) {
      console.error("Failed to load user devices:", error)
    }
  }

  const handleViewDevices = async (user: any) => {
    setSelectedUser(user)
    await loadUserDevices(user.uid)
    setIsDeviceDialogOpen(true)
  }

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
        alert("E-posta ve şifre zorunludur!")
        return
      }

      try {
        const headers = await getAuthHeader();
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(newUser),
        })

        if (response.ok) {
          setIsAddUserOpen(false)
        setNewUser({
          username: "",
          password: "",
          role: "demo",
          vipExpiry: "",
          email: "",
          phone: "",
          fullName: "",
          address: "",
          city: "",
          country: "Türkiye",
          postalCode: "",
          company: "",
          department: "",
          position: "",
          notes: "",
          maxQueries: "100",
          queryRateLimit: "10",
          ipWhitelist: "",
          twoFactorEnabled: false,
          emailNotifications: true,
          smsNotifications: false,
          apiAccess: false,
          exportPermission: false,
          advancedFilters: false,
        })
          loadAdminData()
          alert("Kullanıcı başarıyla eklendi!")
        }
      } catch (error) {
        console.error("Failed to add user:", error)
        alert("Kullanıcı eklenirken hata oluştu!")
      }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return

    try {
        const headers = await getAuthHeader();
      const response = await fetch(`/api/admin/users?uid=${userId}`, { method: "DELETE", headers })
      if (response.ok) {
        loadAdminData()
        alert("Kullanıcı silindi!")
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const handleUpdateRole = async (userId: string, role: string, vipExpiry?: string) => {
    try {
        const headers = await getAuthHeader();
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ uid: userId, role, vipExpiry }),
      })

      if (response.ok) loadAdminData()
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleSendNotification = async () => {
    if (!notification.message) {
      alert("Bildirim mesajı boş olamaz!")
      return
    }

    try {
        const headers = await getAuthHeader();
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(notification),
      })

      if (response.ok) {
        alert("Bildirim gönderildi!")
        setNotification({ message: "", recipients: "all" })
      }
    } catch (error) {
      console.error("Failed to send notification:", error)
    }
  }

  const handleMaintenanceToggle = async () => {
    try {
        const headers = await getAuthHeader();
      const response = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ enabled: !maintenanceMode }),
      })

      if (response.ok) {
        setMaintenanceMode(!maintenanceMode)
        alert(
          maintenanceMode ? "Bakım modu kapatıldı!" : "Bakım modu açıldı! Kullanıcılar BAKIMDAYIZ sayfasını görecek.",
        )
      }
    } catch (error) {
      console.error("Failed to toggle maintenance:", error)
    }
  }

  const handleQueryToggle = async (queryType: string, enabled: boolean) => {
    try {
        const headers = await getAuthHeader();
      const response = await fetch("/api/admin/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ queryType, enabled }),
      })

      if (response.ok) {
        if (enabled) {
          setDisabledQueries(disabledQueries.filter((q) => q !== queryType))
        } else {
          setDisabledQueries([...disabledQueries, queryType])
        }
        alert(`${queryType} sorgusu ${enabled ? "aktif edildi" : "devre dışı bırakıldı"}!`)
      }
    } catch (error) {
      console.error("Failed to toggle query:", error)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return Smartphone
      case "tablet":
        return Tablet
      default:
        return Monitor
    }
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} duration={1500} />
  }

  if (!isAuthorized) {
    return null
  }

  const stats = [
    { label: "Toplam Kullanıcı", value: users.length.toString(), icon: Users, trend: "+12%" },
    { label: "Aktif Kullanıcılar", value: activeUsers.length.toString(), icon: Activity, trend: "Çevrimiçi" },
    {
      label: "VIP Üyeler",
      value: users.filter((u) => u.role === "vip").length.toString(),
      icon: Shield,
      trend: "+15%",
    },
    { label: "Toplam Sorgu", value: queryLogs.length.toString(), icon: Database, trend: "100%" },
  ]

  return (
    <div className="min-h-screen animated-bg">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4">
              <Shield className="h-6 w-6 md:h-10 md:w-10 text-primary" />
              <div>
                <h1 className="text-base md:text-xl font-bold text-foreground">Pandora Yönetim Paneli</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Sistem Yönetimi ve İzleme</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {maintenanceMode && (
                <Badge variant="destructive" className="animate-pulse hidden sm:flex">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Bakım Modu
                </Badge>
              )}
              <Badge variant="outline" className="hidden md:flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs">Canlı</span>
              </Badge>
              <Button
                variant="outline"
                onClick={() => {
                  auth.signOut();
                  router.push("/boss/login")
                }}
                className="hover:bg-slate-800 text-xs md:text-sm"
              >
                <ArrowLeft className="mr-0 md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Çıkış</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-6 max-w-7xl">
        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 md:mb-2">Hoş Geldiniz, Yönetici</h2>
              <p className="text-sm text-muted-foreground">Sistem durumu ve kullanıcı yönetimi</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span>Son güncelleme: {lastRefresh.toLocaleTimeString("tr-TR")}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.trend}
                  </Badge>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </Card>
            )
          })}
        </div>

        <Tabs defaultValue="users" className="space-y-4 md:space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800 w-full overflow-x-auto flex-nowrap justify-start">
            <TabsTrigger value="users" className="text-xs md:text-sm whitespace-nowrap">
              Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="devices" className="text-xs md:text-sm whitespace-nowrap">
              Cihazlar & IP
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs md:text-sm whitespace-nowrap">
              Kayıtlar
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs md:text-sm whitespace-nowrap">
              Aktif
            </TabsTrigger>
            <TabsTrigger value="queries" className="text-xs md:text-sm whitespace-nowrap">
              Sorgu Kontrolü
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs md:text-sm whitespace-nowrap">
              Bildirimler
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs md:text-sm whitespace-nowrap">
              Sistem
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Kullanıcı Listesi</h3>
                </div>
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs md:text-sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Kullanıcı Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-800 max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Yeni Kullanıcı Ekle</DialogTitle>
                      <DialogDescription>
                        Sisteme yeni bir kullanıcı ekleyin ve detaylı ayarları yapın
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Temel Bilgiler
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>E-posta *</Label>
                            <Input
                              value={newUser.email}
                              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                              className="bg-slate-800/50 border-slate-700"
                              placeholder="ornek@email.com"
                            />
                          </div>
                          <div>
                            <Label>Tam Ad</Label>
                            <Input
                              value={newUser.fullName}
                              onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                              className="bg-slate-800/50 border-slate-700"
                              placeholder="Ahmet Yılmaz"
                            />
                          </div>
                          <div className="relative">
                            <Label>Şifre *</Label>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                className="bg-slate-800/50 border-slate-700 pr-10"
                                placeholder="••••••••"
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
                          <div>
                            <Label>Rol *</Label>
                            <Select
                              value={newUser.role}
                              onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-800">
                                <SelectItem value="demo">Demo - Sadece Görüntüleme</SelectItem>
                                <SelectItem value="vip">VIP - Tam Erişim</SelectItem>
                                <SelectItem value="admin">Admin - Yönetici</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          İletişim Bilgileri
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Telefon</Label>
                            <Input
                              value={newUser.phone}
                              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                              className="bg-slate-800/50 border-slate-700"
                              placeholder="+90 555 123 4567"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Location Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Konum Bilgileri
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label>Adres</Label>
                            <Input
                              value={newUser.address}
                              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                              className="bg-slate-800/50 border-slate-700"
                              placeholder="Sokak, Mahalle, No"
                            />
                          </div>
                          <div>
                            <Label>Şehir</Label>
                            <Input
                              value={newUser.city}
                              onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                              className="bg-slate-800/50 border-slate-700"
                              placeholder="İstanbul"
                            />
                          </div>
                          <div>
                            <Label>Ülke</Label>
                            <Input
                              value={newUser.country}
                              onChange={(e) => setNewUser({ ...newUser, country: e.target.value })}
                              className="bg-slate-800/50 border-slate-700"
                            />
                          </div>
                          <div>
                            <Label>Posta Kodu</Label>
                            <Input
                              value={newUser.postalCode}
                              onChange={(e) => setNewUser({ ...newUser, postalCode: e.target.value })}
                              className="bg-slate-800/50 border-slate-700"
                              placeholder="34000"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Organization Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Organizasyon Bilgileri
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Şirket</Label>
                            <Input
                              value={newUser.company}
                              onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                              className="bg-slate-800/50 border-slate-700"
                              placeholder="Şirket Adı"
                            />
                          </div>
                          <div>
                            <Label>Departman</Label>
                            <Input
                              value={newUser.department}
                              onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                              className="bg-slate-800/50 border-slate-700"
                              placeholder="IT, Güvenlik, vb."
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Pozisyon</Label>
                            <Input
                              value={newUser.position}
                              onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                              className="bg-slate-800/50 border-slate-700"
                              placeholder="Güvenlik Uzmanı, Analist, vb."
                            />
                          </div>
                        </div>
                      </div>

                      {/* VIP Settings */}
                      {newUser.role === "vip" && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            VIP Ayarları
                          </h4>
                          <div>
                            <Label>VIP Bitiş Tarihi</Label>
                            <Input
                              type="date"
                              value={newUser.vipExpiry}
                              onChange={(e) => setNewUser({ ...newUser, vipExpiry: e.target.value })}
                              className="bg-slate-800/50 border-slate-700"
                            />
                          </div>
                        </div>
                      )}

                      {/* Query Limits */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Sorgu Limitleri
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Maksimum Sorgu (Günlük)</Label>
                            <Input
                              type="number"
                              value={newUser.maxQueries}
                              onChange={(e) => setNewUser({ ...newUser, maxQueries: e.target.value })}
                              className="bg-slate-800/50 border-slate-700"
                            />
                          </div>
                          <div>
                            <Label>Sorgu Hız Limiti (Dakika)</Label>
                            <Input
                              type="number"
                              value={newUser.queryRateLimit}
                              onChange={(e) => setNewUser({ ...newUser, queryRateLimit: e.target.value })}
                              className="bg-slate-800/50 border-slate-700"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>IP Beyaz Liste (virgülle ayırın)</Label>
                            <Input
                              value={newUser.ipWhitelist}
                              onChange={(e) => setNewUser({ ...newUser, ipWhitelist: e.target.value })}
                              className="bg-slate-800/50 border-slate-700"
                              placeholder="192.168.1.1, 10.0.0.1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Permissions */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          İzinler ve Özellikler
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                            <Label className="cursor-pointer">İki Faktörlü Doğrulama</Label>
                            <Switch
                              checked={newUser.twoFactorEnabled}
                              onCheckedChange={(checked) => setNewUser({ ...newUser, twoFactorEnabled: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                            <Label className="cursor-pointer">E-posta Bildirimleri</Label>
                            <Switch
                              checked={newUser.emailNotifications}
                              onCheckedChange={(checked) => setNewUser({ ...newUser, emailNotifications: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                            <Label className="cursor-pointer">SMS Bildirimleri</Label>
                            <Switch
                              checked={newUser.smsNotifications}
                              onCheckedChange={(checked) => setNewUser({ ...newUser, smsNotifications: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                            <Label className="cursor-pointer">API Erişimi</Label>
                            <Switch
                              checked={newUser.apiAccess}
                              onCheckedChange={(checked) => setNewUser({ ...newUser, apiAccess: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                            <Label className="cursor-pointer">Dışa Aktarma İzni</Label>
                            <Switch
                              checked={newUser.exportPermission}
                              onCheckedChange={(checked) => setNewUser({ ...newUser, exportPermission: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                            <Label className="cursor-pointer">Gelişmiş Filtreler</Label>
                            <Switch
                              checked={newUser.advancedFilters}
                              onCheckedChange={(checked) => setNewUser({ ...newUser, advancedFilters: checked })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-primary">Notlar</h4>
                        <Textarea
                          value={newUser.notes}
                          onChange={(e) => setNewUser({ ...newUser, notes: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 min-h-[100px]"
                          placeholder="Kullanıcı hakkında notlar..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleAddUser} className="flex-1 bg-primary hover:bg-primary/90">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Kullanıcı Ekle
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddUserOpen(false)} className="flex-1">
                          İptal
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <ScrollArea className="h-[400px] md:h-[500px]">
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.uid}
                      className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-primary/50 transition-colors flex-wrap gap-3"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Kayıt: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <Smartphone className="h-3 w-3 mr-1" />
                              {user.deviceCount || 0} Cihaz
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              {user.uniqueIPs || 0} IP
                            </Badge>
                          </div>
                          {user.vipExpiryDate && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              VIP Bitiş: {new Date(user.vipExpiryDate).toLocaleDateString("tr-TR")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={user.role === "admin" ? "default" : user.role === "vip" ? "secondary" : "outline"}
                        >
                          {user.role.toUpperCase()}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDevices(user)}
                          className="h-8 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Detay
                        </Button>
                        {user.email !== "demo@example.com" && (
                          <>
                            <Select
                              value={user.role}
                              onValueChange={(value) => handleUpdateRole(user.uid, value, user.vipExpiryDate)}
                            >
                              <SelectTrigger className="w-20 md:w-24 h-8 bg-slate-800/50 border-slate-700 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-800">
                                <SelectItem value="demo">Demo</SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.uid)}
                              className="h-8 w-8 hover:bg-destructive/20"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Smartphone className="h-5 w-5 text-primary" />
                <h3 className="text-base md:text-lg font-semibold text-foreground">Cihaz ve IP İzleme</h3>
              </div>
              <ScrollArea className="h-[400px] md:h-[500px]">
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.uid}
                      className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{user.email}</p>
                            <Badge variant={user.role === "vip" ? "secondary" : "outline"} className="text-xs mt-1">
                              {user.role.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewDevices(user)} className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Detaylı Görüntüle
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2 p-2 rounded bg-slate-900/50">
                          <Smartphone className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Cihaz Sayısı</p>
                            <p className="text-sm font-medium text-foreground">{user.deviceCount || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded bg-slate-900/50">
                          <Globe className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Farklı IP</p>
                            <p className="text-sm font-medium text-foreground">{user.uniqueIPs || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded bg-slate-900/50">
                          <Clock className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Son Giriş</p>
                            <p className="text-xs font-medium text-foreground">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("tr-TR") : "Yok"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded bg-slate-900/50">
                          <Activity className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Durum</p>
                            <Badge
                              variant={activeUsers.includes(user.email) ? "default" : "outline"}
                              className="text-xs"
                            >
                              {activeUsers.includes(user.email) ? "Aktif" : "Çevrimdışı"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-base md:text-lg font-semibold text-foreground">Sorgu Kayıtları</h3>
              </div>
              <ScrollArea className="h-[400px] md:h-[500px]">
                <div className="space-y-3">
                  {queryLogs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 flex-wrap gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{log.body?.queryId || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.uid} • {new Date(log.timestamp).toLocaleString("tr-TR")}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          log.step === "success" ? "default" : "destructive"
                        }
                        className="text-xs"
                      >
                        {log.step === "success" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {log.step}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-base md:text-lg font-semibold text-foreground">Aktif Kullanıcılar</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeUsers.map((user: any) => (
                  <Card key={user.uid} className="p-4 bg-slate-800/50 border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Users className="h-8 w-8 text-primary" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Çevrimiçi</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="queries" className="space-y-4">
            <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Database className="h-5 w-5 text-primary" />
                <h3 className="text-base md:text-lg font-semibold text-foreground">Sorgu Kontrolü</h3>
              </div>
              <div className="space-y-3">
                {["Ad Soyad", "TC Sorgu", "GSM TC", "Plaka Sorgu", "Tapu Sorgu", "SGK Sorgu"].map((queryType) => (
                  <div
                    key={queryType}
                    className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-slate-800/50 border border-slate-700 flex-wrap gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Database className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{queryType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={disabledQueries.includes(queryType) ? "destructive" : "default"}>
                        {disabledQueries.includes(queryType) ? (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            Devre Dışı
                          </>
                        ) : (
                          <>
                            <Unlock className="h-3 w-3 mr-1" />
                            Aktif
                          </>
                        )}
                      </Badge>
                      <Button
                        size="sm"
                        variant={disabledQueries.includes(queryType) ? "default" : "destructive"}
                        onClick={() => handleQueryToggle(queryType, disabledQueries.includes(queryType))}
                        className="text-xs"
                      >
                        {disabledQueries.includes(queryType) ? "Aktif Et" : "Devre Dışı Bırak"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="text-base md:text-lg font-semibold text-foreground">Bildirim Gönder</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Alıcılar</Label>
                  <Select
                    value={notification.recipients}
                    onValueChange={(value) => setNotification({ ...notification, recipients: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                      <SelectItem value="vip">Sadece VIP Kullanıcılar</SelectItem>
                      <SelectItem value="demo">Sadece Demo Kullanıcılar</SelectItem>
                      <SelectItem value="active">Aktif Kullanıcılar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bildirim Mesajı</Label>
                  <Textarea
                    value={notification.message}
                    onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                    className="bg-slate-800/50 border-slate-700 min-h-[150px]"
                    placeholder="Kullanıcılara gönderilecek bildirim mesajını yazın..."
                  />
                </div>
                <Button onClick={handleSendNotification} className="w-full bg-primary hover:bg-primary/90">
                  <Bell className="mr-2 h-4 w-4" />
                  Bildirim Gönder
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="text-base md:text-lg font-semibold text-foreground">Sistem Ayarları</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700 flex-wrap gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Bakım Modu</h4>
                    <p className="text-xs text-muted-foreground">
                      Sistemi bakım moduna alın. Sadece adminler erişebilir.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={maintenanceMode ? "destructive" : "default"}>
                      {maintenanceMode ? "Aktif" : "Kapalı"}
                    </Badge>
                    <Switch checked={maintenanceMode} onCheckedChange={handleMaintenanceToggle} />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Sistem İstatistikleri</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Toplam Kullanıcı</span>
                      <span className="text-sm font-medium text-foreground">{users.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">VIP Kullanıcılar</span>
                      <span className="text-sm font-medium text-foreground">
                        {users.filter((u) => u.role === "vip").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Toplam Sorgu</span>
                      <span className="text-sm font-medium text-foreground">{queryLogs.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Aktif Kullanıcı</span>
                      <span className="text-sm font-medium text-foreground">{activeUsers.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              {selectedUser?.email} - Cihaz ve Giriş Detayları
            </DialogTitle>
            <DialogDescription>Kullanıcının tüm cihazları ve giriş geçmişi</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Kayıtlı Cihazlar ({userDevices.length})
              </h4>
              <div className="space-y-2">
                {userDevices.map((device) => {
                  const DeviceIcon = getDeviceIcon(device.deviceType)
                  return (
                    <div
                      key={device.id}
                      className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-between flex-wrap gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <DeviceIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{device.deviceName}</p>
                          <p className="text-xs text-muted-foreground">
                            {device.browser} • {device.os}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              {device.ipAddress}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {device.deviceType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">İlk Giriş</p>
                        <p className="text-xs font-medium text-foreground">
                          {new Date(device.firstSeen).toLocaleString("tr-TR")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Son Görülme</p>
                        <p className="text-xs font-medium text-foreground">
                          {new Date(device.lastSeen).toLocaleString("tr-TR")}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {userDevices.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Henüz kayıtlı cihaz yok</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Giriş Geçmişi (Son 50)
              </h4>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {userLoginHistory.slice(0, 50).map((login) => (
                    <div
                      key={login.id}
                      className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${login.success ? "bg-green-500/10" : "bg-red-500/10"}`}>
                          {login.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              {login.ipAddress}
                            </Badge>
                            {login.location && (
                              <Badge variant="secondary" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                {login.location}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(login.timestamp).toLocaleString("tr-TR")}
                          </p>
                        </div>
                      </div>
                      <Badge variant={login.success ? "default" : "destructive"} className="text-xs">
                        {login.success ? "Başarılı" : "Başarısız"}
                      </Badge>
                    </div>
                  ))}
                  {userLoginHistory.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Henüz giriş kaydı yok</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
