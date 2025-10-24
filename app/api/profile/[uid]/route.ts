import { NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebase-admin";

export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  const uid = params.uid;
  try {
    const db = getFirestore();
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const data = doc.data();
    if (data?.createdAt) {
      data.createdAt = data.createdAt.toDate().toISOString();
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
