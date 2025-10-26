import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

// This endpoint is public and used by the middleware to check maintenance status.
export async function GET() {
  try {
    const settingsDoc = await adminDb.collection('settings').doc('maintenance').get();
    const isEnabled = settingsDoc.exists ? settingsDoc.data()?.isEnabled || false : false;
    return NextResponse.json({ isEnabled });
  } catch (error) {
    console.error("Error fetching maintenance status in API:", error);
    // Fail-safe: If the database check fails, assume maintenance is off to prevent locking everyone out.
    return NextResponse.json({ isEnabled: false });
  }
}
