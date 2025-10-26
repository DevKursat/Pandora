import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { adminDb, adminAuth } from "@/lib/firebase-admin"
import FirebaseProvider from "./FirebaseProvider"
import { MaintenancePage } from "@/components/maintenance-page"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pandora - İstihbarat Sorgu Sistemi",
  description: "Profesyonel istihbarat sorgu ve analiz sistemi",
  generator: "v0.app",
}

export const dynamic = 'force-dynamic';

async function getMaintenanceStatus() {
  try {
    const settingsDoc = await adminDb.collection('settings').doc('maintenance').get();
    if (settingsDoc.exists) {
      return settingsDoc.data()?.isEnabled || false;
    }
    return false;
  } catch (error) {
    console.error("Error fetching maintenance status:", error);
    return false; // Fail-safe: if DB fails, don't lock out everyone.
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  const isMaintenanceMode = await getMaintenanceStatus();
  let isAdmin = false;

  const sessionCookie = cookies().get("firebaseIdToken")?.value;
  if (sessionCookie) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
      if (decodedToken.role === 'admin') {
        isAdmin = true;
      }
    } catch (error) {
       console.error("Token verification failed in layout:", error);
      // Invalid token, treat as non-admin
    }
  }

  if (isMaintenanceMode && !isAdmin) {
    return (
       <html lang="tr" className="dark" suppressHydrationWarning>
        <body className={`font-sans antialiased`}>
          <MaintenancePage />
           <Analytics />
          <Toaster />
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
