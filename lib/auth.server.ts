import { adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

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
    return 'demo'; // Invalid token, default to demo role
  }
}
