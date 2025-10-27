import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const idToken = authorization.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userRole = decodedToken.role || 'demo';

    // Kullanıcının rolüne uygun bildirimleri ve 'all' olarak hedeflenmiş bildirimleri getir.
    // Firestore birden fazla 'in' veya 'array-contains-any' sorgusunu aynı alanda desteklemediği için,
    // iki ayrı sorgu yapıp sonuçları birleştirmek en güvenli yoldur.
    const allUsersQuery = adminDb.collection("notifications").where("recipients", "==", "all");
    const userRoleQuery = adminDb.collection("notifications").where("recipients", "==", userRole);

    const [allUsersSnapshot, userRoleSnapshot] = await Promise.all([
        allUsersQuery.get(),
        userRoleQuery.get()
    ]);

    const notificationsMap = new Map();

    allUsersSnapshot.forEach(doc => {
        notificationsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    userRoleSnapshot.forEach(doc => {
        notificationsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    const notifications = Array.from(notificationsMap.values());

    // Bildirimleri en yeniden en eskiye doğru sırala
    notifications.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    return NextResponse.json(notifications);

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
