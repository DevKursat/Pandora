import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

// Middleware to verify the token and check for admin role
async function withAdminAuth(
  request: NextRequest,
  handler: (decodedToken: DecodedIdToken, request: NextRequest) => Promise<NextResponse>
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
    return await handler(decodedToken, request);
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// GET all users with device and IP counts
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const listUsersResult = await adminAuth.listUsers(1000);
      const users = listUsersResult.users.map((userRecord) => {
        const customClaims = (userRecord.customClaims || {}) as { role?: string; vipExpiry?: string };
        return {
          uid: userRecord.uid,
          email: userRecord.email,
          role: customClaims.role || "demo",
          createdAt: userRecord.metadata.creationTime,
          lastLogin: userRecord.metadata.lastSignInTime,
          vipExpiryDate: customClaims.vipExpiry,
        };
      });

      // Fetch device and IP data from Firestore
      const devicesSnapshot = await adminDb.collection('devices').get();
      const userDeviceData: { [key: string]: { deviceCount: number, uniqueIPs: Set<string> } } = {};

      devicesSnapshot.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        if (!userDeviceData[userId]) {
          userDeviceData[userId] = { deviceCount: 0, uniqueIPs: new Set() };
        }
        userDeviceData[userId].deviceCount += 1;
        userDeviceData[userId].uniqueIPs.add(data.ipAddress);
      });

      const usersWithDeviceCounts = users.map(user => ({
        ...user,
        deviceCount: userDeviceData[user.uid]?.deviceCount || 0,
        uniqueIPs: userDeviceData[user.uid] ? userDeviceData[user.uid].uniqueIPs.size : 0,
      }));

      return NextResponse.json(usersWithDeviceCounts);
    } catch (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
  });
}

// POST to add a new user
export async function POST(request: NextRequest) {
    return withAdminAuth(request, async (_, req) => {
        try {
            const { email, password, role, vipExpiry, name, address, company, queryLimit, permissions } = await req.json();
            if (!email || !password) {
                return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
            }

            const userRecord = await adminAuth.createUser({ email, password, displayName: name });
            await adminAuth.setCustomUserClaims(userRecord.uid, { role, vipExpiry });

            // Store additional user details in Firestore
            await adminDb.collection('users').doc(userRecord.uid).set({
                name,
                address,
                company,
                queryLimit: parseInt(queryLimit, 10),
                permissions,
                createdAt: new Date().toISOString(),
            });

            return NextResponse.json({ uid: userRecord.uid, email, role });
        } catch (error: any) {
            console.error("Error adding user:", error);
            if (error.code === 'auth/email-already-exists') {
                return NextResponse.json({ error: "This email address is already in use." }, { status: 409 });
            }
            return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
        }
    });
}

// PATCH to update user role and VIP status
export async function PATCH(request: NextRequest) {
  return withAdminAuth(request, async (_, req) => {
    try {
      const { uid, role, vipExpiry } = await req.json();
      if (!uid || !role) {
        return NextResponse.json({ error: "User ID and role are required" }, { status: 400 });
      }
      await adminAuth.setCustomUserClaims(uid, { role, vipExpiry });
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
  });
}

// DELETE a user
export async function DELETE(request: NextRequest) {
  return withAdminAuth(request, async (_, req) => {
    try {
      const { searchParams } = new URL(req.url);
      const uid = searchParams.get("uid");
      if (!uid) {
        return NextResponse.json({ error: "User ID required" }, { status: 400 });
      }
      await adminAuth.deleteUser(uid);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
  });
}
