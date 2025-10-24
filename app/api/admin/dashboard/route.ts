import { NextResponse } from "next/server";
import { getFirestore, getFirebaseAuth } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const auth = getFirebaseAuth();
    const db = getFirestore();

    // 1. Tüm Kullanıcıları Al (Authentication ve Firestore'dan birleştirerek)
    const userRecords = await auth.listUsers(1000);
    const users = await Promise.all(userRecords.users.map(async (user) => {
        const userDoc = await db.collection('users').doc(user.uid).get();
        return {
            uid: user.uid,
            email: user.email,
            ...userDoc.data(),
            role: user.customClaims?.role || 'user',
            vipExpiry: user.customClaims?.vipExpiry || null,
        };
    }));

    // 2. Son 100 Sorgu Logunu Al
    const logsSnapshot = await db.collection('queryLogs').orderBy('timestamp', 'desc').limit(100).get();
    const queryLogs = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 3. Aktif Kullanıcıları Al (Son 24 saatte giriş yapanlar)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeSnapshot = await db.collection('loginHistory')
        .where('timestamp', '>=', twentyFourHoursAgo)
        .get();

    // Aktif kullanıcıların ID'lerini alıp, bu ID'lere karşılık gelen kullanıcıları buluyoruz.
    const activeUserIds = [...new Set(activeSnapshot.docs.map(doc => doc.data().userId))];
    const activeUsers = users.filter(user => activeUserIds.includes(user.uid));


    return NextResponse.json({
      users,
      queryLogs,
      activeUsers,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch dashboard data" }, { status: 500 });
  }
}
