import { type NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const { uid } = await request.json();

  if (!uid) {
    return NextResponse.json({ error: "UID is required" }, { status: 400 });
  }

  try {
    const user = await adminAuth.getUser(uid);

    // Sadece belirli bir kullanıcıya admin rolü ata
    if (user.email === "demo@demo.demo") {
      // Mevcut custom claim'leri al, üzerine yazma
      const existingClaims = user.customClaims || {};

      // Eğer zaten admin değilse, ata
      if (existingClaims.role !== 'admin') {
        await adminAuth.setCustomUserClaims(uid, { ...existingClaims, role: "admin" });
        return NextResponse.json({ message: "Admin claim set successfully" });
      } else {
        return NextResponse.json({ message: "User is already an admin" });
      }
    } else {
      // Diğer kullanıcılar için işlem yapma, yetkisiz erişim olarak değerlendir
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  } catch (error: any) {
    console.error("Error setting custom claim:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
