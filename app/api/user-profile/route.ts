import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const queryLogsSnapshot = await adminDb.collection("queryLogs").where("uid", "==", uid).orderBy("timestamp", "desc").limit(1).get();
    const lastQuery = queryLogsSnapshot.empty ? null : queryLogsSnapshot.docs[0].data().timestamp;

    const successfulQueriesSnapshot = await adminDb.collection("queryLogs").where("uid", "==", uid).where("step", "==", "success").get();

    const userData = userDoc.data();
    const accountAge = Math.floor((new Date().getTime() - new Date(userData?.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    let vipDaysRemaining = null;
    if (userData?.vipExpiry) {
        vipDaysRemaining = Math.floor((new Date(userData.vipExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    }


    return NextResponse.json({
        totalQueries: userData?.queryCount || 0,
        successfulQueries: successfulQueriesSnapshot.size,
        failedQueries: (userData?.queryCount || 0) - successfulQueriesSnapshot.size,
        lastQuery,
        accountAge,
        vipDaysRemaining
    });

  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
