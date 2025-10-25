import { type NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  try {
    if (userId) {
      // Fetch devices for a specific user
      const devicesSnapshot = await adminDb.collection("users").doc(userId).collection("devices").get();
      const devices = devicesSnapshot.docs.map(doc => doc.data());
      return NextResponse.json(devices);
    } else {
      // Fetch all users and their devices
      const usersSnapshot = await adminDb.collection("users").get();
      const usersWithDevices = await Promise.all(
        usersSnapshot.docs.map(async (userDoc) => {
          const devicesSnapshot = await userDoc.ref.collection("devices").get();
          return {
            uid: userDoc.id,
            email: userDoc.data().email,
            devices: devicesSnapshot.docs.map(doc => doc.data()),
          };
        })
      );
      return NextResponse.json(usersWithDevices);
    }
  } catch (error) {
    console.error("Failed to fetch devices:", error);
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 });
  }
}
