import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import FirebaseProvider from "./FirebaseProvider"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { cookies } from 'next/headers'
import MaintenancePage from './maintenance/page'
import { adminDb, adminAuth } from '@/lib/firebase-admin'; // Doğrudan SDK'yı içe aktar

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pandora - İstihbarat Sorgu Sistemi",
  description: "Profesyonel istihbarat sorgu ve analiz sistemi",
  generator: "v0.app",
}

export const dynamic = 'force-dynamic'; // Dinamik render'ı zorla

// API çağrıları yerine doğrudan Firebase Admin SDK kullanarak bakım ve admin durumunu kontrol et
async function checkMaintenanceAndAdmin() {
  try {
    // Bakım durumunu doğrudan Firestore'dan kontrol et
    const maintenanceRef = adminDb.collection('settings').doc('maintenance');
    const doc = await maintenanceRef.get();
    const isMaintenanceEnabled = doc.exists && doc.data()?.enabled === true;

    // Bakım modu kapalıysa, daha fazla kontrol yapmaya gerek yok
    if (!isMaintenanceEnabled) {
      return { isMaintenance: false, isAdmin: false };
    }

    // Bakım modu açıksa, kullanıcının admin olup olmadığını kontrol et
    const token = cookies().get('firebaseIdToken')?.value;
    let isAdmin = false;

    if (token) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        if (decodedToken.role === 'admin') {
          isAdmin = true;
        }
      } catch (error) {
        // Token doğrulama hatası (ör. süresi dolmuş), admin olmadığını varsay
        console.warn("Token doğrulama hatası:", error);
        isAdmin = false;
      }
    }

    return { isMaintenance: true, isAdmin };

  } catch (error) {
    console.error("Layout'ta bakım/admin durumu kontrol edilirken hata oluştu:", error);
    // Hata durumunda, kullanıcıların kilitlenmesini önlemek için bakım modunu kapalı varsay
    return { isMaintenance: false, isAdmin: false };
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
      <body className={`font-sans antialiased`}>
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
