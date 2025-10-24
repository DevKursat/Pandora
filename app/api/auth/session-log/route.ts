import { type NextRequest, NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebase-admin";
import * as admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const db = getFirestore();
    const { userId, ipAddress, userAgent, success, location } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const loginRecord = {
      userId, ipAddress, userAgent, timestamp, success,
      location: location || 'Unknown'
    };
    await db.collection('loginHistory').add(loginRecord);

    if (success) {
        const deviceRef = db.collection('devices').doc(`${userId}_${userAgent}`);
        const deviceDoc = await deviceRef.get();

        if (!deviceDoc.exists) {
            await deviceRef.set({
                userId, userAgent, ipAddress,
                firstSeen: timestamp, lastSeen: timestamp,
                deviceType: userAgent.toLowerCase().includes('mobile') ? 'mobile' : 'desktop',
            });
        } else {
            await deviceRef.update({
                lastSeen: timestamp,
                ipAddress,
            });
        }
    }

    return NextResponse.json({ success: true, message: "Session logged." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to log session" }, { status: 500 });
  }
}
