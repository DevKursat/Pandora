import { NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebase-admin";

export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  const uid = params.uid;
  try {
    const db = getFirestore();

    // 1. Kullanıcının Cihazlarını Al
    const devicesSnapshot = await db.collection('devices').where('userId', '==', uid).get();
    const userDevices = devicesSnapshot.docs.map(doc => doc.data());

    // 2. Kullanıcının Giriş Geçmişini Al (Son 50)
    const historySnapshot = await db.collection('loginHistory').where('userId', '==', uid).orderBy('timestamp', 'desc').limit(50).get();
    const userLoginHistory = historySnapshot.docs.map(doc => doc.data());

    return NextResponse.json({
      userDevices,
      userLoginHistory,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch user details" }, { status: 500 });
  }
}
