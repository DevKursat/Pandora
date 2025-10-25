import { type NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  try {
    const snapshot = await adminDb.collection("queryLogs")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const logs = snapshot.docs.map(doc => doc.data());

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
