import { type NextRequest, NextResponse } from "next/server";
import { getFirestore, getFirebaseAuth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
    try {
        const auth = getFirebaseAuth();
        const db = getFirestore();

        const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!idToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const decodedToken = await auth.verifyIdToken(idToken);
        if (decodedToken.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { enabled } = await request.json();
        await db.collection('settings').doc('maintenance').set({ enabled });

        return NextResponse.json({ success: true, maintenanceMode: enabled });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update maintenance mode" }, { status: 500 });
    }
}
