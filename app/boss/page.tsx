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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { SplashScreen } from "@/components/splash-screen"
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

import { useAuth } from "@/hooks/useAuth"

export default function AdminPanel() {
  const { user: authUser, loading: authLoading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [queryLogs, setQueryLogs] = useState<any[]>([])
  const [activeUsers, setActiveUsers] = useState<string[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
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
    if (!authLoading) {
      // Yükleme tamamlandıktan sonra, kullanıcı yoksa veya admin değilse login sayfasına yönlendir.
      if (!authUser || authUser.role !== 'admin') {
        router.push("/boss/login");
      } else {
        loadAdminData();
      }
    }
  }, [authUser, authLoading, router])

  useEffect(() => {
    // Sadece admin yetkisine sahip kullanıcılar için periyodik veri yenileme
    if (authUser?.role !== 'admin') return

    const interval = setInterval(() => {
      loadAdminData()
      setLastRefresh(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [authUser])

  const loadAdminData = async () => {
    try {
      const [usersRes, logsRes, activeRes, notificationsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/logs"),
        fetch("/api/admin/active"),
        fetch("/api/admin/notifications"),
      ])

      if (usersRes.ok) setUsers(await usersRes.json())
      if (logsRes.ok) setQueryLogs(await logsRes.json())
      if (activeRes.ok) setActiveUsers(await activeRes.json())
      if (notificationsRes.ok) setNotifications(await notificationsRes.json())
    } catch (error) {
      console.error("Failed to load admin data:", error)
    }
  }

  const loadUserDevices = async (userId: string) => {
    try {
      // API'ler artık daha spesifik, bu yüzden ayrı çağrılar yapıyoruz.
      const [devicesRes, historyRes] = await Promise.all([
        fetch(`/api/admin/devices?userId=${userId}&type=devices`),
        fetch(`/api/admin/devices?userId=${userId}&type=history`),
      ])

      if (devicesRes.ok) setUserDevices(await devicesRes.json())
      if (historyRes.ok) setUserLoginHistory(await historyRes.json())
    } catch (error) {
      console.error("Failed to load user devices:", error)
    }
  }

  const handleViewDevices = async (user: any) => {
    setSelectedUser(user)
    // Firebase UID'sini kullan
    await loadUserDevices(user.uid)
    setIsDeviceDialogOpen(true)
  }

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast.error("E-posta ve şifre zorunludur!");
      return;
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const result = await response.json();

      if (response.ok) {
        setIsAddUserOpen(false);
        setNewUser({
          username: "", password: "", role: "demo", vipExpiry: "", email: "", phone: "", fullName: "", address: "",
          city: "", country: "Türkiye", postalCode: "", company: "", department: "", position: "", notes: "",
          maxQueries: "100", queryRateLimit: "10", ipWhitelist: "", twoFactorEnabled: false, emailNotifications: true,
          smsNotifications: false, apiAccess: false, exportPermission: false, advancedFilters: false,
        });
        loadAdminData();
        toast.success("Kullanıcı başarıyla eklendi!");
      } else {
        toast.error(`Kullanıcı eklenemedi: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to add user:", error);
      toast.error("Kullanıcı eklenirken bir hata oluştu!");
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" })
      if (response.ok) {
        loadAdminData()
        toast.success("Kullanıcı başarıyla silindi!");
      } else {
        const result = await response.json();
        toast.error(`Kullanıcı silinemedi: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast.error("Kullanıcı silinirken bir hata oluştu.");
    }
  }

  const handleUpdateRole = async (userId: string, role: string, vipExpiry?: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role, vipExpiry }),
      })

      if (response.ok) {
        loadAdminData()
        toast.success("Kullanıcı rolü güncellendi!");
      } else {
        const result = await response.json();
        toast.error(`Rol güncellenemedi: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Kullanıcı rolü güncellenirken bir hata oluştu.");
    }
  }

  const handleSendNotification = async () => {
    if (!notification.message) {
      toast.error("Bildirim mesajı boş olamaz!");
      return;
    }

    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
      });

      if (response.ok) {
        toast.success("Bildirim başarıyla gönderildi!");
        setNotification({ message: "", recipients: "all" });
        loadAdminData(); // Bildirim listesini yenile
      } else {
        const result = await response.json();
        toast.error(`Bildirim gönderilemedi: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
      toast.error("Bildirim gönderilirken bir hata oluştu.");
    }
  }

  const handleMaintenanceToggle = async () => {
    try {
      const idToken = await authUser?.getIdToken();
      const response = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ enabled: !maintenanceMode }),
      })

      const result = await response.json();
      if (response.ok) {
        setMaintenanceMode(result.maintenanceMode);
        toast.success(
          result.maintenanceMode ? "Bakım modu başarıyla açıldı!" : "Bakım modu başarıyla kapatıldı!"
        );
      } else {
        toast.error(`Hata: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to toggle maintenance:", error);
      toast.error("Bakım modu değiştirilirken bir hata oluştu.");
    }
  }

  const handleQueryToggle = async (queryType: string, enabled: boolean) => {
    try {
      const response = await fetch("/api/admin/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  if (authLoading || showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} duration={1500} />
  }

  // Yükleme tamamlandıysa ve kullanıcı admin değilse, hiçbir şey render etme (yönlendirme gerçekleşiyor).
  if (authUser?.role !== 'admin') {
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

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-slate-900 border-slate-800">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Bildirimler</h4>
                      <p className="text-sm text-muted-foreground">
                        Son 20 bildirim aşağıda listelenmiştir.
                      </p>
                    </div>
                    <ScrollArea className="h-64">
                      <div className="grid gap-2">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="mb-2 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                          >
                            <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                            <div className="grid gap-1">
                              <p className="text-sm font-medium leading-none">
                                {notif.message}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(notif.createdAt.seconds * 1000).toLocaleString('tr-TR')}
                              </p>
                            </div>
                          </div>
                        ))}
                         {notifications.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">Yeni bildirim yok.</p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                onClick={async () => {
                  await auth.signOut();
                  router.push("/boss/login");
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
                  <DialogContent className="bg-slate-900 border-slate-800 max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Yeni Kullanıcı Ekle</DialogTitle>
                      <DialogDescription>
                        Sisteme yeni bir kullanıcı ekleyin ve detaylı ayarları yapın
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] p-2">
                    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                      {/* AccordionItem 1: Temel Bilgiler */}
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          <h4 className="text-sm font-semibold text-primary flex items-center gap-2"><Shield className="h-4 w-4" />Temel Bilgiler</h4>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid md:grid-cols-2 gap-4 p-2">
                            <div>
                              <Label>E-posta *</Label>
                              <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="bg-slate-800/50 border-slate-700" placeholder="ornek@email.com" />
                            </div>
                            <div className="relative">
                              <Label>Şifre *</Label>
                              <div className="relative">
                                <Input type={showPassword ? "text" : "password"} value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="bg-slate-800/50 border-slate-700 pr-10" placeholder="••••••••" />
                                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setShowPassword(!showPassword)}>
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label>Kullanıcı Adı</Label>
                              <Input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="bg-slate-800/50 border-slate-700" placeholder="kullanici123"/>
                            </div>
                            <div>
                              <Label>Tam Ad</Label>
                              <Input value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} className="bg-slate-800/50 border-slate-700" placeholder="Ahmet Yılmaz"/>
                            </div>
                            <div>
                              <Label>Rol *</Label>
                              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                                <SelectTrigger className="bg-slate-800/50 border-slate-700"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800">
                                  <SelectItem value="demo">Demo</SelectItem>
                                  <SelectItem value="vip">VIP</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {newUser.role === "vip" && (
                              <div>
                                <Label>VIP Bitiş Tarihi</Label>
                                <Input type="date" value={newUser.vipExpiry} onChange={(e) => setNewUser({ ...newUser, vipExpiry: e.target.value })} className="bg-slate-800/50 border-slate-700"/>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      {/* AccordionItem 2: İletişim & Konum */}
                      <AccordionItem value="item-2">
                        <AccordionTrigger>
                          <h4 className="text-sm font-semibold text-primary flex items-center gap-2"><Mail className="h-4 w-4" />İletişim & Konum</h4>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid md:grid-cols-2 gap-4 p-2">
                             <div>
                                <Label>Telefon</Label>
                                <Input value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} className="bg-slate-800/50 border-slate-700" placeholder="+90 555 123 4567"/>
                              </div>
                              <div className="md:col-span-2">
                                <Label>Adres</Label>
                                <Input value={newUser.address} onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} className="bg-slate-800/50 border-slate-700" placeholder="Sokak, Mahalle, No"/>
                              </div>
                              <div>
                                <Label>Şehir</Label>
                                <Input value={newUser.city} onChange={(e) => setNewUser({ ...newUser, city: e.target.value })} className="bg-slate-800/50 border-slate-700" placeholder="İstanbul"/>
                              </div>
                              <div>
                                <Label>Posta Kodu</Label>
                                <Input value={newUser.postalCode} onChange={(e) => setNewUser({ ...newUser, postalCode: e.target.value })} className="bg-slate-800/50 border-slate-700" placeholder="34000"/>
                              </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      {/* AccordionItem 3: Sorgu Limitleri & İzinler */}
                      <AccordionItem value="item-3">
                        <AccordionTrigger>
                          <h4 className="text-sm font-semibold text-primary flex items-center gap-2"><Database className="h-4 w-4" />Sorgu Limitleri & İzinler</h4>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="space-y-4 p-2">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Maksimum Sorgu (Günlük)</Label>
                                  <Input type="number" value={newUser.maxQueries} onChange={(e) => setNewUser({ ...newUser, maxQueries: e.target.value })} className="bg-slate-800/50 border-slate-700"/>
                                </div>
                                <div>
                                  <Label>Sorgu Hız Limiti (Dakika)</Label>
                                  <Input type="number" value={newUser.queryRateLimit} onChange={(e) => setNewUser({ ...newUser, queryRateLimit: e.target.value })} className="bg-slate-800/50 border-slate-700"/>
                                </div>
                                <div className="md:col-span-2">
                                  <Label>IP Beyaz Liste (virgülle ayırın)</Label>
                                  <Input value={newUser.ipWhitelist} onChange={(e) => setNewUser({ ...newUser, ipWhitelist: e.target.value })} className="bg-slate-800/50 border-slate-700" placeholder="192.168.1.1, 10.0.0.1"/>
                                </div>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                                  <Label className="cursor-pointer">API Erişimi</Label>
                                  <Switch checked={newUser.apiAccess} onCheckedChange={(checked) => setNewUser({ ...newUser, apiAccess: checked })}/>
                                </div>
                                 <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                                  <Label className="cursor-pointer">İki Faktörlü Doğrulama</Label>
                                  <Switch checked={newUser.twoFactorEnabled} onCheckedChange={(checked) => setNewUser({ ...newUser, twoFactorEnabled: checked })}/>
                                </div>
                              </div>
                           </div>
                        </AccordionContent>
                      </AccordionItem>
                       {/* AccordionItem 4: Notlar */}
                      <AccordionItem value="item-4">
                        <AccordionTrigger>
                           <h4 className="text-sm font-semibold text-primary flex items-center gap-2">Notlar</h4>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="p-2">
                             <Textarea value={newUser.notes} onChange={(e) => setNewUser({ ...newUser, notes: e.target.value })} className="bg-slate-800/50 border-slate-700 min-h-[100px]" placeholder="Kullanıcı hakkında notlar..."/>
                           </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    </ScrollArea>
                    <div className="flex gap-2 p-2">
                      <Button onClick={handleAddUser} className="flex-1 bg-primary hover:bg-primary/90">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Kullanıcı Ekle
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddUserOpen(false)} className="flex-1">
                        İptal
                      </Button>
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
                          <p className="text-sm font-medium text-foreground">{user.username || user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <Smartphone className="h-3 w-3 mr-1" />
                              {user.devices?.length || 0} Cihaz
                            </Badge>
                            {/* Aktif kullanıcı durumu API'den geliyorsa gösterilebilir */}
                          </div>
                          {user.vipExpiry && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              VIP Bitiş: {new Date(user.vipExpiry).toLocaleDateString("tr-TR")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={user.role === "admin" ? "default" : user.role === "vip" ? "secondary" : "outline"}
                        >
                          {user.role?.toUpperCase() || "USER"}
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
                        {/* Demo admin kullanıcısı silinemez/düzenlenemez kontrolü eklenebilir */}
                        <>
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleUpdateRole(user.uid, value, user.vipExpiry)}
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
                      key={user.id}
                      className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{user.username}</p>
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
                              variant={activeUsers.includes(user.username) ? "default" : "outline"}
                              className="text-xs"
                            >
                              {activeUsers.includes(user.username) ? "Aktif" : "Çevrimdışı"}
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
                  {queryLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 flex-wrap gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{log.queryType}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.username} • {new Date(log.timestamp).toLocaleString("tr-TR")}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          log.status === "success" ? "default" : log.status === "denied" ? "secondary" : "destructive"
                        }
                        className="text-xs"
                      >
                        {log.status === "success" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {log.status}
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
                {activeUsers.map((username) => (
                  <Card key={username} className="p-4 bg-slate-800/50 border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Users className="h-8 w-8 text-primary" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{username}</p>
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
              {selectedUser?.username} - Cihaz ve Giriş Detayları
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
