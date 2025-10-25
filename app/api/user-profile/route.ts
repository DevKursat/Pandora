import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

// Middleware to verify the token
async function withAuth(
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
    return await handler(decodedToken);
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// GET user profile statistics
export async function GET(request: NextRequest) {
  return withAuth(request, async (decodedToken) => {
    const uid = decodedToken.uid;
    try {
      // Get user data
      const userRecord = await adminAuth.getUser(uid);
      const creationTime = new Date(userRecord.metadata.creationTime);
      const now = new Date();
      const accountAge = Math.floor((now.getTime() - creationTime.getTime()) / (1000 * 60 * 60 * 24));

      // Get query logs
      const queryLogsSnapshot = await adminDb.collection("queryLogs").where("uid", "==", uid).get();
      const totalQueries = queryLogsSnapshot.size;
      const successfulQueries = queryLogsSnapshot.docs.filter(doc => doc.data().step === 'success').length;

      // Get VIP expiry
      const customClaims = (userRecord.customClaims || {}) as { vipExpiry?: string };
      let vipDaysRemaining = null;
      if (customClaims.vipExpiry) {
        const expiryDate = new Date(customClaims.vipExpiry);
        const remainingTime = expiryDate.getTime() - now.getTime();
        vipDaysRemaining = Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24)));
      }

      const stats = {
        totalQueries,
        successfulQueries,
        failedQueries: totalQueries - successfulQueries,
        accountAge,
        vipDaysRemaining,
      };

      return NextResponse.json(stats);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
    }
  });
}
