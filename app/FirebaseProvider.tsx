"use client"

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Helper function to set a cookie
function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

// Helper function to erase a cookie
function eraseCookie(name: string) {
    document.cookie = name+'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if the user is the special admin user
        if (user.email === "demo@demo.demo") {
          try {
            // Call the API to set the admin claim
            await fetch('/api/set-admin-claim', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ uid: user.uid }),
            });
            // Force refresh the token to get the new custom claim
            const tokenResult = await user.getIdTokenResult(true);
            setCookie('firebaseIdToken', tokenResult.token, 7);
          } catch (error) {
            console.error("Failed to set admin claim:", error);
            // If it fails, still set the normal token
            const token = await user.getIdToken();
            setCookie('firebaseIdToken', token, 7);
          }
        } else {
          // For other users, just set the token
          const token = await user.getIdToken();
          setCookie('firebaseIdToken', token, 7); // Set cookie for 7 days
        }
      } else {
        eraseCookie('firebaseIdToken');
      }
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
