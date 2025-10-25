import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { auth } from "./firebase";

export type User = FirebaseUser;

export function logout() {
  return signOut(auth);
}

export function onAuthUserChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function isVipOrAdmin(user: User): Promise<boolean> {
    if (!user) return false;
    const tokenResult = await user.getIdTokenResult();
    const role = tokenResult.claims.role;
    return role === 'vip' || role === 'admin';
}
