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

// GET: Fetch active users (seen in the last 5 minutes)
export async function GET(request: NextRequest) {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        const activeUsersSnapshot = await adminDb.collection("activeUsers")
            .where("lastSeen", ">=", fiveMinutesAgo)
            .get();

        const activeUsers = activeUsersSnapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(activeUsers);
    } catch (error) {
        console.error("Error fetching active users:", error);
        return NextResponse.json({ error: "Failed to fetch active users" }, { status: 500 });
    }
}
