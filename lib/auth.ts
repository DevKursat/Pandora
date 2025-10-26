import { adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { onAuthStateChanged as onFirebaseAuthStateChanged, User } from 'firebase/auth';
import { auth as clientAuth } from '@/lib/firebase'; // Client-side auth

/**
 * [SERVER-SIDE] Verifies the Firebase ID token from cookies and returns the user's role.
 * @returns {Promise<string>} The user's role ('admin', 'demo', etc.), or 'demo' if unauthorized.
 */
export async function verifyUserRole() {
  const token = cookies().get('firebaseIdToken')?.value;

  if (!token) {
    return 'demo'; // No token, default to demo role
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.role || 'demo';
  } catch (error) {
    // This can happen if the token is expired or invalid.
    // console.error("Token verification failed:", error);
    return 'demo'; // Invalid token, default to demo role
  }
}

/**
 * [CLIENT-SIDE] A wrapper around Firebase's onAuthStateChanged to be used in client components.
 * @param callback The function to call when the auth state changes.
 * @returns An unsubscribe function.
 */
export function onAuthUserChanged(callback: (user: User | null) => void) {
  return onFirebaseAuthStateChanged(clientAuth, callback);
}
