"use client";

import { onAuthStateChanged as onFirebaseAuthStateChanged, User } from 'firebase/auth';
import { auth as clientAuth } from '@/lib/firebase'; // Client-side auth

/**
 * [CLIENT-SIDE] A wrapper around Firebase's onAuthStateChanged to be used in client components.
 * @param callback The function to call when the auth state changes.
 * @returns An unsubscribe function.
 */
export function onAuthUserChanged(callback: (user: User | null) => void) {
  return onFirebaseAuthStateChanged(clientAuth, callback);
}
