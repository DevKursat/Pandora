import { type NextRequest, NextResponse } from "next/server";
import * as admin from 'firebase-admin';

let auth: admin.auth.Auth;

/**
 * Güvenli Firebase Admin başlatma fonksiyonu.
 */
function initializeFirebaseAdmin() {
    if (admin.apps.length) {
        auth = admin.auth();
        return;
    }
    try {
        const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        auth = admin.auth();
    } catch (error) {
        console.error('Firebase Admin initialization error in promote-admin:', error);
    }
}

initializeFirebaseAdmin();

export async function POST(request: NextRequest) {
  if (!auth) {
      return NextResponse.json({ error: "Firebase Admin not initialized properly." }, { status: 500 });
  }

  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: "User UID is required" }, { status: 400 });
    }

    // 1. Sistemde zaten bir admin var mı diye kontrol et
    const listUsersResult = await auth.listUsers(1000); // İlk 1000 kullanıcıyı kontrol et
    const existingAdmins = listUsersResult.users.filter(user => user.customClaims?.role === 'admin');

    if (existingAdmins.length > 0) {
      return NextResponse.json({ error: "An admin user already exists. Cannot promote another user." }, { status: 403 });
    }

    // 2. Hiç admin yoksa, sağlanan UID'ye sahip kullanıcıyı admin yap
    await auth.setCustomUserClaims(uid, { role: 'admin' });

    // 3. Kullanıcıya Firestore'da bir profil belgesi oluştur (eğer yoksa)
    const db = admin.firestore();
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
