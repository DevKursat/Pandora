"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { onAuthUserChanged } from "@/lib/auth.client"
import { auth, db } from "@/lib/firebase"
import { updatePassword, signOut, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore"
import type { User } from "firebase/auth"
import { SplashScreen } from "@/components/splash-screen"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Shield,
  KeyRound,
  LogOut,
  User as UserIcon,
  Activity,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  Globe,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react"

interface QueryLog {
  id: string
  timestamp: string
  queryId: string
  status: string
}

interface Device {
  id: string
  deviceName: string
  deviceType: string
  browser: string
  os: string
  lastSeen: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isReauth, setIsReauth] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [queryLogs, setQueryLogs] = useState<QueryLog[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [userRole, setUserRole] = useState("demo")
  const [vipExpiryDate, setVipExpiryDate] = useState<string | null>(null)


  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthUserChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser)
        const tokenResult = await authUser.getIdTokenResult()
        setUserRole(tokenResult.claims.role || "demo")
        fetchUserData(authUser.uid)
      } else {
        router.push("/login")
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  const fetchUserData = async (uid: string) => {
    try {
      // Fetch Query Logs
      const logsQuery = query(
        collection(db, "queryLogs"),
        where("uid", "==", uid),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const logsSnapshot = await getDocs(logsQuery);
      const logsData = logsSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            timestamp: new Date(doc.data().timestamp).toLocaleString("tr-TR"),
            queryId: doc.data().body?.queryId || "Bilinmeyen Sorgu",
            status: doc.data().step, // Captures all steps, including errors
          } as QueryLog)
      );
      setQueryLogs(logsData);

       // Fetch user profile data from Firestore for extra details
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setVipExpiryDate(userData.vipExpiryDate || null);
      }

      // Fetch Devices
      const devicesQuery = query(collection(db, "devices"), where("uid", "==", uid), limit(5))
      const devicesSnapshot = await getDocs(devicesQuery)
      const devicesData = devicesSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            deviceName: doc.data().deviceName,
            deviceType: doc.data().deviceType,
            browser: doc.data().browser,
            os: doc.data().os,
            lastSeen: new Date(doc.data().lastSeen).toLocaleString("tr-TR"),
          } as Device)
      )
      setDevices(devicesData)
    } catch (error) {
      console.error("Kullanıcı verileri alınamadı:", error)
      toast({
        title: "Veri Hatası",
        description: "Profil verileriniz yüklenirken bir sorun oluştu.",
        variant: "destructive",
      })
    }
  }

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !user.email) return

    if (newPassword.length < 6) {
      toast({
        title: "Geçersiz Şifre",
        description: "Yeni şifre en az 6 karakter olmalıdır.",
        variant: "destructive",
      })
      return
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
      toast({
        title: "Başarılı!",
        description: "Şifreniz başarıyla güncellendi.",
      })
      setCurrentPassword("")
      setNewPassword("")
      setIsReauth(false)
    } catch (error) {
      console.error("Şifre güncelleme hatası:", error)
      toast({
        title: "Hata!",
        description: "Mevcut şifreniz yanlış veya bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-5 w-5 text-primary" />
      case "tablet":
        return <Tablet className="h-5 w-5 text-primary" />
      default:
        return <Monitor className="h-5 w-5 text-primary" />
    }
  }

  if (loading || !user) {
    return <SplashScreen />
  }

  return (
    <div className="min-h-screen animated-bg py-6 sm:py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader className="flex flex-col sm:flex-row items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <UserIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl font-bold">{user.email}</CardTitle>
              <CardDescription className="flex flex-col sm:flex-row items-center gap-2 justify-center sm:justify-start">
                 <Badge variant={userRole === "admin" || userRole === "vip" ? "default" : "secondary"}>
                  {userRole.toUpperCase()}
                </Badge>
                <span className="hidden sm:inline">•</span>
                <span>ID: {user.uid}</span>
              </CardDescription>
               <div className="text-xs text-muted-foreground mt-2 space-y-1 text-center sm:text-left">
                <p>Oluşturulma: {new Date(user.metadata.creationTime!).toLocaleDateString("tr-TR")}</p>
                {userRole === "vip" && vipExpiryDate && (
                  <p>VIP Bitiş: {new Date(vipExpiryDate).toLocaleDateString("tr-TR")}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
               <Button onClick={() => router.push("/")} variant="outline">
                 <ArrowLeft className="mr-2 h-4 w-4" />
                Geri Dön
              </Button>
              <Button onClick={() => signOut(auth)} variant="destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Şifre Değiştir
              </CardTitle>
              <CardDescription>Güvenliğiniz için şifrenizi periyodik olarak güncelleyin.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Mevcut Şifre</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="bg-slate-800/50 border-slate-700"
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">Yeni Şifre</Label>
                  <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                     className="bg-slate-800/50 border-slate-700 pr-10"
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
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Şifreyi Güncelle
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Son Aktiviteler
              </CardTitle>
              <CardDescription>Hesabınızdaki en son 10 sorgu.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {queryLogs.length > 0 ? (
                  queryLogs.map((log) => (
                    <li
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-md bg-slate-800/50 border border-slate-700"
                    >
                      <div>
                        <p className="text-sm font-medium">{log.queryId}</p>
                        <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                      </div>
                      <Badge variant={log.status === "success" ? "default" : "destructive"}>
                        {log.status}
                      </Badge>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Henüz sorgu kaydınız bulunmuyor.</p>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Kayıtlı Cihazlar
            </CardTitle>
            <CardDescription>Hesabınıza giriş yapmış en son 5 cihaz.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {devices.length > 0 ? (
                devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 flex-wrap gap-2"
                  >
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.deviceType)}
                      <div>
                        <p className="text-sm font-medium">{device.deviceName}</p>
                        <p className="text-xs text-muted-foreground">
                          {device.browser} on {device.os}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Son Görülme: {device.lastSeen}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Kayıtlı cihaz bulunamadı.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
