import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// Middleware to verify admin privileges
async function verifyAdmin(request: NextRequest) {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return null;
    const idToken = authorization.split("Bearer ")[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (decodedToken.role !== 'admin') return null;
        return decodedToken;
    } catch (error) {
        return null;
    }
}

// GET: List all users
export async function GET(request: NextRequest) {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // 1. Get all users from Firebase Auth
        const listUsersResult = await adminAuth.listUsers(1000);
        const authUsers = listUsersResult.users;

        // 2. Get all user profiles from Firestore
        const usersSnapshot = await adminDb.collection('users').get();
        const firestoreUsers = new Map();
        usersSnapshot.forEach(doc => {
            firestoreUsers.set(doc.id, doc.data());
        });

        // 3. Get all device and login data for aggregation
        const devicesSnapshot = await adminDb.collection('devices').get();
        const loginHistorySnapshot = await adminDb.collection('loginHistory').get();

        const userStats = new Map<string, { deviceCount: number, uniqueIPs: Set<string>, lastLogin?: string }>();

        // Aggregate device counts
        devicesSnapshot.forEach(doc => {
            const device = doc.data();
            const uid = device.uid;
            if (!userStats.has(uid)) {
                userStats.set(uid, { deviceCount: 0, uniqueIPs: new Set() });
            }
            userStats.get(uid)!.deviceCount++;
        });

        // Aggregate unique IPs and find last login
        loginHistorySnapshot.forEach(doc => {
            const login = doc.data();
            const uid = login.uid;
            if (!userStats.has(uid)) {
                userStats.set(uid, { deviceCount: 0, uniqueIPs: new Set() });
            }
            const stats = userStats.get(uid)!;
            stats.uniqueIPs.add(login.ipAddress);

            const loginTimestamp = login.timestamp;
            if (login.success && (!stats.lastLogin || loginTimestamp > stats.lastLogin)) {
                stats.lastLogin = loginTimestamp;
            }
        });


        // 4. Combine all data sources
        const combinedUsers = authUsers.map(user => {
            const firestoreData = firestoreUsers.get(user.uid) || {};
            const stats = userStats.get(user.uid);

            return {
                uid: user.uid,
                email: user.email,
                role: user.customClaims?.role || 'demo',
                createdAt: user.metadata.creationTime,
                lastLogin: stats?.lastLogin || user.metadata.lastSignInTime,
                vipExpiryDate: firestoreData.vipExpiryDate || null,
                deviceCount: stats?.deviceCount || 0,
                uniqueIPs: stats?.uniqueIPs.size || 0,
            };
        });

        return NextResponse.json(combinedUsers);
    } catch (error) {
        console.error("Error listing users:", error);
        return NextResponse.json({ error: "Failed to list users", message: (error as Error).message }, { status: 500 });
    }
}

// POST: Create a new user
export async function POST(request: NextRequest) {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const { email, password, role, name, company, address, queryLimit } = body;

        // Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({ email, password });
        await adminAuth.setCustomUserClaims(userRecord.uid, { role });

        // Create user document in Firestore
        await adminDb.collection("users").doc(userRecord.uid).set({
            name,
            company,
            address,
            queryLimit: parseInt(queryLimit, 10) || 100,
            permissions: body.permissions || {}, // Default permissions
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ uid: userRecord.uid, message: "User created successfully." });
    } catch (error: any) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
    }
}

// PATCH: Update user role
export async function PATCH(request: NextRequest) {
     const adminUser = await verifyAdmin(request);
    if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { uid, role } = await request.json();
        await adminAuth.setCustomUserClaims(uid, { role });
        return NextResponse.json({ message: "User role updated." });
    } catch (error) {
        console.error("Error updating user role:", error);
        return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
    }
}


// DELETE: Delete a user
export async function DELETE(request: NextRequest) {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    try {
        await adminAuth.deleteUser(uid);
        await adminDb.collection("users").doc(uid).delete();
        return NextResponse.json({ message: "User deleted successfully." });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
