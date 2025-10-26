import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import FirebaseProvider from "./FirebaseProvider"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { cookies } from 'next/headers'
import MaintenancePage from './maintenance/page'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pandora - İstihbarat Sorgu Sistemi",
  description: "Profesyonel istihbarat sorgu ve analiz sistemi",
  generator: "v0.app",
}

export const dynamic = 'force-dynamic'; // Force dynamic rendering

async function checkMaintenanceAndAdmin() {
  const absoluteUrl = (path: string) => {
    const host = headers().get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    return `${protocol}://${host}${path}`;
  }

  try {
    const maintenanceRes = await fetch(absoluteUrl('/api/maintenance-check'), { next: { revalidate: 0 } });
    if (!maintenanceRes.ok) throw new Error('Bakım durumu kontrol edilemedi');
    const { isEnabled } = await maintenanceRes.json();

    if (!isEnabled) return { isMaintenance: false, isAdmin: false };

    const token = cookies().get('firebaseIdToken')?.value;
    let isAdmin = false;

    if (token) {
      const verifyRes = await fetch(absoluteUrl('/api/verify-token'), {
        headers: { 'Authorization': `Bearer ${token}` },
        next: { revalidate: 0 }
      });
      if (verifyRes.ok) {
        const { role } = await verifyRes.json();
        if (role === 'admin') {
          isAdmin = true;
        }
      }
    }
    return { isMaintenance: true, isAdmin };
  } catch (error) {
    console.error("Layoutta bakım/admin kontrolü hatası:", error);
    return { isMaintenance: false, isAdmin: false }; // Hata durumunda, kilitlenmeyi önle
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isMaintenance, isAdmin } = await checkMaintenanceAndAdmin();

  if (isMaintenance && !isAdmin) {
    return (
      <html lang="tr" className="dark" suppressHydrationWarning>
        <body className={`font-sans antialiased`}>
          <MaintenancePage />
        </body>
      </html>
    );
  }

  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased`}>
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
