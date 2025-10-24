import { type NextRequest, NextResponse } from "next/server";
import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;

/**
 * Güvenli Firebase Admin başlatma fonksiyonu.
 */
function initializeFirebaseAdmin() {
    if (admin.apps.length) {
        db = admin.firestore();
        return;
    }
    try {
        const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
    } catch (error) {
        console.error('Firebase Admin initialization error in session-log:', error);
    }
}

initializeFirebaseAdmin();

export async function POST(request: NextRequest) {
  if (!db) {
      return NextResponse.json({ error: "Firebase Admin not initialized properly." }, { status: 500 });
  }

  try {
    const { userId, ipAddress, userAgent, success, location } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // 1. Giriş geçmişini (loginHistory) kaydet
    const loginRecord = {
      userId,
      ipAddress,
      userAgent,
      timestamp,
      success,
      location: location || 'Unknown'
    };
    await db.collection('loginHistory').add(loginRecord);

    // Sadece başarılı girişlerde cihaz bilgisini güncelle
    if (success) {
        // 2. Cihaz bilgisini (devices) kaydet veya güncelle
        const deviceRef = db.collection('devices').doc(`${userId}_${userAgent}`); // Basit bir unique ID
        const deviceDoc = await deviceRef.get();

        if (!deviceDoc.exists) {
            // Yeni cihaz
            await deviceRef.set({
                userId,
                userAgent,
                ipAddress,
                firstSeen: timestamp,
                lastSeen: timestamp,
                // Basit cihaz tipi tespiti
                deviceType: userAgent.toLowerCase().includes('mobile') ? 'mobile' : 'desktop',
            });
        } else {
            // Mevcut cihaz, son görülme tarihini güncelle
            await deviceRef.update({
                lastSeen: timestamp,
                ipAddress, // Son kullanılan IP'yi de güncelle
            });
        }
    }

    return NextResponse.json({ success: true, message: "Session logged." });
  } catch (error) {
    // @ts-ignore
    return NextResponse.json({ error: error.message || "Failed to log session" }, { status: 500 });
  }
}
