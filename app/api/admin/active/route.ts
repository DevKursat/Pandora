import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const snapshot = await adminDb.collection("users")
      .where("lastLogin", ">=", twentyFourHoursAgo)
      .get();

    const activeUsers = snapshot.docs.map(doc => doc.data());

    return NextResponse.json(activeUsers);
  } catch (error) {
    console.error("Failed to fetch active users:", error);
    return NextResponse.json({ error: "Failed to fetch active users" }, { status: 500 });
  }
}
