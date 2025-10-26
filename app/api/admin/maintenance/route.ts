import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { type NextRequest } from 'next/server';

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

// GET (Public): Mevcut bakım durumunu al
export async function GET() {
  try {
    const maintenanceRef = adminDb.collection('settings').doc('maintenance');
    const doc = await maintenanceRef.get();
    if (doc.exists) {
      return NextResponse.json({ isEnabled: doc.data()?.enabled || false });
    }
    return NextResponse.json({ isEnabled: false });
  } catch (error) {
    console.error('Bakım durumu alınamadı:', error);
    return NextResponse.json({ isEnabled: false, error: 'Durum alınamadı' }, { status: 500 });
  }
}

// POST (Admin-only): Bakım modunu aç/kapat
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const { enabled } = await request.json();
      const maintenanceRef = adminDb.collection('settings').doc('maintenance');
      await maintenanceRef.set({ enabled: !!enabled }, { merge: true });
      return NextResponse.json({ success: true, isEnabled: !!enabled });
    } catch (error) {
      console.error('Bakım modu güncellenemedi:', error);
      return NextResponse.json({ success: false, error: 'Ayar güncellenemedi' }, { status: 500 });
    }
  });
}
