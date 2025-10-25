"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  User,
  Award as IdCard,
  MessageCircle,
  Globe,
  Server,
  Lock,
  Cloud,
  MapPin,
  FileText,
  CreditCard,
  Facebook,
  GraduationCap,
  Wifi,
  Shield,
  Car,
  Home,
  Users,
  School,
  Building,
  Phone,
  Instagram,
  Bug,
  Gamepad2,
  Flag,
  ImageIcon,
  LogOut,
  Filter,
  X,
  ChevronRight,
  Settings,
  UserCircle,
} from "lucide-react"
import { QueryResult } from "@/components/query-result"
import { logout, isVipOrAdmin, User as AuthUser } from "@/lib/auth"
import { SplashScreen } from "@/components/splash-screen"
import { useRouter } from "next/navigation"

interface QueryInterfaceProps {
  user: AuthUser | null
}

const queryCategories = [
  {
    id: "kisisel",
    name: "Kişisel Bilgiler",
    icon: User,
    queries: [
      // Hanedan APIs
      { id: "hanedan_ad_soyad", name: "Ad-Soyad", icon: User, params: ["ad", "soyad"], api: "hanedan" },
      {
        id: "hanedan_ad_soyad_pro",
        name: "Ad-Soyad Pro",
        icon: User,
        params: ["ad", "soyad", "il", "ilce"],
        api: "hanedan",
      },
      { id: "hanedan_ad_il_ilce", name: "Ad-İl-İlçe", icon: MapPin, params: ["ad", "il", "ilce"], api: "hanedan" },
      { id: "hanedan_tcpro", name: "TC Pro", icon: IdCard, params: ["tc"], api: "hanedan" },
      { id: "hanedan_tc", name: "TC Sorgu", icon: IdCard, params: ["tc"], api: "hanedan" },
      { id: "hanedan_tc_gsm", name: "TC-GSM Sorgu", icon: Phone, params: ["tc"], api: "hanedan" },
      { id: "hanedan_gsm_tc", name: "GSM-TC Sorgu", icon: Phone, params: ["gsm"], api: "hanedan" },
      { id: "hanedan_adres", name: "Adres Sorgu", icon: MapPin, params: ["tc"], api: "hanedan" },
      { id: "hanedan_vesika", name: "Vesika", icon: FileText, params: ["tc"], api: "hanedan" },
      { id: "hanedan_yabanci", name: "Yabancı Sorgu", icon: User, params: ["ad", "soyad"], api: "hanedan" },
      // Pandora APIs
      { id: "ad_soyad", name: "Ad-Soyad (Pandora)", icon: User, params: ["ad", "soyad"], api: "pandora" },
      { id: "tc_sorgulama", name: "TC Sorgulama", icon: IdCard, params: ["tc"], api: "pandora" },
      { id: "tcpro", name: "TC Pro (Pandora)", icon: IdCard, params: ["tc"], api: "pandora" },
    ],
  },
  {
    id: "aile",
    name: "Aile & Hane",
    icon: Home,
    queries: [
      { id: "hanedan_hane", name: "Hane Sorgu", icon: Home, params: ["tc"], api: "hanedan" },
      { id: "hanedan_aile", name: "Aile Sorgu", icon: Users, params: ["tc"], api: "hanedan" },
      { id: "hanedan_sulale", name: "Sülale Sorgu", icon: Users, params: ["tc"], api: "hanedan" },
    ],
  },
  {
    id: "egitim",
    name: "Eğitim",
    icon: GraduationCap,
    queries: [
      { id: "hanedan_ogretmen", name: "Öğretmen", icon: School, params: ["ad", "soyad"], api: "hanedan" },
      { id: "hanedan_okulno", name: "Okul No Sorgu", icon: School, params: ["tc"], api: "hanedan" },
      { id: "hanedan_lgs", name: "LGS Sorgu", icon: GraduationCap, params: ["tc"], api: "hanedan" },
      { id: "hanedan_uni", name: "ÜNİ Sorgu", icon: GraduationCap, params: ["tc"], api: "hanedan" },
      { id: "hanedan_sertifika", name: "Sertifika", icon: FileText, params: ["tc"], api: "hanedan" },
      { id: "e_kurs", name: "E-Kurs Sorgu", icon: GraduationCap, params: ["tc", "okulno"], api: "pandora" },
      { id: "diploma", name: "Diploma Sorgu", icon: GraduationCap, params: ["tc"], api: "pandora" },
      { id: "sertifika2", name: "Sertifika (Pandora)", icon: FileText, params: ["tc"], api: "pandora" },
    ],
  },
  {
    id: "sosyal",
    name: "Sosyal Medya",
    icon: MessageCircle,
    queries: [
      { id: "hanedan_facebook", name: "Facebook", icon: Facebook, params: ["ad", "soyad"], api: "hanedan" },
      { id: "hanedan_instagram", name: "Instagram", icon: Instagram, params: ["usr"], api: "hanedan" },
      { id: "telegram", name: "Telegram Sorgu", icon: MessageCircle, params: ["kullanici"], api: "pandora" },
      { id: "facebook_hanedan", name: "Facebook (Pandora)", icon: Facebook, params: ["ad", "soyad"], api: "pandora" },
    ],
  },
  {
    id: "arac",
    name: "Araç & Plaka",
    icon: Car,
    queries: [
      { id: "hanedan_plaka", name: "Plaka Sorgu", icon: Car, params: ["plaka"], api: "hanedan" },
      { id: "hanedan_isim_plaka", name: "İsim-Plaka Sorgu", icon: Car, params: ["isim"], api: "hanedan" },
      { id: "hanedan_plaka_borc", name: "Plaka Borç Sorgu", icon: CreditCard, params: ["plaka"], api: "hanedan" },
      { id: "hanedan_plaka_parca", name: "Plaka Parça Sorgu", icon: Car, params: ["plaka"], api: "hanedan" },
    ],
  },
  {
    id: "finans",
    name: "Finans",
    icon: CreditCard,
    queries: [
      { id: "hanedan_papara", name: "Papara Sorgu", icon: CreditCard, params: ["paparano"], api: "hanedan" },
      { id: "hanedan_ininal", name: "İNİNAL Sorgu", icon: CreditCard, params: ["ininal_no"], api: "hanedan" },
      { id: "vergi_levhasi", name: "Vergi Levhası", icon: CreditCard, params: ["tc"], api: "pandora" },
    ],
  },
  {
    id: "resmi",
    name: "Resmi Kayıtlar",
    icon: FileText,
    queries: [
      { id: "hanedan_tapu", name: "Tapu", icon: Building, params: ["tc"], api: "hanedan" },
      { id: "hanedan_is_kaydi", name: "İş Kaydı", icon: Building, params: ["adsoyad"], api: "hanedan" },
      { id: "hanedan_secmen", name: "Seçmen 2015", icon: Flag, params: ["tc"], api: "hanedan" },
      { id: "hanedan_firma", name: "Firma Sorgu", icon: Building, params: ["unvan"], api: "hanedan" },
      { id: "ada_parsel", name: "Ada-Parsel Sorgu", icon: MapPin, params: ["il", "ada", "parsel"], api: "pandora" },
    ],
  },
  {
    id: "network",
    name: "Ağ Araçları",
    icon: Globe,
    queries: [
      { id: "hanedan_log", name: "Log Çekme", icon: Bug, params: ["site"], api: "hanedan" },
      { id: "hanedan_internet_ariza", name: "İnternet Arıza", icon: Wifi, params: ["tc"], api: "hanedan" },
      { id: "hanedan_operator", name: "Operator Sorgu", icon: Phone, params: ["gsm"], api: "hanedan" },
      { id: "ip", name: "IP Sorgusu", icon: Globe, params: ["domain"], api: "pandora" },
      { id: "dns", name: "DNS Sorgu", icon: Server, params: ["domain"], api: "pandora" },
      { id: "subdomain", name: "Subdomain Sorgu", icon: Server, params: ["url"], api: "pandora" },
      { id: "ip_premium", name: "IP Premium", icon: Globe, params: ["domain"], api: "pandora" },
      { id: "internet", name: "İnternet Sorgu", icon: Wifi, params: ["tc"], api: "pandora" },
    ],
  },
  {
    id: "guvenlik",
    name: "Güvenlik",
    icon: Shield,
    queries: [
      { id: "sifre_encrypt", name: "Şifre Encrypt", icon: Lock, params: ["method", "password"], api: "pandora" },
      { id: "interpol", name: "İnterpol Sorgu", icon: Shield, params: ["tc"], api: "pandora" },
    ],
  },
  {
    id: "diger",
    name: "Diğer",
    icon: Cloud,
    queries: [
      { id: "hanedan_craftrise", name: "Craftrise Sorgu", icon: Gamepad2, params: ["ad"], api: "hanedan" },
      { id: "hanedan_akp", name: "AKP Sorgu", icon: Flag, params: ["ad", "soyad"], api: "hanedan" },
      { id: "hanedan_smsbomber", name: "SMS Bomber", icon: MessageCircle, params: ["number"], api: "hanedan" },
      { id: "hanedan_aifoto", name: "AI Foto", icon: ImageIcon, params: ["img"], api: "hanedan" },
      { id: "hava_durumu", name: "Hava Durumu", icon: Cloud, params: ["sehir"], api: "pandora" },
    ],
  },
]

export function QueryInterface({ user }: QueryInterfaceProps) {
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null)
  const [queryParams, setQueryParams] = useState<Record<string, string>>({})
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState("kisisel")
  const [searchFilter, setSearchFilter] = useState("")
  const [showSplash, setShowSplash] = useState(false)
  const router = useRouter()

  const canExecuteQuery = isVipOrAdmin(user)

  const handleLogout = () => {
    setShowSplash(true)
    setTimeout(() => {
      logout()
      window.location.reload()
    }, 1000)
  }

  const handleQuerySelect = (queryId: string) => {
    setSelectedQuery(queryId)
    setQueryParams({})
    setResult(null)
  }

  const handleParamChange = (param: string, value: string) => {
    setQueryParams((prev) => ({ ...prev, [param]: value }))
  }

  const handleSubmit = async () => {
    if (!selectedQuery) return

    if (!canExecuteQuery) {
      setResult({
        error: "VIP erişim gerekli",
        message: "Sorgu yapmak için VIP üyelik gereklidir. Telegram: @ErSocietyPlus",
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const currentQuery = queryCategories.flatMap((cat) => cat.queries).find((q) => q.id === selectedQuery)

      if (!currentQuery) return

      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          queryId: selectedQuery,
          params: queryParams,
          api: currentQuery.api,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("[v0] Query error:", error)
      setResult({ error: "Sorgu sırasında bir hata oluştu" })
    } finally {
      setLoading(false)
    }
  }

  const currentQuery = queryCategories.flatMap((cat) => cat.queries).find((q) => q.id === selectedQuery)

  const getParamLabel = (param: string): string => {
    const labels: Record<string, string> = {
      tc: "TC Kimlik No",
      ad: "Ad",
      soyad: "Soyad",
      kullanici: "Kullanıcı Adı",
      domain: "Domain",
      url: "URL",
      method: "Şifreleme Metodu (md5, sha1, sha256)",
      password: "Şifre",
      sehir: "Şehir",
      okulno: "Okul No",
      il: "İl",
      ilce: "İlçe",
      ada: "Ada",
      parsel: "Parsel",
      gsm: "GSM Numarası",
      usr: "Kullanıcı Adı",
      site: "Site URL",
      plaka: "Plaka",
      isim: "İsim",
      paparano: "Papara No",
      ininal_no: "İNİNAL No",
      unvan: "Firma Ünvanı",
      adsoyad: "Ad Soyad",
      number: "Telefon Numarası",
      img: "Resim Açıklaması",
    }
    return labels[param] || param
  }

  const filteredCategories = queryCategories
    .map((category) => ({
      ...category,
      queries: category.queries.filter((query) => query.name.toLowerCase().includes(searchFilter.toLowerCase())),
    }))
    .filter((category) => category.queries.length > 0)

  if (showSplash) {
    return <SplashScreen onComplete={() => {}} duration={1000} />
  }

  return (
    <div className="min-h-screen animated-bg">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3">
              <Shield className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              <div>
                <h1 className="text-base md:text-xl font-bold text-foreground">Pandora</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Sorgu Sistemi</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/profile")}
                className="hover:bg-slate-800 h-8 w-8 md:h-10 md:w-10"
              >
                <UserCircle className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/settings")}
                className="hover:bg-slate-800 h-8 w-8 md:h-10 md:w-10"
              >
                <Settings className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
                <Badge
                  variant={user?.role === "admin" ? "default" : user?.role === "vip" ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {user?.role === "admin" ? "YÖNETİCİ" : user?.role === "vip" ? "VIP" : "DEMO"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-slate-800 h-8 w-8 md:h-10 md:w-10"
              >
                <LogOut className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-6 max-w-7xl">
        <div className="grid lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-4 md:gap-6">
          <aside className="space-y-4">
            <Card className="p-3 md:p-4 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <Filter className="h-4 w-4 text-primary" />
                <h2 className="text-xs md:text-sm font-semibold text-foreground">Sorgu Ara</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sorgu türü ara..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9 pr-9 bg-slate-800/50 border-slate-700 text-sm"
                />
                {searchFilter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchFilter("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-3 md:p-4 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <h2 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 text-foreground flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                Sorgu Kategorileri
              </h2>
              <ScrollArea className="h-[calc(100vh-280px)] md:h-[calc(100vh-300px)]">
                <div className="space-y-1">
                  {filteredCategories.map((category) => {
                    const Icon = category.icon
                    const isActive = activeCategory === category.id
                    return (
                      <div key={category.id} className="space-y-1">
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start text-xs md:text-sm font-medium hover:bg-slate-800"
                          onClick={() => setActiveCategory(category.id)}
                        >
                          <Icon className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                          <span className="truncate">{category.name}</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {category.queries.length}
                          </Badge>
                        </Button>
                        {isActive && (
                          <div className="space-y-0.5 pl-4 md:pl-6 py-1">
                            {category.queries.map((query) => {
                              const QueryIcon = query.icon
                              return (
                                <Button
                                  key={query.id}
                                  variant={selectedQuery === query.id ? "default" : "ghost"}
                                  className="w-full justify-start text-xs h-8 hover:bg-slate-800"
                                  onClick={() => handleQuerySelect(query.id)}
                                >
                                  <QueryIcon className="mr-2 h-3 w-3" />
                                  <span className="truncate">{query.name}</span>
                                </Button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </Card>
          </aside>

          <main className="space-y-4 md:space-y-6">
            {!canExecuteQuery && (
              <Card className="p-3 md:p-4 bg-destructive/10 border-destructive/20 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-destructive mb-1 text-sm md:text-base">VIP Erişim Gerekli</h3>
                    <p className="text-xs md:text-sm text-destructive/80 mb-2">
                      Demo hesabı ile sadece sorguları görüntüleyebilirsiniz. Sorgu yapmak için VIP üyelik gereklidir.
                    </p>
                    <Button size="sm" variant="destructive" asChild className="text-xs">
                      <a href="https://t.me/ErSocietyPlus" target="_blank" rel="noopener noreferrer">
                        VIP Üyelik Al
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-4 md:p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              {selectedQuery ? (
                <>
                  <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 border-b border-slate-800">
                    {currentQuery && <currentQuery.icon className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base md:text-xl font-semibold text-foreground truncate">
                        {currentQuery?.name}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        API: {currentQuery?.api === "hanedan" ? "Hanedan System" : "Pandora"}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {currentQuery?.params.length} Parametre
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {currentQuery?.params.map((param) => (
                      <div key={param}>
                        <label className="text-xs md:text-sm font-medium text-foreground mb-2 block">
                          {getParamLabel(param)}
                        </label>
                        <Input
                          placeholder={`${getParamLabel(param)} giriniz...`}
                          value={queryParams[param] || ""}
                          onChange={(e) => handleParamChange(param, e.target.value)}
                          className="bg-slate-800/50 border-slate-700 text-sm"
                        />
                      </div>
                    ))}

                    <Button
                      onClick={handleSubmit}
                      disabled={loading || !currentQuery?.params.every((p) => queryParams[p])}
                      className="w-full"
                      size="lg"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      {loading ? "Sorgulanıyor..." : "Sorgula"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 md:py-16 text-muted-foreground">
                  <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Search className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">Sorgu Seçin</h3>
                  <p className="text-xs md:text-sm">Sol menüden bir sorgu türü seçerek başlayın</p>
                </div>
              )}
            </Card>

            {result && <QueryResult data={result} queryType={selectedQuery} />}
          </main>
        </div>
      </div>
    </div>
  )
}
