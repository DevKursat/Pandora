"use client"

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Yükleniyor...</p></div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p>Profilinizi görüntülemek için lütfen giriş yapın.</p>
        <Link href="/auth/login">
          <Button>Giriş Sayfası</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-3xl">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">Profilim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
            <span className="font-medium">E-posta</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
            <span className="font-medium">Kullanıcı ID</span>
            <span className="text-sm text-gray-400">{user.uid}</span>
          </div>
           <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
            <span className="font-medium">E-posta Doğrulanmış</span>
            <span>{user.emailVerified ? 'Evet' : 'Hayır'}</span>
          </div>
          <div className="pt-4 flex justify-center">
            <Link href="/dashboard">
              <Button variant="outline">Gösterge Paneline Dön</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
