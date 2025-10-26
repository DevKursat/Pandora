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

// GET user devices or login history
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // 'devices' or 'history'

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
      if (type === 'devices') {
        const devicesSnapshot = await adminDb.collection('devices').where('userId', '==', userId).get();
        const devices = devicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(devices);
      } else if (type === 'history') {
        const historySnapshot = await adminDb.collection('loginHistory').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(50).get();
        const history = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(history);
      } else {
        return NextResponse.json({ error: "Invalid type specified" }, { status: 400 });
      }
    } catch (error) {
      console.error(`Error fetching user ${type}:`, error);
      return NextResponse.json({ error: `Failed to fetch user ${type}` }, { status: 500 });
    }
  });
}
