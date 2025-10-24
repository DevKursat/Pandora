"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth" // Yeni hook'u kullan
import { auth } from "@/lib/firebase" // Firebase auth örneğini import et
import { useRouter } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Home,
  Shield,
  User,
  LogOut,
  Settings,
} from "lucide-react"
import { QueryResult } from "@/components/query-result"
import { toast } from "sonner"

// Gerekli değilse tipi kaldırabilir veya güncelleyebiliriz
type AuthUser = any;

export function QueryInterface({ user }: { user: AuthUser }) {
  const router = useRouter()
  const [api, setApi] = useState("sorgupro")
  const [queryId, setQueryId] = useState("adsoyad")
  const [params, setParams] = useState<Record<string, string>>({})
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    await auth.signOut();
    router.push("/"); // Ana sayfaya veya login sayfasına yönlendir
  };

  const isVip = user.role === 'vip' || user.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ api, queryId, params }),
      })

      const data = await response.json()
      if (response.ok) {
        setResult(data)
        toast.success("Sorgu başarıyla tamamlandı.");
      } else {
        throw new Error(data.error || "Sorgu sırasında bir hata oluştu.")
      }
    } catch (error: any) {
      setResult({ error: error.message })
      toast.error(error.message);
    } finally {
      setIsLoading(false)
    }
  }

  // ... (JSX ve diğer mantık aynı, sadece `logout` yerine `handleSignOut` kullanılır)

  return (
     <div className="min-h-screen animated-bg">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
               <Shield className="h-6 w-6 md:h-10 md:w-10 text-primary flex-shrink-0" />
               <h1 className="text-sm md:text-xl font-bold text-foreground truncate">Pandora Sorgu</h1>
            </div>
            <div className="flex items-center gap-2">
                 <Button variant="outline" size="icon" onClick={() => router.push('/profile')}><User className="h-4 w-4"/></Button>
                 <Button variant="outline" size="icon" onClick={() => router.push('/settings')}><Settings className="h-4 w-4"/></Button>
                 <Button variant="destructive" size="icon" onClick={handleSignOut}><LogOut className="h-4 w-4"/></Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-4 md:py-6 max-w-4xl">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Sorgu Paneli</CardTitle>
                    <CardDescription>Lütfen yapmak istediğiniz sorgu türünü ve parametrelerini girin.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select value={api} onValueChange={setApi}>
                                <SelectTrigger className="bg-slate-800/50 border-slate-700 h-11"><SelectValue/></SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800">
                                    <SelectItem value="sorgupro">SorguPRO</SelectItem>
                                    <SelectItem value="hanedan">Hanedan</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={queryId} onValueChange={setQueryId}>
                                <SelectTrigger className="bg-slate-800/50 border-slate-700 h-11"><SelectValue/></SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800">
                                    <SelectItem value="adsoyad">Ad Soyad</SelectItem>
                                    <SelectItem value="tc">TC Kimlik</SelectItem>
                                     {/* Diğer sorgu türleri... */}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Parametreler</Label>
                            <Input
                                placeholder="Ad"
                                className="bg-slate-800/50 border-slate-700 h-11 mb-2"
                                onChange={(e) => setParams({...params, ad: e.target.value })}/>
                            <Input
                                placeholder="Soyad"
                                className="bg-slate-800/50 border-slate-700 h-11"
                                onChange={(e) => setParams({...params, soyad: e.target.value })}/>
                        </div>
                        <Button type="submit" className="w-full h-11" disabled={isLoading}>
                            {isLoading ? "Sorgulanıyor..." : "Sorgula"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {result && <QueryResult result={result} />}
        </main>
    </div>
  )
}
