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

// GET user's latest activity
export async function GET(request: NextRequest) {
  return withAuth(request, async (decodedToken) => {
    const uid = decodedToken.uid;
    try {
      // Remove orderBy from the query to avoid needing a composite index immediately.
      const queryLogsSnapshot = await adminDb.collection("queryLogs").where("uid", "==", uid).limit(50).get();

      // Sort the results in code.
      const activity = queryLogsSnapshot.docs.map(doc => doc.data()).sort((a, b) => {
        const timestampA = a.timestamp._seconds || a.timestamp.seconds;
        const timestampB = b.timestamp._seconds || b.timestamp.seconds;
        return timestampB - timestampA;
      });

      return NextResponse.json(activity);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      return NextResponse.json({ error: "Failed to fetch user activity" }, { status: 500 });
    }
  });
}
