import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

const settingsRef = adminDb.collection('settings').doc('maintenance');

// Middleware to verify the token and check for admin role
async function withAdminAuth(
  request: NextRequest,
  handler: (decodedToken: DecodedIdToken, request: NextRequest) => Promise<NextResponse>
) {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const idToken = authorization.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (decodedToken.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return await handler(decodedToken, request);
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// GET the current maintenance status
export async function GET(request: NextRequest) {
    // This route is called by middleware and does not require admin auth
    try {
        const doc = await settingsRef.get();
        const data = doc.data();
        return NextResponse.json({ isEnabled: data?.enabled || false });
    } catch (error) {
        console.error("Error fetching maintenance status:", error);
        return NextResponse.json({ error: "Failed to fetch maintenance status" }, { status: 500 });
    }
}

// POST to toggle maintenance mode
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async (_, req) => {
    try {
      const { enabled } = await req.json();
      await settingsRef.set({ enabled });
      return NextResponse.json({ success: true, mode: enabled ? 'on' : 'off' });
    } catch (error) {
      console.error("Error toggling maintenance mode:", error);
      return NextResponse.json({ error: "Failed to toggle maintenance mode" }, { status: 500 });
    }
  });
}
