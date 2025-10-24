import { NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebase-admin";

export const revalidate = 0;

export async function GET() {
    try {
        const db = getFirestore();
        const doc = await db.collection('settings').doc('maintenance').get();
        const data = doc.data();
        return NextResponse.json({ enabled: data?.enabled || false });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch maintenance status" }, { status: 500 });
    }
}
