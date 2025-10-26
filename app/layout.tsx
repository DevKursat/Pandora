import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import FirebaseProvider from "./FirebaseProvider"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pandora - İstihbarat Sorgu Sistemi",
  description: "Profesyonel istihbarat sorgu ve analiz sistemi",
  generator: "v0.app",
}

// force-dynamic is not strictly necessary here anymore, but good for consistency.
export const dynamic = 'force-dynamic';

// The RootLayout is now simple. It sets up the basic page structure and providers.
// All complex auth and maintenance checks will be handled by client components inside the pages.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
