import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const idToken = authorization.split("Bearer ")[1];

  try {
    // Sadece adminlerin bildirim gönderebilmesini sağla
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (decodedToken.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: You are not an admin." }, { status: 403 });
    }

    const { message, recipients } = await request.json();

    if (!message || !recipients) {
      return NextResponse.json({ error: "Message and recipients are required." }, { status: 400 });
    }

    // Bildirimi Firestore'a kaydet
    const notification = {
      message,
      recipients, // 'all', 'vip', 'demo'
      createdAt: new Date(),
    };

    await adminDb.collection("notifications").add(notification);

    return NextResponse.json({ success: true, message: "Notification saved and sent successfully." });

  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
