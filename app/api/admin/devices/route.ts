import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";
import { Timestamp } from "firebase-admin/firestore";

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
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// Main GET handler that routes based on the presence of userId
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      return await getUserSpecificDeviceData(userId, searchParams);
    }

    return await getAggregatedDeviceData();
  });
}

// Function to get aggregated data for the "Cihazlar & IP" tab
async function getAggregatedDeviceData() {
    try {
      const devicesSnapshot = await adminDb.collection('devices').get();
      const loginHistorySnapshot = await adminDb.collection('loginHistory').get();

      const ipData: { [key: string]: { users: Set<string>; devices: Set<string>; lastSeen: Date | null } } = {};

      const processDoc = (doc: FirebaseFirestore.DocumentData, isDevice: boolean) => {
          const data = doc.data();
          const ip = data.ipAddress || 'Unknown';
          if (!ipData[ip]) {
              ipData[ip] = { users: new Set(), devices: new Set(), lastSeen: null };
          }
          ipData[ip].users.add(data.userId);

          let docDate: Date | null = null;
          if (isDevice) {
              ipData[ip].devices.add(doc.id);
              if (data.lastSeen && data.lastSeen instanceof Timestamp) {
                  docDate = data.lastSeen.toDate();
              }
          } else {
              if (data.timestamp && data.timestamp instanceof Timestamp) {
                  docDate = data.timestamp.toDate();
              }
          }

          if (docDate && (!ipData[ip].lastSeen || docDate > ipData[ip].lastSeen!)) {
              ipData[ip].lastSeen = docDate;
          }
      };

      devicesSnapshot.forEach(doc => processDoc(doc, true));
      loginHistorySnapshot.forEach(doc => processDoc(doc, false));

      const result = Object.keys(ipData).map(ip => ({
        ip,
        userCount: ipData[ip].users.size,
        deviceCount: ipData[ip].devices.size,
        lastSeen: ipData[ip].lastSeen?.toISOString() || null
      }));

      return NextResponse.json(result);

    } catch (error) {
      console.error(`Error fetching aggregated device data:`, error);
      return NextResponse.json({ error: `Failed to fetch aggregated device data` }, { status: 500 });
    }
}

// Function to get specific device and history data for a user
async function getUserSpecificDeviceData(userId: string, searchParams: URLSearchParams) {
    const type = searchParams.get("type");
    try {
      if (type === 'devices') {
        const devicesSnapshot = await adminDb.collection('devices').where('userId', '==', userId).get();
        const devices = devicesSnapshot.docs.map(doc => {
            const data = doc.data();
            // Safely convert Timestamps to ISO strings
            const firstSeen = data.firstSeen instanceof Timestamp ? data.firstSeen.toDate().toISOString() : null;
            const lastSeen = data.lastSeen instanceof Timestamp ? data.lastSeen.toDate().toISOString() : null;
            return { id: doc.id, ...data, firstSeen, lastSeen };
        });
        return NextResponse.json(devices);

      } else if (type === 'history') {
        const historySnapshot = await adminDb.collection('loginHistory').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(50).get();
        const history = historySnapshot.docs.map(doc => {
            const data = doc.data();
            // Safely convert Timestamp to ISO string
            const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : null;
            return { id: doc.id, ...data, timestamp };
        });
        return NextResponse.json(history);
      }
      return NextResponse.json({ error: "Invalid type specified for user data" }, { status: 400 });
    } catch (error) {
      console.error(`Error fetching user data for ${userId}:`, error);
      return NextResponse.json({ error: `Failed to fetch user data` }, { status: 500 });
    }
}
