"use client"

import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase" // Sadece çıkış için
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

  // Dashboard verileri için tek bir state
  const [dashboardData, setDashboardData] = useState<any>({
    users: [],
    queryLogs: [],
    activeUsers: [],
    notifications: [],
  })

  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userDetails, setUserDetails] = useState<any>({ userDevices: [], userLoginHistory: [] });
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false)

  const [newUser, setNewUser] = useState({ /* ... newUser state'i aynı ... */ });
  const [notification, setNotification] = useState({ message: "", recipients: "all" })
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [disabledQueries, setDisabledQueries] = useState<string[]>([])

  const router = useRouter()

  useEffect(() => {
    if (!authLoading) {
      if (!authUser || authUser.role !== 'admin') {
        router.push("/boss/login");
      } else {
        loadDashboardData();
      }
    }
  }, [authUser, authLoading, router])

  useEffect(() => {
    if (authUser?.role !== 'admin') return
    const interval = setInterval(() => {
      loadDashboardData()
      setLastRefresh(new Date())
    }, 30000) // Yenileme süresini 30 saniyeye çıkardık
    return () => clearInterval(interval)
  }, [authUser])

  const loadDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      if (response.ok) {
        setDashboardData(await response.json());
      } else {
        toast.error("Gösterge paneli verileri yüklenemedi.");
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      toast.error("Gösterge paneli verileri yüklenirken bir hata oluştu.");
    }
  }

  const handleViewDevices = async (user: any) => {
    setSelectedUser(user);
    setIsDeviceDialogOpen(true);
    try {
        const response = await fetch(`/api/admin/users/${user.uid}/details`);
        if(response.ok) {
            setUserDetails(await response.json());
        } else {
            toast.error("Kullanıcı detayları yüklenemedi.");
        }
    } catch (error) {
        console.error("Failed to load user details:", error);
        toast.error("Kullanıcı detayları yüklenirken bir hata oluştu.");
    }
  }

  // handleAddUser, handleDeleteUser, handleUpdateRole, handleSendNotification, handleMaintenanceToggle
  // gibi diğer tüm fonksiyonlar aynı kalıyor, çünkü API rotaları aynı isimde kalacak şekilde düzenlendi.
  // Sadece veri çekme mantığı merkezileştirildi.

  const { users, queryLogs, activeUsers, notifications } = dashboardData;

  if (authLoading || showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} duration={1500} />
  }

  if (authUser?.role !== 'admin') {
    return null
  }

  const stats = [
    { label: "Toplam Kullanıcı", value: users.length.toString(), icon: Users, trend: "+12%" },
    { label: "Aktif Kullanıcılar", value: activeUsers.length.toString(), icon: Activity, trend: "Çevrimiçi" },
    {
      label: "VIP Üyeler",
      value: users.filter((u:any) => u.role === "vip").length.toString(),
      icon: Shield,
      trend: "+15%",
    },
    { label: "Toplam Sorgu", value: queryLogs.length.toString(), icon: Database, trend: "100%" },
  ]

  // ... (Geri kalan tüm JSX, `users`, `queryLogs` vb. değişkenleri doğrudan kullanır, bu yüzden büyük bir değişiklik gerekmez)
  // Sadece handleViewDevices çağrısını düzeltmek yeterlidir.

  return (
     <div className="min-h-screen animated-bg">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        {/* ... Header ... (Değişiklik yok) */}
      </header>

      <div className="container mx-auto px-4 py-4 md:py-6 max-w-7xl">
        {/* ... Stats, Tabs, vs. ... (Tüm JSX aynı kalır, sadece "Detay" düğmesi güncellenir) */}
        {/* Örnek: Kullanıcılar listesindeki "Detay" düğmesi */}
        <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDevices(user)} // Bu fonksiyon zaten güncellenmişti
            className="h-8 text-xs"
        >
            <Eye className="h-3 w-3 mr-1" />
            Detay
        </Button>
        {/* Diğer JSX'ler de aynı şekilde `users`, `queryLogs` vb. kullanmaya devam eder */}
      </div>
      {/* ... Dialogs ... */}
    </div>
  )
}
