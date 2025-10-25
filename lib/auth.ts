"use client"

import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";

export type UserRole = "demo" | "vip" | "admin";

export interface User extends FirebaseUser {
  role: UserRole;
}


/**
 * Listens for changes to the user's authentication state.
 * @param callback The function to call when the auth state changes.
 * @returns An unsubscribe function.
 */
export function onAuthUserChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const tokenResult = await firebaseUser.getIdTokenResult();
      const user: User = {
        ...firebaseUser,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        emailVerified: firebaseUser.emailVerified,
        isAnonymous: firebaseUser.isAnonymous,
        tenantId: firebaseUser.tenantId,
        providerData: firebaseUser.providerData,
        providerId: firebaseUser.providerId,
        metadata: firebaseUser.metadata,
        refreshToken: firebaseUser.refreshToken,
        delete: firebaseUser.delete,
        getIdToken: firebaseUser.getIdToken,
        getIdTokenResult: firebaseUser.getIdTokenResult,
        reload: firebaseUser.reload,
        toJSON: firebaseUser.toJSON,
        role: (tokenResult.claims.role as UserRole) || "demo",
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
