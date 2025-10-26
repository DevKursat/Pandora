import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// Middleware to verify admin privileges for POST
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

const maintenanceDocRef = adminDb.collection('settings').doc('maintenance');

// GET: Check maintenance status (publicly accessible)
export async function GET() {
  try {
    const doc = await maintenanceDocRef.get();
    if (doc.exists) {
      return NextResponse.json({ isEnabled: doc.data()?.enabled || false });
    }
    return NextResponse.json({ isEnabled: false });
  } catch (error) {
    console.error('Error fetching maintenance status:', error);
    return NextResponse.json({ isEnabled: false, error: 'Failed to fetch status' }, { status: 500 });
  }
}

// POST: Toggle maintenance mode (admin only)
export async function POST(request: NextRequest) {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { enabled } = await request.json();
        await maintenanceDocRef.set({ enabled }, { merge: true });
        return NextResponse.json({ message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}.` });
    } catch (error) {
        console.error("Error toggling maintenance mode:", error);
        return NextResponse.json({ error: "Failed to toggle maintenance mode" }, { status: 500 });
    }
}
