import { type NextRequest, NextResponse } from "next/server"
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
        console.error('Firebase Admin initialization error in notifications:', error);
    }
}

initializeFirebaseAdmin();

export async function POST(request: NextRequest) {
  // Başlatma başarısız olduysa, db tanımsız kalır.
  if (!db) {
      return NextResponse.json({ error: "Firebase Admin not initialized properly." }, { status: 500 });
  }

  try {
    const { message, recipients } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const notification = {
      message,
      recipients,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      readBy: []
    };

    await db.collection('notifications').add(notification);

    return NextResponse.json({ success: true, message: "Notification sent." });
  } catch (error) {
    // @ts-ignore
    return NextResponse.json({ error: error.message || "Failed to send notification" }, { status: 500 });
  }
}
