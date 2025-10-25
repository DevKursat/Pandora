import { type NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { message, recipients } = await request.json();

    if (!message || !recipients) {
      return NextResponse.json({ error: "Message and recipients are required" }, { status: 400 });
    }

    // In a real application, you might want to send notifications to specific users.
    // For now, we'll store the notification in a "notifications" collection.
    const notification = {
      message,
      recipients,
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection("notifications").add(notification);

    return NextResponse.json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    console.error("Failed to send notification:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
