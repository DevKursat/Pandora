"use client";

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // İstemci tarafı auth örneğini import et

interface AuthUser extends User {
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ID jetonunu alarak özel rolleri (custom claims) çek
        const tokenResult = await firebaseUser.getIdTokenResult();
        const userWithRole: AuthUser = {
          ...firebaseUser,
          role: tokenResult.claims.role as string,
        };
        setUser(userWithRole);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, loading };
}
