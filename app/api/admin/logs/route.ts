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

// GET: Fetch recent query logs
export async function GET(request: NextRequest) {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const logsSnapshot = await adminDb.collection("queryLogs")
            .orderBy("timestamp", "desc")
            .limit(100) // Get the last 100 logs
            .get();

        const logs = logsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Error fetching query logs:", error);
        return NextResponse.json({ error: "Failed to fetch query logs" }, { status: 500 });
    }
}
