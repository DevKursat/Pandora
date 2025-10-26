import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

// Middleware to verify the token and check for admin role
async function withAdminAuth(
  request: NextRequest,
  handler: (decodedToken: DecodedIdToken) => Promise<NextResponse>
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
    return await handler(decodedToken);
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// GET active users (seen in the last 5 minutes)
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const activeUsersSnapshot = await adminDb.collection('activeUsers')
        .where('lastSeen', '>=', fiveMinutesAgo)
        .get();

      const activeUsers = activeUsersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      return NextResponse.json(activeUsers);
    } catch (error) {
      console.error("Error fetching active users:", error);
      return NextResponse.json({ error: "Failed to fetch active users" }, { status: 500 });
    }
  });
}
