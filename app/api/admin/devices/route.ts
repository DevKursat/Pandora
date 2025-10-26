import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// Middleware to verify admin privileges
async function verifyAdmin(request: NextRequest) {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return null;
    const idToken = authorization.split("Bearer ")[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (decodedToken.role !== 'admin') return null;
        return decodedToken;
    } catch (error) {
        return null;
    }
}

// GET: Fetch user devices or login history
export async function GET(request: NextRequest) {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'devices' or 'history'

    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        let collectionRef;
        if (type === 'devices') {
            collectionRef = adminDb.collection('users').doc(userId).collection('devices');
        } else if (type === 'history') {
            collectionRef = adminDb.collection('users').doc(userId).collection('loginHistory');
        } else {
            return NextResponse.json({ error: "Invalid type specified" }, { status: 400 });
        }

        const snapshot = await collectionRef.orderBy('lastSeen', 'desc').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error fetching user ${type}:`, error);
        return NextResponse.json({ error: `Failed to fetch user ${type}` }, { status: 500 });
    }
}
