import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

async function verifyAdmin(request: NextRequest) {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return null;
    const idToken = authorization.split("Bearer ")[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (decodedToken.role !== 'admin') return null;
        return decodedToken;
    } catch (error) {
        console.error("Admin verification failed:", error);
        return null;
    }
}

// GET: Fetch all devices and login history, grouped by IP address
export async function GET(request: NextRequest) {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch all documents from both collections in parallel
        const [devicesSnapshot, historySnapshot, usersSnapshot] = await Promise.all([
            adminDb.collection('devices').get(),
            adminDb.collection('loginHistory').get(),
            adminAuth.listUsers(1000) // Get user emails for better context
        ]);

        const emailMap = new Map<string, string>();
        usersSnapshot.users.forEach(user => {
            emailMap.set(user.uid, user.email || 'N/A');
        });

        // Use a Map to group data by IP address
        const ipGroups = new Map<string, { users: Set<string>, devices: Set<string>, count: number }>();

        // Process devices collection
        devicesSnapshot.forEach(doc => {
            const device = doc.data();
            const ip = device.ipAddress || 'unknown';
            const userEmail = emailMap.get(device.uid) || 'unknown user';

            if (!ipGroups.has(ip)) {
                ipGroups.set(ip, { users: new Set(), devices: new Set(), count: 0 });
            }
            const group = ipGroups.get(ip)!;
            group.users.add(userEmail);
            group.devices.add(`${device.deviceName} (${device.os})`);
            group.count++;
        });

        // Process login history collection
        historySnapshot.forEach(doc => {
            const login = doc.data();
            const ip = login.ipAddress || 'unknown';
             const userEmail = emailMap.get(login.uid) || 'unknown user';

            if (!ipGroups.has(ip)) {
                 ipGroups.set(ip, { users: new Set(), devices: new Set(), count: 0 });
            }
             const group = ipGroups.get(ip)!;
            group.users.add(userEmail);
            group.count++;
        });

        // Convert the Map to an array of objects for the JSON response
        const result = Array.from(ipGroups.entries()).map(([ip, data]) => ({
            ip,
            userCount: data.users.size,
            deviceCount: data.devices.size,
            totalConnections: data.count,
            users: Array.from(data.users),
            devices: Array.from(data.devices),
        }));

        // Sort by the total number of connections in descending order
        result.sort((a, b) => b.totalConnections - a.totalConnections);

        return NextResponse.json(result);

    } catch (error) {
        console.error("Error fetching device and IP data:", error);
        return NextResponse.json({ error: "Failed to fetch device and IP data" }, { status: 500 });
    }
}
