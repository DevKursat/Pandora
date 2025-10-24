import { NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebase-admin";
import * as admin from 'firebase-admin';

export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  const uid = params.uid;
  try {
    const db = getFirestore();
    const querySnapshot = await db.collection('queryLogs').where('userId', '==', uid).get();
    const totalQueries = querySnapshot.size;
    const successfulQueries = querySnapshot.docs.filter(doc => doc.data().status === 'success').length;

    const lastQueryDoc = querySnapshot.docs.sort((a, b) => b.data().timestamp.toMillis() - a.data().timestamp.toMillis())[0];
    const lastQuery = lastQueryDoc ? lastQueryDoc.data().timestamp.toDate().toISOString() : null;

    const userDoc = await db.collection('users').doc(uid).get();
    let accountAge = 0;
    if (userDoc.exists && userDoc.data()?.createdAt) {
      const createdAt = (userDoc.data()?.createdAt as admin.firestore.Timestamp).toDate();
      accountAge = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    }

    const stats = {
      totalQueries,
      successfulQueries,
      failedQueries: totalQueries - successfulQueries,
      lastQuery,
      accountAge,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 });
  }
}
