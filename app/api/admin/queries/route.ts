import { type NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const settingsRef = adminDb.collection("settings").doc("disabledQueries");

export async function POST(request: NextRequest) {
  try {
    const { queryType, enabled } = await request.json();

    const doc = await settingsRef.get();
    const disabledQueries = doc.exists ? doc.data()?.queries || [] : [];

    if (enabled) {
      const newDisabledQueries = disabledQueries.filter((q: string) => q !== queryType);
      await settingsRef.set({ queries: newDisabledQueries });
    } else {
      if (!disabledQueries.includes(queryType)) {
        disabledQueries.push(queryType);
        await settingsRef.set({ queries: disabledQueries });
      }
    }

    return NextResponse.json({ success: true, queryType, enabled });
  } catch (error) {
    console.error("Failed to toggle query:", error);
    return NextResponse.json({ error: "Failed to toggle query" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const doc = await settingsRef.get();
    const disabledQueries = doc.exists ? doc.data()?.queries || [] : [];
    return NextResponse.json({ disabledQueries });
  } catch (error) {
    console.error("Failed to get disabled queries:", error);
    return NextResponse.json({ error: "Failed to get disabled queries" }, { status: 500 });
  }
}
