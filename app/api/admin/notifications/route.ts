import { type NextRequest, NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebase-admin";
import * as admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const db = getFirestore();
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send notification" }, { status: 500 });
  }
}
