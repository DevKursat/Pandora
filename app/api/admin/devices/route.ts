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

// GET aggregated device and IP information
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const devicesSnapshot = await adminDb.collection('devices').get();
      const loginHistorySnapshot = await adminDb.collection('loginHistory').get();

      const ipData: { [key: string]: { users: Set<string>; devices: Set<string>; lastSeen: Date | null } } = {};

      // Process devices
      devicesSnapshot.forEach(doc => {
        const device = doc.data();
        const ip = device.ipAddress || 'Unknown';
        if (!ipData[ip]) {
          ipData[ip] = { users: new Set(), devices: new Set(), lastSeen: null };
        }
        ipData[ip].users.add(device.userId);
        ipData[ip].devices.add(doc.id);
        const lastSeen = device.lastSeen?.toDate();
        if (!ipData[ip].lastSeen || (lastSeen && lastSeen > ipData[ip].lastSeen!)) {
          ipData[ip].lastSeen = lastSeen;
        }
      });

      // Process login history
      loginHistorySnapshot.forEach(doc => {
        const history = doc.data();
        const ip = history.ipAddress || 'Unknown';
        if (!ipData[ip]) {
          ipData[ip] = { users: new Set(), devices: new Set(), lastSeen: null };
        }
        ipData[ip].users.add(history.userId);
        const timestamp = history.timestamp?.toDate();
        if (!ipData[ip].lastSeen || (timestamp && timestamp > ipData[ip].lastSeen!)) {
          ipData[ip].lastSeen = timestamp;
        }
      });

      const result = Object.keys(ipData).map(ip => ({
        ip,
        userCount: ipData[ip].users.size,
        deviceCount: ipData[ip].devices.size,
        lastSeen: ipData[ip].lastSeen
      }));

      return NextResponse.json(result);

    } catch (error) {
      console.error(`Error fetching aggregated device data:`, error);
      return NextResponse.json({ error: `Failed to fetch aggregated device data` }, { status: 500 });
    }
  });
}
