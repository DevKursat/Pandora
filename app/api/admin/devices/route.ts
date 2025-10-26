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

// GET handler
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");

    // Existing logic for fetching data for a specific user
    if (userId) {
      if (!type || (type !== 'devices' && type !== 'history')) {
          return NextResponse.json({ error: "Invalid or missing type specified for user-specific request" }, { status: 400 });
      }
      try {
        if (type === 'devices') {
          const devicesSnapshot = await adminDb.collection('devices').where('userId', '==', userId).get();
          const devices = devicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          return NextResponse.json(devices);
        }
        if (type === 'history') {
          const historySnapshot = await adminDb.collection('loginHistory').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(50).get();
          const history = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          return NextResponse.json(history);
        }
      } catch (error) {
        console.error(`Error fetching user ${type} for userId ${userId}:`, error);
        return NextResponse.json({ error: `Failed to fetch user ${type}` }, { status: 500 });
      }
    }

    // New logic for aggregating all device/IP data when no userId is specified
    try {
      const listUsersResult = await adminAuth.listUsers(1000);
      const userEmailMap = listUsersResult.users.reduce((acc, user) => {
        acc[user.uid] = user.email || 'N/A';
        return acc;
      }, {} as Record<string, string>);

      const [devicesSnapshot, loginHistorySnapshot] = await Promise.all([
          adminDb.collection('devices').get(),
          adminDb.collection('loginHistory').get()
      ]);

      const ipData: Record<string, { users: Record<string, { email: string; devices: Set<string> }>, totalLogins: number, lastSeenTimestamp: number }> = {};

      devicesSnapshot.forEach(doc => {
          const device = doc.data();
          if (!device.ipAddress || !device.userId) return;

          if (!ipData[device.ipAddress]) {
              ipData[device.ipAddress] = { users: {}, totalLogins: 1, lastSeenTimestamp: 0 }; // Initialize with 1 login
          }
          if (!ipData[device.ipAddress].users[device.userId]) {
              ipData[device.ipAddress].users[device.userId] = { email: userEmailMap[device.userId] || 'Unknown', devices: new Set() };
          }
          ipData[device.ipAddress].users[device.userId].devices.add(device.deviceName);

          if (device.lastSeen && typeof device.lastSeen.toDate === 'function') {
            const lastSeenMillis = device.lastSeen.toDate().getTime();
            if (lastSeenMillis > ipData[device.ipAddress].lastSeenTimestamp) {
                ipData[device.ipAddress].lastSeenTimestamp = lastSeenMillis;
            }
          }
      });

      loginHistorySnapshot.forEach(doc => {
          const login = doc.data();
          if (!login.ipAddress || !login.userId) return;

          if (!ipData[login.ipAddress]) {
              // This case is unlikely if a device is always created on first login, but as a fallback:
              ipData[login.ipAddress] = { users: {}, totalLogins: 0, lastSeenTimestamp: 0 };
          }
           if (!ipData[login.ipAddress].users[login.userId]) {
              ipData[login.ipAddress].users[login.userId] = { email: userEmailMap[login.userId] || 'Unknown', devices: new Set() };
          }

          ipData[login.ipAddress].totalLogins += 1;
          if (login.timestamp && typeof login.timestamp.toDate === 'function') {
            const loginTimestampMillis = login.timestamp.toDate().getTime();
            if (loginTimestampMillis > ipData[login.ipAddress].lastSeenTimestamp) {
                ipData[login.ipAddress].lastSeenTimestamp = loginTimestampMillis;
            }
          }
      });

      const formattedResponse = Object.entries(ipData).map(([ipAddress, data]) => ({
          ipAddress,
          totalLogins: data.totalLogins,
          lastSeen: new Date(data.lastSeenTimestamp).toISOString(),
          userCount: Object.keys(data.users).length,
          users: Object.entries(data.users).map(([uid, userData]) => ({
              uid,
              email: userData.email,
              deviceCount: userData.devices.size,
          })),
      })).sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

      return NextResponse.json(formattedResponse);

    } catch (error) {
      console.error('Error aggregating device and IP data:', error);
      // It's helpful to send back the actual error message in development
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return NextResponse.json({ error: 'Failed to aggregate device and IP data', details: errorMessage }, { status: 500 });
    }
  });
}
