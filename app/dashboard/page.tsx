"use client"

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth'; // Assuming a custom auth hook exists

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Yükleniyor...</p></div>;
  }

  if (!user) {
     // This shouldn't happen if routes are protected, but as a fallback
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p>Lütfen giriş yapın.</p>
        <Link href="/auth/login">
          <Button>Giriş Sayfası</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hoş Geldiniz, {user.email}</h1>
        <nav>
          <Link href="/profile" passHref><Button variant="outline">Profil</Button></Link>
          <Link href="/boss" passHref><Button variant="outline" className="ml-2">Yönetim Paneli</Button></Link>
        </nav>
      </header>
      <main>
        <p>Sorgu panelinize hoş geldiniz. Lütfen menüden bir sorgu türü seçin.</p>
        {/* The main query interface would typically be a component here */}
      </main>
    </div>
  );
}
