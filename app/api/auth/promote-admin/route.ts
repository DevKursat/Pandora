import { type NextRequest, NextResponse } from "next/server";
import { getFirestore, getFirebaseAuth } from "@/lib/firebase-admin";
import * as admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const auth = getFirebaseAuth();
    const db = getFirestore();
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: "User UID is required" }, { status: 400 });
    }

    const listUsersResult = await auth.listUsers(1000);
    const existingAdmins = listUsersResult.users.filter(user => user.customClaims?.role === 'admin');

    if (existingAdmins.length > 0) {
      return NextResponse.json({ error: "An admin user already exists. Cannot promote another user." }, { status: 403 });
    }

    await auth.setCustomUserClaims(uid, { role: 'admin' });

    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
        const authUser = await auth.getUser(uid);
        await userDocRef.set({
            email: authUser.email,
            role: 'admin',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    } else {
        await userDocRef.update({
            role: 'admin'
        });
    }

    return NextResponse.json({ success: true, message: `User ${uid} has been promoted to admin.` });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to promote user" }, { status: 500 });
  }
}
