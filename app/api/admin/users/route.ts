import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// GET all users
export async function GET() {
  try {
    const listUsersResult = await adminAuth.listUsers();
    const users = await Promise.all(
      listUsersResult.users.map(async (userRecord) => {
        const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
        return {
          uid: userRecord.uid,
          email: userRecord.email,
          role: userRecord.customClaims?.role || "user",
          ...userDoc.data(),
        };
      })
    );
    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST to create a new user
export async function POST(request: NextRequest) {
  try {
    const { email, password, role, vipExpiry } = await request.json();

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
    });

    // Set custom claims for role-based access control
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    // Store additional user data in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      email,
      role,
      vipExpiry: vipExpiry || null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ uid: userRecord.uid, email, role });
  } catch (error) {
    console.error("Failed to add user:", error);
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}

// PATCH to update a user's role and vipExpiry
export async function PATCH(request: NextRequest) {
  try {
    const { uid, role, vipExpiry } = await request.json();
    if (!uid || !role) {
      return NextResponse.json({ error: "User ID and role are required" }, { status: 400 });
    }

    // Update custom claims in Firebase Auth
    await adminAuth.setCustomUserClaims(uid, { role });

    // Update user data in Firestore
    await adminDb.collection("users").doc(uid).update({
      role,
      vipExpiry: vipExpiry || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE a user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");
    if (!uid) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Delete user from Firebase Auth
    await adminAuth.deleteUser(uid);

    // Delete user data from Firestore
    await adminDb.collection("users").doc(uid).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
