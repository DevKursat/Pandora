import { type NextRequest, NextResponse } from "next/server";
import { getFirestore, getFirebaseAuth } from "@/lib/firebase-admin";
import * as admin from 'firebase-admin';

// API Rotaları, artık her istekte servisleri güvenli bir şekilde alıyor.
export async function GET() {
  try {
    const auth = getFirebaseAuth();
    const db = getFirestore();
    const userRecords = await auth.listUsers(1000);
    const users = await Promise.all(userRecords.users.map(async (user) => {
        const userDoc = await db.collection('users').doc(user.uid).get();
        return {
            uid: user.uid, email: user.email, ...userDoc.data(),
            role: user.customClaims?.role || 'user', vipExpiry: user.customClaims?.vipExpiry || null,
        };
    }));
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getFirebaseAuth();
    const db = getFirestore();
    const userData = await request.json();
    const { email, password, role, vipExpiry, ...profileData } = userData;
    const userRecord = await auth.createUser({ email, password, displayName: profileData.username || profileData.fullName });
    await auth.setCustomUserClaims(userRecord.uid, { role, vipExpiry });
    await db.collection('users').doc(userRecord.uid).set({
        ...profileData, email, role, vipExpiry: vipExpiry || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return NextResponse.json({ uid: userRecord.uid, ...userData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add user" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = getFirebaseAuth();
    const db = getFirestore();
    const { userId, role, vipExpiry } = await request.json();
    await auth.setCustomUserClaims(userId, { role, vipExpiry });
    await db.collection('users').doc(userId).update({ role, vipExpiry });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = getFirebaseAuth();
    const db = getFirestore();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }
    await auth.deleteUser(userId);
    const userDoc = db.collection('users').doc(userId);
    if ((await userDoc.get()).exists) {
        await userDoc.delete();
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
