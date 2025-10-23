"use client"

import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";

export type UserRole = "demo" | "vip" | "admin";

export interface User {
  uid: string;
  email: string | null;
  role: UserRole; // Role might be stored elsewhere (e.g., Firestore) in a real app
}

/**
 * Listens for changes to the user's authentication state.
 * @param callback The function to call when the auth state changes.
 * @returns An unsubscribe function.
 */
export function onAuthUserChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      // In a real app, you would fetch the user's role from your database (e.g., Firestore)
      // For this example, we'll assign a default role.
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: "vip", // Default role for any signed-in user
      };
      callback(user);
    } else {
      callback(null);
    }
  });
}

/**
 * Signs the user out.
 */
export async function logout() {
  await signOut(auth);
}

/**
 * A placeholder function to determine user role.
 * In a real application, this would involve checking custom claims or a database.
 */
export function isVipOrAdmin(user: User | null): boolean {
  // This is a simplified check.
  return user?.role === "vip" || user?.role === "admin";
}

export function isAdmin(user: User | null): boolean {
  // This is a simplified check.
  return user?.role === "admin";
}
